import { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CheckBox from "./CheckBox";
import type { RichDropdownItem } from "./RichDropDown";
import {
  getNextMultiSelection,
  isMultiSelectionRemovalDisabled,
} from "./multiSelection";

export type MultiCheckboxFieldProps = {
  value?: Array<RichDropdownItem | string> | null;
  onChange?: (value: RichDropdownItem[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options?: RichDropdownItem[];
  style?: any;
  disabled?: boolean;
  minimumSelection?: number;
};

function getOptionValue(value: any) {
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value;
}

function normalizeSelected(
  value: Array<RichDropdownItem | string> | null | undefined,
  options: RichDropdownItem[]
) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const itemValue = getOptionValue(item);
      const option = options.find((opt) => opt.value === itemValue);
      if (option) return option;
      if (item && typeof item === "object" && "label" in item) return item as RichDropdownItem;
      return undefined;
    })
    .filter((item): item is RichDropdownItem => Boolean(item));
}

export default function MultiCheckboxField({
  value,
  onChange,
  onFocus,
  onBlur,
  options = [],
  style,
  disabled = false,
  minimumSelection = 0,
}: MultiCheckboxFieldProps) {
  const requiredSelectionCount = Math.max(
    0,
    Math.floor(minimumSelection),
  );
  const [selectedItems, setSelectedItems] = useState<RichDropdownItem[]>(() =>
    normalizeSelected(value, options)
  );
  const [focused, setFocused] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<View>(null);

  useEffect(() => {
    setSelectedItems(normalizeSelected(value, options));
  }, [options, value]);

  const selectedValues = useMemo(
    () => new Set(selectedItems.map((item) => item.value)),
    [selectedItems]
  );

  const setGroupFocus = () => {
    if (disabled) return;
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    if (!focused) {
      setFocused(true);
      onFocus?.();
    }
  };

  const handleBlur = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => {
      const node =
        Platform.OS === "web" && wrapperRef.current instanceof HTMLElement
          ? wrapperRef.current
          : null;
      const activeElement = Platform.OS === "web" ? document.activeElement : null;
      if (node && activeElement instanceof HTMLElement && node.contains(activeElement)) {
        return;
      }
      setFocused(false);
      onBlur?.();
    }, 0);
  };

  const toggleOption = (option: RichDropdownItem) => {
    if (disabled) return;
    const nextItems = getNextMultiSelection(
      selectedItems,
      option,
      requiredSelectionCount,
    );
    if (nextItems === selectedItems) return;
    setSelectedItems(nextItems);
    onChange?.(nextItems);
  };

  return (
    <View
      ref={wrapperRef}
      style={[
        styles.container,
        disabled && styles.containerDisabled,
        style,
      ]}
    >
      {options.map((option) => {
        const selected = selectedValues.has(option.value);
        const removalDisabled = isMultiSelectionRemovalDisabled(
          selected,
          selectedItems.length,
          requiredSelectionCount,
        );
        return (
          <View
            key={String(option.value)}
            style={styles.option}
          >
            <CheckBox
              value={selected}
              label={option.label}
              disabled={disabled || removalDisabled}
              onChange={() => toggleOption(option)}
              onFocus={setGroupFocus}
              onBlur={handleBlur}
              containerStyle={styles.checkboxControl}
              labelStyle={[
                styles.optionText,
                (disabled || removalDisabled) && styles.optionTextDisabled,
              ]}
            />
          </View>
        );
      })}
      {!options.length ? <Text style={styles.emptyText}>No options</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 6,
    ...Platform.select({
      web: {
        outlineStyle: "none" as any,
      },
    }),
  },
  containerDisabled: {
    opacity: 0.75,
  },
  option: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  checkboxControl: {
    flex: 1,
    minWidth: 0,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: "#201f1e",
  },
  optionTextDisabled: {
    color: "#323130",
  },
  emptyText: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 13,
    color: "#605e5c",
  },
});
