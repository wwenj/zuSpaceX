import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { User, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserInfo, isAdmin, type UserInfo } from "@/lib/auth";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 获取当前用户信息
    const loadUserInfo = async () => {
      const currentUser = await getUserInfo();
      setUser(currentUser);
    };
    loadUserInfo();

    // 监听 storage 事件以实时更新用户信息
    const handleStorageChange = async () => {
      const currentUser = await getUserInfo(true);
      setUser(currentUser);
    };

    window.addEventListener("user-info-changed", handleStorageChange);

    return () => {
      window.removeEventListener("user-info-changed", handleStorageChange);
    };
  }, []);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/blog", label: "Blog" },
    { path: "/projects", label: "Projects" },
    { path: "/chat", label: "Chat" },
    { path: "/about", label: "About" },
    { path: "/guestbook", label: "Guestbook" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-primary/90 backdrop-blur-md border-b-2 border-primary shadow-pixel">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary border-2 border-primary-hover shadow-pixel group-hover:shadow-pixel-lg flex items-center justify-center transition-all">
              <span className="text-primary-foreground font-bold text-base md:text-xl font-pixel">
                ZU
              </span>
            </div>
            <span className="text-sm md:text-base font-bold font-pixel text-primary text-pixel-shadow">
              SPACE
            </span>
          </Link>

          {/* Navigation Links - 窄屏隐藏 */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Section: User + Mobile Menu */}
          <div className="flex items-center gap-2">
            {user && isAdmin(user.role) && (
              <Link to="/admin/articles" className="hidden md:block">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            )}

            {/* User Section */}
            {user ? (
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-1 md:gap-3 group"
              >
                <div className="w-8 h-8 md:w-12 md:h-12 border-2 border-primary overflow-hidden shadow-pixel group-hover:shadow-pixel-lg transition-all group-hover:scale-110">
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <span className="text-xs md:text-lg text-text-primary font-pixel-alt group-hover:text-primary transition-colors truncate max-w-[80px] md:max-w-none">
                  {user.nickname}
                </span>
              </button>
            ) : (
              <Link to="/login">
                <Button variant="neon" size="sm">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-primary hover:text-primary-hover transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-primary/30">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              {user && isAdmin(user.role) && (
                <Link
                  to="/admin/articles"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive("/admin") ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                  >
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pixel Border Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-60 animate-pulse"></div>
    </nav>
  );
}
