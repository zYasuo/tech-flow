import { IUserRepository } from "./interfaces/user-repository.interface";
import { ErrorFactory } from "../../../common/errors/error-factory";
import { TCreateUser } from "../schemas/user-create.schema";
import { injectable } from "inversify";
import { User } from "../../../data/models";

@injectable()
export class UserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        try {
            return await User.findOne({
                where: { email }
            });
        } catch (error) {
            throw ErrorFactory.databaseError("find user by email", { email, originalError: error });
        }
    }

    async findById(id: string): Promise<User | null> {
        try {
            return await User.findByPk(id);
        } catch (error) {
            throw ErrorFactory.databaseError("find user by id", { id, originalError: error });
        }
    }

    async create(data: TCreateUser & { password: string }): Promise<User> {
        try {
            return await User.create({
                email: data.email,
                name: data.name,
                password: data.password
            });
        } catch (error) {
            if (error && typeof error === "object" && "name" in error) {
                if (error.name === "SequelizeUniqueConstraintError") {
                    throw ErrorFactory.userAlreadyExists(data.email);
                }
            }

            throw ErrorFactory.databaseError("create user", { email: data.email, originalError: error });
        }
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        try {
            const [affectedRows] = await User.update(data, {
                where: { id }
            });

            if (affectedRows === 0) {
                throw ErrorFactory.userNotFound(id);
            }

            const updatedUser = await User.findByPk(id);
            if (!updatedUser) throw ErrorFactory.userNotFound(id);
            return updatedUser;
        } catch (error) {
            if (error && typeof error === "object" && "name" in error) {
                if (error.name === "SequelizeUniqueConstraintError") {
                    throw ErrorFactory.userAlreadyExists("email");
                }
            }

            throw ErrorFactory.databaseError("update user", { id, originalError: error });
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const deletedRows = await User.destroy({
                where: { id }
            });
            return deletedRows > 0;
        } catch (error) {
            throw ErrorFactory.databaseError("delete user", { id, originalError: error });
        }
    }
}
