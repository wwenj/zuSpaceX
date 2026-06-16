import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AgentService } from "./agent.service";
import { AgentStreamDto } from "./dto/agent.dto";

@ApiTags("agent")
@Controller("api/agent")
@UsePipes(new ValidationPipe({ transform: true }))
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post("stream")
  @ApiOperation({ summary: "智能体流式对话" })
  @ApiResponse({ status: 200, description: "请求成功" })
  async stream(
    @Body() body: AgentStreamDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.agentService.stream(body, req.userId, res);
  }

  @Get("history")
  @ApiOperation({ summary: "获取当前用户的对话历史" })
  @ApiResponse({ status: 200, description: "请求成功" })
  async history(@Req() req: Request) {
    return this.agentService.history(req.userId);
  }

  @Delete("history")
  @ApiOperation({ summary: "清空当前用户的对话历史" })
  @ApiResponse({ status: 200, description: "请求成功" })
  async clearHistory(@Req() req: Request) {
    await this.agentService.clearHistory(req.userId);
  }
}
