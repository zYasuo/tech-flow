import { z } from "zod";

export const SCreateUser = z.object({
    name: z.string({ message: "Name is required" }).min(2, "Name must have at least 2 characters").max(100, "Name must have at most 100 characters"),
    email: z.email({ message: "Email is required" }),
    password: z
        .string({ message: "Password is required" })
        .min(6, "Password must have at least 6 characters")
        .max(100, "Password must have at most 100 characters")
});

export type TCreateUser = z.infer<typeof SCreateUser>;
