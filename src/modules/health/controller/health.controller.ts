import { Request, Response } from "express";
import { injectable } from "inversify";
import { Controller } from "../../../common/decorators/controller";
import { Routes } from "../../../common/decorators/routes";

@Controller("")
@injectable()
export class HealthController {
    @Routes("get", "health")
    async health(req: Request, res: Response) {
        try {
            res.status(200).json({
                status: "OK",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development"
            });
        } catch (error) {
            res.status(500).json({
                status: "ERROR",
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
}
