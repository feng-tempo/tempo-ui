import SimpleLineIcons from "../platform/Icons";
import { Pressable, StyleSheet } from "react-native";

export default function FieldClearButton({
  onPress,
  disabled = false,
  accessibilityLabel = "Clear value",
}: {
  onPress: (event?: any) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      tabIndex={-1}
      focusable={false}
      disabled={disabled}
      onPressIn={(event) => event.stopPropagation?.()}
      onPress={(event) => {
        event.stopPropagation?.();
        event.preventDefault?.();
        onPress(event);
      }}
      style={({ hovered, pressed }: {hovered?:boolean;pressed:boolean}) => [
        styles.button,
        disabled && styles.buttonDisabled,
        hovered && !disabled && styles.buttonHovered,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <SimpleLineIcons name="close" style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 28,
    minHeight: 26,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: "#A0A0A0",
    borderRadius: 0,
    backgroundColor: "#fff",
  },
  buttonDisabled: {
    opacity: 0.3,
    backgroundColor: "#FAFAFA",
  },
  buttonHovered: {
    backgroundColor: "#f0f0f0",
  },
  buttonPressed: {
    backgroundColor: "#E5E5E5",
  },
  icon: {
    fontSize: 12,
  },
});
