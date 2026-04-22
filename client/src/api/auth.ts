import { http } from "./request";
import type { User } from "./types";

export interface LoginParams {
  account: string;
  password: string;
}

export interface RegisterParams extends LoginParams {
  nickname: string;
  avatar: string;
}

export const authApi = {
  register: (params: RegisterParams) =>
    http.post<User>("/api/auth/register", params),

  login: (params: LoginParams) =>
    http.post<User>("/api/auth/login", params),

  logout: () =>
    http.post<{ success: boolean }>("/api/auth/logout"),

  me: () =>
    http.get<User>("/api/auth/me"),
};
