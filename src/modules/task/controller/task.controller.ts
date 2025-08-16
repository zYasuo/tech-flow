import { Request, Response, NextFunction } from "express";
import { SCreateTask, SUpdateTask } from "../schemas";
import { inject, injectable } from "inversify";
import { authMiddleware } from "../../../middleware/auth-validation.middlaware";
import { Controller } from "../../../common/decorators/controller";
import { ITaskService } from "../services/interfaces/task-service.interface";
import { ErrorHandler } from "../../../common/errors/error-handler";
import { ErrorFactory } from "../../../common/errors/error-factory";
import { ApiResponse } from "../../../common/errors/api-response";
import { Routes } from "../../../common/decorators/routes";
import { TOKENS } from "../../../common/tokens/service.tokens";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

@Controller("")
@injectable()
class TaskController {
    constructor(@inject(TOKENS.ITaskService) private readonly taskService: ITaskService) {}

    @Routes("post", "projects/:projectId/tasks", authMiddleware)
    async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { projectId } = req.params;
            const userId = req.user!.id;

            if (!projectId) {
                throw ErrorFactory.missingParameter("Project ID");
            }

            const validationResult = SCreateTask.safeParse({
                ...req.body,
                projectId,
                userId
            });

            if (!validationResult.success) {
                return ApiResponse.badRequest(res, "Validation failed", validationResult.error);
            }

            const { userId: _, ...taskData } = validationResult.data;
            const task = await this.taskService.createTask(taskData, userId);

            return ApiResponse.created(res, task, "Task created successfully");
        } catch (error) {
            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }
            return ApiResponse.internalError(res);
        }
    }

    @Routes("put", "tasks/:id", authMiddleware)
    async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            if (!id) {
                throw ErrorFactory.missingParameter("Task ID");
            }

            const validationResult = SUpdateTask.safeParse(req.body);

            if (!validationResult.success) {
                return ApiResponse.badRequest(res, "Validation failed", validationResult.error);
            }

            const task = await this.taskService.updateTask(id, validationResult.data, userId);

            return ApiResponse.success(res, task, "Task updated successfully");
        } catch (error) {
            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }
            return ApiResponse.internalError(res);
        }
    }

    @Routes("delete", "tasks/:id", authMiddleware)
    async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            if (!id) {
                throw ErrorFactory.missingParameter("Task ID");
            }

            await this.taskService.deleteTask(id, userId);

            return ApiResponse.success(res, undefined, "Task deleted successfully");
        } catch (error) {
            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }
            return ApiResponse.internalError(res);
        }
    }
}

export default TaskController;
