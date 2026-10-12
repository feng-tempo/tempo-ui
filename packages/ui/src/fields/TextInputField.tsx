import {useTempoTheme} from "../theme";
import { StyleSheet, Platform } from "react-native";
import { TextInput } from "../platform/TextInput";
import { useState } from "react";

export type TextInputFieldProps = {
  value?: string | undefined;
  onChange?: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  placeHolder?: string;
  style?: any;
  disabled?: boolean;
  autoFocus?: boolean;
  borderMode?: "always" | "interaction";
};

export default function TextInputField({
  value,
  onChange,
  onFocus,
  onBlur,
  onSubmitEditing,
  placeHolder,
  style,
  disabled = false,
  autoFocus = false,
  borderMode = "always",
}: TextInputFieldProps) {
  const tempoTheme = useTempoTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: any) => {
    setFocused(true);
    // prevent the whole text from being selected on web
    if (Platform.OS === "web") {
      try {
        const el = e?.target as HTMLInputElement | null;
        if (el && typeof el.setSelectionRange === "function") {
          const len = (el.value ?? "").length;
          // put caret at the end, no selection
          el.setSelectionRange(len, len);
        }
      } catch {
        // fail silently if anything weird happens
      }
    }

    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  return (
    <TextInput
      value={value ?? ""}
      onChangeText={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSubmitEditing={onSubmitEditing}
      {...({
        onPointerEnter: () => setHovered(true),
        onPointerLeave: () => setHovered(false),
      } as any)}
      editable={!disabled}
      autoFocus={autoFocus}
      placeholder={placeHolder}
      placeholderTextColor="#8F8F8F"
      // make sure RN web doesn't auto-select text
      // @ts-ignore: selectTextOnFocus exists in RN
      selectTextOnFocus={false}
      style={[
        styles.textInput,
        tempoTheme.custom && {borderColor:tempoTheme.tokens.controlBorder},
        borderMode === "interaction" && styles.interactionBorderResting,
        borderMode === "interaction" &&
          (hovered || focused) &&
          styles.interactionBorderVisible,
        disabled && styles.textInputDisabled,
        style,
      ]}
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
        // remove the default browser focus ring, we have our own
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
  interactionBorderResting: {
    borderColor: "transparent",
  },
  interactionBorderVisible: {
    borderColor: "#A0A0A0",
  },
});
