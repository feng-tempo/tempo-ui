import type { RichDropdownItem } from "./RichDropDown";

export function getNextMultiSelection(
  selectedItems: RichDropdownItem[],
  option: RichDropdownItem,
  minimumSelection = 0,
  maximumSelection?: number,
) {
  const minimum = Math.max(0, Math.floor(minimumSelection));
  const maximum = typeof maximumSelection === "number"
    ? Math.max(minimum, Math.floor(maximumSelection))
    : undefined;
  const selected = selectedItems.some((item) => item.value === option.value);
  if (selected && selectedItems.length <= minimum) return selectedItems;
  if (selected) {
    return selectedItems.filter((item) => item.value !== option.value);
  }
  if (maximum === 1) return [option];
  if (maximum !== undefined && selectedItems.length >= maximum) return selectedItems;
  return [...selectedItems, option];
}

export function isMultiSelectionRemovalDisabled(
  selected: boolean,
  selectedCount: number,
  minimumSelection = 0,
) {
  const minimum = Math.max(0, Math.floor(minimumSelection));
  return selected && selectedCount <= minimum;
}
