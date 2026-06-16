import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import * as path from "path";
import * as fs from "fs";
import * as geoip from "geoip-lite";

export interface LogMetadata {
  requestId?: string;
  ip?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  userId?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private readonly logDir = path.join(process.cwd(), "logs");

  constructor() {
    this.ensureLogDirectory();
    this.logger = this.createLogger();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private createLogger(): winston.Logger {
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    return winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: customFormat,
      transports: [
        // 控制台输出
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length
                ? JSON.stringify(meta, null, 2)
                : "";
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            }),
          ),
        }),

        // 错误日志 - 单独文件
        new DailyRotateFile({
          filename: path.join(this.logDir, "error-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          level: "error",
          maxSize: "20m",
          maxFiles: "30d",
        }),

        // 请求日志 - 单独文件
        new DailyRotateFile({
          filename: path.join(this.logDir, "request-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          level: "http",
          maxSize: "20m",
          maxFiles: "30d",
        }),

        // 所有日志 - 合并文件
        new DailyRotateFile({
          filename: path.join(this.logDir, "combined-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "30d",
        }),
      ],
    });
  }

  private getLocationFromIp(ip: string): LogMetadata["location"] | null {
    if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
      return null;
    }

    const geo = geoip.lookup(ip);
    if (!geo) {
      return null;
    }

    return {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      timezone: geo.timezone,
    };
  }

  private formatMetadata(metadata?: LogMetadata): any {
    if (!metadata) return {};

    const formatted = { ...metadata };

    if (metadata.ip) {
      const location = this.getLocationFromIp(metadata.ip);
      if (location) {
        formatted.location = location;
      }
    }

    return formatted;
  }

  log(message: string, metadata?: LogMetadata) {
    this.logger.info(message, this.formatMetadata(metadata));
  }

  error(message: string, trace?: string, metadata?: LogMetadata) {
    this.logger.error(message, {
      ...this.formatMetadata(metadata),
      trace,
    });
  }

  warn(message: string, metadata?: LogMetadata) {
    this.logger.warn(message, this.formatMetadata(metadata));
  }

  debug(message: string, metadata?: LogMetadata) {
    this.logger.debug(message, this.formatMetadata(metadata));
  }

  verbose(message: string, metadata?: LogMetadata) {
    this.logger.verbose(message, this.formatMetadata(metadata));
  }

  http(message: string, metadata?: LogMetadata) {
    this.logger.log("http", message, this.formatMetadata(metadata));
  }
}
