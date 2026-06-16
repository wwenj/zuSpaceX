import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { projectApi } from "@/api/project";
import type { Project } from "@/api/types";
import { formatPageTitle } from "@/lib/siteProfile";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载项目数据
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectApi.list();
      setProjects(response.list);
    } catch (err) {
      console.error("加载项目列表失败:", err);
      setError("加载项目列表失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 设置页面 SEO
    document.title = formatPageTitle("开源项目");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "示例开发者的开源项目展示页，可用于陈列框架、工具库和应用作品。",
      );
    }

    loadProjects();
  }, []);

  const renderProjectActions = (project: Project) => {
    const hasGitUrl = Boolean(project.gitUrl);
    const hasDemoUrl = Boolean(project.demoUrl);
    const actionCount = Number(hasGitUrl) + Number(hasDemoUrl);
    const actionClass = actionCount === 1 ? "w-full" : "flex-1";

    if (actionCount === 0) {
      return (
        <div className="pt-4 border-t-2 border-border">
          <p className="text-xs text-text-tertiary text-center font-normal">
            暂无可访问链接
          </p>
        </div>
      );
    }

    return (
      <div className="flex gap-2 pt-4 border-t-2 border-border">
        {hasGitUrl && (
          <Button
            variant="outline"
            size="sm"
            className={actionClass}
            onClick={() => window.open(project.gitUrl, "_blank")}
          >
            <Github className="w-4 h-4" />
            Code
          </Button>
        )}
        {hasDemoUrl && (
          <Button
            variant="default"
            size="sm"
            className={actionClass}
            onClick={() => window.open(project.demoUrl, "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
            Demo
          </Button>
        )}
      </div>
    );
  };

  return (
    <main className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <h1 className="text-2xl md:text-4xl font-bold mb-4 text-primary text-pixel-shadow font-pixel">
            OPEN SOURCE
          </h1>
          <p className="text-lg text-text-secondary">
            探索创新，分享代码，构建未来
          </p>
        </header>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center text-text-secondary py-20">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-red-500/40 animate-pixel-bounce"></div>
            <p className="text-red-500 mb-6 font-normal text-lg">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="font-normal"
            >
              重新加载
            </Button>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-card border-2 border-border hover:border-primary transition-all shadow-pixel hover:shadow-pixel-lg group"
              >
                <div className="p-6 flex flex-col h-full">
                  {/* Cover Image */}
                  {project.cover && (
                    <div className="mb-4 rounded border-2 border-border overflow-hidden">
                      <img
                        src={project.cover}
                        alt={project.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    {project.stars > 0 && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Star className="w-3 h-3 fill-secondary" />
                        {project.stars}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-text-secondary text-sm mb-4 flex-grow font-normal leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[9px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {renderProjectActions(project)}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-primary/40 animate-pixel-bounce"></div>
            <p className="text-text-secondary mb-6 font-normal text-lg">
              暂无项目数据
            </p>
            <p className="text-text-tertiary text-sm font-normal">
              请联系管理员添加项目信息
            </p>
          </div>
        )}
        {/* Decorative Pixel Elements */}
        <div className="hidden md:block fixed bottom-10 right-10 w-12 h-12 border-2 border-accent/40 animate-pixel-blink"></div>
      </div>
    </main>
  );
}
