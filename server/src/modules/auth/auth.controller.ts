import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthService } from "@/modules/auth/auth.service";
import { LoginDto, RegisterDto } from "@/modules/auth/dto/auth.dto";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/modules/auth/auth.constants";

@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "注册并登录" })
  @ApiResponse({ status: 200, description: "注册成功" })
  async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(body, this.getRequestContext(req));
    this.writeSessionCookie(res, result.sessionToken);
    return result.user;
  }

  @Post("login")
  @ApiOperation({ summary: "账号密码登录" })
  @ApiResponse({ status: 200, description: "登录成功" })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body, this.getRequestContext(req));
    this.writeSessionCookie(res, result.sessionToken);
    return result.user;
  }

  @Post("logout")
  @ApiOperation({ summary: "退出登录" })
  @ApiResponse({ status: 200, description: "退出成功" })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.sessionToken);
    this.clearSessionCookie(res);
    return { success: true };
  }

  @Get("me")
  @ApiOperation({ summary: "获取当前登录用户" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async me(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.userId) {
      if (req.invalidSession || req.sessionToken) {
        this.clearSessionCookie(res);
      }
      throw new UnauthorizedException("用户未登录");
    }

    return this.authService.getCurrentUser(req.userId);
  }

  private getRequestContext(req: Request) {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = forwardedFor
      ? String(forwardedFor).split(",")[0].trim()
      : req.ip || req.socket.remoteAddress || "";

    return {
      ip,
      userAgent: (req.headers["user-agent"] as string) || "",
    };
  }

  private writeSessionCookie(res: Response, sessionToken: string) {
    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }

  private clearSessionCookie(res: Response) {
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
}
