import { Container } from "inversify";
import { AuthService } from "../../../src/modules/auth/services/auth.service";
import { IAuthService } from "../../../src/modules/auth/services/interfaces/auth-service.interface";
import { IUserService } from "../../../src/modules/user/services/interfaces/user-services.interface";
import { IJWTService } from "../../../src/modules/auth/jwt/services/jwt.service";
import { TOKENS } from "../../../src/common/tokens/service.tokens";
import { TUserSignin } from "../../../src/modules/auth/schemas";
import { container as mainContainer } from "../../../src/common/di/inversify.di";
import { TCreateUser } from "../../../src/modules/user/schemas";

describe("AuthService Integration", () => {
    let container: Container;
    let authService: IAuthService;
    let userService: IUserService;
    let jwtService: IJWTService;

    beforeAll(() => {
        container = mainContainer;
        authService = container.get<IAuthService>(TOKENS.IAuthService);
        userService = container.get<IUserService>(TOKENS.IUserService);
        jwtService = container.get<IJWTService>(TOKENS.IJWTService);
    });

    describe("AuthService with real dependencies", () => {
        const testUserData: TCreateUser = {
            name: "Integration Test User",
            email: "integration.test@example.com",
            password: "password123"
        };

        const testSignInData: TUserSignin = {
            email: "integration.test@example.com",
            password: "password123"
        };

        beforeAll(async () => {
            try {
                const existing = await userService.findUserByEmail(testUserData.email);
                if (existing) {
                    await userService.deleteUserById(existing.id);
                }
            } catch (e) {}
        });

        it("should be properly instantiated with dependencies", () => {
            expect(authService).toBeDefined();
            expect(authService).toBeInstanceOf(AuthService);
            expect(userService).toBeDefined();
            expect(jwtService).toBeDefined();
        });

        it("should have all required methods", () => {
            expect(typeof authService.register).toBe("function");
            expect(typeof authService.signIn).toBe("function");
            expect(typeof authService.refreshToken).toBe("function");
        });

        it("should register a new user successfully", async () => {
            const result = await authService.register(testUserData);
            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.tokens).toBeDefined();
            expect(result.user.name).toBe(testUserData.name);
            expect(result.user.email).toBe(testUserData.email);
            expect(result.tokens.accessToken).toBeDefined();
            expect(result.tokens.refreshToken).toBeDefined();
            expect(typeof result.tokens.accessToken).toBe("string");
            expect(typeof result.tokens.refreshToken).toBe("string");
        }, 10000);

        it("should sign in user successfully with valid credentials", async () => {
            const result = await authService.signIn(testSignInData);
            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.tokens).toBeDefined();
            expect(result.user.name).toBe(testUserData.name);
            expect(result.user.email).toBe(testSignInData.email);
            expect(result.tokens.accessToken).toBeDefined();
            expect(result.tokens.refreshToken).toBeDefined();
            expect(typeof result.tokens.accessToken).toBe("string");
            expect(typeof result.tokens.refreshToken).toBe("string");
        }, 10000);

        it("should refresh token successfully", async () => {
            const signInResult = await authService.signIn(testSignInData);
            const refreshToken = signInResult.tokens.refreshToken;
            const result = await authService.refreshToken(refreshToken);
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            expect(result!.accessToken).toBeDefined();
            expect(result!.refreshToken).toBeDefined();
            expect(typeof result!.accessToken).toBe("string");
            expect(typeof result!.refreshToken).toBe("string");
        }, 10000);

        it("should throw error when trying to sign in with invalid credentials", async () => {
            const invalidSignInData: TUserSignin = {
                email: "nonexistent@example.com",
                password: "wrongpassword"
            };
            await expect(authService.signIn(invalidSignInData)).rejects.toThrow();
        }, 10000);

        it("should throw error when trying to refresh with invalid token", async () => {
            const invalidRefreshToken = "invalid-refresh-token";
            await expect(authService.refreshToken(invalidRefreshToken)).rejects.toThrow();
        }, 10000);
    });
});
