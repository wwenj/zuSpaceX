import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Github, Loader2, Plus } from "lucide-react";
import { projectApi } from "@/api/project";
import type { CreateProjectParams, Project } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  PAGE_SIZE,
  dangerButtonClass,
  dialogContentClass,
  editorTagClass,
  fieldClass,
  formatDateTime,
  labelClass,
  listTagClass,
  normalizeTag,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeadClass,
  textareaClass,
} from "./shared";

type ProjectFilters = {
  name: string;
  tag: string;
};

type ProjectFormState = {
  id: string;
  name: string;
  description: string;
  gitUrl: string;
  stars: string;
  cover: string;
  demoUrl: string;
  tags: string[];
};

const EMPTY_FILTERS: ProjectFilters = {
  name: "",
  tag: "",
};

const createEmptyForm = (): ProjectFormState => ({
  id: "",
  name: "",
  description: "",
  gitUrl: "",
  stars: "0",
  cover: "",
  demoUrl: "",
  tags: [],
});

const mapProjectToForm = (project: Project): ProjectFormState => ({
  id: String(project.id ?? ""),
  name: project.name ?? "",
  description: project.description ?? "",
  gitUrl: project.gitUrl ?? "",
  stars: String(project.stars ?? 0),
  cover: project.cover ?? "",
  demoUrl: project.demoUrl ?? "",
  tags: project.tags ?? [],
});

const buildProjectPayload = (
  form: ProjectFormState,
): CreateProjectParams => ({
  name: form.name.trim(),
  description: form.description.trim(),
  gitUrl: form.gitUrl.trim(),
  stars: Math.max(0, Number.parseInt(form.stars || "0", 10) || 0),
  cover: form.cover.trim(),
  demoUrl: form.demoUrl.trim(),
  tags: form.tags,
});

const AdminProjects = () => {
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ProjectFilters>(EMPTY_FILTERS);
  const [nameInput, setNameInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<ProjectFormState>(createEmptyForm());
  const [tagDraft, setTagDraft] = useState("");

  const loadProjects = useCallback(
    async (page: number, nextFilters: ProjectFilters) => {
      try {
        setLoading(true);
        const response = await projectApi.list({
          page,
          pageSize: PAGE_SIZE,
          name: nextFilters.name || undefined,
          tag: nextFilters.tag || undefined,
        });

        setProjects(response.list);
        setCurrentPage(response.page);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total);
      } catch (error) {
        console.error("加载项目列表失败:", error);
        toast({
          title: "加载失败",
          description: "项目列表加载失败，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadProjects(1, EMPTY_FILTERS);
  }, [loadProjects]);

  const updateForm = (
    field: keyof ProjectFormState,
    value: string | string[],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const appendTag = (value: string) => {
    const nextTag = normalizeTag(value);

    if (!nextTag) {
      setTagDraft("");
      return;
    }

    setForm((current) => {
      if (current.tags.includes(nextTag)) {
        return current;
      }

      return {
        ...current,
        tags: [...current.tags, nextTag],
      };
    });
    setTagDraft("");
  };

  const removeTag = (targetTag: string) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== targetTag),
    }));
  };

  const handleTagInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    appendTag(tagDraft);
  };

  const openCreateEditor = () => {
    setEditorMode("create");
    setForm(createEmptyForm());
    setTagDraft("");
    setEditorOpen(true);
  };

  const handleEdit = async (id: string) => {
    try {
      setEditingId(id);
      const project = await projectApi.detail({ id });
      setEditorMode("edit");
      setForm(mapProjectToForm(project));
      setTagDraft("");
      setEditorOpen(true);
    } catch (error) {
      console.error("加载项目详情失败:", error);
      toast({
        title: "加载失败",
        description: "项目详情加载失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setEditingId(null);
    }
  };

  const handleSearch = async () => {
    const nextFilters = {
      name: nameInput.trim(),
      tag: tagInput.trim(),
    };

    setFilters(nextFilters);
    await loadProjects(1, nextFilters);
  };

  const handleReset = async () => {
    setNameInput("");
    setTagInput("");
    setFilters(EMPTY_FILTERS);
    await loadProjects(1, EMPTY_FILTERS);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast({
        title: "项目名称不能为空",
        variant: "destructive",
      });
      return;
    }

    if (!form.gitUrl.trim() && !form.demoUrl.trim()) {
      toast({
        title: "链接不能为空",
        description: "仓库地址和演示地址至少填写一项",
        variant: "destructive",
      });
      return;
    }

    const pendingTag = normalizeTag(tagDraft);
    const nextTags =
      pendingTag && !form.tags.includes(pendingTag)
        ? [...form.tags, pendingTag]
        : form.tags;
    const nextForm = {
      ...form,
      tags: nextTags,
    };

    try {
      setSaving(true);
      if (nextTags !== form.tags) {
        setForm(nextForm);
      }
      setTagDraft("");

      const payload = buildProjectPayload(nextForm);

      if (editorMode === "create") {
        await projectApi.create(payload);
      } else {
        await projectApi.update({
          id: form.id,
          ...payload,
        });
      }

      toast({
        title: editorMode === "create" ? "创建成功" : "保存成功",
      });

      setEditorOpen(false);
      await loadProjects(editorMode === "create" ? 1 : currentPage, filters);
    } catch (error) {
      console.error("保存项目失败:", error);
      toast({
        title: "保存失败",
        description: "项目保存失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`确认删除项目「${project.name}」吗？`)) {
      return;
    }

    try {
      await projectApi.delete({ id: String(project.id) });
      toast({
        title: "删除成功",
      });

      const nextPage =
        projects.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await loadProjects(nextPage, filters);
    } catch (error) {
      console.error("删除项目失败:", error);
      toast({
        title: "删除失败",
        description: "项目删除失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

  const renderProjectLink = (
    url: string,
    icon: React.ReactNode,
    label: string,
  ) =>
    url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      >
        {icon}
        {label}
      </a>
    ) : (
      <span className="text-sm text-slate-400">-</span>
    );

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={openCreateEditor}
            className={primaryButtonClass}
          >
            <Plus />
            新建项目
          </Button>
        </div>

        <section className={panelClass}>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="filter-name" className={labelClass}>
                项目名称
              </Label>
              <Input
                id="filter-name"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="输入项目名称查询"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-tag" className={labelClass}>
                标签
              </Label>
              <Input
                id="filter-tag"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="输入标签查询"
                className={fieldClass}
              />
            </div>

            <div className="flex self-end items-center gap-3 sm:justify-end">
              <Button
                type="button"
                onClick={() => void handleSearch()}
                className={primaryButtonClass}
              >
                查询
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleReset()}
                className={secondaryButtonClass}
              >
                重置
              </Button>
            </div>
          </div>
        </section>

        <section className={`${panelClass} overflow-hidden p-0`}>
          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-20 text-slate-500">
              <Loader2 className="animate-spin text-slate-700" />
              列表加载中...
            </div>
          ) : projects.length === 0 ? (
            <div className="px-6 py-20 text-center text-sm text-slate-500">
              暂无项目
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={tableHeadClass}>ID</th>
                    <th className={tableHeadClass}>项目名</th>
                    <th className={tableHeadClass}>仓库地址</th>
                    <th className={tableHeadClass}>演示地址</th>
                    <th className={tableHeadClass}>描述</th>
                    <th className={tableHeadClass}>标签</th>
                    <th className={tableHeadClass}>Star</th>
                    <th className={tableHeadClass}>更新时间</th>
                    <th className={tableHeadClass}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className={`${tableCellClass} text-sm text-slate-600`}>
                        {project.id}
                      </td>
                      <td className={`${tableCellClass} text-sm font-semibold text-slate-900`}>
                        <span className="inline-block max-w-[220px] break-words">
                          {project.name || "-"}
                        </span>
                      </td>
                      <td className={tableCellClass}>
                        {renderProjectLink(
                          project.gitUrl,
                          <Github className="h-3.5 w-3.5" />,
                          "仓库",
                        )}
                      </td>
                      <td className={tableCellClass}>
                        {renderProjectLink(
                          project.demoUrl,
                          <ExternalLink className="h-3.5 w-3.5" />,
                          "演示",
                        )}
                      </td>
                      <td className={tableCellClass}>
                        <p className="mx-auto max-w-[320px] text-sm leading-6 text-slate-500 line-clamp-3">
                          {project.description || "-"}
                        </p>
                      </td>
                      <td className={tableCellClass}>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {project.tags?.length ? (
                            project.tags.map((tag) => (
                              <span key={tag} className={listTagClass}>
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-sm text-slate-600`}>
                        {project.stars ?? 0}
                      </td>
                      <td className={`${tableCellClass} text-sm text-slate-500`}>
                        {formatDateTime(project.updateTime)}
                      </td>
                      <td className={tableCellClass}>
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleEdit(String(project.id))}
                            disabled={editingId === String(project.id)}
                            className={secondaryButtonClass}
                          >
                            {editingId === String(project.id) && (
                              <Loader2 className="animate-spin" />
                            )}
                            编辑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleDelete(project)}
                            className={dangerButtonClass}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-500">共 {total} 个项目</span>

            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadProjects(currentPage - 1, filters)}
                disabled={currentPage <= 1 || loading}
                className={secondaryButtonClass}
              >
                上一页
              </Button>
              <span className="min-w-20 text-center text-sm text-slate-500">
                {currentPage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadProjects(currentPage + 1, filters)}
                disabled={currentPage >= totalPages || loading}
                className={secondaryButtonClass}
              >
                下一页
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className={dialogContentClass}>
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {editorMode === "create" ? "新建项目" : `编辑项目 #${form.id}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className={labelClass}>
                  项目名称
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="请输入项目名称"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gitUrl" className={labelClass}>
                  仓库地址
                </Label>
                <Input
                  id="gitUrl"
                  value={form.gitUrl}
                  onChange={(event) => updateForm("gitUrl", event.target.value)}
                  placeholder="仓库地址和演示地址至少填写一项"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoUrl" className={labelClass}>
                  演示地址
                </Label>
                <Input
                  id="demoUrl"
                  value={form.demoUrl}
                  onChange={(event) =>
                    updateForm("demoUrl", event.target.value)
                  }
                  placeholder="仓库地址和演示地址至少填写一项"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover" className={labelClass}>
                  封面图
                </Label>
                <Input
                  id="cover"
                  value={form.cover}
                  onChange={(event) => updateForm("cover", event.target.value)}
                  placeholder="请输入封面图 URL"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stars" className={labelClass}>
                  Star 数
                </Label>
                <Input
                  id="stars"
                  type="number"
                  min="0"
                  value={form.stars}
                  onChange={(event) => updateForm("stars", event.target.value)}
                  placeholder="请输入 Star 数"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="tag-input" className={labelClass}>
                  标签
                </Label>
                <Input
                  id="tag-input"
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={() => appendTag(tagDraft)}
                  placeholder="输入标签后回车确认"
                  className={fieldClass}
                />
                <div className="flex min-h-10 flex-wrap gap-2">
                  {form.tags.length ? (
                    form.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className={editorTagClass}
                      >
                        {tag}
                        <span className="ml-2 text-slate-400">×</span>
                      </button>
                    ))
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-400">
                      暂无标签
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className={labelClass}>
                  项目描述
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="请输入项目描述"
                  className={textareaClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditorOpen(false)}
                disabled={saving}
                className={secondaryButtonClass}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className={primaryButtonClass}
              >
                {saving && <Loader2 className="animate-spin" />}
                {editorMode === "create" ? "创建项目" : "保存修改"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminProjects;
