import { Token } from "../../../../../data/models/Token";
import { User } from "../../../../../data/models/User";

export interface ICreateTokenData {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
}

export interface TokenWithUser extends Token {
    user: User;
}

export interface ITokenRepository {
    create(data: ICreateTokenData): Promise<Token>;
    findByRefreshToken(refreshToken: string): Promise<TokenWithUser | null>;
    deleteByRefreshToken(refreshToken: string): Promise<boolean>;
    deleteAllByUserId(userId: string): Promise<boolean>;
    deleteExpiredTokens(userId: string): Promise<void>;
}