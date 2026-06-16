import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pin,
  EyeOff,
} from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useToast } from "@/hooks/use-toast";
import { getUserInfo, isAdmin, type UserInfo } from "@/lib/auth";
import { articleApi } from "@/api/article";
import { commentApi } from "@/api/comment";
import type { Article, Comment } from "@/api/types";

type ArticleState = "missing" | "hidden" | null;

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<Article | null>(null);
  const [articleState, setArticleState] = useState<ArticleState>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  // 评论分页状态
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);

  const { toast } = useToast();
  const COMMENTS_PER_PAGE = 10;

  const resetCommentsState = () => {
    setComments([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalComments(0);
  };

  const renderArticleState = ({
    icon,
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <main className="min-h-screen px-4 pt-24 pb-20 md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-11rem)] max-w-2xl items-center justify-center">
        <Card className="relative w-full overflow-hidden border border-[#2A2A3A] bg-[#0F172A]/80 p-8 text-center backdrop-blur-sm md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.16),transparent_58%)]" />
          <div className="relative">
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF]"
              style={{ boxShadow: "0 0 28px rgba(0, 229, 255, 0.18)" }}
            >
              {icon}
            </div>
            <h1 className="mb-3 text-3xl font-bold text-[#E6F7FF] md:text-4xl">
              {title}
            </h1>
            <p className="mx-auto mb-8 max-w-lg text-sm leading-7 text-[#94A3B8] md:text-base">
              {description}
            </p>
            <Button
              onClick={() => navigate("/blog")}
              className="border border-[#00E5FF] bg-transparent text-[#00E5FF] hover:border-[#33EFFF] hover:text-[#33EFFF]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回博客列表
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );

  // 获取评论列表
  const fetchComments = async (articleId: string, page: number = 1) => {
    try {
      setCommentsLoading(true);
      const response = await commentApi.list({
        type: "article",
        source: parseInt(articleId),
        page,
        pageSize: COMMENTS_PER_PAGE,
      });
      setComments(response.list);
      setTotalPages(response.totalPages);
      setTotalComments(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      console.error("获取评论失败:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // 评论分页处理函数
  const handleCommentsPrevPage = async () => {
    if (currentPage > 1 && id) {
      await fetchComments(id, currentPage - 1);
    }
  };

  const handleCommentsNextPage = async () => {
    if (currentPage < totalPages && id) {
      await fetchComments(id, currentPage + 1);
    }
  };

  useEffect(() => {
    // 获取当前用户
    const loadUser = async () => {
      const userInfo = await getUserInfo();
      setUser(userInfo);
    };
    loadUser();

    // 监听用户信息变化
    const handleUserChange = async () => {
      const userInfo = await getUserInfo();
      setUser(userInfo);
    };
    window.addEventListener("user-info-changed", handleUserChange);

    // 获取博客详情
    const fetchBlogDetail = async () => {
      if (!id) {
        setPost(null);
        setArticleState("missing");
        resetCommentsState();
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setArticleState(null);
        const response = await articleApi.detail({ id });

        if (!response) {
          setPost(null);
          setArticleState("missing");
          resetCommentsState();
          return;
        }

        if (response.isHidden) {
          setPost(null);
          setArticleState("hidden");
          resetCommentsState();
          return;
        }

        setPost(response);
        setArticleState(null);
        await fetchComments(id, 1);
      } catch (error) {
        console.error("获取博客详情失败:", error);
        setPost(null);
        setArticleState("missing");
        resetCommentsState();
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();

    return () => {
      window.removeEventListener("user-info-changed", handleUserChange);
    };
  }, [id]);

  useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');

    if (post) {
      document.title = `${post.title} - 技术博客`;
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          post.briefContent || post.title,
        );
      }
      return;
    }

    if (articleState === "hidden") {
      document.title = "文章暂时下线 - 技术博客";
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          "该文章已被暂时下线，当前不可查看。",
        );
      }
      return;
    }

    if (articleState === "missing") {
      document.title = "文章未找到 - 技术博客";
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          "你访问的文章不存在，或暂时无法加载。",
        );
      }
      return;
    }

    document.title = "技术博客";
    if (metaDescription) {
      metaDescription.setAttribute("content", "技术博客");
    }
  }, [articleState, post]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录后才能评论",
        variant: "destructive",
      });
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "评论不能为空",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    setSubmitting(true);

    try {
      await commentApi.create({
        content: newComment.trim(),
        type: "article",
        source: parseInt(id),
      });

      toast({
        title: "评论成功",
        description: "感谢你的评论！",
      });

      setNewComment("");
      // 重新获取评论列表，回到第一页
      await fetchComments(id, 1);
    } catch (error) {
      console.error("评论失败:", error);
      toast({
        title: "评论失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (
    commentId: string,
    commentUserId: string,
  ) => {
    if (!user) {
      toast({
        title: "请先登录",
        variant: "destructive",
      });
      return;
    }

    if (user.id !== commentUserId && !isAdmin(user.role)) {
      toast({
        title: "无法删除",
        description: "只能删除自己的评论，管理员可删除全部评论",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    try {
      await commentApi.delete({ id: commentId });

      toast({
        title: "删除成功",
        description: "评论已删除",
      });

      // 重新获取评论列表，保持当前页
      await fetchComments(id, currentPage);
    } catch (error) {
      console.error("删除评论失败:", error);
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin"
            style={{
              boxShadow: "0 0 12px rgba(0, 229, 255, 0.6)",
            }}
          ></div>
          <p className="mt-4 text-[#A6A6A6]">加载中...</p>
        </div>
      </main>
    );
  }

  if (articleState === "hidden") {
    return renderArticleState({
      icon: <EyeOff className="h-10 w-10" />,
      title: "文章暂时下线",
      description:
        "这篇文章已被暂时下线，目前不可查看。你可以先返回博客列表查看其他内容。",
    });
  }

  if (!post) {
    return renderArticleState({
      icon: <AlertTriangle className="h-10 w-10" />,
      title: "内容没找到",
      description:
        "文章可能不存在，或者刚才加载失败了。你可以返回博客列表继续浏览其他文章。",
    });
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <article className="relative max-w-5xl mx-auto px-4 md:px-6">
        {/* 返回按钮 */}
        <Button
          onClick={() => navigate("/blog")}
          className="mb-6 border border-[#00E5FF] text-[#00E5FF] hover:border-[#33EFFF] hover:text-[#33EFFF] bg-transparent px-4 py-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        {/* 文章标题 */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[#00E5FF] leading-tight">
          {post.title}
        </h1>

        {/* 文章元信息（作者、时间、标签、阅读时长）- 紧凑排列 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm pb-4 border-b border-[#2A2A2A]">
          <span className="flex items-center gap-1.5 text-[#A6A6A6]">
            <User className="w-3.5 h-3.5" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5 text-[#A6A6A6]">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(post.createTime)}
          </span>
          <span className="flex items-center gap-1.5 text-[#A6A6A6]">
            <Clock className="w-3.5 h-3.5" />
            {Math.ceil((post.contentCount || 0) / 200)} 分钟
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {post.tag.map((tag) => (
              <Badge
                key={tag}
                className="bg-[#1C1C1C] text-[#00FF9D] border border-[#00E5FF]/20 px-2 py-0.5 text-xs"
              >
                #{tag}
              </Badge>
            ))}
            {post.isTop && (
              <Badge className="inline-flex items-center gap-1 text-xs font-medium text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/30 px-2 py-0.5">
                <Pin className="w-3 h-3" />
                置顶
              </Badge>
            )}
          </div>
        </div>

        {/* 文章正文 */}
        <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-[#2A2A3A] rounded-lg p-6 md:p-8">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* 评论区域 */}
        <div className="mt-12 pt-8 border-t border-[#2A2A2A]">
          <h2 className="text-2xl font-bold text-[#00E5FF] mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            评论 ({totalComments})
          </h2>

          {/* 评论输入框 - 紧凑低调设计 */}
          <div className="mb-6 border border-[#2A2A2A]">
            <form onSubmit={handleCommentSubmit} className="bg-[#0D0D0D] p-2">
              <Textarea
                placeholder={user ? "写下你的评论..." : "请先登录后评论"}
                value={newComment}
                onChange={(e) => {
                  const text = e.target.value;
                  if (text.length <= 300) {
                    setNewComment(text);
                  }
                }}
                disabled={!user || submitting}
                maxLength={300}
                className="w-full min-h-[60px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#E6E6E6] resize-none text-sm placeholder:text-[#707070] p-2"
                style={{
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxShadow: "none",
                }}
              />
              <div className="flex items-center justify-between pt-1.5 border-t border-[#2A2A2A]">
                <span className="text-xs text-[#707070]">
                  {newComment.length}/300
                </span>
                <Button
                  type="submit"
                  disabled={!user || submitting || !newComment.trim()}
                  className="bg-[#1C1C1C] hover:bg-[#2A2A2A] text-[#00E5FF] border border-[#2A2A2A] hover:border-[#00E5FF] px-3 py-1 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "发送中" : "发送"}
                </Button>
              </div>
            </form>
          </div>

          {/* 评论列表 */}
          {commentsLoading ? (
            <div className="text-center py-10">
              <div
                className="inline-block w-6 h-6 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin"
                style={{
                  boxShadow: "0 0 8px rgba(0, 229, 255, 0.4)",
                }}
              ></div>
              <p className="mt-2 text-[#A6A6A6] text-sm">加载评论中...</p>
            </div>
          ) : comments.length > 0 ? (
            <>
              <div className="space-y-2">
                {comments.map((comment) => (
                  <Card
                    key={comment.id}
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
                                comment.user?.avatar || "/default-avatar.png"
                              }
                              alt={comment.user?.nickname || "用户"}
                              className="w-full h-full object-cover"
                              style={{ imageRendering: "pixelated" }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-medium text-[#00FF9D] truncate">
                                {comment.user?.nickname || "匿名用户"}
                              </span>
                              <span className="text-xs text-[#707070] whitespace-nowrap">
                                {formatDateTime(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-[#E6E6E6] leading-relaxed mt-1.5">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                        {/* 删除按钮 */}
                        {user &&
                          (user.id === comment.userId ||
                            isAdmin(user.role)) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteComment(comment.id, comment.userId)
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

              {/* 评论分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-6">
                  <Button
                    onClick={handleCommentsPrevPage}
                    disabled={currentPage === 1 || commentsLoading}
                    className="border border-[#00E5FF] text-[#00E5FF] hover:border-[#33EFFF] hover:text-[#33EFFF] bg-transparent px-3 py-1.5 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    上一页
                  </Button>

                  <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] text-sm font-mono">
                    <span className="text-[#00E5FF] font-bold">
                      {currentPage}
                    </span>
                    <span className="text-[#707070]">/</span>
                    <span className="text-[#A6A6A6]">{totalPages}</span>
                  </div>

                  <Button
                    onClick={handleCommentsNextPage}
                    disabled={currentPage === totalPages || commentsLoading}
                    className="border border-[#00E5FF] text-[#00E5FF] hover:border-[#33EFFF] hover:text-[#33EFFF] bg-transparent px-3 py-1.5 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <div
                className="w-16 h-16 mx-auto mb-4 border border-[#00E5FF]/30 flex items-center justify-center"
                style={{
                  boxShadow: "0 0 15px rgba(0, 229, 255, 0.2)",
                }}
              >
                <MessageSquare className="w-8 h-8 text-[#00E5FF]/30" />
              </div>
              <p className="text-[#A6A6A6] mb-1">还没有评论</p>
              <p className="text-[#707070] text-sm">
                {user ? "成为第一个评论的人吧！" : "登录后即可评论"}
              </p>
            </div>
          )}
        </div>
      </article>

    </main>
  );
}
