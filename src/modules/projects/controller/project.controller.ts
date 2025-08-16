import { Request, Response, NextFunction } from "express";
import { SCreateProject, SUpdateProject } from "../schemas";
import { injectable, inject } from "inversify";
import { GithubRepository } from "../../../data/models";
import { IProjectService } from "../services/interfaces/project.interface";
import { authMiddleware } from "../../../middleware/auth-validation.middlaware";
import { ErrorHandler } from "../../../common/errors/error-handler";
import { ErrorFactory } from "../../../common/errors/error-factory";
import { ApiResponse } from "../../../common/errors/api-response";
import { Controller } from "../../../common/decorators/controller";
import { Routes } from "../../../common/decorators/routes";
import { TOKENS } from "../../../common/tokens/service.tokens";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

@Controller("projects")
@injectable()
class ProjectController {
    constructor(@inject(TOKENS.IProjectService) private readonly projectService: IProjectService) {}

    @Routes("post", "", authMiddleware)
    async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;

            const validationResult = SCreateProject.safeParse({
                ...req.body,
                userId
            });

            if (!validationResult.success) {
                return ApiResponse.badRequest(res, "Validation failed", {
                    issues: validationResult.error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message
                    }))
                });
            }

            const project = await this.projectService.createProject(validationResult.data);

            return ApiResponse.created(
                res,
                {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    userId: project.userId,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt
                },
                "Project created successfully"
            );
        } catch (error) {
            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }
            return ApiResponse.internalError(res);
        }
    }

    @Routes("get", "/:id", authMiddleware)
    async getProjectWithRepositories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            if (!id) {
                throw ErrorFactory.missingParameter("Project ID");
            }

            const project = await this.projectService.findByIdWithRepositories(id);

            if (!project) {
                throw ErrorFactory.projectNotFound(id);
            }

            if (project.userId !== userId) {
                throw ErrorFactory.unauthorized("You don't have permission to access this project");
            }

            return ApiResponse.success(
                res,
                {
                    project: {
                        id: project.id,
                        name: project.name,
                        description: project.description,
                        userId: project.userId,
                        createdAt: project.createdAt,
                        updatedAt: project.updatedAt
                    },
                    repositories: project.repositories.map((repo: GithubRepository) => ({
                        id: repo.id,
                        githubId: repo.githubId,
                        name: repo.name,
                        fullName: repo.fullName,
                        description: repo.description,
                        htmlUrl: repo.htmlUrl,
                        language: repo.language,
                        stargazers: repo.stargazers,
                        createdAt: repo.createdAt,
                        updatedAt: repo.updatedAt
                    }))
                },
                "Project retrieved successfully",
                200,
                {
                    repositoriesCount: project.repositories.length
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }
            return ApiResponse.internalError(res);
        }
    }

    @Routes("put", "/:id", authMiddleware)
    async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            if (!id) {
                throw ErrorFactory.missingParameter("Project ID");
            }

            const validationResult = SUpdateProject.safeParse(req.body);

            if (!validationResult.success) {
                return ApiResponse.badRequest(res, "Validation failed", {
                    issues: validationResult.error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message
                    }))
                });
            }

            const existingProject = await this.projectService.findById(id);
            if (!existingProject) {
                throw ErrorFactory.projectNotFound(id);
            }

            if (existingProject.userId !== userId) {
                throw ErrorFactory.unauthorized("You don't have permission to update this project");
            }

            const updatedProject = await this.projectService.updateProject(id, validationResult.data);

            return ApiResponse.success(
                res,
                {
                    id: updatedProject.id,
                    name: updatedProject.name,
                    description: updatedProject.description,
                    userId: updatedProject.userId,
                    createdAt: updatedProject.createdAt,
                    updatedAt: updatedProject.updatedAt
                },
                "Project updated successfully"
            );
        } catch (error) {
            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }
            return ApiResponse.internalError(res);
        }
    }

    @Routes("delete", "/:id", authMiddleware)
    async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;

            if (!id) {
                throw ErrorFactory.missingParameter("Project ID");
            }

            const existingProject = await this.projectService.findById(id);
            if (!existingProject) {
                throw ErrorFactory.projectNotFound(id);
            }

            if (existingProject.userId !== userId) {
                throw ErrorFactory.unauthorized("You don't have permission to delete this project");
            }

            await this.projectService.deleteProject(id);

            return ApiResponse.success(res, undefined, "Project deleted successfully");
        } catch (error) {
            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }
            return ApiResponse.internalError(res);
        }
    }

    @Routes("get", "/:id/github/:username", authMiddleware)
    async linkGitHubRepositories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id: projectId, username } = req.params;
            const userId = req.user!.id;

            if (!projectId || !username) {
                throw ErrorFactory.missingParameter(["Project ID", "GitHub username"]);
            }

            if (username.length < 1 || username.length > 39) {
                throw ErrorFactory.invalidParameter("username", "must be between 1 and 39 characters");
            }

            const existingProject = await this.projectService.findById(projectId);
            if (!existingProject) {
                throw ErrorFactory.projectNotFound(projectId);
            }

            if (existingProject.userId !== userId) {
                throw ErrorFactory.unauthorized("You don't have permission to modify this project");
            }

            const result = await this.projectService.linkGitHubRepositories(projectId, username);

            return ApiResponse.success(
                res,
                {
                    project: {
                        id: result.project.id,
                        name: result.project.name,
                        description: result.project.description
                    },
                    repositories: result.repositories.map((repo) => ({
                        id: repo.id,
                        githubId: repo.githubId,
                        name: repo.name,
                        fullName: repo.fullName,
                        description: repo.description,
                        htmlUrl: repo.htmlUrl,
                        language: repo.language,
                        stargazers: repo.stargazers,
                        createdAt: repo.createdAt,
                        updatedAt: repo.updatedAt
                    })),
                    githubUser: username
                },
                `Successfully linked ${result.repositories.length} GitHub repositories to project`,
                200,
                {
                    total: result.repositories.length
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }
            return ApiResponse.internalError(res);
        }
    }

    @Routes("delete", "/:id/github", authMiddleware)
    async unlinkGitHubRepositories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id: projectId } = req.params;
            const userId = req.user!.id;

            if (!projectId) {
                throw ErrorFactory.missingParameter("Project ID");
            }

            const existingProject = await this.projectService.findById(projectId);
            if (!existingProject) {
                throw ErrorFactory.projectNotFound(projectId);
            }

            if (existingProject.userId !== userId) {
                throw ErrorFactory.unauthorized("You don't have permission to modify this project");
            }

            await this.projectService.unlinkGitHubRepositories(projectId);

            return ApiResponse.success(res, undefined, "GitHub repositories unlinked successfully");
        } catch (error) {
            if (error instanceof Error) {
                return ErrorHandler.handle(error, res);
            }
            return ApiResponse.internalError(res);
        }
    }
}

export default ProjectController;
