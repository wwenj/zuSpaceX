import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateArticleDto {
  @ApiPropertyOptional({ description: "作者", example: "张三" })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: "标签数组", example: ["技术", "前端"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tag?: string[];

  @ApiProperty({ description: "文章内容", example: "这是文章的正文内容..." })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: "内容字数", example: 1000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contentCount?: number;

  @ApiPropertyOptional({ description: "简介", example: "这是文章简介" })
  @IsOptional()
  @IsString()
  briefContent?: string;

  @ApiPropertyOptional({
    description: "封面图片URL",
    example: "https://example.com/image.jpg",
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: "文章标题", example: "我的第一篇文章" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: "是否置顶", example: false })
  @IsOptional()
  @IsBoolean()
  isTop?: boolean;

  @ApiPropertyOptional({ description: "是否隐藏", example: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}

export class UpdateArticleDto {
  @ApiProperty({ description: "文章ID", example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;

  @ApiPropertyOptional({ description: "作者", example: "张三" })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: "标签数组", example: ["技术", "前端"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tag?: string[];

  @ApiPropertyOptional({
    description: "文章内容",
    example: "更新后的文章内容...",
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: "内容字数", example: 1000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contentCount?: number;

  @ApiPropertyOptional({ description: "简介", example: "更新后的简介" })
  @IsOptional()
  @IsString()
  briefContent?: string;

  @ApiPropertyOptional({
    description: "封面图片URL",
    example: "https://example.com/image.jpg",
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: "文章标题", example: "更新后的标题" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: "是否置顶", example: false })
  @IsOptional()
  @IsBoolean()
  isTop?: boolean;

  @ApiPropertyOptional({ description: "是否隐藏", example: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}

export class ArticleDetailDto {
  @ApiProperty({ description: "文章ID", example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;
}

export class DeleteArticleDto {
  @ApiProperty({ description: "文章ID", example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;
}

export class ArticleListDto {
  @ApiPropertyOptional({ description: "文章ID筛选", example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  id?: number;

  @ApiPropertyOptional({ description: "标题筛选", example: "NestJS" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: "作者筛选", example: "张三" })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: "标签筛选", example: "技术" })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    description: "是否返回全部文章，false 时仅返回可见文章",
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === "true")
  showAll?: boolean = false;

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
