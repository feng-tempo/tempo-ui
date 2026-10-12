import {useTempoTheme} from "../theme";
// app/components/ui/web/form/fields/CheckBox.tsx
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
} from "react-native";

export type CheckBoxProps = {
  value?: boolean;
  indeterminate?: boolean;
  placeholder?: string;
  onChange?: (val: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onHoverIn?: () => void;     // ⭐ restored callback
  onHoverOut?: () => void;    // ⭐ restored callback
  style?: any;
  containerStyle?: any;
  labelStyle?: any;
  label?: string;
  disabled?: boolean;
  required?: boolean;
};

export default function CheckBox({
  value,
  indeterminate = false,
  onChange,
  onFocus,
  onBlur,
  onHoverIn,
  onHoverOut,
  style,
  containerStyle,
  labelStyle,
  label,
  disabled = false,
  required = false,
}: CheckBoxProps) {
  const tempoTheme = useTempoTheme();
  const [isChecked, setIsChecked] = useState(!!value);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setIsChecked(!!value);
  }, [value]);

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    setIsChecked(next);
    onChange?.(next);
  };

  return (
    <Pressable
      onPress={toggle}
      {...(Platform.OS === "web" ? {onKeyDown:(event:any)=>{if(event.key === " " && !event.repeat){event.preventDefault();toggle();}}} : {})}
      role="checkbox"
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: indeterminate ? "mixed" : isChecked, disabled }}
      {...(Platform.OS === "web" ? {"aria-checked":indeterminate ? "mixed" : isChecked} : {})}
      disabled={disabled}
      onHoverIn={() => {
        setHovered(true);
        onHoverIn?.();        // ⭐ restored
      }}
      onHoverOut={() => {
        setHovered(false);
        onHoverOut?.();       // ⭐ restored
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      style={[
        styles.container,
        containerStyle,
        Platform.OS === "web"
          ? ({ outlineWidth: 0, outlineStyle: "none" } as any)
          : undefined,
      ]}
    >
      <View
        style={[
          styles.box,
          tempoTheme.custom && {borderColor:tempoTheme.tokens.controlBorder},
          disabled && styles.boxDisabled,
          (isChecked || indeterminate) && styles.checkedBox,
          disabled && (isChecked || indeterminate) && styles.checkedBoxDisabled,
          style,
        ]}
      >
        {indeterminate ? <Text style={styles.tick}>−</Text> : null}
        {!indeterminate && isChecked && <Text style={styles.tick}>✓</Text>}
        {!indeterminate && !isChecked && hovered && <Text style={styles.hoverTick}>✓</Text>}
      </View>

      {label ? (
        <Text style={[styles.label, labelStyle, disabled && styles.labelDisabled]}>
          {required ? <Text style={styles.required}>* </Text> : null}
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  required: { color: "#8b0000" },
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  box: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#A0A0A0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkedBox: {
    backgroundColor: "#3a8cc5",
    borderColor: "#3a8cc5",
  },
  boxDisabled: {
    backgroundColor: "#FAFAFA",
    borderColor: "#BDBDBD",
  },
  checkedBoxDisabled: {
    backgroundColor: "#9E9E9E",
    borderColor: "#9E9E9E",
  },
  tick: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    userSelect: "none" as any,
  },
  hoverTick: {
    color: "#444444",
    fontSize: 9,
    fontWeight: "bold",
    userSelect: "none" as any,
  },
  label: {
    fontSize: 13,
    marginLeft: 10,
  },
  labelDisabled: {
    color: "#323130",
  },
});
