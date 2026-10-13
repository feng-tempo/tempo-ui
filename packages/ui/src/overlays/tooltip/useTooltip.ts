import { useContext, useEffect, useId } from "react";
import { TooltipContext } from "./TooltipProvider";
import type { TooltipContent } from "./Tooltip.types";

export default function useTooltip(content?: TooltipContent, disabled = false) {
  const controller = useContext(TooltipContext);
  const owner = `tempo-tooltip-${useId()}`;
  const enabled = !disabled && !!(typeof content === "string" ? content : content?.title);
  useEffect(() => () => controller?.dismiss(owner), [controller, owner]);
  useEffect(() => { if (!enabled) controller?.dismiss(owner); }, [controller, owner, enabled]);
  return {
    id: enabled ? owner : undefined,
    show(anchor: HTMLElement | null) {
      if (enabled && content && anchor) controller?.show({ owner, anchor, content });
    },
    dismiss: () => controller?.dismiss(owner),
  };
}
