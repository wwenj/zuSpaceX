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
import { CommentService } from "./comment.service";
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentDetailDto,
  DeleteCommentDto,
  CommentListDto,
} from "./dto/comment.dto";

@ApiTags("comment")
@Controller("api/comment")
@UsePipes(new ValidationPipe({ transform: true }))
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post("create")
  @ApiOperation({ summary: "创建留言" })
  @ApiResponse({ status: 200, description: "创建成功" })
  async create(@Body() body: CreateCommentDto, @Req() req: Request) {
    return this.commentService.create(body, req.userId);
  }

  @Get("list")
  @ApiOperation({ summary: "获取留言列表（分页）" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async list(@Query() query: CommentListDto) {
    return this.commentService.list(query);
  }

  @Get("detail")
  @ApiOperation({ summary: "获取留言详情" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async detail(@Query() query: CommentDetailDto) {
    return this.commentService.detail(query);
  }

  @Post("update")
  @ApiOperation({ summary: "更新留言" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async update(@Body() body: UpdateCommentDto, @Req() req: Request) {
    return this.commentService.update(body, req.userId);
  }

  @Post("delete")
  @ApiOperation({ summary: "删除留言" })
  @ApiResponse({ status: 200, description: "删除成功" })
  async delete(@Body() body: DeleteCommentDto, @Req() req: Request) {
    return this.commentService.delete(body, req.userId);
  }
}
