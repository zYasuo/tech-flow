import { ICreateTokenData, ITokenRepository, TokenWithUser } from "./interface/auth-jwt-repository.interface";
import { ErrorFactory } from "../../../../common/errors/error-factory";
import { Token, User } from "../../../../data/models";
import { injectable } from "inversify";
import { Op } from "sequelize";

@injectable()
export class TokenRepository implements ITokenRepository {
    async create(data: ICreateTokenData): Promise<Token> {
        try {
            return await Token.create({
                refreshToken: data.refresh_token,
                expiresAt: data.expires_at,
                userId: data.user_id
            });
        } catch (error) {
            throw ErrorFactory.databaseError("create token", { originalError: error });
        }
    }

    async findByRefreshToken(refreshToken: string): Promise<TokenWithUser | null> {
        try {
            return (await Token.findOne({
                where: {
                    refreshToken,
                    expiresAt: {
                        [Op.gt]: new Date()
                    }
                },
                include: [
                    {
                        model: User,
                        as: "user"
                    }
                ]
            })) as TokenWithUser | null;
        } catch (error) {
            throw ErrorFactory.databaseError("find token by refresh token", { originalError: error });
        }
    }

    async deleteByRefreshToken(refreshToken: string): Promise<boolean> {
        try {
            const deletedRows = await Token.destroy({
                where: { refreshToken }
            });
            return deletedRows > 0;
        } catch (error) {
            return false;
        }
    }

    async deleteAllByUserId(userId: string): Promise<boolean> {
        try {
            await Token.destroy({
                where: { userId }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async deleteExpiredTokens(userId: string): Promise<void> {
        try {
            await Token.destroy({
                where: {
                    userId,
                    expiresAt: {
                        [Op.lt]: new Date()
                    }
                }
            });
        } catch (error) {
            throw ErrorFactory.databaseError("delete expired tokens", { originalError: error });
        }
    }
}
