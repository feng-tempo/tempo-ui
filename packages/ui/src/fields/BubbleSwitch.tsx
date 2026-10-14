// app/components/ui/web/form/fields/BubbleSwitch.tsx
import { useRef, useState, useEffect } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type BubbleSwitchProps = {
  value?: boolean;
  // BaseFormField contract:
  placeholder?: string;           // not used
  onChange?: (val: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;                    // receives controllerError/controllerFocus
  disabled?: boolean;
  variant?: "toggle" | "choice";
  falseLabel?: string;
  trueLabel?: string;
  activeLabelColor?: string;
};

const ON_COLOR = "#357fb6";
const ON_DISABLED_COLOR = "#2f6f9f";

export default function BubbleSwitch({
  value,
  onChange,
  onFocus,
  onBlur,
  style,
  disabled = false,
  variant = "toggle",
  falseLabel,
  trueLabel,
  activeLabelColor = "#1550a9ff",
}: BubbleSwitchProps) {
  const [isOn, setIsOn] = useState(!!value);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  // sync internal state with form value
  useEffect(() => {
    setIsOn(!!value);
  }, [value]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isOn ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.circle),
      useNativeDriver: true,
    }).start();
  }, [isOn, anim]);

  const toggle = () => {
    if (disabled) return;
    const next = !isOn;
    setIsOn(next);
    onChange?.(next);
  };

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  const isChoice = variant === "choice";
  const hasLabels = Boolean(falseLabel || trueLabel);

  return (
    <View style={styles.trackCtn}>
      <Pressable
        onPress={toggle}
        role="switch"
        accessibilityRole="switch"
        accessibilityState={{ checked: isOn, disabled }}
        {...(Platform.OS === "web" ? ({ "aria-checked": isOn } as any) : {})}
        {...(Platform.OS === "web" ? { onKeyDown: (event: any) => { if (event.key === " " && !event.repeat) { event.preventDefault(); toggle(); } } } : {})}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        style={[
          styles.pressableRow,
          hasLabels && styles.pressableRowWithLabels,
          Platform.OS === "web"
            ? ({ outlineWidth: 0, outlineStyle: "none" } as any)
            : undefined,
        ]}
      >
        {/* 👉 controllerError/controllerFocus from SingleForm land here */}
        {hasLabels ? (
          <Text
            style={[
              styles.optionLabel,
              !isOn && styles.optionLabelActive,
              !isOn && { color: activeLabelColor },
              disabled && styles.optionLabelDisabled,
            ]}
          >
            {falseLabel ?? "No"}
          </Text>
        ) : null}
        <View
          style={[
            isChoice ? styles.choiceTrack : styles.track,
            disabled && styles.trackDisabled,
            style,
            isOn && (isChoice ? styles.choiceTrackOn : styles.trackOn),
            disabled && isOn && styles.trackOnDisabled,
          ]}
        >
          <Animated.View
            style={[
              isChoice ? styles.choiceBubble : styles.bubble,
              disabled && styles.bubbleDisabled,
              { transform: [{ translateX }] },
              Platform.OS === "web"
                ? ({ boxShadow: "0 0 3px rgba(0,0,0,0.2)" } as any)
                : undefined,
            ]}
          />
        </View>
        {hasLabels ? (
          <Text
            style={[
              styles.optionLabel,
              isOn && styles.optionLabelActive,
              isOn && { color: activeLabelColor },
              disabled && styles.optionLabelDisabled,
            ]}
          >
            {trueLabel ?? "Yes"}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  trackCtn: {
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  // row-level layout only
  pressableRow: {
    alignSelf: "flex-start",
  },
  pressableRowWithLabels: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: "#64748b",
    userSelect: "none" as any,
  },
  optionLabelActive: {
    fontWeight: "600" as any,
  },
  optionLabelDisabled: {
    color: "#8a8a8a",
  },
  // this is the "input" surface, like TextInput
  track: {
    width: 46,
    position: "relative",
    height: 22,
    borderRadius: 13,
    backgroundColor: "#ccc",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#A0A0A0", // base same as text input
  },
  choiceTrack: {
    width: 46,
    position: "relative",
    height: 22,
    borderRadius: 13,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#A0A0A0",
  },
  trackOn: {
    backgroundColor: ON_COLOR,
    borderColor: ON_COLOR,
  },
  choiceTrackOn: {
    backgroundColor: "#f8fafc",
    borderColor: "#A0A0A0",
  },
  trackDisabled: {
    backgroundColor: "#B0B0B0",
    borderColor: "#8A8A8A",
  },

  trackOnDisabled: {
    backgroundColor: ON_DISABLED_COLOR,
    borderColor: ON_DISABLED_COLOR,
  },

  bubbleDisabled: {
    backgroundColor: "#FFFFFF",
  },
  bubble: {
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 2,
  },
  choiceBubble: {
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: ON_COLOR,
    elevation: 2,
  },
});
