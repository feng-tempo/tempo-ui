// app/components/ui/web/form/PercentageInputField.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { TextInput } from "../../platform/TextInput";

export type PercentageInputFieldProps = {
  /**
   * Stored decimal (0-1) can be string/number/null/undefined.
   * Examples: "0.2268", 0.2268, "", null
   */
  value?: number | string | null | undefined;

  /**
   * Controls what `onChange` emits:
   * - "string" (default): emits stored decimal string (e.g. "", "0.2268")
   * - "number": emits stored decimal number (e.g. 0.2268) or emptyValue
   */
  outputAs?: "string" | "number";

  /** When outputAs="number", what should "empty" map to? default null */
  emptyValue?: null | undefined;

  /** Receives string OR number OR null/undefined depending on outputAs + emptyValue */
  onChange?: (val: string | number | null | undefined) => void;

  onFocus?: () => void;
  onBlur?: () => void;
  placeHolder?: string;
  style?: any;

  /** UI formatting for percent display on blur */
  decimalPlaces?: number;

  /** label shown at left; default "%" */
  prefix?: string;

  /** If true, only emit onChange when blur happens */
  commitOnBlur?: boolean;

  /** locale for formatting when blurred */
  locale?: string;
  disabled?: boolean;
};

/**
 * Convert percent string to decimal string by moving decimal point left 2 places.
 * Preserves user's digits EXACTLY (no floating math, no rounding).
 *
 * Examples:
 *  "22"      -> "0.22"
 *  "22.68"   -> "0.2268"
 *  "0.5"     -> "0.005"
 *  ".5"      -> "0.005"
 *  "100"     -> "1"
 */
function percentTextToDecimalText(percentRaw: string): string {
  let s = (percentRaw ?? "").trim();
  if (s === "") return "";

  // strip commas, keep only digits + one dot (caller already filtered, but be safe)
  s = s.replace(/,/g, "");

  // handle leading dot like ".5"
  if (s.startsWith(".")) s = "0" + s;

  // if ends with dot "12." -> treat as "12" for storage (still exact intent)
  if (s.endsWith(".")) s = s.slice(0, -1);

  if (s === "") return "";

  const parts = s.split(".");
  const intPart = parts[0].replace(/^0+(?=\d)/, "") || "0"; // keep at least one digit
  const fracPart = parts[1] ?? "";

  // digits without dot
  const digits = (intPart + fracPart).replace(/^0+(?=\d)/, "") || "0";
  const fracLen = fracPart.length;

  // decimalDigits = digits * 10^(-(fracLen + 2))
  const shift = fracLen + 2;

  // ensure enough leading zeros
  const padded = digits.padStart(shift + 1, "0");
  const pos = padded.length - shift;

  let out = padded.slice(0, pos) + "." + padded.slice(pos);

  // trim trailing zeros after dot
  out = out.replace(/\.?0+$/, "");
  // if becomes empty (shouldn't), return "0"
  if (out === "") out = "0";
  // normalize "0." -> "0"
  if (out.endsWith(".")) out = out.slice(0, -1);

  return out;
}

/**
 * Convert stored decimal string to percent string for editing:
 * move decimal point right 2 places, preserve digits (string op).
 * Used on focus to show raw percent.
 *
 * Examples:
 *  "0.2268" -> "22.68"
 *  "1"      -> "100"
 *  "0.005"  -> "0.5"
 */
function decimalTextToPercentText(decimalRaw: string): string {
  let s = (decimalRaw ?? "").trim();
  if (s === "") return "";

  s = s.replace(/,/g, "");

  if (s.startsWith(".")) s = "0" + s;
  if (s.endsWith(".")) s = s.slice(0, -1);
  if (s === "") return "";

  const parts = s.split(".");
  const intPart = parts[0].replace(/^0+(?=\d)/, "") || "0";
  const fracPart = parts[1] ?? "";

  const digits = (intPart + fracPart).replace(/^0+(?=\d)/, "") || "0";
  const fracLen = fracPart.length;

  // percentDigits = digits * 10^(2 - fracLen)
  const shift = fracLen - 2;

  let out: string;
  if (shift >= 0) {
    // need to place dot shift places from end
    const padded = digits.padEnd(shift + 1, "0");
    const pos = padded.length - shift;
    out = padded.slice(0, pos) + (shift === 0 ? "" : "." + padded.slice(pos));
  } else {
    // shift < 0 means multiply by 10^(2-fracLen): add leading zeros after dot
    const zeros = "0".repeat(-shift - 1);
    out = "0." + zeros + digits;
  }

  // trim trailing zeros after dot
  out = out.replace(/\.?0+$/, "");
  if (out === "") out = "0";
  if (out.endsWith(".")) out = out.slice(0, -1);
  return out;
}

function formatPercentDisplay(
  decimalRaw: string,
  locale: string,
  decimalPlaces: number
): string {
  if (!decimalRaw) return "";

  // formatting is for display only; precision/typing is preserved by string ops
  const n = Number(decimalRaw);
  if (!Number.isFinite(n)) return "";

  const percent = n * 100;
  return percent.toLocaleString(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

export default function PercentageInputField({
  value,
  onChange,
  onFocus,
  onBlur,
  placeHolder,
  style,
  decimalPlaces = 2,
  prefix = "%",
  outputAs = "number",
  emptyValue = null,
  commitOnBlur = false,
  locale = "en-US",
  disabled = false,
}: PercentageInputFieldProps) {
  const [internalText, setInternalText] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  // normalize incoming stored decimal -> raw decimal string
  const incomingDecimalRaw = useMemo(() => {
    if (value === undefined || value === null) return "";
    const s = String(value).trim();
    if (s === "") return "";
    return s.replace(/,/g, "");
  }, [value]);

  // Sync external value → formatted display when not focused
  useEffect(() => {
    if (!isFocused) {
      setInternalText(formatPercentDisplay(incomingDecimalRaw, locale, decimalPlaces));
    }
  }, [incomingDecimalRaw, isFocused, locale, decimalPlaces]);

  const emitFromPercentRaw = (percentRaw: string) => {
    if (!onChange) return;

    const storedDecimalText = percentTextToDecimalText(percentRaw);

    if (storedDecimalText === "") {
      if (outputAs === "string") onChange("");
      else onChange(emptyValue);
      return;
    }

    if (outputAs === "string") {
      onChange(storedDecimalText);
    } else {
      const n = Number(storedDecimalText);
      onChange(Number.isFinite(n) ? n : emptyValue);
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);

    // show raw percent for editing using string conversion (preserves digits)
    if (!incomingDecimalRaw) {
      setInternalText("");
    } else {
      setInternalText(decimalTextToPercentText(incomingDecimalRaw));
    }

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

    const raw = (internalText ?? "").replace(/,/g, "").trim();
    if (raw === "") {
      setInternalText("");
      if (commitOnBlur) emitFromPercentRaw("");
      onBlur?.();
      return;
    }

    // On blur: format based on *stored* decimal (from raw percent text)
    const storedDecimalText = percentTextToDecimalText(raw);
    setInternalText(formatPercentDisplay(storedDecimalText, locale, decimalPlaces));

    if (commitOnBlur) emitFromPercentRaw(raw);
    onBlur?.();
  };

  const handleChangeText = (text: string) => {
    // allow digits + one dot
    let raw = text.replace(/[^0-9.]/g, "");
    const parts = raw.split(".");
    if (parts.length > 2) raw = parts[0] + "." + parts.slice(1).join("");

    setInternalText(raw);

    if (!commitOnBlur) {
      emitFromPercentRaw(raw);
    }
  };

  return (
    <View style={[styles.container, disabled && styles.containerDisabled, style]}>
      <View style={styles.prefixContainer}>
        {prefix ? <Text style={styles.prefixText}>{prefix}</Text> : null}
      </View>

      <TextInput
        value={internalText}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={!disabled}
        placeholder={placeHolder}
        placeholderTextColor="#8F8F8F"
        keyboardType="decimal-pad"
        // @ts-ignore
        selectTextOnFocus={false}
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
    width: 16,
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
