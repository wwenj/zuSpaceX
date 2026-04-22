import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  ValidationPipe,
  UsePipes,
  Req,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request } from "express";
import { ProjectService } from "./project.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectDetailDto,
  DeleteProjectDto,
  ProjectListDto,
} from "./dto/project.dto";

@ApiTags("project")
@Controller("api/project")
@UsePipes(new ValidationPipe({ transform: true }))
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post("create")
  @ApiOperation({ summary: "创建项目" })
  @ApiResponse({ status: 200, description: "创建成功" })
  async create(@Body() body: CreateProjectDto, @Req() req: Request) {
    return this.projectService.create(body, req.userId);
  }

  @Get("list")
  @ApiOperation({ summary: "获取项目列表（分页）" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async list(@Query() query: ProjectListDto) {
    return this.projectService.list(query);
  }

  @Get("detail")
  @ApiOperation({ summary: "获取项目详情" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async detail(@Query() query: ProjectDetailDto) {
    return this.projectService.detail(query);
  }

  @Post("update")
  @ApiOperation({ summary: "更新项目" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async update(@Body() body: UpdateProjectDto, @Req() req: Request) {
    return this.projectService.update(body, req.userId);
  }

  @Post("delete")
  @ApiOperation({ summary: "删除项目" })
  @ApiResponse({ status: 200, description: "删除成功" })
  async delete(@Body() body: DeleteProjectDto, @Req() req: Request) {
    return this.projectService.delete(body, req.userId);
  }
}
