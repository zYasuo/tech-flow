// src/common/di/inversify.config.ts
import { Container } from "inversify";
import { TOKENS } from "../tokens/service.tokens";

// Database
import { Sequelize } from "sequelize-typescript";
import { DatabaseConnection } from "../../config/database";
import { DBService } from "../../modules/db/services/db.service";
import { IDBService } from "../../modules/db/services/interfaces/db-services.interface";

// Cache
import { RedisService } from "../../modules/cache/services/redis.service";
import { ICacheService } from "../../modules/cache/services/interfaces/redis-services.interface";

// Repositories
import { UserRepository } from "../../modules/user/repositories/user.repository";
import { IUserRepository } from "../../modules/user/repositories/interfaces/user-repository.interface";
import { ProjectRepository } from "../../modules/projects/repositories/project.repository";
import { IProjectRepository } from "../../modules/projects/repositories/interfaces/project-repository.interface";
import { TaskRepository } from "../../modules/task/repositories/taks.repository";
import { TokenRepository } from "../../modules/auth/jwt/repository/auth-jwt.repository";
import { ITaskRepository } from "../../modules/task/repositories/interface/task-repository.interface";
import { ITokenRepository } from "../../modules/auth/jwt/repository/interface/auth-jwt-repository.interface";

// Services
import { AuthService } from "../../modules/auth/services/auth.service";
import { IJWTService, JWTService } from "../../modules/auth/jwt/services/jwt.service";
import { GitHubService } from "../../modules/github/services/github.service";
import { IGitHubService } from "../../modules/github/services/interfaces/github-services.interface";
import { ProjectService } from "../../modules/projects/services/project.service";
import { TaskService } from "../../modules/task/services/task.service";
import { ITaskService } from "../../modules/task/services/interfaces/task-service.interface";
import { IAuthService } from "../../modules/auth/services/interfaces/auth-service.interface";
import { IProjectService } from "../../modules/projects/services/interfaces/project.interface";
import { IUserService } from "../../modules/user/services/interfaces/user-services.interface";

// Controllers
import AuthController from "../../modules/auth/controller/auth.controller";
import ProjectController from "../../modules/projects/controller/project.controller";
import TaskController from "../../modules/task/controller/task.controller";
import { HealthController } from "../../modules/health/controller/health.controller";
import { UserService } from "../../modules/user/services/user.service";

const container = new Container();

// Database
const databaseConnection = new DatabaseConnection();
container.bind<Sequelize>(TOKENS.SequelizeInstance).toConstantValue(databaseConnection.sequelize);
container.bind<IDBService>(TOKENS.IDBService).to(DBService).inSingletonScope();

// Cache
container.bind<ICacheService>(TOKENS.ICacheService).to(RedisService).inSingletonScope();

// Repositories
container.bind<IUserRepository>(TOKENS.IUserRepository).to(UserRepository).inSingletonScope();
container.bind<IProjectRepository>(TOKENS.IProjectRepository).to(ProjectRepository).inSingletonScope();
container.bind<ITaskRepository>(TOKENS.ITaskRepository).to(TaskRepository).inSingletonScope();
container.bind<ITokenRepository>(TOKENS.ITokenRepository).to(TokenRepository).inSingletonScope();

// Services
container.bind<IUserService>(TOKENS.IUserService).to(UserService).inSingletonScope();
container.bind<IAuthService>(TOKENS.IAuthService).to(AuthService).inSingletonScope();
container.bind<IJWTService>(TOKENS.IJWTService).to(JWTService).inSingletonScope();
container.bind<IGitHubService>(TOKENS.IGitHubService).to(GitHubService).inSingletonScope();
container.bind<IProjectService>(TOKENS.IProjectService).to(ProjectService).inSingletonScope();
container.bind<ITaskService>(TOKENS.ITaskService).to(TaskService).inSingletonScope();

// Controllers 
container.bind<AuthController>(TOKENS.AuthController).to(AuthController);
container.bind<ProjectController>(TOKENS.ProjectController).to(ProjectController);
container.bind<TaskController>(TOKENS.TaskController).to(TaskController);
container.bind<HealthController>(TOKENS.HealthController).to(HealthController);

export { container };