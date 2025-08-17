import { Task } from "../../../../data/models/Task";
import { TCreateTask, TUpdateTask } from "../../schemas";

export interface ITaskRepository {
    create(data: TCreateTask): Promise<Task>;
    
    findById(id: string): Promise<Task | null>;
    
    findByProjectId(projectId: string): Promise<Task[]>;
    
    update(id: string, data: TUpdateTask): Promise<Task>;
    
    delete(id: string): Promise<void>;
}