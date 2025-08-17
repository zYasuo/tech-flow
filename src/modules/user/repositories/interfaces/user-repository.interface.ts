import { User } from "../../../../models";
import { TCreateUser } from "../../schemas/user-create.schema";

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: TCreateUser & { password: string }): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<boolean>;
}
