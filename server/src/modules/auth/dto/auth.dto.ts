import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";
import {
  NICKNAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/modules/auth/auth.constants";

export class RegisterDto {
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

  @ApiProperty({ description: "昵称", example: "阿祖" })
  @IsNotEmpty()
  @IsString()
  @Length(1, NICKNAME_MAX_LENGTH)
  nickname: string;

  @ApiProperty({ description: "头像", example: "https://example.com/a.png" })
  @IsNotEmpty()
  @IsString()
  avatar: string;
}

export class LoginDto {
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
}
