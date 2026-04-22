export * from './types';
export * from './request';
export { authApi } from './auth';
export { userApi } from './user';
export { commentApi } from './comment';
export { articleApi } from './article';
export { projectApi } from './project';
export { agentApi } from './agent';

import { authApi } from './auth';
import { userApi } from './user';
import { commentApi } from './comment';
import { articleApi } from './article';
import { projectApi } from './project';
import { agentApi } from './agent';

export const api = {
  auth: authApi,
  user: userApi,
  comment: commentApi,
  article: articleApi,
  project: projectApi,
  agent: agentApi,
};

export default api;
