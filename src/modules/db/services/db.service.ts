import { injectable, inject } from "inversify";
import { Sequelize } from "sequelize-typescript";
import { IDBService } from "./interfaces/db-services.interface";
import { TOKENS } from "../../../common/tokens/service.tokens";

@injectable()
export class DBService implements IDBService {
    constructor(@inject(TOKENS.SequelizeInstance) private _sequelize: Sequelize) {}

    get sequelize(): Sequelize {
        return this._sequelize;
    }

    async connect() {
        await this._sequelize.authenticate();
    }

    async disconnect() {
        await this._sequelize.close();
    }

    async sync() {
        await this._sequelize.sync();
    }
}
