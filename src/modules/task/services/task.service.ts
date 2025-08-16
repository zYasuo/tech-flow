import { ITaskService, TCreateTaskServiceData } from "./interfaces/task-service.interface";
import { inject, injectable } from "inversify";
import { ITaskRepository } from "../repositories/interface/task-repository.interface";
import { IProjectService } from "../../projects/services/interfaces/project.interface";
import { ErrorFactory } from "../../../common/errors/error-factory";
import { TUpdateTask } from "../schemas";
import { TOKENS } from "../../../common/tokens/service.tokens";
import { Task } from "../../../data/models";

@injectable()
export class TaskService implements ITaskService {
    constructor(
        @inject(TOKENS.ITaskRepository) private taskRepository: ITaskRepository,
        @inject(TOKENS.IProjectService) private projectService: IProjectService
    ) {}

    async createTask(data: TCreateTaskServiceData, userId: string): Promise<Task> {
        const project = await this.projectService.findById(data.projectId);

        if (!project) {
            throw ErrorFactory.projectNotFound(data.projectId);
        }

        if (project.userId !== userId) {
            throw ErrorFactory.unauthorized("You don't have permission to create tasks in this project");
        }

        return await this.taskRepository.create({
            ...data,
            userId
        });
    }

    async getTasksByProject(projectId: string, userId: string): Promise<Task[]> {
        const project = await this.projectService.findById(projectId);

        if (!project) {
            throw ErrorFactory.projectNotFound(projectId);
        }

        if (project.userId !== userId) {
            throw ErrorFactory.unauthorized("You don't have permission to view tasks in this project");
        }

        return await this.taskRepository.findByProjectId(projectId);
    }

    async getTaskById(taskId: string, userId: string): Promise<Task> {
        const task = await this.taskRepository.findById(taskId);

        if (!task) {
            throw ErrorFactory.notFound("Task", taskId);
        }

        if (task.userId !== userId) {
            throw ErrorFactory.unauthorized("You don't have permission to view this task");
        }

        return task;
    }

    async updateTask(taskId: string, data: TUpdateTask, userId: string): Promise<Task> {
        const task = await this.taskRepository.findById(taskId);

        if (!task) {
            throw ErrorFactory.notFound("Task", taskId);
        }

        if (task.userId !== userId) {
            throw ErrorFactory.unauthorized("You don't have permission to update this task");
        }

        return await this.taskRepository.update(taskId, data);
    }

    async deleteTask(taskId: string, userId: string): Promise<void> {
        const task = await this.taskRepository.findById(taskId);

        if (!task) {
            throw ErrorFactory.notFound("Task", taskId);
        }

        if (task.userId !== userId) {
            throw ErrorFactory.unauthorized("You don't have permission to delete this task");
        }

        await this.taskRepository.delete(taskId);
    }
}
