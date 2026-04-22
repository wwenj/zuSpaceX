import { http } from './request';
import type {
  Project,
  CreateProjectParams,
  GetProjectListParams,
  GetProjectDetailParams,
  UpdateProjectParams,
  DeleteProjectParams,
  PaginationResponse,
  SuccessResponse,
} from './types';

export const projectApi = {
  create: (params: CreateProjectParams) =>
    http.post<Project>('/api/project/create', params),

  list: (params?: GetProjectListParams) =>
    http.get<PaginationResponse<Project>>('/api/project/list', params),

  detail: (params: GetProjectDetailParams) =>
    http.get<Project>('/api/project/detail', params),

  update: (params: UpdateProjectParams) =>
    http.post<Project>('/api/project/update', params),

  delete: (params: DeleteProjectParams) =>
    http.post<SuccessResponse>('/api/project/delete', params),
};
