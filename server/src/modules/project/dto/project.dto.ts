import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateProjectDto {
  @ApiProperty({ description: "项目名称", example: "我的项目" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: "项目描述",
    example: "这是一个很棒的项目",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Git仓库地址",
    example: "https://github.com/user/repo",
  })
  @IsOptional()
  @IsString()
  gitUrl?: string;

  @ApiPropertyOptional({ description: "Star数量", example: 100 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stars?: number;

  @ApiPropertyOptional({
    description: "封面图片URL",
    example: "https://example.com/cover.jpg",
  })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiPropertyOptional({
    description: "演示URL",
    example: "https://demo.example.com",
  })
  @IsOptional()
  @IsString()
  demoUrl?: string;

  @ApiPropertyOptional({
    description: "标签数组",
    example: ["React", "TypeScript"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateProjectDto {
  @ApiProperty({ description: "项目ID", example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;

  @ApiPropertyOptional({ description: "项目名称", example: "更新后的项目名" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "项目描述", example: "更新后的描述" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Git仓库地址",
    example: "https://github.com/user/repo",
  })
  @IsOptional()
  @IsString()
  gitUrl?: string;

  @ApiPropertyOptional({ description: "Star数量", example: 200 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  stars?: number;

  @ApiPropertyOptional({
    description: "封面图片URL",
    example: "https://example.com/cover.jpg",
  })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiPropertyOptional({
    description: "演示URL",
    example: "https://demo.example.com",
  })
  @IsOptional()
  @IsString()
  demoUrl?: string;

  @ApiPropertyOptional({
    description: "标签数组",
    example: ["Vue", "JavaScript"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ProjectDetailDto {
  @ApiProperty({ description: "项目ID", example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;
}

export class DeleteProjectDto {
  @ApiProperty({ description: "项目ID", example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;
}

export class ProjectListDto {
  @ApiPropertyOptional({ description: "项目名称筛选", example: "space" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "标签筛选", example: "React" })
  @IsOptional()
  @IsString()
  tag?: string;

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
