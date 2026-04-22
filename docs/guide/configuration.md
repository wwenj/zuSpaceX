# 配置说明

## 配置入口

当前项目的配置主要分为三块：

- 服务端运行配置
- 前端构建与请求配置
- Agent 模型配置

## 服务端

重点文件：

- `server/src/config/mysql.config.ts`
- `server/env/.env.development`
- `server/env/.env.production`

主要负责：

- MySQL 连接信息
- 服务端监听端口
- 开发 / 生产环境切换

## 前端

重点文件：

- `client/src/api/request.ts`
- `client/vite.config.ts`

主要负责：

- `VITE_API_BASE_URL`
- 生产环境 API 地址
- 静态资源基础路径

## Agent

重点文件：

- `server/src/modules/agent/llm.config.ts`
- `server/src/service/openai/openai.service.ts`

主要负责：

- 模型提供方
- 模型名
- 基础 URL
- API Key

## 建议

- 数据库密码、模型密钥、生产域名全部改为环境变量
- 前端与服务端分别提供 `.env.example`
- 不要把真实生产配置直接提交到仓库
