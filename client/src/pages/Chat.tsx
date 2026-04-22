import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Copy, Check, Eraser, Send, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getUserInfo, type UserInfo } from "@/lib/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { agentApi, type AgentMessage } from "@/api/agent";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { AVATARS } from "@/lib/avatars";
import { formatPageTitle, SITE_BRAND } from "@/lib/siteProfile";
import { MEDIA } from "@/lib/siteAssets";

type MessageRole = "self" | "agent";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  time: string;
  model?: string;
}

const GUEST_AVATAR = AVATARS[0];
const GUEST_NAME = "未登录";
const EMPTY_STATE_AVATAR = {
  closed: MEDIA.common.avatarClosed,
  open: MEDIA.common.avatarOpen,
};
const AGENT_AVATAR = EMPTY_STATE_AVATAR.closed;
const AGENT_NAME = "演示助手";
const EMPTY_STATE_TEXT =
  "我是站点内置的演示助手，可以基于公开内容与你交流。";

const formatTime = (dateStr: string | Date) => {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function toDisplayMessages(records: AgentMessage[]): ChatMessage[] {
  return records.map((m) => ({
    id: m.id,
    role: m.role === "user" ? "self" : "agent",
    content: m.content,
    time: formatTime(m.createdAt),
    model: m.role === "assistant" ? m.model : undefined,
  }));
}

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingModel, setStreamingModel] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [displayedEmptyText, setDisplayedEmptyText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isComposingRef = useRef(false);
  const streamingModelRef = useRef("");
  const autoSentRef = useRef(false);

  const isLoggedIn = !!currentUser;
  const selfName = currentUser?.nickname || GUEST_NAME;
  const selfAvatar = currentUser?.avatar || GUEST_AVATAR;

  useEffect(() => {
    document.title = formatPageTitle("聊天");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `${SITE_BRAND.name} 智能体对话窗口。`,
      );
    }
  }, []);

  useEffect(() => {
    const syncCurrentUser = async (force = false) => {
      const user = await getUserInfo(force);
      setCurrentUser(user);
    };
    syncCurrentUser();
    const handleUserChange = () => syncCurrentUser(true);
    window.addEventListener("user-info-changed", handleUserChange);
    return () =>
      window.removeEventListener("user-info-changed", handleUserChange);
  }, []);

  useEffect(() => {
    const articleId = searchParams.get("articleId");
    const articleTitle = searchParams.get("articleTitle");

    if (currentUser) {
      agentApi
        .history()
        .then((records) => {
          setMessages(toDisplayMessages(records));
        })
        .catch(() => {})
        .finally(() => {
          if (articleId && !autoSentRef.current) {
            autoSentRef.current = true;
            setSearchParams({}, { replace: true });
            const titlePart = articleTitle ? `《${articleTitle}》` : "";
            const question = `请帮我讲解并分析文章${titlePart}（文章id：${articleId}），需要包含：核心内容总结、技术要点解析，以及你对这篇文章的评价`;
            setTimeout(() => handleSend(question), 0);
          }
        });
    } else if (articleId && !autoSentRef.current) {
      autoSentRef.current = true;
      setSearchParams({}, { replace: true });
      const titlePart = articleTitle ? `《${articleTitle}》` : "";
      const question = `请帮我讲解并分析文章${titlePart}（文章id：${articleId}），需要包含：核心内容总结、技术要点解析，以及你对这篇文章的评价`;
      setTimeout(() => handleSend(question), 0);
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamingContent, isStreaming]);

  useEffect(() => {
    const mouthInterval = window.setInterval(() => {
      setIsMouthOpen((prev) => !prev);
    }, 600);

    let textIndex = 0;
    let resetTimer: number | null = null;
    const typingInterval = window.setInterval(() => {
      if (textIndex <= EMPTY_STATE_TEXT.length) {
        setDisplayedEmptyText(EMPTY_STATE_TEXT.slice(0, textIndex));
        textIndex += 1;
        return;
      }
      if (resetTimer === null) {
        resetTimer = window.setTimeout(() => {
          textIndex = 0;
          setDisplayedEmptyText("");
          resetTimer = null;
        }, 1800);
      }
    }, 110);

    return () => {
      window.clearInterval(mouthInterval);
      window.clearInterval(typingInterval);
      if (resetTimer !== null) window.clearTimeout(resetTimer);
    };
  }, []);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreamingContent("");
    setIsStreaming(false);
  };

  const handleSend = async (contentOverride?: string) => {
    const content = (contentOverride ?? inputValue).trim();
    if (!content || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "self",
      content,
      time: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (contentOverride === undefined) setInputValue("");
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingModel("");
    streamingModelRef.current = "";

    const abort = new AbortController();
    abortRef.current = abort;

    let finalContent = "";

    try {
      await agentApi.stream(
        content,
        undefined,
        {
          onMeta: ({ model }) => {
            setStreamingModel(model);
            streamingModelRef.current = model;
          },
          onDelta: ({ content: delta }) => {
            finalContent += delta;
            setStreamingContent(finalContent);
          },
          onDone: ({ content: full }) => {
            const agentMsg: ChatMessage = {
              id: `msg-${Date.now()}-agent`,
              role: "agent",
              content: full || finalContent,
              time: formatTime(new Date()),
              model: streamingModelRef.current,
            };
            setMessages((prev) => [...prev, agentMsg]);
            setStreamingContent("");
            setStreamingModel("");
            streamingModelRef.current = "";
            setIsStreaming(false);
          },
          onError: ({ msg }) => {
            setMessages((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}-err`,
                role: "agent",
                content: `出了点问题：${msg}`,
                time: formatTime(new Date()),
              },
            ]);
            setStreamingContent("");
            setStreamingModel("");
            setIsStreaming(false);
          },
        },
        abort.signal,
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: "agent",
          content: "网络异常，请稍后再试。",
          time: formatTime(new Date()),
        },
      ]);
      setStreamingContent("");
      setStreamingModel("");
      setIsStreaming(false);
    } finally {
      abortRef.current = null;
    }
  };

  const handleClearMessages = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStreamingContent("");
    setStreamingModel("");
    setIsStreaming(false);
    if (currentUser) {
      agentApi.clearHistory().catch(() => {});
    }
  };

  const hasContent = messages.length > 0 || isStreaming;

  return (
    <main className="relative h-full overflow-hidden px-3 pb-3 pt-[78px] md:px-5 md:pb-4 md:pt-[92px]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes bubble-in {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes typing-dot {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
            40% { transform: translateY(-4px); opacity: 1; }
          }
          .agent-chat-grid {
            background-image:
              linear-gradient(rgba(0, 229, 255, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 229, 255, 0.06) 1px, transparent 1px);
            background-size: 28px 28px;
          }
          .agent-panel-lines {
            background-image:
              linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 18%, transparent 82%, rgba(0, 229, 255, 0.05)),
              repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.05) 0, rgba(148, 163, 184, 0.05) 1px, transparent 1px, transparent 120px),
              repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.04) 0, rgba(148, 163, 184, 0.04) 1px, transparent 1px, transparent 72px);
          }
          .chat-stage {
            background-image:
              radial-gradient(circle at top, rgba(76, 182, 255, 0.08), transparent 34%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 18%, transparent 84%, rgba(0, 229, 255, 0.04)),
              repeating-linear-gradient(90deg, rgba(56, 189, 248, 0.04) 0, rgba(56, 189, 248, 0.04) 1px, transparent 1px, transparent 96px),
              repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.03) 0, rgba(148, 163, 184, 0.03) 1px, transparent 1px, transparent 64px);
          }
          .chat-message-enter { animation: bubble-in 240ms ease-out; }
          .typing-dot { animation: typing-dot 1.2s infinite ease-in-out; }
          .chat-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 229, 255, 0.35) transparent;
          }
          .chat-scroll::-webkit-scrollbar { width: 8px; }
          .chat-scroll::-webkit-scrollbar-track { background: transparent; }
          .chat-scroll::-webkit-scrollbar-thumb {
            border-radius: 9999px;
            background: rgba(0, 229, 255, 0.28);
          }
        `,
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[18%] top-12 h-72 w-72 rounded-full bg-[#00E5FF]/10 blur-3xl" />
        <div className="absolute bottom-12 right-[18%] h-80 w-80 rounded-full bg-[#00FF9D]/10 blur-3xl" />
        <div className="absolute right-10 top-1/3 h-28 w-28 rotate-12 border border-[#00E5FF]/20" />
        <div className="absolute bottom-24 left-10 h-20 w-20 -rotate-12 border border-[#FF00FF]/20" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-stretch justify-center">
        <Card
          className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border-primary/50 bg-[linear-gradient(180deg,rgba(19,29,42,0.82),rgba(13,19,29,0.72))] backdrop-blur-xl"
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 229, 255, 0.18), 0 30px 80px rgba(0, 0, 0, 0.45)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(88,164,201,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(0,229,255,0.12),transparent_32%)]" />
          <div className="absolute inset-0 agent-chat-grid opacity-20" />
          <div className="absolute inset-0 agent-panel-lines opacity-35" />

          <div className="relative flex min-h-0 flex-1 flex-col">
            {/* 标题栏 */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-primary/25 bg-[linear-gradient(90deg,rgba(23,33,47,0.86),rgba(20,31,46,0.78),rgba(13,20,30,0.84))] px-4 py-2.5 md:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-[0_0_12px_rgba(255,95,87,0.55)]" />
                  <span className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-[0_0_12px_rgba(254,188,46,0.55)]" />
                  <span className="h-3 w-3 rounded-full bg-[#28C840] shadow-[0_0_12px_rgba(40,200,64,0.55)]" />
                </div>
                <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
                  <p className="text-sm text-primary font-tech tracking-[0.18em]">
                    聊天
                  </p>
                  <span className="text-[10px] text-text-secondary/70">/</span>
                  <p className="truncate text-[11px] text-text-secondary">
                    沉浸式对话窗口
                  </p>
                  {!isLoggedIn && (
                    <>
                      <span className="text-[10px] text-text-secondary/70">
                        /
                      </span>
                      <p className="truncate text-[10px] text-yellow-400/80">
                        ⚠️ 当前未登录，对话信息不会保存，请先登录！！
                      </p>
                    </>
                  )}
                </div>
              </div>

              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearMessages}
                      aria-label="清空会话内容"
                      className="h-8 w-8 shrink-0 rounded-xl border border-primary/20 bg-black/15 text-primary hover:border-primary/45 hover:bg-primary/10 hover:text-primary"
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="border-primary/30 bg-[#0E1218] text-xs text-text-primary"
                  >
                    清空会话内容
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* 消息列表 */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="chat-stage chat-scroll h-full overflow-y-auto px-3 py-3 md:px-5 md:py-4">
                {!hasContent ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex w-full max-w-[540px] flex-col items-center justify-center gap-4 md:grid md:grid-cols-[96px_420px] md:items-center md:gap-6">
                      <div
                        className="h-20 w-20 overflow-hidden border-2 border-[#00E5FF] bg-[#101722] md:h-24 md:w-24"
                        style={{
                          boxShadow: "0 0 20px rgba(0, 229, 255, 0.35)",
                        }}
                      >
                        <img
                          src={
                            isMouthOpen
                              ? EMPTY_STATE_AVATAR.open
                              : EMPTY_STATE_AVATAR.closed
                          }
                          alt={AGENT_NAME}
                          className="h-full w-full object-cover"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute left-1/2 top-[-10px] h-0 w-0 -translate-x-1/2 border-x-[8px] border-b-[10px] border-x-transparent border-b-[#00E5FF] md:hidden" />
                        <div className="absolute left-[-10px] top-6 hidden h-0 w-0 border-b-[6px] border-r-[10px] border-t-[6px] border-b-transparent border-r-[#00E5FF] border-t-transparent md:block" />
                        <div
                          className="w-[min(78vw,320px)] border border-[#00E5FF] bg-[rgba(28,28,28,0.88)] px-4 py-3 md:w-[420px]"
                          style={{
                            boxShadow: "0 0 15px rgba(0, 229, 255, 0.28)",
                          }}
                        >
                          <p
                            className="min-h-[20px] text-sm text-[#00E5FF] break-all"
                            style={{ fontFamily: "JetBrains Mono, monospace" }}
                          >
                            {displayedEmptyText}
                            <span className="ml-1 inline-block h-4 w-1.5 bg-[#00E5FF] align-[-2px] animate-pulse" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isSelf = message.role === "self";
                      const isCopied = copiedId === message.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex chat-message-enter ${isSelf ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex max-w-[96%] items-start gap-2.5 md:max-w-[82%] ${isSelf ? "flex-row-reverse" : ""}`}
                          >
                            {/* 头像 - 顶部对齐 */}
                            <div className="mt-0.5 h-9 w-9 shrink-0 overflow-hidden border-2 border-primary bg-surface-primary shadow-pixel">
                              <img
                                src={isSelf ? selfAvatar : AGENT_AVATAR}
                                alt={isSelf ? selfName : AGENT_NAME}
                                className="h-full w-full object-cover"
                                style={{ imageRendering: "pixelated" }}
                              />
                            </div>

                            <div
                              className={`flex flex-col gap-1 ${isSelf ? "items-end" : "items-start"}`}
                            >
                              {/* 昵称 */}
                              <span className="text-[11px] leading-none text-text-primary">
                                {isSelf ? selfName : AGENT_NAME}
                              </span>

                              {/* 气泡 */}
                              <div
                                className={`relative px-4 py-3 text-[12px] leading-5 shadow-[0_10px_24px_rgba(0,0,0,0.16)] ${
                                  isSelf
                                    ? "rounded-[18px] rounded-tr-sm border border-primary/45 bg-[linear-gradient(135deg,rgba(0,229,255,0.16),rgba(20,61,94,0.3))] text-[#EAFBFF]"
                                    : "rounded-[18px] rounded-tl-sm border border-primary/15 bg-[linear-gradient(135deg,rgba(21,33,48,0.88),rgba(17,29,43,0.8))] text-text-primary"
                                }`}
                              >
                                <div
                                  className={`absolute top-2 h-2.5 w-2.5 rotate-45 border ${
                                    isSelf
                                      ? "-right-[6px] border-b-0 border-l-0 border-primary/45 bg-[#163d57]"
                                      : "-left-[6px] border-r-0 border-t-0 border-primary/15 bg-[#152232]"
                                  }`}
                                />
                                {message.role === "agent" ? (
                                  <MarkdownRenderer
                                    variant="chat"
                                    content={message.content}
                                  />
                                ) : (
                                  <p className="whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                )}
                              </div>

                              {/* 底部元信息：模型 + 时间 + 复制 */}
                              <div
                                className={`flex items-center gap-2 text-[10px] text-text-secondary/60 ${isSelf ? "flex-row-reverse" : ""}`}
                              >
                                {message.model && (
                                  <span className="rounded border border-primary/15 bg-primary/5 px-1.5 py-0.5 font-mono text-[9px] text-primary/60">
                                    {message.model}
                                  </span>
                                )}
                                <span>{message.time}</span>
                                <TooltipProvider delayDuration={100}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() =>
                                          handleCopy(
                                            message.id,
                                            message.content,
                                          )
                                        }
                                        className="flex items-center text-text-secondary/40 transition-colors hover:text-primary"
                                        aria-label="复制"
                                      >
                                        {isCopied ? (
                                          <Check className="h-3 w-3 text-[#28c840]" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="border-primary/30 bg-[#0E1218] text-xs text-text-primary"
                                    >
                                      {isCopied ? "已复制到剪切板" : "复制"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* 流式气泡 */}
                    {isStreaming ? (
                      <div className="flex justify-start chat-message-enter">
                        <div className="flex max-w-[96%] items-start gap-2.5 md:max-w-[82%]">
                          <div className="mt-0.5 h-9 w-9 shrink-0 overflow-hidden border-2 border-primary bg-surface-primary shadow-pixel">
                            <img
                              src={AGENT_AVATAR}
                              alt={AGENT_NAME}
                              className="h-full w-full object-cover"
                              style={{ imageRendering: "pixelated" }}
                            />
                          </div>

                          <div className="flex flex-col items-start gap-1">
                            <span className="text-[11px] leading-none text-text-primary">
                              {AGENT_NAME}
                            </span>
                            <div className="relative rounded-[18px] rounded-tl-sm border border-primary/15 bg-[linear-gradient(135deg,rgba(21,33,48,0.88),rgba(17,29,43,0.8))] px-4 py-3 text-[12px] leading-5 text-text-primary shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
                              <div className="absolute -left-[6px] top-2 h-2.5 w-2.5 rotate-45 border border-r-0 border-t-0 border-primary/15 bg-[#152232]" />
                              {streamingContent ? (
                                <div>
                                  <MarkdownRenderer
                                    variant="chat"
                                    content={streamingContent}
                                  />
                                  <span className="inline-block h-3.5 w-0.5 bg-primary align-[-1px] animate-pulse" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="typing-dot h-2 w-2 rounded-full bg-primary" />
                                  <span
                                    className="typing-dot h-2 w-2 rounded-full bg-primary"
                                    style={{ animationDelay: "0.15s" }}
                                  />
                                  <span
                                    className="typing-dot h-2 w-2 rounded-full bg-primary"
                                    style={{ animationDelay: "0.3s" }}
                                  />
                                </div>
                              )}
                            </div>
                            {/* 流式期间底部 meta */}
                            <div className="flex items-center gap-2 text-[10px] text-text-secondary/60">
                              {streamingModel && (
                                <span className="rounded border border-primary/15 bg-primary/5 px-1.5 py-0.5 font-mono text-[9px] text-primary/60">
                                  {streamingModel}
                                </span>
                              )}
                              <span className="animate-pulse">
                                {streamingContent ? "生成中..." : "连接中..."}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
            </div>

            {/* 底部输入区 */}
            <div className="shrink-0 border-t border-primary/15 bg-[linear-gradient(180deg,rgba(28,41,58,0.3),rgba(18,28,40,0.58))] px-3 py-3 md:px-5 md:py-4">
              <div className="relative overflow-hidden rounded-[14px] border border-primary/20 bg-[linear-gradient(180deg,rgba(26,39,55,0.84),rgba(17,27,39,0.84))] p-2 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

                <div className="relative flex items-end gap-2">
                  <div className="flex-1 rounded-[10px] border border-white/8 bg-[rgba(255,255,255,0.03)]">
                    <Textarea
                      rows={1}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onCompositionStart={() => {
                        isComposingRef.current = true;
                      }}
                      onCompositionEnd={() => {
                        isComposingRef.current = false;
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          !isComposingRef.current
                        ) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="输入消息..."
                      className="min-h-[44px] max-h-32 flex-1 resize-none rounded-[10px] border-0 bg-transparent px-3 py-3 text-text-primary shadow-none placeholder:text-[#7F98AA] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  {isStreaming ? (
                    <Button
                      onClick={handleStop}
                      aria-label="停止输出"
                      className="h-11 min-w-[72px] shrink-0 rounded-[10px] border border-red-500/40 bg-[linear-gradient(180deg,rgba(255,80,80,0.18),rgba(180,40,40,0.22))] px-4 text-red-400 shadow-[0_0_16px_rgba(255,80,80,0.12)] transition-all hover:border-red-400/60 hover:brightness-110"
                    >
                      <Square className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm">停止</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim()}
                      aria-label="发送消息"
                      className="h-11 min-w-[72px] shrink-0 rounded-[10px] border border-primary/35 bg-[linear-gradient(180deg,rgba(31,223,255,0.92),rgba(7,176,216,0.92))] px-4 text-[#062233] shadow-[0_0_16px_rgba(0,229,255,0.18)] transition-all hover:brightness-105 disabled:border-white/10 disabled:bg-[rgba(74,89,102,0.5)] disabled:text-white/45 disabled:shadow-none"
                    >
                      <Send className="h-4 w-4" />
                      <span className="ml-1 text-sm">发送</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
