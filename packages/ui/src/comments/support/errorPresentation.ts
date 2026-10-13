export type ErrorContext = {
  service?: string;
  component?: string;
  operation?: "load" | "check" | "render" | "save" | "submit" | "delete";
  kind?: "list" | "approval" | "summary" | "attachments" | "form" | "template" | "media";
};

/** Presentation only: no request interception, state mutation or automatic retry. */
export function resolveErrorPresentation(error: unknown, context: ErrorContext = {}) {
  const raw = error as { message?: string; status?: number; statusCode?: number; code?: string } | null;
  const details = typeof error === "string" ? error : typeof raw?.message === "string" ? raw.message : "";
  const status = raw?.status ?? raw?.statusCode ?? Number(details.match(/(?:status\s*:?\s*|http\S*\s+(?:error!?\s*)?)(\d{3})\b/i)?.[1]);
  const subject = context.kind === "list" && context.component
    ? (/\blist$/i.test(context.component.trim()) ? context.component.trim() : `the ${context.component.trim()} list`)
    : context.component ?? ({ list: "this list", approval: "this approval", summary: "this summary", attachments: "the attachments", form: "this form", template: "this template", media: "this preview" } as const)[context.kind!]
    ?? context.service ?? "this content";
  const operation = context.operation ?? "load";
  const verb = operation === "render" ? "display" : operation;
  let title = `Couldn't ${verb} ${subject}`;
  let message = "Please try again. If the problem continues, contact your administrator.";
  let retryable = operation === "load" || operation === "check";
  if (status === 401) {
    title = "Sign-in required"; message = `Sign in again to access ${subject}.`; retryable = false;
  } else if (status === 403) {
    title = "Access restricted"; message = `You don't have permission to access ${subject}. Contact your administrator if you need access.`; retryable = false;
  } else if (status === 404) {
    title = "Content unavailable"; message = `${subject.charAt(0).toUpperCase() + subject.slice(1)} could not be found. It may have been moved or removed.`; retryable = false;
  } else if (status === 409 || status === 412) {
    title = "This content has changed"; message = "Reload the latest version before making further changes."; retryable = operation === "load";
  } else if (status === 429) {
    message = "The service is busy. Wait a moment, then try again.";
  } else if (/failed to fetch|networkerror|network request failed|fetch failed|timeout|timed out/i.test(details) || raw?.code === "NETWORK_ERROR") {
    message = "Check your connection and try again.";
  } else if (operation === "render" || /required email value|binding|template.*(?:invalid|missing)|configuration_missing/i.test(details)) {
    message = `Some information needed to display ${subject} is missing or invalid. Ask the template owner to check its data and configuration.`;
    retryable = false;
  } else if (status >= 500) {
    message = `${context.service ?? "The service"} couldn't complete the request. Try again shortly.`;
  }
  return { title, message, details, retryable };
}
