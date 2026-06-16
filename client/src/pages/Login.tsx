import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Pencil, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  getUserInfo,
  login,
  normalizeAccount,
  register,
  validateAccount,
  validateNickname,
} from "@/lib/auth";
import { AVATARS } from "@/lib/avatars";
import { formatPageTitle, SITE_BRAND } from "@/lib/siteProfile";
import { MEDIA } from "@/lib/siteAssets";

type PageMode = "login" | "register";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 32;
const FIELD_INPUT_CLASSNAME =
  "h-12 border-2 border-primary/40 bg-card/85 px-4 text-text-primary placeholder:text-text-tertiary/70 focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0";
const FIELD_HINT_CLASSNAME =
  "border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] text-text-tertiary";
const FORM_PANEL_CLASSNAME =
  "relative overflow-hidden border border-primary/15 bg-surface-primary/75 p-5 md:p-6";
const LOGIN_GUIDE_TEXT = "输入账号和密码，继续进入当前空间。";
const REGISTER_GUIDE_TEXT = "先选头像，再填写信息完成注册。";
const GUIDE_AVATAR_IMAGES = {
  closed: MEDIA.common.avatarClosed,
  open: MEDIA.common.avatarOpen,
};

function formatAccountInput(value: string) {
  return normalizeAccount(value)
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from = useMemo(() => {
    const nextPath =
      typeof location.state === "object" &&
      location.state &&
      "from" in location.state
        ? String(location.state.from || "/")
        : "/";

    return nextPath === "/login" ? "/" : nextPath;
  }, [location.state]);

  const [pageMode, setPageMode] = useState<PageMode>("login");
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [loginForm, setLoginForm] = useState({
    account: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    nickname: "",
    account: "",
    password: "",
    confirmPassword: "",
    avatar: "",
  });

  useEffect(() => {
    document.title = formatPageTitle("登录");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `登录或注册 ${SITE_BRAND.name}，体验博客、留言与互动功能。`,
      );
    }

    const bootstrap = async () => {
      const currentUser = await getUserInfo(true);
      if (currentUser) {
        navigate(from, { replace: true });
        return;
      }
      setChecking(false);
    };

    void bootstrap();
  }, [from, navigate]);

  const validatePassword = (password: string) =>
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH;

  const guideText =
    pageMode === "login" ? LOGIN_GUIDE_TEXT : REGISTER_GUIDE_TEXT;

  useEffect(() => {
    setDisplayedText("");
    let textIndex = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const mouthInterval = setInterval(() => {
      setIsMouthOpen((prev) => !prev);
    }, 600);

    const typingInterval = setInterval(() => {
      if (textIndex <= guideText.length) {
        setDisplayedText(guideText.slice(0, textIndex));
        textIndex += 1;
        return;
      }

      if (!resetTimer) {
        resetTimer = setTimeout(() => {
          textIndex = 0;
          setDisplayedText("");
          resetTimer = null;
        }, 1800);
      }
    }, 100);

    return () => {
      clearInterval(mouthInterval);
      clearInterval(typingInterval);
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
    };
  }, [guideText]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateAccount(loginForm.account)) {
      toast({
        title: "账号格式错误",
        description: "账号必须是8位字母或数字",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(loginForm.password)) {
      toast({
        title: "密码格式错误",
        description: "密码长度必须在8到32位之间",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      await login({
        account: loginForm.account,
        password: loginForm.password,
      });

      toast({
        title: "登录成功",
        description: "欢迎回来",
      });

      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "登录失败",
        description:
          error instanceof Error ? error.message : "账号或密码错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateNickname(registerForm.nickname)) {
      toast({
        title: "昵称格式错误",
        description: "昵称不能为空且不超过8个字符",
        variant: "destructive",
      });
      return;
    }

    if (!validateAccount(registerForm.account)) {
      toast({
        title: "账号格式错误",
        description: "账号必须是8位字母或数字",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(registerForm.password)) {
      toast({
        title: "密码格式错误",
        description: "密码长度必须在8到32位之间",
        variant: "destructive",
      });
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "确认密码不一致",
        description: "请重新确认密码",
        variant: "destructive",
      });
      return;
    }

    if (!registerForm.avatar) {
      toast({
        title: "请选择头像",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      await register({
        account: registerForm.account,
        password: registerForm.password,
        nickname: registerForm.nickname.trim(),
        avatar: registerForm.avatar,
      });

      toast({
        title: "注册成功",
        description: "已自动登录",
      });

      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "注册失败",
        description:
          error instanceof Error ? error.message : "注册失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
        <Card className="w-full max-w-md border-2 border-primary bg-card p-8 text-center shadow-pixel-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-2 border-primary bg-primary text-primary-foreground shadow-pixel">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-primary text-pixel-shadow">
            正在检查登录状态
          </h1>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pt-28 pb-12 md:pt-32 md:pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.14),transparent_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,229,255,0.04),transparent_35%,rgba(0,229,255,0.05))]" />
        <div className="absolute left-6 top-20 h-16 w-16 border border-primary/25 md:left-20 md:top-24 md:h-20 md:w-20" />
        <div className="absolute bottom-12 right-6 h-10 w-10 border border-secondary/25 md:bottom-20 md:right-24 md:h-14 md:w-14" />
      </div>

      <div className="relative mx-auto w-full max-w-[680px]">
        <div className="mb-6">
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="h-auto px-0 py-0 text-primary no-underline hover:no-underline"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
        </div>

        <Card className="relative overflow-hidden border-2 border-primary/80 bg-card/95 p-5 shadow-pixel-lg md:p-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.08),transparent_26%)]" />
            <div className="absolute left-4 top-4 h-3 w-14 border-t-2 border-l-2 border-primary/35" />
            <div className="absolute bottom-4 right-4 h-3 w-14 border-b-2 border-r-2 border-primary/25" />
          </div>

          <div className="relative mb-6 border-b border-primary/15 pb-4">
            <div className="relative min-h-[52px]">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-left">
                <h1 className="text-3xl font-bold text-primary text-pixel-shadow">
                  {pageMode === "login" ? "登录" : "注册"}
                </h1>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 w-14 bg-primary shadow-pixel" />
                  <div className="h-1 w-5 bg-primary/45" />
                </div>
              </div>

              <div className="flex min-h-[52px] items-center justify-center pl-[120px] pr-[40px]">
                <div className="relative flex w-full max-w-[340px] items-center justify-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border-2 border-primary/45 bg-card shadow-pixel">
                    <img
                      src={
                        isMouthOpen
                          ? GUIDE_AVATAR_IMAGES.open
                          : GUIDE_AVATAR_IMAGES.closed
                      }
                      alt="guide-avatar"
                      className="h-full w-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <div className="relative h-[48px] w-[275px] shrink-0 overflow-hidden border border-primary/28 bg-card/80 px-3 py-2.5">
                    <div className="absolute left-[-9px] top-4 h-0 w-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-primary/28" />
                    <div className="absolute left-[-7px] top-4 h-0 w-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-card" />
                    <p
                      className="min-h-[20px] whitespace-nowrap text-sm text-primary"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {displayedText}
                      <span className="ml-1 inline-block h-4 w-1.5 bg-primary align-[-2px] animate-pulse" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {pageMode === "login" ? (
            <div className={FORM_PANEL_CLASSNAME}>
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-full w-px bg-primary/10" />
                <div className="absolute right-0 top-0 h-full w-px bg-primary/10" />
                <div className="absolute inset-x-0 top-0 h-px bg-primary/10" />
                <div className="absolute right-4 top-4 h-8 w-8 border-t border-r border-primary/20" />
              </div>
              <form
                className="mx-auto max-w-[440px] space-y-4"
                onSubmit={handleLogin}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-text-tertiary">账号</p>
                    <span className={FIELD_HINT_CLASSNAME}>8位字母或数字</span>
                  </div>
                  <Input
                    value={loginForm.account}
                    maxLength={8}
                    placeholder="例如 AB12CD34"
                    className={`${FIELD_INPUT_CLASSNAME} font-pixel tracking-[0.18em] uppercase`}
                    onChange={(event) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        account: formatAccountInput(event.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-text-tertiary">密码</p>
                    <span className={FIELD_HINT_CLASSNAME}>8-32 位</span>
                  </div>
                  <Input
                    type="password"
                    value={loginForm.password}
                    placeholder="输入你的密码"
                    className={FIELD_INPUT_CLASSNAME}
                    onChange={(event) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 h-12 w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  登录
                </Button>

                <div className="pt-1 text-center text-sm text-text-tertiary">
                  没有账号？
                  <button
                    type="button"
                    className="ml-2 text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline"
                    onClick={() => setPageMode("register")}
                  >
                    去注册
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className={FORM_PANEL_CLASSNAME}>
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-full w-px bg-primary/10" />
                <div className="absolute right-0 top-0 h-full w-px bg-primary/10" />
                <div className="absolute inset-x-0 top-0 h-px bg-primary/10" />
                <div className="absolute left-4 top-4 h-8 w-8 border-t border-l border-primary/20" />
              </div>
              <form
                className="grid gap-5 md:grid-cols-[160px_minmax(0,1fr)]"
                onSubmit={handleRegister}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-text-tertiary">头像</p>
                    {registerForm.avatar ? (
                      <span className={FIELD_HINT_CLASSNAME}>已选择</span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAvatarDialogOpen(true)}
                    className="group relative flex h-[160px] w-full items-center justify-center overflow-hidden border-2 border-primary/40 bg-card/85 transition-colors hover:border-primary"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,229,255,0.06),transparent_35%,rgba(0,229,255,0.03))]" />
                    {registerForm.avatar ? (
                      <>
                        <img
                          src={registerForm.avatar}
                          alt="selected-avatar"
                          className="h-full w-full object-cover"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-primary bg-card/90 text-primary shadow-pixel">
                          <Pencil className="h-4 w-4" />
                        </span>
                      </>
                    ) : (
                      <div className="relative text-center">
                        <User className="mx-auto h-10 w-10 text-text-tertiary" />
                        <p className="mt-3 text-sm text-text-tertiary">
                          未选择
                        </p>
                      </div>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-text-tertiary">昵称</p>
                        <span className={FIELD_HINT_CLASSNAME}>1-8 个字符</span>
                      </div>
                      <Input
                        value={registerForm.nickname}
                        maxLength={8}
                        placeholder="输入你的昵称"
                        className={FIELD_INPUT_CLASSNAME}
                        onChange={(event) =>
                          setRegisterForm((prev) => ({
                            ...prev,
                            nickname: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-text-tertiary">账号</p>
                        <span className={FIELD_HINT_CLASSNAME}>
                          8位字母或数字
                        </span>
                      </div>
                      <Input
                        value={registerForm.account}
                        maxLength={8}
                        placeholder="例如 AB12CD34"
                        className={`${FIELD_INPUT_CLASSNAME} font-pixel tracking-[0.18em] uppercase`}
                        onChange={(event) =>
                          setRegisterForm((prev) => ({
                            ...prev,
                            account: formatAccountInput(event.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-text-tertiary">密码</p>
                        <span className={FIELD_HINT_CLASSNAME}>8-32 位</span>
                      </div>
                      <Input
                        type="password"
                        value={registerForm.password}
                        placeholder="设置登录密码"
                        className={FIELD_INPUT_CLASSNAME}
                        onChange={(event) =>
                          setRegisterForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-text-tertiary">确认密码</p>
                        <span className={FIELD_HINT_CLASSNAME}>
                          两次输入一致
                        </span>
                      </div>
                      <Input
                        type="password"
                        value={registerForm.confirmPassword}
                        placeholder="再次输入密码"
                        className={FIELD_INPUT_CLASSNAME}
                        onChange={(event) =>
                          setRegisterForm((prev) => ({
                            ...prev,
                            confirmPassword: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button
                      type="submit"
                      size="lg"
                      className="mx-auto flex h-12 w-full max-w-[320px]"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      注册并登录
                    </Button>
                  </div>

                  <div className="text-center text-sm text-text-tertiary">
                    已有账号？
                    <button
                      type="button"
                      className="ml-2 text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline"
                      onClick={() => setPageMode("login")}
                    >
                      去登录
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </Card>

        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="border-2 border-primary bg-card p-0 shadow-pixel-lg sm:max-w-2xl">
            <DialogHeader className="border-b-2 border-border px-6 py-5">
              <DialogTitle className="text-xl text-primary text-pixel-shadow">
                选择头像
              </DialogTitle>
              <DialogDescription className="text-text-secondary">
                选择一个固定头像作为你的初始形象，选中后会自动关闭弹窗。
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-3 p-6 sm:grid-cols-4">
              {AVATARS.map((avatar, index) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => {
                    setRegisterForm((prev) => ({ ...prev, avatar }));
                    setAvatarDialogOpen(false);
                  }}
                  className={`aspect-square overflow-hidden border-2 transition-all ${
                    registerForm.avatar === avatar
                      ? "scale-105 border-primary shadow-pixel"
                      : "border-border hover:border-primary/60"
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`avatar-${index + 1}`}
                    className="h-full w-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
