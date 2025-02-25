"use client";

import { NavigationBar } from "@/components/navigation-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/auth/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/lib/auth/auth";

export default function ProfileSettings() {
  const { user, error: authError } = useAuth();
  const [confirmCurrentPassword, setConfirmCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!confirmCurrentPassword || !newPassword || !confirmPassword) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.updatePassword(confirmCurrentPassword, newPassword);
      setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
      setConfirmCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("비밀번호 변경 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main className="w-[600px] mx-auto pt-[120px] px-4">
          <h1 className="text-2xl font-bold text-foreground mb-6 px-4">
            프로필 설정
          </h1>

          <div className="grid gap-6">
            {/* 비밀번호 변경 섹션 */}
            <Card className="bg-background shadow-custom rounded-[25px]">
              <CardHeader>
                <CardTitle className="text-foreground">비밀번호 변경</CardTitle>
                <CardDescription>
                  계정 보안을 위해 정기적으로 비밀번호를 변경해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-foreground">
                    현재 비밀번호
                  </Label>
                  <Input
                    id="confirmCurrentPassword"
                    type="password"
                    value={confirmCurrentPassword}
                    onChange={(e) => setConfirmCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호 입력"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground">
                    새 비밀번호
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 입력 (8자 이상)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    새 비밀번호 확인
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 다시 입력"
                  />
                </div>

                {(error || authError) && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {error || authError}
                  </p>
                )}
                {successMessage && (
                  <p className="text-sm text-green-500 dark:text-green-400">
                    {successMessage}
                  </p>
                )}

                <Button
                  onClick={handlePasswordChange}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "변경 중..." : "비밀번호 변경"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
