import { IJWTService, JWTPayload } from "./interface/auth-jwt-services.interface";
import { injectable, inject } from "inversify";
import { ITokenRepository } from "../repository/interface/auth-jwt-repository.interface";
import { IUserRepository } from "../../../user/repositories/interfaces/user-repository.interface";
import { v4 as uuidv4 } from "uuid";
import { SERVER } from "../../../../config/config";
import { TOKENS } from "../../../../common/tokens/service.tokens";
import jwt from "jsonwebtoken";
import { ErrorFactory } from "../../../../common/errors/error-factory";
import { User } from "../../../../models";

@injectable()
export class JWTService implements IJWTService {
    constructor(
        @inject(TOKENS.ITokenRepository) private tokenRepository: ITokenRepository,
        @inject(TOKENS.IUserRepository) private userRepository: IUserRepository
    ) {}

    async generateToken(user: User): Promise<{ access_token: string; refresh_token: string }> {
        const payload: Omit<JWTPayload, "iat" | "exp"> = {
            userId: user.id,
            email: user.email
        };

        const accessToken = jwt.sign(payload, SERVER.JWT_CONFIG.secret, {
            expiresIn: SERVER.JWT_CONFIG.accessTokenExpiry,
            issuer: SERVER.JWT_CONFIG.issuer,
            audience: SERVER.JWT_CONFIG.audience
        });

        const refreshTokenValue = uuidv4();
        const expiresAt = new Date(Date.now() + SERVER.JWT_CONFIG.refreshTokenExpiry);

        await this.tokenRepository.deleteExpiredTokens(user.id);

        await this.tokenRepository.create({
            userId: user.id,
            refreshToken: refreshTokenValue,
            expiresAt: expiresAt
        });

        return {
            access_token: accessToken,
            refresh_token: refreshTokenValue
        };
    }

    async verifyToken(token: string): Promise<User | null> {
        try {
            const decoded = jwt.verify(token, SERVER.JWT_CONFIG.secret, {
                issuer: SERVER.JWT_CONFIG.issuer,
                audience: SERVER.JWT_CONFIG.audience
            }) as JWTPayload;

            const user = await this.userRepository.findById(decoded.userId);
            return user;
        } catch (error) {
            switch (true) {
                case error instanceof jwt.TokenExpiredError:
                    throw ErrorFactory.tokenExpired();
                case error instanceof jwt.JsonWebTokenError:
                    throw ErrorFactory.invalidToken();
                case error instanceof jwt.NotBeforeError:
                    throw ErrorFactory.invalidToken();
                default:
                    throw ErrorFactory.invalidToken();
            }
        }
    }

    async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string } | null> {
        const tokenRecord = await this.tokenRepository.findByRefreshToken(refreshToken);

        if (!tokenRecord) {
            return null;
        }
        await this.tokenRepository.deleteByRefreshToken(refreshToken);

        return this.generateToken(tokenRecord.user);
    }

    async revokeToken(refreshToken: string): Promise<boolean> {
        return this.tokenRepository.deleteByRefreshToken(refreshToken);
    }

    async revokeAllUserTokens(userId: string): Promise<boolean> {
        return this.tokenRepository.deleteAllByUserId(userId);
    }
}

export type { IJWTService, JWTPayload };
