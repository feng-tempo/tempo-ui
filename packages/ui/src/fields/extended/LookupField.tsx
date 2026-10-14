import {useFieldAdapters} from "./FieldAdapters";
import ErrorPanel from "../../comments/support/ErrorPanel";
import InfoBox from './InfoBox';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  findNodeHandle,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SimpleLineIcons } from "../../platform/FieldIcons.web";
import FieldClearButton from "./FieldClearButton";
import {
  closeDropdownPanel,
  openDropdownPanel,
} from "./Overlay";
import {
  
  LookupDisplayColumn,
  LookupFieldConfig,
  LookupItem,
} from "./adapterTypes";

export type LookupFieldProps = {
  value?: LookupItem | string | null;
  onChange?: (value: LookupItem | string | null | undefined) => void;
  onMappedChange?: (patch: Record<string, any>) => void;
  placeholder?: string;
  numberOfLines?: number;
  compact?: boolean;
  prerequisiteMessage?: string;
  style?: any;
  onFocus?: () => void;
  onBlur?: () => void;
  lookupConfig: LookupFieldConfig;
  mappedFields?: Record<string, string>;
  fallbackDisplayPath?: string;
  valueStorageField?: string;
  getValues?: (key?: any) => any;
  pageSize?: number;
  disabled?: boolean;
};

const PANEL_ID = "lookupField";
const SEARCH_DEBOUNCE_MS = 320;
const MIN_LOOKUP_LOADING_MS = 540;

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const uniqueText = (values: Array<string | undefined>) =>
  Array.from(
    new Set(
      values
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
    )
  );

const getByPath = (row: any, path: string) =>
  String(path ?? "")
    .split(".")
    .filter(Boolean)
    .reduce((value, key) => value?.[key], row);

export default function LookupField({
  value,
  onChange,
  onMappedChange,
  placeholder,
  numberOfLines,
  compact = false,
  prerequisiteMessage,
  style,
  onFocus,
  onBlur,
  lookupConfig,
  mappedFields,
  fallbackDisplayPath,
  valueStorageField,
  getValues,
  pageSize,
  disabled = false,
}: LookupFieldProps) {
 const {loadLookupPageFromConfig}=useFieldAdapters();
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LookupItem | string | null | undefined>(value);

  const wrapperRef = useRef<View>(null);
  const pressableRef = useRef<View>(null);
  const closingBySelectRef = useRef(false);
  const isWeb = Platform.OS === "web";
  const effectivePageSize = pageSize ?? lookupConfig.pagination?.pageSize ?? 20;
  const effectiveLookupConfig = useMemo(() => {
    const mappedSourceFields = Object.values(mappedFields ?? {})
      .map((field) => String(field ?? "").trim())
      .filter(Boolean);
    if (!mappedSourceFields.length) return lookupConfig;

    return {
      ...lookupConfig,
      selectFields: uniqueText([
        ...(lookupConfig.selectFields ?? []),
        ...mappedSourceFields,
      ]),
    };
  }, [lookupConfig, mappedFields]);
  const selectedLookupItem =
    selectedItem && typeof selectedItem === "object" ? selectedItem : undefined;
  const selectedValue =
    selectedLookupItem?.value ??
    (selectedItem !== undefined && selectedItem !== null && typeof selectedItem !== "object"
      ? selectedItem
      : undefined);

  const buildMappedPatch = useCallback(
    (item: LookupItem | null | undefined) => {
      if (!mappedFields) return undefined;

      return Object.entries(mappedFields).reduce<Record<string, any>>(
        (patch, [targetField, sourceField]) => {
          patch[targetField] = item ? getByPath(item.row, sourceField) : undefined;
          return patch;
        },
        {}
      );
    },
    [mappedFields]
  );

  useEffect(() => {
    setSelectedItem(value);
  }, [value]);

  const getAnchor = () => {
    const node: any = findNodeHandle(wrapperRef.current);
    if (node instanceof HTMLElement) return node;
    if (node?.parentElement) return node.parentElement;
    return undefined;
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    if (closingBySelectRef.current) {
      closingBySelectRef.current = false;
      return;
    }
    onBlur?.();
  }, [onBlur]);

  const handleSelect = useCallback(
    (item: LookupItem) => {
      if (disabled) return;
      setSelectedItem(item);
      onChange?.(valueStorageField ? getByPath(item.row, valueStorageField) : item);
      const mappedPatch = buildMappedPatch(item);
      if (mappedPatch) onMappedChange?.(mappedPatch);

      if (isWeb) {
        closingBySelectRef.current = true;
        closeDropdownPanel();
        setOpen(false);
        setTimeout(() => {
          const node: any = findNodeHandle(pressableRef.current);
          if (node instanceof HTMLElement) node.focus();
        }, 0);
      } else {
        setOpen(false);
        onBlur?.();
      }
    },
    [buildMappedPatch, disabled, isWeb, onBlur, onChange, onMappedChange, valueStorageField]
  );

  const handleClear = useCallback(
    (event?: any) => {
      if (disabled) return;
      event?.stopPropagation?.();
      event?.preventDefault?.();
      setSelectedItem(null);
      onChange?.(null);
      const mappedPatch = buildMappedPatch(null);
      if (mappedPatch) onMappedChange?.(mappedPatch);

      if (open) {
        closeDropdownPanel();
        setOpen(false);
      }
    },
    [buildMappedPatch, disabled, onChange, onMappedChange, open]
  );

  const renderPanelContent = useCallback(
    (close: () => void, placement: "bottom" | "top") => prerequisiteMessage ? (
      <InfoBox level="info" style={{ marginBottom: 0 }}>{prerequisiteMessage}</InfoBox>
    ) : (
      <LookupPanelContent
        config={effectiveLookupConfig}
        selectedItem={selectedLookupItem}
        selectedValue={selectedValue}
        pageSize={effectivePageSize}
        placement={placement}
        onSelect={(item) => handleSelect(item)}
        onClose={close}
      />
    ),
    [
      prerequisiteMessage,
      effectivePageSize,
      effectiveLookupConfig,
      handleSelect,
      selectedLookupItem,
      selectedValue,
    ]
  );

  const openPanel = useCallback(() => {
    if (!isWeb || disabled) return;

    openDropdownPanel({
      id: PANEL_ID,
      anchorRef: getAnchor(),
      collision: true,
      preferredWidth: 520,
      widthMode: "content",
      animate: true,
      onClose: handleClose,
      content: renderPanelContent,
    });
  }, [disabled, handleClose, isWeb, renderPanelContent]);

  const handleOpen = () => {
    if (disabled) return;

    if (isWeb) {
      if (open) {
        closeDropdownPanel();
        setOpen(false);
        onBlur?.();
        return;
      }

      setOpen(true);
      onFocus?.();
      openPanel();
      return;
    }

    setOpen((current) => !current);
    onFocus?.();
  };

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    if (isWeb && open) return;
    onBlur?.();
  };

  const fallbackDisplayValue = fallbackDisplayPath ? getValues?.(fallbackDisplayPath) : undefined;
  const primitiveDisplayValue =
    selectedItem !== undefined && selectedItem !== null && typeof selectedItem !== "object"
      ? selectedItem
      : undefined;
  const hasClearButton = Boolean(
    (selectedLookupItem || primitiveDisplayValue || fallbackDisplayValue) && !disabled
  );
  const displayLabel =
    selectedLookupItem?.label ||
    (primitiveDisplayValue !== undefined && primitiveDisplayValue !== null
      ? String(primitiveDisplayValue)
      : "") ||
    (fallbackDisplayValue !== undefined && fallbackDisplayValue !== null
      ? String(fallbackDisplayValue)
      : "") ||
    placeholder ||
    "Lookup";
  const hasDisplayValue = Boolean(selectedLookupItem?.label) ||
    (primitiveDisplayValue !== undefined && primitiveDisplayValue !== null && String(primitiveDisplayValue) !== "") ||
    (fallbackDisplayValue !== undefined && fallbackDisplayValue !== null && String(fallbackDisplayValue) !== "");

  return (
    <View style={[styles.controlRow, compact && styles.compactRow]}>
      <View ref={wrapperRef} style={[styles.wrapper, compact && styles.compactWrapper, style?.wrapper]}>
        <Pressable
          ref={pressableRef}
          style={() => [styles.button, disabled && styles.buttonDisabled, style, compact && styles.compactButton]}
          onPress={handleOpen}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          accessibilityState={{ disabled }}
        >
          <SimpleLineIcons
            name="magnifier"
            style={[
              styles.searchIcon,
              compact && styles.compactIcon,
              !hasDisplayValue && styles.placeholderIcon,
              disabled && styles.iconDisabled,
            ]}
          />
          <Text
            numberOfLines={numberOfLines}
            style={[
              styles.buttonText,
              !hasDisplayValue && styles.placeholderText,
              disabled && styles.buttonTextDisabled,
              style?.buttonText,
              compact && styles.compactText,
            ]}
          >
            {displayLabel}
          </Text>
        </Pressable>
      </View>
      <FieldClearButton
        accessibilityLabel="Clear lookup selection"
        disabled={!hasClearButton}
        onPress={handleClear}
      />
    </View>
  );
}

function LookupPanelContent({
  config,
  selectedItem,
  selectedValue,
  pageSize,
  placement,
  onSelect,
  onClose,
}: {
  config: LookupFieldConfig;
  selectedItem?: LookupItem;
  selectedValue?: any;
  pageSize: number;
  placement?: "bottom" | "top";
  onSelect: (item: LookupItem) => void;
  onClose: () => void;
}) {
  const {loadLookupPageFromConfig}=useFieldAdapters();
  const searchInputRef = useRef<TextInput | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [items, setItems] = useState<LookupItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const columns = useMemo(
    () =>
      config.displayColumns?.length
        ? config.displayColumns
        : [{ key: config.labelField, label: "Name" }],
    [config.displayColumns, config.labelField]
  );
  const displayItems = useMemo(() => {
    if (selectedValue === undefined || selectedValue === null) return items;

    const selectedIndex = items.findIndex((item) => item.value === selectedValue);
    if (selectedIndex >= 0) {
      return [
        items[selectedIndex],
        ...items.slice(0, selectedIndex),
        ...items.slice(selectedIndex + 1),
      ];
    }

    if (!selectedItem) return items;
    if (searchText.trim()) return items;

    const selectedRow = {
      ...(selectedItem.row ?? {}),
      [config.valueField]: selectedItem.value,
      [config.labelField]: selectedItem.label,
      ...(config.descriptionField
        ? { [config.descriptionField]: selectedItem.description ?? "" }
        : {}),
    };

    return [{ ...selectedItem, row: selectedRow }, ...items];
  }, [config.descriptionField, config.labelField, config.valueField, items, searchText, selectedItem, selectedValue]);

  useEffect(() => {
    if (searchText === debouncedSearchText) return;

    const handle = setTimeout(() => {
      setLoading(true);
      setLoadError(null);
      setDebouncedSearchText(searchText);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [debouncedSearchText, searchText]);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      const startedAt = Date.now();
      try {
        setLoading(true);
        setLoadError(null);
        const result = await loadLookupPageFromConfig(config, {
          page,
          pageSize,
          searchText: debouncedSearchText,
        });
        const remainingMs = MIN_LOOKUP_LOADING_MS - (Date.now() - startedAt);
        if (remainingMs > 0) await delay(remainingMs);
        if (cancelled) return;
        setItems(result.items);
        setHasMore(result.hasMore);
        setTotal(result.total);
      } catch (error) {
        const remainingMs = MIN_LOOKUP_LOADING_MS - (Date.now() - startedAt);
        if (remainingMs > 0) await delay(remainingMs);
        if (cancelled) return;
        setLoadError(error instanceof Error ? error : new Error("Failed to load lookup rows"));
        setItems([]);
        setHasMore(false);
        setTotal(undefined);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [config, debouncedSearchText, page, pageSize]);

  const goPrevious = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goNext = useCallback(() => {
    if (!hasMore) return;
    setLoading(true);
    setLoadError(null);
    setPage((current) => current + 1);
  }, [hasMore]);

  const firstRow = (page - 1) * pageSize + 1;
  const lastRow = (page - 1) * pageSize + items.length;
  const resultText =
    total !== undefined && total >= 0
      ? `${items.length ? firstRow : 0}-${lastRow} of ${total}`
      : `Page ${page}`;

  useEffect(() => {
    const node: any = findNodeHandle(searchInputRef.current);
    if (!(node instanceof HTMLElement)) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Enter" && displayItems[0]) {
        event.preventDefault();
        onSelect(displayItems[0]);
      }
    };

    node.addEventListener("keydown", handler);
    return () => node.removeEventListener("keydown", handler);
  }, [displayItems, onClose, onSelect]);

  const searchBox = (
    <View style={styles.searchRow}>
      <SimpleLineIcons name="magnifier" style={styles.panelSearchIcon} />
      <TextInput
        ref={searchInputRef}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search..."
        autoFocus
        style={styles.searchInput}
      />
    </View>
  );

  const columnHeader = (
    <View style={styles.headerRow}>
      {columns.map((column) => (
        <Text
          key={column.key}
          style={[styles.headerCell, column.width ? { width: column.width } : styles.flexCell]}
        >
          {column.label}
        </Text>
      ))}
    </View>
  );

  const resultList = (
    <ScrollView style={styles.resultList}>
      {loading ? (
        <LookupLoadingRows columns={columns} />
      ) : loadError ? (
        <View style={styles.messageRow}>
          <ErrorPanel compact context={{ component: "lookup results", operation: "load" }} error={loadError} />
        </View>
      ) : displayItems.length === 0 ? (
        <View style={styles.messageRow}>
          <Text style={styles.messageText}>No items</Text>
        </View>
      ) : (
        displayItems.map((item, index) => {
          const selected = item.value === selectedValue;
          return (
            <Pressable
              key={`${String(item.value)}-${index}`}
              style={({ hovered, pressed }: any) => [
                styles.resultRow,
                selected && styles.resultRowSelected,
                hovered && styles.resultRowHovered,
                pressed && styles.resultRowPressed,
              ]}
              onPress={() => onSelect(item)}
            >
              {columns.map((column) => (
                <Text
                  key={column.key}
                  style={[styles.resultCell, column.width ? { width: column.width } : styles.flexCell]}
                  numberOfLines={1}
                >
                  {String(getByPath(item.row, column.key) ?? "")}
                </Text>
              ))}
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );

  const footer = (
    <View style={styles.footerRow}>
      <View style={styles.footerLeft}>
        <Text style={styles.footerText}>{resultText}</Text>
        <View style={styles.footerActions}>
          <Pressable
            style={({ hovered, pressed }: any) => [
              styles.pageButton,
              page <= 1 && styles.pageButtonDisabled,
              hovered && page > 1 && styles.pageButtonHovered,
              pressed && page > 1 && styles.pageButtonPressed,
            ]}
            disabled={page <= 1}
            onPress={goPrevious}
          >
            <Text style={styles.pageButtonText}>Previous</Text>
          </Pressable>
          <Pressable
            style={({ hovered, pressed }: any) => [
              styles.pageButton,
              !hasMore && styles.pageButtonDisabled,
              hovered && hasMore && styles.pageButtonHovered,
              pressed && hasMore && styles.pageButtonPressed,
            ]}
            disabled={!hasMore}
            onPress={goNext}
          >
            <Text style={styles.pageButtonText}>Next</Text>
          </Pressable>
        </View>
      </View>
      <Pressable
        style={({ hovered, pressed }: any) => [
          styles.pageButton,
          hovered && styles.pageButtonHovered,
          pressed && styles.pageButtonPressed,
        ]}
        onPress={onClose}
      >
        <Text style={styles.pageButtonText}>Close</Text>
      </Pressable>
    </View>
  );

  const isTop = placement === "top";

  return (
    <View style={styles.panel}>
      {isTop ? footer : searchBox}
      {columnHeader}
      {resultList}
      {isTop ? searchBox : footer}
    </View>
  );
}

function LookupLoadingRows({ columns }: { columns: LookupDisplayColumn[] }) {
  return (
    <View>
      {Array.from({ length: 4 }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.resultRow}>
          {columns.map((column, columnIndex) => (
            <View
              key={column.key}
              style={[
                styles.loadingCell,
                column.width ? { width: column.width } : styles.flexCell,
              ]}
            >
              <View
                style={[
                  styles.loadingLine,
                  { width: columnIndex === 0 ? "76%" : "58%" },
                ]}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create<any>({
  controlRow: { width: "100%", height: "100%", flexDirection: "row", alignItems: "stretch" },
  compactRow: { height: 29 },
  compactWrapper: { height: 29 },
  compactButton: { height: 29, flexDirection: 'row', alignItems: 'center', paddingVertical: 0, paddingHorizontal: 8 },
  compactIcon: { position: 'relative', left: 0, height: 'auto' },
  compactText: { flex: 1, minWidth: 0, paddingVertical: 0, paddingLeft: 8, paddingRight: 0 },
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
  searchIcon: {
    position: "absolute",
    left: 8,
    fontSize: 14,
    height: "100%",
    alignContent: "center",
    color: "#323130",
  },
  placeholderIcon: {
    color: "#8A8886",
  },
  iconDisabled: {
    color: "#605e5c",
  },
  buttonText: {
    fontSize: 13,
    color: "#201f1e",
    paddingVertical: 4,
    paddingLeft: 30,
    paddingRight: 8,
    userSelect: "none",
  },
  placeholderText: {
    color: "#8A8886",
  },
  buttonTextDisabled: {
    color: "#323130",
  },
  panel: {
    width: 520,
    backgroundColor: "#fff",
  },
  searchRow: {
    height: 42,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#edebe9",
  },
  panelSearchIcon: {
    position: "absolute",
    left: 16,
    fontSize: 14,
    color: "#323130",
    zIndex: 1,
  },
  searchInput: {
    height: 28,
    marginHorizontal: 10,
    paddingLeft: 30,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: "#0061a3",
    fontSize: 13,
    ...Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
        outlineColor: "transparent",
        boxShadow: "0 0 3px rgba(0, 97, 163, 0.7)",
      },
    }),
  },
  headerRow: {
    flexDirection: "row",
    minHeight: 32,
    backgroundColor: "#f3f2f1",
    borderBottomWidth: 1,
    borderBottomColor: "#edebe9",
  },
  headerCell: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#201f1e",
  },
  resultList: {
    height: "clamp(96px, calc(var(--tempo-dropdown-panel-max-height, 302px) - 122px), 180px)" as any,
  },
  resultRow: {
    minHeight: 34,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#edebe9",
  },
  resultRowSelected: {
    backgroundColor: "#f5f5f5",
  },
  resultRowHovered: {
    backgroundColor: "#f0f0f0",
  },
  resultRowPressed: {
    backgroundColor: "#E5E5E5",
  },
  resultCell: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#201f1e",
  },
  flexCell: {
    flex: 1,
  },
  messageRow: {
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  messageText: {
    fontSize: 13,
    color: "#605e5c",
  },
  loadingCell: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  loadingLine: {
    height: 10,
    backgroundColor: "#f3f2f1",
  },
  errorText: {
    fontSize: 13,
    color: "#d9534f",
  },
  footerRow: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#edebe9",
    paddingHorizontal: 10,
  },
  footerText: {
    width: 112,
    fontSize: 12,
    color: "#605e5c",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minWidth: 0,
  },
  footerActions: {
    flexDirection: "row",
    gap: 8,
  },
  pageButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#c8c6c4",
  },
  pageButtonHovered: {
    backgroundColor: "#f3f2f1",
  },
  pageButtonPressed: {
    backgroundColor: "#edebe9",
  },
  pageButtonDisabled: {
    opacity: 0.45,
  },
  pageButtonText: {
    fontSize: 12,
    color: "#201f1e",
  },
});
