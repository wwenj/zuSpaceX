import { useState } from "react";
import { MEDIA } from "@/lib/siteAssets";

export function GameCloseButton() {
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isTankButtonHovered, setIsTankButtonHovered] = useState(false);

  const handleStartGame = () => {
    if (window.__tankGame__) {
      window.__tankGame__.start();
      setIsGameRunning(true);
    }
  };

  const handleCloseGame = () => {
    if (window.__tankGame__) {
      window.__tankGame__.stop();
      setIsGameRunning(false);
    }
  };

  // 游戏未运行时，显示开始按钮
  if (!isGameRunning) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleStartGame}
          onMouseEnter={() => setIsTankButtonHovered(true)}
          onMouseLeave={() => setIsTankButtonHovered(false)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1C] border border-[#00E5FF] text-[#00E5FF] text-sm rounded shadow-[0_0_8px_#00E5FF] hover:bg-[#00E5FF] hover:text-[#0D0D0D] hover:shadow-[0_0_16px_#00E5FF] transition-all duration-200"
        >
          <img
            src={MEDIA.game.playerTank}
            alt="坦克图标"
            className="w-4 h-4"
          />
          坦克大战
        </button>
      </div>
    );
  }

  // 游戏运行中，显示关闭按钮
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleCloseGame}
        className="px-4 py-2 bg-[#1C1C1C] border border-[#00E5FF] text-[#00E5FF] text-sm rounded shadow-[0_0_8px_#00E5FF] hover:bg-[#00E5FF] hover:text-[#0D0D0D] hover:shadow-[0_0_16px_#00E5FF] transition-all duration-200"
      >
        关闭游戏
      </button>
    </div>
  );
}
