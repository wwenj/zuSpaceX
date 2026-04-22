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
  title: "ZuSpace",
  description: "ZuSpace 使用文档与技术架构",
  base: resolveBase(),
  lastUpdated: true,
  head: [
    ["meta", { name: "theme-color", content: "#0f172a" }],
    ["meta", { name: "author", content: "ZuSpace" }],
  ],
  themeConfig: {
    logo: "/zu_logo.png",
    nav: [
      { text: "使用文档", link: "/guide/getting-started" },
      { text: "技术架构", link: "/architecture/frontend" },
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
    socialLinks,
    outline: {
      level: [2, 3],
      label: "本页导航",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    footer: {
      message: "Powered by VitePress",
      copyright: "Copyright © 2026 ZuSpace",
    },
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    returnToTopLabel: "回到顶部",
  },
});
