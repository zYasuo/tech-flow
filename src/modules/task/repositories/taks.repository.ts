import { TCreateTask, TUpdateTask } from "../schemas";
import { injectable } from "inversify";
import { ITaskRepository } from "./interface/task-repository.interface";
import { ErrorFactory } from "../../../common/errors/error-factory";
import { Task } from "../../../data/models";

@injectable()
export class TaskRepository implements ITaskRepository {
    async create(data: TCreateTask): Promise<Task> {
        try {
            return await Task.create({
                title: data.title,
                description: data.description,
                priority: data.priority,
                projectId: data.projectId,
                userId: data.userId
            });
        } catch (error) {
            throw ErrorFactory.databaseError("create task", { originalError: error });
        }
    }

    async findById(id: string): Promise<Task | null> {
        try {
            return await Task.findByPk(id);
        } catch (error) {
            throw ErrorFactory.databaseError("find task", { originalError: error });
        }
    }

    async findByProjectId(projectId: string): Promise<Task[]> {
        try {
            return await Task.findAll({
                where: { projectId },
                order: [["createdAt", "DESC"]]
            });
        } catch (error) {
            throw ErrorFactory.databaseError("find tasks", { originalError: error });
        }
    }

    async update(id: string, data: TUpdateTask): Promise<Task> {
        try {
            const updateData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined));

            const [affectedRows] = await Task.update(
                {
                    ...updateData,
                    updatedAt: new Date()
                },
                {
                    where: { id }
                }
            );

            if (affectedRows === 0) {
                throw ErrorFactory.notFound("Task", id);
            }

            const updatedTask = await Task.findByPk(id);
            if (!updatedTask) throw ErrorFactory.notFound("Task", id);

            return updatedTask;
        } catch (error) {
            throw ErrorFactory.databaseError("update task", { originalError: error });
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const deletedRows = await Task.destroy({
                where: { id }
            });

            if (deletedRows === 0) {
                throw ErrorFactory.notFound("Task", id);
            }
        } catch (error) {
            throw ErrorFactory.databaseError("delete task", { originalError: error });
        }
    }
}
