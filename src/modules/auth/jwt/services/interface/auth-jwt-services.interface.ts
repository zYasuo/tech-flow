import { User } from "../../../../../data/models";

export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface IJWTService {
    generateToken(user: User): Promise<{ access_token: string; refresh_token: string }>;
    verifyToken(token: string): Promise<User | null>;
    refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string } | null>;
    revokeToken(refreshToken: string): Promise<boolean>;
    revokeAllUserTokens(userId: string): Promise<boolean>;
}