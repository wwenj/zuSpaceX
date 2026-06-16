import { useNavigate, useMatch, useLocation } from "react-router-dom";
import { MEDIA } from "@/lib/siteAssets";

const AGENT_AVATAR = MEDIA.common.avatarClosed;

// 坦克按钮高度约 36px + bottom-6(24px) + 间距 8px = 68px
const BOTTOM_OFFSET = "68px";

export function FloatChatButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const blogMatch = useMatch("/blog/:id");

  // 聊天页不渲染
  if (location.pathname.startsWith("/chat")) return null;

  // 文章详情页 - 文章分析按钮
  if (blogMatch?.params.id) {
    const articleId = blogMatch.params.id;
    // BlogDetail 会把标题设置到 document.title，格式为 "${title} - 技术博客"
    const rawTitle = document.title
      .replace(/\s*[-–]\s*技术博客\s*$/, "")
      .trim();
    const articleTitle = rawTitle && rawTitle !== "技术博客" ? rawTitle : "";
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes fc-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          @keyframes fc-ring {
            0% { transform: scale(1); opacity: 0.55; }
            100% { transform: scale(2); opacity: 0; }
          }
        `,
          }}
        />
        <div className="fixed right-6 z-50" style={{ bottom: BOTTOM_OFFSET }}>
          <button
            onClick={() => {
              const params = new URLSearchParams({ articleId });
              if (articleTitle) params.set("articleTitle", articleTitle);
              navigate(`/chat?${params.toString()}`);
            }}
            className="relative flex items-center gap-2.5 pl-1 pr-4 py-1 font-bold text-sm bg-[#181024] border border-[#cba6f7]/60 text-[#cba6f7] hover:border-[#cba6f7] hover:bg-[#cba6f7]/10 hover:scale-105 active:scale-95 transition-all duration-200"
            style={{
              animation: "fc-float 3s ease-in-out infinite",
              boxShadow:
                "0 0 16px rgba(203,166,247,0.35), 0 0 32px rgba(203,166,247,0.15)",
            }}
          >
            {/* 扩散光圈 */}
            <span
              className="absolute inset-0 pointer-events-none border border-[#cba6f7]/40"
              style={{ animation: "fc-ring 2.4s ease-out infinite" }}
            />
            {/* 头像 */}
            <div className="w-8 h-8 border border-[#cba6f7]/50 overflow-hidden shrink-0 bg-[#0d0d1a]">
              <img
                src={AGENT_AVATAR}
                alt="演示助手"
                className="w-full h-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <span>AI 快速讲解，立即提问</span>
            {/* 状态点 */}
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#f38ba8] shadow-[0_0_6px_rgba(243,139,168,0.9)] animate-pulse" />
          </button>
        </div>
      </>
    );
  }

  // 通用聊天按钮
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fc-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fc-ring {
          0% { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(2); opacity: 0; }
        }
      `,
        }}
      />
      <div className="fixed right-6 z-50" style={{ bottom: BOTTOM_OFFSET }}>
        <button
          onClick={() => navigate("/chat")}
          className="relative flex items-center gap-2.5 pl-1 pr-4 py-1 font-bold text-sm bg-[#06141e] border border-[#00E5FF]/60 text-[#00E5FF] hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 hover:scale-105 active:scale-95 transition-all duration-200"
          style={{
            animation: "fc-float 3s ease-in-out infinite",
            boxShadow:
              "0 0 16px rgba(0,229,255,0.3), 0 0 32px rgba(0,229,255,0.12)",
          }}
        >
          {/* 扩散光圈 */}
          <span
            className="absolute inset-0 pointer-events-none border border-[#00E5FF]/35"
            style={{ animation: "fc-ring 2.4s ease-out infinite" }}
          />
          {/* 头像 */}
          <div className="w-8 h-8 border border-[#00E5FF]/50 overflow-hidden shrink-0 bg-[#06141e]">
            <img
              src={AGENT_AVATAR}
              alt="演示助手"
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <span>AI 助手，立即交流</span>
          {/* 在线状态点 */}
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#00FF9D] shadow-[0_0_6px_rgba(0,255,157,0.9)] animate-pulse" />
        </button>
      </div>
    </>
  );
}
