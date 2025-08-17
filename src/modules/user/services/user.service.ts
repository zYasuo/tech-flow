import { injectable, inject } from "inversify";
import type { IUserRepository } from "../repositories/interfaces/user-repository.interface";
import { IUserService } from "./interfaces/user-services.interface";
import { ErrorFactory } from "../../../common/errors/error-factory";
import { TCreateUser } from "../schemas";
import { TOKENS } from "../../../common/tokens/service.tokens";
import { User } from "../../../models";
import bcrypt from "bcrypt";

@injectable()
export class UserService implements IUserService {
    constructor(@inject(TOKENS.IUserRepository) private userRepository: IUserRepository) {}

    async createUser(data: TCreateUser): Promise<User> {
        const { email, name, password } = data;

        const userExists = await this.isUserExistsByEmail(email);
        if (userExists) {
            throw ErrorFactory.userAlreadyExists(email);
        }

        const hashedPassword = await this.hashPassword(password);

        return await this.userRepository.create({
            email,
            name,
            password: hashedPassword
        });
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findByEmail(email);
    }

    async findUserById(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw ErrorFactory.userNotFound(id);
        }
        return user;
    }

    async isPasswordValid(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    private async isUserExistsByEmail(email: string): Promise<boolean> {
        const user = await this.userRepository.findByEmail(email);
        return !!user;
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async deleteUserById(id: string): Promise<void> {
        await this.userRepository.delete(id);
    }
}
