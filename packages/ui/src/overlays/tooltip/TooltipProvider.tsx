import { createContext, useState, type ReactNode } from "react";
import { createTooltipController, type TooltipController } from "./tooltipController";
import TooltipHost from "./TooltipHost";

export const TooltipContext = createContext<TooltipController | null>(null);

export default function TooltipProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(() => createTooltipController());
  return <TooltipContext.Provider value={controller}>
    {children}
    <TooltipHost controller={controller} />
  </TooltipContext.Provider>;
}
