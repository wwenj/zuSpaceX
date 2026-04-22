# Agent 架构

## 定位

`agent` 模块为站内内容提供**问答与讲解能力**，不是通用聊天系统。当前主要场景：

- 以"作者分身"身份回答关于作者的问题
- 围绕文章内容做解析与讲解
- 围绕项目内容做说明与问答

## 核心文件

| 文件 | 职责 |
| --- | --- |
| `agent.controller.ts` | 对话接口、历史读取与清空 |
| `agent.service.ts` | 上下文组装、历史消息管理 |
| `agent-graph.service.ts` | LangGraph 图执行入口 |
| `agent-skill.registry.ts` | Skill 注册与切换 |
| `llm.config.ts` | 模型配置（provider / model / key） |

## 请求流程

```
前端 POST /api/agent/stream
  → 读取用户上下文与历史消息
  → agent-graph.service 组装执行图
  → 调用 LLM（流式）
  → SSE 逐 token 推送至前端
  → 写入 agent_message（已登录用户）
```

## 当前能力

- **流式输出** — SSE 实时推送
- **对话历史** — 读取与清空
- **Skill 机制** — 支持运行时切换不同 Skill
- **LangChain / LangGraph** — 模型调用与执行流编排

## 内置 Skill

| Skill | 说明 |
| --- | --- |
| `author_clone` | 作者分身，基于作者设定回答个人相关问题 |
| `general_helper` | 通用助手，围绕文章与项目内容做问答 |

## 扩展

新增 Skill 只需在 `agent-skill.registry.ts` 中注册，无需修改核心流程。模型提供方通过修改 `llm.config.ts` 切换，兼容任意 OpenAI 协议接口。
