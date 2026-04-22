/// <reference types="jest" />

import {
  AgentMessage,
  AgentMessageRole,
} from "../../entities/agent-message.entity";
import { AgentService } from "./agent.service";

describe("AgentService", () => {
  const service = new AgentService(
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );

  it("应该按顺序拼装历史消息并追加当前用户输入", () => {
    const historyMessages: AgentMessage[] = [
      {
        id: "1",
        userId: "user_1",
        role: AgentMessageRole.USER,
        content: "第一句",
        skill: "author_clone",
        model: "glm-4.7-flash",
        inputToken: 0,
        outputToken: 0,
        createdAt: new Date("2026-04-10T10:00:00+08:00"),
        updatedAt: new Date("2026-04-10T10:00:00+08:00"),
        createdBy: "user_1",
        updatedBy: "user_1",
      },
      {
        id: "2",
        userId: "user_1",
        role: AgentMessageRole.ASSISTANT,
        content: "第二句",
        skill: "author_clone",
        model: "glm-4.7-flash",
        inputToken: 10,
        outputToken: 20,
        createdAt: new Date("2026-04-10T10:00:01+08:00"),
        updatedAt: new Date("2026-04-10T10:00:01+08:00"),
        createdBy: "user_1",
        updatedBy: "user_1",
      },
    ];

    const messages = (service as any).buildAgentMessages(historyMessages, "第三句");

    expect(messages).toEqual([
      { role: "user", content: "第一句" },
      { role: "assistant", content: "第二句" },
      { role: "user", content: "第三句" },
    ]);
  });
});
