"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NavigationBar } from "@/components/navigation-bar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import type { AxiosError } from "axios";

interface ApiError {
  message?: string;
  detail?: string[];
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("이메일 인증을 진행중입니다...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        const uidb64 = searchParams.get("uidb64");

        if (!token || !uidb64) {
          setVerificationStatus("error");
          setMessage("유효하지 않은 인증 링크입니다.");
          return;
        }

        await api.get(`/users/verify-email/?uidb64=${uidb64}&token=${token}`);
        setVerificationStatus("success");
        setMessage("이메일 인증이 성공적으로 완료되었습니다.");
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>;
        setVerificationStatus("error");
        setMessage(
          axiosError.response?.data?.detail?.[0] ||
            axiosError.response?.data?.message ||
            "이메일 인증에 실패했습니다. 다시 시도해주세요."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main className="container mx-auto bg-background pt-[120px] px-4">
          <Card className="max-w-md mx-auto bg-background shadow-custom">
            <CardHeader>
              <CardTitle>이메일 인증</CardTitle>
              <CardDescription>
                {verificationStatus === "loading" &&
                  "이메일 인증을 진행중입니다..."}
                {verificationStatus === "success" && "인증이 완료되었습니다."}
                {verificationStatus === "error" && "인증에 실패했습니다."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationStatus === "loading" && (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {verificationStatus === "success" && (
                <div className="text-center space-y-4">
                  <p className="text-green-500">{message}</p>
                  <Button
                    className="w-full"
                    onClick={() => (window.location.href = "/login")}
                  >
                    로그인하기
                  </Button>
                </div>
              )}
              {verificationStatus === "error" && (
                <div className="text-center space-y-4">
                  <p className="text-red-500">{message}</p>
                  <Button
                    className="w-full"
                    onClick={() => (window.location.href = "/login")}
                  >
                    로그인 페이지로 돌아가기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
