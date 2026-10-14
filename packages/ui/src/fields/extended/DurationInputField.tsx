import { StyleSheet, View } from "react-native";
import RichDropDown, { type RichDropdownItem } from "../RichDropDown";
import NumberInputField from "../NumberInputField";

export type DurationInputValue = {
  value: number;
  unit: string;
};

export default function DurationInputField({
  value,
  onChange,
  onFocus,
  onBlur,
  style,
  disabled = false,
  unitOptions = [],
}: {
  value?: DurationInputValue | null;
  onChange?: (value: DurationInputValue) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  disabled?: boolean;
  unitOptions?: RichDropdownItem[];
}) {
  const resolvedValue = value?.value ?? 1;
  const resolvedUnit = value?.unit ?? String(unitOptions[0]?.value ?? "");
  const selectedUnit = unitOptions.find(
    (option) => String(option.value) === resolvedUnit,
  ) ?? {
    label: resolvedUnit,
    value: resolvedUnit,
  };
  const incomingStyle = (StyleSheet.flatten(style) ?? {}) as Record<string, any>;
  const { boxShadow, ...controlStyle } = incomingStyle;

  return (
    <View style={[styles.container, boxShadow ? { boxShadow } : undefined]}>
      <View style={styles.amount}>
        <NumberInputField
          value={resolvedValue}
          onChange={(nextValue) => onChange?.({
            value: typeof nextValue === "number" ? nextValue : resolvedValue,
            unit: resolvedUnit,
          })}
          onFocus={onFocus}
          onBlur={onBlur}
          allowDecimal={false}
          allowNegative={false}
          outputAs="number"
          commitOnBlur
          disabled={disabled}
          style={[controlStyle, styles.amountInput]}
        />
      </View>
      <View style={styles.unit}>
        <RichDropDown
          value={selectedUnit}
          options={unitOptions}
          onChange={(item: RichDropdownItem | null | undefined) => onChange?.({
            value: resolvedValue,
            unit: String(item?.value ?? resolvedUnit),
          })}
          onFocus={onFocus}
          onBlur={onBlur}
          clearable={false}
          disabled={disabled}
          style={{
            ...controlStyle,
            wrapper: styles.unitWrapper,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create<any>({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  amount: {
    width: 76,
  },
  amountInput: {
    paddingRight: 8,
    borderRightWidth: 0,
  },
  unit: {
    flex: 1,
    minWidth: 0,
  },
  unitWrapper: {
    height: "auto",
  },
});
