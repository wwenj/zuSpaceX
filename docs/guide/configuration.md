# 配置说明

项目配置分三块：服务端、前端、Agent 模型。

## 服务端

| 文件 | 用途 |
| --- | --- |
| `server/src/config/mysql.config.ts` | MySQL 连接信息 |
| `server/env/.env.development` | 开发环境变量 |
| `server/env/.env.production` | 生产环境变量 |

主要配置项：MySQL 连接地址 / 用户名 / 密码、服务端监听端口。

## 前端

| 文件 | 用途 |
| --- | --- |
| `client/vite.config.ts` | 开发代理、构建配置 |
| `client/src/api/request.ts` | 请求基础路径 |

生产环境通过 `VITE_API_BASE_URL` 指定 API 地址，也可直接修改 `request.ts` 中的 `baseURL`。

## Agent 模型

| 文件 | 用途 |
| --- | --- |
| `server/src/modules/agent/llm.config.ts` | 模型提供方、名称、Base URL |
| `server/src/service/openai/openai.service.ts` | OpenAI SDK 初始化 |

支持任意 OpenAI 兼容接口（OpenAI、DeepSeek、本地模型等），修改 `llm.config.ts` 中的 `baseURL`、`model`、`apiKey` 即可切换。

## 建议

::: warning 公开部署前
- 将数据库密码、模型 API Key、生产域名全部改为环境变量
- 分别提供 `server/.env.example` 和 `client/.env.example`
- 不要将真实配置提交到仓库
:::
