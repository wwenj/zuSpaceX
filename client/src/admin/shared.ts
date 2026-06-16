export const PAGE_SIZE = 10;

export const panelClass =
  "rounded-[28px] border border-slate-200 bg-white p-6 shadow-none";
export const labelClass = "text-sm font-medium text-slate-700";
export const fieldClass =
  "h-11 rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300 focus-visible:ring-offset-0";
export const textareaClass =
  "min-h-[120px] rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300 focus-visible:ring-offset-0";
export const primaryButtonClass =
  "h-10 rounded-xl border-slate-900 bg-slate-900 px-4 font-sans text-sm font-medium normal-case tracking-normal text-white shadow-none hover:translate-x-0 hover:translate-y-0 hover:border-slate-900 hover:bg-slate-800 hover:text-white hover:shadow-none active:translate-x-0 active:translate-y-0";
export const secondaryButtonClass =
  "h-10 rounded-xl border-slate-200 bg-white px-4 font-sans text-sm font-medium normal-case tracking-normal text-slate-700 shadow-none hover:translate-x-0 hover:translate-y-0 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-none active:translate-x-0 active:translate-y-0";
export const dangerButtonClass =
  "h-10 rounded-xl border-rose-200 bg-rose-50 px-4 font-sans text-sm font-medium normal-case tracking-normal text-rose-600 shadow-none hover:translate-x-0 hover:translate-y-0 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 hover:shadow-none active:translate-x-0 active:translate-y-0";
export const listTagClass =
  "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium tracking-[0.01em] text-slate-700";
export const editorTagClass =
  "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100";
export const dialogContentClass =
  "max-h-[90vh] max-w-4xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-0 shadow-[0_12px_28px_rgba(15,23,42,0.08)]";
export const tableHeadClass =
  "border-b border-slate-200 px-6 py-4 text-center text-sm font-semibold text-slate-500";
export const tableCellClass = "border-b border-slate-200 px-6 py-5 text-center";
export const filterSegmentClass =
  "flex min-h-11 items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1";

export const getFilterOptionClass = (active: boolean) =>
  [
    "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all",
    active
      ? "border border-slate-200 bg-white text-slate-900 shadow-sm"
      : "border border-transparent bg-transparent text-slate-500 hover:text-slate-700",
  ].join(" ");

export const normalizeTag = (value: string) =>
  value.trim().replace(/\s+/g, " ");

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("zh-CN", {
        hour12: false,
      })
    : "-";
