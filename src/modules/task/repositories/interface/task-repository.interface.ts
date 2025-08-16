import { task } from "@prisma/client";
import { TCreateTask, TUpdateTask } from "../../schemas";

export interface ITaskRepository {
    create(data: TCreateTask): Promise<task>;
    
    findById(id: string): Promise<task | null>;
    
    findByProjectId(projectId: string): Promise<task[]>;
    
    update(id: string, data: TUpdateTask): Promise<task>;
    
    delete(id: string): Promise<void>;
}