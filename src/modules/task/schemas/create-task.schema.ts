import { z } from "zod";
import { TaskPriorityEnum } from "./task-enum.schema";

export const SCreateTask = z.object({
    title: z
        .string({ message: "Title is required" })
        .min(2, { message: "Title must be at least 2 characters" })
        .max(100, { message: "Title must be at most 100 characters" }),
    description: z.string().max(500, { message: "Description must be at most 500 characters" }).optional(),
    priority: TaskPriorityEnum.default("MEDIUM"),
    projectId: z.string({ message: "Project ID is required" }).min(1, { message: "Project ID cannot be empty" }),
    userId: z.string({ message: "User ID is required" }).min(1, { message: "User ID cannot be empty" })
});

export type TCreateTask = z.infer<typeof SCreateTask>;
