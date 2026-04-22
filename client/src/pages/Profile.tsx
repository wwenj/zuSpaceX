import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, Edit2, Save, X, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  getUserInfo,
  logout,
  refreshUser,
  validateNickname,
  type UserInfo,
} from "@/lib/auth";
import { userApi } from "@/api";
import { AVATARS } from "@/lib/avatars";
import { formatPageTitle, SITE_BRAND } from "@/lib/siteProfile";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [tankHighScore, setTankHighScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 设置页面 SEO
    document.title = formatPageTitle("个人信息");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `管理您的 ${SITE_BRAND.name} 账户信息。`,
      );
    }

    // 加载用户信息
    const loadUser = async () => {
      const userInfo = await getUserInfo(true);
      if (!userInfo) {
        navigate("/login");
        return;
      }
      setUser(userInfo);
      setTankHighScore(userInfo.gameScore || 0);
      setLoading(false);
    };
    loadUser();
  }, [navigate]);

  const handleSaveNickname = async () => {
    if (!validateNickname(newNickname)) {
      toast({
        title: "昵称格式错误",
        description: "昵称不能为空且不超过8个字符",
        variant: "destructive",
      });
      return;
    }

    if (user) {
      try {
        // 调用 API 更新用户信息
        await userApi.update({
          id: user.id,
          nickname: newNickname,
        });

        const updatedUser = await refreshUser();
        if (!updatedUser) {
          throw new Error("刷新用户信息失败");
        }
        setUser(updatedUser);
        setIsEditingNickname(false);

        toast({
          title: "昵称已更新",
          description: "您的昵称已成功修改",
        });
      } catch (error) {
        toast({
          title: "更新失败",
          description:
            error instanceof Error ? error.message : "网络错误，请稍后重试",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      toast({
        title: "请选择头像",
        variant: "destructive",
      });
      return;
    }

    if (user) {
      try {
        // 调用 API 更新用户信息
        await userApi.update({
          id: user.id,
          avatar: selectedAvatar,
        });

        const updatedUser = await refreshUser();
        if (!updatedUser) {
          throw new Error("刷新用户信息失败");
        }
        setUser(updatedUser);
        setIsEditingAvatar(false);

        toast({
          title: "头像已更新",
          description: "您的头像已成功修改",
        });
      } catch (error) {
        toast({
          title: "更新失败",
          description:
            error instanceof Error ? error.message : "网络错误，请稍后重试",
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = async () => {
    await logout();

    toast({
      title: "已退出登录",
      description: "期待您的再次访问",
    });

    navigate("/");
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <main className="pt-32 pb-20">
      <div className="relative max-w-lg mx-auto px-4 md:px-6">
        <Card className="bg-card border-2 border-primary shadow-pixel-lg p-6">
          {/* 标题 */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-primary text-pixel-shadow mb-2">
              个人信息
            </h1>
            <p className="text-text-secondary font-normal text-sm">
              {`管理您的 ${SITE_BRAND.name} 身份信息`}
            </p>
          </div>

          {/* 头像展示区 - 缩小并带编辑按钮 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 border-2 border-primary shadow-pixel">
                <img
                  src={user.avatar}
                  alt={user.nickname}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              {/* 右下角编辑按钮 */}
              <button
                onClick={() => {
                  setSelectedAvatar(user.avatar);
                  setIsEditingAvatar(true);
                }}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary border-2 border-primary-hover shadow-pixel hover:shadow-pixel-lg flex items-center justify-center transition-all hover:scale-110"
              >
                <Edit2 className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>

          {/* 信息卡片组 - 紧凑布局 */}
          <div className="space-y-3 mb-6">
            {/* 身份编号 */}
            <div className="p-4 border-2 border-border bg-surface-secondary">
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary font-normal text-sm">
                  登录账号
                </span>
                <span className="text-primary text-base font-pixel tracking-widest">
                  {user.account}
                </span>
              </div>
            </div>

            {/* 昵称 */}
            <div className="p-4 border-2 border-border bg-surface-secondary">
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary font-normal text-sm">
                  昵称
                </span>
                <div className="flex items-center gap-3">
                  {!isEditingNickname ? (
                    <>
                      <span className="text-text-primary text-base font-normal">
                        {user.nickname}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewNickname(user.nickname);
                          setIsEditingNickname(true);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        type="text"
                        placeholder="输入昵称"
                        maxLength={8}
                        value={newNickname}
                        onChange={(e) => setNewNickname(e.target.value)}
                        className="w-32 h-8 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingNickname(false)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSaveNickname}
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 坦克游戏最高分 */}
            <div
              className="p-4 border-2 border-primary bg-surface-secondary relative overflow-hidden"
              style={{
                boxShadow: "0 0 15px rgba(0, 229, 255, 0.2)",
              }}
            >
              <div className="flex items-center justify-between relative z-10 mb-3">
                <div className="flex items-center gap-2">
                  <Trophy
                    className="w-4 h-4 text-[#00E5FF]"
                    style={{
                      filter: "drop-shadow(0 0 4px #00E5FF)",
                    }}
                  />
                  <span className="text-text-tertiary font-normal text-sm">
                    坦克游戏最高分
                  </span>
                </div>
                <span
                  className="text-[#00E5FF] text-xl font-pixel tracking-wider"
                  style={{
                    textShadow: "0 0 10px rgba(0, 229, 255, 0.8)",
                  }}
                >
                  {tankHighScore}
                </span>
              </div>

              {/* 发光背景效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00E5FF]/5 to-transparent animate-pulse"></div>
            </div>
          </div>

          {/* 退出登录按钮 */}
          <div className="pt-4 border-t-2 border-border">
            <Button
              variant="destructive"
              size="default"
              className="w-full"
              onClick={() => void handleLogout()}
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </Button>
          </div>

          {/* 返回首页 */}
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-text-secondary hover:text-primary text-sm"
            >
              返回首页
            </Button>
          </div>
        </Card>
      </div>

      {/* 头像选择弹窗 */}
      <Dialog open={isEditingAvatar} onOpenChange={setIsEditingAvatar}>
        <DialogContent className="bg-card border-2 border-primary max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary text-xl font-pixel">
              选择头像
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
            {AVATARS.map((avatar, index) => (
              <button
                key={index}
                onClick={() => setSelectedAvatar(avatar)}
                className={`aspect-square border-2 transition-all overflow-hidden ${
                  selectedAvatar === avatar
                    ? "border-primary shadow-pixel scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditingAvatar(false)}
            >
              取消
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleSaveAvatar}
            >
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
