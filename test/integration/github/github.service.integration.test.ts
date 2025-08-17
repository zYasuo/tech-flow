import { Container } from "inversify";
import { TOKENS } from "../../../src/common/tokens/service.tokens";
import { IGitHubService } from "../../../src/modules/github/services/interfaces/github-services.interface";
import { container as mainContainer } from "../../../src/common/di/inversify.di";

global.fetch = jest.fn();

describe("GitHubService Integration", () => {
    let container: Container;
    let githubService: IGitHubService;

    beforeAll(() => {
        container = mainContainer;
        githubService = container.get<IGitHubService>(TOKENS.IGitHubService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GitHubService with real dependencies", () => {
        it("should be properly instantiated with dependencies", () => {
            expect(githubService).toBeDefined();
        });

        it("should have all required methods", () => {
            expect(typeof githubService.fetchUserRepositories).toBe("function");
        });

        describe("fetchUserRepositories", () => {
            const mockGitHubResponse = [
                {
                    id: 123456789,
                    name: "test-repo",
                    full_name: "testuser/test-repo",
                    description: "A test repository",
                    html_url: "https://github.com/testuser/test-repo",
                    language: "TypeScript",
                    stargazers_count: 42,
                    private: false,
                    created_at: "2023-01-01T00:00:00Z",
                    updated_at: "2023-12-01T00:00:00Z"
                },
                {
                    id: 987654321,
                    name: "private-repo",
                    full_name: "testuser/private-repo",
                    description: "A private repository",
                    html_url: "https://github.com/testuser/private-repo",
                    language: "JavaScript",
                    stargazers_count: 10,
                    private: true,
                    created_at: "2023-02-01T00:00:00Z",
                    updated_at: "2023-11-01T00:00:00Z"
                },
                {
                    id: 555666777,
                    name: "public-repo-2",
                    full_name: "testuser/public-repo-2",
                    description: null,
                    html_url: "https://github.com/testuser/public-repo-2",
                    language: null,
                    stargazers_count: 0,
                    private: false,
                    created_at: "2023-03-01T00:00:00Z",
                    updated_at: "2023-10-01T00:00:00Z"
                }
            ];

            it("should fetch user repositories successfully", async () => {
                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockGitHubResponse
                });

                const result = await githubService.fetchUserRepositories("testuser");

                expect(result).toBeDefined();
                expect(result.repositories).toBeDefined();
                expect(result.total_count).toBe(2);
                expect(result.repositories).toHaveLength(2);

                const firstRepo = result.repositories[0];
                expect(firstRepo.githubId).toBe(123456789);
                expect(firstRepo.name).toBe("test-repo");
                expect(firstRepo.fullName).toBe("testuser/test-repo");
                expect(firstRepo.description).toBe("A test repository");
                expect(firstRepo.htmlUrl).toBe("https://github.com/testuser/test-repo");
                expect(firstRepo.language).toBe("TypeScript");
                expect(firstRepo.stargazers).toBe(42);

                const secondRepo = result.repositories[1];
                expect(secondRepo.githubId).toBe(555666777);
                expect(secondRepo.name).toBe("public-repo-2");
                expect(secondRepo.description).toBeNull();
                expect(secondRepo.language).toBeNull();
                expect(secondRepo.stargazers).toBe(0);

                expect(fetch).toHaveBeenCalledWith("https://api.github.com/users/testuser/repos?sort=updated&direction=desc&per_page=5", {
                    headers: {
                        Accept: "application/vnd.github.v3+json",
                        "User-Agent": "tech-flow"
                    }
                });
            }, 15000);

            it("should filter out private repositories", async () => {
                const mixedRepos = [
                    {
                        id: 1,
                        name: "public-repo",
                        full_name: "testuser/public-repo",
                        description: "Public repository",
                        html_url: "https://github.com/testuser/public-repo",
                        language: "TypeScript",
                        stargazers_count: 10,
                        private: false,
                        created_at: "2023-01-01T00:00:00Z",
                        updated_at: "2023-12-01T00:00:00Z"
                    },
                    {
                        id: 2,
                        name: "private-repo",
                        full_name: "testuser/private-repo",
                        description: "Private repository",
                        html_url: "https://github.com/testuser/private-repo",
                        language: "JavaScript",
                        stargazers_count: 5,
                        private: true,
                        created_at: "2023-01-01T00:00:00Z",
                        updated_at: "2023-12-01T00:00:00Z"
                    }
                ];

                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mixedRepos
                });

                const result = await githubService.fetchUserRepositories("testuser");

                expect(result.total_count).toBe(1);
                expect(result.repositories).toHaveLength(1);
                expect(result.repositories[0].name).toBe("public-repo");
                expect((result.repositories[0] as any).private).toBeUndefined();
            }, 15000);

            it("should handle repositories with null description and language", async () => {
                const reposWithNulls = [
                    {
                        id: 1,
                        name: "no-description-repo",
                        full_name: "testuser/no-description-repo",
                        description: null,
                        html_url: "https://github.com/testuser/no-description-repo",
                        language: null,
                        stargazers_count: 0,
                        private: false,
                        created_at: "2023-01-01T00:00:00Z",
                        updated_at: "2023-12-01T00:00:00Z"
                    }
                ];

                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => reposWithNulls
                });

                const result = await githubService.fetchUserRepositories("testuser");

                expect(result.total_count).toBe(1);
                expect(result.repositories[0].description).toBeNull();
                expect(result.repositories[0].language).toBeNull();
            }, 15000);

            it("should throw error when GitHub user not found (404)", async () => {
                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                    statusText: "Not Found"
                });

                await expect(githubService.fetchUserRepositories("nonexistentuser")).rejects.toThrow("GitHub user 'nonexistentuser' not found");
            }, 15000);

            it("should throw error when GitHub API rate limit exceeded (403)", async () => {
                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    status: 403,
                    statusText: "Forbidden"
                });

                await expect(githubService.fetchUserRepositories("testuser")).rejects.toThrow("GitHub API rate limit exceeded");
            }, 15000);

            it("should throw error for other GitHub API errors", async () => {
                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    statusText: "Internal Server Error"
                });

                await expect(githubService.fetchUserRepositories("testuser")).rejects.toThrow("GitHub service temporarily unavailable");
            }, 15000);

            it("should handle network errors gracefully", async () => {
                (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

                await expect(githubService.fetchUserRepositories("testuser")).rejects.toThrow("Network error");
            }, 15000);

            it("should limit repositories to configured limit", async () => {
                const manyRepos = Array.from({ length: 50 }, (_, i) => ({
                    id: i + 1,
                    name: `repo-${i}`,
                    full_name: `testuser/repo-${i}`,
                    description: `Repository ${i}`,
                    html_url: `https://github.com/testuser/repo-${i}`,
                    language: "TypeScript",
                    stargazers_count: i,
                    private: false,
                    created_at: "2023-01-01T00:00:00Z",
                    updated_at: "2023-12-01T00:00:00Z"
                }));

                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => manyRepos
                });

                const result = await githubService.fetchUserRepositories("testuser");

                expect(result.total_count).toBe(5);
                expect(result.repositories).toHaveLength(5);
            }, 15000);

            it("should handle empty repository list", async () => {
                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => []
                });

                const result = await githubService.fetchUserRepositories("testuser");

                expect(result.total_count).toBe(0);
                expect(result.repositories).toHaveLength(0);
                expect(Array.isArray(result.repositories)).toBe(true);
            }, 15000);

            it("should handle user with only private repositories", async () => {
                const onlyPrivateRepos = [
                    {
                        id: 1,
                        name: "private-repo-1",
                        full_name: "testuser/private-repo-1",
                        description: "Private repository 1",
                        html_url: "https://github.com/testuser/private-repo-1",
                        language: "TypeScript",
                        stargazers_count: 10,
                        private: true,
                        created_at: "2023-01-01T00:00:00Z",
                        updated_at: "2023-12-01T00:00:00Z"
                    },
                    {
                        id: 2,
                        name: "private-repo-2",
                        full_name: "testuser/private-repo-2",
                        description: "Private repository 2",
                        html_url: "https://github.com/testuser/private-repo-2",
                        language: "JavaScript",
                        stargazers_count: 5,
                        private: true,
                        created_at: "2023-01-01T00:00:00Z",
                        updated_at: "2023-12-01T00:00:00Z"
                    }
                ];

                (fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => onlyPrivateRepos
                });

                const result = await githubService.fetchUserRepositories("testuser");

                expect(result.total_count).toBe(0);
                expect(result.repositories).toHaveLength(0);
            }, 15000);

            it("should handle different users with separate API calls", async () => {
                const mockResponse = [
                    {
                        id: 1,
                        name: "test-repo",
                        full_name: "testuser/test-repo",
                        description: "Test repository",
                        html_url: "https://github.com/testuser/test-repo",
                        language: "TypeScript",
                        stargazers_count: 10,
                        private: false,
                        created_at: "2023-01-01T00:00:00Z",
                        updated_at: "2023-12-01T00:00:00Z"
                    }
                ];

                (fetch as jest.Mock)
                    .mockResolvedValueOnce({
                        ok: true,
                        status: 200,
                        json: async () => mockResponse
                    })
                    .mockResolvedValueOnce({
                        ok: true,
                        status: 200,
                        json: async () => mockResponse
                    });

                await githubService.fetchUserRepositories("user1");
                await githubService.fetchUserRepositories("user2");

                expect(fetch).toHaveBeenCalledTimes(2);

                expect(fetch).toHaveBeenNthCalledWith(
                    1,
                    "https://api.github.com/users/user1/repos?sort=updated&direction=desc&per_page=5",
                    expect.any(Object)
                );
                expect(fetch).toHaveBeenNthCalledWith(
                    2,
                    "https://api.github.com/users/user2/repos?sort=updated&direction=desc&per_page=5",
                    expect.any(Object)
                );
            }, 15000);
        });
    });
});
