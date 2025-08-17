import { GithubRepository, Project } from "../../../../models";
import { TCreateProject } from "../../schemas/create-project.schema";
import { TUpdateProject } from "../../schemas/update-project.schema";

export interface IProjectService {
    createProject(data: TCreateProject): Promise<Project>;

    findById(projectId: string): Promise<Project | null>;

    findByIdWithRepositories(projectId: string): Promise<(Project & { repositories: GithubRepository[] }) | null>;

    updateProject(projectId: string, data: TUpdateProject): Promise<Project>;

    deleteProject(projectId: string): Promise<void>;

    linkGitHubRepositories(
        projectId: string,
        username: string
    ): Promise<{
        project: Project;
        repositories: GithubRepository[];
    }>;

    unlinkGitHubRepositories(projectId: string): Promise<void>;
}
