import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
const TEMPO_WEB_FONT_FAMILY = "Arial, sans-serif";
import { positionTooltip, type TooltipController } from "./tooltipController";
import type { TooltipState } from "./Tooltip.types";

const emptySnapshot = () => null;

export default function TooltipHost({ controller }: { controller: TooltipController }) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, emptySnapshot);
  const element = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<({ state: TooltipState } & ReturnType<typeof positionTooltip>) | null>(null);

  useEffect(() => () => controller.dismiss(), [controller]);
  useEffect(() => {
    if (!state || typeof document === "undefined") return;
    const dismiss = () => controller.dismiss();
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    // Listeners exist only while a request is pending/visible; no scan or polling.
    document.addEventListener("scroll", dismiss, true);
    document.addEventListener("pointerdown", dismiss, true);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", dismiss);
    window.addEventListener("blur", dismiss);
    return () => {
      document.removeEventListener("scroll", dismiss, true);
      document.removeEventListener("pointerdown", dismiss, true);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("blur", dismiss);
    };
  }, [controller, state?.request]);

  useLayoutEffect(() => {
    if (!state?.visible || !element.current) return;
    const anchor = state.request.anchor;
    if (!anchor.isConnected || !anchor.getClientRects().length) { controller.dismiss(state.request.owner); return; }
    setPosition({ state, ...positionTooltip(anchor.getBoundingClientRect(), element.current.getBoundingClientRect(), {
      width: document.documentElement.clientWidth, height: document.documentElement.clientHeight,
    }, typeof state.request.content === "string" ? "right" : state.request.content.placement) });
  }, [controller, state]);

  if (!state?.visible || typeof document === "undefined") return null;
  const content = typeof state.request.content === "string" ? { title: state.request.content } : state.request.content;
  return createPortal(<div ref={element} id={state.request.owner} role="tooltip" style={{
    position: "fixed", zIndex: 21000, pointerEvents: "none",
    left: position?.state === state ? position.left : 0,
    top: position?.state === state ? position.top : 0,
    visibility: position?.state === state ? "visible" : "hidden",
    width: "max-content", maxWidth: "min(280px, calc(100vw - 16px))",
    maxHeight: "calc(100vh - 16px)", boxSizing: "border-box",
    padding: "8px 12px", background: "#ffffff", color: "#323130",
    border: "1px solid #edebe9", borderRadius: 4, boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
    fontFamily: TEMPO_WEB_FONT_FAMILY, fontSize: 12, lineHeight: "18px", overflowWrap: "anywhere",
  }}>
    <span aria-hidden="true" style={{
      position: "absolute", width: 8, height: 8, background: "#ffffff",
      top: (position?.arrowTop ?? 10) - 4,
      ...(position?.side === "left"
        ? { right: -5, borderTop: "1px solid #edebe9", borderRight: "1px solid #edebe9" }
        : { left: -5, borderBottom: "1px solid #edebe9", borderLeft: "1px solid #edebe9" }),
      transform: "rotate(45deg)",
    }} />
    <div>{content.title}</div>
    {content.description ? <div style={{ marginTop: 4, color: "#605e5c" }}>{content.description}</div> : null}
  </div>, document.body);
}
