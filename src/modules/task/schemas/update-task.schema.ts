import { TaskPriorityEnum, TaskStatusEnum } from "./task-enum.schema";
import z from "zod";

export const SUpdateTask = z.object({
    title: z
        .string()
        .min(2, { message: "Title must be at least 2 characters" })
        .max(100, { message: "Title must be at most 100 characters" })
        .optional(),
    description: z.string().max(500, { message: "Description must be at most 500 characters" }).optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional()
});


export type TUpdateTask = z.infer<typeof SUpdateTask>;