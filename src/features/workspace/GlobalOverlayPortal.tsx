"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

interface GlobalOverlayPortalProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  id: string;
  ariaLabel: string;
  dir: "rtl" | "ltr";
  role?: "dialog" | "menu";
  width: number;
  zIndex?: number;
  className?: string;
  mobilePlacement?: "top" | "bottom";
  children: ReactNode;
}

interface OverlayPosition {
  top?: number;
  bottom?: number;
  width: number;
  left?: number;
  right?: number;
  maxHeight: number;
}

const EDGE_GAP = 12;
const MOBILE_EDGE = 8;
const MOBILE_BREAKPOINT = 768;
const HEADER_GAP = 8;
const HEADER_OFFSET = 68;
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

export function GlobalOverlayPortal({
  open,
  anchorRef,
  onClose,
  id,
  ariaLabel,
  dir,
  role = "dialog",
  width,
  zIndex = 80,
  className,
  mobilePlacement = "top",
  children,
}: GlobalOverlayPortalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<OverlayPosition | null>(null);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const anchor = anchorRef.current?.getBoundingClientRect();
      const safeTop = Math.max(HEADER_OFFSET, Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sat") || "0") || 0);
      const safeBottom = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sab") || "0") || 0;

      if (viewportWidth < MOBILE_BREAKPOINT || !anchor) {
        const top = mobilePlacement === "top" ? Math.max(MOBILE_EDGE, safeTop) : undefined;
        const bottom = mobilePlacement === "bottom" ? Math.max(MOBILE_EDGE, safeBottom) : undefined;
        const reserved = (top ?? 0) + (bottom ?? 0) + MOBILE_EDGE * 2;
        setPosition({
          top,
          bottom,
          left: MOBILE_EDGE,
          right: MOBILE_EDGE,
          width: Math.max(0, viewportWidth - MOBILE_EDGE * 2),
          maxHeight: Math.max(160, viewportHeight - reserved),
        });
        return;
      }

      const boundedWidth = Math.min(width, viewportWidth - EDGE_GAP * 2);
      const requestedTop = anchor.bottom + HEADER_GAP;
      const availableBelow = viewportHeight - requestedTop - EDGE_GAP;
      const availableAbove = anchor.top - EDGE_GAP;
      const shouldOpenAbove = availableBelow < 180 && availableAbove > availableBelow;
      const maxHeight = Math.max(160, Math.max(availableBelow, availableAbove));
      const top = shouldOpenAbove ? undefined : Math.min(requestedTop, viewportHeight - EDGE_GAP - 160);
      const bottom = shouldOpenAbove ? Math.max(EDGE_GAP, viewportHeight - anchor.top + HEADER_GAP) : undefined;
      const requestedStart = dir === "rtl" ? viewportWidth - anchor.right : anchor.right - boundedWidth;
      const clampedStart = Math.min(Math.max(EDGE_GAP, requestedStart), Math.max(EDGE_GAP, viewportWidth - boundedWidth - EDGE_GAP));

      setPosition({
        top,
        bottom,
        left: dir === "ltr" ? clampedStart : undefined,
        right: dir === "rtl" ? clampedStart : undefined,
        width: boundedWidth,
        maxHeight,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("orientationchange", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    const timer = window.setTimeout(updatePosition, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("orientationchange", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, dir, mobilePlacement, open, width]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panelRef.current)?.focus();
    }, 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!focusable.length) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !panelRef.current?.contains(target) && !anchorRef.current?.contains(target)) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [anchorRef, onClose, open]);

  if (!open || !position || typeof document === "undefined") return null;
  const style: CSSProperties = {
    position: "fixed",
    top: position.top,
    bottom: position.bottom,
    left: position.left,
    right: position.right,
    width: position.width,
    maxHeight: position.maxHeight,
    zIndex,
    paddingBottom: "env(safe-area-inset-bottom)",
  };

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      aria-modal={role === "dialog" ? true : undefined}
      aria-label={ariaLabel}
      dir={dir}
      style={style}
      tabIndex={-1}
      className={className}
    >
      {children}
    </div>,
    document.body,
  );
}