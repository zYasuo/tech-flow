import { Container } from "inversify";
import { TOKENS } from "../../../src/common/tokens/service.tokens";
import { ITaskService } from "../../../src/modules/task/services/interfaces/task-service.interface";
import { IProjectService } from "../../../src/modules/projects/services/interfaces/project.interface";
import { IUserService } from "../../../src/modules/user/services/interfaces/user-services.interface";
import { TCreateUser } from "../../../src/modules/user/schemas";
import { TCreateProject } from "../../../src/modules/projects/schemas/create-project.schema";
import { TUpdateTask } from "../../../src/modules/task/schemas";
import { container as mainContainer } from "../../../src/common/di/inversify.di";

describe("TaskService Integration", () => {
    let container: Container;
    let taskService: ITaskService;
    let projectService: IProjectService;
    let userService: IUserService;
    let testUserId: string;
    let testProjectId: string;
    let createdTaskId: string;

    beforeAll(async () => {
        container = mainContainer;
        taskService = container.get<ITaskService>(TOKENS.ITaskService);
        projectService = container.get<IProjectService>(TOKENS.IProjectService);
        userService = container.get<IUserService>(TOKENS.IUserService);

        const userData: TCreateUser = {
            name: "Task Test User",
            email: `task.test.${Date.now()}@example.com`,
            password: "testpassword"
        };
        const user = await userService.createUser(userData);
        testUserId = user.id;

        const projectData: TCreateProject = {
            name: "Task Test Project",
            description: "Project for task integration tests",
            userId: testUserId
        };
        const project = await projectService.createProject(projectData);
        testProjectId = project.id;
    });

    afterAll(async () => {
        try {
            if (testProjectId) {
                await projectService.deleteProject(testProjectId);
            }
            if (testUserId) {
                await userService.deleteUserById(testUserId);
            }
        } catch (error) {
            console.error("Cleanup error:", error);
        }
    });

    describe("TaskService with real dependencies", () => {
        it("should be properly instantiated with dependencies", () => {
            expect(taskService).toBeDefined();
            expect(projectService).toBeDefined();
            expect(userService).toBeDefined();
        });

        it("should have all required methods", () => {
            expect(typeof taskService.createTask).toBe("function");
            expect(typeof taskService.getTasksByProject).toBe("function");
            expect(typeof taskService.getTaskById).toBe("function");
            expect(typeof taskService.updateTask).toBe("function");
            expect(typeof taskService.deleteTask).toBe("function");
        });

        describe("createTask", () => {
            it("should create a new task successfully", async () => {
                const taskData = {
                    title: "Test Task",
                    description: "This is a test task",
                    priority: "HIGH" as const,
                    projectId: testProjectId
                };

                const task = await taskService.createTask(taskData, testUserId);

                expect(task).toBeDefined();
                expect(task.id).toBeDefined();
                expect(task.title).toBe(taskData.title);
                expect(task.description).toBe(taskData.description);
                expect(task.priority).toBe(taskData.priority);
                expect(task.status).toBe("PENDING");
                expect(task.projectId).toBe(testProjectId);
                expect(task.userId).toBe(testUserId);
                expect(task.createdAt).toBeDefined();
                expect(task.updatedAt).toBeDefined();

                createdTaskId = task.id;
            }, 10000);

            it("should create a task with minimal data", async () => {
                const taskData = {
                    title: "Minimal Task",
                    projectId: testProjectId,
                    priority: "MEDIUM" as const
                };

                const task = await taskService.createTask(taskData, testUserId);

                expect(task).toBeDefined();
                expect(task.title).toBe(taskData.title);
                expect(task.description).toBeUndefined();
                expect(task.priority).toBe("MEDIUM");
                expect(task.status).toBe("PENDING");
            }, 10000);

            it("should throw error when project does not exist", async () => {
                const taskData = {
                    title: "Test Task",
                    projectId: "non-existent-project-id",
                    priority: "MEDIUM" as const
                };

                await expect(taskService.createTask(taskData, testUserId)).rejects.toThrow("Project with id 'non-existent-project-id' not found");
            }, 10000);

            it("should throw error when user does not own the project", async () => {
                const anotherUserData: TCreateUser = {
                    name: "Another User",
                    email: `another.user.${Date.now()}@example.com`,
                    password: "testpassword"
                };
                const anotherUser = await userService.createUser(anotherUserData);

                const taskData = {
                    title: "Test Task",
                    projectId: testProjectId,
                    priority: "MEDIUM" as const
                };

                await expect(taskService.createTask(taskData, anotherUser.id)).rejects.toThrow(
                    "You don't have permission to create tasks in this project"
                );

                await userService.deleteUserById(anotherUser.id);
            }, 10000);
        });

        describe("getTasksByProject", () => {
            it("should get tasks by project successfully", async () => {
                const tasks = await taskService.getTasksByProject(testProjectId, testUserId);

                expect(Array.isArray(tasks)).toBe(true);
                expect(tasks.length).toBeGreaterThan(0);

                const task = tasks.find((t) => t.id === createdTaskId);
                expect(task).toBeDefined();
                expect(task!.projectId).toBe(testProjectId);
            }, 10000);

            it("should return empty array for project with no tasks", async () => {
                const emptyProjectData: TCreateProject = {
                    name: "Empty Project",
                    description: "Project with no tasks",
                    userId: testUserId
                };
                const emptyProject = await projectService.createProject(emptyProjectData);

                const tasks = await taskService.getTasksByProject(emptyProject.id, testUserId);

                expect(Array.isArray(tasks)).toBe(true);
                expect(tasks.length).toBe(0);

                await projectService.deleteProject(emptyProject.id);
            }, 10000);

            it("should throw error when project does not exist", async () => {
                await expect(taskService.getTasksByProject("non-existent-project-id", testUserId)).rejects.toThrow(
                    "Project with id 'non-existent-project-id' not found"
                );
            }, 10000);

            it("should throw error when user does not own the project", async () => {
                const anotherUserData: TCreateUser = {
                    name: "Another User",
                    email: `another.user.${Date.now()}@example.com`,
                    password: "testpassword"
                };
                const anotherUser = await userService.createUser(anotherUserData);

                await expect(taskService.getTasksByProject(testProjectId, anotherUser.id)).rejects.toThrow(
                    "You don't have permission to view tasks in this project"
                );

                await userService.deleteUserById(anotherUser.id);
            }, 10000);
        });

        describe("getTaskById", () => {
            it("should get task by id successfully", async () => {
                const task = await taskService.getTaskById(createdTaskId, testUserId);

                expect(task).toBeDefined();
                expect(task.id).toBe(createdTaskId);
                expect(task.title).toBe("Test Task");
                expect(task.projectId).toBe(testProjectId);
                expect(task.userId).toBe(testUserId);
            }, 10000);

            it("should throw error when task does not exist", async () => {
                await expect(taskService.getTaskById("non-existent-task-id", testUserId)).rejects.toThrow(
                    "Task with id 'non-existent-task-id' not found"
                );
            }, 10000);

            it("should throw error when user does not own the task", async () => {
                const anotherUserData: TCreateUser = {
                    name: "Another User",
                    email: `another.user.${Date.now()}@example.com`,
                    password: "testpassword"
                };
                const anotherUser = await userService.createUser(anotherUserData);

                await expect(taskService.getTaskById(createdTaskId, anotherUser.id)).rejects.toThrow("You don't have permission to view this task");

                await userService.deleteUserById(anotherUser.id);
            }, 10000);
        });

        describe("updateTask", () => {
            it("should update task successfully", async () => {
                const updateData: TUpdateTask = {
                    title: "Updated Task Title",
                    description: "Updated description",
                    status: "IN_PROGRESS",
                    priority: "URGENT"
                };

                const updatedTask = await taskService.updateTask(createdTaskId, updateData, testUserId);

                expect(updatedTask).toBeDefined();
                expect(updatedTask.id).toBe(createdTaskId);
                expect(updatedTask.title).toBe(updateData.title);
                expect(updatedTask.description).toBe(updateData.description);
                expect(updatedTask.status).toBe(updateData.status);
                expect(updatedTask.priority).toBe(updateData.priority);
            }, 10000);

            it("should update task with partial data", async () => {
                const originalTask = await taskService.getTaskById(createdTaskId, testUserId);
                const updateData: TUpdateTask = {
                    status: "COMPLETED"
                };

                const updatedTask = await taskService.updateTask(createdTaskId, updateData, testUserId);

                expect(updatedTask).toBeDefined();
                expect(updatedTask.id).toBe(createdTaskId);
                expect(updatedTask.title).toBe(originalTask.title);
                expect(updatedTask.description).toBe(originalTask.description);
                expect(updatedTask.status).toBe(updateData.status);
                expect(updatedTask.priority).toBe(originalTask.priority);
            }, 10000);

            it("should throw error when task does not exist", async () => {
                const updateData: TUpdateTask = {
                    title: "Updated Title"
                };

                await expect(taskService.updateTask("non-existent-task-id", updateData, testUserId)).rejects.toThrow(
                    "Task with id 'non-existent-task-id' not found"
                );
            }, 10000);

            it("should throw error when user does not own the task", async () => {
                const anotherUserData: TCreateUser = {
                    name: "Another User",
                    email: `another.user.${Date.now()}@example.com`,
                    password: "testpassword"
                };
                const anotherUser = await userService.createUser(anotherUserData);

                const updateData: TUpdateTask = {
                    title: "Updated Title"
                };

                await expect(taskService.updateTask(createdTaskId, updateData, anotherUser.id)).rejects.toThrow(
                    "You don't have permission to update this task"
                );

                await userService.deleteUserById(anotherUser.id);
            }, 10000);
        });

        describe("deleteTask", () => {
            it("should delete task successfully", async () => {
                const taskData = {
                    title: "Task to Delete",
                    projectId: testProjectId,
                    priority: "MEDIUM" as const
                };
                const taskToDelete = await taskService.createTask(taskData, testUserId);

                await expect(taskService.deleteTask(taskToDelete.id, testUserId)).resolves.toBeUndefined();

                await expect(taskService.getTaskById(taskToDelete.id, testUserId)).rejects.toThrow(`Task with id '${taskToDelete.id}' not found`);
            }, 10000);

            it("should throw error when task does not exist", async () => {
                await expect(taskService.deleteTask("non-existent-task-id", testUserId)).rejects.toThrow(
                    "Task with id 'non-existent-task-id' not found"
                );
            }, 10000);

            it("should throw error when user does not own the task", async () => {
                const anotherUserData: TCreateUser = {
                    name: "Another User",
                    email: `another.user.${Date.now()}@example.com`,
                    password: "testpassword"
                };
                const anotherUser = await userService.createUser(anotherUserData);

                await expect(taskService.deleteTask(createdTaskId, anotherUser.id)).rejects.toThrow("You don't have permission to delete this task");

                await userService.deleteUserById(anotherUser.id);
            }, 10000);
        });

        describe("Task lifecycle", () => {
            it("should handle complete task lifecycle", async () => {
                const taskData = {
                    title: "Lifecycle Test Task",
                    description: "Testing complete lifecycle",
                    priority: "MEDIUM" as const,
                    projectId: testProjectId
                };
                const task = await taskService.createTask(taskData, testUserId);
                expect(task.status).toBe("PENDING");

                const update1: TUpdateTask = { status: "IN_PROGRESS" };
                const updatedTask1 = await taskService.updateTask(task.id, update1, testUserId);
                expect(updatedTask1.status).toBe("IN_PROGRESS");

                const update2: TUpdateTask = { status: "COMPLETED" };
                const updatedTask2 = await taskService.updateTask(task.id, update2, testUserId);
                expect(updatedTask2.status).toBe("COMPLETED");

                const retrievedTask = await taskService.getTaskById(task.id, testUserId);
                expect(retrievedTask.status).toBe("COMPLETED");

                await taskService.deleteTask(task.id, testUserId);

                await expect(taskService.getTaskById(task.id, testUserId)).rejects.toThrow(`Task with id '${task.id}' not found`);
            }, 15000);
        });
    });
});
