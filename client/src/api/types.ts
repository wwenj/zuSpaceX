// API 通用类型定义

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SuccessResponse {
  success: boolean;
}

// ==================== 用户模块 ====================

export interface User {
  id: string;
  account: string;
  nickname: string;
  intro: string;
  avatar: string;
  gameScore: number;
  role: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserParams {
  account: string;
  password: string;
  nickname?: string;
  intro?: string;
  avatar?: string;
  gameScore?: number;
  role?: number;
}

export interface UpdateUserParams {
  id: string;
  nickname?: string;
  intro?: string;
  avatar?: string;
  gameScore?: number;
  role?: number;
}

export interface DeleteUserParams {
  id: string;
}

export interface GetUserDetailParams {
  id: string;
}

// ==================== 留言模块 ====================

export type CommentType = "article" | "website";

export interface Comment {
  id: string;
  content: string;
  userId: string;
  type: CommentType;
  source: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nickname: string;
    avatar: string;
  };
}

export interface CreateCommentParams {
  content: string;
  type?: CommentType;
  source?: number;
}

export interface GetCommentListParams extends PaginationParams {
  userId?: string;
  nickname?: string;
  account?: string;
  type?: CommentType;
  source?: number;
}

export interface GetCommentDetailParams {
  id: string;
}

export interface UpdateCommentParams {
  id: string;
  content?: string;
}

export interface DeleteCommentParams {
  id: string;
}

// ==================== 博客文章模块 ====================

export interface Article {
  id: string;
  author: string;
  tag: string[];
  content: string;
  contentCount: number;
  briefContent: string;
  image: string;
  title: string;
  isTop: boolean;
  isHidden: boolean;
  createTime: string;
  updateTime: string;
}

export interface CreateArticleParams {
  author?: string;
  tag?: string[];
  content: string;
  contentCount?: number;
  briefContent?: string;
  image?: string;
  title: string;
  isTop?: boolean;
  isHidden?: boolean;
}

export interface GetArticleListParams extends PaginationParams {
  id?: string;
  title?: string;
  author?: string;
  tag?: string;
  showAll?: boolean;
}

export interface GetArticleDetailParams {
  id: string;
}

export interface UpdateArticleParams {
  id: string;
  author?: string;
  tag?: string[];
  content?: string;
  contentCount?: number;
  briefContent?: string;
  image?: string;
  title?: string;
  isTop?: boolean;
  isHidden?: boolean;
}

export interface DeleteArticleParams {
  id: string;
}

// ==================== 开源项目模块 ====================

export interface Project {
  id: string;
  name: string;
  description: string;
  gitUrl: string;
  stars: number;
  cover: string;
  demoUrl: string;
  tags: string[];
  createTime: string;
  updateTime: string;
}

export interface CreateProjectParams {
  name: string;
  description?: string;
  gitUrl?: string;
  stars?: number;
  cover?: string;
  demoUrl?: string;
  tags?: string[];
}

export interface GetProjectListParams extends PaginationParams {
  name?: string;
  tag?: string;
}

export interface GetProjectDetailParams {
  id: string;
}

export interface UpdateProjectParams {
  id: string;
  name?: string;
  description?: string;
  gitUrl?: string;
  stars?: number;
  cover?: string;
  demoUrl?: string;
  tags?: string[];
}

export interface DeleteProjectParams {
  id: string;
}

export interface GetUserListParams extends PaginationParams {
  id?: string;
  account?: string;
  nickname?: string;
  role?: number;
}
