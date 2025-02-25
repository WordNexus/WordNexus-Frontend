"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  User,
  Palette,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

interface UserButtonProps {
  username: string;
}

export function UserButton({ username }: UserButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
      return "system";
    }
    return "system";
  });

  const handleLogout = async () => {
    try {
      await api.post("/users/logout/");
      sessionStorage.removeItem("userInfo");
      window.location.href = "/";
    } catch {
      sessionStorage.removeItem("userInfo");
      window.location.href = "/";
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  const setThemeMode = (mode: "light" | "dark" | "system") => {
    setTheme(mode);
    if (mode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
      localStorage.removeItem("theme");
    } else {
      document.documentElement.classList.toggle("dark", mode === "dark");
      localStorage.setItem("theme", mode);
    }
  };

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <div className="relative w-9 h-9" ref={menuRef}>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "" : "36px",
          width: isOpen ? "" : "36px",
          borderRadius: isOpen ? "25px" : "25px",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className={`absolute right-0 top-0 ${
          isOpen
            ? "bg-[#E5E5EA] dark:bg-gray-800 shadow-theme-toggle"
            : "bg-background dark:bg-gray-700 shadow-custom"
        } shadow-lg overflow-hidden origin-top-right`}
      >
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="p-2 h-full flex flex-col gap-[20px]"
          >
            {/* User Profile */}
            <Link href="/settings/profile">
              <div className="flex items-center gap-3 pl-2 pr-4 h-[60px] bg-background dark:bg-gray-700 [border-radius:25px] shadow-custom">
                <div className="w-[45px] h-[45px] flex items-center justify-center rounded-full [background-color:#E5E5EA] dark:bg-gray-600 shadow-theme-toggle">
                  <User className="w-6 h-6 text-foreground" />
                </div>
                <span className="text-sm text-foreground">{username}</span>
              </div>
            </Link>

            {/* Theme Section */}
            <div className="flex items-center justify-between pl-2 pr-0.5 h-[40px] bg-background dark:bg-gray-700 [border-radius:25px] shadow-custom">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-foreground" />
                <span className="text-sm text-foreground">Theme</span>
              </div>
              <div className="flex items-center px-1 w-[100px] h-[34px] ml-3 [background-color:#E5E5EA] dark:bg-gray-600 [border-radius:20px] shadow-theme-toggle">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setThemeMode("light")}
                    className={`p-1.5 rounded-full transition-colors ${
                      theme === "light"
                        ? "bg-background dark:bg-gray-500"
                        : "hover:bg-white dark:hover:bg-gray-500"
                    }`}
                  >
                    <Sun className="w-4 h-4 text-foreground" />
                  </button>
                  <button
                    onClick={() => setThemeMode("dark")}
                    className={`p-1.5 rounded-full transition-colors ${
                      theme === "dark"
                        ? "bg-background dark:bg-gray-500"
                        : "hover:bg-white dark:hover:bg-gray-500"
                    }`}
                  >
                    <Moon className="w-4 h-4 text-foreground" />
                  </button>
                  <button
                    onClick={() => setThemeMode("system")}
                    className={`p-1.5 rounded-full transition-colors ${
                      theme === "system"
                        ? "bg-background dark:bg-gray-500"
                        : "hover:bg-white dark:hover:bg-gray-500"
                    }`}
                  >
                    <Monitor className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Settings and Logout */}
            <div className="flex justify-center gap-2">
              <Link href="/settings/profile">
                <button className="flex items-center gap-2 px-2 h-[40px] bg-background dark:bg-gray-700 [border-radius:25px] shadow-custom w-[105px]">
                  <Settings className="w-5 h-5 text-foreground" />
                  <span className="text-sm text-foreground whitespace-nowrap">
                    Settings
                  </span>
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 h-[40px] bg-background dark:bg-gray-700 [border-radius:25px] shadow-custom w-[105px]"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-500 whitespace-nowrap">
                  LogOut
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="h-9 w-9 rounded-[25px] focus:outline-none flex items-center justify-center"
          >
            <User className="w-5 h-5 text-foreground" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
