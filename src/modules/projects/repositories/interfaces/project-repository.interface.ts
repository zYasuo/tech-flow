import { GithubRepository, Project } from "../../../../models";
import { IGitHubRepositoryProcessed } from "../../../github/services/interfaces/github-services.interface";
import { TCreateProject } from "../../schemas";

export interface IProjectRepository {
    create(data: TCreateProject): Promise<Project>;

    findById(id: string): Promise<Project | null>;

    findByUserId(userId: string): Promise<(Project & { repositories: GithubRepository[] })[]>;

    findByIdWithRepositories(id: string): Promise<(Project & { repositories: GithubRepository[] }) | null>;

    update(id: string, data: Partial<Project>): Promise<Project>;

    delete(id: string): Promise<void>;

    linkGitHubRepositories(projectId: string, repositories: IGitHubRepositoryProcessed[]): Promise<GithubRepository[]>;

    unlinkGitHubRepositories(projectId: string): Promise<void>;

    saveGitHubRepositories(projectId: string, repositories: IGitHubRepositoryProcessed[]): Promise<GithubRepository[]>;

    removeAllGitHubRepositories(projectId: string): Promise<void>;
}
