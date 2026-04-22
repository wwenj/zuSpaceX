import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AIMessageChunk, BaseMessageLike } from "@langchain/core/messages";
import { Response } from "express";
import { Repository } from "typeorm";
import {
  AgentMessage,
  AgentMessageRole,
} from "@/entities/agent-message.entity";
import { SYSTEM_ACTOR, createRecordId } from "@/modules/auth/auth.constants";
import { UserService } from "@/modules/user/user.service";
import { AgentGraphService } from "./agent-graph.service";
import { AgentSkillRegistry } from "./agent-skill.registry";
import { AgentStreamDto } from "./dto/agent.dto";

const HISTORY_LIMIT = 20;

interface AgentUsagePayload {
  inputToken: number;
  outputToken: number;
}

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentMessage)
    private readonly agentMessageRepository: Repository<AgentMessage>,
    private readonly userService: UserService,
    private readonly agentGraphService: AgentGraphService,
    private readonly skillRegistry: AgentSkillRegistry,
  ) {}

  async history(currentUserId?: string) {
    const currentUser = await this.userService.getCurrentUser(currentUserId);

    return this.agentMessageRepository.find({
      where: { userId: currentUser.id },
      order: { createdAt: "ASC", id: "ASC" },
    });
  }

  async clearHistory(currentUserId?: string) {
    const currentUser = await this.userService.getCurrentUser(currentUserId);

    await this.agentMessageRepository.delete({ userId: currentUser.id });
  }

  async stream(
    body: AgentStreamDto,
    currentUserId: string | undefined,
    res: Response,
  ) {
    const skill = this.skillRegistry.getSkill(body.skill);
    const content = body.content.trim();

    if (!content) {
      throw new BadRequestException("消息内容不能为空");
    }

    const historyMessages = currentUserId
      ? await this.loadRecentMessages(currentUserId, HISTORY_LIMIT)
      : [];
    const modelName = this.agentGraphService.getModelName();
    const operator = currentUserId || SYSTEM_ACTOR;

    if (currentUserId) {
      await this.saveMessage({
        userId: currentUserId,
        role: AgentMessageRole.USER,
        content,
        skill: skill.code,
        model: modelName,
        inputToken: 0,
        outputToken: 0,
        operator,
      });
    }

    this.initSseHeaders(res);
    this.writeSseEvent(res, "meta", {
      skill: skill.code,
      model: modelName,
    });

    const abortController = new AbortController();
    const handleClose = () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    };

    res.on("close", handleClose);

    let assistantContent = "";
    let usage: AgentUsagePayload = {
      inputToken: 0,
      outputToken: 0,
    };

    try {
      const agent = this.agentGraphService.getAgent(skill.code);
      const stream = await agent.stream(
        {
          messages: this.buildAgentMessages(historyMessages, content),
        },
        {
          streamMode: "messages",
          signal: abortController.signal,
        },
      );

      for await (const [message] of stream) {
        if (!AIMessageChunk.isInstance(message)) {
          continue;
        }

        const delta = message.text || "";

        if (delta) {
          assistantContent += delta;
          this.writeSseEvent(res, "delta", {
            content: delta,
          });
        }

        if (message.usage_metadata) {
          usage = this.normalizeUsage(message.usage_metadata);
        }
      }

      if (abortController.signal.aborted) {
        return;
      }

      if (currentUserId) {
        await this.saveMessage({
          userId: currentUserId,
          role: AgentMessageRole.ASSISTANT,
          content: assistantContent,
          skill: skill.code,
          model: modelName,
          inputToken: usage.inputToken,
          outputToken: usage.outputToken,
          operator,
        });
      }

      this.writeSseEvent(res, "done", {
        content: assistantContent,
        usage: {
          inputToken: usage.inputToken,
          outputToken: usage.outputToken,
        },
      });
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }

      this.writeSseEvent(res, "error", {
        code: this.resolveErrorCode(error),
        msg: this.resolveErrorMessage(error),
      });
    } finally {
      res.off("close", handleClose);

      if (!res.writableEnded && !res.destroyed) {
        res.end();
      }
    }
  }

  private buildAgentMessages(
    historyMessages: AgentMessage[],
    currentContent: string,
  ): BaseMessageLike[] {
    const history = historyMessages.map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));

    history.push({
      role: "user",
      content: currentContent,
    });

    return history;
  }

  private async loadRecentMessages(userId: string, limit: number) {
    const records = await this.agentMessageRepository.find({
      where: { userId },
      order: {
        createdAt: "DESC",
        id: "DESC",
      },
      take: limit,
    });

    return records.reverse();
  }

  private async saveMessage(payload: {
    userId: string;
    role: AgentMessageRole;
    content: string;
    skill: string;
    model: string;
    inputToken: number;
    outputToken: number;
    operator: string;
  }) {
    const entity = this.agentMessageRepository.create({
      id: createRecordId(),
      userId: payload.userId,
      role: payload.role,
      content: payload.content,
      skill: payload.skill,
      model: payload.model,
      inputToken: payload.inputToken,
      outputToken: payload.outputToken,
      createdBy: payload.operator,
      updatedBy: payload.operator,
    });

    return this.agentMessageRepository.save(entity);
  }

  private initSseHeaders(res: Response) {
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
  }

  private writeSseEvent(
    res: Response,
    event: "meta" | "delta" | "done" | "error",
    data: Record<string, unknown>,
  ) {
    if (res.writableEnded || res.destroyed) {
      return;
    }

    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  private normalizeUsage(usage?: unknown): AgentUsagePayload {
    const rawUsage =
      usage && typeof usage === "object"
        ? (usage as Record<string, unknown>)
        : {};

    return {
      inputToken: this.toSafeNumber(rawUsage.input_tokens),
      outputToken: this.toSafeNumber(rawUsage.output_tokens),
    };
  }

  private toSafeNumber(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  }

  private resolveErrorCode(_error: unknown): string {
    return "AGENT_STREAM_ERROR";
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "智能体响应失败";
  }
}
