import { authApi, type User } from "@/api";

export interface UserInfo {
  id: string;
  account: string;
  avatar: string;
  nickname: string;
  intro: string;
  role: number;
  gameScore: number;
}

export const ADMIN_ROLE = 1;

let currentUser: UserInfo | null = null;
let initialized = false;
let loadingPromise: Promise<UserInfo | null> | null = null;

function notifyUserChange() {
  window.dispatchEvent(new Event("user-info-changed"));
}

function toUserInfo(user: User): UserInfo {
  return {
    id: user.id,
    account: user.account,
    avatar: user.avatar,
    nickname: user.nickname,
    intro: user.intro,
    role: user.role,
    gameScore: user.gameScore,
  };
}

function setCurrentUser(user: UserInfo | null, shouldNotify = true) {
  currentUser = user;
  initialized = true;

  if (shouldNotify) {
    notifyUserChange();
  }
}

export function isAdmin(role: number | null | undefined): boolean {
  return Number(role) === ADMIN_ROLE;
}

export function isLoggedIn(): boolean {
  return !!currentUser;
}

export async function refreshUser(): Promise<UserInfo | null> {
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = authApi
    .me()
    .then((user) => {
      const nextUser = toUserInfo(user);
      setCurrentUser(nextUser);
      return nextUser;
    })
    .catch(() => {
      setCurrentUser(null);
      return null;
    })
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
}

export async function getUserInfo(force = false): Promise<UserInfo | null> {
  if (force) {
    return refreshUser();
  }

  if (initialized) {
    return currentUser;
  }

  return refreshUser();
}

export async function login(params: {
  account: string;
  password: string;
}): Promise<UserInfo> {
  const user = await authApi.login(params);
  const nextUser = toUserInfo(user);
  setCurrentUser(nextUser);
  return nextUser;
}

export async function register(params: {
  account: string;
  password: string;
  nickname: string;
  avatar: string;
}): Promise<UserInfo> {
  const user = await authApi.register(params);
  const nextUser = toUserInfo(user);
  setCurrentUser(nextUser);
  return nextUser;
}

export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } finally {
    setCurrentUser(null);
  }
}

export function validateNickname(nickname: string): boolean {
  const normalized = nickname.trim();
  return normalized.length > 0 && normalized.length <= 8;
}

export function validateAccount(account: string): boolean {
  return /^[A-Z0-9]{8}$/.test(account.trim().toUpperCase());
}

export function normalizeAccount(account: string): string {
  return account.trim().toUpperCase();
}
