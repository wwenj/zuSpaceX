import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { Response, Request } from "express";
import { CustomException } from "./custom.exception";

@Catch() // 捕获所有异常
export class AllExceptionsFilter implements ExceptionFilter {
  constructor() {}

  // 获取客户端真实 IP 地址
  private getClientIp(request: Request): string {
    // 尝试从各种常见的代理头中获取 IP
    const forwardedFor = request.headers["x-forwarded-for"];
    if (forwardedFor) {
      // x-forwarded-for 可能包含多个 IP，取第一个
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(",")[0];
      return ips.trim();
    }

    // 尝试其他常见的头
    const realIp = request.headers["x-real-ip"];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // 如果没有代理头，则使用 remoteAddress
    return request.ip || request.connection.remoteAddress || "unknown";
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { method, url, body, query, headers, params } = request;

    let code = -1; // 默认错误码
    let message = "Internal server error 500";
    let data = {};

    // 检查是否是自定义异常
    if (exception instanceof CustomException) {
      code = exception.code;
      message = exception.message;
      data = exception.data;
    }
    // 检查是否是 NestJS 的 HttpException
    else if (exception instanceof HttpException) {
      code = exception.getStatus(); // 将 HTTP 状态码放到 code 字段
      message = exception.message;
    }
    // 其他未知异常
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // 获取用户信息
    const userInfo = request["userInfo"];
    const requestId = headers["x-request-id"] || `req-${Date.now()}`;
    const ip = this.getClientIp(request);

    // 创建完整的日志对象
    const logData = {
      requestId,
      timestamp: new Date().toISOString(),
      ip,
      url,
      method,
      userInfo,
      status: exception instanceof HttpException ? exception.getStatus() : 500,
      errorType: exception.constructor.name,
      errorMessage: message,
      // 请求信息
      request: {
        query,
        params,
        body,
        headers,
      },
    };

    // 将错误堆栈添加到日志对象中
    if (exception instanceof Error && exception.stack) {
      logData["trace"] = exception.stack;
    }

    // 记录异常日志（包含完整请求信息）
    console.log(logData);

    // 返回统一的错误响应，HTTP 状态码始终为 200
    response.status(HttpStatus.OK).json({
      code,
      msg: message,
      data,
    });
  }
}
