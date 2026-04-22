import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request, Response } from "express";
import { LoggerService } from "@/common/logger/logger.service";

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly MAX_BODY_LENGTH = 5000;

  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, headers, query, params } = request;
    const userInfo = request["userInfo"];
    const userId = request["userId"];

    const startTime = Date.now();
    const requestId =
      (headers["x-request-id"] as string) || `req-${Date.now()}`;
    const ip = this.getClientIp(request);
    const userAgent = headers["user-agent"] as string;

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const response = context.switchToHttp().getResponse<Response>();
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          let bodyForLog = responseBody;
          let isTruncated = false;

          try {
            const responseStr = JSON.stringify(responseBody);
            if (responseStr && responseStr.length > this.MAX_BODY_LENGTH) {
              bodyForLog = `[响应体过大，已截断，原长度: ${responseStr.length} 字符]`;
              isTruncated = true;
            }
          } catch (error) {
            bodyForLog = `[无法序列化响应体]`;
            isTruncated = true;
          }

          this.loggerService.http(`${method} ${url} ${statusCode}`, {
            requestId,
            ip,
            userAgent,
            method,
            url,
            statusCode,
            responseTime,
            userId,
            userInfo,
            request: {
              query,
              params,
              body: this.sanitizeBody(body),
            },
            response: {
              body: bodyForLog,
              isTruncated,
            },
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;

          this.loggerService.error(
            `${method} ${url} - Request failed`,
            error.stack,
            {
              requestId,
              ip,
              userAgent,
              method,
              url,
              responseTime,
              userId,
              userInfo,
              request: {
                query,
                params,
                body: this.sanitizeBody(body),
              },
              error: {
                message: error.message,
                name: error.name,
              },
            },
          );
        },
      }),
    );
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
