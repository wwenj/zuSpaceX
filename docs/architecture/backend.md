# 服务端架构

## 技术栈

| 技术 | 用途 |
| --- | --- |
| NestJS | 服务端框架 |
| TypeORM | ORM |
| MySQL | 数据库 |
| Swagger | API 文档（仅开发环境） |
| express-session | 登录态管理 |

## 目录结构

```
server/src/
├── common/       # 中间件、过滤器、日志、数据库工具
├── config/       # 配置文件（MySQL、环境变量）
├── entities/     # TypeORM 实体定义
├── modules/      # 业务模块
└── service/      # 通用服务（OpenAI 等）
```

## 业务模块

| 模块 | 职责 |
| --- | --- |
| `auth` | 注册、登录、Session / Cookie |
| `user` | 用户信息查询与后台用户管理 |
| `article` | 文章 CRUD 与后台管理 |
| `project` | 项目 CRUD 与后台管理 |
| `comment` | 留言与文章评论 |
| `agent` | 对话入口、历史消息、模型调用编排 |
| `health` | 健康检查 |

## 请求链路

```
请求进入
  → SessionMiddleware（解析登录态）
  → 全局参数校验（ValidationPipe）
  → 业务 Controller / Service
  → 全局异常过滤器（统一错误响应）
  → 返回响应
```

**静态资源与 SPA 回退** 由 `ViewMiddleware` 处理，将非 API 请求指向前端 `index.html`。

## 数据实体

| 实体 | 说明 |
| --- | --- |
| `user` | 用户账号与角色 |
| `user_session` | 登录会话 |
| `article` | 博客文章 |
| `project` | 开源项目 |
| `comment` | 留言与评论 |
| `agent_message` | AI 对话历史 |
