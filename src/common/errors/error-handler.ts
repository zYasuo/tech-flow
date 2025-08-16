import { ApiResponse } from "./api-response";
import { Response } from "express";
import { AppError } from "./custom-errors";

export class ErrorHandler {
    static handle(error: Error, res: Response): Response {
        console.error(`[${error.name}] ${error.message}`, {
            stack: error.stack,
            ...(error instanceof AppError && {
                code: error.code,
                metadata: error.metadata
            })
        });

        if (error instanceof AppError) {
            return ApiResponse.error(res, error.message, error.statusCode, error.metadata, error.code);
        }

        return ApiResponse.internalError(res, "An unexpected error occurred");
    }

    static isOperationalError(error: Error): boolean {
        if (error instanceof AppError) {
            return error.isOperational;
        }
        return false;
    }
}
