# 部署说明

## 推荐方式

当前项目当前推荐一体化部署：前端构建产物复制到服务端目录，由 Nest 统一提供静态资源和 API。

## 构建流程

根目录提供了 `build.sh`：

```bash
bash build.sh
```

该脚本会先构建前端，再把前端产物复制到：

- `server/views`
- `server/public`

之后再构建服务端，最终只需要部署 `server`。

## 服务启动

```bash
cd server
npm run start:prod
```

默认生产端口来自：

- `server/env/.env.production`

当前默认值是 `8080`。

## Docker

当前 `Dockerfile` 已经复用根目录 `build.sh`，镜像构建时会直接完成前端和服务端的一体化构建。

常用命令：

```bash
docker build -t zuspace .
docker run -p 8080:8080 zuspace
```

## 部署注意点

- 登录态依赖 Cookie，生产环境建议前后端同域部署
- 前端当前使用 `HashRouter`，服务端静态托管更简单
- 公开部署前，建议先把数据库和模型配置改成环境变量
