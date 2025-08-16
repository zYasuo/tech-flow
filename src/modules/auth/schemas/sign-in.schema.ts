import { z } from "zod";

export const SSignIn = z.object({
    email: z.email(),
    password: z.string().min(6).max(100)
});

export type TUserSignin = z.infer<typeof SSignIn>;
