import type { StyleProp, ViewStyle } from "react-native";

export type JsonCodeEditorFieldHandle = {
  focus: () => void;
  format: () => boolean;
};

export type JsonCodeEditorFieldProps = {
  value?: unknown;
  onChange?: (value: unknown) => void;
  onValidityChange?: (isValid: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  showFoldGutter?: boolean;
  showLineNumbers?: boolean;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};
