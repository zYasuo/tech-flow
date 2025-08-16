import { createClient, RedisClientType } from "redis";
import { ICacheService } from "./interfaces/redis-services.interface";
import { injectable } from "inversify";
import { SERVER } from "../../../config/config";

@injectable()
export class RedisService implements ICacheService {
    private client: RedisClientType;
    private readonly DEFAULT_TTL = 600;
    private isConnected = false;

    constructor() {
        this.client = createClient({
            username: SERVER.REDIS_CONFIG.USERNAME,
            password: SERVER.REDIS_CONFIG.PASSWORD,
            socket: {
                host: SERVER.REDIS_CONFIG.socket.host,
                port: SERVER.REDIS_CONFIG.socket.port,
                reconnectStrategy: (retries) => Math.min(retries * 50, 500)
            }
        });

        this.setupEventHandlers();
        this.connect();
    }

    private setupEventHandlers(): void {
        this.client.on("error", (error) => {
            this.isConnected = false;
            if (process.env.NODE_ENV === 'development') {
                console.error('Redis Error:', error.message);
            }
        });

        this.client.on("ready", () => {
            this.isConnected = true;
        });

        this.client.on("end", () => {
            this.isConnected = false;
        });
    }

    private async connect(): Promise<void> {
        try {
            if (!this.isConnected) {
                await this.client.connect();
            }
        } catch (error) {
            this.isConnected = false;
            if (process.env.NODE_ENV === 'development' && error instanceof Error) {
                console.error('Redis connection failed:', error.message);
            }
        }
    }

    private async ensureConnection(): Promise<boolean> {
        if (!this.isConnected) {
            try {
                await this.connect();
                return this.isConnected;
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            if (!(await this.ensureConnection())) {
                return null;
            }

            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds = this.DEFAULT_TTL): Promise<void> {
        try {
            if (!(await this.ensureConnection())) {
                return;
            }

            await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
        } catch (error) {
            // Falha graceful
        }
    }

    async delete(key: string): Promise<void> {
        try {
            if (!(await this.ensureConnection())) {
                return;
            }

            await this.client.del(key);
        } catch (error) {
            // Falha graceful
        }
    }

    async clear(): Promise<void> {
        try {
            if (!(await this.ensureConnection())) {
                return;
            }

            await this.client.flushAll();
        } catch (error) {
            // Falha graceful
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.isConnected) {
                await this.client.quit();
                this.isConnected = false;
            }
        } catch (error) {
            this.isConnected = false;
        }
    }

    isReady(): boolean {
        return this.isConnected;
    }
}