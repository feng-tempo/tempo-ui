export type TooltipContent = string | { title: string; description?: string; placement?: "left" | "right" };
export type TooltipRequest = {
  owner: string;
  anchor: HTMLElement;
  content: TooltipContent;
};
export type TooltipState = { request: TooltipRequest; visible: boolean } | null;
