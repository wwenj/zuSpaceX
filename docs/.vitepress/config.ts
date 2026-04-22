import { defineConfig } from "vitepress";

function resolveBase() {
  const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];

  if (!repository || repository.endsWith(".github.io")) {
    return "/";
  }

  return `/${repository}/`;
}

const repository = process.env.GITHUB_REPOSITORY;
const socialLinks = repository
  ? [{ icon: "github", link: `https://github.com/${repository}` }]
  : [];

export default defineConfig({
  lang: "zh-CN",
  title: "ZuSpaceX",
  description: "赛博像素风全栈个人主站 · React 19 + NestJS + AI Agent",
  base: resolveBase(),
  lastUpdated: true,
  ignoreDeadLinks: [/^http:\/\/localhost/],
  head: [
    ["meta", { name: "theme-color", content: "#0f766e" }],
    ["meta", { name: "author", content: "ZuSpace" }],
    ["meta", { property: "og:title", content: "ZuSpaceX" }],
    ["meta", { property: "og:description", content: "赛博像素风全栈个人主站" }],
  ],
  themeConfig: {
    logo: "/zu_logo.png",
    siteTitle: "ZuSpaceX",
    nav: [
      { text: "快速开始", link: "/guide/getting-started" },
      { text: "功能演示", link: "/guide/showcase" },
      {
        text: "技术架构",
        items: [
          { text: "前端架构", link: "/architecture/frontend" },
          { text: "服务端架构", link: "/architecture/backend" },
          { text: "Agent 架构", link: "/architecture/agent" },
        ],
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "使用文档",
          items: [
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "配置说明", link: "/guide/configuration" },
            { text: "部署说明", link: "/guide/deployment" },
            { text: "功能演示", link: "/guide/showcase" },
          ],
        },
      ],
      "/architecture/": [
        {
          text: "技术架构",
          items: [
            { text: "前端架构", link: "/architecture/frontend" },
            { text: "服务端架构", link: "/architecture/backend" },
            { text: "Agent 架构", link: "/architecture/agent" },
          ],
        },
      ],
    },
    search: {
      provider: "local",
    },
    socialLinks: [
      ...(repository
        ? [{ icon: "github", link: `https://github.com/${repository}` }]
        : [{ icon: "github", link: "https://github.com/wwenj/zuSpaceX" }]),
    ],
    outline: {
      level: [2, 3],
      label: "本页目录",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    footer: {
      message: "基于 MIT 协议开源",
      copyright: "Copyright © 2026 ZuSpaceX",
    },
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "浅色模式",
    darkModeSwitchTitle: "深色模式",
    returnToTopLabel: "回到顶部",
  },
});
