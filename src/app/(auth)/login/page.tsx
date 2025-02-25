"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
import { NavigationBar } from "@/components/navigation-bar";
import api from "@/lib/axios";
import type { AxiosError } from "axios";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface ApiError {
  message?: string;
  detail?: string[];
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);

  const validateEmail = (email: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setIsValidEmail(isValid);
    return isValid;
  };

  const checkUserExists = async (email: string) => {
    if (!email || !validateEmail(email)) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ exists: boolean }>(
        "/users/check-user/",
        { email }
      );
      setUserExists(response.data.exists);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.detail?.[0] ||
          axiosError.response?.data?.message ||
          "이메일 확인 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handleEmailSubmit = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!isValidEmail) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    await checkUserExists(email);
  };

  const handleSignup = async () => {
    if (!email || !username || !password || !confirmPassword) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        email,
        username,
        password,
      });
      setSignupComplete(true);
      setUserExists(true);
      setPassword("");
      setConfirmPassword("");
      setUsername("");
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.detail?.[0] ||
          axiosError.response?.data?.message ||
          "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (!isValidEmail) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setError(null);

    try {
      await login(
        { email, password },
        {
          onLoadingChange: setIsLoading,
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const handleButtonClick = async () => {
    if (userExists === null) {
      await handleEmailSubmit();
    } else if (!userExists) {
      await handleSignup();
    } else {
      await handleLogin();
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="w-full bg-background dark:bg-background flex flex-col">
        <NavigationBar />
        <main className="flex-1 flex flex-col items-center justify-start px-4 md:pt-[120px] pt-[200px] pb-[200px]">
          <div className="w-full max-w-[320px] space-y-8">
            <h1 className="text-2xl font-bold text-center text-foreground/80 dark:text-foreground/80">
              {signupComplete
                ? "가입 완료!"
                : userExists === false
                ? "회원가입"
                : "로그인"}
            </h1>

            <div className="space-y-6">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={signupComplete}
                  className="w-full px-4 py-6 rounded-full border-[#4a6572] dark:border-border/50 bg-transparent text-lg transition-colors"
                />
                {isLoading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary/50 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-red-500/80 text-sm text-center">{error}</p>
              )}

              {userExists !== null && (
                <div className="space-y-4">
                  {!userExists && (
                    <Input
                      type="text"
                      placeholder="이름"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-6 rounded-full border-[#4a6572] dark:border-border/50 bg-transparent text-lg shadow-custom hover:border-border/80 dark:hover:border-border/80 transition-colors"
                    />
                  )}
                  <Input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-6 rounded-full border-[#4a6572] dark:border-border/50 bg-transparent text-lg shadow-custom hover:border-border/80 dark:hover:border-border/80 transition-colors"
                  />
                  {!userExists && (
                    <Input
                      type="password"
                      placeholder="비밀번호 확인"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-6 rounded-full border-[#4a6572] dark:border-border/50 bg-transparent text-lg shadow-custom hover:border-border/80 dark:hover:border-border/80 transition-colors"
                    />
                  )}
                </div>
              )}

              <Button
                onClick={handleButtonClick}
                disabled={isLoading}
                className="w-full py-6 rounded-full border dark:border-border/50 bg-foreground hover:bg-[#e5e5ea]/45 dark:hover:bg-[#3a3a3c]/45 text-foreground/80 dark:text-foreground/80 font-medium text-base shadow-custom transition-colors duration-200 text-[#fffafa]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-foreground/50 border-t-transparent rounded-full animate-spin"></div>
                ) : userExists === null ? (
                  "계속하기"
                ) : !userExists ? (
                  "회원가입"
                ) : (
                  "로그인"
                )}
              </Button>

              {userExists && (
                <Button
                  variant="link"
                  className="w-full text-sm text-foreground/60 hover:text-foreground/80 dark:text-foreground/60 dark:hover:text-foreground/80 transition-colors"
                  onClick={() => (window.location.href = "/reset-password")}
                >
                  비밀번호를 잊으셨나요?
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
