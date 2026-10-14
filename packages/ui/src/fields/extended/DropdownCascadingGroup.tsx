import React, { useState } from "react";
type SetValueConfig={shouldValidate?:boolean;shouldDirty?:boolean;shouldTouch?:boolean};
import { formLabelTypography } from "./formLabelTypography";
import { isCascadingThirdLevelVisible } from './cascadingVisibility';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from "react-native";
import RichDropDown, {
  RichDropdownItem,
} from "../RichDropDown";

export type CascadeOption = RichDropdownItem & {
  children?: CascadeOption[];
};

// What we store in the form: [{label, value}, ...]
export type CascadeSelectionItem = {
  label: string;
  value: any;
};

export type CascadingDropdownProps = {
  // now the field value is an array of items or null
  value?: CascadeSelectionItem[] | null;
  onChange?: (val: CascadeSelectionItem[] | null) => void;

  groupLabel?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  tertiaryLabel?: string;
  tertiaryEnabled?: boolean;
  /** Designer displays configured levels before any parent values are selected. */
  showAllLevels?: boolean;
  primaryRequired?: boolean;
  secondaryRequired?: boolean;
  tertiaryRequired?: boolean;
  placeholderPrimary?: string;
  placeholderSecondary?: string;
  placeholderTertiary?: string;
  options?: CascadeOption[];
  primaryFieldName?: string;
  secondaryFieldName?: string;
  tertiaryFieldName?: string;
  autoSelectSingle?: boolean;
  getValues?: (key?: any) => any;
  setValue?: (key: string, value: any, options?: SetValueConfig) => void;
  onMappedChange?: (patch: Record<string, any>) => void;

  // single-row style (not used for multiRows, kept for compatibility)
  style?: StyleProp<ViewStyle>;

  multiRowsStyle?: {
    layout?: "standard" | "stacked";
    inputGroup?: StyleProp<ViewStyle>;
    inputGroupLabel?: StyleProp<TextStyle>;
    inputGroupControl?: StyleProp<ViewStyle>;
    error?: StyleProp<ViewStyle>;
    focus?: StyleProp<ViewStyle>;
  };

  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
};

function getOptionValue(value: any) {
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value;
}

function hasValue(value: any) {
  const optionValue = getOptionValue(value);
  return optionValue !== undefined && optionValue !== null && optionValue !== "";
}

function toSelectionItem(value: any): CascadeSelectionItem | null {
  if (!hasValue(value)) return null;
  if (value && typeof value === "object" && "value" in value) {
    return {
      label: String(value.label ?? value.value),
      value: value.value,
    };
  }

  return {
    label: String(value),
    value,
  };
}

export default function CascadingDropdown({
  value,
  onChange,
  style, // unused for multiRows
  multiRowsStyle,
  onFocus,
  onBlur,
  disabled = false,
  ...rest
}: CascadingDropdownProps) {
  const {
    groupLabel = "",
    primaryLabel = "Primary",
    secondaryLabel = "Secondary",
    tertiaryLabel,
    tertiaryEnabled,
    showAllLevels = false,
    primaryRequired = false,
    secondaryRequired = false,
    tertiaryRequired = false,
    placeholderPrimary = "Select...",
    placeholderSecondary = "Select...",
    placeholderTertiary = "Select...",
    options,
    primaryFieldName,
    secondaryFieldName,
    tertiaryFieldName,
    autoSelectSingle = false,
    getValues,
    setValue,
    onMappedChange,
  } = rest || {};

  const safeOptions: CascadeOption[] = options || [];
  const mappedFieldNames = [primaryFieldName, secondaryFieldName, tertiaryFieldName].filter(
    (fieldName): fieldName is string => Boolean(fieldName)
  );
  const controlled = mappedFieldNames.length > 0 || value !== undefined;
  const [localValue, setLocalValue] = useState<CascadeSelectionItem[] | null>(null);
  const selectionPath = mappedFieldNames.length
    ? mappedFieldNames.map((fieldName) => toSelectionItem(getValues?.(fieldName)))
    : controlled ? value : localValue;

  // which level currently has keyboard/mouse focus?
  const [focusedLevel, setFocusedLevel] = useState<number | null>(null);

  // Current form values/options own the rows; never paint a previous branch first.
  const selected: (CascadeOption | null)[] = [null, null, null];
  let currentOptions = safeOptions;
  for (let level = 0; level < Math.min(3, selectionPath?.length ?? 0); level++) {
    const item = selectionPath?.[level];
    if (!item) break;
    const found = currentOptions.find(option => String(option.value) === String(item.value));
    if (!found) break;
    selected[level] = found;
    currentOptions = found.children ?? [];
  }
  const levelOptions: CascadeOption[][] = [safeOptions, selected[0]?.children ?? [], selected[1]?.children ?? []];

  const labelList = [primaryLabel, secondaryLabel, tertiaryLabel || ""];
  const requiredList = [primaryRequired, secondaryRequired, tertiaryRequired];
  const placeholderList = [
    placeholderPrimary,
    placeholderSecondary,
    placeholderTertiary,
  ];

  // Authoring exposes the configured level; runtime follows the selected branch.
  const hasThirdLevel = isCascadingThirdLevelVisible(tertiaryEnabled, tertiaryLabel, selected[1]?.children?.length ?? 0, showAllLevels);
  const rowCount = hasThirdLevel ? 3 : 2;
  const stacked = multiRowsStyle?.layout === "stacked";

  // unified change handler per level
  const handleLevelChange =
    (level: number) =>
    (item: RichDropdownItem | null | undefined): void => {
      if (disabled) return;
      const node = item ? levelOptions[level].find(option => String(option.value) === String(item.value)) ?? null : null;

      // Build the next path for the existing mapped/controlled write boundary.
      const nextSelected: (CascadeOption | null)[] = [...selected];
      nextSelected[level] = node;
      for (let k = level + 1; k < 3; k++) {
        const children = nextSelected[k - 1]?.children ?? [];
        nextSelected[k] = autoSelectSingle && children.length === 1 ? children[0] : null;
      }
      if (!controlled) setLocalValue(nextSelected.filter((item): item is CascadeOption => !!item)
        .map(item => ({ label: item.label, value: item.value })));

      // Clear this level and anything below it.
      if (!node) {
        if (mappedFieldNames.length) {
          const patch = Object.fromEntries(
            mappedFieldNames.slice(level).map((fieldName) => [fieldName, null])
          );
          Object.entries(patch).forEach(([fieldName, nextValue]) =>
            setValue?.(fieldName, nextValue, onMappedChange ? { shouldValidate: false } : undefined)
          );
          onMappedChange?.(patch);
          return;
        }

        onChange?.(null);
        return;
      }

      // Return an array of { label, value } for all selected levels.
      const finalArray: CascadeSelectionItem[] = nextSelected
        .filter((n): n is CascadeOption => !!n)
        .map((n) => ({
          label: n.label,
          value: n.value,
        }));

      if (mappedFieldNames.length) {
        const patch = mappedFieldNames.reduce((result, fieldName, index) => {
          result[fieldName] = finalArray[index] ?? null;
          return result;
        }, {} as Record<string, any>);

        // The form validates the complete path after all mapped values are written.
        Object.entries(patch).forEach(([fieldName, nextValue]) =>
          setValue?.(fieldName, nextValue, onMappedChange ? { shouldValidate: false } : undefined)
        );
        onMappedChange?.(patch);
        return;
      }

      onChange?.(finalArray);
    };

  // build rows
  const rows = [];
  for (let level = 0; level < rowCount; level++) {
    const label = labelList[level];
    const required = requiredList[level];
    const placeholder = placeholderList[level];
    const opts = levelOptions[level];
    const selectedVal = selected[level];

    const levelDisabled =
      level === 0 ? false : !selected[level - 1] || opts.length === 0 || (autoSelectSingle && opts.length === 1);

    const labelText = (
      <>
        {label}
        {required ? <Text style={styles.required}>*</Text> : null}
      </>
    );

    const labelStyle = StyleSheet.flatten(multiRowsStyle?.inputGroupLabel) ?? {};

    const isLevelFocused = focusedLevel === level;

    rows.push(
      <React.Fragment key={`row-${level}`}>
        <View
          style={[
            styles.inputGroup,
            stacked && styles.inputGroupStacked,
            multiRowsStyle?.inputGroup,
          ]}
        >
          <View
            style={[
              styles.inputGroupLabel,
              stacked && styles.inputGroupLabelStacked,
              multiRowsStyle?.inputGroupLabel,
              styles.labelColumn,
            ]}
          >
            <View style={[styles.labelContent, { marginLeft: stacked ? 0 : level * 58 }]}>
              <Text style={[styles.labelText, {
                fontSize: labelStyle.fontSize ?? formLabelTypography.fontSize,
                color: labelStyle.color ?? formLabelTypography.color,
              }]}>{labelText}</Text>
              {showAllLevels && level === 2 ? <Text style={styles.conditionalBadge}>Conditional</Text> : null}
            </View>
            {!stacked && level < rowCount - 1 ? (
              <View style={styles.connectorTail} pointerEvents="none">
                <View style={[styles.cascadingLine, { left: level * 58 + 2 }]} />
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.inputGroupControl,
              stacked && styles.inputGroupControlStacked,
              multiRowsStyle?.inputGroupControl,
            ]}
          >
            <RichDropDown
              value={selectedVal || undefined}
              onChange={handleLevelChange(level)}
              options={opts}
              placeholder={placeholder}
              isLoading={false}
              // Only the focused level gets focus styling.
              // @ts-ignore if DropdownGroup's style type is narrower
              style={[
                multiRowsStyle?.error,
                isLevelFocused && multiRowsStyle?.focus,
              ]}
              // When a particular dropdown gets focus, remember its level
              // and also notify SingleForm so it can set focusedField
              // @ts-ignore
              onFocus={() => {
                setFocusedLevel(level);
                onFocus?.();
              }}
              // @ts-ignore
              onBlur={() => {
                setFocusedLevel((prev) => (prev === level ? null : prev));
                onBlur?.();
              }}
              // @ts-ignore if disabled not supported
              disabled={disabled || levelDisabled}
            />
          </View>
        </View>

        {/* separator between rows */}
        {level < rowCount - 1 && <View style={styles.separator} />}
      </React.Fragment>
    );
  }

  return (
    <View style={{ position: "relative" }}>
      {rows}
    </View>
  );
}

const styles = StyleSheet.create<any>({
  inputGroup: {
    flexDirection: "row",
    position: "relative",
  },
  inputGroupStacked: {
    flexDirection: "column",
    gap: 5,
  },
  inputGroupLabel: {
    flex: 0.35,
    paddingTop: 4,
    userSelect: "none" as any,
  },
  labelColumn: { minWidth: 0, alignSelf: "stretch" },
  labelContent: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", columnGap: 6, rowGap: 4, minWidth: 0 },
  labelText: { ...formLabelTypography, flexShrink: 1, minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere" } as any,
  conditionalBadge: { color: "#9a3412", backgroundColor: "#fff7ed", fontSize: 10, paddingHorizontal: 7, paddingVertical: 3, alignSelf: "flex-start" },
  connectorTail: { flex: 1, position: "relative" },
  required: {
    color: "#a4262c",
    paddingLeft: 3,
  },
  inputGroupControl: {
    flex: 0.65,
  },
  inputGroupLabelStacked: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "100%",
    paddingTop: 0,
  },
  inputGroupControlStacked: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "100%",
  },
  subLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  separator: {
    marginTop: 20,
  },
  cascadingLine: {
    position: "absolute",
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderLeftColor: "#666",
    borderBottomColor: "#666",
    borderStyle: "solid",
    top: 4,
    bottom: -30,
    width: 50,
  },
});
