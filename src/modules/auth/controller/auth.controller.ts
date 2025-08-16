import { NextFunction, Request, Response } from "express";
import { SRefreshToken, SSignIn } from "../schemas";
import { injectable, inject } from "inversify";
import { authMiddleware } from "../../../middleware/auth-validation.middlaware";
import { IAuthService } from "../services/interfaces/auth-service.interface";
import { ErrorHandler } from "../../../common/errors/error-handler";
import { SCreateUser } from "../../user/schemas";
import { ApiResponse } from "../../../common/errors/api-response";
import { Controller } from "../../../common/decorators/controller";
import { ZodError } from "zod";
import { TOKENS } from "../../../common/tokens/service.tokens";
import { Routes } from "../../../common/decorators/routes";

@Controller("auth")
@injectable()
class AuthController {
    constructor(@inject(TOKENS.IAuthService) private _authService: IAuthService) {}

    @Routes("post", "/register")
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = SCreateUser.parse(req.body);
            const result = await this._authService.register(validatedData);

            return ApiResponse.created(res, result, "User created successfully");
        } catch (error) {
            if (error instanceof ZodError) {
                return ApiResponse.badRequest(res, "Validation failed", {
                    issues: error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message
                    }))
                });
            }

            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }

            return ApiResponse.internalError(res);
        }
    }

    @Routes("post", "/login")
    async login(req: Request, res: Response) {
        try {
            const validatedData = SSignIn.parse(req.body);
            const result = await this._authService.signIn(validatedData);

            return ApiResponse.success(res, result, "User logged in successfully");
        } catch (error) {
            if (error instanceof ZodError) {
                return ApiResponse.badRequest(res, "Validation failed", {
                    issues: error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message
                    }))
                });
            }

            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }

            return ApiResponse.internalError(res);
        }
    }
}

export default AuthController;
