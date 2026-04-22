import { MEDIA } from "./siteAssets";

export const SITE_BRAND = {
  name: "ZU Space",
  upperName: "ZU SPACE",
  metaAuthor: "建国 Space 模板",
  siteDescription:
    "一个可复用的赛博朋克个人站模板，用于展示项目、博客、留言与互动功能。",
} as const;

export const DEMO_PROFILE = {
  name: "王建国",
  displayName: "王建国（示例角色）",
  title: "全栈开发者 | AI 应用实践者",
  avatar: MEDIA.placeholders.profileAvatar,
  email: "demo@example.com",
  phone: "+86 139 0000 0000",
  location: "杭州 · 中国",
} as const;

export const formatPageTitle = (title: string) =>
  `${title} - ${SITE_BRAND.name}`;
