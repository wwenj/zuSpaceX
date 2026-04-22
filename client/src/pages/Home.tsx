import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Code2,
  Cog,
  Zap,
  Palette,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { DEMO_PROFILE, SITE_BRAND } from "@/lib/siteProfile";
import { MEDIA } from "@/lib/siteAssets";

export default function Home() {
  // 图片切换状态 - 实现张嘴说话效果
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  // 打字机效果状态
  const [displayedLine1, setDisplayedLine1] = useState("");
  const [displayedLine2, setDisplayedLine2] = useState("");
  const [showLine2, setShowLine2] = useState(false);

  // ABOUT ME 打字机效果状态
  const [aboutDisplayText, setAboutDisplayText] = useState("");
  const [aboutCurrentIndex, setAboutCurrentIndex] = useState(0);
  const [aboutIsTyping, setAboutIsTyping] = useState(false);

  const line1Text = "你好啊，赛博像素大陆的新居民";
  const line2Text = `欢迎来到 ${SITE_BRAND.name}`;

  // ABOUT ME 文本内容
  const aboutTexts = [
    "你好！这里是一套赛博朋克风格的个人站模板，适合展示项目、博客和个人经历。",
    "你可以把这一段替换成自己的介绍、技术方向、代表作品，或者正在进行的实验项目。",
    "如果你准备把站点开源出去，保留当前占位信息也能直接作为演示内容使用。",
  ];
  const terminalHost = "root@demo-space";
  const terminalDomain = "demo.cyber-space.local";
  const terminalHome = "/home/demo";
  const terminalSession = "demo:zsh";
  const terminalWelcome = `欢迎回来，${DEMO_PROFILE.name}。已加载公开演示资料。`;

  useEffect(() => {
    // 设置页面 SEO
    document.title = `${SITE_BRAND.name} - 开源个人站模板`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        SITE_BRAND.siteDescription,
      );
    }

    // 每 0.6 秒切换图片，实现说话动画
    const mouthInterval = setInterval(() => {
      setIsMouthOpen((prev) => !prev);
    }, 600);

    // 打字机效果 - 两行文字逐字显示
    let line1Index = 0;
    let line2Index = 0;
    let isTypingLine2 = false;

    const typingInterval = setInterval(() => {
      if (!isTypingLine2) {
        // 第一行打字
        if (line1Index <= line1Text.length) {
          setDisplayedLine1(line1Text.slice(0, line1Index));
          line1Index++;
        } else {
          // 第一行完成，等待 300ms 后开始第二行
          setTimeout(() => {
            isTypingLine2 = true;
            setShowLine2(true);
          }, 300);
        }
      } else {
        // 第二行打字
        if (line2Index <= line2Text.length) {
          setDisplayedLine2(line2Text.slice(0, line2Index));
          line2Index++;
        } else {
          // 两行都完成，等待 2 秒后重置
          setTimeout(() => {
            line1Index = 0;
            line2Index = 0;
            isTypingLine2 = false;
            setDisplayedLine1("");
            setDisplayedLine2("");
            setShowLine2(false);
          }, 2000);
        }
      }
    }, 150);

    // ABOUT ME 打字机效果 - 延迟3秒后开始，循环显示
    setTimeout(() => {
      setAboutIsTyping(true);
      let currentTextIndex = 0;
      let currentCharIndex = 0;
      const fullText = aboutTexts.join("\n\n"); // 合并所有文本，用双换行分隔

      // 生成随机打字间隔，模拟人工打字
      const getRandomTypingDelay = () => {
        const delays = [80, 120, 150, 200, 100, 90, 180, 160]; // 不同的延迟时间
        return delays[Math.floor(Math.random() * delays.length)];
      };

      // 生成随机字符数量（1-3个字符）
      const getRandomChunkSize = () => {
        const weights = [0.6, 0.3, 0.1]; // 1个字符60%，2个字符30%，3个字符10%
        const rand = Math.random();
        if (rand < weights[0]) return 1;
        if (rand < weights[0] + weights[1]) return 2;
        return 3;
      };

      const typeText = () => {
        if (currentCharIndex < fullText.length) {
          const chunkSize = getRandomChunkSize();
          const nextIndex = Math.min(
            currentCharIndex + chunkSize,
            fullText.length,
          );
          setAboutDisplayText(fullText.slice(0, nextIndex));
          currentCharIndex = nextIndex;

          setTimeout(typeText, getRandomTypingDelay());
        } else {
          // 文本完成，等待3秒后重新开始
          setTimeout(() => {
            setAboutDisplayText("");
            currentCharIndex = 0;
            typeText();
          }, 3000);
        }
      };

      typeText();
    }, 3000); // 延迟3秒开始

    return () => {
      clearInterval(mouthInterval);
      clearInterval(typingInterval);
    };
  }, []);

  // 技能数据 - 四个核心方向
  const skillCategories = [
    {
      id: "fe",
      category: "FE",
      displayName: "前端开发",
      icon: Zap,
      color: "#89b4fa",
      gradientFrom: "#89b4fa",
      gradientTo: "#74c7ec",
      skills: [
        { name: "React/Vue.js", level: 98 },
        { name: "TypeScript", level: 80 },
        { name: "Tailwind CSS", level: 70 },
        { name: "Webpack/Vite", level: 92 },
        { name: "Zustand/Pinia", level: 80 },
      ],
    },
    {
      id: "rd",
      category: "RD",
      displayName: "服务端 & 运维",
      icon: Cog,
      color: "#a6e3a1",
      gradientFrom: "#a6e3a1",
      gradientTo: "#94e2d5",
      skills: [
        { name: "Python/FastAPI", level: 70 },
        { name: "Node.js/NestJS", level: 85 },
        { name: "Docker/k8s", level: 80 },
        { name: "CI/CD", level: 85 },
        { name: "MySql/Redis", level: 75 },
      ],
    },
    {
      id: "ai",
      category: "AI",
      displayName: "AI & LLM",
      icon: Code2,
      color: "#cba6f7",
      gradientFrom: "#cba6f7",
      gradientTo: "#f5c2e7",
      skills: [
        { name: "模型微调", level: 65 },
        { name: "Agent 架构", level: 82 },
        { name: "MCP/Skill", level: 95 },
        { name: "Context/Memory", level: 88 },
        { name: "RAG 系统", level: 75 },
      ],
    },
    {
      id: "creative",
      category: "3D",
      displayName: "3D & 创意",
      icon: Palette,
      color: "#fab387",
      gradientFrom: "#fab387",
      gradientTo: "#f9e2af",
      skills: [
        { name: "Blender 建模", level: 50 },
        { name: "3D 打印", level: 85 },
        { name: "CAD 设计", level: 40 },
        { name: "材料优化", level: 75 },
        { name: "后处理工艺", level: 65 },
      ],
    },
  ];

  // 两张图片：闭嘴和张嘴
  const avatarImages = {
    closed: MEDIA.common.avatarClosed,
    open: MEDIA.common.avatarOpen,
  };

  return (
    <main className="relative">
      {/* 添加终端光标闪烁动画 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          .terminal-cursor {
            animation: blink 1s infinite;
          }
          .terminal-scanline {
            background: linear-gradient(
              to bottom,
              transparent 0%,
              rgba(0, 255, 0, 0.03) 50%,
              transparent 100%
            );
            animation: scanline 2s linear infinite;
          }
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
        `,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-32 pb-20">
        {/* Hero Section */}
        <section className="mb-16 md:mb-32">
          <div className="flex flex-col items-center text-center">
            {/* Pixel Avatar - Super Mario Style with Talking Animation */}
            <div className="mb-8 relative inline-block">
              {/* Avatar - 居中显示 */}
              <div className="relative">
                <div className="w-28 h-28 md:w-40 md:h-40 border-4 border-primary bg-black shadow-pixel-lg overflow-hidden relative group">
                  <img
                    src={isMouthOpen ? avatarImages.open : avatarImages.closed}
                    alt="像素头像"
                    className="w-full h-full object-cover transition-none"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-all"></div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-success border-2 border-black animate-pixel-blink"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent border-2 border-black"></div>
              </div>

              {/* Chat Bubble with Typewriter Effect - 绝对定位在右上角，窄屏缩小显示 */}
              <div className="absolute top-0 left-full ml-2 md:ml-4 z-10">
                {/* Speech Bubble Triangle */}
                <div className="absolute left-[-6px] md:left-[-12px] top-4 md:top-8 w-0 h-0 border-t-[4px] md:border-t-[8px] border-t-transparent border-r-[6px] md:border-r-[12px] border-r-primary border-b-[4px] md:border-b-[8px] border-b-transparent"></div>

                {/* Bubble Content - 两行文字 */}
                <div className="bg-surface-primary border border-2 md:border-2 border-primary px-2 md:px-4 py-1.5 md:py-3 shadow-pixel-lg">
                  <div className="space-y-0.5 md:space-y-1">
                    {/* 第一行 */}
                    <p className="text-primary font-pixel-alt text-xs md:text-lg leading-relaxed whitespace-nowrap min-h-[20px] md:min-h-[28px]">
                      {displayedLine1}
                      {!showLine2 && (
                        <span className="inline-block w-1.5 h-3 md:w-2 md:h-5 bg-primary ml-0.5 md:ml-1 animate-pixel-blink"></span>
                      )}
                    </p>
                    {/* 第二行 */}
                    {showLine2 && (
                      <p className="text-secondary font-pixel-alt text-xs md:text-lg leading-relaxed whitespace-nowrap min-h-[20px] md:min-h-[28px]">
                        {displayedLine2}
                        <span className="inline-block w-1.5 h-3 md:w-2 md:h-5 bg-secondary ml-0.5 md:ml-1 animate-pixel-blink"></span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Intro */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-primary text-pixel-shadow font-pixel">
              {SITE_BRAND.upperName}
            </h1>
            <p className="text-base md:text-xl text-secondary mb-2 font-tech tracking-wide">
              全栈开发者 | 开源爱好者 | 创意实践者
            </p>
            <p className="text-sm md:text-base text-text-tertiary max-w-2xl mb-6 md:mb-8 leading-relaxed font-normal md:text-lg">
              用模板化结构承载内容，用像素风格表达个性
              <br />
              适合展示项目、文章与个人故事
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/chat">
                <Button
                  variant="default"
                  size="lg"
                  className="border-primary bg-primary text-[#062233] hover:brightness-110 shadow-[0_0_18px_rgba(0,229,255,0.35)] font-bold text-base tracking-wide"
                >
                  <MessageCircle className="w-5 h-5" />
                  与我聊天
                </Button>
              </Link>
              <Link to="/blog">
                <Button
                  variant="default"
                  size="lg"
                  style={{ fontWeight: "bold" }}
                >
                  Blog
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="outline" size="lg">
                  Projects
                </Button>
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex gap-3"></div>
          </div>
        </section>

        {/* New Banner Section */}
        <section className="mb-16 md:mb-32">
          <div
            className="relative w-full h-48 md:h-96 bg-cover bg-center bg-no-repeat border-2 border-primary shadow-pixel-lg overflow-hidden"
            style={{
              backgroundImage:
                `url('${MEDIA.common.homeBanner}')`,
            }}
          >
            {/* 半透明遮罩层 */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* 内容层 */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl md:text-4xl font-bold text-white text-pixel-shadow font-pixel mb-2 md:mb-4">
                  CYBER WORLD
                </h2>
                <p className="text-sm md:text-xl text-white/90 font-tech tracking-wide">
                  探索赛博朋克的数字未来
                </p>
              </div>
            </div>

            {/* 像素化边框效果 */}
            <div className="absolute inset-0 border-4 border-primary/20 pointer-events-none"></div>
          </div>
        </section>

        {/* Mac Terminal Section */}
        <section className="mb-16 md:mb-32">
          <div className="max-w-6xl mx-auto">
            {/* macOS Window Chrome */}
            <div
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 229, 255, 0.15)",
              }}
            >
              {/* macOS Title Bar */}
              <div className="bg-[#3a3a3c] px-4 py-30 flex items-center relative">
                <div className="flex gap-2 absolute left-4">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all cursor-pointer"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[#999] text-xs font-medium">
                    {terminalHost} — zsh — 120×48
                  </span>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="bg-[#1e1e2e] relative overflow-hidden">
                {/* Subtle scanlines */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                  }}
                ></div>

                <div className="relative z-10 p-5 font-mono text-[13px] leading-[1.7] space-y-2">
                  {/* SSH Login Command */}
                  <div>
                    <span className="text-[#a6e3a1]">root@local</span>
                    <span className="text-[#cdd6f4]">:</span>
                    <span className="text-[#89b4fa]">~</span>
                    <span className="text-[#cdd6f4]">$ </span>
                    <span className="text-[#cdd6f4]">
                      {`ssh root@${terminalDomain} -p 2222`}
                    </span>
                  </div>
                  <div className="text-[#666] text-xs">
                    {`Connecting to ${terminalDomain}:2222...`}
                  </div>
                  {/* Welcome Banner with ASCII Art MOTD */}
                  <div className="my-2 py-2 border-y border-[#313244]">
                    <pre
                      className="text-[#89b4fa] text-[10px] leading-[1.2] mb-2 select-none opacity-70"
                      style={{ fontFamily: "monospace" }}
                    >
                      {`  ______   __  __   ______   ______   ______   ______   ______   ______
 /\\  ___\\ /\\ \\_\\ \\ /\\  == \\ /\\  ___\\ /\\  == \\ /\\  ___\\ /\\  ___\\ /\\  ___\\
 \\ \\ \\____\\ \\____ \\\\ \\  __< \\ \\  __\\ \\ \\  __< \\ \\___  \\\\ \\  __\\ \\ \\  __\\
  \\ \\_____\\\\/\\_____\\\\ \\_____\\\\ \\_____\\\\ \\_\\ \\_\\\\/\\_____\\\\ \\_____\\\\ \\_____\\
   \\/_____/ \\/_____/ \\/_____/ \\/_____/ \\/_/ /_/ \\/_____/ \\/_____/ \\/_____/`}
                    </pre>
                    <br />
                    <div className="flex items-center gap-3">
                      <img
                        src={MEDIA.common.terminalAvatar}
                        alt="terminal avatar"
                        className="w-7 h-7 rounded"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div>
                        <span className="text-[#a6e3a1]">✔ 身份验证通过</span>
                        <span className="text-[#666]"> · </span>
                        <span className="text-[#cdd6f4]">
                          {terminalWelcome}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 ml-10 text-xs">
                      <span className="text-[#666]">
                        访问模式: <span className="text-[#f9e2af]">DEMO</span>
                      </span>
                      <span className="text-[#666]">|</span>
                      <span className="text-[#666]">
                        站点类型:{" "}
                        <span className="text-[#f38ba8] font-bold">
                          OPEN SOURCE TEMPLATE
                        </span>
                      </span>
                      <span className="text-[#666]">|</span>
                      <span className="text-[#666]">
                        上次登录:{" "}
                        <span className="text-[#cdd6f4]">
                          2026-02-10 03:14 from 10.0.0.1
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Command: cd && ls -la */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#a6e3a1]">{terminalHost}</span>
                      <span className="text-[#cdd6f4]">:</span>
                      <span className="text-[#89b4fa]">~</span>
                      <span className="text-[#cdd6f4]">$ </span>
                      <span className="text-[#f9e2af]">cd</span>{" "}
                      <span className="text-[#cdd6f4]">{terminalHome}</span>{" "}
                      <span className="text-[#fab387]">&&</span>{" "}
                      <span className="text-[#f9e2af]">ls</span>{" "}
                      <span className="text-[#94e2d5]">-la</span>
                    </div>
                    <span className="text-[#555] text-[10px]">took 0.012s</span>
                  </div>
                  <div className="text-[#666] text-xs ml-2">
                    total 128K · 6 items · last modified: just now
                  </div>
                  <div className="ml-2 space-y-[2px] text-xs overflow-x-auto">
                    <div className="flex">
                      <span className="hidden md:inline text-[#666] w-24 shrink-0">
                        -rw-r--r--
                      </span>
                      <span className="hidden md:inline text-[#666] w-12 shrink-0 text-right mr-3">
                        2.4K
                      </span>
                      <span className="hidden md:inline text-[#666] w-28 shrink-0">
                        Feb 10 03:14
                      </span>
                      <span className="text-[#cba6f7]">profile.yml</span>
                    </div>
                    <div className="flex">
                      <span className="hidden md:inline text-[#666] w-24 shrink-0">
                        -rw-r--r--
                      </span>
                      <span className="hidden md:inline text-[#666] w-12 shrink-0 text-right mr-3">
                        8.1K
                      </span>
                      <span className="hidden md:inline text-[#666] w-28 shrink-0">
                        Feb 09 22:30
                      </span>
                      <span className="text-[#89b4fa]">skills_frontend.md</span>
                    </div>
                    <div className="flex">
                      <span className="hidden md:inline text-[#666] w-24 shrink-0">
                        -rw-r--r--
                      </span>
                      <span className="hidden md:inline text-[#666] w-12 shrink-0 text-right mr-3">
                        6.7K
                      </span>
                      <span className="hidden md:inline text-[#666] w-28 shrink-0">
                        Feb 09 22:30
                      </span>
                      <span className="text-[#89b4fa]">skills_backend.md</span>
                    </div>
                    <div className="flex">
                      <span className="hidden md:inline text-[#666] w-24 shrink-0">
                        -rw-r--r--
                      </span>
                      <span className="hidden md:inline text-[#666] w-12 shrink-0 text-right mr-3">
                        4.2K
                      </span>
                      <span className="hidden md:inline text-[#666] w-28 shrink-0">
                        Feb 10 01:05
                      </span>
                      <span className="text-[#89b4fa]">skills_ai.md</span>
                    </div>
                    <div className="flex">
                      <span className="hidden md:inline text-[#666] w-24 shrink-0">
                        -rw-r--r--
                      </span>
                      <span className="hidden md:inline text-[#666] w-12 shrink-0 text-right mr-3">
                        3.8K
                      </span>
                      <span className="hidden md:inline text-[#666] w-28 shrink-0">
                        Feb 08 18:42
                      </span>
                      <span className="text-[#89b4fa]">skills_creative.md</span>
                    </div>
                    <div className="flex">
                      <span className="hidden md:inline text-[#666] w-24 shrink-0">
                        -rwxr-xr-x
                      </span>
                      <span className="hidden md:inline text-[#666] w-12 shrink-0 text-right mr-3">
                        512
                      </span>
                      <span className="hidden md:inline text-[#666] w-28 shrink-0">
                        Feb 07 09:00
                      </span>
                      <span className="text-[#a6e3a1]">neofetch.sh</span>
                    </div>
                  </div>

                  <div className="border-b border-[#313244] my-1"></div>

                  {/* Command: cat profile.yml */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#a6e3a1]">{terminalHost}</span>
                      <span className="text-[#cdd6f4]">:</span>
                      <span className="text-[#89b4fa]">{terminalHome}</span>
                      <span className="text-[#cdd6f4]">$ </span>
                      <span className="text-[#f9e2af]">cat</span>{" "}
                      <span className="text-[#cdd6f4]">profile.yml</span>{" "}
                      <span className="text-[#fab387]">|</span>{" "}
                      <span className="text-[#f9e2af]">jq</span>{" "}
                      <span className="text-[#94e2d5]">--color-output</span>
                    </div>
                    <span className="text-[#555] text-[10px]">took 0.038s</span>
                  </div>
                  <div className="text-[#666] text-xs ml-2 space-y-[1px]">
                    <div>▸ 正在读取个人档案... </div>
                    <div>
                      ▸ 解密数据中...{" "}
                      <span className="text-[#89b4fa]">
                        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░ 99%{" "}
                      </span>
                    </div>
                    <div>
                      ▸ 加载完成 <span className="text-[#a6e3a1]">done</span>
                    </div>
                  </div>

                  {/* Profile Card */}
                  <div className="ml-2 my-6 bg-[#181825] border border-[#313244] rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4 p-3 md:p-4">
                      {/* Avatar Column */}
                      <div className="shrink-0 flex flex-col items-center gap-2">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-br from-[#89b4fa]/30 to-[#cba6f7]/30 rounded-xl blur-sm"></div>
                          <img
                            src={DEMO_PROFILE.avatar}
                            alt={DEMO_PROFILE.name}
                            className="relative w-[100px] h-[100px] rounded-xl object-cover border-2 border-[#89b4fa]/40"
                          />
                        </div>
                        <div className="text-center text-[10px] text-[#555] space-y-0.5">
                          <div>
                            ☐ 在线{" "}
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a6e3a1] align-middle"></span>
                          </div>
                          <div>uptime: 365d</div>
                        </div>
                        <div className="text-[#89b4fa] text-xs font-bold mt-1">
                          个人档案
                        </div>
                      </div>
                      {/* Info Column */}
                      <div className="flex-1 text-xs space-y-2.5 min-w-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 md:gap-x-4 gap-y-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[#666]">姓名:</span>
                            <span className="text-[#cdd6f4] font-medium">
                              {DEMO_PROFILE.displayName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#666]">职业:</span>
                            <span className="text-[#89b4fa]">全栈开发者</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#666]">年龄:</span>
                            <span className="text-[#cdd6f4]">28</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#666]">身高:</span>
                            <span className="text-[#cdd6f4]">180cm</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#666]">体重:</span>
                            <span className="text-[#cdd6f4]">72kg</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#666]">学历:</span>
                            <span className="text-[#cdd6f4]">本科</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#666]">星座:</span>
                            <span className="text-[#cdd6f4]">双子座</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#666]">MBTI:</span>
                            <span className="text-[#cba6f7] font-bold">
                              ENTJ
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#666] shrink-0">颜值:</span>
                            <span className="text-[#f38ba8] whitespace-nowrap">
                              ▓▓▓▓▓▓▓▓▓░░░░ 85
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#666] shrink-0">智商:</span>
                            <span className="text-[#89b4fa] whitespace-nowrap">
                              ▓▓▓▓▓▓▓▓▓▓░░░ 120
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#666] shrink-0">情商:</span>
                            <span className="text-[#f9e2af] whitespace-nowrap">
                              ▓▓▓▓▓▓▓▓░░░░ 140
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#666] shrink-0">力量:</span>
                            <span className="text-[#a6e3a1] whitespace-nowrap">
                              ▓▓▓▓▓▓▓▓▓░░░░ 75
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#666] shrink-0">敏捷:</span>
                            <span className="text-[#94e2d5] whitespace-nowrap">
                              ▓▓▓▓▓▓▓▓░░░░ 70
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#666] shrink-0">法力:</span>
                            <span className="text-[#89b4fa] whitespace-nowrap">
                              ▓▓▓▓▓▓▓▓░░░░ 60
                            </span>
                          </div>
                          {/* <div className="flex items-center gap-1.5">
                            <span className="text-[#666] shrink-0">法力</span>
                            <span className="text-[#f38ba8] whitespace-nowrap">
                              <span className="bg-[#f38ba8]/20 px-1 rounded text-[10px]">
                                ▓▓▓▓▓▓▓▓░░░░ 70
                              </span>
                            </span>
                          </div> */}
                        </div>
                        {/* Titles / 称号 */}
                        <div className="py-3 border-t border-[#313244] text-xs">
                          <div className="text-[#666] mb-2">已达成就</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded bg-[#89b4fa]/10 border border-[#89b4fa]/30 text-[#89b4fa]">
                              ⭐ 开源实践者
                            </span>
                            <span className="px-2 py-1 rounded bg-[#cba6f7]/10 border border-[#cba6f7]/30 text-[#cba6f7]">
                              🧠 AI 应用探索者
                            </span>
                            <span className="px-2 py-1 rounded bg-[#a6e3a1]/10 border border-[#a6e3a1]/30 text-[#a6e3a1]">
                              🛠 工程搭建者
                            </span>
                            <span className="px-2 py-1 rounded bg-[#f9e2af]/10 border border-[#f9e2af]/30 text-[#f9e2af]">
                              ✍️ 技术内容创作者
                            </span>
                            <span className="px-2 py-1 rounded bg-[#a6e3a1]/10 border border-[#a6e3a1]/30 text-[#a6e3a1]">
                              🎨 创意设计爱好者
                            </span>
                            <span className="px-2 py-1 rounded bg-[#a6e3a1]/10 border border-[#a6e3a1]/30 text-[#a6e3a1]">
                              🚀 模板场景演示者
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-[#313244] my-1"></div>

                  {/* Command: skills */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#a6e3a1]">{terminalHost}</span>
                      <span className="text-[#cdd6f4]">:</span>
                      <span className="text-[#89b4fa]">{terminalHome}</span>
                      <span className="text-[#cdd6f4]">$ </span>
                      <span className="text-[#f9e2af]">paste</span>{" "}
                      <span className="text-[#cdd6f4]">skills_*.md</span>{" "}
                      <span className="text-[#fab387]">|</span>{" "}
                      <span className="text-[#f9e2af]">sort</span>{" "}
                      <span className="text-[#94e2d5]">-k2 -rn</span>{" "}
                      <span className="text-[#fab387]">|</span>{" "}
                      <span className="text-[#f9e2af]">column</span>{" "}
                      <span className="text-[#94e2d5]">-t</span>
                    </div>
                    <span className="text-[#555] text-[10px]">took 0.067s</span>
                  </div>
                  <div className="text-[#666] text-xs ml-2 space-y-[1px]">
                    <div>▸ 正在扫描技能模块...</div>
                    <div>
                      ▸ 载入技能分支...{" "}
                      <span className="text-[#89b4fa]">
                        ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░ 99%{" "}
                      </span>
                    </div>
                    <div>
                      ▸ 数据就绪 <span className="text-[#a6e3a1]">done</span>
                    </div>
                  </div>

                  {/* Skills Display */}
                  <div className="ml-2 my-2 bg-[#181825] border border-[#313244] rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {skillCategories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <div key={category.id}>
                            <div
                              className="text-xs font-bold mb-1.5 flex items-center gap-1.5"
                              style={{ color: category.color }}
                            >
                              <IconComponent size={16} strokeWidth={2} />{" "}
                              {category.category}
                            </div>
                            <div className="space-y-2">
                              {category.skills.map((skill) => (
                                <div
                                  key={skill.name}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <span className="text-[#cdd6f4] w-24 md:w-32 shrink-0">
                                    {skill.name}
                                  </span>
                                  <div className="flex-1 h-1.5 bg-[#313244] rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${skill.level}%`,
                                        backgroundImage: `linear-gradient(to right, ${category.gradientFrom}, ${category.gradientTo})`,
                                      }}
                                    ></div>
                                  </div>
                                  <span
                                    className="w-8 text-right"
                                    style={{ color: category.color }}
                                  >
                                    {skill.level}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-b border-[#313244] my-1"></div>

                  {/* Logout Command */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#a6e3a1]">{terminalHost}</span>
                      <span className="text-[#cdd6f4]">:</span>
                      <span className="text-[#89b4fa]">{terminalHome}</span>
                      <span className="text-[#cdd6f4]">$ </span>
                      <span className="text-[#f9e2af]">exit</span>
                    </div>
                    <span className="text-[#555] text-[10px]">took 0.004s</span>
                  </div>
                  <div className="text-[#666] text-xs ml-2 space-y-[1px]">
                    <div>▸ 正在安全断开连接...</div>
                    <div>▸ 会话数据已加密归档</div>
                    <div>{`Connection to ${terminalDomain} closed.`}</div>
                  </div>

                  {/* Back to local prompt */}
                  <div className="flex items-center pt-1">
                    <span className="text-[#a6e3a1]">root@local</span>
                    <span className="text-[#cdd6f4]">:</span>
                    <span className="text-[#89b4fa]">~</span>
                    <span className="text-[#cdd6f4]">$ </span>
                    <span className="inline-block w-2 h-4 bg-[#cdd6f4] ml-1 terminal-cursor"></span>
                  </div>
                </div>

                {/* tmux-style status bar */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#11111b] text-[10px] font-mono border-t border-[#313244]">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#a6e3a1] text-[#11111b] px-1.5 py-0.5 rounded-sm font-bold">
                      0
                    </span>
                    <span className="text-[#cdd6f4]">{terminalSession}</span>
                    <span className="text-[#666]">│</span>
                    <span className="text-[#89b4fa]">1:vim</span>
                    <span className="hidden md:inline text-[#666]">│</span>
                    <span className="hidden md:inline text-[#666]">2:htop</span>
                  </div>
                  <div className="hidden md:flex items-center gap-3 text-[#666]">
                    <span>↑ 0.42 GB</span>
                    <span className="text-[#666]">│</span>
                    <span>
                      CPU <span className="text-[#a6e3a1]">12%</span>
                    </span>
                    <span className="text-[#666]">│</span>
                    <span>
                      MEM <span className="text-[#f9e2af]">4.2G/16G</span>
                    </span>
                    <span className="text-[#666]">│</span>
                    <span className="text-[#cdd6f4]">Feb 10 11:28</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="max-w-4xl mx-auto mb-12 md:mb-20">
          <div className="border-2 border-primary p-4 md:p-8 shadow-pixel-lg hover:shadow-pixel transition-all relative overflow-hidden">
            {/* 背景色层 */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundColor: "#97F3E7" }}
            ></div>

            {/* 背景图片 */}
            <div
              className="absolute inset-0 bg-contain bg-no-repeat pointer-events-none"
              style={{
                backgroundImage:
                  `url('${MEDIA.common.cyberCover}')`,
                backgroundPosition: "right -50px",
                backgroundSize: "clamp(200px, 60%, 60%)",
              }}
            ></div>

            {/* 半透明遮罩层 */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

            {/* 终端扫描线效果 */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse"></div>
              <div className="absolute top-0 left-0 right-0 h-px bg-primary/30 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/30 animate-pulse"></div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-primary text-pixel-shadow font-mono uppercase tracking-wider relative z-20">
              &gt; ABOUT_ME.TXT
            </h2>
            <div className="relative z-20">
              <pre
                className="whitespace-pre-wrap font-mono text-primary leading-relaxed text-sm md:text-base bg-black/60 p-3 md:p-4 border border-primary/30 min-h-[120px] md:min-h-[160px] overflow-y-auto"
                style={{
                  textShadow: "0 0 10px hsl(var(--primary))",
                  fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                  maxHeight: "none",
                }}
              >
                {aboutDisplayText}
                <span
                  className="terminal-cursor inline-block w-3 h-5 bg-primary ml-1"
                  style={{
                    boxShadow:
                      "0 0 15px hsl(var(--primary)), 0 0 25px hsl(var(--primary))",
                    textShadow: "0 0 10px hsl(var(--primary))",
                  }}
                >
                  █
                </span>
              </pre>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-border relative z-20">
              <Link to="/about">
                <Button variant="secondary" size="lg" className="w-full">
                  About Me
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
