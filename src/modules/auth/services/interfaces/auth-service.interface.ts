
import { TUserSignin } from "../../schemas";
import { TCreateUser } from "../../../user/schemas";
import { User } from "../../../../data/models";

export interface IAuthService {
    register(data: TCreateUser): Promise<{
        user: Omit<User, "password">;
        tokens: { accessToken: string; refreshToken: string };
    }>;

    signIn(data: TUserSignin): Promise<{
        user: Omit<User, "password">;
        tokens: { accessToken: string; refreshToken: string };
    }>;

    refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null>;
}
