import { TCreateUser } from "../../schemas";
import { User } from "../../../../data/models";

export interface IUserService {
    createUser(data: TCreateUser): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
    isPasswordValid(password: string, hashedPassword: string): Promise<boolean>;
    deleteUserById(id: string): Promise<void>;
}
