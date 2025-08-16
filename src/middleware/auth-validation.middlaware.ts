import { Request, Response, NextFunction } from "express";
import { ErrorFactory } from "../common/errors/error-factory";
import { ErrorHandler } from "../common/errors/error-handler";
import { IJWTService } from "../modules/auth/jwt/services/interface/auth-jwt-services.interface";
import { ApiResponse } from "../common/errors/api-response";
import { container } from "../common/di/inversify.di";
import { TOKENS } from "../common/tokens/service.tokens";

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw ErrorFactory.unauthorized("Authorization header is required");
        }

        if (!authHeader.startsWith("Bearer ")) {
            throw ErrorFactory.unauthorized("Authorization header must start with 'Bearer '");
        }

        const token = authHeader.substring(7);

        if (!token) {
            throw ErrorFactory.unauthorized("Access token is required");
        }

        const jwtService = container.get<IJWTService>(TOKENS.IJWTService);

        const user = await jwtService.verifyToken(token);

        if (!user) {
            throw ErrorFactory.invalidToken();
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof Error) {
            return ErrorHandler.handle(error, res);
        }
        return ApiResponse.internalError(res, "Authentication failed");
    }
};
