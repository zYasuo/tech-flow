export interface IGitHubRepositoryResponse {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    private: boolean;
    created_at: string;
    updated_at: string;
}

export interface IGitHubRepositoryProcessed {
    githubId: number;
    name: string;
    fullName: string;
    description: string | null;
    htmlUrl: string;
    language: string | null;
    stargazers: number;
}

export interface IGitHubApiResponse {
    repositories: IGitHubRepositoryProcessed[];
    total_count: number;
}

export interface IGitHubService {
    fetchUserRepositories(username: string): Promise<IGitHubApiResponse>;
}
