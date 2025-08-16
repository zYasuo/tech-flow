import { Response } from "express";

export interface ApiSuccessResponse<T = any> {
    success: true;
    message?: string;
    data?: T;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        [key: string]: any;
    };
}

export interface ApiErrorResponse {
    success: false;
    error: string;
    details?: any;
    code?: string;
}

export class ApiResponse {
    static success<T>(res: Response, data?: T, message?: string, statusCode: number = 200, meta?: any): Response<ApiSuccessResponse<T>> {
        const response: ApiSuccessResponse<T> = {
            success: true,
            ...(message && { message }),
            ...(data && { data }),
            ...(meta && { meta })
        };

        return res.status(statusCode).json(response);
    }

    static error(res: Response, error: string, statusCode: number = 400, details?: any, code?: string): Response<ApiErrorResponse> {
        const response: ApiErrorResponse = {
            success: false,
            error,
            ...(details && { details }),
            ...(code && { code })
        };

        return res.status(statusCode).json(response);
    }

    static created<T>(res: Response, data: T, message: string = "Resource created successfully"): Response<ApiSuccessResponse<T>> {
        return this.success(res, data, message, 201);
    }

    static notFound(res: Response, message: string = "Resource not found"): Response<ApiErrorResponse> {
        return this.error(res, message, 404, undefined, "NOT_FOUND");
    }

    static badRequest(res: Response, message: string = "Bad request", details?: any): Response<ApiErrorResponse> {
        return this.error(res, message, 400, details, "BAD_REQUEST");
    }

    static internalError(res: Response, message: string = "Internal server error", details?: any): Response<ApiErrorResponse> {
        return this.error(res, message, 500, details, "INTERNAL_ERROR");
    }

    static serviceUnavailable(res: Response, message: string = "Service temporarily unavailable"): Response<ApiErrorResponse> {
        return this.error(res, message, 503, undefined, "SERVICE_UNAVAILABLE");
    }

    static unauthorized(res: Response, message: string = "Unauthorized access"): Response<ApiErrorResponse> {
        return this.error(res, message, 401, undefined, "UNAUTHORIZED");
    }

    static forbidden(res: Response, message: string = "Access forbidden"): Response<ApiErrorResponse> {
        return this.error(res, message, 403, undefined, "FORBIDDEN");
    }

    static conflict(res: Response, message: string = "Resource already exists"): Response<ApiErrorResponse> {
        return this.error(res, message, 409, undefined, "CONFLICT");
    }
}
