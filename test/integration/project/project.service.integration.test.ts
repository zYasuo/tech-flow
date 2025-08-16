import { Container } from "inversify";
import { TOKENS } from "../../../src/common/tokens/service.tokens";
import { IProjectService } from "../../../src/modules/projects/services/interfaces/project.interface";
import { TCreateProject } from "../../../src/modules/projects/schemas/create-project.schema";
import { TUpdateProject } from "../../../src/modules/projects/schemas/update-project.schema";
import { container as mainContainer } from "../../../src/common/di/inversify.di";
import { IUserService } from "../../../src/modules/user/services/interfaces/user-services.interface";
import { TCreateUser } from "../../../src/modules/user/schemas";

describe("ProjectService Integration", () => {
    let container: Container;
    let projectService: IProjectService;
    let userService: IUserService;
    let createdProjectId: string;
    let testUserId: string;

    beforeAll(async () => {
        container = mainContainer;
        projectService = container.get<IProjectService>(TOKENS.IProjectService);
        userService = container.get<IUserService>(TOKENS.IUserService);

        const userData: TCreateUser = {
            name: "Project Test User",
            email: `project.test.${Date.now()}@example.com`,
            password: "testpassword"
        };
        const user = await userService.createUser(userData);
        testUserId = user.id;
    });

    it("should create a new project", async () => {
        const data: TCreateProject = {
            name: "Projeto Integração",
            description: "Projeto criado pelo teste de integração",
            userId: testUserId
        };
        const project = await projectService.createProject(data);
        expect(project).toBeDefined();
        expect(project.id).toBeDefined();
        expect(project.name).toBe(data.name);
        expect(project.description).toBe(data.description);
        createdProjectId = project.id;
    });

    it("should find a project by id", async () => {
        const project = await projectService.findById(createdProjectId);
        expect(project).toBeDefined();
        expect(project!.id).toBe(createdProjectId);
    });

    it("should update a project", async () => {
        // Verificar se o projeto existe antes de atualizar
        const existingProject = await projectService.findById(createdProjectId);
        expect(existingProject).toBeDefined();
        expect(existingProject!.id).toBe(createdProjectId);

        const update: TUpdateProject = {
            name: "Projeto Atualizado",
            description: "Descrição atualizada"
        };
        const project = await projectService.updateProject(createdProjectId, update);
        expect(project).toBeDefined();
        expect(project.name).toBe(update.name);
        expect(project.description).toBe(update.description);
    });

    it("should find project with repositories (even if empty)", async () => {
        const project = await projectService.findByIdWithRepositories(createdProjectId);
        expect(project).toBeDefined();
        expect(project!.id).toBe(createdProjectId);
        expect(Array.isArray((project as any).repositories)).toBe(true);
    });

    it("should throw error when updating non-existent project", async () => {
        await expect(
            projectService.updateProject("non-existent-id", { name: "X", description: "Y" })
        ).rejects.toThrow();
    });

    it("should throw error when deleting non-existent project", async () => {
        await expect(
            projectService.deleteProject("non-existent-id")
        ).rejects.toThrow();
    });

    it("should delete a project", async () => {
        await expect(projectService.deleteProject(createdProjectId)).resolves.toBeUndefined();
        const project = await projectService.findById(createdProjectId);
        expect(project).toBeNull();
    });
});
