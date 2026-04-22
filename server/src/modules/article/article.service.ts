import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Article } from "../../entities/article.entity";
import { UserService } from "@/modules/user/user.service";
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleDetailDto,
  DeleteArticleDto,
  ArticleListDto,
} from "./dto/article.dto";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private userService: UserService,
  ) {}

  // 创建文章
  async create(createArticleDto: CreateArticleDto, currentUserId?: string) {
    await this.userService.requireAdmin(currentUserId);
    const article = this.articleRepository.create(createArticleDto);
    return await this.articleRepository.save(article);
  }

  // 获取文章列表（分页）
  async list(articleListDto: ArticleListDto) {
    const { id, title, author, tag, showAll, page, pageSize } = articleListDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.articleRepository.createQueryBuilder("article");

    // 排除 content 字段，只查询列表需要的字段
    queryBuilder.select([
      "article.id",
      "article.author",
      "article.tag",
      "article.contentCount",
      "article.briefContent",
      "article.image",
      "article.title",
      "article.isTop",
      "article.isHidden",
      "article.createTime",
      "article.updateTime",
    ]);

    if (!showAll) {
      queryBuilder.andWhere("article.isHidden = :isHidden", {
        isHidden: false,
      });
    }

    if (id) {
      queryBuilder.andWhere("article.id = :id", { id });
    }

    if (title) {
      queryBuilder.andWhere("article.title LIKE :title", {
        title: `%${title}%`,
      });
    }

    if (author) {
      queryBuilder.andWhere("article.author LIKE :author", {
        author: `%${author}%`,
      });
    }

    if (tag) {
      queryBuilder.andWhere("article.tag LIKE :tag", {
        tag: `%${tag}%`,
      });
    }

    // 置顶文章优先，再按创建时间倒序
    const [list, total] = await queryBuilder
      .orderBy("article.isTop", "DESC")
      .addOrderBy("article.createTime", "DESC")
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

  // 获取文章详情
  async detail(articleDetailDto: ArticleDetailDto) {
    const article = await this.articleRepository.findOne({
      where: { id: articleDetailDto.id },
    });

    if (!article) {
      throw new NotFoundException("文章不存在");
    }

    return article;
  }

  // 更新文章
  async update(updateArticleDto: UpdateArticleDto, currentUserId?: string) {
    await this.userService.requireAdmin(currentUserId);
    const { id, ...updateData } = updateArticleDto;

    const article = await this.articleRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException("文章不存在");
    }

    await this.articleRepository.update(id, updateData);

    return await this.articleRepository.findOne({
      where: { id },
    });
  }

  // 删除文章
  async delete(deleteArticleDto: DeleteArticleDto, currentUserId?: string) {
    await this.userService.requireAdmin(currentUserId);
    const article = await this.articleRepository.findOne({
      where: { id: deleteArticleDto.id },
    });

    if (!article) {
      throw new NotFoundException("文章不存在");
    }

    await this.articleRepository.delete(deleteArticleDto.id);

    return { success: true };
  }
}
