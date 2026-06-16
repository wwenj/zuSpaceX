import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { commentApi } from "@/api/comment";
import type { Comment, CommentType } from "@/api/types";
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
  fieldClass,
  formatDateTime,
  getFilterOptionClass,
  labelClass,
  listTagClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeadClass,
  textareaClass,
  filterSegmentClass,
} from "./shared";

type CommentFilters = {
  nickname: string;
  account: string;
  type: "" | CommentType;
};

type CommentFormState = {
  id: string;
  content: string;
  userId: string;
  type: CommentType;
  source: string;
};

const EMPTY_FILTERS: CommentFilters = {
  nickname: "",
  account: "",
  type: "",
};

const createEmptyForm = (): CommentFormState => ({
  id: "",
  content: "",
  userId: "",
  type: "website",
  source: "",
});

const mapCommentToForm = (comment: Comment): CommentFormState => ({
  id: comment.id ?? "",
  content: comment.content ?? "",
  userId: comment.userId ?? "",
  type: comment.type ?? "website",
  source:
    comment.source === undefined || comment.source === null
      ? ""
      : String(comment.source),
});

const typeLabelMap: Record<CommentType, string> = {
  article: "文章评论",
  website: "留言板",
};

const AdminComments = () => {
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<CommentFilters>(EMPTY_FILTERS);
  const [nicknameInput, setNicknameInput] = useState("");
  const [accountInput, setAccountInput] = useState("");
  const [typeInput, setTypeInput] = useState<CommentFilters["type"]>("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<CommentFormState>(createEmptyForm());

  const loadComments = useCallback(
    async (page: number, nextFilters: CommentFilters) => {
      try {
        setLoading(true);
        const response = await commentApi.list({
          page,
          pageSize: PAGE_SIZE,
          nickname: nextFilters.nickname || undefined,
          account: nextFilters.account || undefined,
          type: nextFilters.type || undefined,
        });

        setComments(response.list);
        setCurrentPage(response.page);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total);
      } catch (error) {
        console.error("加载评论列表失败:", error);
        toast({
          title: "加载失败",
          description: "评论列表加载失败，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadComments(1, EMPTY_FILTERS);
  }, [loadComments]);

  const handleSearch = async () => {
    const nextFilters = {
      nickname: nicknameInput.trim(),
      account: accountInput.trim().toUpperCase(),
      type: typeInput,
    };

    setFilters(nextFilters);
    await loadComments(1, nextFilters);
  };

  const handleReset = async () => {
    setNicknameInput("");
    setAccountInput("");
    setTypeInput("");
    setFilters(EMPTY_FILTERS);
    await loadComments(1, EMPTY_FILTERS);
  };

  const handleEdit = async (id: string) => {
    try {
      setEditingId(id);
      const comment = await commentApi.detail({ id });
      setForm(mapCommentToForm(comment));
      setEditorOpen(true);
    } catch (error) {
      console.error("加载评论详情失败:", error);
      toast({
        title: "加载失败",
        description: "评论详情加载失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setEditingId(null);
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.content.trim()) {
      toast({
        title: "评论内容不能为空",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await commentApi.update({
        id: form.id,
        content: form.content.trim(),
      });

      toast({
        title: "保存成功",
      });

      setEditorOpen(false);
      await loadComments(currentPage, filters);
    } catch (error) {
      console.error("保存评论失败:", error);
      toast({
        title: "保存失败",
        description: "评论保存失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (!window.confirm("确认删除这条评论吗？")) {
      return;
    }

    try {
      await commentApi.delete({ id: comment.id });
      toast({
        title: "删除成功",
      });

      const nextPage =
        comments.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await loadComments(nextPage, filters);
    } catch (error) {
      console.error("删除评论失败:", error);
      toast({
        title: "删除失败",
        description: "评论删除失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

  const renderSource = (comment: Comment) => {
    if (comment.type === "article" && comment.source) {
      return (
        <Link
          to={`/blog/${comment.source}`}
          className="text-xs text-sky-600 transition-colors hover:text-sky-700 hover:underline"
        >
          来源文章 #{comment.source}
        </Link>
      );
    }

    return (
      <span className="text-xs text-slate-400">来源留言板 #{comment.source}</span>
    );
  };

  return (
    <>
      <div className="space-y-4">
        <section className={panelClass}>
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1.1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="filter-nickname" className={labelClass}>
                用户昵称
              </Label>
              <Input
                id="filter-nickname"
                value={nicknameInput}
                onChange={(event) => setNicknameInput(event.target.value)}
                placeholder="输入用户昵称"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-account" className={labelClass}>
                用户账号
              </Label>
              <Input
                id="filter-account"
                value={accountInput}
                onChange={(event) => setAccountInput(event.target.value)}
                placeholder="输入用户账号"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>评论类型</Label>
              <div className={filterSegmentClass}>
                <button
                  type="button"
                  onClick={() => setTypeInput("")}
                  className={getFilterOptionClass(typeInput === "")}
                >
                  全部
                </button>
                <button
                  type="button"
                  onClick={() => setTypeInput("website")}
                  className={getFilterOptionClass(typeInput === "website")}
                >
                  留言板
                </button>
                <button
                  type="button"
                  onClick={() => setTypeInput("article")}
                  className={getFilterOptionClass(typeInput === "article")}
                >
                  文章
                </button>
              </div>
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
          ) : comments.length === 0 ? (
            <div className="px-6 py-20 text-center text-sm text-slate-500">
              暂无评论
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1520px] w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={tableHeadClass}>评论 ID</th>
                    <th className={tableHeadClass}>用户</th>
                    <th className={tableHeadClass}>类型</th>
                    <th className={tableHeadClass}>评论</th>
                    <th className={tableHeadClass}>最新时间</th>
                    <th className={tableHeadClass}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr
                      key={comment.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className={`${tableCellClass} text-sm text-slate-600`}>
                        <span className="inline-block max-w-[220px] break-all">
                          {comment.id}
                        </span>
                      </td>
                      <td className={tableCellClass}>
                        <div
                          title={comment.userId}
                          className="mx-auto flex max-w-[220px] items-center gap-3 text-left"
                        >
                          {comment.user?.avatar ? (
                            <img
                              src={comment.user.avatar}
                              alt={comment.user.nickname}
                              className="h-11 w-11 rounded-2xl border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-2xl border border-slate-200 bg-slate-50" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {comment.user?.nickname || "未知用户"}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              hover 查看用户 id
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={tableCellClass}>
                        <span className={listTagClass}>
                          {typeLabelMap[comment.type] || comment.type}
                        </span>
                      </td>
                      <td className={`${tableCellClass} min-w-[560px]`}>
                        <div className="mx-auto flex max-w-[620px] flex-col items-center text-center">
                          <p className="text-sm leading-7 text-slate-600">
                            {comment.content || "-"}
                          </p>
                          <div className="mt-2">{renderSource(comment)}</div>
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-sm text-slate-500`}>
                        {formatDateTime(comment.updatedAt)}
                      </td>
                      <td className={tableCellClass}>
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleEdit(comment.id)}
                            disabled={editingId === comment.id}
                            className={secondaryButtonClass}
                          >
                            {editingId === comment.id && (
                              <Loader2 className="animate-spin" />
                            )}
                            编辑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleDelete(comment)}
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
            <span className="text-sm text-slate-500">共 {total} 条评论</span>

            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadComments(currentPage - 1, filters)}
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
                onClick={() => void loadComments(currentPage + 1, filters)}
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
              编辑评论 #{form.id}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className={labelClass}>用户 ID</Label>
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                  {form.userId || "-"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>评论类型</Label>
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                  {typeLabelMap[form.type]}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className={labelClass}>来源</Label>
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                  {form.type === "article"
                    ? `文章 #${form.source || "-"}`
                    : `留言板 #${form.source || "-"}`}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="content" className={labelClass}>
                  评论内容
                </Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  placeholder="请输入评论内容"
                  className={`${textareaClass} min-h-[220px]`}
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
                保存修改
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminComments;
