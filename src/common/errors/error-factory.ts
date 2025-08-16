import { AppError } from "./custom-errors";
import { ERROR_CODES } from "./error-codes";

export class ErrorFactory {
    private static isProduction = process.env.NODE_ENV === "production";

    static notFound(entity: string, id?: string) {
        return new AppError(ERROR_CODES.NOT_FOUND, id ? `${entity} with id '${id}' not found` : `${entity} not found`, 404, { entity, id });
    }

    static userNotFound(userId?: string) {
        return new AppError(ERROR_CODES.USER_NOT_FOUND, userId ? `User with id '${userId}' not found` : "User not found", 404, { userId });
    }

    static userAlreadyExists(email: string) {
        return new AppError(ERROR_CODES.USER_ALREADY_EXISTS, `User with email '${email}' already exists`, 409, { email });
    }

    static invalidCredentials() {
        return new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Invalid email or password", 401);
    }

    static unauthorized(message: string = "Unauthorized access") {
        return new AppError(ERROR_CODES.UNAUTHORIZED, message, 401);
    }

    static tokenExpired() {
        return new AppError(ERROR_CODES.TOKEN_EXPIRED, "Access token has expired", 401);
    }

    static invalidToken() {
        return new AppError(ERROR_CODES.INVALID_TOKEN, "Invalid access token", 401);
    }

    static githubUserNotFound(username: string) {
        return new AppError(ERROR_CODES.GITHUB_USER_NOT_FOUND, `GitHub user '${username}' not found`, 404, { username });
    }

    static githubApiError(status: number, statusText: string) {
        return new AppError(
            ERROR_CODES.GITHUB_API_ERROR,
            "GitHub service temporarily unavailable",
            503,
            this.isProduction ? { status } : { originalStatus: status, originalStatusText: statusText }
        );
    }

    static githubNoRepositories(username: string) {
        return new AppError(ERROR_CODES.GITHUB_NO_REPOSITORIES, `No public repositories found for user '${username}'`, 404, { username });
    }

    static githubApiRateLimitExceeded() {
        return new AppError(ERROR_CODES.GITHUB_API_RATE_LIMIT_EXCEEDED, "GitHub API rate limit exceeded", 403);
    }

    static projectNotFound(projectId: string) {
        return new AppError(ERROR_CODES.PROJECT_NOT_FOUND, `Project with id '${projectId}' not found`, 404, { projectId });
    }

    static missingParameter(parameters: string | string[]) {
        const paramList = Array.isArray(parameters) ? parameters.join(", ") : parameters;
        return new AppError(ERROR_CODES.MISSING_PARAMETER, `Missing required parameter(s): ${paramList}`, 400, { parameters });
    }

    static invalidParameter(parameter: string, reason?: string) {
        const message = reason ? `Invalid parameter '${parameter}': ${reason}` : `Invalid parameter '${parameter}'`;
        return new AppError(ERROR_CODES.INVALID_PARAMETER, message, 400, { parameter, reason });
    }

    static databaseError(operation?: string, details?: any) {
        const message = this.isProduction
            ? "A database error occurred"
            : operation
            ? `Database operation failed: ${operation}`
            : "Database operation failed";

        const metadata = this.isProduction ? { operation } : { operation, details };

        return new AppError(ERROR_CODES.DATABASE_ERROR, message, 500, metadata);
    }

    static internalError(message: string = "Internal server error", details?: any) {
        return new AppError(
            ERROR_CODES.INTERNAL_ERROR,
            this.isProduction ? "Internal server error" : message,
            500,
            this.isProduction ? undefined : { details }
        );
    }
}
