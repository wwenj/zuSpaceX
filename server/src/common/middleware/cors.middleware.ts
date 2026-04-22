import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

const LOCAL_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

/**
 * CORS 中间件
 * 只保留本地开发跨域，线上交给网关处理
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    const normalizedOrigin = normalizeOrigin(origin);

    if (!normalizedOrigin || !LOCAL_ORIGINS.has(normalizedOrigin)) {
      return next();
    }

    res.header("Access-Control-Allow-Origin", normalizedOrigin);
    res.header("Vary", "Origin");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type,Accept,Authorization,X-Requested-With,sec-ch-ua,sec-ch-ua-mobile,sec-ch-ua-platform,Referer,User-Agent",
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    next();
  }
}

function normalizeOrigin(origin?: string) {
  return origin?.replace(/\/+$/, "");
}
