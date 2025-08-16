import { injectable, inject } from "inversify";
import { ErrorFactory } from "../../../common/errors/error-factory";
import type { IUserService } from "../../user/services/interfaces/user-services.interface";
import { IAuthService } from "./interfaces/auth-service.interface";
import type { IJWTService } from "../jwt/services/jwt.service";
import { TCreateUser } from "../../user/schemas";
import { TUserSignin } from "../schemas";
import { TOKENS } from "../../../common/tokens/service.tokens";
import { User } from "../../../data/models";

@injectable()
export class AuthService implements IAuthService {
    constructor(@inject(TOKENS.IUserService) private _userService: IUserService, @inject(TOKENS.IJWTService) private _jwtService: IJWTService) {}

    async register(data: TCreateUser): Promise<{
        user: Omit<User, "password">;
        tokens: { accessToken: string; refreshToken: string };
    }> {
        const user = await this._userService.createUser(data);
        const tokens = await this._jwtService.generateToken(user);

        const userPlain = user.toJSON();
        const { password, ...userWithoutPassword } = userPlain;

        return {
            user: userWithoutPassword as Omit<User, "password">,
            tokens
        };
    }

    async signIn(data: TUserSignin): Promise<{
        user: Omit<User, "password">;
        tokens: { accessToken: string; refreshToken: string };
    }> {
        const user = await this.validateLogin(data);
        const tokens = await this._jwtService.generateToken(user);

        const userPlain = user.toJSON();
        const { password, ...userWithoutPassword } = userPlain;

        return {
            user: userWithoutPassword as Omit<User, "password">,
            tokens
        };
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
        const tokens = await this._jwtService.refreshToken(refreshToken);

        if (!tokens) {
            throw ErrorFactory.invalidToken();
        }

        return tokens;
    }

    private async validateLogin(data: TUserSignin): Promise<User> {
        const user = await this._userService.findUserByEmail(data.email);
        if (!user) {
            throw ErrorFactory.invalidCredentials();
        }

        const isPasswordValid = await this._userService.isPasswordValid(data.password, user.password);
        if (!isPasswordValid) {
            throw ErrorFactory.invalidCredentials();
        }

        return user;
    }
}
