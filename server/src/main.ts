import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { throwCustomException } from "@throwException/throw.exception";
import { ConfigService } from "@nestjs/config";
import { CustomExceptionFilter } from "./common/filters/custom-exception.filter";
import { LoggerService } from "./common/logger/logger.service";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const loggerService = app.get(LoggerService);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints
            ? Object.values(error.constraints)[0]
            : "验证错误",
        }));
        return throwCustomException(4444, "接口参数校验未通过", result);
      },
    }),
  );

  app.useGlobalFilters(new CustomExceptionFilter(loggerService));

  // 只在开发环境启用 Swagger
  if (process.env.NODE_ENV === "development") {
    const config = new DocumentBuilder()
      .setTitle("ZuSpace API")
      .setDescription("ZuSpace 项目 API 文档")
      .setVersion("1.0")
      .addTag("article", "文章管理")
      .addTag("auth", "认证管理")
      .addTag("comment", "评论管理")
      .addTag("project", "项目管理")
      .addTag("user", "用户管理")
      .addTag("health", "健康检查")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api-docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    loggerService.log(
      "Swagger 文档已启用: http://localhost:" +
        configService.get<number>("PORT") +
        "/api-docs",
    );
  }

  const port = configService.get<number>("PORT");

  loggerService.log("应用启动中...", {
    environment: process.env.NODE_ENV,
    port,
  });

  await app.listen(port);
  loggerService.log(`服务启动成功: http://localhost:${port}`);
}
bootstrap();
