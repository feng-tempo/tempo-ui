import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SimpleLineIcons } from "../../platform/FieldIcons.web";
import {
  closeDropdownPanel,
  openDropdownPanel,
  updateDropdownPanelContent,
} from "./Overlay";
import CheckBox from "../CheckBox";
import FieldClearButton from "./FieldClearButton";
import type { RichDropdownItem } from "../RichDropDown";
import {
  getNextMultiSelection,
  isMultiSelectionRemovalDisabled,
} from "./multiSelection";

export type MultiDropdownFieldProps = {
  value?: Array<RichDropdownItem | string> | null;
  onChange?: (value: RichDropdownItem[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  options?: RichDropdownItem[];
  placeholder?: string;
  style?: any;
  disabled?: boolean;
  minimumSelection?: number;
  maximumSelection?: number;
  triggerLabel?: string;
  triggerAppearance?: "field" | "button";
  triggerIcon?: React.ComponentProps<typeof SimpleLineIcons>["name"];
  popupWidth?: number;
  selectionMode?: "multiple" | "single";
  isLoading?: boolean;
};

function getWebElement(value: unknown): HTMLElement | null {
  return Platform.OS === "web" && value instanceof HTMLElement ? value : null;
}

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

export default function MultiDropdownField({
  value,
  onChange,
  onFocus,
  onBlur,
  options = [],
  placeholder,
  style,
  disabled = false,
  minimumSelection = 0,
  maximumSelection,
  triggerLabel,
  triggerAppearance = "field",
  triggerIcon,
  popupWidth,
  selectionMode = "multiple",
  isLoading = false,
}: MultiDropdownFieldProps) {
  const requiredSelectionCount = Math.max(
    0,
    Math.floor(minimumSelection),
  );
  const [open, setOpen] = useState(false);
  const [triggerFocused, setTriggerFocused] = useState(false);
  const [selectedItems, setSelectedItems] = useState<RichDropdownItem[]>(() =>
    normalizeSelected(value, options)
  );
  const wrapperRef = useRef<View>(null);
  const openRef = useRef(false);

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    setSelectedItems(normalizeSelected(value, options));
  }, [options, value]);

  const selectedValues = useMemo(
    () => new Set(selectedItems.map((item) => item.value)),
    [selectedItems]
  );

  const setDropdownOpen = useCallback((nextOpen: boolean) => {
    openRef.current = nextOpen;
    setOpen(nextOpen);
  }, []);

  const commitItems = useCallback((nextItems: RichDropdownItem[]) => {
    setSelectedItems(nextItems);
    onChange?.(nextItems);
  }, [onChange]);

  const toggleOption = useCallback((option: RichDropdownItem) => {
    if (disabled || isLoading) return;
    if (selectionMode === "single") {
      commitItems([option]);
      if (isWeb) {
        closeDropdownPanel();
      } else {
        setDropdownOpen(false);
        setTriggerFocused(false);
        onBlur?.();
      }
      return;
    }
    const nextItems = getNextMultiSelection(
      selectedItems,
      option,
      requiredSelectionCount,
      maximumSelection,
    );
    if (nextItems === selectedItems) return;
    commitItems(nextItems);
  }, [
    commitItems,
    disabled,
    isLoading,
    isWeb,
    maximumSelection,
    onBlur,
    requiredSelectionCount,
    selectedItems,
    selectionMode,
    setDropdownOpen,
  ]);

  const clearSelection = useCallback((event?: any) => {
    if (disabled || isLoading || requiredSelectionCount > 0) return;
    event?.stopPropagation?.();
    event?.preventDefault?.();
    commitItems([]);
  }, [commitItems, disabled, isLoading, requiredSelectionCount]);

  const handlePanelClose = useCallback(() => {
    setDropdownOpen(false);
    setTriggerFocused(false);
    onBlur?.();
  }, [onBlur, setDropdownOpen]);

  const renderPanelContent = useCallback(
    (close: () => void, placement: "bottom" | "top") => (
      <View style={[styles.globalDropdownPanel, style?.dropdown]}>
        <MultiDropdownPanelContent
          options={options}
          selectedValues={selectedValues}
          minimumSelection={requiredSelectionCount}
          selectionMode={selectionMode}
          placement={placement}
          onToggle={toggleOption}
          onClose={close}
        />
      </View>
    ),
    [
      options,
      requiredSelectionCount,
      selectedValues,
      selectionMode,
      style,
      toggleOption,
    ]
  );

  const getAnchor = () => {
    return getWebElement(wrapperRef.current);
  };

  const openPanel = useCallback(() => {
    if (!isWeb) return;
    openDropdownPanel({
      id: "multiDropdown",
      anchorRef: getAnchor(),
      collision: true,
      preferredWidth: popupWidth,
      widthMode: popupWidth ? "content" : "matchAnchor",
      onClose: handlePanelClose,
      content: renderPanelContent,
    });
  }, [handlePanelClose, isWeb, popupWidth, renderPanelContent]);

  const handleOpen = () => {
    if (disabled || isLoading) return;
    if (isWeb) {
      if (openRef.current) {
        closeDropdownPanel();
        setDropdownOpen(false);
        setTriggerFocused(false);
        onBlur?.();
        return;
      }
      setDropdownOpen(true);
      setTriggerFocused(true);
      onFocus?.();
      openPanel();
      return;
    }
    const nextOpen = !openRef.current;
    setDropdownOpen(nextOpen);
    setTriggerFocused(nextOpen);
    if (nextOpen) onFocus?.();
    else onBlur?.();
  };

  const handleBlur = () => {
    if (isWeb && openRef.current) return;
    setTriggerFocused(false);
    onBlur?.();
  };

  useEffect(() => {
    if (!isWeb || !open) return;
    updateDropdownPanelContent("multiDropdown", renderPanelContent);
  }, [isWeb, open, renderPanelContent]);

  const label =
    triggerLabel ??
    (selectedItems.length > 2
      ? `${selectedItems.length} items selected`
      : selectedItems.length
        ? selectedItems.map((item) => item.label).join(", ")
        : placeholder || "Select");
  const supportsClearButton = !triggerLabel && requiredSelectionCount === 0;
  const hasClearButton = Boolean(
    supportsClearButton &&
      selectedItems.length &&
      !disabled &&
      !isLoading,
  );

  return (
    <View style={styles.controlRow}>
      <View
        ref={wrapperRef}
        style={[
          styles.wrapper,
          triggerAppearance === "button" && styles.dropdownButtonWrapper,
          style?.wrapper,
        ]}
      >
        <Pressable
          style={({ hovered, pressed }: any) => [
            styles.button,
            triggerAppearance === "button" && styles.dropdownButton,
            triggerAppearance === "button" &&
              !disabled &&
              (hovered || triggerFocused || open) &&
              styles.dropdownButtonHovered,
            triggerAppearance === "button" &&
              !disabled &&
              pressed &&
              styles.dropdownButtonPressed,
            disabled && styles.buttonDisabled,
            style,
          ]}
          onPress={handleOpen}
          onFocus={() => {
            setTriggerFocused(true);
            onFocus?.();
          }}
          onBlur={handleBlur}
          disabled={disabled || isLoading}
          accessibilityLabel={triggerLabel ?? label}
          accessibilityState={{ disabled, busy: isLoading }}
        >
          {triggerIcon ? (
            <SimpleLineIcons
              name={triggerIcon}
              style={[
                styles.triggerIcon,
                triggerAppearance === "button" && styles.dropdownButtonIcon,
              ]}
            />
          ) : null}
          <Text
            style={[
              styles.buttonText,
              triggerAppearance === "button" && styles.dropdownButtonText,
              !triggerLabel && !selectedItems.length && styles.placeholderText,
              disabled && styles.buttonTextDisabled,
              style?.buttonText,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
          {!disabled && !isLoading ? (
            <SimpleLineIcons
              name="arrow-down"
              style={[
                styles.dropdownArrow,
                triggerAppearance === "button" && styles.dropdownButtonArrow,
              ]}
            />
          ) : null}
        </Pressable>

        {isLoading ? (
          <View pointerEvents="none" style={styles.loadingOverlay}>
            <ActivityIndicator />
          </View>
        ) : null}

        {open && !isWeb ? (
          <View
            style={[
              styles.dropdown,
              popupWidth ? { width: popupWidth, right: undefined } : undefined,
              style?.dropdown,
            ]}
          >
            <MultiDropdownPanelContent
              options={options}
              selectedValues={selectedValues}
              minimumSelection={requiredSelectionCount}
              selectionMode={selectionMode}
              placement="bottom"
              onToggle={toggleOption}
              onClose={() => setDropdownOpen(false)}
            />
          </View>
        ) : null}
      </View>

      {supportsClearButton ? (
        <FieldClearButton
          accessibilityLabel="Clear selections"
          disabled={!hasClearButton}
          onPress={clearSelection}
        />
      ) : null}
    </View>
  );
}

function MultiDropdownPanelContent({
  options,
  selectedValues,
  minimumSelection,
  selectionMode,
  placement = "bottom",
  onToggle,
  onClose,
}: {
  options: RichDropdownItem[];
  selectedValues: Set<any>;
  minimumSelection: number;
  selectionMode: "multiple" | "single";
  placement?: "bottom" | "top";
  onToggle: (option: RichDropdownItem) => void;
  onClose: () => void;
}) {
  const [searchKey, setSearchKey] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const searchInputRef = useRef<TextInput | null>(null);
  const optionRefs = useRef<(View | null)[]>([]);
  const isWeb = Platform.OS === "web";

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchKey.toLowerCase())
  );

  useEffect(() => {
    if (!filteredOptions.length) setHighlightIndex(-1);
    else setHighlightIndex((current) => Math.min(Math.max(current, 0), filteredOptions.length - 1));
  }, [filteredOptions.length]);

  useEffect(() => {
    if (!isWeb) return;
    const node = getWebElement(searchInputRef.current);
    if (!node) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightIndex((current) => Math.max(current - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const option = filteredOptions[highlightIndex] ?? filteredOptions[0];
        if (option) onToggle(option);
      } else if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    node.addEventListener("keydown", handler);
    return () => node.removeEventListener("keydown", handler);
  }, [filteredOptions, highlightIndex, isWeb, onClose, onToggle]);

  useEffect(() => {
    if (!isWeb || highlightIndex < 0) return;
    const node = getWebElement(optionRefs.current[highlightIndex]);
    if (node) node.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, isWeb]);

  const searchBox = (
    <View>
      <TextInput
        ref={searchInputRef}
        placeholder="Select existing..."
        style={styles.dropdownSearchBar}
        value={searchKey}
        onChangeText={setSearchKey}
        autoFocus
      />
    </View>
  );

  const optionList = (
    <View style={styles.dropdownOptionsCtn}>
      {filteredOptions.length ? filteredOptions.map((option, index) => {
        const selected = selectedValues.has(option.value);
        const removalDisabled = isMultiSelectionRemovalDisabled(
          selected,
          selectedValues.size,
          minimumSelection,
        );
        return selectionMode === "single" ? (
          <Pressable
            key={String(option.value)}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            style={({ hovered, pressed }: any) => [
              styles.option,
              selected && styles.optionSelected,
              index === highlightIndex && styles.optionFocused,
              hovered && styles.optionHovered,
              pressed && styles.optionPressed,
            ]}
            onPress={() => onToggle(option)}
          >
            <Text style={styles.optionText} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        ) : (
          <View
            key={String(option.value)}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            style={[
              styles.option,
              selected && styles.optionSelected,
              index === highlightIndex && styles.optionFocused,
            ]}
          >
            <CheckBox
              value={selected}
              label={option.label}
              disabled={removalDisabled}
              onChange={() => onToggle(option)}
              containerStyle={styles.checkboxControl}
              labelStyle={styles.optionText}
            />
          </View>
        );
      }) : (
        <View style={styles.option}>
          <Text style={styles.optionText}>No options</Text>
        </View>
      )}
    </View>
  );

  return (
    <View>
      {placement === "top" ? optionList : searchBox}
      {placement === "top" ? searchBox : optionList}
    </View>
  );
}

const styles = StyleSheet.create<any>({
  controlRow: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "stretch",
  },
  wrapper: {
    flex: 1,
    minWidth: 0,
    position: "relative",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    right: 8,
    top: "50%",
    marginTop: -10,
  },
  dropdownButtonWrapper: {
    height: 30,
    alignSelf: "flex-start",
  },
  button: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: "#a0a0a0",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: "#fafafa",
  },
  dropdownButton: {
    width: "auto",
    height: 30,
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 0,
    backgroundColor: "transparent",
    paddingLeft: 12,
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  dropdownButtonHovered: {
    backgroundColor: "#EEEEEE",
  },
  dropdownButtonPressed: {
    backgroundColor: "#E5E5E5",
  },
  buttonText: {
    fontSize: 13,
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 56,
    color: "#201f1e",
    userSelect: "none" as any,
  },
  placeholderText: {
    color: "#8A8886",
  },
  dropdownButtonText: {
    paddingLeft: 0,
    paddingRight: 20,
    color: "black",
    fontWeight: "400",
  },
  triggerIcon: {
    color: "#201f1e",
    fontSize: 13,
    marginRight: 8,
  },
  dropdownButtonIcon: {
    color: "#0061a3",
  },
  buttonTextDisabled: {
    color: "#323130",
  },
  dropdownArrow: {
    fontSize: 14,
    position: "absolute",
    right: 10,
    height: "100%",
    alignContent: "center",
  },
  dropdownButtonArrow: {
    color: "#0061a3",
    fontSize: 13,
  },
  dropdown: {
    position: "absolute",
    top: 28,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    boxShadow: "0 0 4px rgba(0,0,0,0.2)",
    elevation: 2,
    zIndex: 100,
  },
  globalDropdownPanel: {
    padding: 0,
    backgroundColor: "#fff",
  },
  dropdownSearchBar: {
    borderWidth: 1,
    paddingLeft: 8,
    paddingRight: 25,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 0,
    fontSize: 13,
    margin: 10,
    ...Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    }),
    borderColor: "#0061a3",
    boxShadow: "0 0 3px rgba(0, 97, 163, 0.7)",
  },
  dropdownOptionsCtn: {
    overflowY: "auto",
    maxHeight: "clamp(80px, calc(var(--tempo-dropdown-panel-max-height, 302px) - 52px), 250px)" as any,
  },
  option: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionSelected: {
    backgroundColor: "#f5f5f5",
  },
  optionFocused: {
    backgroundColor: "#eef6fb",
  },
  optionHovered: {
    backgroundColor: "#f3f2f1",
  },
  optionPressed: {
    backgroundColor: "#e5e5e5",
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
});
