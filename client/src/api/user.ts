import { http } from './request';
import type {
  User,
  CreateUserParams,
  UpdateUserParams,
  DeleteUserParams,
  GetUserDetailParams,
  GetUserListParams,
  PaginationResponse,
  SuccessResponse,
} from './types';

export const userApi = {
  create: (params: CreateUserParams) =>
    http.post<User>('/api/user/create', params),

  list: (params?: GetUserListParams) =>
    http.get<PaginationResponse<User>>('/api/user/list', params),

  detail: (params: GetUserDetailParams) =>
    http.get<User>('/api/user/detail', params),

  me: () =>
    http.get<User>('/api/user/me'),

  update: (params: UpdateUserParams) =>
    http.post<User>('/api/user/update', params),

  delete: (params: DeleteUserParams) =>
    http.post<SuccessResponse>('/api/user/delete', params),
};
