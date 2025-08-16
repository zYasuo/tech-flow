import { z } from "zod";

export const SCreateProject = z.object({
    name: z
        .string({
            message: "Project name is required"
        })
        .min(2)
        .max(100),
    description: z
        .string({
            message: "Project description is required"
        })
        .min(2)
        .max(500),
    userId: z.string({
        message: "User ID is required"
    })
});

export type TCreateProject = z.infer<typeof SCreateProject>;
