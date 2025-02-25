"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth/auth";
import { UserInfoService } from "@/lib/auth/user-info";
import { AUTH_CONFIG } from "@/config/auth";
import type {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
  PasswordResetRequest,
  PasswordResetConfirm,
  AuthServiceOptions,
} from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (
    credentials: LoginCredentials,
    options?: AuthServiceOptions
  ) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (data: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirm) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setUser = (user: User | null) => {
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }));
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!UserInfoService.hasStoredUserInfo()) {
          setUser(null);
          return;
        }
        const user = await AuthService.getCurrentUser();
        setUser(user);
      } catch {
        logout();
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated) return;

    let retryCount = 0;
    const MAX_RETRIES = 2;

    const checkAuthStatus = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setUser(user);
        retryCount = 0;
      } catch {
        retryCount++;

        if (retryCount >= MAX_RETRIES) {
          await logout();
        }
      }
    };

    const interval = setInterval(checkAuthStatus, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials, options?: AuthServiceOptions) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const response = await AuthService.login(credentials, {
          ...options,
          onLoadingChange: (isLoading) => {
            options?.onLoadingChange?.(isLoading);
            setState((prev) => ({ ...prev, isLoading }));
          },
        });

        const userData = response.user || response;

        if (!userData || (!userData.email && !userData.id)) {
          throw new Error("유효하지 않은 사용자 데이터입니다.");
        }

        setUser(userData);

        router.push(AUTH_CONFIG.redirects.afterLogin);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("로그인에 실패했습니다.");
        }
        throw error;
      }
    },
    [router]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const { user } = await AuthService.register(credentials);
        setUser(user);
        router.push(AUTH_CONFIG.redirects.afterRegister);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("회원가입에 실패했습니다.");
        }
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    setUser(null);
    UserInfoService.clearUserInfo();

    try {
      await AuthService.logout();
    } catch {
    } finally {
      router.push(AUTH_CONFIG.redirects.afterLogout);
    }
  }, [router]);

  const requestPasswordReset = useCallback(
    async (data: PasswordResetRequest) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        await AuthService.requestPasswordReset(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("비밀번호 재설정 요청에 실패했습니다.");
        }
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  const confirmPasswordReset = useCallback(
    async (data: PasswordResetConfirm) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        await AuthService.confirmPasswordReset(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("비밀번호 재설정에 실패했습니다.");
        }
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  const value = {
    ...state,
    login,
    register,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
