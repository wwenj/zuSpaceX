import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCommentDto {
  @ApiProperty({ description: "留言内容", example: "这是一条留言" })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: "留言类型", example: "comment" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: "来源ID", example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  source?: number;
}

export class UpdateCommentDto {
  @ApiProperty({ description: "留言ID", example: "comment_001" })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiPropertyOptional({ description: "留言内容", example: "更新后的留言内容" })
  @IsOptional()
  @IsString()
  content?: string;
}

export class CommentDetailDto {
  @ApiProperty({ description: "留言ID", example: "comment_001" })
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class DeleteCommentDto {
  @ApiProperty({ description: "留言ID", example: "comment_001" })
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class CommentListDto {
  @ApiPropertyOptional({ description: "用户ID筛选", example: "user123" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: "用户昵称筛选", example: "阿祖" })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: "用户账号筛选", example: "ZU202504" })
  @IsOptional()
  @IsString()
  account?: string;

  @ApiPropertyOptional({ description: "留言类型筛选", example: "comment" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: "来源ID筛选", example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  source?: number;

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
