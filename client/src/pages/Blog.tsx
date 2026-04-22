import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pin,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { articleApi } from "@/api/article";
import type { Article } from "@/api/types";
import { MEDIA } from "@/lib/siteAssets";

const POSTS_PER_PAGE = 10;
const DEFAULT_COVER = MEDIA.common.cyberCover;

export default function Blog() {
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 加载文章列表
  const loadArticles = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        const response = await articleApi.list({
          page,
          pageSize: POSTS_PER_PAGE,
        });
        setPosts(response.list);
        setTotalPages(response.totalPages);
        setTotal(response.total);
        setCurrentPage(response.page);
      } catch (error) {
        console.error("加载文章失败:", error);
        toast({
          title: "加载失败",
          description: "无法加载文章列表，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // 分页处理函数
  const handlePrevPage = async () => {
    if (currentPage > 1) {
      await loadArticles(currentPage - 1);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      await loadArticles(currentPage + 1);
    }
  };

  useEffect(() => {
    // 设置页面 SEO
    document.title = "技术博客 - Cyber Space";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "分享前端开发、AI应用和开源项目的技术文章，记录代码学习与实践经验。",
      );
    }

    // 加载文章数据
    loadArticles();
  }, [loadArticles]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 根据字数计算阅读时间（假设每分钟阅读300字）
  const calculateReadTime = (contentCount: number) => {
    return Math.max(1, Math.ceil(contentCount / 300));
  };

  return (
    <main className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-primary text-glow-primary font-pixel">
            TECH BLOG
          </h1>
          <p className="text-lg text-text-secondary font-normal">
            记录技术思考，分享开发经验
          </p>
        </header>

        {/* Blog Grid */}
        {loading ? (
          <div className="text-center text-text-secondary py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="mt-4">加载中...</p>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="bg-card border-border hover:border-primary transition-all hover:glow-primary group cursor-pointer overflow-hidden relative h-40 md:h-40 font-sans"
                >
                  <div className="relative w-full h-full flex">
                    {/* 置顶标签 - 左上角固定 */}
                    {post.isTop && (
                      <span className="absolute top-0 left-0 z-20 inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#FF6B00] px-2.5 py-1 rounded-br-lg shadow-md">
                        <Pin className="w-3 h-3" />
                        置顶
                      </span>
                    )}
                    {/* Left Side - Cover Image */}
                    <div className="w-[30%] md:w-[50%] relative">
                      <img
                        src={post.image || DEFAULT_COVER}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (e.currentTarget.src !== DEFAULT_COVER) {
                            e.currentTarget.src = DEFAULT_COVER;
                          }
                        }}
                      />

                      {/* Image fade-out gradient overlay - starts at 60% (30%/50%) for smaller clear area */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent via-[60%] to-card"></div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 relative z-10">
                      {/* Content background with fade-in gradient - higher opacity for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-r from-card/70 via-card/85 via-30% to-card"></div>

                      {/* Content */}
                      <div className="relative z-10 px-2 md:px-6 py-2 md:py-3 h-full flex flex-col">
                        {/* Title - Fixed 2-line height */}
                        <div className="mb-2">
                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors font-sans line-clamp-2 leading-tight h-10 flex items-start">
                            {post.title}
                          </h3>
                        </div>

                        {/* Excerpt */}
                        <div className="mb-2">
                          <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed">
                            {post.briefContent}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {post.tag.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-primary font-medium leading-none"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.tag.length > 4 && (
                              <span className="text-xs text-text-tertiary leading-none">
                                +{post.tag.length - 4}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-text-tertiary mt-auto gap-1 md:gap-3">
                          <div className="flex items-center gap-1 md:gap-3 min-w-0 flex-1">
                            {/* Author Info */}
                            <span className="text-xs text-text-tertiary truncate">
                              @{post.author}
                            </span>

                            {/* Time Info */}
                            <span className="flex items-center gap-0.5 md:gap-1 flex-shrink-0 text-xs">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(post.createTime).toLocaleDateString(
                                  "zh-CN",
                                  {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  },
                                )}
                              </span>
                            </span>
                            <span className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {calculateReadTime(post.contentCount)}m
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        </div>
                      </div>
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
                  className="border border-primary text-primary hover:border-primary/80 hover:text-primary/80 bg-transparent px-3 py-1.5 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一页
                </Button>

                <div className="flex items-center gap-2 px-4 py-1.5 bg-card border border-border text-sm font-mono">
                  <span className="text-primary font-bold">{currentPage}</span>
                  <span className="text-text-tertiary">/</span>
                  <span className="text-text-secondary">{totalPages}</span>
                </div>

                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="border border-primary text-primary hover:border-primary/80 hover:text-primary/80 bg-transparent px-3 py-1.5 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  下一页
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 border-2 border-primary/30 rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-secondary/30 rounded-sm -rotate-45"></div>
            </div>
            <p className="text-text-secondary mb-6">暂无博客文章</p>
            <p className="text-text-tertiary text-sm">
              需要创建 blog_posts 表来存储文章数据
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
