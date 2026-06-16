import { MEDIA } from "@/lib/siteAssets";

const Footer = () => {
  return (
    <footer className="py-6 relative">
      {/* 赛博朋克风格分割线 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center">
        <div className="flex items-center gap-2">
          {/* 左侧装饰点 */}
          <div className="w-1 h-1 bg-primary/40 animate-pulse"></div>
          {/* 主分割线 */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          {/* 中心装饰点 */}
          <div className="w-1.5 h-1.5 bg-primary/60 animate-pixel-blink"></div>
          {/* 主分割线 */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          {/* 右侧装饰点 */}
          <div
            className="w-1 h-1 bg-secondary/40 animate-pulse"
            style={{ animationDelay: "0.3s" }}
          ></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* 简洁的一行布局 */}
        <div className="flex items-center justify-center gap-3 text-foreground/80 text-sm">
          {/* 左侧装饰点 */}
          <div className="w-1.5 h-1.5 bg-primary/60 animate-pulse rounded-full"></div>

          {/* 备案信息 */}
          <a
            href="https://beian.miit.gov.cn/#/Integrated/index"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary/80 transition-colors cursor-pointer"
          >
            <img
              src={MEDIA.common.recordIcon}
              alt="备案图标"
              className="w-4 h-4 opacity-70"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="tracking-wide text-foreground/90">
              备案信息占位中
            </span>
          </a>

          {/* 右侧装饰点 */}
          <div
            className="w-1.5 h-1.5 bg-secondary/60 animate-pulse rounded-full"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
