import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { CustomException } from "./custom.exception";
import { LoggerService } from "@/common/logger/logger.service";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { method, url, body, query, headers, params } = request;

    let code = -1;
    let message = "Internal server error 500";
    let data = {};
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof CustomException) {
      code = exception.code;
      message = exception.message;
      data = exception.data;
      statusCode = HttpStatus.OK;
    } else if (exception instanceof HttpException) {
      code = exception.getStatus();
      message = exception.message;
      statusCode = exception.getStatus();
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const userInfo = request["userInfo"];
    const userId = request["userId"];
    const requestId =
      (headers["x-request-id"] as string) || `req-${Date.now()}`;
    const ip = this.getClientIp(request);
    const userAgent = headers["user-agent"] as string;

    this.loggerService.error(
      `${method} ${url} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      {
        requestId,
        ip,
        userAgent,
        method,
        url,
        statusCode,
        userId,
        userInfo,
        errorType: exception?.constructor?.name || "UnknownError",
        errorCode: code,
        request: {
          query,
          params,
          body: this.sanitizeBody(body),
        },
      },
    );

    response.status(HttpStatus.OK).json({
      code,
      msg: message,
      data,
    });
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers["x-forwarded-for"];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(",")[0];
      return ips.trim();
    }

    const realIp = request.headers["x-real-ip"];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return request.ip || request.connection?.remoteAddress || "unknown";
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = [
      "password",
      "password_hash",
      "token",
      "session_token",
      "secret",
      "apiKey",
      "authorization",
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "***";
      }
    }

    return sanitized;
  }
}
