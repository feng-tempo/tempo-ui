// SimpleDropDown.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  findNodeHandle,
  TextInput,
} from "react-native";
import { SimpleLineIcons } from "../../platform/FieldIcons.web";

import {
  openDropdownPanel,
  closeDropdownPanel,
} from "./Overlay";

export type SimpleDropdownItem = {
  label: string;
  value: any;
};

export type SimpleDropdownProps = {
  value?: SimpleDropdownItem;
  onChange?: (value: SimpleDropdownItem | null | undefined) => void;
  options?: SimpleDropdownItem[];
  placeholder?: string;
  style?: any;
  onFocus?: () => void;
  onBlur?: () => void;
  isLoading?: boolean;
  onOpenPanel?: () => void;
  allowClear?: boolean;
  disabled?: boolean;
};

export default function SimpleDropDown({
  value,
  onChange,
  options,
  placeholder,
  style,
  onFocus,
  onBlur,
  isLoading,
  onOpenPanel,
  allowClear = false,
  disabled = false,
}: SimpleDropdownProps) {
  const isWeb = Platform.OS === "web";

  const [open, setOpen] = useState(false);
  const [triggerHovered, setTriggerHovered] = useState(false);
  const [triggerFocused, setTriggerFocused] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<SimpleDropdownItem | undefined>(value);

  const list = useMemo(() => options ?? [], [options]);

  const panelIdRef = useRef(
    `simpleDropdown-${Math.random().toString(16).slice(2)}`
  );

  const lastOptionsRef = useRef<SimpleDropdownItem[] | undefined>(options);
  const lastValueRef = useRef<any>(value?.value);

  const wrapperRef = useRef<View>(null);
  const pressableRef = useRef<View>(null);
  const openRef = useRef(false);
  const closingBySelectRef = useRef(false);

  const setDropdownOpen = useCallback((nextOpen: boolean) => {
    openRef.current = nextOpen;
    setOpen(nextOpen);
  }, []);

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

  const focusTrigger = useCallback(() => {
    if (!isWeb) return;
    setTimeout(() => {
      const node: any = findNodeHandle(pressableRef.current);
      if (node instanceof HTMLElement) node.focus();
    }, 0);
  }, [isWeb]);

  const handleSelect = useCallback(
    (option: SimpleDropdownItem, closeFn?: () => void) => {
      setSelectedItem(option);
      onChange?.(option);

      if (isWeb) {
        closingBySelectRef.current = true;

        if (closeFn) closeFn();
        else closeDropdownPanel();

        setDropdownOpen(false);
        setTriggerFocused(true);
        focusTrigger();
      } else {
        setDropdownOpen(false);
        setTriggerFocused(false);
        onBlur?.();
      }
    },
    [isWeb, onChange, onBlur, focusTrigger, setDropdownOpen]
  );

  const openPanel = useCallback(
    (animate: boolean) => {
      if (!isWeb) return;

      const anchor = getAnchor();

      openDropdownPanel({
        id: panelIdRef.current,
        anchorRef: anchor,
        collision: true,
        animate,

        onClose: () => {
          setDropdownOpen(false);

          if (closingBySelectRef.current) {
            closingBySelectRef.current = false;
            return;
          }

          setTriggerFocused(false);
          onBlur?.();
        },

        content: (close, placement) => (
          <View style={[styles.globalDropdownPanel, style?.dropdown]}>
            <SimpleDropdownPanelContent
              options={list}
              selectedItem={selectedItem}
              style={style}
              placement={placement}
              isLoading={isLoading}
              onSelect={(opt) => handleSelect(opt, close)}
              onClose={close}
            />
          </View>
        ),
      });
    },
    [isWeb, list, selectedItem, style, onBlur, isLoading, handleSelect, setDropdownOpen]
  );

  const handleOpen = () => {
    if (disabled) return;

    if (isWeb) {
      if (open) {
        closeDropdownPanel();
        setDropdownOpen(false);
        setTriggerFocused(false);
        onBlur?.();
        return;
      }

      setDropdownOpen(true);
      setTriggerFocused(true);
      onFocus?.();
      onOpenPanel?.();

      openPanel(true);
      focusTrigger();
      return;
    }

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

  const handleClear = (event?: any) => {
    if (disabled) return;

    event?.stopPropagation?.();
    event?.preventDefault?.();
    setSelectedItem(undefined);
    onChange?.(null);

    if (open) {
      closeDropdownPanel();
      setDropdownOpen(false);
    }
  };

  const handleFocus = () => {
    if (disabled) return;

    setTriggerFocused(true);
    onFocus?.();
  };

  const handleBlur = (e: any) => {
    if (isWeb) {
      if (openRef.current) return;
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

    setDropdownOpen(false);
    setTriggerFocused(false);
    onBlur?.();
  };

  // refresh content WITHOUT replaying animation (options/selection changes)
  useEffect(() => {
    if (!isWeb || !open) return;

    const optionsChanged = lastOptionsRef.current !== options;
    const valueChanged = lastValueRef.current !== selectedItem?.value;

    if (!optionsChanged && !valueChanged) return;

    lastOptionsRef.current = options;
    lastValueRef.current = selectedItem?.value;

    openPanel(false);
  }, [isWeb, open, options, selectedItem?.value, openPanel]);

  const hasClearButton = Boolean(allowClear && selectedItem && !isLoading);
  const showClearButton = hasClearButton && (triggerHovered || triggerFocused || open);
  const hasValue = Boolean(selectedItem?.label);

  return (
    <View
      ref={wrapperRef}
      style={[styles.wrapper, style?.wrapper]}
    >
      <Pressable
        ref={pressableRef}
        style={() => [styles.button, disabled && styles.buttonDisabled, style]}
        onPress={handleOpen}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onHoverIn={() => setTriggerHovered(true)}
        onHoverOut={() => setTriggerHovered(false)}
        {...(isWeb ? ({ tabIndex: disabled ? -1 : 0 } as any) : null)}
      >
        <Text
          style={[
            styles.buttonText,
            allowClear && styles.buttonTextWithClear,
            !hasValue && styles.placeholderText,
            style?.buttonText,
          ]}
        >
          {selectedItem?.label || placeholder || "Select"}
        </Text>

        {hasClearButton && !disabled && (
          <Pressable
            tabIndex={-1}
            focusable={false}
            style={({ hovered, pressed }: any) => [
              styles.clearIconCtn,
              !showClearButton && styles.clearIconHidden,
              hovered && styles.clearIconHovered,
              pressed && styles.clearIconPressed,
            ]}
            onHoverIn={() => setTriggerHovered(true)}
            onPress={handleClear}
          >
            <SimpleLineIcons name="close" style={styles.clearIcon} />
          </Pressable>
        )}

        {!isLoading && !disabled && (
          <SimpleLineIcons name="arrow-down" style={styles.dropdownArrow} />
        )}
      </Pressable>

      {open && !isWeb && (
        <View style={[styles.dropdown, style?.dropdown]}>
          <SimpleDropdownPanelContent
            options={list}
            selectedItem={selectedItem}
            style={style}
            placement="bottom"
            isLoading={isLoading}
            onSelect={(opt) => handleSelect(opt)}
          />
        </View>
      )}
    </View>
  );
}

export type PanelProps = {
  options: SimpleDropdownItem[];
  selectedItem?: SimpleDropdownItem;
  style?: any;
  placement?: "bottom" | "top";
  onSelect: (opt: SimpleDropdownItem) => void;
  onClose?: () => void;
  isLoading?: boolean;
};

function SimpleDropdownPanelContent({
  options,
  selectedItem,
  style,
  placement = "bottom",
  onSelect,
  onClose,
  isLoading,
}: PanelProps) {
  const isWeb = Platform.OS === "web";

  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [highlightSource, setHighlightSource] = useState<"keyboard" | "hover">(
    "keyboard"
  );

  // refs to avoid stale closures in DOM key handler
  const highlightSourceRef = useRef<"keyboard" | "hover">("keyboard");
  useEffect(() => {
    highlightSourceRef.current = highlightSource;
  }, [highlightSource]);

  const keyInputRef = useRef<TextInput | null>(null);

  const [hoverEnabled, setHoverEnabled] = useState(true);
  const hoverTimerRef = useRef<any>(null);

  const optionRefs = useRef<(View | null)[]>([]);

  const getSelectedIndex = useCallback(() => {
    if (!options.length) return -1;
    const idx = options.findIndex((o) => o.value === selectedItem?.value);
    return idx >= 0 ? idx : 0;
  }, [options, selectedItem?.value]);

  // initial highlight = selected option
  useEffect(() => {
    if (!options.length) {
      setHighlightIndex(-1);
      return;
    }
    setHighlightIndex(getSelectedIndex());
    setHighlightSource("keyboard");
  }, [options, selectedItem?.value, getSelectedIndex]);

  // focus invisible input on open/mount
  useEffect(() => {
    if (!isWeb) return;

    setHoverEnabled(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoverEnabled(true), 220);

    setTimeout(() => {
      const node: any = findNodeHandle(keyInputRef.current);
      if (node instanceof HTMLElement) node.focus();
    }, 0);

    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [isWeb]);

  // ✅ NEW: keyboard move base always starts from SELECTED when coming from hover
  const moveHighlight = useCallback(
    (direction: 1 | -1) => {
      if (!options.length) return;
      const lastIndex = options.length - 1;

      setHighlightIndex((prev) => {
        const selectedIdx = getSelectedIndex();

        const base =
          highlightSourceRef.current === "hover"
            ? selectedIdx
            : prev >= 0
            ? prev
            : selectedIdx;

        let next = base + direction;
        if (next < 0) next = 0;
        if (next > lastIndex) next = lastIndex;
        return next;
      });
    },
    [options.length, getSelectedIndex]
  );

  // key handling
  useEffect(() => {
    if (!isWeb) return;

    const node: any = findNodeHandle(keyInputRef.current);
    if (!node || !(node instanceof HTMLElement)) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightSource("keyboard");
        moveHighlight(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightSource("keyboard");
        moveHighlight(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!options.length) return;
        const idx = highlightIndex >= 0 ? highlightIndex : getSelectedIndex();
        const opt = options[idx];
        if (opt) onSelect(opt);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      } else if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    node.addEventListener("keydown", handler);
    return () => node.removeEventListener("keydown", handler);
  }, [isWeb, highlightIndex, options, onSelect, onClose, moveHighlight, getSelectedIndex]);

  // scroll highlighted item into view
  useEffect(() => {
    if (!isWeb) return;
    if (highlightIndex < 0 || highlightIndex >= options.length) return;

    const ref = optionRefs.current[highlightIndex];
    if (!ref) return;

    const node: any = findNodeHandle(ref);
    const el: any = node instanceof HTMLElement ? node : null;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, options.length, isWeb]);

  return (
    <View>
      {isWeb && (
        <TextInput
          ref={keyInputRef}
          style={styles.invisibleKeyInput as any}
          autoFocus
          value=""
          onChangeText={() => {}}
        />
      )}

      <View style={styles.dropdownOptionsCtn}>
        {!options.length ? (
          <View style={styles.option}>
            <Text style={style?.optionText}>
              {isLoading ? "Loading..." : "No options"}
            </Text>
          </View>
        ) : (
          options.map((opt, idx) => (
            <Pressable
              key={idx}
              ref={(el) => {
                optionRefs.current[idx] = el;
              }}
              style={({ hovered, pressed }: any) => [
                style?.option,
                styles.option,

                opt.value === selectedItem?.value && styles.optionSelected,

                hovered && styles.optionHovered,
                pressed && styles.optionPressed,

                highlightSource === "keyboard" &&
                  idx === highlightIndex &&
                  styles.optionFocused,
              ]}
              onPress={() => onSelect(opt)}
              onHoverIn={() => {
                if (!hoverEnabled) return;
                setHighlightSource("hover");
                setHighlightIndex(idx); // keep Enter selecting hovered item
              }}
            >
              <Text style={styles.optionText}>{opt.label}</Text>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create<any>({
  wrapper: {
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
        outlineWidth: 0,
        outlineStyle: "none",
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
    paddingRight: 30,
    userSelect: "none",
  },
  placeholderText: {
    color: "#8A8886",
  },
  buttonTextWithClear: {
    paddingRight: 48,
  },
  clearIconCtn: {
    position: "absolute",
    right: 32,
    top: 0,
    height: "100%",
    justifyContent: "center",
  },
  clearIcon: {
    fontSize: 12,
    height: "100%",
    paddingLeft: 7,
    paddingRight: 7,
    alignContent: "center",
  },
  clearIconHidden: {
    opacity: 0,
    pointerEvents: "none",
  },
  clearIconHovered: {
    backgroundColor: "#f0f0f0",
  },
  clearIconPressed: {
    backgroundColor: "#E5E5E5",
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
    maxHeight: "clamp(80px, calc(var(--tempo-dropdown-panel-max-height, 302px) - 12px), 250px)" as any,
  },

  option: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    ...(Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
        boxShadow: "none",
      },
    }) as any),
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

  invisibleKeyInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    left: -1000,
    top: -1000,
    ...(Platform.select({
      web: {
        outlineWidth: 0,
      },
    }) as any),
  },
});
