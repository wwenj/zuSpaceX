import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { articleApi } from "@/api/article";
import type { Article, CreateArticleParams } from "@/api/types";
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

const PAGE_SIZE = 10;
const panelClass =
  "rounded-[28px] border border-slate-200 bg-white p-6 shadow-none";
const labelClass = "text-sm font-medium text-slate-700";
const fieldClass =
  "h-11 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300 focus-visible:ring-offset-0";
const primaryButtonClass =
  "h-10 rounded-xl border-slate-900 bg-slate-900 px-4 font-sans text-sm font-medium normal-case tracking-normal text-white shadow-none hover:translate-x-0 hover:translate-y-0 hover:border-slate-900 hover:bg-slate-800 hover:text-white hover:shadow-none active:translate-x-0 active:translate-y-0";
const secondaryButtonClass =
  "h-10 rounded-xl border-slate-200 bg-white px-4 font-sans text-sm font-medium normal-case tracking-normal text-slate-700 shadow-none hover:translate-x-0 hover:translate-y-0 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-none active:translate-x-0 active:translate-y-0";
const dangerButtonClass =
  "h-10 rounded-xl border-rose-200 bg-rose-50 px-4 font-sans text-sm font-medium normal-case tracking-normal text-rose-600 shadow-none hover:translate-x-0 hover:translate-y-0 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 hover:shadow-none active:translate-x-0 active:translate-y-0";
const listTagClass =
  "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium tracking-[0.01em] text-slate-700";
const editorTagClass =
  "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100";

type ArticleFilters = {
  id: string;
  title: string;
  tag: string;
};

type ArticleFormState = {
  id: string;
  title: string;
  author: string;
  tags: string[];
  image: string;
  briefContent: string;
  content: string;
  isTop: boolean;
  isHidden: boolean;
};

const EMPTY_FILTERS: ArticleFilters = {
  id: "",
  title: "",
  tag: "",
};

const createEmptyForm = (): ArticleFormState => ({
  id: "",
  title: "",
  author: "王建国",
  tags: [],
  image: "",
  briefContent: "",
  content: "",
  isTop: false,
  isHidden: false,
});

const normalizeTag = (value: string) => value.trim().replace(/\s+/g, " ");

const mapArticleToForm = (article: Article): ArticleFormState => ({
  id: String(article.id ?? ""),
  title: article.title ?? "",
  author: article.author ?? "",
  tags: article.tag ?? [],
  image: article.image ?? "",
  briefContent: article.briefContent ?? "",
  content: article.content ?? "",
  isTop: Boolean(article.isTop),
  isHidden: Boolean(article.isHidden),
});

const buildArticlePayload = (form: ArticleFormState): CreateArticleParams => {
  const content = form.content.trim();
  const briefContent = form.briefContent.trim() || content.slice(0, 120);

  return {
    title: form.title.trim(),
    author: form.author.trim(),
    tag: form.tags,
    image: form.image.trim(),
    briefContent,
    content,
    contentCount: content.length,
    isTop: form.isTop,
    isHidden: form.isHidden,
  };
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("zh-CN", {
    hour12: false,
  });

const AdminArticles = () => {
  const { toast } = useToast();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ArticleFilters>(EMPTY_FILTERS);
  const [idInput, setIdInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [tagFilterInput, setTagFilterInput] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<ArticleFormState>(createEmptyForm());
  const [tagDraft, setTagDraft] = useState("");

  const loadArticles = useCallback(
    async (page: number, nextFilters: ArticleFilters) => {
      try {
        setLoading(true);
        const response = await articleApi.list({
          page,
          pageSize: PAGE_SIZE,
          id: nextFilters.id || undefined,
          title: nextFilters.title || undefined,
          tag: nextFilters.tag || undefined,
          showAll: true,
        });

        setArticles(response.list);
        setCurrentPage(response.page);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total);
      } catch (error) {
        console.error("加载文章列表失败:", error);
        toast({
          title: "加载失败",
          description: "文章列表加载失败，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadArticles(1, EMPTY_FILTERS);
  }, [loadArticles]);

  const openCreateEditor = () => {
    setEditorMode("create");
    setForm(createEmptyForm());
    setTagDraft("");
    setEditorOpen(true);
  };

  const handleEdit = async (id: string) => {
    try {
      setEditingId(id);
      const article = await articleApi.detail({ id });
      setEditorMode("edit");
      setForm(mapArticleToForm(article));
      setTagDraft("");
      setEditorOpen(true);
    } catch (error) {
      console.error("加载文章详情失败:", error);
      toast({
        title: "加载失败",
        description: "文章详情加载失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setEditingId(null);
    }
  };

  const handleSearch = async () => {
    const nextFilters = {
      id: idInput.trim(),
      title: titleInput.trim(),
      tag: tagFilterInput.trim(),
    };

    if (nextFilters.id && !/^\d+$/.test(nextFilters.id)) {
      toast({
        title: "文章 ID 只能输入数字",
        variant: "destructive",
      });
      return;
    }

    setFilters(nextFilters);
    await loadArticles(1, nextFilters);
  };

  const handleReset = async () => {
    setIdInput("");
    setTitleInput("");
    setTagFilterInput("");
    setFilters(EMPTY_FILTERS);
    await loadArticles(1, EMPTY_FILTERS);
  };

  const updateForm = (
    field: keyof ArticleFormState,
    value: string | boolean,
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

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast({
        title: "标题不能为空",
        variant: "destructive",
      });
      return;
    }

    if (!form.content.trim()) {
      toast({
        title: "正文不能为空",
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

      const payload = buildArticlePayload(nextForm);

      if (editorMode === "create") {
        await articleApi.create(payload as CreateArticleParams);
      } else {
        await articleApi.update({
          id: form.id,
          ...(payload as CreateArticleParams),
        });
      }

      toast({
        title: editorMode === "create" ? "创建成功" : "保存成功",
      });

      setEditorOpen(false);
      await loadArticles(editorMode === "create" ? 1 : currentPage, filters);
    } catch (error) {
      console.error("保存文章失败:", error);
      toast({
        title: "保存失败",
        description: "文章保存失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article: Article) => {
    if (!window.confirm(`确认彻底删除文章「${article.title}」吗？`)) {
      return;
    }

    try {
      await articleApi.delete({ id: String(article.id) });
      toast({
        title: "删除成功",
      });

      const nextPage =
        articles.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      await loadArticles(nextPage, filters);
    } catch (error) {
      console.error("删除文章失败:", error);
      toast({
        title: "删除失败",
        description: "文章删除失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

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
            新建文章
          </Button>
        </div>

        <section className={panelClass}>
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.4fr_1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="filter-id" className={labelClass}>
                文章 ID
              </Label>
              <Input
                id="filter-id"
                value={idInput}
                onChange={(event) => setIdInput(event.target.value)}
                placeholder="输入文章 ID"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-title" className={labelClass}>
                文章标题
              </Label>
              <Input
                id="filter-title"
                value={titleInput}
                onChange={(event) => setTitleInput(event.target.value)}
                placeholder="输入文章标题"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-tag" className={labelClass}>
                标签
              </Label>
              <Input
                id="filter-tag"
                value={tagFilterInput}
                onChange={(event) => setTagFilterInput(event.target.value)}
                placeholder="输入标签"
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
          ) : articles.length === 0 ? (
            <div className="px-6 py-20 text-center text-sm text-slate-500">
              暂无文章
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border-b border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      ID
                    </th>
                    <th className="border-b border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      标题
                    </th>
                    <th className="border-b border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      内容
                    </th>
                    <th className="border-b border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      标签
                    </th>
                    <th className="border-b border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      置顶
                    </th>
                    <th className="border-b border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      可见
                    </th>
                    <th className="border-b border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      更新时间
                    </th>
                    <th className="border-b border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="border-b border-slate-200 px-6 py-5 text-center text-sm text-slate-600">
                        {article.id}
                      </td>
                      <td className="border-b border-slate-200 px-6 py-5 text-center">
                        <Link
                          to={`/blog/${article.id}`}
                          className="inline-block max-w-[320px] text-sm font-semibold leading-6 text-slate-900 transition-colors hover:text-sky-600 hover:underline"
                        >
                          {article.title || "-"}
                        </Link>
                      </td>
                      <td className="border-b border-slate-200 px-6 py-5 text-center">
                        <p className="mx-auto max-w-[320px] text-sm leading-6 text-slate-500 line-clamp-2">
                          {article.briefContent || "-"}
                        </p>
                      </td>
                      <td className="border-b border-slate-200 px-6 py-5 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {article.tag?.length ? (
                            article.tag.map((tag) => (
                              <span key={tag} className={listTagClass}>
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="border-b border-slate-200 px-6 py-5 text-center">
                        <span
                          className={
                            article.isTop
                              ? "text-sm font-semibold text-amber-600"
                              : "text-sm font-semibold text-slate-400"
                          }
                        >
                          {article.isTop ? "是" : "否"}
                        </span>
                      </td>
                      <td className="border-b border-slate-200 px-6 py-5 text-center">
                        <span
                          className={
                            article.isHidden
                              ? "text-sm font-semibold text-rose-500"
                              : "text-sm font-semibold text-emerald-600"
                          }
                        >
                          {article.isHidden ? "否" : "是"}
                        </span>
                      </td>
                      <td className="border-b border-slate-200 px-6 py-5 text-center text-sm text-slate-500">
                        {formatDateTime(article.updateTime)}
                      </td>
                      <td className="border-b border-slate-200 px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleEdit(String(article.id))}
                            disabled={editingId === String(article.id)}
                            className={secondaryButtonClass}
                          >
                            {editingId === String(article.id) && (
                              <Loader2 className="animate-spin" />
                            )}
                            编辑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleDelete(article)}
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
            <span className="text-sm text-slate-500">共 {total} 篇文章</span>

            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadArticles(currentPage - 1, filters)}
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
                onClick={() => void loadArticles(currentPage + 1, filters)}
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
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-0 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {editorMode === "create" ? "新建文章" : `编辑文章 #${form.id}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className={labelClass}>
                  标题
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="请输入文章标题"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author" className={labelClass}>
                  作者
                </Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(event) => updateForm("author", event.target.value)}
                  placeholder="请输入作者名称"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className={labelClass}>
                  封面图
                </Label>
                <Input
                  id="image"
                  value={form.image}
                  onChange={(event) => updateForm("image", event.target.value)}
                  placeholder="请输入封面图 URL"
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
                <Label htmlFor="briefContent" className={labelClass}>
                  简介
                </Label>
                <Textarea
                  id="briefContent"
                  value={form.briefContent}
                  onChange={(event) =>
                    updateForm("briefContent", event.target.value)
                  }
                  placeholder="可留空，保存时自动截取正文前 120 字"
                  className="min-h-[120px] rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300 focus-visible:ring-offset-0"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="content" className={labelClass}>
                  正文
                </Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(event) =>
                    updateForm("content", event.target.value)
                  }
                  placeholder="请输入文章正文"
                  className="min-h-[320px] rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className={labelClass}>置顶状态</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateForm("isTop", true)}
                    className={
                      form.isTop ? primaryButtonClass : secondaryButtonClass
                    }
                  >
                    置顶
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateForm("isTop", false)}
                    className={
                      !form.isTop ? primaryButtonClass : secondaryButtonClass
                    }
                  >
                    普通
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>显示状态</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateForm("isHidden", false)}
                    className={
                      !form.isHidden ? primaryButtonClass : secondaryButtonClass
                    }
                  >
                    可见
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateForm("isHidden", true)}
                    className={
                      form.isHidden ? primaryButtonClass : secondaryButtonClass
                    }
                  >
                    隐藏
                  </Button>
                </div>
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
                {editorMode === "create" ? "创建文章" : "保存修改"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminArticles;
