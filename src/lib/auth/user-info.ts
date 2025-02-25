import type { User } from "@/types/auth";

const isBrowser = typeof window !== 'undefined' && 
  typeof window.sessionStorage !== 'undefined' &&
  typeof window.document !== 'undefined';

export const UserInfoService = {
  hasStoredUserInfo: (): boolean => {
    if (!isBrowser) return false;
    
    try {
      const userInfo = sessionStorage.getItem("userInfo");
      return !!userInfo && userInfo !== "undefined" && userInfo !== "null";
    } catch {
      return false;
    }
  },

  storeUserInfo: (userInfo: string): void => {
    if (!isBrowser) return;

    try {
      const parsed = JSON.parse(userInfo);
      if (parsed === null || parsed === undefined) {
        return;
      }
      sessionStorage.setItem("userInfo", JSON.stringify(parsed));
    } catch {
      sessionStorage.removeItem("userInfo");
    }
  },

  getUserInfo: (): User | null => {
    if (!isBrowser) return null;

    try {
      const userInfo = sessionStorage.getItem("userInfo");
      if (!userInfo) return null;
      
      const parsedInfo = JSON.parse(userInfo);
      if (!parsedInfo || typeof parsedInfo !== 'object' || !parsedInfo.id || !parsedInfo.email) {
        sessionStorage.removeItem("userInfo");
        return null;
      }
      
      return parsedInfo;
    } catch {
      sessionStorage.removeItem("userInfo");
      return null;
    }
  },

  clearUserInfo: (): void => {
    if (!isBrowser) return;
    
    sessionStorage.removeItem("userInfo");
  },

  getCsrfToken: (): string | undefined => {
    if (!isBrowser) return undefined;

    try {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];
    } catch {
      return undefined;
    }
  },

  getAuthHeader: (): { "X-CSRFToken": string } | undefined => {
    const csrfToken = UserInfoService.getCsrfToken();
    return csrfToken ? { "X-CSRFToken": csrfToken } : undefined;
  },
}; 