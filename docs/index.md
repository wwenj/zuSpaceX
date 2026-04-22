---
layout: home

hero:
  name: ZuSpace
  text: 开源个人主站与内容系统
  tagline: 基于 React、NestJS、MySQL 与 Agent 的全栈实现，覆盖个人主页、博客、开源项目展示、后台管理与内容问答。
  image:
    src: /hero-architecture.svg
    alt: ZuSpace Architecture
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 功能演示
      link: /guide/showcase
    - theme: alt
      text: 服务端架构
      link: /architecture/backend

features:
  - title: 公开站点
    details: 首页、博客、项目、留言与个人页统一在一套前端里组织，适合做内容型个人主站。
  - title: 管理后台
    details: 文章、项目、留言、用户四类管理页面已经打通，能直接承担站点日常维护。
  - title: Agent 能力
    details: 站内提供独立对话页，支持基于作者设定、文章和项目内容做流式问答与分析。
---

<div class="home-map">
  <div class="home-map-card">
    <span class="home-map-label">使用文档</span>
    <h2>先把项目跑起来，再整理配置和部署。</h2>
    <div class="home-map-links">
      <a href="/guide/getting-started">快速开始</a>
      <a href="/guide/configuration">配置说明</a>
      <a href="/guide/deployment">部署说明</a>
      <a href="/guide/showcase">功能演示</a>
    </div>
  </div>

  <div class="home-map-card">
    <span class="home-map-label">技术架构</span>
    <h2>聚焦当前项目真实的前端、服务端与 Agent 设计。</h2>
    <div class="home-map-links">
      <a href="/architecture/frontend">前端架构</a>
      <a href="/architecture/backend">服务端架构</a>
      <a href="/architecture/agent">Agent 架构</a>
    </div>
  </div>
</div>

## 项目适用范围

- 个人主站
- 技术博客与项目展示
- 带后台的内容型网站
- 带站内问答能力的个人品牌站点
