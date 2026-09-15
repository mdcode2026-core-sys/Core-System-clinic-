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
  children: ReactNode;
}

interface OverlayPosition {
  top: number;
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

export function GlobalOverlayPortal({ open, anchorRef, onClose, id, ariaLabel, dir, role = "dialog", width, zIndex = 80, className, children }: GlobalOverlayPortalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<OverlayPosition | null>(null);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (viewportWidth < MOBILE_BREAKPOINT || !anchor) {
        const top = Math.max(MOBILE_EDGE, HEADER_OFFSET);
        setPosition({ top, left: MOBILE_EDGE, right: MOBILE_EDGE, width: Math.max(0, viewportWidth - MOBILE_EDGE * 2), maxHeight: Math.max(160, viewportHeight - top - MOBILE_EDGE) });
        return;
      }
      const boundedWidth = Math.min(width, viewportWidth - EDGE_GAP * 2);
      const requestedTop = anchor.bottom + HEADER_GAP;
      const maxTop = Math.max(EDGE_GAP, viewportHeight - EDGE_GAP - 180);
      const top = Math.min(requestedTop, maxTop);
      const requestedStart = dir === "rtl" ? viewportWidth - anchor.right : anchor.right - boundedWidth;
      const clampedStart = Math.min(Math.max(EDGE_GAP, requestedStart), Math.max(EDGE_GAP, viewportWidth - boundedWidth - EDGE_GAP));
      setPosition({ top, left: dir === "ltr" ? clampedStart : undefined, right: dir === "rtl" ? clampedStart : undefined, width: boundedWidth, maxHeight: Math.max(160, viewportHeight - top - EDGE_GAP) });
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
  }, [anchorRef, dir, open, width]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !panelRef.current?.contains(target) && !anchorRef.current?.contains(target)) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [anchorRef, onClose, open]);

  if (!open || !position || typeof document === "undefined") return null;
  const style: CSSProperties = { position: "fixed", top: position.top, left: position.left, right: position.right, width: position.width, maxHeight: position.maxHeight, zIndex };
  return createPortal(<div ref={panelRef} id={id} role={role} aria-modal={role === "dialog" ? false : undefined} aria-label={ariaLabel} dir={dir} style={style} className={className}>{children}</div>, document.body);
}
