import { z } from "zod";

export const SUpdateProject = z.object({
    name: z
        .string({
            message: "Project name is required"
        })
        .min(2)
        .max(100)
        .optional(),
    description: z
        .string({
            message: "Project description is required"
        })
        .min(2)
        .max(500)
        .optional()
});

export type TUpdateProject = z.infer<typeof SUpdateProject>;
