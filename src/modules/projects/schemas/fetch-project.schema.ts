import { z } from "zod";

export const SFetchProject = z.object({
    id: z.string({
        message: "Project ID is required"
    })
});

export type TFetchProject = z.infer<typeof SFetchProject>;
