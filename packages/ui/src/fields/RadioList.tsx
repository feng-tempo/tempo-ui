import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";

export type RadioOption = {
  value: string;
  label: string;
};

export type RadioListProps = {
  options: RadioOption[];
  value?: RadioOption | null;
  onChange?: (value: RadioOption | null) => void;
  onFocus?: () => void;   // group focus
  onBlur?: () => void;    // group blur
  style?: any;            // controllerFocus / controllerError
  horizontial?: boolean;
  disabled?: boolean;
};

export default function RadioList({
  options,
  value,
  onChange,
  onFocus,
  onBlur,
  style,
  horizontial,
  disabled = false,
}: RadioListProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focusedOption, setFocusedOption] = useState<string | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // value is always RadioOption (or null/undefined)
  const currentValue = value?.value ?? "";

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  const handleOptionFocus = (optionValue: string) => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }

    setFocusedOption(optionValue);
    onFocus?.();
  };

  const handleOptionBlur = (optionValue: string) => {
    setFocusedOption((current) => (current === optionValue ? null : current));

    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
    }

    blurTimerRef.current = setTimeout(() => {
      blurTimerRef.current = null;
      onBlur?.();
    }, 0);
  };

  const handleSelect = (option: RadioOption) => {
    if (disabled) return;
    onFocus?.();
    onChange?.(option);
  };

  return (
    <View accessibilityRole="radiogroup" style={horizontial ? styles.containerHorizontal : styles.container}>
      {options.map((option) => {
        const selected = option.value === currentValue;
        const isFocused = focusedOption === option.value;

        return (
          <View key={option.value} style={styles.itemContainer}>
            <Pressable
              onPress={() => handleSelect(option)}
              accessibilityRole="radio" accessibilityLabel={option.label}
              {...(Platform.OS === "web" ? {"aria-checked":selected, onKeyDown:(event:any)=>{
                if(event.key === " " && !event.repeat){event.preventDefault();handleSelect(option);}
                if(["ArrowDown","ArrowRight","ArrowUp","ArrowLeft"].includes(event.key)&&!disabled){event.preventDefault();const direction=["ArrowDown","ArrowRight"].includes(event.key)?1:-1;const next=(options.indexOf(option)+direction+options.length)%options.length;handleSelect(options[next]);event.currentTarget.closest('[role=radiogroup]')?.querySelectorAll('[role=radio]')[next]?.focus();}
              }} : {})}
              disabled={disabled}
              // ⬇ same focus behaviour you had
              onFocus={() => handleOptionFocus(option.value)}
              onBlur={() => handleOptionBlur(option.value)}
              onHoverIn={() => setHovered(option.value)}
              onHoverOut={() => setHovered(null)}
              style={({ pressed }) => [
                styles.itemPressable,
                pressed && styles.itemPressed,
                Platform.OS === "web"
                  ? ({
                      cursor: disabled ? "default" : "pointer",
                      outlineWidth: 0,
                      outlineStyle: "none",
                    } as any)
                  : undefined,
              ]}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    disabled && styles.radioOuterDisabled,
                    selected && styles.radioOuterSelected,
                    disabled && selected && styles.radioOuterSelectedDisabled,

                    // keep your focus style hook on outer circle
                    isFocused && style,
                  ]}
                />

                {!disabled && !selected && hovered === option.value && (
                  <View  style={styles.radioInnerHovered} />
                )}
                {selected && (
                  <View style={[styles.radioInner, disabled && styles.radioInnerDisabled]} />
                )}
              </View>
            </Pressable>

            <Text style={[styles.label, disabled && styles.labelDisabled]}>{option.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "column" },
  containerHorizontal: { flexDirection: "row", flexWrap: "wrap", columnGap: 16 },

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },

  itemPressable: {},
  itemPressed: { opacity: 0.85 },

  radioContainer: {
    position: "relative",
    width: 16,
    height: 16,
  },

  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    backgroundColor: "#fff",
  },

  radioOuterSelected: {
    borderColor: "#3a8cc5",
  },
  radioOuterDisabled: {
    backgroundColor: "#FAFAFA",
    borderColor: "#BDBDBD",
  },
  radioOuterSelectedDisabled: {
    borderColor: "#9E9E9E",
  },

  radioInner: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 4,
    left: 4,
    backgroundColor: "#3a8cc5",
  },
  radioInnerDisabled: {
    backgroundColor: "#9E9E9E",
  },

  radioInnerHovered: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 4,
    left: 4,
    backgroundColor: "#444",
  },

  label: {
    fontSize: 14,
    color: "#333",
    paddingRight: 12,
  },
  labelDisabled: {
    color: "#323130",
  },
});

