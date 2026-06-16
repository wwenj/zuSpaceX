import { randomUUID } from "crypto";

export const SESSION_COOKIE_NAME = "zu_space_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
export const ACCOUNT_PATTERN = /^[A-Z0-9]{8}$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 32;
export const NICKNAME_MAX_LENGTH = 8;
export const SYSTEM_ACTOR = "system";

export const AUTH_AVATARS = [
  "/media/avatars/avatar-01.png",
  "/media/avatars/avatar-02.png",
  "/media/avatars/avatar-03.png",
  "/media/avatars/avatar-04.png",
  "/media/avatars/avatar-05.png",
  "/media/avatars/avatar-06.png",
  "/media/avatars/avatar-07.png",
  "/media/avatars/avatar-08.png",
  "/media/avatars/avatar-09.png",
  "/media/avatars/avatar-10.jpeg",
  "/media/avatars/avatar-11.jpeg",
  "/media/avatars/avatar-12.jpeg",
  "/media/avatars/avatar-13.jpeg",
  "/media/avatars/avatar-14.jpeg",
  "/media/avatars/avatar-15.jpeg",
  "/media/avatars/avatar-16.jpeg",
];

export function normalizeAccount(account: string): string {
  return account.trim().toUpperCase();
}

export function createRecordId(): string {
  return randomUUID().replace(/-/g, "");
}
