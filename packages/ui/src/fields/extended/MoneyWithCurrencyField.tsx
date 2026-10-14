import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import SimpleDropDown, { SimpleDropdownItem } from "./DorpdownSimple";
import MoneyInputField from "./MoneyInputField";
import { getCurrencyPrefix } from './currencyPrefix';

export type MoneyWithCurrencyFieldProps = {
  value?: any;
  onChange?: (value: any) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  disabled?: boolean;
  amountFieldName?: string;
  currencyFieldName?: string;
  currencyOptions?: Array<string | SimpleDropdownItem>;
  defaultCurrency?: string;
  getValues?: (key?: any) => any;
  setValue?: (key: string, value: any) => void;
  onMappedChange?: (patch: Record<string, any>) => void;
  moneyProps?: Record<string, any>;
  currencySymbolMap?: Record<string, string>;
};

function toCurrencyItems(options?: Array<string | SimpleDropdownItem>) {
  return (options ?? ["AUD", "USD", "CNY", "NZD"]).map((option) =>
    typeof option === "string" ? { label: option, value: option } : option
  );
}

function getMappedValue(
  fieldName: string | undefined,
  fallback: any,
  getValues?: (key?: any) => any
) {
  if (!fieldName || !getValues) return fallback;
  const value = getValues(fieldName);
  return value === undefined ? fallback : value;
}

function getCurrencyValue(currency: any) {
  if (currency && typeof currency === "object" && "value" in currency) {
    return currency.value;
  }

  return currency;
}

function getAmountValue(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  if ("amount" in value) return value.amount;
  if ("value" in value) return value.value;
  if ("number" in value) return value.number;
  return undefined;
}

export default function MoneyWithCurrencyField({
  value,
  onChange,
  onFocus,
  onBlur,
  style,
  disabled,
  amountFieldName,
  currencyFieldName,
  currencyOptions,
  defaultCurrency,
  getValues,
  setValue,
  onMappedChange,
  moneyProps,
  currencySymbolMap,
}: MoneyWithCurrencyFieldProps) {
  const hasObjectValue = value && typeof value === "object" && !Array.isArray(value);
  const seededDefaultCurrencyRef = useRef(false);
  const amountValue = getMappedValue(
    amountFieldName,
    getAmountValue(value),
    getValues
  );
  const fallbackCurrency =
    hasObjectValue && "currency" in value ? value.currency : undefined;
  const currencyValue = getMappedValue(currencyFieldName, fallbackCurrency, getValues);
  const normalizedCurrencyValue = getCurrencyValue(currencyValue);
  const options = toCurrencyItems(currencyOptions);
  const selectedCurrency =
    normalizedCurrencyValue === null ||
    normalizedCurrencyValue === undefined ||
    normalizedCurrencyValue === ""
      ? undefined
      : options.find((option) => option.value === normalizedCurrencyValue) ??
        options.find((option) => option.value === defaultCurrency);
  const incomingStyle = (StyleSheet.flatten(style) ?? {}) as Record<string, any>;
  const { boxShadow, ...controlStyle } = incomingStyle;
  const containerStyle = boxShadow ? { boxShadow } : undefined;
  const currencyDropdownStyle = {
    ...styles.currencyDropdown,
    ...controlStyle,
    ...styles.currencyJoinedControl,
    wrapper: styles.currencyWrapper,
  };
  const amountInputStyle = {
    ...controlStyle,
    ...styles.amountJoinedControl,
  };
  const moneyPrefix = getCurrencyPrefix(
    normalizedCurrencyValue,
    currencySymbolMap,
    moneyProps?.prefix ?? "$"
  );

  const updateMappedValue = useCallback((patch: Record<string, any>) => {
    Object.entries(patch).forEach(([key, nextValue]) => setValue?.(key, nextValue));
    onMappedChange?.(patch);
  }, [onMappedChange, setValue]);

  useEffect(() => {
    if (!defaultCurrency || disabled || seededDefaultCurrencyRef.current) return;

    const hasCurrency =
      normalizedCurrencyValue !== null &&
      normalizedCurrencyValue !== undefined &&
      normalizedCurrencyValue !== "";
    seededDefaultCurrencyRef.current = true;

    if (hasCurrency) return;

    if (currencyFieldName) {
      updateMappedValue({ [currencyFieldName]: defaultCurrency });
      return;
    }

    onChange?.({
      ...(hasObjectValue ? value : {}),
      amount: amountValue,
      currency: defaultCurrency,
    });
  }, [
    amountValue,
    currencyFieldName,
    defaultCurrency,
    disabled,
    hasObjectValue,
    normalizedCurrencyValue,
    onChange,
    updateMappedValue,
    value,
  ]);

  const handleAmountChange = (nextAmount: any) => {
    if (amountFieldName) {
      updateMappedValue({ [amountFieldName]: nextAmount });
      onChange?.(nextAmount);
      return;
    }

    onChange?.({
      ...(hasObjectValue ? value : {}),
      amount: nextAmount,
      currency: normalizedCurrencyValue,
    });
  };

  const handleCurrencyChange = (nextCurrency: SimpleDropdownItem | null | undefined) => {
    const nextValue = nextCurrency?.value ?? null;

    if (currencyFieldName) {
      updateMappedValue({ [currencyFieldName]: nextValue });
      return;
    }

    onChange?.({ ...(hasObjectValue ? value : {}), amount: amountValue, currency: nextValue });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.currency}>
        <SimpleDropDown
          value={selectedCurrency}
          options={options}
          onChange={handleCurrencyChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Currency"
          allowClear={false}
          disabled={disabled}
          style={currencyDropdownStyle}
        />
      </View>
      <View style={styles.amount}>
        <MoneyInputField
          value={amountValue}
          onChange={handleAmountChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          style={amountInputStyle}
          {...moneyProps}
          prefix={moneyPrefix}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create<any>({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  currency: {
    width: 128,
  },
  currencyWrapper: {
    height: "auto",
  },
  currencyDropdown: {
    borderRightWidth: 0,
  },
  currencyJoinedControl: {
    borderRightWidth: 0,
  },
  amountJoinedControl: {
    borderLeftWidth: 0,
  },
  amount: {
    flex: 1,
    minWidth: 0,
  },
});
