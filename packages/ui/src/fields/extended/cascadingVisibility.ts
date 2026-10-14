/** Shared runtime rule; authoring can show all configured levels. */
export function isCascadingThirdLevelVisible(
  tertiaryEnabled: boolean | undefined,
  tertiaryLabel: string | undefined,
  childCount: number,
  showAllLevels = false,
): boolean {
  return (tertiaryEnabled ?? !!tertiaryLabel) && (showAllLevels || childCount > 0);
}
