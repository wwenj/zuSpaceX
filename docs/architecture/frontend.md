# 前端架构

## 技术栈

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI

## 页面结构

当前前端分成两类页面：

- `/`
- `/blog`
- `/blog/:id`
- `/projects`
- `/about`
- `/guestbook`
- `/chat`
- `/login`
- `/profile`

后台页面：

- `/admin/articles`
- `/admin/projects`
- `/admin/comments`
- `/admin/users`

## 代码组织

```text
client/src/
├── pages/        # 公开页面
├── admin/        # 管理后台
├── layouts/      # 页面布局
├── router/       # 路由配置
├── api/          # 请求封装
└── components/   # 通用组件
```

## 关键实现

- 使用 `HashRouter`，静态部署和一体化部署都更稳定
- `client/src/api` 统一封装请求，前端通过 `/api/*` 与服务端通信
- 博客详情、留言板、后台管理和聊天页都在同一套路由体系里

## 当前边界

- 页面渲染、交互和请求在前端处理
- 权限、会话、数据持久化都交给服务端
