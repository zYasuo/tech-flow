import { GithubRepository, Project } from "../../../models";
import type { IProjectRepository } from "../repositories/interfaces/project-repository.interface";
import { injectable, inject } from "inversify";
import { IProjectService } from "./interfaces/project.interface";
import { TUpdateProject } from "../schemas/update-project.schema";
import { TCreateProject } from "../schemas/create-project.schema";
import type { IGitHubService } from "../../github/services/interfaces/github-services.interface";
import { ErrorFactory } from "../../../common/errors/error-factory";
import { TOKENS } from "../../../common/tokens/service.tokens";

@injectable()
export class ProjectService implements IProjectService {
    constructor(
        @inject(TOKENS.IProjectRepository) private projectRepository: IProjectRepository,
        @inject(TOKENS.IGitHubService) private gitHubService: IGitHubService
    ) {}

    async createProject(data: TCreateProject): Promise<Project> {
        return await this.projectRepository.create(data);
    }

    async findById(projectId: string): Promise<Project | null> {
        return await this.projectRepository.findById(projectId);
    }

    async findByIdWithRepositories(projectId: string): Promise<(Project & { repositories: GithubRepository[] }) | null> {
        return await this.projectRepository.findByIdWithRepositories(projectId);
    }

    async updateProject(projectId: string, data: TUpdateProject): Promise<Project> {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw ErrorFactory.projectNotFound(projectId);
        }

        return await this.projectRepository.update(projectId, data);
    }

    async deleteProject(projectId: string): Promise<void> {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw ErrorFactory.projectNotFound(projectId);
        }

        await this.projectRepository.delete(projectId);
    }

    async linkGitHubRepositories(
        projectId: string,
        username: string
    ): Promise<{
        project: Project;
        repositories: GithubRepository[];
    }> {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw ErrorFactory.projectNotFound(projectId);
        }

        const githubData = await this.gitHubService.fetchUserRepositories(username);

        if (githubData.repositories.length === 0) {
            throw ErrorFactory.githubNoRepositories(username);
        }

        const repositories = await this.projectRepository.linkGitHubRepositories(projectId, githubData.repositories);

        return {
            project,
            repositories
        };
    }

    async unlinkGitHubRepositories(projectId: string): Promise<void> {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw ErrorFactory.projectNotFound(projectId);
        }

        await this.projectRepository.unlinkGitHubRepositories(projectId);
    }
}
