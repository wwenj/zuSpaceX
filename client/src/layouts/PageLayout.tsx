import { Outlet, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { GameCloseButton } from "@/components/GameCloseButton";
import { FloatChatButton } from "@/components/FloatChatButton";
import Footer from "@/components/Footer";
import MobileHint from "@/components/MobileHint";

const PageLayout = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-cyber crt-effect">
      <div className="absolute inset-0 bg-grid-pixel opacity-40"></div>
      <div className="absolute inset-0 bg-dots-pixel opacity-20"></div>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-60 scan-line"></div>

      <Navigation />
      <MobileHint />

      <div
        className={`relative z-10 flex flex-col ${
          isChatPage ? "h-[100dvh] overflow-hidden" : "min-h-screen"
        }`}
      >
        <div className={`flex-1 ${isChatPage ? "overflow-hidden" : ""}`}>
          <Outlet />
        </div>
        {!isChatPage ? <Footer /> : null}
      </div>

      {!isChatPage ? (
        <>
          <div className="fixed bottom-10 right-10 w-16 h-16 border-2 border-primary/40 animate-pixel-bounce"></div>
          <div className="fixed top-1/4 left-10 w-12 h-12 border-2 border-secondary/40 animate-pixel-blink"></div>
          <div className="fixed top-1/3 right-20 w-8 h-8 bg-accent/30 animate-pulse"></div>
          <GameCloseButton />
        </>
      ) : null}
      <FloatChatButton />
    </div>
  );
};

export default PageLayout;
