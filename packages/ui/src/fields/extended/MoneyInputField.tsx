// app/components/ui/web/form/MoneyInputField.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { TextInput } from "../../platform/TextInput";
import { getCurrencyPrefix } from './currencyPrefix';

export type MoneyInputFieldProps = {
  /** Can be number/string/null/undefined — component normalizes for display */
  value?: number | string | null | undefined;

  /**
   * Controls what `onChange` emits:
   * - "string" (default): emits raw numeric text (e.g. "", "12", "12.3")
   * - "number": emits real number, or emptyValue (null/undefined) when empty/invalid
   */
  outputAs?: "string" | "number";

  /**
   * When outputAs="number", what should "empty" map to?
   * default: null
   */
  emptyValue?: null | undefined;

  /** Receives string OR number OR null/undefined depending on outputAs + emptyValue */
  onChange?: (val: string | number | null | undefined) => void;

  onFocus?: () => void;
  onBlur?: () => void;
  placeHolder?: string;
  style?: any; // container style (width, margin, etc.)
  prefix?: string; // e.g. "$", "AUD", optional
  /** Omit the prefix and its reserved space in compact table cells. */
  hidePrefix?: boolean;
  currencyFieldName?: string;
  getValues?: (key?: any) => any;

  /** If true, only emit onChange when blur happens (typing updates internalText only) */
  commitOnBlur?: boolean;

  /** locale for formatting when blurred */
  locale?: string;

  /** fraction digits when blurred */
  fractionDigits?: number;
  disabled?: boolean;
};

function parseToNumber(rawText: string): number | null {
  const s = (rawText ?? "").trim();

  // empty / intermediate
  if (s === "" || s === "." || s === "-." || s === "-") return null;

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function MoneyInputField({
  value,
  onChange,
  onFocus,
  onBlur,
  placeHolder,
  style,
  prefix,
  hidePrefix = false,
  currencyFieldName,
  getValues,
  outputAs = "number",
  emptyValue = null,
  commitOnBlur = false,
  locale = "en-US",
  fractionDigits = 2,
  disabled = false,
}: MoneyInputFieldProps) {
  const moneyPrefix = currencyFieldName
    ? getCurrencyPrefix(getValues?.(currencyFieldName), undefined, prefix ?? '') : prefix;
  const [internalText, setInternalText] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const resolvedFractionDigits = Number.isFinite(Number(fractionDigits))
    ? Math.max(0, Math.min(20, Math.trunc(Number(fractionDigits))))
    : 2;

  // normalize incoming value -> raw numeric string (no commas)
  const incomingRaw = useMemo(() => {
    if (value === undefined || value === null) return "";
    const s = String(value).trim();
    if (s === "") return "";
    return s.replace(/,/g, ""); // just in case caller passes "1,234.56"
  }, [value]);

  const formatMoney = (raw: string) => {
    if (!raw) return "";
    const n = Number(raw);
    if (!Number.isFinite(n)) return "";
    return n.toLocaleString(locale, {
      minimumFractionDigits: resolvedFractionDigits,
      maximumFractionDigits: resolvedFractionDigits,
    });
  };

  // Sync external value → display when not focused
  useEffect(() => {
    if (!isFocused) {
      setInternalText(formatMoney(incomingRaw));
    }
  }, [incomingRaw, isFocused]);

  const emit = (raw: string) => {
    if (!onChange) return;

    if (outputAs === "string") {
      onChange(raw);
      return;
    }

    const n = parseToNumber(raw);
    onChange(n === null ? emptyValue : n);
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);

    // show raw for editing
    setInternalText(incomingRaw);

    // Prevent select-all-on-focus on web
    if (Platform.OS === "web") {
      try {
        const el = e?.target as HTMLInputElement | null;
        if (el && typeof el.setSelectionRange === "function") {
          const len = (el.value ?? "").length;
          el.setSelectionRange(len, len);
        }
      } catch { }
    }

    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);

    // if empty, keep empty and emit empty if commitOnBlur
    if (!internalText || internalText.trim() === "") {
      setInternalText("");
      if (commitOnBlur) emit("");
      onBlur?.();
      return;
    }

    // format display
    const raw = internalText.replace(/,/g, "");
    setInternalText(formatMoney(raw));

    if (commitOnBlur) {
      emit(raw);
    }

    onBlur?.();
  };

  const handleChangeText = (text: string) => {
    // allow digits + one dot (no minus for money here; add if you need)
    let raw = text.replace(/[^0-9.]/g, "");
    const parts = raw.split(".");
    if (parts.length > 2) {
      raw = parts[0] + "." + parts.slice(1).join("");
    }

    setInternalText(raw);

    if (!commitOnBlur) {
      emit(raw);
    }
  };

  return (
    <View style={[styles.container, disabled && styles.containerDisabled, style]}>
      {!hidePrefix && <View style={styles.prefixContainer}>
        {moneyPrefix ? <Text style={styles.prefixText}>{moneyPrefix}</Text> : null}
      </View>}

      <TextInput
        value={internalText}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={!disabled}
        placeholder={placeHolder}
        // @ts-ignore: prop exists at runtime
        selectTextOnFocus={false}
        placeholderTextColor="#8F8F8F"
        keyboardType="decimal-pad"
        style={[styles.textInput, disabled && styles.textInputDisabled]}
      />
    </View>
  );
}

const baseBox = {
  borderWidth: 1,
  borderColor: "#A0A0A0",
  paddingTop: 4,
  paddingBottom: 4,
  borderRadius: 0,
};

const styles = StyleSheet.create<any>({
  container: {
    ...baseBox,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
    paddingRight: 8,
    ...Platform.select({
      web: { outlineWidth: 0 as any },
    }),
  },
  prefixContainer: {
    width: 16, // fixed width so layout doesn’t jump
    justifyContent: "center",
    alignItems: "flex-start",
    marginRight: 6,
  },
  prefixText: {
    fontSize: 13,
    color: "#444",
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
    ...Platform.select({
      web: {

        outlineStyle: "none",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    }),
  },
  containerDisabled: {
    backgroundColor: "#FAFAFA",
  },
  textInputDisabled: {
    color: "#323130",
  },
});
