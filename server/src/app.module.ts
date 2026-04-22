import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { HealthModule } from "@/modules/health/health.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CorsMiddleware } from "@/common/middleware/cors.middleware";
import { ViewMiddleware } from "@/common/middleware/view.middleware";
import { SessionMiddleware } from "@/common/middleware/session.middleware";
import { RequestLoggerInterceptor } from "@/common/interceptors/request-logger.interceptor";
import { ConfigModule } from "@nestjs/config";
import { MysqlModule } from "@/common/mysql/mysql.module";
import { LoggerModule } from "@/common/logger/logger.module";
import { UserModule } from "@/modules/user/user.module";
import { CommentModule } from "@/modules/comment/comment.module";
import { ArticleModule } from "@/modules/article/article.module";
import { ProjectModule } from "@/modules/project/project.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { AgentModule } from "@/modules/agent/agent.module";
import * as path from "path";

@Module({
  imports: [
    MysqlModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(
        process.cwd(),
        "env",
        `.env.${process.env.NODE_ENV || "development"}`,
      ),
    }),
    HealthModule,
    AuthModule,
    UserModule,
    CommentModule,
    ArticleModule,
    ProjectModule,
    AgentModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
    SessionMiddleware,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 先应用 CORS 中间件，确保它在其他中间件之前执行
    consumer.apply(CorsMiddleware).forRoutes("*");

    // 应用会话解析中间件，在CORS之后，其他业务中间件之前
    consumer.apply(SessionMiddleware).forRoutes("*");

    // 再应用其他中间件
    consumer.apply(ViewMiddleware).forRoutes("*");
  }
}
