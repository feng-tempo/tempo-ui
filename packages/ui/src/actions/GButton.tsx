import type {ReactNode} from 'react';
import {useTempoTheme} from "../theme";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  ViewStyle,
  StyleProp,
  TextStyle,
} from "react-native";

export type GButtonProps = {
  label?: string;
  children?: ReactNode;
  theme?: "primary" | "secondary";
  onPress?: () => void;
  disabled?: boolean;
  btnCtnStyle?: StyleProp<ViewStyle>;
  btnStyle?: StyleProp<ViewStyle>;
  btnHoveredStyle?: StyleProp<ViewStyle>;
  btnPressedStyle?: StyleProp<ViewStyle>;
  btnLabelStyle?: StyleProp<TextStyle>;
};

export default function GButton({
  label,
  children,
  theme = "secondary",
  onPress,
  disabled,
  btnCtnStyle,
  btnStyle,
  btnHoveredStyle,
  btnPressedStyle,
  btnLabelStyle,
}: GButtonProps) {
  const tempoTheme = useTempoTheme();
  const isPrimary = theme === "primary";

  return (
    <View
      style={[
        styles.btnContainer,
        isPrimary && styles.btnContainerPrimary,
        btnCtnStyle,
        disabled && styles.btnContainerDisabled,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{disabled:!!disabled}}
        disabled={disabled}
        style={({ hovered, pressed }: {hovered?:boolean;pressed:boolean}) => [
          styles.button,
          isPrimary && styles.buttonPrimary,
          tempoTheme.custom && isPrimary && {backgroundColor:tempoTheme.tokens.primary},
          btnStyle,
          hovered && !isPrimary && styles.buttonHovered,
          hovered && isPrimary && styles.buttonPrimaryHovered,
          hovered && btnHoveredStyle,
          pressed && !isPrimary && styles.buttonPressed,
          pressed && isPrimary && styles.buttonPrimaryPressed,
          pressed && btnPressedStyle,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
      >
        {children ?? (
          <Text
            selectable={false}
            style={[
              styles.buttonLabel,
              isPrimary && styles.buttonLabelPrimary,
              btnLabelStyle,
              disabled && styles.buttonLabelDisabled,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "darkgray",
  },
  btnContainerPrimary: {
    borderColor: "#1b5f99",
  },
  btnContainerDisabled: {
    borderWidth: 1,
    borderColor: "transparent",
  },

  button: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  /* ===== Secondary (existing behavior) ===== */
  buttonHovered: {
    backgroundColor: "#f0f0f0",
  },
  buttonPressed: {
    backgroundColor: "#E5E5E5",
  },

  /* ===== Primary theme ===== */
  buttonPrimary: {
    backgroundColor: "#2685cc",
  },
  buttonPrimaryHovered: {
    backgroundColor: "#1e73b5",
  },
  buttonPrimaryPressed: {
    backgroundColor: "#185f97",
  },

  /* ===== Disabled ===== */
  buttonDisabled: {
    backgroundColor: "#E0E0E0",
  },

  buttonLabel: {
    fontSize: 12,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    color: "#000",
  },
  buttonLabelPrimary: {
    color: "#fff",
  },
  buttonLabelDisabled: {
    color: "#7A7A7A",
  },
});
