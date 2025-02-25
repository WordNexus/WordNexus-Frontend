"use client";

import { NavigationBar } from "@/components/navigation-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

export default function ResetPasswordConfirm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordConfirmContent />
    </Suspense>
  );
}

function ResetPasswordConfirmContent() {
  const searchParams = useSearchParams();
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    validateResetLink();
  }, []);

  const validateResetLink = async () => {
    try {
      const token = searchParams.get("token");
      const uidb64 = searchParams.get("uidb64");
      await api.get(
        `/users/password/reset/validate/?uidb64=${uidb64}&token=${token}`
      );
      setIsValidLink(true);
    } catch (error) {
      setIsValidLink(false);
      const axiosError = error as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.detail?.[0] ||
          axiosError.response?.data?.message ||
          "유효하지 않은 링크입니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = searchParams.get("token");
      const uidb64 = searchParams.get("uidb64");
      await api.put(`/users/password/reset/`, {
        password: newPassword,
        uidb64: uidb64,
        token: token,
      });
      setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.detail?.[0] ||
          axiosError.response?.data?.message ||
          "비밀번호 변경 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={false}>
        <div className="min-h-screen bg-background">
          <NavigationBar />
          <main className="container mx-auto bg-background pt-[120px] px-4">
            <Card className="max-w-md mx-auto bg-background shadow-custom">
              <CardContent className="py-8">
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isValidLink) {
    return (
      <ProtectedRoute requireAuth={false}>
        <div className="min-h-screen bg-background">
          <NavigationBar />
          <main className="container mx-auto bg-background pt-[120px] px-4">
            <Card className="max-w-md mx-auto bg-background shadow-custom">
              <CardHeader>
                <CardTitle>유효하지 않은 링크</CardTitle>
                <CardDescription>
                  비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-red-500">{error}</p>
                <Button
                  className="w-full"
                  onClick={() => (window.location.href = "/reset-password")}
                >
                  새로운 재설정 링크 요청하기
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
              <CardTitle>새 비밀번호 설정</CardTitle>
              <CardDescription>새로운 비밀번호를 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="새 비밀번호 (8자 이상)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-6 rounded-full dark:border-border bg-transparent text-lg shadow-custom"
                />
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-6 rounded-full dark:border-border bg-transparent text-lg shadow-custom"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}
              {successMessage && (
                <p className="text-sm text-green-500 dark:text-green-400">
                  {successMessage}
                </p>
              )}

              <Button
                onClick={handlePasswordReset}
                disabled={isLoading}
                className="w-full py-6 rounded-full border dark:border-border bg-transparent hover:bg-[#e5e5ea]/45 dark:hover:bg-[#3a3a3c]/45 text-foreground dark:text-foreground font-medium text-base shadow-custom transition-colors duration-200"
              >
                {isLoading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
