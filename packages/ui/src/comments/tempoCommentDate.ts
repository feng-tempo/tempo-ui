const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function formatClock(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatCalendarDate(date: Date, now: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear()
      ? {}
      : { year: "numeric" as const }),
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatTempoCommentDate(
  value: string,
  now: Date = new Date(),
) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const elapsed = now.getTime() - date.getTime();
  // Newly received server timestamps can be slightly ahead of the browser clock.
  if (elapsed < -MINUTE_MS) return formatCalendarDate(date, now);
  if (elapsed < MINUTE_MS) return "Just now";
  if (elapsed < HOUR_MS) {
    const minutes = Math.floor(elapsed / MINUTE_MS);
    return `${minutes} min ago`;
  }
  if (elapsed < DAY_MS) {
    const hours = Math.floor(elapsed / HOUR_MS);
    return `${hours} hr ago`;
  }
  if (elapsed < 2 * DAY_MS) return `Yesterday at ${formatClock(date)}`;
  if (elapsed < 7 * DAY_MS) {
    return `${Math.floor(elapsed / DAY_MS)} days ago`;
  }
  return formatCalendarDate(date, now);
}
