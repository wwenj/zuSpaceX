import { Module } from "@nestjs/common";
import { AgentController } from "./agent.controller";
import { AgentGraphService } from "./agent-graph.service";
import { AgentService } from "./agent.service";
import { AgentSkillRegistry } from "./agent-skill.registry";
import { UserModule } from "@/modules/user/user.module";
import { ArticleModule } from "@/modules/article/article.module";
import { ProjectModule } from "@/modules/project/project.module";

@Module({
  imports: [UserModule, ArticleModule, ProjectModule],
  controllers: [AgentController],
  providers: [AgentSkillRegistry, AgentGraphService, AgentService],
  exports: [AgentService],
})
export class AgentModule {}
