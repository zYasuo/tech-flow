import { IJWTService, JWTPayload } from "./interface/auth-jwt-services.interface";
import { injectable, inject } from "inversify";
import { ITokenRepository } from "../repository/interface/auth-jwt-repository.interface";
import { IUserRepository } from "../../../user/repositories/interfaces/user-repository.interface";
import { v4 as uuidv4 } from "uuid";
import { SERVER } from "../../../../config/config";
import { TOKENS } from "../../../../common/tokens/service.tokens";
import jwt from "jsonwebtoken";
import { ErrorFactory } from "../../../../common/errors/error-factory";
import { User } from "../../../../data/models";

@injectable()
export class JWTService implements IJWTService {
    constructor(
        @inject(TOKENS.ITokenRepository) private _tokenRepository: ITokenRepository,
        @inject(TOKENS.IUserRepository) private _userRepository: IUserRepository
    ) {}

    async generateToken(user: User): Promise<{ accessToken: string; refreshToken: string }> {
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

        await this._tokenRepository.deleteExpiredTokens(user.id);

        await this._tokenRepository.create({
            user_id: user.id,
            refresh_token: refreshTokenValue,
            expires_at: expiresAt
        });

        return {
            accessToken,
            refreshToken: refreshTokenValue
        };
    }

    async verifyToken(token: string): Promise<User | null> {
        try {
            const decoded = jwt.verify(token, SERVER.JWT_CONFIG.secret, {
                issuer: SERVER.JWT_CONFIG.issuer,
                audience: SERVER.JWT_CONFIG.audience
            }) as JWTPayload;

            const user = await this._userRepository.findById(decoded.userId);
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

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        const tokenRecord = await this._tokenRepository.findByRefreshToken(refreshToken);

        if (!tokenRecord) {
            return null;
        }
        await this._tokenRepository.deleteByRefreshToken(refreshToken);

        return this.generateToken(tokenRecord.user);
    }

    async revokeToken(refreshToken: string): Promise<boolean> {
        return this._tokenRepository.deleteByRefreshToken(refreshToken);
    }

    async revokeAllUserTokens(userId: string): Promise<boolean> {
        return this._tokenRepository.deleteAllByUserId(userId);
    }
}

export type { IJWTService, JWTPayload };
