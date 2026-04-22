import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { userApi } from "@/api/user";
import type { CreateUserParams, User } from "@/api/types";
import { AVATARS } from "@/lib/avatars";
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

type UserFilters = {
  id: string;
  account: string;
  nickname: string;
  role?: number;
};

type UserFormState = {
  id: string;
  account: string;
  password: string;
  nickname: string;
  intro: string;
  avatar: string;
  gameScore: string;
  role: number;
};

const DEFAULT_AVATAR = AVATARS[0] ?? "";
const EMPTY_FILTERS: UserFilters = {
  id: "",
  account: "",
  nickname: "",
};

const createEmptyForm = (): UserFormState => ({
  id: "",
  account: "",
  password: "",
  nickname: "",
  intro: "",
  avatar: DEFAULT_AVATAR,
  gameScore: "0",
  role: 0,
});

const mapUserToForm = (user: User): UserFormState => ({
  id: user.id ?? "",
  account: user.account ?? "",
  password: "",
  nickname: user.nickname ?? "",
  intro: user.intro ?? "",
  avatar: user.avatar || DEFAULT_AVATAR,
  gameScore: String(user.gameScore ?? 0),
  role: Number(user.role ?? 0),
});

const buildCreatePayload = (form: UserFormState): CreateUserParams => {
  const nickname = form.nickname.trim();

  return {
    account: form.account.trim().toUpperCase(),
    password: form.password.trim(),
    nickname: nickname || undefined,
    intro: form.intro.trim(),
    avatar: form.avatar,
    gameScore: Math.max(0, Number.parseInt(form.gameScore || "0", 10) || 0),
    role: form.role,
  };
};

const AdminUsers = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<UserFilters>(EMPTY_FILTERS);
  const [idInput, setIdInput] = useState("");
  const [accountInput, setAccountInput] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [roleInput, setRoleInput] = useState<number | undefined>(undefined);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<UserFormState>(createEmptyForm());

  const loadUsers = useCallback(
    async (page: number, nextFilters: UserFilters) => {
      try {
        setLoading(true);
        const response = await userApi.list({
          page,
          pageSize: PAGE_SIZE,
          id: nextFilters.id || undefined,
          account: nextFilters.account || undefined,
          nickname: nextFilters.nickname || undefined,
          role: nextFilters.role,
        });

        setUsers(response.list);
        setCurrentPage(response.page);
        setTotalPages(response.totalPages || 1);
        setTotal(response.total);
      } catch (error) {
        console.error("加载用户列表失败:", error);
        toast({
          title: "加载失败",
          description: "用户列表加载失败，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadUsers(1, EMPTY_FILTERS);
  }, [loadUsers]);

  const updateForm = (field: keyof UserFormState, value: string | number) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openCreateEditor = () => {
    setEditorMode("create");
    setForm(createEmptyForm());
    setEditorOpen(true);
  };

  const handleEdit = async (id: string) => {
    try {
      setEditingId(id);
      const user = await userApi.detail({ id });
      setEditorMode("edit");
      setForm(mapUserToForm(user));
      setEditorOpen(true);
    } catch (error) {
      console.error("加载用户详情失败:", error);
      toast({
        title: "加载失败",
        description: "用户详情加载失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setEditingId(null);
    }
  };

  const handleSearch = async () => {
    const nextFilters: UserFilters = {
      id: idInput.trim(),
      account: accountInput.trim().toUpperCase(),
      nickname: nicknameInput.trim(),
      role: roleInput,
    };

    setFilters(nextFilters);
    await loadUsers(1, nextFilters);
  };

  const handleReset = async () => {
    setIdInput("");
    setAccountInput("");
    setNicknameInput("");
    setRoleInput(undefined);
    setFilters(EMPTY_FILTERS);
    await loadUsers(1, EMPTY_FILTERS);
  };

  const validateForm = () => {
    if (editorMode === "create") {
      if (!/^[A-Z0-9]{8}$/.test(form.account.trim().toUpperCase())) {
        toast({
          title: "账号格式错误",
          description: "账号必须是 8 位字母或数字",
          variant: "destructive",
        });
        return false;
      }

      const passwordLength = form.password.trim().length;
      if (passwordLength < 8 || passwordLength > 32) {
        toast({
          title: "密码格式错误",
          description: "密码长度必须在 8 到 32 位之间",
          variant: "destructive",
        });
        return false;
      }
    }

    const nickname = form.nickname.trim();
    if (editorMode === "edit" && !nickname) {
      toast({
        title: "昵称不能为空",
        variant: "destructive",
      });
      return false;
    }

    if (nickname && nickname.length > 8) {
      toast({
        title: "昵称过长",
        description: "昵称最多 8 个字符",
        variant: "destructive",
      });
      return false;
    }

    if (!form.avatar) {
      toast({
        title: "请选择头像",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      if (editorMode === "create") {
        await userApi.create(buildCreatePayload(form));
      } else {
        await userApi.update({
          id: form.id,
          nickname: form.nickname.trim(),
          intro: form.intro.trim(),
          avatar: form.avatar,
          gameScore: Math.max(
            0,
            Number.parseInt(form.gameScore || "0", 10) || 0,
          ),
          role: form.role,
        });
      }

      toast({
        title: editorMode === "create" ? "创建成功" : "保存成功",
      });

      setEditorOpen(false);
      await loadUsers(editorMode === "create" ? 1 : currentPage, filters);
    } catch (error) {
      console.error("保存用户失败:", error);
      toast({
        title: "保存失败",
        description: "用户保存失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`确认删除用户「${user.nickname}」吗？`)) {
      return;
    }

    try {
      await userApi.delete({ id: user.id });
      toast({
        title: "删除成功",
      });

      const nextPage =
        users.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await loadUsers(nextPage, filters);
    } catch (error) {
      console.error("删除用户失败:", error);
      toast({
        title: "删除失败",
        description: "用户删除失败，请稍后重试",
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
            新建用户
          </Button>
        </div>

        <section className={`${panelClass} space-y-4`}>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_1.1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="filter-id" className={labelClass}>
                用户 ID
              </Label>
              <Input
                id="filter-id"
                value={idInput}
                onChange={(event) => setIdInput(event.target.value)}
                placeholder="输入用户 ID"
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
              <Label htmlFor="filter-nickname" className={labelClass}>
                用户名
              </Label>
              <Input
                id="filter-nickname"
                value={nicknameInput}
                onChange={(event) => setNicknameInput(event.target.value)}
                placeholder="输入用户名"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <Label className={labelClass}>角色</Label>
              <div className={filterSegmentClass}>
                <button
                  type="button"
                  onClick={() => setRoleInput(undefined)}
                  className={getFilterOptionClass(roleInput === undefined)}
                >
                  全部
                </button>
                <button
                  type="button"
                  onClick={() => setRoleInput(0)}
                  className={getFilterOptionClass(roleInput === 0)}
                >
                  用户
                </button>
                <button
                  type="button"
                  onClick={() => setRoleInput(1)}
                  className={getFilterOptionClass(roleInput === 1)}
                >
                  管理员
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

          <div className="flex flex-wrap gap-2">
            <span className={listTagClass}>用户总数 {total}</span>
            <span className={listTagClass}>账号固定 8 位字母或数字</span>
            <span className={listTagClass}>编辑页不支持改密码</span>
          </div>
        </section>

        <section className={`${panelClass} overflow-hidden p-0`}>
          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-20 text-slate-500">
              <Loader2 className="animate-spin text-slate-700" />
              列表加载中...
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-20 text-center text-sm text-slate-500">
              暂无用户
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={tableHeadClass}>ID</th>
                    <th className={tableHeadClass}>账号</th>
                    <th className={tableHeadClass}>用户</th>
                    <th className={tableHeadClass}>积分</th>
                    <th className={tableHeadClass}>角色</th>
                    <th className={tableHeadClass}>更新时间</th>
                    <th className={tableHeadClass}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className={`${tableCellClass} text-sm text-slate-600`}>
                        <span className="inline-block max-w-[220px] break-all">
                          {user.id}
                        </span>
                      </td>
                      <td className={`${tableCellClass} text-sm font-medium text-slate-700`}>
                        {user.account}
                      </td>
                      <td className={tableCellClass}>
                        <div className="mx-auto flex max-w-[320px] items-center gap-3 text-left">
                          <img
                            src={user.avatar}
                            alt={user.nickname}
                            className="h-11 w-11 rounded-2xl border border-slate-200 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {user.nickname || "匿名"}
                            </p>
                            <p className="truncate text-sm text-slate-500">
                              {user.intro || "暂无简介"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-sm text-slate-600`}>
                        {user.gameScore ?? 0}
                      </td>
                      <td className={tableCellClass}>
                        <span
                          className={
                            user.role === 1
                              ? "text-sm font-semibold text-amber-600"
                              : "text-sm font-semibold text-slate-500"
                          }
                        >
                          {user.role === 1 ? "管理员" : "普通用户"}
                        </span>
                      </td>
                      <td className={`${tableCellClass} text-sm text-slate-500`}>
                        {formatDateTime(user.updatedAt)}
                      </td>
                      <td className={tableCellClass}>
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleEdit(user.id)}
                            disabled={editingId === user.id}
                            className={secondaryButtonClass}
                          >
                            {editingId === user.id && (
                              <Loader2 className="animate-spin" />
                            )}
                            编辑
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleDelete(user)}
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
            <span className="text-sm text-slate-500">共 {total} 个用户</span>

            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadUsers(currentPage - 1, filters)}
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
                onClick={() => void loadUsers(currentPage + 1, filters)}
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
              {editorMode === "create" ? "新建用户" : `编辑用户 ${form.account}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account" className={labelClass}>
                  登录账号
                </Label>
                <Input
                  id="account"
                  value={form.account}
                  onChange={(event) =>
                    updateForm("account", event.target.value.toUpperCase())
                  }
                  disabled={editorMode === "edit"}
                  placeholder="请输入 8 位账号"
                  className={`${fieldClass} ${
                    editorMode === "edit" ? "bg-slate-50 text-slate-500" : ""
                  }`}
                />
              </div>

              {editorMode === "create" ? (
                <div className="space-y-2">
                  <Label htmlFor="password" className={labelClass}>
                    登录密码
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateForm("password", event.target.value)
                    }
                    placeholder="请输入 8 到 32 位密码"
                    className={fieldClass}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className={labelClass}>登录密码</Label>
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                    当前接口不支持后台改密码
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nickname" className={labelClass}>
                  昵称
                </Label>
                <Input
                  id="nickname"
                  value={form.nickname}
                  onChange={(event) =>
                    updateForm("nickname", event.target.value)
                  }
                  placeholder="请输入用户昵称"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameScore" className={labelClass}>
                  游戏积分
                </Label>
                <Input
                  id="gameScore"
                  type="number"
                  min="0"
                  value={form.gameScore}
                  onChange={(event) =>
                    updateForm("gameScore", event.target.value)
                  }
                  placeholder="请输入游戏积分"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="intro" className={labelClass}>
                  简介
                </Label>
                <Textarea
                  id="intro"
                  value={form.intro}
                  onChange={(event) => updateForm("intro", event.target.value)}
                  placeholder="请输入用户简介"
                  className={textareaClass}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className={labelClass}>角色</Label>
                <div className={filterSegmentClass}>
                  <button
                    type="button"
                    onClick={() => updateForm("role", 0)}
                    className={getFilterOptionClass(form.role === 0)}
                  >
                    普通用户
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm("role", 1)}
                    className={getFilterOptionClass(form.role === 1)}
                  >
                    管理员
                  </button>
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className={labelClass}>头像</Label>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {AVATARS.map((avatar, index) => {
                    const selected = avatar === form.avatar;

                    return (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => updateForm("avatar", avatar)}
                        className={`overflow-hidden rounded-2xl border p-1 transition-colors ${
                          selected
                            ? "border-slate-900 bg-slate-100"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <img
                          src={avatar}
                          alt={`头像 ${index + 1}`}
                          className="h-16 w-full rounded-xl object-cover"
                        />
                      </button>
                    );
                  })}
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
                {editorMode === "create" ? "创建用户" : "保存修改"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsers;
