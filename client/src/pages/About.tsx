import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  Award,
  Coffee,
  Bike,
  Box,
  Tent,
  Code2,
  Server,
  Zap,
  Brain,
} from "lucide-react";
import { DEMO_PROFILE, formatPageTitle } from "@/lib/siteProfile";
import { MEDIA } from "@/lib/siteAssets";

export default function About() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  useEffect(() => {
    document.title = formatPageTitle("关于我");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `示例开发者 ${DEMO_PROFILE.name} 的介绍页面，展示技术方向、兴趣与联系方式占位信息。`,
      );
    }
  }, []);

  // 个人基本信息
  const personalInfo = {
    ...DEMO_PROFILE,
  };

  // 社交媒体
  const socialLinks = [
    {
      name: "GitHub",
      icon: MEDIA.social.github,
      url: "https://github.com/example",
      label: "github.com/example",
    },
    {
      name: "掘金",
      icon: MEDIA.social.juejin,
      url: "https://example.com/juejin",
      label: "@demo_author",
    },
    {
      name: "知乎",
      icon: MEDIA.social.zhihu,
      url: "https://example.com/zhihu",
      label: "@demo_author",
    },
    {
      name: "微信",
      icon: MEDIA.social.wechat,
      url: "#",
      label: "WeChat: demo_wechat",
      qrCode: MEDIA.placeholders.wechatQr,
    },
    {
      name: "公众号",
      icon: MEDIA.social.officialAccount,
      url: "#",
      label: "示例技术号",
      qrCode: MEDIA.placeholders.officialAccountQr,
    },
  ];

  // 专业技能领域
  const professionalSkills = [
    {
      title: "Web Frontend",
      icon: <Code2 className="w-7 h-7" />,
      color: "#00E5FF",
      description:
        "适合作为模板中的前端能力介绍区域，你可以在这里填写自己熟悉的框架、工程化方案和用户体验实践。",
      items: [
        "React",
        "Vue",
        "TypeScript",
        "Tailwind CSS",
        "Vite/Webpack",
        "性能优化",
        "响应式设计",
        "组件库开发",
      ],
    },
    {
      title: "Web Backend",
      icon: <Server className="w-7 h-7" />,
      color: "#00FF9D",
      description:
        "这里可用于展示服务端经验，例如接口设计、数据建模、缓存治理以及稳定性相关的工程能力。",
      items: [
        "Node.js/NestJS",
        "Python/FastAPI",
        "MySQL",
        "Redis",
        "RESTful",
        "分布式系统",
        "微服务架构",
        "API 设计",
      ],
    },
    {
      title: "DevOps & Infra",
      icon: <Zap className="w-7 h-7" />,
      color: "#FF00FF",
      description:
        "适合补充部署、自动化和基础设施经验，用于说明项目从开发到上线的完整工程链路。",
      items: [
        "Docker",
        "Kubernetes",
        "CI/CD Pipeline",
        "Linux",
        "Nginx",
        "自动化部署",
        "容器编排",
      ],
    },
    {
      title: "AI & Agent",
      icon: <Brain className="w-7 h-7" />,
      color: "#FFC107",
      description:
        "可用于介绍你在 AI 应用、Agent、工作流或知识库方向的探索，把真实项目经验替换到这里即可。",
      items: [
        "RAG 系统",
        "Agent 架构",
        "Workflow",
        "LangChain",
        "MCP/Skill",
        "模型微调",
        "Prompt",
        "AI 产品设计",
      ],
    },
  ];

  // 个人兴趣
  const personalInterests = [
    {
      title: "羽球高手",
      icon: <Award className="w-6 h-6" />,
      color: "#00E5FF",
      description:
        "周末常和朋友约球，通过运动保持状态，也把竞技感带回到日常开发中。",
      backgroundImage: MEDIA.interests.badminton,
    },
    {
      title: "追风少年",
      icon: <Bike className="w-6 h-6" />,
      color: "#00FF9D",
      description: "喜欢用短途骑行切换节奏，在路上整理思路、恢复专注。",
      backgroundImage: MEDIA.interests.riding,
    },
    {
      title: "3D 打印",
      icon: <Box className="w-6 h-6" />,
      color: "#FF00FF",
      description: "关注数字设计到实体产物的完整链路，享受从想法到样品的过程。",
      backgroundImage: MEDIA.interests.printing,
    },
    {
      title: "自驾露营",
      icon: <Tent className="w-6 h-6" />,
      color: "#FFC107",
      description: "偏爱户外和安静场景，用留白给工作之外的生活补充能量。",
      backgroundImage: MEDIA.interests.camping,
    },
  ];

  return (
    <main
      className="pt-28 pb-20 relative overflow-hidden about-page"
      style={{
        fontFamily:
          'Inter, "Noto Sans SC", system-ui, -apple-system, sans-serif',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .about-page p, .about-page span, .about-page div {
            font-family: Inter, "Noto Sans SC", system-ui, -apple-system, sans-serif;
          }
        `,
        }}
      />
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-[#00E5FF]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-gradient-to-l from-[#00FF9D]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-10 w-2 h-32 bg-gradient-to-b from-[#FF00FF]/50 to-transparent"></div>
        <div className="absolute top-1/3 right-16 w-2 h-24 bg-gradient-to-b from-[#00E5FF]/50 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        {/* Hero Section - 重新设计的标题区域 */}
        <div className="text-center mb-8 relative">
          <div className="inline-block relative">
            <h1
              className="text-2xl md:text-3xl lg:text-4xl mb-3"
              style={{
                fontFamily:
                  '"Press Start 2P", "VT323", "Courier New", monospace',
                fontWeight: "400",
                background:
                  "linear-gradient(to right, #00E5FF, #00FF9D, #FF00FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(0, 229, 255, 0.4))",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                lineHeight: "1.2",
              }}
            >
              ABOUT ME
            </h1>
            <div className="absolute -top-2 -left-2 w-6 h-6 border-2 border-[#00E5FF] animate-pulse"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#FF00FF] animate-pulse"></div>
          </div>
          <p className="text-base text-[#A6A6A6] mt-3 tracking-wider">
            这是一个可直接替换内容的开源个人站模板
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00E5FF] to-[#00FF9D] mx-auto mt-4"></div>
        </div>

        {/* Personal Card - 个人名片 */}
        <Card
          className="bg-[#1C1C1C] border-2 border-[#00E5FF] mb-6 overflow-hidden"
          style={{
            boxShadow: "0 0 20px rgba(0, 229, 255, 0.3)",
          }}
        >
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 border-4 border-[#00E5FF] overflow-hidden"
                  style={{
                    boxShadow: "0 0 20px rgba(0, 229, 255, 0.5)",
                  }}
                >
                  <img
                    src={personalInfo.avatar}
                    alt={personalInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00FF9D] border-2 border-black animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#FF00FF] border-2 border-black"></div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-[#00E5FF] mb-1">
                  {personalInfo.name}
                </h2>
                <p className="text-base text-[#00FF9D] mb-4">
                  {personalInfo.title}
                </p>

                {/* Contact Info - 紧凑化布局 */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2 text-[#E6E6E6]">
                    <Mail className="w-4 h-4 text-[#00E5FF]" />
                    <span>{personalInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#E6E6E6]">
                    <Phone className="w-4 h-4 text-[#00FF9D]" />
                    <span>{personalInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#E6E6E6]">
                    <MapPin className="w-4 h-4 text-[#FF00FF]" />
                    <span>{personalInfo.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links - 社交媒体 */}
            <div className="mt-6 pt-4 border-t border-[#2A2A2A]">
              <h4 className="text-sm font-semibold text-[#707070] mb-3 uppercase tracking-wider">
                社交媒体
              </h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {socialLinks.map((social) => {
                  const handleClick = (e: React.MouseEvent) => {
                    if (social.qrCode) {
                      e.preventDefault();
                      setModalOpen(social.name);
                    }
                  };

                  return (
                    <div
                      key={social.name}
                      className="flex items-center gap-2 bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#00E5FF]/50 px-3 py-2 transition-all hover:shadow-md hover:shadow-[#00E5FF]/10 rounded-md cursor-pointer group"
                      onClick={handleClick}
                    >
                      {!social.qrCode ? (
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full"
                        >
                          <img
                            src={social.icon}
                            alt={social.name}
                            className="w-5 h-5 group-hover:scale-110 transition-transform"
                          />
                          <span className="text-[#A6A6A6] text-sm group-hover:text-[#00E5FF] transition-colors">
                            {social.name}
                          </span>
                        </a>
                      ) : (
                        <>
                          <img
                            src={social.icon}
                            alt={social.name}
                            className="w-5 h-5 group-hover:scale-110 transition-transform"
                          />
                          <span className="text-[#A6A6A6] text-sm group-hover:text-[#00E5FF] transition-colors">
                            {social.name}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Introduction - 个人介绍 */}
        <Card className="bg-gradient-to-br from-[#1C1C1C] to-[#0F0F0F] border border-[#2A2A2A] hover:border-[#00E5FF]/50 mb-8 transition-all duration-300">
          <div className="p-5 md:p-8 relative">
            <div className="absolute top-4 right-4 w-16 h-16 border border-[#00E5FF]/20 rounded-full flex items-center justify-center">
              <Coffee className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <h3 className="text-2xl font-bold text-[#00E5FF] mb-6">个人简介</h3>
            <div className="w-12 h-1 bg-gradient-to-r from-[#00E5FF] to-[#00FF9D] mb-6"></div>
            <div
              className="space-y-6 text-[#E6E6E6] leading-relaxed text-base"
              style={{ fontFamily: 'Inter, "Noto Sans SC", sans-serif' }}
            >
              <p className="relative pl-4 border-l-2 border-[#00E5FF]/30">
                这里适合填写站点主人的背景介绍，例如工作方向、
                <span className="text-[#00E5FF] font-semibold bg-[#00E5FF]/10 px-2 py-1 rounded">
                  技术栈
                </span>
                、负责过的产品阶段和代表性能力。你可以结合实际项目经历，
                用简洁直接的方式说明自己擅长解决的问题，以及能承担的工作范围。
                如果希望突出个人品牌，也可以在这里描述自己的方法论和长期关注方向。
              </p>
              <p className="relative pl-4 border-l-2 border-[#FF00FF]/30">
                <span className="text-[#00E5FF] font-semibold bg-[#00E5FF]/10 px-2 py-1 rounded">
                  开源模板
                </span>
                <span className="text-[#FF00FF] font-semibold bg-[#FF00FF]/10 px-2 py-1 rounded">
                  占位文案
                </span>
                的目标不是展示真实信息，而是帮助你保留页面结构、动效和视觉层次。替换成自己的介绍后，这一页就可以直接作为公开项目中的 About 页面使用。
              </p>
            </div>
          </div>
        </Card>

        {/* Professional Skills - 专业技能 */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h3
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00FF9D] mb-4"
              style={{
                filter: "drop-shadow(0 0 20px rgba(0, 229, 255, 0.4))",
              }}
            >
              专业领域
            </h3>
            <div className="w-16 h-1 bg-gradient-to-r from-[#00E5FF] to-[#00FF9D] mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {professionalSkills.map((skill, index) => (
              <Card
                key={skill.title}
                className="bg-gradient-to-br from-[#1C1C1C] to-[#0F0F0F] border border-[#2A2A2A] hover:border-[#00E5FF] transition-all duration-300 group hover:shadow-xl hover:shadow-[#00E5FF]/10 hover:scale-[1.02]"
              >
                <div className="p-4 md:p-6 relative overflow-hidden">
                  {/* 背景装饰 */}
                  <div
                    className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity"
                    style={{ color: skill.color }}
                  >
                    {skill.icon}
                  </div>

                  {/* 序号 */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-2 border-[#2A2A2A] rounded-full flex items-center justify-center text-xs text-[#707070]">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* 标题与图标 */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg border-2 flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{
                        borderColor: skill.color,
                        backgroundColor: `${skill.color}10`,
                      }}
                    >
                      <div style={{ color: skill.color }}>{skill.icon}</div>
                    </div>
                    <h4
                      className="text-lg group-hover:text-white transition-colors"
                      style={{
                        color: skill.color,
                        fontFamily: '"Press Start 2P", "VT323", monospace',
                        fontWeight: "400",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        fontSize: "1rem",
                      }}
                    >
                      {skill.title}
                    </h4>
                  </div>

                  {/* 介绍文字 */}
                  <p
                    className="text-sm text-[#A6A6A6] leading-relaxed mb-5"
                    style={{
                      fontFamily: 'Inter, "Noto Sans SC", sans-serif',
                    }}
                  >
                    {skill.description}
                  </p>

                  {/* 技能标签 */}
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item) => (
                      <span
                        key={item}
                        className="bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#00E5FF]/50 text-[#707070] hover:text-[#00E5FF] px-3 py-1 text-xs transition-all cursor-default rounded-md"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Personal Interests - 个人兴趣 */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h3
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF00FF] to-[#FFC107] mb-4"
              style={{
                filter: "drop-shadow(0 0 20px rgba(255, 0, 255, 0.4))",
              }}
            >
              生活兴趣
            </h3>
            <div className="w-16 h-1 bg-gradient-to-r from-[#FF00FF] to-[#FFC107] mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personalInterests.map((interest, index) => (
              <Card
                key={interest.title}
                className="bg-gradient-to-br from-[#1C1C1C] to-[#0F0F0F] border border-[#2A2A2A] hover:border-[#FF00FF] transition-all duration-300 group hover:shadow-xl hover:shadow-[#FF00FF]/10 hover:scale-[1.02] overflow-hidden"
              >
                <div className="relative h-32 overflow-hidden">
                  {/* 背景图片 - 只占右侧一半宽度 */}
                  <div className="absolute top-0 right-0 w-1/2 h-full">
                    <img
                      src={interest.backgroundImage}
                      alt=""
                      className="w-full h-full object-cover object-center"
                    />
                    {/* 图片左侧毛玻璃模糊效果 */}
                    <div
                      className="absolute top-0 left-0 w-8 h-full backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(to right, rgba(28, 28, 28, 0.3) 0%, transparent 100%)`,
                        maskImage: `linear-gradient(to right, black 0%, transparent 100%)`,
                        WebkitMaskImage: `linear-gradient(to right, black 0%, transparent 100%)`,
                      }}
                    ></div>
                  </div>

                  {/* 渐进遮盖层 - 从左侧完全不透明到右侧透明，向右延伸覆盖图片边缘 */}
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      background: `linear-gradient(to right, #1C1C1C 0%, #1C1C1C 45%, rgba(28, 28, 28, 0.9) 55%, rgba(28, 28, 28, 0.7) 65%, rgba(28, 28, 28, 0.4) 75%, rgba(28, 28, 28, 0.1) 85%, transparent 95%)`,
                    }}
                  ></div>

                  {/* 内容区域 */}
                  <div className="relative z-20 p-6 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:rotate-12"
                        style={{
                          borderColor: interest.color,
                          backgroundColor: `${interest.color}10`,
                        }}
                      >
                        <div style={{ color: interest.color }}>
                          {interest.icon}
                        </div>
                      </div>
                      <h4
                        className="text-base font-bold group-hover:text-white transition-colors"
                        style={{
                          color: interest.color,
                        }}
                      >
                        {interest.title}
                      </h4>
                    </div>
                    <p
                      className="text-sm text-[#E6E6E6] leading-relaxed max-w-[85%] md:max-w-[70%]"
                      style={{
                        fontFamily: 'Inter, "Noto Sans SC", sans-serif',
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
                      }}
                    >
                      {interest.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="hidden md:block fixed bottom-20 right-20 w-12 h-12 border-2 border-[#00E5FF]/30 animate-pulse rounded-full"></div>
      <div className="hidden md:block fixed top-1/3 left-10 w-8 h-8 border-2 border-[#00FF9D]/30 animate-pulse rotate-45"></div>
      <div className="hidden md:block fixed top-1/2 right-8 w-6 h-6 bg-[#FF00FF]/20 animate-bounce rounded-full"></div>
      <div className="hidden md:block fixed bottom-1/3 left-16 w-4 h-16 bg-gradient-to-t from-[#FFC107]/30 to-transparent"></div>

      {/* 简洁弹窗设计 */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setModalOpen(null)}
        >
          <div
            className="relative bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in-0 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setModalOpen(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-[#2A2A2A] hover:bg-[#FF0000] rounded-full flex items-center justify-center text-[#A6A6A6] hover:text-white transition-all z-10"
            >
              ✕
            </button>

            {/* 二维码图片 */}
            <div className="p-6">
              <img
                src={socialLinks.find((s) => s.name === modalOpen)?.qrCode}
                alt={`${modalOpen}二维码`}
                className="w-80 h-80 object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
