import { User, Token, Project, Task, GithubRepository } from "../models";
import { Sequelize } from "sequelize-typescript";
import { SERVER } from "./config";

export class DatabaseConnection {
    public sequelize: Sequelize;

    constructor() {
        this.sequelize = new Sequelize({
            database: SERVER.DATABASE_CONFIG.NAME,
            username: SERVER.DATABASE_CONFIG.USER,
            password: SERVER.DATABASE_CONFIG.PASSWORD,
            host: SERVER.DATABASE_CONFIG.HOST,
            port: SERVER.DATABASE_CONFIG.PORT,
            dialect: SERVER.DATABASE_CONFIG.DIALECT,
            models: [User, Token, Project, Task, GithubRepository],
            logging: process.env.NODE_ENV === "development" ? console.log : false,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            define: {
                charset: "utf8mb4",
                collate: "utf8mb4_unicode_ci"
            }
        });
    }

    async connect(): Promise<void> {
        try {
            await this.sequelize.authenticate();
            console.log("Database connection has been established successfully.");
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.sequelize.close();
            console.log("Database connection has been closed.");
        } catch (error) {
            console.error("Error closing database connection:", error);
            throw error;
        }
    }

    async sync(): Promise<void> {
        try {
            await this.sequelize.sync();
            console.log("Database synced successfully.");
        } catch (error) {
            console.error("Error syncing database:", error);
            throw error;
        }
    }
}
