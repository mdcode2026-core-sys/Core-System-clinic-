"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Search, ArrowRight, Loader2, X } from "lucide-react";
import { globalSearch, type GlobalSearchResult } from "./actions";
import { globalSearchMessages } from "@/core/i18n/globalSearchMessages";
import { useI18n } from "@/core/i18n/I18nProvider";
import { cn } from "@/shared/utils/cn";

export function GlobalSearch() {
  const { locale } = useI18n();
  const messages = globalSearchMessages[locale];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) return;
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const next = await globalSearch(value);
        setResults(next);
        setOpen(true);
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [mobileOpen]);

  const typeLabel = (type: GlobalSearchResult["type"]) => messages.types[type];
  const hasSearchQuery = query.trim().length >= 2;

  const field = (mobile = false) => (
    <div className={cn(
      "flex min-w-0 items-center gap-2 rounded-lg border border-[var(--cs-slate-200)] bg-[var(--cs-slate-50)] px-3 transition-colors",
      open && "border-[var(--cs-azure-600)] bg-white shadow-[var(--cs-shadow-xs)]",
      "focus-within:border-[var(--cs-azure-600)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--cs-azure-100)]",
      mobile ? "w-full" : "w-full",
    )}>
      <Search className="h-4 w-4 shrink-0 text-[var(--cs-slate-500)]" aria-hidden="true" />
      <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim().length < 2) setOpen(false); }} onFocus={() => hasSearchQuery && setOpen(true)} placeholder={messages.placeholder} aria-label={messages.label} className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[var(--cs-ink-950)] outline-none placeholder:text-[var(--cs-slate-500)]" />
      {isPending && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--cs-slate-500)]" aria-hidden="true" />}
      {mobile && <button type="button" onClick={() => { setMobileOpen(false); setOpen(false); }} className="cs-interactive inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--cs-slate-700)]" aria-label={locale === "ar" ? "إغلاق البحث" : "Close search"}><X className="h-4 w-4" aria-hidden="true" /></button>}
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative h-10 w-full min-w-0">
      <button type="button" onClick={() => { setMobileOpen(true); setOpen(false); }} className="cs-interactive inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--cs-slate-200)] bg-[var(--cs-slate-50)] text-[var(--cs-slate-700)] md:hidden" aria-label={messages.label} title={messages.label} data-testid="global-search-mobile-trigger"><Search className="h-4 w-4" aria-hidden="true" /></button>
      <div className="hidden w-full md:block">{field()}</div>
      {mobileOpen ? <div className="fixed inset-x-2 top-14 z-[80] md:hidden" role="search">{field(true)}</div> : null}
      {open ? <div className={cn("z-[80] max-h-[min(70vh,32rem)] overflow-y-auto rounded-xl border border-[var(--cs-slate-200)] bg-white p-2 shadow-[var(--cs-shadow-md)]", mobileOpen ? "fixed inset-x-2 top-[7rem]" : "absolute inset-x-0 top-12")}>
        {!hasSearchQuery ? <p className="px-3 py-4 text-sm text-[var(--cs-slate-500)]">{messages.minChars}</p> : isPending ? <p className="flex items-center gap-2 px-3 py-4 text-sm text-[var(--cs-slate-500)]"><Loader2 className="h-4 w-4 animate-spin" />{messages.loading}</p> : results.length === 0 ? <p className="px-3 py-4 text-sm text-[var(--cs-slate-500)]">{messages.noResults}</p> : <div className="space-y-1">{results.map((result) => <Link key={`${result.type}-${result.id}`} href={result.href} onClick={() => { setOpen(false); setMobileOpen(false); }} className="cs-interactive flex min-w-0 items-center gap-2 rounded-lg px-3 py-2.5 sm:gap-3"><span className="max-w-[5rem] shrink-0 truncate text-xs font-medium text-[var(--cs-slate-500)] sm:min-w-24">{typeLabel(result.type)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[var(--cs-ink-950)]">{result.title}</span>{result.subtitle && <span className="block truncate text-xs text-[var(--cs-slate-500)]">{result.subtitle}</span>}</span><ArrowRight className="h-4 w-4 shrink-0 text-[var(--cs-slate-500)] rtl:rotate-180" aria-hidden="true" /></Link>)}</div>}
      </div> : null}
    </div>
  );
}
