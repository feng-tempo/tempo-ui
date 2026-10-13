import type { TooltipRequest, TooltipState } from "./Tooltip.types";

/** Event-owned, single active request. Components never register during rendering. */
export function createTooltipController(delay = 400) {
  let state: TooltipState = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  const dismiss = (owner?: string) => {
    if (owner && state?.request.owner !== owner) return;
    clearTimeout(timer);
    timer = undefined;
    if (state) { state = null; emit(); }
  };
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    show(request: TooltipRequest) {
      if (!request.anchor.isConnected) return;
      clearTimeout(timer);
      state = { request, visible: false };
      emit();
      timer = setTimeout(() => {
        timer = undefined;
        if (!request.anchor.isConnected) { dismiss(request.owner); return; }
        state = { request, visible: true };
        emit();
      }, delay);
    },
    dismiss,
  };
}
export type TooltipController = ReturnType<typeof createTooltipController>;

/** One measurement on opening; scrolling/resize dismiss instead of tracking. */
export function positionTooltip(
  anchor: { left: number; right: number; top: number; bottom: number },
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  preferred: "left" | "right" = "right",
) {
  const edge = 8, gap = 10;
  const space = { right: viewport.width - anchor.right - edge - gap, left: anchor.left - edge - gap };
  const opposite = preferred === "right" ? "left" : "right";
  const side = space[preferred] >= size.width || space[preferred] >= space[opposite] ? preferred : opposite;
  const left = Math.max(edge, Math.min(side === "right" ? anchor.right + gap : anchor.left - gap - size.width, viewport.width - size.width - edge));
  const top = Math.max(edge, Math.min((anchor.top + anchor.bottom - size.height) / 2, viewport.height - size.height - edge));
  const arrowTop = Math.max(10, Math.min((anchor.top + anchor.bottom) / 2 - top, size.height - 10));
  return { left, top, side, arrowTop };
}
