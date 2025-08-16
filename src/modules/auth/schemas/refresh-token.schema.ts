import { z } from "zod";

export const SRefreshToken = z.object({
    refreshToken: z.uuid("Invalid refresh token format")
});

export type TRefreshToken = z.infer<typeof SRefreshToken>;
