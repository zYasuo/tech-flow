import { IGitHubApiResponse, IGitHubRepositoryResponse, IGitHubService } from "./interfaces/github-services.interface";
import { injectable, inject } from "inversify";
import { ICacheService } from "../../cache/services/interfaces/redis-services.interface";
import { TOKENS } from "../../../common/tokens/service.tokens";
import { SERVER } from "../../../config/config";
import { ErrorFactory } from "../../../common/errors/error-factory";

@injectable()
export class GitHubService implements IGitHubService {
    private readonly BASE_URL = SERVER.GIT_HUB_CONFIG.BASE_URL;
    private readonly RECENT_REPOS_LIMIT = SERVER.GIT_HUB_CONFIG.PER_PAGE;
    private readonly CACHE_TTL = SERVER.CACHE_CONFIG.TTL.GITHUB_REPOS;

    constructor(@inject(TOKENS.ICacheService) private cacheService: ICacheService) {}

    async fetchUserRepositories(username: string): Promise<IGitHubApiResponse> {
        const cacheKey = SERVER.CACHE_CONFIG.KEYS.GITHUB_REPOS(username);

        const cachedResult = await this.cacheService.get<IGitHubApiResponse>(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        try {
            const response = await fetch(`${this.BASE_URL}/users/${username}/repos?sort=updated&direction=desc&per_page=${this.RECENT_REPOS_LIMIT}`, {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "tech-flow"
                }
            });

            if (!response.ok) {
                switch (response.status) {
                    case 404:
                        throw ErrorFactory.githubUserNotFound(`GitHub user '${username}' not found`);
                    case 403:
                        throw ErrorFactory.githubApiRateLimitExceeded();
                    default:
                        throw ErrorFactory.githubApiError(response.status, response.statusText);
                }
            }

            const githubRepositories: IGitHubRepositoryResponse[] = await response.json();

            const publicRepositories = githubRepositories
                .filter((repo) => !repo.private)
                .map((repo) => ({
                    githubId: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    htmlUrl: repo.html_url,
                    language: repo.language,
                    stargazers: repo.stargazers_count
                }))
                .slice(0, this.RECENT_REPOS_LIMIT);

            const result: IGitHubApiResponse = {
                repositories: publicRepositories,
                total_count: publicRepositories.length
            };

            await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to fetch repositories from GitHub");
        }
    }
}
