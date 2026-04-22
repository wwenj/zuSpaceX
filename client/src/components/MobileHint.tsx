import { useEffect, useState } from "react";
import { Monitor, X } from "lucide-react";

const STORAGE_KEY = "mobile_hint_dismissed_at";
const ONE_MONTH_MS = 1 * 24 * 60 * 60 * 1000;
const DISPLAY_DURATION = 8000;

function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth < 768
  );
}

export default function MobileHint() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isMobileDevice()) return;

    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (elapsed < ONE_MONTH_MS) return;
    }

    // 延迟一点出现，避免页面加载时闪烁
    const showTimer = setTimeout(() => setVisible(true), 1000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;

    // 记录到 localStorage
    localStorage.setItem(STORAGE_KEY, String(Date.now()));

    // 自动消失
    const fadeTimer = setTimeout(() => setFadeOut(true), DISPLAY_DURATION);
    const hideTimer = setTimeout(
      () => setVisible(false),
      DISPLAY_DURATION + 500,
    );

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => setVisible(false), 500);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${
        fadeOut ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="w-80 px-4 py-3 rounded-lg bg-[#1C1C1C]/95 backdrop-blur-md border border-primary/40 shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-primary">
              推荐 PC 端访问
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-[#666] hover:text-[#cdd6f4] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-[#a6a6a6] leading-relaxed">
          在 PC 端浏览可获得最佳视觉体验，手机端可能导致某些元素渲染错位
        </p>
      </div>
    </div>
  );
}
