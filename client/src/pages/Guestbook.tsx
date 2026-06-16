import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getUserInfo, isAdmin, type UserInfo } from "@/lib/auth";
import { commentApi } from "@/api/comment";
import type { Comment } from "@/api/types";
import { formatPageTitle, SITE_BRAND } from "@/lib/siteProfile";
import { MEDIA } from "@/lib/siteAssets";
import "@/lib/tankGame";

// 移除MessageWithUser接口，直接使用Comment类型

const MESSAGES_PER_PAGE = 10;

export default function Guestbook() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  // 说话动画和打字机效果
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const bubbleText = "留下你的想法，一起交流技术与创意";

  // 加载留言列表
  const loadMessages = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        const response = await commentApi.list({
          page,
          pageSize: MESSAGES_PER_PAGE,
          type: "website",
          source: 1, // 使用数字1表示留言板
        });

        // 直接使用服务端返回的留言数据，已包含用户信息
        setMessages(response.list);
        setTotalPages(response.totalPages);
        setTotal(response.total);
        setCurrentPage(response.page);
      } catch (error) {
        console.error("加载留言失败:", error);
        toast({
          title: "加载失败",
          description: "无法加载留言列表，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // 头像图片
  const avatarImages = {
    closed: MEDIA.common.avatarClosed,
    open: MEDIA.common.avatarOpen,
  };

  useEffect(() => {
    // 设置页面 SEO
    document.title = formatPageTitle("留言板");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `在 ${SITE_BRAND.name} 留言板留下你的想法、建议或问候。`,
      );
    }

    // 获取当前用户
    const loadUser = async () => {
      const userInfo = await getUserInfo();
      setUser(userInfo);
    };
    loadUser();

    // 加载留言
    loadMessages(1);

    // 监听用户信息变化
    const handleUserChange = async () => {
      const userInfo = await getUserInfo();
      setUser(userInfo);
    };
    window.addEventListener("user-info-changed", handleUserChange);

    // 每 0.6 秒切换图片，实现说话动画
    const mouthInterval = setInterval(() => {
      setIsMouthOpen((prev) => !prev);
    }, 600);

    // 打字机效果
    let textIndex = 0;
    const typingInterval = setInterval(() => {
      if (textIndex <= bubbleText.length) {
        setDisplayedText(bubbleText.slice(0, textIndex));
        textIndex++;
      } else {
        // 完成后等待 2 秒重置
        setTimeout(() => {
          textIndex = 0;
          setDisplayedText("");
        }, 2000);
      }
    }, 150);

    return () => {
      window.removeEventListener("user-info-changed", handleUserChange);
      clearInterval(mouthInterval);
      clearInterval(typingInterval);
    };
  }, [loadMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录后才能留言",
        variant: "destructive",
      });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!newMessage.trim()) {
      toast({
        title: "留言不能为空",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      await commentApi.create({
        content: newMessage.trim(),
        type: "website",
        source: 1, // 使用数字1表示留言板
      });

      toast({
        title: "留言成功",
        description: "感谢你的留言！",
      });

      setNewMessage("");
      // 重新加载第一页
      await loadMessages(1);
    } catch (error) {
      console.error("发送留言失败:", error);
      toast({
        title: "发送失败",
        description: "留言发送失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (messageId: string, messageUserId: string) => {
    if (!user) {
      toast({
        title: "请先登录",
        variant: "destructive",
      });
      return;
    }

    if (user.id !== messageUserId && !isAdmin(user.role)) {
      toast({
        title: "无法删除",
        description: "只能删除自己的留言，管理员可删除全部留言",
        variant: "destructive",
      });
      return;
    }

    try {
      await commentApi.delete({ id: messageId });

      toast({
        title: "删除成功",
        description: "留言已删除",
      });

      // 重新加载当前页
      await loadMessages(currentPage);
    } catch (error) {
      console.error("删除留言失败:", error);
      toast({
        title: "删除失败",
        description: "删除留言失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

  // 格式化完整日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 处理分页
  const handlePrevPage = async () => {
    if (currentPage > 1) {
      await loadMessages(currentPage - 1);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      await loadMessages(currentPage + 1);
    }
  };

  return (
    <main className="pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header with Avatar and Chat Bubble */}
        <header className="mb-8 flex flex-col md:flex-row items-center justify-center relative gap-4">
          {/* Title */}
          <h1
            className="md:absolute md:left-0 md:bottom-0 text-2xl md:text-3xl font-bold text-[#00E5FF] font-tech tracking-wider"
            style={{
              textShadow: "0 0 20px rgba(0, 229, 255, 0.6)",
            }}
          >
            留言板
          </h1>

          {/* Avatar with Talking Animation - 居中 */}
          <div className="relative">
            <div className="relative">
              <div
                className="w-20 h-20 md:w-24 md:h-24 border-2 border-[#00E5FF] overflow-hidden flex-shrink-0"
                style={{
                  boxShadow: "0 0 20px rgba(0, 229, 255, 0.5)",
                }}
              >
                <img
                  src={isMouthOpen ? avatarImages.open : avatarImages.closed}
                  alt="留言板角色"
                  className="w-full h-full object-cover transition-none"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>

              {/* Chat Bubble with Typewriter Effect - 窄屏隐藏 */}
              <div className="hidden md:block absolute top-0 left-full ml-3 z-10">
                {/* Speech Bubble Triangle */}
                <div className="absolute left-[-10px] top-6 w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-[#00E5FF] border-b-[6px] border-b-transparent"></div>

                {/* Bubble Content */}
                <div
                  className="bg-[#1C1C1C] border border-[#00E5FF] px-4 py-2 whitespace-nowrap"
                  style={{
                    boxShadow: "0 0 15px rgba(0, 229, 255, 0.3)",
                  }}
                >
                  <p
                    className="text-[#00E5FF] text-sm min-h-[20px]"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {displayedText}
                    <span className="inline-block w-1.5 h-4 bg-[#00E5FF] ml-1 animate-pulse"></span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Message Form - 优化输入框 */}
        <div
          className="mb-8 border border-[#00E5FF] p-1"
          style={{
            boxShadow: "0 0 15px rgba(0, 229, 255, 0.2)",
          }}
        >
          <Card className="bg-[#0D0D0D] border-none">
            <form onSubmit={handleSubmit} className="p-3">
              <Textarea
                placeholder={user ? "写下你的留言..." : "请先登录后留言"}
                value={newMessage}
                onChange={(e) => {
                  const text = e.target.value;
                  if (text.length <= 500) {
                    setNewMessage(text);
                  }
                }}
                disabled={!user || submitting}
                maxLength={500}
                className="w-full min-h-[120px] bg-transparent border-none focus:border-none focus:ring-1 focus:ring-[#00E5FF] text-[#E6E6E6] resize-none text-sm transition-all placeholder:text-[#707070] p-3"
                style={{
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                }}
              />
              <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2A]">
                {/* 字符计数 */}
                <span
                  className="text-xs text-[#707070]"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {newMessage.length}/500
                </span>

                <Button
                  type="submit"
                  disabled={!user || submitting || !newMessage.trim()}
                  className="bg-[#00E5FF] hover:bg-[#33EFFF] active:bg-[#00B8D9] text-[#0D0D0D] px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:scale-[1.05] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: "0 0 12px rgba(0, 229, 255, 0.5)" }}
                >
                  {submitting ? "发送中" : "发送"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
            <span className="ml-2 text-[#A6A6A6]">加载中...</span>
          </div>
        ) : messages.length > 0 ? (
          <>
            <div className="space-y-2 mb-6">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className="bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#00E5FF] transition-all duration-200"
                  style={{ boxShadow: "0 0 10px rgba(0, 229, 255, 0.1)" }}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* 头像 */}
                        <div
                          className="w-8 h-8 border border-[#00E5FF] overflow-hidden flex-shrink-0"
                          style={{
                            boxShadow: "0 0 8px rgba(0, 229, 255, 0.4)",
                          }}
                        >
                          <img
                            src={
                              message.user?.avatar ||
                              MEDIA.avatars[0]
                            }
                            alt={message.user?.nickname || "匿名用户"}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span
                              className="text-sm font-medium text-[#00FF9D] truncate"
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {message.user?.nickname || "匿名用户"}
                            </span>
                            <span
                              className="text-xs text-[#707070] whitespace-nowrap"
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {formatDateTime(message.createdAt)}
                            </span>
                          </div>
                          <p
                            className="text-sm text-[#E6E6E6] leading-relaxed mt-1.5"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {message.content}
                          </p>
                        </div>
                      </div>
                      {/* 删除按钮 - 自己的留言或管理员可见 */}
                      {user &&
                        (user.id === message.userId || isAdmin(user.role)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(message.id, message.userId)
                            }
                            className="text-[#FF3355] hover:text-[#FF3355] hover:bg-[#FF3355]/10 p-1.5 h-auto flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-6">
                <Button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="border border-[#00E5FF] text-[#00E5FF] hover:border-[#33EFFF] hover:text-[#33EFFF] bg-transparent px-3 py-1.5 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一页
                </Button>

                <div
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] text-sm"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    boxShadow: "0 0 10px rgba(0, 229, 255, 0.2)",
                  }}
                >
                  <span className="text-[#00E5FF] font-bold">
                    {currentPage}
                  </span>
                  <span className="text-[#707070]">/</span>
                  <span className="text-[#A6A6A6]">{totalPages}</span>
                </div>

                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="border border-[#00E5FF] text-[#00E5FF] hover:border-[#33EFFF] hover:text-[#33EFFF] bg-transparent px-3 py-1.5 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  下一页
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div
              className="w-20 h-20 mx-auto mb-4 border border-[#00E5FF]/30 flex items-center justify-center"
              style={{
                boxShadow: "0 0 20px rgba(0, 229, 255, 0.2)",
              }}
            >
              <MessageSquare className="w-10 h-10 text-[#00E5FF]/30" />
            </div>
            <p className="text-[#A6A6A6] mb-1 text-lg">还没有留言</p>
            <p className="text-[#707070] text-sm mb-6">
              {user ? "成为第一个留言的人吧！" : "登录后即可留言"}
            </p>
            {!user && (
              <Button
                className="border border-[#00E5FF] text-[#00E5FF] hover:border-[#33EFFF] hover:text-[#33EFFF] bg-transparent px-6 py-2 text-sm"
                onClick={() => navigate("/login")}
              >
                前往登录
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
