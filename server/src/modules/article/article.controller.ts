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
import { ArticleService } from "./article.service";
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleDetailDto,
  DeleteArticleDto,
  ArticleListDto,
} from "./dto/article.dto";

@ApiTags("article")
@Controller("api/article")
@UsePipes(new ValidationPipe({ transform: true }))
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post("create")
  @ApiOperation({ summary: "创建文章" })
  @ApiResponse({ status: 200, description: "创建成功" })
  async create(@Body() body: CreateArticleDto, @Req() req: Request) {
    return this.articleService.create(body, req.userId);
  }

  @Get("list")
  @ApiOperation({ summary: "获取文章列表（分页）" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async list(@Query() query: ArticleListDto) {
    return this.articleService.list(query);
  }

  @Get("detail")
  @ApiOperation({ summary: "获取文章详情" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async detail(@Query() query: ArticleDetailDto) {
    return this.articleService.detail(query);
  }

  @Post("update")
  @ApiOperation({ summary: "更新文章" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async update(@Body() body: UpdateArticleDto, @Req() req: Request) {
    return this.articleService.update(body, req.userId);
  }

  @Post("delete")
  @ApiOperation({ summary: "删除文章" })
  @ApiResponse({ status: 200, description: "删除成功" })
  async delete(@Body() body: DeleteArticleDto, @Req() req: Request) {
    return this.articleService.delete(body, req.userId);
  }
}
