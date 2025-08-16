import "reflect-metadata";
import http from "http";
import express from "express";
import { CorsHandler } from "./middleware/cors-handler.middleware";
import { SERVER } from "./config/config";
import { RegisterControllers } from "./modules/routes";
import { NotFoundRouteHandler } from "./middleware/not-found-route.middleware";

import AuthController from "./modules/auth/controller/auth.controller";
import ProjectController from "./modules/projects/controller/project.controller";
import TaskController from "./modules/task/controller/task.controller";

import { container } from "./common/di/inversify.di";
import { TOKENS } from "./common/tokens/service.tokens";
import { ICacheService } from "./modules/cache/services/interfaces/redis-services.interface";

export const app = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const MainServer = () => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(CorsHandler);

    const authController = container.get<AuthController>(TOKENS.AuthController);
    const projectController = container.get<ProjectController>(TOKENS.ProjectController);
    const taskController = container.get<TaskController>(TOKENS.TaskController);

    RegisterControllers(app, [authController, projectController, taskController]);

    app.use(NotFoundRouteHandler);

    httpServer = http.createServer(app);
    httpServer.listen(SERVER.SERVER_PORT, () => {
        console.log(`🚀 Server is running on port ${SERVER.SERVER_PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    });
};

export const ShoutdownServer = async (callback: any) => {
    if (httpServer) {
        console.log("🔄 Shutting down server...");

        try {
            const redisService = container.get<ICacheService>(TOKENS.ICacheService);
            await redisService.disconnect();
            console.log("✅ Redis disconnected");
        } catch (error) {
            console.error("❌ Error disconnecting Redis:", error);
        }

        httpServer.close(callback);
    }
};

MainServer();
