import axios from "@/lib/axios";
import { AUTH_CONFIG } from "@/config/auth";
import { UserInfoService } from "./user-info";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  PasswordResetRequest,
  PasswordResetConfirm,
  AuthServiceOptions,
} from "@/types/auth";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const AuthService = {
  async login(
    credentials: LoginCredentials,
    options?: AuthServiceOptions
  ): Promise<AuthResponse> {
    try {
      options?.onLoadingChange?.(true);
      const response = await axios.post<AuthResponse>(
        AUTH_CONFIG.endpoints.login,
        credentials
      );
      
      const userInfo = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      UserInfoService.storeUserInfo(userInfo);
      options?.onLoadingChange?.(false);
      return response.data;
    } catch (error) {
      options?.onLoadingChange?.(false);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("로그인에 실패했습니다.");
      }
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        AUTH_CONFIG.endpoints.register,
        credentials
      );
      const userInfo = typeof response.data.user === 'string'
        ? response.data.user
        : JSON.stringify(response.data.user);
      UserInfoService.storeUserInfo(userInfo);
      return response.data;
    } catch {
      throw new AuthError("회원가입에 실패했습니다.");
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(AUTH_CONFIG.endpoints.logout);
    } catch {
    } finally {
      UserInfoService.clearUserInfo();
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get<User>(AUTH_CONFIG.endpoints.me);
      UserInfoService.storeUserInfo(JSON.stringify(response.data));
      return response.data;
    } catch {
      throw new AuthError("사용자 정보를 가져오는데 실패했습니다.");
    }
  },

  async updatePassword(confirmCurrentPassword: string, newPassword: string): Promise<void> {
    try {
      await axios.put(AUTH_CONFIG.endpoints.updatePassword, {
        confirm_password: confirmCurrentPassword,
        password: newPassword,
      });
    } catch {
      throw new AuthError("비밀번호 변경에 실패했습니다.");
    }
  },

  async refreshToken(): Promise<void> {
    try {
      const response = await axios.post<{ user: User }>(
        AUTH_CONFIG.endpoints.refresh
      );
      UserInfoService.storeUserInfo(JSON.stringify(response.data.user));
    } catch {
      UserInfoService.clearUserInfo();
      throw new AuthError("토큰 갱신에 실패했습니다.");
    }
  },

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    try {
      await axios.post(AUTH_CONFIG.endpoints.passwordReset, data);
    } catch {
      throw new AuthError("비밀번호 재설정 요청에 실패했습니다.");
    }
  },

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    try {
      await axios.post(AUTH_CONFIG.endpoints.passwordResetConfirm, data);
    } catch {
      throw new AuthError("비밀번호 재설정에 실패했습니다.");
    }
  },
}; 