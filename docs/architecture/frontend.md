# 前端架构

## 技术栈

| 技术 | 用途 |
| --- | --- |
| React 19 | UI 框架 |
| TypeScript | 类型系统 |
| Vite | 构建工具 |
| React Router | 路由管理 |
| Tailwind CSS | 样式方案 |
| Radix UI | 无障碍基础组件 |

## 页面结构

**公开站点**

| 路由 | 页面 |
| --- | --- |
| `/` | 首页 |
| `/about` | 个人介绍 |
| `/blog` | 博客列表 |
| `/blog/:id` | 博客详情 |
| `/projects` | 项目展示 |
| `/guestbook` | 留言板 |
| `/chat` | AI 对话 |
| `/login` | 登录 / 注册 |
| `/profile` | 个人中心 |

**管理后台**

| 路由 | 页面 |
| --- | --- |
| `/admin/articles` | 文章管理 |
| `/admin/projects` | 项目管理 |
| `/admin/comments` | 留言管理 |
| `/admin/users` | 用户管理 |

## 代码组织

```
client/src/
├── pages/        # 公开页面
├── admin/        # 管理后台
├── layouts/      # 页面布局
├── router/       # 路由配置
├── api/          # 请求封装
└── components/   # 通用组件
```

## 关键设计

- **HashRouter** — 静态部署与一体化部署均无需服务端路由配置
- **`/api` 代理** — 开发环境通过 Vite 代理转发；生产环境与服务端同域，无需跨域处理
- **权限控制** — 前端基于登录态控制路由访问，实际权限校验在服务端
