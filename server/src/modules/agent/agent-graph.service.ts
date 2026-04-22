import { Injectable } from "@nestjs/common";
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ArticleService } from "@/modules/article/article.service";
import { ProjectService } from "@/modules/project/project.service";
import { AgentSkillRegistry } from "./agent-skill.registry";
import { LLMProvider, createLLMModel, getModelName } from "./llm.config";

type AgentInstance = ReturnType<typeof createAgent>;

@Injectable()
export class AgentGraphService {
  private readonly agentMap = new Map<string, AgentInstance>();
  private currentProvider: LLMProvider = LLMProvider.DEEPSEEK;
  private model: ChatOpenAI | null = null;

  constructor(
    private readonly skillRegistry: AgentSkillRegistry,
    private readonly articleService: ArticleService,
    private readonly projectService: ProjectService,
  ) {}

  getModelName(): string {
    return getModelName(this.currentProvider);
  }

  setProvider(provider: LLMProvider): void {
    this.currentProvider = provider;
    this.model = null;
    this.agentMap.clear();
  }

  getCurrentProvider(): LLMProvider {
    return this.currentProvider;
  }

  getAgent(skillCode?: string): AgentInstance {
    const skill = this.skillRegistry.getSkill(skillCode);
    const cachedAgent = this.agentMap.get(skill.code);

    if (cachedAgent) {
      return cachedAgent;
    }

    const tools = skill.enableTools ? this.buildTools() : [];

    const agent = createAgent({
      model: this.getModel(),
      tools,
      systemPrompt: skill.systemPrompt,
    });

    this.agentMap.set(skill.code, agent);

    return agent;
  }

  private buildTools() {
    const getAllArticles = tool(
      async () => {
        console.log("[Tool] get_all_articles called");
        try {
          const result = await this.articleService.list({
            page: 1,
            pageSize: 200,
            showAll: false,
          } as any);

          if (!result.list.length) {
            return "暂无文章";
          }

          return JSON.stringify(
            result.list.map((a: any) => ({
              id: a.id,
              title: a.title,
              brief: a.briefContent,
              tags: a.tag,
              createTime: a.createTime,
            })),
          );
        } catch {
          return "查询文章失败";
        }
      },
      {
        name: "get_all_articles",
        description:
          "获取阿祖所有已发布的技术文章列表（含 id、标题、摘要、标签），用于推荐文章或查找特定文章的 id",
        schema: z.object({}),
      },
    );

    const getArticleDetail = tool(
      async ({ id }: { id: number }) => {
        console.log("[Tool] get_article_detail called", { id });
        try {
          const article = await this.articleService.detail({ id });

          return JSON.stringify({
            title: article.title,
            tags: article.tag,
            content: article.content,
            createTime: article.createTime,
          });
        } catch {
          return "文章不存在或查询失败";
        }
      },
      {
        name: "get_article_detail",
        description:
          "获取某篇文章的完整内容，用于详细讲解，需先通过 get_all_articles 获取文章 id",
        schema: z.object({
          id: z.number().describe("文章 ID，从 get_all_articles 结果中获取"),
        }),
      },
    );

    const getAllProjects = tool(
      async () => {
        console.log("[Tool] get_all_projects called");
        try {
          const result = await this.projectService.list({
            page: 1,
            pageSize: 200,
          } as any);

          if (!result.list.length) {
            return "暂无项目";
          }

          return JSON.stringify(
            result.list.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              tags: p.tags,
              stars: p.stars,
              gitUrl: p.gitUrl,
              demoUrl: p.demoUrl,
            })),
          );
        } catch {
          return "查询项目失败";
        }
      },
      {
        name: "get_all_projects",
        description: "获取阿祖所有开源项目列表，用于介绍或推荐项目",
        schema: z.object({}),
      },
    );

    return [getAllArticles, getArticleDetail, getAllProjects];
  }

  private getModel(): ChatOpenAI {
    if (!this.model) {
      this.model = createLLMModel(this.currentProvider);
    }
    return this.model;
  }
}
