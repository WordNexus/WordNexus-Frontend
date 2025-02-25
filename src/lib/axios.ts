import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { UserInfoService } from "@/lib/auth/user-info";
import { AuthError } from "@/lib/auth/auth";

axios.defaults.withCredentials = true;

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ApiErrorResponse {
  detail?: string[];
  message?: string;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken'
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const csrfToken = getCookie('csrftoken');
    
    if (csrfToken && config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      config.headers['X-CSRFTOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableRequest;

    if (originalRequest.url?.includes('/verify-email/')) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/login/refresh/')) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/logout/')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/users/login/refresh/");
        const userResponse = await api.get("/users/me/");
        const userInfo = typeof userResponse.data === 'string'
          ? userResponse.data
          : JSON.stringify(userResponse.data);
        UserInfoService.storeUserInfo(userInfo);
        return api(originalRequest);
      } catch (refreshError) {
        UserInfoService.clearUserInfo();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    const errorData = error.response?.data as ApiErrorResponse;
    const errorMessage = 
      errorData?.detail?.[0] ||
      errorData?.message ||
      "오류가 발생했습니다.";
    
    return Promise.reject(new AuthError(errorMessage));
  }
);

export const testTokenRefresh = async () => {
  try {
    await api.get("/users/me/");
    return "토큰이 유효합니다.";
  } catch (error) {
    if (error instanceof Error) {
      return `토큰 테스트 중 오류 발생: ${error.message}`;
    }
    return "알 수 없는 오류가 발생했습니다.";
  }
};

export default api;