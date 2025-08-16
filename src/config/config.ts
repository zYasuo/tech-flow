import dotenv from "dotenv";

dotenv.config();

export const DEVELOPMENT = process.env.NODE_ENV === "development";
export const TEST = process.env.NODE_ENV === "test";

export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || "localhost";
export const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3001;

export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || "dev-secret",
    accessTokenExpiry: "15m",
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
    issuer: process.env.JWT_ISSUER || "ligue-lead-tech",
    audience: process.env.JWT_AUDIENCE || "api-users"
} as const;

export const REDIS_CONFIG = {
    USERNAME: process.env.REDIS_USERNAME || "default",
    PASSWORD: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 15495
    }
} as const;

export const CACHE_CONFIG = {
    TTL: {
        GITHUB_REPOS: 600,
        USER_SESSION: 900,
        DEFAULT: 300
    },
    KEYS: {
        GITHUB_REPOS: (username: string) => `github:repos:${username.toLowerCase()}`,
        USER_SESSION: (userId: string) => `user:session:${userId}`,
        PROJECT_DATA: (projectId: string) => `project:data:${projectId}`
    }
} as const;

export const GIT_HUB_CONFIG = {
    BASE_URL: process.env.GIT_HUB_BASE_URL || "https://api.github.com",
    PER_PAGE: 5
} as const;

export const DATABASE_CONFIG = {
    NAME: process.env.DB_NAME_SEQUELIZE || 'tech-lead',
    USER: process.env.DB_USER_SEQUELIZE || 'root',
    PASSWORD: process.env.DB_PASSWORD_SEQUELIZE || '',
    HOST: process.env.DB_HOST_SEQUELIZE || 'localhost',
    PORT: Number(process.env.DB_PORT_SEQUELIZE) || 3306,
    DIALECT: 'mysql' as const,
} as const;

export const SERVER = {
    SERVER_HOSTNAME,
    SERVER_PORT,
    JWT_CONFIG,
    GIT_HUB_CONFIG,
    REDIS_CONFIG,
    CACHE_CONFIG,
    DATABASE_CONFIG
} as const;

