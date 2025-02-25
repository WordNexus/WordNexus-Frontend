"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return (
        savedTheme === "dark" ||
        (!savedTheme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="w-[72px] h-9 bg-[#E5E5EA] dark:bg-[#3a3a3c] rounded-full p-1 flex items-center transition-all duration-300 focus:outline-none shadow-theme-toggle relative"
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-custom ${
          isDarkMode
            ? "translate-x-[36px] bg-background"
            : "translate-x-0 bg-background"
        }`}
      >
        <Sun
          className={`h-4 w-4 text-foreground dark:text-foreground absolute transition-opacity duration-300 ${
            isDarkMode ? "opacity-0" : "opacity-100"
          }`}
        />
        <Moon
          className={`h-4 w-4 text-foreground dark:text-foreground absolute transition-opacity duration-300 ${
            isDarkMode ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      <div
        className={`absolute inset-[2px] rounded-full transition-all duration-300 ${
          isDarkMode ? "dark:bg-transparent" : "bg-transparent"
        }`}
      >
        <Sun
          className={`h-4 w-4 text-foreground absolute left-2 top-2 transition-opacity duration-300 ${
            isDarkMode ? "opacity-100" : "opacity-0"
          }`}
        />
        <Moon
          className={`h-4 w-4 text-foreground absolute right-2 top-2 transition-opacity duration-300 ${
            isDarkMode ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
    </button>
  );
}
