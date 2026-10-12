import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Platform } from "react-native";
import { TextInput } from "react-native-gesture-handler";

type NumberInputFieldProps = {
  /** Can be number/string/null/undefined — component will normalize for display */
  value?: number | string | null | undefined;

  /**
   * Controls what `onChange` emits:
   * - "string" (default): emits the filtered numeric text (can be "-", "", "12.3")
   * - "number": emits a real number, or emptyValue (null/undefined) if empty/invalid/intermediate
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
  style?: any;
  allowDecimal?: boolean;
  allowNegative?: boolean;

  /** If true, only emit onChange when blur happens (typing updates internalText only) */
  commitOnBlur?: boolean;
  disabled?: boolean;
};

function parseToNumber(
  rawText: string,
  allowDecimal: boolean
): number | null {
  const s = (rawText ?? "").trim();

  // intermediate / empty states
  if (s === "" || s === "-" || s === "." || s === "-.") return null;

  const n = allowDecimal ? Number(s) : parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

export default function NumberInputField({
  value,
  onChange,
  onFocus,
  onBlur,
  placeHolder,
  style,
  allowDecimal = true,
  allowNegative = true,
  outputAs = "number",
  emptyValue = null,
  commitOnBlur = false,
  disabled = false,
}: NumberInputFieldProps) {
  const [internalText, setInternalText] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  const incomingText = useMemo(() => {
    if (value === undefined || value === null) return "";
    return String(value);
  }, [value]);

  useEffect(() => {
    if (isFocused) return;

    // keep internal text synced to external value when not focused
    setInternalText(incomingText);
  }, [incomingText, isFocused]);

  const emit = (raw: string) => {
    if (!onChange) return;

    if (outputAs === "string") {
      onChange(raw);
      return;
    }

    // outputAs === "number"
    const n = parseToNumber(raw, allowDecimal);
    onChange(n === null ? emptyValue : n);
  };

  const handleChangeText = (text: string) => {
    let raw = text;

    // basic filtering
    if (allowDecimal && allowNegative) {
      raw = raw.replace(/[^0-9.\-]/g, "");
    } else if (allowDecimal && !allowNegative) {
      raw = raw.replace(/[^0-9.]/g, "");
    } else if (!allowDecimal && allowNegative) {
      raw = raw.replace(/[^0-9\-]/g, "");
    } else {
      raw = raw.replace(/[^0-9]/g, "");
    }

    // only one dot
    if (allowDecimal) {
      const parts = raw.split(".");
      if (parts.length > 2) {
        raw = parts[0] + "." + parts.slice(1).join("");
      }
    } else {
      raw = raw.replace(/\./g, "");
    }

    // handle negative (only allow "-" at start)
    if (allowNegative) {
      if (raw === "-") {
        setInternalText("-");
        if (!commitOnBlur) emit("-");
        return;
      }

      const neg = raw.startsWith("-");
      raw = raw.replace(/-/g, "");
      if (neg) raw = "-" + raw;
    } else {
      raw = raw.replace(/-/g, "");
    }

    // remove unwanted leading zeros
    if (!raw.includes(".")) {
      if (raw !== "0" && raw !== "-0") {
        raw = raw.replace(/^(-?)0+(\d)/, "$1$2");
      }
    } else {
      raw = raw.replace(/^(-?)0+(\d)/, "$1$2");
    }

    setInternalText(raw);

    if (!commitOnBlur) {
      emit(raw);
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);

    // prevent select-all-on-focus on web
    if (Platform.OS === "web") {
      try {
        const el = e?.target as HTMLInputElement | null;
        if (el && typeof el.setSelectionRange === "function") {
          const len = (el.value ?? "").length;
          el.setSelectionRange(len, len); // caret at end, no selection
        }
      } catch {
        // ignore
      }
    }

    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (commitOnBlur) {
      emit(internalText);
    }

    onBlur?.();
  };

  return (
    <TextInput
      value={internalText}
      onChangeText={handleChangeText}
      onFocus={handleFocus}
      onBlur={handleBlur}
      editable={!disabled}
      placeholder={placeHolder}
      // make sure RN doesn't auto-select content
      // @ts-ignore: prop exists at runtime
      selectTextOnFocus={false}
      placeholderTextColor="#8F8F8F"
      keyboardType={allowDecimal ? "decimal-pad" : "number-pad"}
      style={[styles.textInput, disabled && styles.textInputDisabled, style]}
    />
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: "#A0A0A0",
    paddingLeft: 8,
    paddingRight: 25,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 0,
    fontSize: 13,
    ...Platform.select({
      web: {
        outlineStyle: "none",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    }),
  },
  textInputDisabled: {
    backgroundColor: "#FAFAFA",
    color: "#323130",
  },
});
