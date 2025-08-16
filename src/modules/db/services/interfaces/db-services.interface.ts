import { Sequelize } from 'sequelize-typescript';

export interface IDBService {
    sequelize: Sequelize;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sync(): Promise<void>;
}
