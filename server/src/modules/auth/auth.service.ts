import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createHash, randomBytes } from "crypto";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "@/entities/user.entity";
import { UserSession } from "@/entities/user-session.entity";
import { UserService } from "@/modules/user/user.service";
import { LoginDto, RegisterDto } from "@/modules/auth/dto/auth.dto";
import {
  ACCOUNT_PATTERN,
  AUTH_AVATARS,
  NICKNAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  SESSION_MAX_AGE,
  SYSTEM_ACTOR,
  createRecordId,
  normalizeAccount,
} from "@/modules/auth/auth.constants";

interface SessionContext {
  ip: string;
  userAgent: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly userService: UserService,
  ) {}

  async register(registerDto: RegisterDto, context: SessionContext) {
    const account = this.validateAccount(registerDto.account);
    this.validatePassword(registerDto.password);
    this.validateNickname(registerDto.nickname);
    this.validateAvatar(registerDto.avatar);

    const existingUser = await this.userRepository.findOne({
      where: { account },
    });

    if (existingUser) {
      throw new ConflictException("账号已存在");
    }

    const user = this.userRepository.create({
      id: createRecordId(),
      account,
      passwordHash: await bcrypt.hash(registerDto.password, 10),
      nickname: registerDto.nickname.trim(),
      avatar: registerDto.avatar,
      intro: "",
      role: UserRole.USER,
      gameScore: 0,
      createdBy: SYSTEM_ACTOR,
      updatedBy: SYSTEM_ACTOR,
    });

    const savedUser = await this.userRepository.save(user);
    const sessionToken = await this.createSession(savedUser.id, context);

    return {
      user: this.userService.toPublicUser(savedUser),
      sessionToken,
    };
  }

  async login(loginDto: LoginDto, context: SessionContext) {
    const account = this.validateAccount(loginDto.account);
    this.validatePassword(loginDto.password);

    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.account = :account", { account })
      .getOne();

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("账号或密码错误");
    }

    const matched = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException("账号或密码错误");
    }

    const sessionToken = await this.createSession(user.id, context);
    return {
      user: this.userService.toPublicUser(user),
      sessionToken,
    };
  }

  async getCurrentUser(userId?: string) {
    return this.userService.getCurrentUser(userId);
  }

  async logout(sessionToken?: string) {
    if (!sessionToken) {
      return;
    }

    await this.userSessionRepository.delete({
      tokenHash: this.hashSessionToken(sessionToken),
    });
  }

  async validateSessionToken(sessionToken?: string) {
    if (!sessionToken) {
      return null;
    }

    const session = await this.userSessionRepository.findOne({
      where: { tokenHash: this.hashSessionToken(sessionToken) },
    });

    if (!session) {
      return null;
    }

    if (session.expireAt.getTime() <= Date.now()) {
      await this.userSessionRepository.delete({ id: session.id });
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { id: session.userId },
    });

    if (!user) {
      await this.userSessionRepository.delete({ id: session.id });
      return null;
    }

    return {
      sessionId: session.id,
      userId: user.id,
    };
  }

  private async createSession(userId: string, context: SessionContext) {
    const sessionToken = randomBytes(32).toString("hex");
    const session = this.userSessionRepository.create({
      id: createRecordId(),
      userId,
      tokenHash: this.hashSessionToken(sessionToken),
      expireAt: new Date(Date.now() + SESSION_MAX_AGE),
      clientIp: context.ip,
      userAgent: context.userAgent,
      createdBy: userId,
      updatedBy: userId,
    });

    await this.userSessionRepository.save(session);
    return sessionToken;
  }

  private validateAccount(account: string) {
    const normalized = normalizeAccount(account);
    if (!ACCOUNT_PATTERN.test(normalized)) {
      throw new BadRequestException("账号必须是8位字母或数字");
    }
    return normalized;
  }

  private validatePassword(password: string) {
    if (
      password.length < PASSWORD_MIN_LENGTH ||
      password.length > PASSWORD_MAX_LENGTH
    ) {
      throw new BadRequestException("密码长度必须在8到32位之间");
    }
  }

  private validateNickname(nickname: string) {
    const normalized = nickname.trim();
    if (normalized.length === 0 || normalized.length > NICKNAME_MAX_LENGTH) {
      throw new BadRequestException("昵称长度必须在1到8个字符之间");
    }
  }

  private validateAvatar(avatar: string) {
    if (!AUTH_AVATARS.includes(avatar)) {
      throw new BadRequestException("头像不合法");
    }
  }

  private hashSessionToken(sessionToken: string) {
    return createHash("sha256").update(sessionToken).digest("hex");
  }
}
