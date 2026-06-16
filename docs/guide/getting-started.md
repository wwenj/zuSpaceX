# 快速开始

## 环境要求

| 依赖    | 版本 |
| ------- | ---- |
| Node.js | ≥ 18 |
| pnpm    | ≥ 8  |
| MySQL   | 8.x  |

## 数据库准备

项目不内置 migration / seed，首次运行前需手动建库建表。

根目录 `sql/init.sql` 已提供完整建表语句，直接执行即可：

```bash
mysql -u root -p < sql/init.sql
```

建表完成后，在 `server/src/config/mysql.config.ts` 中填写数据库连接信息（host、port、username、password、database）。

建表后还需要创建管理员账号：

1. 启动服务端后，通过注册接口创建一个普通用户
2. 手动在数据库里将该用户的 `role` 字段修改为 `1`，提升为管理员，作为当前系统的初始管理员

## 本地启动

**启动服务端：**

```bash
cd server
pnpm install
npm run start:dev
```

**启动前端（新开一个终端）：**

```bash
cd client
pnpm install
pnpm run dev
```

启动后访问地址：

| 服务    | 地址                           |
| ------- | ------------------------------ |
| 前端    | http://localhost:3000          |
| API     | http://localhost:3001          |
| Swagger | http://localhost:3001/api-docs |

开发环境下，前端已配置 `/api` 代理，所有接口请求自动转发到 `http://localhost:3001`，无需额外配置跨域。

## 构建与部署

### 手动构建 + 手动部署

在本地执行构建脚本：

```bash
bash build.sh
```

脚本会依次完成：构建前端 → 将前端产物拷贝到 `server/views` 和 `server/public` → 构建服务端，最终产物在 `server/dist`。

将以下文件上传到服务器：

```
server/dist/         # 编译产物
server/views/        # 前端 HTML
server/public/       # 前端静态资源
server/package.json
server/node_modules/ # 或在服务器上重新 pnpm install
```

在服务器上启动服务：

```bash
cd server
npm run start:prod
```

服务默认监听 `8080` 端口，可在 `server/env/.env.production` 中修改。

### Docker 构建部署一体化（推荐）

`Dockerfile` 内已包含前后端完整构建逻辑，无需本地预先执行 `build.sh`，直接构建镜像即可：

```bash
docker build -t zuspace .
docker run -p 8080:8080 zuspace
```

通常不需要本地构建镜像，将代码推送到服务厂商的容器部署平台后，平台会自动拉取代码并执行 `Dockerfile` 完成构建和部署。

## AI Agent 配置

项目的 AI 对话能力依赖外部大模型服务，运行前需配置模型接入信息。

编辑 `server/src/modules/agent/llm.config.ts`，填写：

- `baseURL` — 模型服务地址（支持 OpenAI 及兼容接口）
- `model` — 模型名称
- `apiKey` — 模型 API Key

温馨提示：可以先用智谱平台的免费模型测试下，申请个 api-key 就可以不需要花钱

支持 OpenAI、DeepSeek、本地部署的兼容模型等任意 OpenAI 协议接口。
