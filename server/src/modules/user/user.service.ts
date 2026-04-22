import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "../../entities/user.entity";
import { UserSession } from "@/entities/user-session.entity";
import {
  CreateUserDto,
  UpdateUserDto,
  UserDetailDto,
  DeleteUserDto,
  UserListDto,
} from "./dto/user.dto";
import {
  ACCOUNT_PATTERN,
  AUTH_AVATARS,
  NICKNAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  SYSTEM_ACTOR,
  createRecordId,
  normalizeAccount,
} from "@/modules/auth/auth.constants";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
  ) {}

  isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
    return Number(user?.role) === UserRole.ADMIN;
  }

  toPublicUser(user: User | null | undefined) {
    if (!user) {
      return null;
    }

    const { passwordHash: _passwordHash, ...publicUser } = user as User & {
      passwordHash?: string;
    };

    return publicUser;
  }

  async getCurrentUser(userId?: string): Promise<User> {
    if (!userId) {
      throw new UnauthorizedException("用户未登录");
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("当前用户不存在");
    }

    return this.toPublicUser(user) as User;
  }

  async requireAdmin(userId?: string): Promise<User> {
    const user = await this.getCurrentUser(userId);

    if (!this.isAdmin(user)) {
      throw new ForbiddenException("无管理员权限");
    }

    return user;
  }

  ensureSelfOrAdmin(currentUser: User, targetUserId: string, message?: string) {
    if (!this.isAdmin(currentUser) && currentUser.id !== targetUserId) {
      throw new ForbiddenException(message || "无权限执行该操作");
    }
  }

  // 创建用户
  async create(createUserDto: CreateUserDto, currentUserId?: string) {
    await this.requireAdmin(currentUserId);

    const { role = UserRole.USER, ...userData } = createUserDto;
    const account = this.validateAccount(userData.account);
    this.validatePassword(userData.password);
    this.validateNickname(userData.nickname);
    this.validateAvatar(userData.avatar);

    const existingUser = await this.userRepository.findOne({
      where: { account },
    });

    if (existingUser) {
      throw new ConflictException("账号已存在");
    }

    const user = this.userRepository.create({
      id: createRecordId(),
      account,
      passwordHash: await bcrypt.hash(userData.password, 10),
      nickname: userData.nickname?.trim() || "匿名",
      intro: userData.intro?.trim() || "",
      avatar: userData.avatar || AUTH_AVATARS[0],
      gameScore: userData.gameScore || 0,
      role,
      createdBy: currentUserId || SYSTEM_ACTOR,
      updatedBy: currentUserId || SYSTEM_ACTOR,
    });
    const savedUser = await this.userRepository.save(user);
    return this.toPublicUser(savedUser);
  }

  // 获取用户列表（分页）
  async list(userListDto: UserListDto, currentUserId?: string) {
    await this.requireAdmin(currentUserId);

    const { id, account, nickname, role, page, pageSize } = userListDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (id?.trim()) {
      queryBuilder.andWhere("user.id LIKE :id", {
        id: `%${id.trim()}%`,
      });
    }

    if (account?.trim()) {
      queryBuilder.andWhere("user.account LIKE :account", {
        account: `%${normalizeAccount(account)}%`,
      });
    }

    if (nickname?.trim()) {
      queryBuilder.andWhere("user.nickname LIKE :nickname", {
        nickname: `%${nickname.trim()}%`,
      });
    }

    if (role !== undefined) {
      queryBuilder.andWhere("user.role = :role", {
        role,
      });
    }

    const [list, total] = await queryBuilder
      .orderBy("user.createdAt", "DESC")
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list: list.map((user) => this.toPublicUser(user)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取用户详情
  async detail(userDetailDto: UserDetailDto, currentUserId?: string) {
    const currentUser = await this.getCurrentUser(currentUserId);
    this.ensureSelfOrAdmin(currentUser, userDetailDto.id, "无权限查看该用户");

    const user = await this.userRepository.findOne({
      where: { id: userDetailDto.id },
    });

    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    return this.toPublicUser(user);
  }

  // 更新用户
  async update(updateUserDto: UpdateUserDto, currentUserId?: string) {
    const { id, role, ...updateData } = updateUserDto;
    const currentUser = await this.getCurrentUser(currentUserId);
    this.ensureSelfOrAdmin(currentUser, id, "无权限修改该用户");

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    const nextData: Partial<User> = {};

    if (updateData.nickname !== undefined) {
      this.validateNickname(updateData.nickname);
      nextData.nickname = updateData.nickname.trim();
    }

    if (updateData.avatar !== undefined) {
      this.validateAvatar(updateData.avatar);
      nextData.avatar = updateData.avatar;
    }

    if (updateData.intro !== undefined) {
      nextData.intro = updateData.intro.trim();
    }

    if (updateData.gameScore !== undefined) {
      nextData.gameScore = updateData.gameScore;
    }

    if (role !== undefined) {
      if (!this.isAdmin(currentUser)) {
        throw new ForbiddenException("仅管理员可修改角色");
      }
      nextData.role = role;
    }

    nextData.updatedBy = currentUser.id;

    await this.userRepository.update(id, nextData);

    const updatedUser = await this.userRepository.findOne({
      where: { id },
    });

    return this.toPublicUser(updatedUser);
  }

  // 删除用户
  async delete(deleteUserDto: DeleteUserDto, currentUserId?: string) {
    await this.requireAdmin(currentUserId);

    const user = await this.userRepository.findOne({
      where: { id: deleteUserDto.id },
    });

    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    await this.userSessionRepository.delete({ userId: deleteUserDto.id });
    await this.userRepository.delete(deleteUserDto.id);

    return { success: true };
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

  private validateNickname(nickname?: string) {
    if (nickname === undefined) {
      return;
    }

    const normalized = nickname.trim();
    if (normalized.length === 0 || normalized.length > NICKNAME_MAX_LENGTH) {
      throw new BadRequestException("昵称长度必须在1到8个字符之间");
    }
  }

  private validateAvatar(avatar?: string) {
    if (avatar === undefined) {
      return;
    }

    if (!AUTH_AVATARS.includes(avatar)) {
      throw new BadRequestException("头像不合法");
    }
  }
}
