import {
  Length,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsIn,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "@/entities/user.entity";
import {
  NICKNAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/modules/auth/auth.constants";

export class CreateUserDto {
  @ApiProperty({ description: "登录账号", example: "ZU202504" })
  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  account: string;

  @ApiProperty({ description: "登录密码", example: "12345678" })
  @IsNotEmpty()
  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  password: string;

  @ApiPropertyOptional({ description: "用户昵称", example: "张三" })
  @IsOptional()
  @IsString()
  @Length(1, NICKNAME_MAX_LENGTH)
  nickname?: string;

  @ApiPropertyOptional({ description: "用户简介", example: "这是我的个人简介" })
  @IsOptional()
  @IsString()
  intro?: string;

  @ApiPropertyOptional({
    description: "用户头像URL",
    example: "https://example.com/avatar.jpg",
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: "游戏分数", example: 100 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gameScore?: number;

  @ApiPropertyOptional({ description: "角色 1管理，0用户", example: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsIn([UserRole.USER, UserRole.ADMIN])
  role?: number;
}

export class UpdateUserDto {
  @ApiProperty({ description: "用户ID", example: "user_123456" })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiPropertyOptional({ description: "用户昵称", example: "李四" })
  @IsOptional()
  @IsString()
  @Length(1, NICKNAME_MAX_LENGTH)
  nickname?: string;

  @ApiPropertyOptional({ description: "用户简介", example: "更新后的简介" })
  @IsOptional()
  @IsString()
  intro?: string;

  @ApiPropertyOptional({
    description: "用户头像URL",
    example: "https://example.com/new-avatar.jpg",
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: "游戏分数", example: 200 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gameScore?: number;

  @ApiPropertyOptional({ description: "角色 1管理，0用户", example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsIn([UserRole.USER, UserRole.ADMIN])
  role?: number;
}

export class UserDetailDto {
  @ApiProperty({ description: "用户ID", example: "user_123456" })
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class DeleteUserDto {
  @ApiProperty({ description: "用户ID", example: "user_123456" })
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class UserListDto {
  @ApiPropertyOptional({ description: "用户ID筛选", example: "user_123456" })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: "账号筛选", example: "ZU202504" })
  @IsOptional()
  @IsString()
  account?: string;

  @ApiPropertyOptional({ description: "用户名筛选", example: "阿祖" })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: "角色筛选 1管理，0用户", example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsIn([UserRole.USER, UserRole.ADMIN])
  role?: number;

  @ApiPropertyOptional({ description: "页码", example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "每页数量", example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  pageSize?: number = 10;
}
