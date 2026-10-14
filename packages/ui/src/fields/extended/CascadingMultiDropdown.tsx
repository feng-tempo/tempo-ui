import React, { useMemo } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import MultiDropdownField from "./MultiDropdownField";
import type { RichDropdownItem } from "../RichDropDown";

export type CascadingMultiDropdownProps = {
  value?: Record<string, any> | null;
  onChange?: (value: Record<string, RichDropdownItem[]>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options?: RichDropdownItem[];
  primaryKey?: string;
  secondaryKey?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  placeholderPrimary?: string;
  placeholderSecondary?: string;
  style?: any;
  multiRowsStyle?: {
    layout?: "standard" | "stacked";
    inputGroup?: StyleProp<ViewStyle>;
    inputGroupControl?: StyleProp<ViewStyle>;
    error?: any;
    focus?: any;
  };
  disabled?: boolean;
};

function getOptionValue(value: any) {
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value;
}

function normalizeSelected(
  value: any,
  options: RichDropdownItem[]
) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const itemValue = getOptionValue(item);
      const option = options.find(
        (candidate) => String(candidate.value) === String(itemValue)
      );
      if (option) return option;
      if (item && typeof item === "object" && "label" in item) return item as RichDropdownItem;
      return undefined;
    })
    .filter((item): item is RichDropdownItem => Boolean(item));
}

export default function CascadingMultiDropdown({
  value,
  onChange,
  onFocus,
  onBlur,
  options = [],
  primaryKey = "primary",
  secondaryKey = "secondary",
  primaryLabel = "Primary",
  secondaryLabel = "Secondary",
  placeholderPrimary = "Select",
  placeholderSecondary = "Select",
  style,
  multiRowsStyle,
  disabled = false,
}: CascadingMultiDropdownProps) {
  const primaryItems = useMemo(
    () => normalizeSelected(value?.[primaryKey], options),
    [options, primaryKey, value]
  );
  const secondaryOptions = primaryItems;
  const secondaryItems = useMemo(
    () => normalizeSelected(value?.[secondaryKey], secondaryOptions),
    [secondaryKey, secondaryOptions, value]
  );
  const stacked = multiRowsStyle?.layout === "stacked";

  const emitChange = (
    nextPrimaryItems: RichDropdownItem[],
    nextSecondaryItems: RichDropdownItem[]
  ) => {
    if (disabled) return;
    onChange?.({
      ...(value ?? {}),
      [primaryKey]: nextPrimaryItems,
      [secondaryKey]: nextSecondaryItems,
    });
  };

  const handlePrimaryChange = (nextPrimaryItems: RichDropdownItem[]) => {
    const nextPrimaryValues = new Set(nextPrimaryItems.map((item) => String(item.value)));
    const nextSecondaryItems = secondaryItems.filter((item) =>
      nextPrimaryValues.has(String(item.value))
    );
    emitChange(nextPrimaryItems, nextSecondaryItems);
  };

  const handleSecondaryChange = (nextSecondaryItems: RichDropdownItem[]) => {
    emitChange(primaryItems, nextSecondaryItems);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.row, stacked && styles.rowStacked, multiRowsStyle?.inputGroup]}>
        <Text style={[styles.levelLabel, stacked && styles.levelLabelStacked]}>
          {primaryLabel}
        </Text>
        <View
          style={[
            styles.levelControl,
            stacked && styles.levelControlStacked,
            multiRowsStyle?.inputGroupControl,
          ]}
        >
          <MultiDropdownField
            value={primaryItems}
            options={options}
            placeholder={placeholderPrimary}
            onChange={handlePrimaryChange}
            onFocus={onFocus}
            onBlur={onBlur}
            style={[style, multiRowsStyle?.error, multiRowsStyle?.focus]}
            disabled={disabled}
          />
        </View>
      </View>
      <View style={styles.separator} />
      <View style={[styles.row, stacked && styles.rowStacked, multiRowsStyle?.inputGroup]}>
        <Text style={[styles.levelLabel, stacked && styles.levelLabelStacked]}>
          {!stacked ? <Text style={styles.indent} /> : null}
          {secondaryLabel}
        </Text>
        <View
          style={[
            styles.levelControl,
            stacked && styles.levelControlStacked,
            multiRowsStyle?.inputGroupControl,
          ]}
        >
          <MultiDropdownField
            value={secondaryItems}
            options={secondaryOptions}
            placeholder={placeholderSecondary}
            onChange={handleSecondaryChange}
            onFocus={onFocus}
            onBlur={onBlur}
            style={[style, multiRowsStyle?.error, multiRowsStyle?.focus]}
            disabled={disabled || !primaryItems.length}
          />
        </View>
      </View>
      {!stacked ? <View style={styles.cascadingLine} /> : null}
    </View>
  );
}

const styles = StyleSheet.create<any>({
  container: {
    position: "relative",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    position: "relative",
  },
  rowStacked: {
    flexDirection: "column",
    gap: 5,
  },
  levelLabel: {
    flex: 0.35,
    fontSize: 13,
    paddingTop: 4,
    userSelect: "none" as any,
  },
  levelControl: {
    flex: 0.65,
  },
  levelLabelStacked: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "100%",
    paddingTop: 0,
  },
  levelControlStacked: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "100%",
  },
  indent: {
    paddingLeft: 58,
  },
  separator: {
    marginTop: 20,
  },
  cascadingLine: {
    position: "absolute",
    top: 24,
    left: 2,
    width: 50,
    height: 37,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderLeftColor: "#666",
    borderBottomColor: "#666",
    borderStyle: "solid",
  },
});
