import {useFieldAdapters} from "./FieldAdapters";
import ErrorPanel from "../../comments/support/ErrorPanel";
// app/components/ui/web/form/AsyncDropdown.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
  ImageStyle,
} from "react-native";
import RichDropdown, {
  RichDropdownItem,
} from "../RichDropDown";
import {
  AsyncDropdownConfig,
  
} from "./adapterTypes";

export type AsyncDropdownProps = {
  /** Same as RichDropdown: the selected item, not just a primitive value */
  value?: RichDropdownItem | null;
  onChange?: (value: RichDropdownItem | null | undefined) => void;

  placeholder?: string;
  style?: StyleProp<TextStyle | ViewStyle | ImageStyle>;
  onFocus?: () => void;
  onBlur?: () => void;

  asyncConfig?: AsyncDropdownConfig;
  reloadKey?: string | number;

  /**
   * Optional pre-known option for initial value.
   * (Kept for compatibility, but usually `value` already includes label/value.)
   */
  initialOption?: RichDropdownItem;
  disabled?: boolean;
};

export default function AsyncDropdown({
  value,
  onChange,
  placeholder,
  style,
  onFocus,
  onBlur,
  asyncConfig,
  reloadKey,
  initialOption,
  disabled = false,
}: AsyncDropdownProps) {
 const {loadDropdownPageFromConfig}=useFieldAdapters();
  const [options, setOptions] = useState<RichDropdownItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const effectivePlaceholder = placeholder ?? "Select";
  const hasConfig = !!asyncConfig?.endpoint;

  const resetState = useCallback(() => {
    setOptions([]);
    setErrorText(null);
    setHasLoaded(false);
    setInitialLoading(false);
  }, []);

  const loadFirstPage = useCallback(async () => {
    if (!asyncConfig?.endpoint) return;

    try {
      setInitialLoading(true);
      setErrorText(null);
      const result = await loadDropdownPageFromConfig(asyncConfig, 1);
      setOptions(result.options);
      setHasLoaded(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load options";
      setErrorText(msg);
    } finally {
      setInitialLoading(false);
    }
  }, [asyncConfig]);

  useEffect(() => {
    resetState();
  }, [resetState, reloadKey]);

  const dropdownOptions: RichDropdownItem[] = useMemo(() => {
    let list = [...options];

    const selected = value ?? initialOption;
    if (selected && !list.some((o) => o.value === selected.value)) {
      list = [selected, ...list];
    }

    return list;
  }, [options, value, initialOption]);

  const handleChange = useCallback(
    (item: RichDropdownItem | null | undefined) => {
      if (!item) {
        onChange?.(null);
        return;
      }

      onChange?.(item);
    },
    [onChange]
  );

  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleOpenPanel = useCallback(() => {
    if (disabled || !hasConfig) return;
    if (hasLoaded || initialLoading) return;
    loadFirstPage();
  }, [disabled, hasConfig, hasLoaded, initialLoading, loadFirstPage]);

  const isLoading = initialLoading;
  const panelLoading = hasConfig && (isLoading || !hasLoaded);

  return (
    <View style={styles.container}>
      <RichDropdown
        value={value ?? undefined}
        options={dropdownOptions}
        placeholder={effectivePlaceholder}
        style={style}
        onFocus={handleFocus}
        onBlur={onBlur}
        onChange={handleChange}
        isLoading={isLoading}
        panelLoading={panelLoading}
        onOpenPanel={handleOpenPanel}
        disabled={disabled || !hasConfig}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator />
        </View>
      )}

      {!!errorText && <ErrorPanel compact context={{ service: "Options", kind: "list" }} error={errorText} />}
    </View>
  );
}

const styles = StyleSheet.create<any>({
  container: {
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    right: 8,
    top: "50%",
    marginTop: -10,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#d9534f",
  },
});
