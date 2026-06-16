import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "../../entities/project.entity";
import { UserService } from "@/modules/user/user.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectDetailDto,
  DeleteProjectDto,
  ProjectListDto,
} from "./dto/project.dto";

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private userService: UserService,
  ) {}

  // 创建项目
  async create(createProjectDto: CreateProjectDto, currentUserId?: string) {
    await this.userService.requireAdmin(currentUserId);
    const payload = this.normalizeProjectPayload(createProjectDto);
    this.ensureProjectLinks(payload.gitUrl, payload.demoUrl);

    const project = this.projectRepository.create(payload);
    return await this.projectRepository.save(project);
  }

  // 获取项目列表（分页）
  async list(projectListDto: ProjectListDto) {
    const { name, tag, page, pageSize } = projectListDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.projectRepository.createQueryBuilder("project");

    if (name?.trim()) {
      queryBuilder.andWhere("project.name LIKE :name", {
        name: `%${name.trim()}%`,
      });
    }

    if (tag) {
      queryBuilder.andWhere("JSON_CONTAINS(project.tags, :tag)", {
        tag: JSON.stringify(tag.trim()),
      });
    }

    const [list, total] = await queryBuilder
      .orderBy("project.createTime", "DESC")
      .addOrderBy("project.stars", "DESC")
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

  // 获取项目详情
  async detail(projectDetailDto: ProjectDetailDto) {
    const project = await this.projectRepository.findOne({
      where: { id: projectDetailDto.id },
    });

    if (!project) {
      throw new NotFoundException("项目不存在");
    }

    return project;
  }

  // 更新项目
  async update(updateProjectDto: UpdateProjectDto, currentUserId?: string) {
    await this.userService.requireAdmin(currentUserId);
    const { id, ...updateData } = updateProjectDto;

    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException("项目不存在");
    }

    const payload = this.normalizeProjectPayload(updateData);
    this.ensureProjectLinks(payload.gitUrl ?? project.gitUrl, payload.demoUrl ?? project.demoUrl);

    await this.projectRepository.update(id, payload);

    return await this.projectRepository.findOne({
      where: { id },
    });
  }

  // 删除项目
  async delete(deleteProjectDto: DeleteProjectDto, currentUserId?: string) {
    await this.userService.requireAdmin(currentUserId);
    const project = await this.projectRepository.findOne({
      where: { id: deleteProjectDto.id },
    });

    if (!project) {
      throw new NotFoundException("项目不存在");
    }

    await this.projectRepository.delete(deleteProjectDto.id);

    return { success: true };
  }

  private ensureProjectLinks(gitUrl?: string, demoUrl?: string) {
    if (!gitUrl?.trim() && !demoUrl?.trim()) {
      throw new BadRequestException("仓库地址和演示地址至少填写一项");
    }
  }

  private normalizeProjectPayload<
    T extends Partial<Pick<Project, "name" | "description" | "gitUrl" | "cover" | "demoUrl" | "tags">>,
  >(payload: T): T {
    return {
      ...payload,
      name: payload.name?.trim(),
      description: payload.description?.trim(),
      gitUrl: payload.gitUrl?.trim(),
      cover: payload.cover?.trim(),
      demoUrl: payload.demoUrl?.trim(),
      tags: payload.tags
        ?.map((tag) => tag.trim())
        .filter((tag) => Boolean(tag)),
    };
  }
}
