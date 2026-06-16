import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "../../entities/comment.entity";
import { UserService } from "@/modules/user/user.service";
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentDetailDto,
  DeleteCommentDto,
  CommentListDto,
} from "./dto/comment.dto";
import { createRecordId } from "@/modules/auth/auth.constants";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private userService: UserService,
  ) {}

  // 创建留言
  async create(createCommentDto: CreateCommentDto, currentUserId?: string) {
    const currentUser = await this.userService.getCurrentUser(currentUserId);

    const comment = this.commentRepository.create({
      id: createRecordId(),
      ...createCommentDto,
      userId: currentUser.id,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    });
    return await this.commentRepository.save(comment);
  }

  // 获取留言列表（分页）
  async list(commentListDto: CommentListDto) {
    const { userId, nickname, account, type, source, page, pageSize } =
      commentListDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.user", "user")
      .select([
        "comment.id",
        "comment.content",
        "comment.userId",
        "comment.type",
        "comment.source",
        "comment.createdAt",
        "comment.updatedAt",
        "user.id",
        "user.nickname",
        "user.avatar",
      ]);

    if (userId?.trim()) {
      queryBuilder.andWhere("comment.userId = :userId", {
        userId: userId.trim(),
      });
    }

    if (nickname?.trim()) {
      queryBuilder.andWhere("user.nickname LIKE :nickname", {
        nickname: `%${nickname.trim()}%`,
      });
    }

    if (account?.trim()) {
      queryBuilder.andWhere("user.account LIKE :account", {
        account: `%${account.trim().toUpperCase()}%`,
      });
    }

    if (type) {
      queryBuilder.andWhere("comment.type = :type", {
        type,
      });
    }

    if (source !== undefined) {
      queryBuilder.andWhere("comment.source = :source", {
        source,
      });
    }

    const [list, total] = await queryBuilder
      .orderBy("comment.createdAt", "DESC")
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取留言详情
  async detail(commentDetailDto: CommentDetailDto) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentDetailDto.id },
    });

    if (!comment) {
      throw new NotFoundException("留言不存在");
    }

    return comment;
  }

  // 更新留言
  async update(updateCommentDto: UpdateCommentDto, currentUserId?: string) {
    const { id, ...updateData } = updateCommentDto;
    const currentUser = await this.userService.getCurrentUser(currentUserId);

    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException("留言不存在");
    }

    this.userService.ensureSelfOrAdmin(
      currentUser,
      comment.userId,
      "无权限修改该留言",
    );

    await this.commentRepository.update(id, updateData);

    return await this.commentRepository.findOne({
      where: { id },
    });
  }

  // 删除留言
  async delete(deleteCommentDto: DeleteCommentDto, currentUserId?: string) {
    const currentUser = await this.userService.getCurrentUser(currentUserId);
    const comment = await this.commentRepository.findOne({
      where: { id: deleteCommentDto.id },
    });

    if (!comment) {
      throw new NotFoundException("留言不存在");
    }

    this.userService.ensureSelfOrAdmin(
      currentUser,
      comment.userId,
      "无权限删除该留言",
    );

    await this.commentRepository.delete(deleteCommentDto.id);

    return { success: true };
  }
}
