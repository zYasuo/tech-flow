import { TCreateTask, TUpdateTask } from "../../schemas";
import { Task } from "../../../../models";

export type TCreateTaskServiceData = Omit<TCreateTask, "userId">;

export interface ITaskService {
    createTask(data: TCreateTaskServiceData, userId: string): Promise<Task>;

    getTasksByProject(projectId: string, userId: string): Promise<Task[]>;

    getTaskById(taskId: string, userId: string): Promise<Task>;

    updateTask(taskId: string, data: TUpdateTask, userId: string): Promise<Task>;

    deleteTask(taskId: string, userId: string): Promise<void>;
}
