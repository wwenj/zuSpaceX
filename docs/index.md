---
layout: home

hero:
  name: ZuSpaceX
  text: 全栈个人主站系统
  tagline: 赛博像素风设计，覆盖博客、项目展示、后台管理与 AI 问答。基于 React 19 + NestJS + LangGraph 构建。
  image:
    src: /hero-architecture.svg
    alt: ZuSpace Architecture
  actions:
    - theme: brand
      text: 快速开始 →
      link: /guide/getting-started
    - theme: alt
      text: 功能演示
      link: https://www.wwenj.com/
    - theme: alt
      text: GitHub
      link: https://github.com/wwenj/zuSpaceX

features:
  - icon:
      html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3c-2.5 4-2.5 14 0 18M12 3c2.5 4 2.5 14 0 18"/></svg>'
    title: 完整的公开站点
    details: 首页、博客、项目、留言板与个人中心统一在一套前端里，开箱即用。
  - icon:
      html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'
    title: 后台管理系统
    details: 文章、项目、留言、用户四类管理，权限体系基于 Cookie + Session。
  - icon:
      html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2z"/><path d="M19 13.5l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/></svg>'
    title: AI Agent 对话
    details: 内置对话页，基于 LangGraph 编排，支持作者分身、文章讲解与流式输出。
---

<div class="home-section">
<div class="home-section-header">
<h2>从零开始，到上线运行</h2>
<p>按顺序阅读，完成从本地启动到生产部署的全流程配置。</p>
<a href="/guide/showcase" class="section-showcase-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg><span>查看功能演示</span><span class="link-arrow">→</span></a>
</div>
<div class="home-map">
<div class="home-map-card card-guide">
<div class="card-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></svg></div>
<span class="home-map-label">使用文档</span>
<h3>启动 · 配置 · 部署</h3>
<p class="card-desc">环境准备、数据库初始化、本地开发到生产上线的完整流程。</p>
<div class="home-map-links">
<a href="/guide/getting-started"><span>快速开始</span><span class="link-arrow">→</span></a>
<a href="/guide/configuration"><span>配置说明</span><span class="link-arrow">→</span></a>
<a href="/guide/deployment"><span>部署说明</span><span class="link-arrow">→</span></a>
</div>
</div>
<div class="home-map-card card-arch">
<div class="card-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></div>
<span class="home-map-label">技术架构</span>
<h3>前端 · 服务端 · Agent</h3>
<p class="card-desc">深入了解各层的技术选型、模块划分与核心设计决策。</p>
<div class="home-map-links">
<a href="/architecture/frontend"><span>前端架构</span><span class="link-arrow">→</span></a>
<a href="/architecture/backend"><span>服务端架构</span><span class="link-arrow">→</span></a>
<a href="/architecture/agent"><span>Agent 架构</span><span class="link-arrow">→</span></a>
</div>
</div>
</div>
</div>
