# 快速开始

## 环境要求

- Node.js >= 18
- pnpm >= 8
- MySQL 8.x

## 核心目录

```text
zuSpaceX/
├── client/    # 公开站点与管理后台
├── server/    # NestJS 服务端
└── docs/      # 项目文档
```

## 本地启动

```bash
cd server
pnpm install
npm run start:dev
cd client
pnpm install
pnpm run dev
```

默认地址：

- 前端：`http://localhost:3000`
- 服务端：`http://localhost:3001`
- Swagger：`http://localhost:3001/api-docs`

开发环境下，前端会将 `/api` 请求代理到 `http://localhost:3001`。

## 数据库准备

当前仓库没有提供 migration 和 seed，首次运行前需要先手动建表。

建议流程：

1. 根据 `server/src/entities/*.entity.ts` 建表
2. 启动 `server`
3. 注册一个普通用户
4. 手动将该用户提升为管理员

## 生产构建

```bash
bash build.sh
```

该脚本会先构建前端，再把前端产物复制到 `server/views` 和 `server/public`，最后构建服务端。
