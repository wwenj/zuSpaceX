import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "@/modules/auth/auth.service";
import { SESSION_COOKIE_NAME } from "@/modules/auth/auth.constants";

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const sessionToken = this.getCookieValue(req.headers.cookie, SESSION_COOKIE_NAME);
    if (!sessionToken) {
      next();
      return;
    }

    req.sessionToken = sessionToken;

    const session = await this.authService.validateSessionToken(sessionToken);
    if (!session) {
      req.invalidSession = true;
      next();
      return;
    }

    req.userId = session.userId;
    req.sessionId = session.sessionId;
    next();
  }

  private getCookieValue(cookieHeader: string | undefined, name: string) {
    if (!cookieHeader) {
      return "";
    }

    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
      const [rawName, ...rawValue] = cookie.trim().split("=");
      if (rawName === name) {
        return decodeURIComponent(rawValue.join("="));
      }
    }

    return "";
  }
}
