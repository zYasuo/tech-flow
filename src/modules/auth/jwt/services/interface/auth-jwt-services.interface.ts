import { User } from "../../../../../data/models";

export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface IJWTService {
    generateToken(user: User): Promise<{ accessToken: string; refreshToken: string }>;
    verifyToken(token: string): Promise<User | null>;
    refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null>;
    revokeToken(refreshToken: string): Promise<boolean>;
    revokeAllUserTokens(userId: string): Promise<boolean>;
}