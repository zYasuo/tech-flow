
import { TUserSignin } from "../../schemas";
import { TCreateUser } from "../../../user/schemas";
import { User } from "../../../../models";

export interface IAuthService {
    register(data: TCreateUser): Promise<{
        user: Omit<User, "password">;
        tokens: { access_token: string; refresh_token: string };
    }>;

    signIn(data: TUserSignin): Promise<{
        user: Omit<User, "password">;
        tokens: { access_token: string; refresh_token: string };
    }>;

    refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string } | null>;
}
