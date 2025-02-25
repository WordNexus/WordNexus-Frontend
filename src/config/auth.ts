export const AUTH_CONFIG = {
  tokenKey: "auth_token",
  tokenPrefix: "Bearer",
  tokenExpiry: 7 * 24 * 60 * 60 * 1000,

  endpoints: {
    login: "/users/login/",
    register: "/users/signup/",
    logout: "/users/logout/",
    refresh: "/users/login/refresh/",
    me: "/users/me/",
    updatePassword: "/users/password/update/",
    passwordReset: "/users/password/reset/verify/",
    passwordResetConfirm: "/users/password/reset/",
    verifyEmail: "/users/verify-email/",
  },

  redirects: {
    afterLogin: "/",
    afterLogout: "/",
    afterRegister: "/login",
  },

  cookie: {
    name: "auth_session",
    options: {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60,
    },
  },
}; 