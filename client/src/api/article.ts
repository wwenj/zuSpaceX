import { http } from './request';
import type {
  Article,
  CreateArticleParams,
  GetArticleListParams,
  GetArticleDetailParams,
  UpdateArticleParams,
  DeleteArticleParams,
  PaginationResponse,
  SuccessResponse,
} from './types';

export const articleApi = {
  create: (params: CreateArticleParams) =>
    http.post<Article>('/api/article/create', params),

  list: (params?: GetArticleListParams) =>
    http.get<PaginationResponse<Article>>('/api/article/list', params),

  detail: (params: GetArticleDetailParams) =>
    http.get<Article>('/api/article/detail', params),

  update: (params: UpdateArticleParams) =>
    http.post<Article>('/api/article/update', params),

  delete: (params: DeleteArticleParams) =>
    http.post<SuccessResponse>('/api/article/delete', params),
};
