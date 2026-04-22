import { http } from './request';
import type {
  Comment,
  CreateCommentParams,
  GetCommentListParams,
  GetCommentDetailParams,
  UpdateCommentParams,
  DeleteCommentParams,
  PaginationResponse,
  SuccessResponse,
} from './types';

export const commentApi = {
  create: (params: CreateCommentParams) =>
    http.post<Comment>('/api/comment/create', params),

  list: (params?: GetCommentListParams) =>
    http.get<PaginationResponse<Comment>>('/api/comment/list', params),

  detail: (params: GetCommentDetailParams) =>
    http.get<Comment>('/api/comment/detail', params),

  update: (params: UpdateCommentParams) =>
    http.post<Comment>('/api/comment/update', params),

  delete: (params: DeleteCommentParams) =>
    http.post<SuccessResponse>('/api/comment/delete', params),
};
