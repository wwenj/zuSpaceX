# 部署说明

## 推荐方式

前端构建产物并入服务端目录，由 NestJS 统一提供静态资源和 API，只需部署一个服务。

## 构建

```bash
bash build.sh
```

脚本执行顺序：

1. 构建前端（`client/dist`）
2. 将 `index.html` 拷贝到 `server/views`
3. 将静态资源拷贝到 `server/public`
4. 构建服务端

## 启动

```bash
cd server
npm run start:prod
```

默认生产端口为 `8080`，可在 `server/env/.env.production` 中修改。

## Docker

当前 `Dockerfile` 已集成 `build.sh`，镜像构建时自动完成前后端一体化构建：

```bash
docker build -t zuspace .
docker run -p 8080:8080 zuspace
```

建议通过 `-e` 传入数据库和模型配置，避免将密钥打入镜像。

## 注意事项

::: tip
- 登录态依赖 Cookie，生产环境建议前后端同域部署
- 前端使用 `HashRouter`，服务端无需额外配置路由回退
- 如需独立部署前端（CDN / Nginx），需同步调整 API 跨域策略
:::
