import { token, user } from "@prisma/client";

export interface ICreateTokenData {
    user_id: string;
    refresh_token: string;
    expires_at: Date;
}

export interface TokenWithUser extends token {
    user: user;
}

export interface ITokenRepository {
    create(data: ICreateTokenData): Promise<token>;
    findByRefreshToken(refreshToken: string): Promise<TokenWithUser | null>;
    deleteByRefreshToken(refreshToken: string): Promise<boolean>;
    deleteAllByUserId(userId: string): Promise<boolean>;
    deleteExpiredTokens(userId: string): Promise<void>;
}