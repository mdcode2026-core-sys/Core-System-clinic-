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

  const field = (
    <div className={cn("flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 shadow-sm transition-colors", open && "border-blue-300 bg-white shadow-md", "focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100")}>
      <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => hasSearchQuery && setOpen(true)}
        placeholder={messages.placeholder}
        aria-label={messages.label}
        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {isPending && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-hidden="true" />}
      {mobileOpen && <button type="button" onClick={() => { setMobileOpen(false); setOpen(false); }} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={locale === "ar" ? "إغلاق البحث" : "Close search"}><X className="h-4 w-4" aria-hidden="true" /></button>}
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full min-w-0 max-w-xl">
      <button type="button" onClick={() => setMobileOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 shadow-sm hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden" aria-label={messages.label} title={messages.label} data-testid="global-search-mobile-trigger"><Search className="h-4 w-4" aria-hidden="true" /></button>
      <div className={cn("hidden md:block", mobileOpen && "block")}>{field}</div>
      {mobileOpen && <div className="absolute inset-x-0 top-11 z-50 md:hidden">{field}</div>}

      {open && (
        <div className="absolute inset-x-0 top-12 z-50 max-h-[min(70vh,32rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          {!hasSearchQuery ? (
            <p className="px-3 py-4 text-sm text-slate-500">{messages.minChars}</p>
          ) : isPending ? (
            <p className="flex items-center gap-2 px-3 py-4 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />{messages.loading}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-500">{messages.noResults}</p>
          ) : (
            <div className="space-y-1">
              {results.map((result) => (
                <Link key={`${result.type}-${result.id}`} href={result.href} onClick={() => { setOpen(false); setMobileOpen(false); }} className="flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 sm:gap-3">
                  <span className="max-w-[5rem] shrink-0 truncate text-xs font-medium text-slate-500 sm:min-w-24">{typeLabel(result.type)}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-900">{result.title}</span>{result.subtitle && <span className="block truncate text-xs text-slate-500">{result.subtitle}</span>}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 rtl:rotate-180" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
