"use client";

import { useAuth } from "@/hooks/auth/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AUTH_CONFIG } from "@/config/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo || AUTH_CONFIG.redirects.afterLogout);
      } else if (!requireAuth && isAuthenticated) {
        router.push(redirectTo || AUTH_CONFIG.redirects.afterLogin);
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (
    (!isLoading && requireAuth && isAuthenticated) ||
    (!isLoading && !requireAuth && !isAuthenticated)
  ) {
    return <>{children}</>;
  }

  return null;
}
