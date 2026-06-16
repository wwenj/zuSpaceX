import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@/entities/user.entity";
import { UserSession } from "@/entities/user-session.entity";
import { AuthController } from "@/modules/auth/auth.controller";
import { AuthService } from "@/modules/auth/auth.service";
import { UserModule } from "@/modules/user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession]), UserModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
