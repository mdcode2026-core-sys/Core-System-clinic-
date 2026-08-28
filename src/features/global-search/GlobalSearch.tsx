"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Command } from "lucide-react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { globalSearchMessages } from "@/core/i18n/globalSearchMessages";
import { searchGlobal, type GlobalSearchResult } from "@/domain/global-search/global-search.queries";
import { cn } from "@/shared/utils/cn";

export function GlobalSearch() {
  const { locale } = useI18n();
  const t = globalSearchMessages[locale];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const normalized = query.trim();
    if (normalized.length < 2) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await searchGlobal(normalized, locale);
        if (cancelled) return;
        if (!response.success) {
          setError(true);
          setResults([]);
        } else {
          setResults(response.results);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query, locale]);

  const typeLabel = useMemo(() => (type: string) => {
    const labels = t.types as Record<string, string>;
    return labels[type] ?? type;
  }, [t.types]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-start text-sm text-muted-foreground transition hover:bg-muted lg:flex"
        aria-label={t.label}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">{t.placeholder}</span>
        <span className="ms-auto hidden shrink-0 items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground xl:flex">
          <Command className="h-3 w-3" />K
        </span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
        aria-label={t.label}
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-3 pt-[8vh] sm:p-6 sm:pt-[10vh]" onMouseDown={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.label}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-2xl"
            dir={locale === "ar" ? "rtl" : "ltr"}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.placeholder}
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                aria-label={t.label}
              />
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label={locale === "ar" ? "إغلاق" : "Close"}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-3">
              {query.trim().length < 2 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t.hint}</p>}
              {loading && <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t.searching}</p>}
              {!loading && error && <p className="px-3 py-8 text-center text-sm text-destructive">{t.error}</p>}
              {!loading && !error && query.trim().length >= 2 && results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t.noResults}</p>}
              {!loading && results.length > 0 && (
                <div className="space-y-1">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}:${result.id}`}
                      href={result.href}
                      onClick={() => setOpen(false)}
                      className={cn("group flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted", locale === "ar" ? "text-right" : "text-left")}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium">{result.title}</span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{typeLabel(result.type)}</span>
                        </div>
                        {result.subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{result.subtitle}</p>}
                      </div>
                      <ArrowRight className={cn("h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100", locale === "ar" && "rotate-180")} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
