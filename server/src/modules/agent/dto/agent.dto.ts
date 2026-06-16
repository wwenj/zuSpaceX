import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class AgentStreamDto {
  @ApiProperty({
    description: "用户输入内容",
    example: "帮我整理一下这个需求的实现方案",
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20000)
  content: string;

  @ApiPropertyOptional({
    description: "技能编码，不传默认使用 author_clone",
    example: "author_clone",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  skill?: string;
}
