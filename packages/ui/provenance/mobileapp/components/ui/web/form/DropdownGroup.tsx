import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  findNodeHandle,
  TextInput,
} from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import FieldClearButton from "./FieldClearButton";

import {
  openDropdownPanel,
  closeDropdownPanel,
  updateDropdownPanelContent,
} from "@/components/ui/web/general/DropdownPanel";

type RichDropdownProps = {
  value?: RichDropdownItem;
  onChange?: (value: RichDropdownItem | null | undefined) => void;
  options?: RichDropdownItem[];
  placeholder?: string;
  style?: any;
  onFocus?: () => void;
  onBlur?: () => void;
  isLoading?: boolean;
  panelLoading?: boolean;
  onOpenPanel?: () => void;
  disabled?: boolean;
  clearable?: boolean;
};

export type RichDropdownItem = {
  label: string;
  value: any;
};

export default function RichDropDown({
  value,
  onChange,
  options,
  placeholder,
  style,
  onFocus,
  onBlur,
  isLoading,
  panelLoading,
  onOpenPanel,
  disabled = false,
  clearable = true,
}: RichDropdownProps) {
  const [open, setOpen] = useState(false);
  const [, setTriggerFocused] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<RichDropdownItem | undefined>(value);

  const wrapperRef = useRef<View>(null);
  const pressableRef = useRef<View>(null);
  const openRef = useRef(false);
  const closingBySelectRef = useRef(false); // distinguish close-by-select vs close-by-blur

  const isWeb = Platform.OS === "web";

  const setDropdownOpen = useCallback((nextOpen: boolean) => {
    openRef.current = nextOpen;
    setOpen(nextOpen);
  }, []);

  // keep selectedItem in sync with value prop
  useEffect(() => {
    setSelectedItem(value);
  }, [value]);

  const getAnchor = () => {
    let anchor: any = undefined;
    const node: any = findNodeHandle(wrapperRef.current);
    if (node instanceof HTMLElement) {
      anchor = node;
    } else if (node && (node as any).parentElement) {
      anchor = (node as any).parentElement;
    }
    return anchor;
  };

  const handleSelect = useCallback((option: RichDropdownItem, closeFn?: () => void) => {
    if (disabled) return;
    setSelectedItem(option);
    onChange?.(option);

    if (isWeb) {
      // mark that we’re closing due to a selection
      closingBySelectRef.current = true;

      if (closeFn) {
        closeFn();
      } else {
        closeDropdownPanel();
      }
      setDropdownOpen(false);
      setTriggerFocused(true);

      // refocus box so Tab goes to next field
      setTimeout(() => {
        const node: any = findNodeHandle(pressableRef.current);
        if (node instanceof HTMLElement) {
          node.focus();
        }
      }, 0);

      // do NOT call onBlur here; TabForm keeps highlight
    } else {
      setDropdownOpen(false);
      onBlur?.();
    }
  }, [disabled, onChange, isWeb, onBlur, setDropdownOpen]);

  const handleClear = useCallback((event?: any) => {
    if (disabled) return;

    event?.stopPropagation?.();
    event?.preventDefault?.();

    setSelectedItem(undefined);
    onChange?.(null);

    if (open) {
      closeDropdownPanel();
      setDropdownOpen(false);
    }
  }, [disabled, onChange, open, setDropdownOpen]);

  const renderPanelContent = useCallback(
    (close: () => void, placement: "bottom" | "top") => (
      <View style={[styles.globalDropdownPanel, style?.dropdown]}>
        <DropdownPanelContent
          options={options}
          selectedItem={selectedItem}
          style={style}
          placement={placement}
          onSelect={(opt) => handleSelect(opt, close)}
          onClose={close}
          isLoading={panelLoading ?? isLoading}
        />
      </View>
    ),
    [options, selectedItem, style, isLoading, panelLoading, handleSelect]
  );

  const openPanel = useCallback(() => {
    if (!isWeb) return;

    const anchor = getAnchor();

    openDropdownPanel({
      id: "richDropdown",
      anchorRef: anchor,
      collision: true,
      onClose: () => {
        setDropdownOpen(false);

        // closed due to selection -> skip blur
        if (closingBySelectRef.current) {
          closingBySelectRef.current = false;
          return;
        }

        // closed due to click outside / Esc -> real blur
        setTriggerFocused(false);
        onBlur?.();
      },
      content: renderPanelContent,
    });
  }, [isWeb, onBlur, renderPanelContent, setDropdownOpen]);

  const handleOpen = () => {
    if (disabled) return;

    if (isWeb) {
      if (open) {
        // toggle close -> treat as blur
        closeDropdownPanel();
        setDropdownOpen(false);
        setTriggerFocused(false);
        onBlur?.();
        return;
      }

      setDropdownOpen(true);
      setTriggerFocused(true);
      onFocus?.();
      onOpenPanel?.(); // async dropdown loads here
      openPanel();
      return;
    }

    // non-web inline mode
    if (!open) {
      setDropdownOpen(true);
      setTriggerFocused(true);
      onFocus?.();
      onOpenPanel?.();
    } else {
      setDropdownOpen(false);
      setTriggerFocused(false);
      onBlur?.();
    }
  };

  const handleFocus = () => {
    setTriggerFocused(true);
    onFocus?.();
  };

  const handleBlur = (e: any) => {
    if (isWeb) {
      // while panel is open, ignore blur (focus can move into panel/search)
      if (openRef.current) return;

      // panel is closed -> real blur
      setTriggerFocused(false);
      onBlur?.();
      return;
    }

    const nextFocus = e.relatedTarget as HTMLElement | null;
    const node: any = findNodeHandle(wrapperRef.current);
    if (
      node &&
      nextFocus &&
      node instanceof HTMLElement &&
      node.contains(nextFocus)
    ) {
      return;
    }
    setOpen(false);
    setTriggerFocused(false);
    onBlur?.();
  };
  const hasClearButton = Boolean(clearable && selectedItem && !isLoading && !disabled);
  const hasValue = Boolean(selectedItem?.label);

  const nodeId = findNodeHandle(wrapperRef.current);

  useEffect(() => {
    if (!isWeb || !open) return;

    updateDropdownPanelContent("richDropdown", renderPanelContent);
  }, [isWeb, open, renderPanelContent]);

  return (
    <View style={styles.controlRow}>
      <View
        ref={wrapperRef}
        // @ts-ignore
        data-node-id={nodeId}
        style={[styles.wrapper, style?.wrapper]}
      >
        <Pressable
          ref={pressableRef}
          style={() => [styles.button, disabled && styles.buttonDisabled, style]}
          onPress={handleOpen}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          accessibilityState={{ disabled }}
        >
          <Text
            style={[
              styles.buttonText,
              !hasValue && styles.placeholderText,
              disabled && styles.buttonTextDisabled,
              style?.buttonText,
            ]}
          >
            {selectedItem?.label || placeholder || "Select"}
          </Text>
          {!isLoading && !disabled && (
            <SimpleLineIcons name="arrow-down" style={styles.dropdownArrow} />
          )}
        </Pressable>

        {/* Inline dropdown only for non-web */}
        {open && !isWeb && (
          <View style={[styles.dropdown, style?.dropdown]}>
            <DropdownPanelContent
              options={options}
              selectedItem={selectedItem}
              style={style}
              placement="bottom"
              onSelect={(opt) => handleSelect(opt)}
              isLoading={panelLoading ?? isLoading}
            />
          </View>
        )}
      </View>

      {clearable ? (
        <FieldClearButton
          accessibilityLabel="Clear selection"
          disabled={!hasClearButton}
          onPress={handleClear}
        />
      ) : null}
    </View>
  );
}

type DropdownPanelContentProps = {
  options?: RichDropdownItem[];
  selectedItem?: RichDropdownItem;
  style?: any;
  placement?: "bottom" | "top";
  onSelect: (opt: RichDropdownItem) => void;
  onClose?: () => void;
  isLoading?: boolean;
};

function DropdownPanelContent({
  options,
  selectedItem,
  style,
  placement = "bottom",
  onSelect,
  onClose,
  isLoading,
}: DropdownPanelContentProps) {
  const [searchKey, setSearchKey] = useState("");
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const isWeb = Platform.OS === "web";
  const searchInputRef = useRef<TextInput | null>(null);
  const optionRefs = useRef<(View | null)[]>([]);

  const filteredOptions =
    options?.filter((opt) =>
      opt.label?.toLowerCase().includes(searchKey?.toLowerCase())
    ) ?? [];

  useEffect(() => {
    if (!filteredOptions.length) {
      setHighlightIndex(-1);
      return;
    }
    const idx = filteredOptions.findIndex(
      (o) => o.value === selectedItem?.value
    );
    setHighlightIndex(idx);
  }, [searchKey, options, selectedItem, filteredOptions.length]);

  const moveHighlight = (direction: 1 | -1) => {
    if (!filteredOptions.length) return;
    const lastIndex = filteredOptions.length - 1;

    setHighlightIndex((prev) => {
      if (prev === -1) {
        return direction === 1 ? 0 : lastIndex;
      }

      let next = prev + direction;
      if (next < 0) next = 0;
      if (next > lastIndex) next = lastIndex;
      return next;
    });
  };

  useEffect(() => {
    if (!isWeb) return;

    const node: any = findNodeHandle(searchInputRef.current);
    if (!node || !(node instanceof HTMLElement)) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveHighlight(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveHighlight(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
          onSelect(filteredOptions[highlightIndex]);
        } else if (filteredOptions.length > 0) {
          onSelect(filteredOptions[0]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      } else if (e.key === "Tab") {
        // disable Tab inside search bar
        e.preventDefault();
        e.stopPropagation();
      }
    };

    node.addEventListener("keydown", handler);
    return () => {
      node.removeEventListener("keydown", handler);
    };
  }, [isWeb, highlightIndex, filteredOptions, onSelect, onClose]);

  // Auto-scroll highlighted option into view on web
  useEffect(() => {
    if (!isWeb) return;
    if (highlightIndex < 0 || highlightIndex >= filteredOptions.length) return;

    const ref = optionRefs.current[highlightIndex];
    if (!ref) return;

    const node: any = findNodeHandle(ref);
    if (!node) return;

    const el: any = node instanceof HTMLElement ? node : null;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, filteredOptions.length, isWeb]);

  const searchBox = (
    <View>
      <TextInput
        ref={searchInputRef}
        placeholder="Select existing..."
        style={[styles.dropdownSearchBar]}
        onChangeText={setSearchKey}
        value={searchKey}
        autoFocus
      />
    </View>
  );

  const optionsList = (
    <View style={styles.dropdownOptionsCtn}>
      {isLoading ? (
        <View style={styles.option}>
          <Text style={style?.optionText}>Loading...</Text>
        </View>
      ) : !filteredOptions.length ? (
        <View style={styles.option}>
          <Text style={style?.optionText}>No options</Text>
        </View>
      ) : (
        filteredOptions.map((opt, idx) => (
          <Pressable
            key={idx}
            ref={(el) => {
              optionRefs.current[idx] = el;
            }}
            style={({ hovered, pressed }) => [
              styles.option,
              style?.option,
              opt.value === selectedItem?.value && styles.optionSelected,
              hovered && styles.optionHovered,
              pressed && styles.optionPressed,
              idx === highlightIndex && styles.optionFocused,
            ]}
            onPress={() => onSelect(opt)}
          >
            <Text style={styles.optionText}>{opt.label}</Text>
          </Pressable>
        ))
      )}
    </View>
  );

  const isTop = placement === "top";

  return (
    <View>
      {isTop ? optionsList : searchBox}
      {isTop ? searchBox : optionsList}
    </View>
  );
}

const styles = StyleSheet.create({
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
  button: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: "#A0A0A0",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: "#FAFAFA",
  },
  buttonText: {
    fontSize: 13,
    color: "#201f1e",
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 56,
    userSelect: "none",
  },
  placeholderText: {
    color: "#8A8886",
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

  dropdownOptionsCtn: {
    overflowY: "auto",
    maxHeight: "clamp(80px, calc(var(--tempo-dropdown-panel-max-height, 302px) - 52px), 250px)" as any,
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
  option: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionSelected: {
    backgroundColor: "#f5f5f5",
    borderColor: "#A0A0A0",
    borderWidth: 1,
  },
  optionHovered: {
    backgroundColor: "#f0f0f0",
  },
  optionPressed: {
    backgroundColor: "#E5E5E5",
  },
  optionFocused: {
    backgroundColor: "#e1f3ff",
  },
  optionText: {
    fontSize: 13,
  },
});
