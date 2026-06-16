import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { join } from "path";
import { existsSync } from "fs";

@Injectable()
export class ViewMiddleware implements NestMiddleware {
  // 配置允许的API前缀数组
  private readonly allowedPrefixes: string[] = [
    "/api",
    "/login",
    "/open",
    "/logout",
    "/actuator/health",
  ];

  // 静态资源文件扩展名
  private readonly staticFileExtensions: string[] = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".map",
    ".webp",
  ];

  /**
   * 设置静态资源缓存策略
   */
  private setCacheHeaders(res: Response, url: string): void {
    // 字体文件 - 强缓存1年
    if (url.match(/\.(woff2?|ttf|eot)$/)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader(
        "Expires",
        new Date(Date.now() + 31536000 * 1000).toUTCString(),
      );
    }
    // JS/CSS文件 - 强缓存1年（带hash的文件）
    else if (url.match(/\.(js|css)$/) && url.includes("-")) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader(
        "Expires",
        new Date(Date.now() + 31536000 * 1000).toUTCString(),
      );
    }
    // 图片资源 - 强缓存30天
    else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
      res.setHeader("Cache-Control", "public, max-age=2592000");
      res.setHeader(
        "Expires",
        new Date(Date.now() + 2592000 * 1000).toUTCString(),
      );
    }
    // 其他静态资源 - 协商缓存
    else {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }

    // 添加安全头
    res.setHeader("X-Content-Type-Options", "nosniff");
  }

  use(req: Request, res: Response, next: NextFunction) {
    const url = req.originalUrl;

    // 1. 检查是否是API请求
    const isApiRequest = this.allowedPrefixes.some((prefix) =>
      url.startsWith(prefix),
    );
    if (isApiRequest) {
      return next(); // API请求直接交给后续处理器
    }

    // 2. 检查是否是静态资源请求
    const isStaticFile = this.staticFileExtensions.some((ext) =>
      url.endsWith(ext),
    );
    if (isStaticFile) {
      // 从public目录提供静态文件
      const staticFilePath = join(
        process.cwd(),
        "public",
        url.startsWith("/") ? url.substring(1) : url,
      );

      if (existsSync(staticFilePath)) {
        // 设置缓存策略
        this.setCacheHeaders(res, url);
        return res.sendFile(staticFilePath);
      }
      // 如果文件不存在，继续下一步处理
    }

    // 3. 其他请求返回index.html (SPA应用路由)
    const indexPath = join(process.cwd(), "views", "index.html");
    res.sendFile(indexPath);
  }
}
