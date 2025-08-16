import { IGitHubRepositoryProcessed } from "../../github/services/interfaces/github-services.interface";
import { IProjectRepository } from "./interfaces/project-repository.interface";
import { GithubRepository } from "../../../data/models";
import { TCreateProject } from "../schemas";
import { ErrorFactory } from "../../../common/errors/error-factory";
import { injectable } from "inversify";
import { Project } from "../../../data/models";

@injectable()
export class ProjectRepository implements IProjectRepository {
    async create(data: TCreateProject): Promise<Project> {
        try {
            return await Project.create({
                name: data.name,
                description: data.description,
                userId: data.userId
            });
        } catch (error) {
            throw ErrorFactory.databaseError("create project", { name: data.name, originalError: error });
        }
    }

    async findById(id: string): Promise<Project | null> {
        try {
            return await Project.findByPk(id);
        } catch (error) {
            throw ErrorFactory.databaseError("find project by id", { id, originalError: error });
        }
    }

    async findByUserId(userId: string): Promise<Project[]> {
        try {
            return await Project.findAll({
                where: { userId },
                include: [
                    {
                        model: GithubRepository,
                        as: "repositories"
                    }
                ],
                order: [["createdAt", "DESC"]]
            });
        } catch (error) {
            throw ErrorFactory.databaseError("find projects by user id", { userId, originalError: error });
        }
    }

    async findByIdWithRepositories(id: string): Promise<Project | null> {
        try {
            return await Project.findByPk(id, {
                include: [
                    {
                        model: GithubRepository,
                        as: "repositories"
                    }
                ]
            });
        } catch (error) {
            throw ErrorFactory.databaseError("find project with repositories", { id, originalError: error });
        }
    }

    async update(id: string, data: Partial<Project>): Promise<Project> {
        try {
            const updateData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined));

            const [affectedRows] = await Project.update(
                {
                    ...updateData,
                    updatedAt: new Date()
                },
                {
                    where: { id }
                }
            );

            if (affectedRows === 0) {
                throw ErrorFactory.projectNotFound(id);
            }

            const updatedProject = await Project.findByPk(id);
            if (!updatedProject) throw ErrorFactory.projectNotFound(id);

            return updatedProject;
        } catch (error) {
            throw ErrorFactory.databaseError("update project", { id, originalError: error });
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const deletedRows = await Project.destroy({
                where: { id }
            });

            if (deletedRows === 0) {
                throw ErrorFactory.projectNotFound(id);
            }
        } catch (error) {
            throw ErrorFactory.databaseError("delete project", { id, originalError: error });
        }
    }

    async linkGitHubRepositories(projectId: string, repositories: IGitHubRepositoryProcessed[]): Promise<GithubRepository[]> {
        try {
            await GithubRepository.destroy({
                where: { projectId }
            });

            const createdRepositories = await GithubRepository.bulkCreate(
                repositories.map((repo) => ({
                    githubId: repo.githubId,
                    name: repo.name,
                    fullName: repo.fullName,
                    description: repo.description,
                    htmlUrl: repo.htmlUrl,
                    language: repo.language,
                    stargazers: repo.stargazers,
                    projectId
                }))
            );

            return createdRepositories;
        } catch (error) {
            throw ErrorFactory.databaseError("link GitHub repositories", { projectId, originalError: error });
        }
    }

    async unlinkGitHubRepositories(projectId: string): Promise<void> {
        try {
            await GithubRepository.destroy({
                where: { projectId }
            });
        } catch (error) {
            throw ErrorFactory.databaseError("unlink GitHub repositories", { projectId, originalError: error });
        }
    }

    async saveGitHubRepositories(projectId: string, repositories: IGitHubRepositoryProcessed[]): Promise<GithubRepository[]> {
        return await this.linkGitHubRepositories(projectId, repositories);
    }

    async removeAllGitHubRepositories(projectId: string): Promise<void> {
        return await this.unlinkGitHubRepositories(projectId);
    }
}
