# Agent 架构

## 模块定位

`agent` 模块用于给站内内容增加问答和讲解能力，不是独立聊天系统。

当前主要场景：

- 围绕文章做内容解析
- 围绕项目做问答
- 以“作者分身”方式提供站内导览

## 核心文件

- `agent.controller.ts`
- `agent.service.ts`
- `agent-graph.service.ts`
- `agent-skill.registry.ts`
- `llm.config.ts`

## 请求流程

1. 前端调用 `/api/agent/stream`
2. 服务端读取当前用户上下文和历史消息
3. `agent-graph.service` 组装模型与执行流
4. 结果通过 SSE 流式返回前端
5. 已登录用户的对话会写入 `agent_message`

## 当前能力

- 流式输出
- 对话历史读取与清空
- skill 注册与切换
- 基于 LangChain / LangGraph 的调用编排

## 当前 skill

- `author_clone`：作者分身
- `general_helper`：通用助手
