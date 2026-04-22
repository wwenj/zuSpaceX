# 服务端架构

## 技术栈

- NestJS
- TypeORM
- MySQL
- Swagger
- Session 鉴权

## 目录结构

```text
server/src/
├── common/       # 中间件、过滤器、日志、数据库能力
├── config/       # 配置文件
├── entities/     # TypeORM 实体
├── modules/      # 业务模块
└── service/      # 通用服务
```

## 核心模块

- `auth`
- `user`
- `article`
- `project`
- `comment`
- `health`
- `agent`

## 关键职责

- `auth` 负责注册、登录、Session 与 Cookie
- `user` 负责当前用户信息和后台用户管理
- `article`、`project`、`comment` 负责内容数据与后台维护
- `agent` 负责对话入口、历史消息和模型调用编排

## 运行机制

- 统一参数校验
- 全局异常处理
- 请求日志拦截
- `SessionMiddleware` 解析登录态
- `ViewMiddleware` 负责静态资源和 SPA 路由回退
- Swagger 仅在开发环境开放

## 数据层

当前核心实体包括：

- `user`
- `user_session`
- `article`
- `project`
- `comment`
- `agent_message`
