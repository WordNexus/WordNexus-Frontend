"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/use-auth";
import { UserButton } from "./user-menu";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationBarProps {
  isSearching?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onReset?: () => void;
}

export function NavigationBar({
  isSearching = false,
  searchQuery = "",
  onSearchChange,
  onSearch,
  onKeyPress,
  onReset,
}: NavigationBarProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const handleReset = () => {
    onReset?.();
    router.push("/", { scroll: false });
  };

  return (
    <header className="w-screen fixed top-0 z-50 flex md:flex-row flex-col items-center justify-center bg-background/80 backdrop-blur-sm border-b border-border lg:pt-[10px] md:pt-[20px] sm:pt-[40px] pt-[60px] lg:px-[240px] md:px-[40px] px-[30px]">
      <div className="w-full flex items-center md:justify-start justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold border border-border dark:border-border rounded-full px-4 py-1 shadow-custom">
              WordNexus
            </span>
          </Link>
        </div>

        <div className="hidden sm:block flex-1">
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative flex items-center w-[300px] xl:ml-[100px] lg:ml-[30px] md:ml-[30px] sm:ml-[30px] ml-[0px]"
              >
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyPress={onKeyPress}
                  className="w-[300px] h-9 px-4 rounded-full border-[#4a6572] dark:border-border bg-transparent"
                  placeholder="단어를 입력하세요"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSearch}
                  className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-8 dark:text-foreground"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 dark:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {isAuthenticated ? (
            <UserButton username={user?.name || ""} />
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 shadow-custom dark:text-foreground border border-border dark:border-border"
              >
                <LogIn className="h-[18px] w-[18px]" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 모바일 검색창 */}
      <div className="sm:hidden w-screen z-50 px-[30px] pt-[30px]">
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative flex items-center justify-center"
            >
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyPress={onKeyPress}
                className="w-full h-9 px-4 rounded-full border-border dark:border-border bg-background/80 backdrop-blur-sm border-[1px] border-[#4a6572]"
                placeholder="단어를 입력하세요"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearch}
                className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-8 dark:text-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 dark:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
