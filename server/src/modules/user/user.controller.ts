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
import { UserService } from "./user.service";
import {
  CreateUserDto,
  UpdateUserDto,
  UserDetailDto,
  DeleteUserDto,
  UserListDto,
} from "./dto/user.dto";

@ApiTags("user")
@Controller("api/user")
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("create")
  @ApiOperation({ summary: "创建用户" })
  @ApiResponse({ status: 200, description: "创建成功" })
  async create(@Body() body: CreateUserDto, @Req() req: Request) {
    return this.userService.create(body, req.userId);
  }

  @Get("list")
  @ApiOperation({ summary: "获取用户列表（分页）" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async list(@Query() query: UserListDto, @Req() req: Request) {
    return this.userService.list(query, req.userId);
  }

  @Get("detail")
  @ApiOperation({ summary: "获取用户详情" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async detail(@Query() query: UserDetailDto, @Req() req: Request) {
    return this.userService.detail(query, req.userId);
  }

  @Post("update")
  @ApiOperation({ summary: "更新用户" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async update(@Body() body: UpdateUserDto, @Req() req: Request) {
    return this.userService.update(body, req.userId);
  }

  @Post("delete")
  @ApiOperation({ summary: "删除用户" })
  @ApiResponse({ status: 200, description: "删除成功" })
  async delete(@Body() body: DeleteUserDto, @Req() req: Request) {
    return this.userService.delete(body, req.userId);
  }

  @Get("me")
  @ApiOperation({ summary: "获取当前登录用户信息" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getCurrentUser(@Req() req: Request) {
    return this.userService.getCurrentUser(req.userId);
  }
}
