"use client";

import { NavigationBar } from "@/components/navigation-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ApiError {
  message?: string;
  detail?: string[];
}

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);

  const validateEmail = (email: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setIsValidEmail(isValid);
    return isValid;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handleSubmit = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!isValidEmail) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.post("/users/password/reset/verify/", { email });
      setIsEmailSent(true);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.detail?.[0] ||
          axiosError.response?.data?.message ||
          "비밀번호 재설정 이메일 전송 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <ProtectedRoute requireAuth={false}>
        <div className="min-h-screen bg-background">
          <NavigationBar />
          <main className="container mx-auto bg-background pt-[120px] px-4">
            <Card className="max-w-md mx-auto bg-background shadow-custom">
              <CardHeader>
                <CardTitle>이메일 전송 완료</CardTitle>
                <CardDescription>
                  비밀번호 재설정 링크가 이메일로 전송되었습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  {email} 주소로 전송된 이메일을 확인해 주세요. 메일이 도착하지
                  않은 경우 스팸함을 확인해 주시기 바랍니다.
                </p>
                <Button
                  className="w-full"
                  onClick={() => (window.location.href = "/login")}
                >
                  로그인 페이지로 돌아가기
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main className="container mx-auto bg-background pt-[120px] px-4">
          <Card className="max-w-md mx-auto bg-background shadow-custom">
            <CardHeader>
              <CardTitle>비밀번호 재설정</CardTitle>
              <CardDescription>
                가입하신 이메일 주소로 비밀번호 재설정 링크를 보내드립니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="이메일 주소"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full px-4 py-6 rounded-full dark:border-border bg-transparent text-lg shadow-custom"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-6 rounded-full border dark:border-border bg-transparent hover:bg-[#e5e5ea]/45 dark:hover:bg-[#3a3a3c]/45 text-foreground dark:text-foreground font-medium text-base shadow-custom transition-colors duration-200"
              >
                {isLoading ? "전송 중..." : "재설정 링크 전송"}
              </Button>

              <Button
                variant="link"
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => (window.location.href = "/login")}
              >
                로그인 페이지로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
