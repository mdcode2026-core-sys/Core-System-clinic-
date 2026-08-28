"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Search, ArrowRight, Loader2 } from "lucide-react";
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
  const [isPending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setResults([]);
      return;
    }
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

  const typeLabel = (type: GlobalSearchResult["type"]) => messages.types[type];

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <div className={cn("flex items-center gap-2 rounded-xl border bg-gray-50 px-3", open && "border-blue-300 bg-white shadow-sm")}>
        <Search className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder={messages.placeholder}
          aria-label={messages.label}
          className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-500" aria-hidden="true" />}
      </div>

      {open && (
        <div className="absolute inset-x-0 top-12 z-50 max-h-[min(70vh,32rem)] overflow-y-auto rounded-xl border bg-white p-2 shadow-xl">
          {query.trim().length < 2 ? (
            <p className="px-3 py-4 text-sm text-gray-500">{messages.minChars}</p>
          ) : isPending ? (
            <p className="flex items-center gap-2 px-3 py-4 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />{messages.loading}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-500">{messages.noResults}</p>
          ) : (
            <div className="space-y-1">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50"
                >
                  <span className="min-w-24 shrink-0 text-xs font-medium text-gray-500">{typeLabel(result.type)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-900">{result.title}</span>
                    {result.subtitle && <span className="block truncate text-xs text-gray-500">{result.subtitle}</span>}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 rtl:rotate-180" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
