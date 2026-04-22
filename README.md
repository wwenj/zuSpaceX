<p align="center">
  <img src="./public/zu_logo.png" alt="ZuSpace Logo" width="180" />
</p>

# ZuSpace

> 一个用于搭建个人主站的全栈项目，包含个人主页、技术博客、开源项目展示、留言互动、后台管理，以及围绕站内内容的 AI 对话能力。

## 项目简介

ZuSpace 不是单纯的静态主页模板，而是一套围绕“内容展示 + 内容管理 + 用户互动 + AI 解读”设计的完整网站系统。

它适合这几类场景：

- 搭建个人主站或作品集网站
- 维护技术博客与开源项目展示页
- 作为个人品牌官网的二开基础
- 为文章或项目补充 AI 问答、讲解与分析能力

项目采用前后端分离开发：

- `client` 负责公开站点与管理后台界面
- `server` 负责认证、数据存储、权限控制与 AI 接口
- 根目录 `build.sh` 支持将前端产物拷贝到 Nest 服务端，作为单服务部署

## 功能概览

| 模块 | 说明 |
| --- | --- |
| 公开站点 | 首页、About、博客列表/详情、项目列表、留言板、个人中心 |
| 内容系统 | Markdown 博客、代码高亮、文章置顶/隐藏、项目标签与外链展示 |
| 互动能力 | 站点留言、文章评论、用户资料维护 |
| 权限体系 | 注册登录、`Cookie + Session` 登录态、普通用户/管理员角色 |
| 管理后台 | 文章、项目、留言、用户四类后台管理 |
| AI 能力 | 内置 Agent 对话页，可结合作者资料、文章内容、项目内容进行问答与解读 |

## 项目文档

仓库内已接入 `VitePress` 文档站，详细文档统一放在 [`docs/`](./docs/)。

本地启动文档站：

```bash
cd docs
pnpm install
pnpm run dev
```

默认地址：

- Docs: `http://localhost:5173`

如果仓库启用了 GitHub Pages，推送到 `main` 或 `master` 后会自动部署文档站。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 19、TypeScript、Vite、React Router、Tailwind CSS、Radix UI |
| 后端 | NestJS、TypeORM、MySQL、Swagger、bcrypt |
| AI | LangChain、LangGraph、OpenAI SDK / OpenAI 兼容模型接口 |
| 部署 | `build.sh` 一体化构建、Docker（当前以服务端镜像为主） |

## 项目结构

```text
zuSpaceX/
├── client/                 # React + Vite 前端
│   ├── src/admin/          # 管理后台页面
│   ├── src/pages/          # 公开站点页面
│   ├── src/components/     # 通用组件
│   ├── src/api/            # 接口封装
│   └── src/router/         # 路由配置
├── server/                 # NestJS 服务端
│   ├── src/modules/        # article / project / comment / auth / user / agent 等模块
│   ├── src/entities/       # 数据实体
│   ├── src/common/         # 中间件、日志、过滤器、数据库能力
│   └── env/                # 不同环境的端口配置
├── build.sh                # 前后端联合构建脚本
├── Dockerfile              # 当前主要用于服务端镜像构建
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- MySQL 8.x

### 1. 准备数据库

当前仓库未提供 migration / seed 脚本，首次运行前需要先准备数据库和表结构。

建议做法：

- 根据 `server/src/entities/*.entity.ts` 建表
- 启动服务后注册一个普通用户
- 如需后台管理权限，手动将该用户提升为管理员

### 2. 启动服务端

```bash
cd server
pnpm install
npm run start:dev
```

默认地址：

- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api-docs`

### 3. 启动前端

```bash
cd client
pnpm install
pnpm run dev
```

默认地址：

- Web: `http://localhost:3000`

开发环境下，前端会将 `/api` 代理到 `http://localhost:3001`。

## 构建与部署

### 前后端一体化构建

```bash
bash build.sh
```

该脚本会：

1. 构建前端
2. 将 `client/dist` 中的 `index.html` 和静态资源拷贝到 `server/views`、`server/public`
3. 构建 Nest 服务端

适合把前端静态资源和 API 统一交给 Nest 服务。

### Docker

仓库根目录提供了 `Dockerfile`，当前更适合服务端容器化：

- 会安装并构建 `server`
- 默认暴露 `8080`
- 不会单独执行前端打包流程

如果你希望前后端一起进入镜像，建议先补齐前端构建和静态资源拷贝流程。

## 当前注意事项

- 当前仓库更适合作为个人站点的二开基础，并非零配置即用的脚手架。
- 数据库、生产域名、模型服务等配置，建议全部改为环境变量后再公开部署。
- 当前没有 migration、seed、CI、自动化测试覆盖，公开前建议补齐最基本的工程化能力。
- 前端当前使用 `HashRouter`，静态部署更简单；如果要切到标准路由，需要同步调整服务端回退策略。

## Roadmap

- [ ] 补齐环境变量与配置模板
- [ ] 增加数据库 migration / seed
- [ ] 补齐 Docker 一体化部署方案
- [ ] 增加基础测试与 CI
- [ ] 增加更完整的开源项目分析能力

## License

当前仓库未附带开源许可证，正式公开前建议补充 `LICENSE`。
