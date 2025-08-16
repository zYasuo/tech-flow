export const TOKENS = {
    IDBService: Symbol("IDBService"),
    IUserService: Symbol("IUserService"),
    IJWTService: Symbol("IJWTService"),
    IAuthService: Symbol("IAuthService"),
    IProjectService: Symbol("IProjectService"),
    IGitHubService: Symbol("IGitHubService"),
    ITaskService: Symbol("ITaskService"),
    ICacheService: Symbol("ICacheService"),

    ITaskRepository: Symbol("ITaskRepository"),
    IUserRepository: Symbol("IUserRepository"),
    ITokenRepository: Symbol("ITokenRepository"),
    IProjectRepository: Symbol("IProjectRepository"),
    SequelizeInstance: Symbol("SequelizeInstance"),

    AuthController: Symbol("AuthController"),
    ProjectController: Symbol("ProjectController"),
    TaskController: Symbol("TaskController")
} as const;
