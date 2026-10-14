import { useJsonEditorDraft } from "./useJsonEditorDraft";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { EditorView, keymap } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, View } from "react-native";
import type {
  JsonCodeEditorFieldHandle,
  JsonCodeEditorFieldProps,
} from "./JsonCodeEditorField.types";

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    minHeight: "0",
    maxHeight: "100%",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    color: "#242424",
    fontSize: "13px",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    height: "100%",
    minHeight: "0",
    fontFamily: "Consolas, 'Cascadia Code', monospace",
    overflow: "auto",
    overscrollBehavior: "contain",
  },
  ".cm-content": {
    minHeight: "100%",
    padding: "10px 0 18px",
    caretColor: "#0061a3",
  },
  ".cm-line": {
    padding: "0 14px 0 8px",
  },
  ".cm-gutters": {
    backgroundColor: "#f7f7f8",
    color: "#737373",
    borderRight: "1px solid #e5e5e5",
  },
  ".cm-activeLine, .cm-activeLineGutter": {
    backgroundColor: "#FFF0E3",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "#cfe8ff !important",
  },
  ".cm-lintRange-error": {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='M0 2.5 L1.5 1 L3 2.5 L4.5 1 L6 2.5' fill='none' stroke='%23c50f1f' stroke-width='1'/%3E%3C/svg%3E\")",
  },
});

const jsonExtensions = [
  json(),
  linter(jsonParseLinter(), { delay: 250 }),
  lintGutter(),
  EditorView.lineWrapping,
  editorTheme,
];

const JsonCodeEditorField = forwardRef<
  JsonCodeEditorFieldHandle,
  JsonCodeEditorFieldProps
>(function JsonCodeEditorField(
  {
    value,
    onChange,
    onValidityChange,
    onFocus,
    onBlur,
    disabled = false,
    showFoldGutter = true,
    showLineNumbers = true,
    placeholder = "Enter JSON",
    style,
  },
  ref,
) {
  const editorViewRef = useRef<EditorView | null>(null);
  const { text, updateText, format } = useJsonEditorDraft({ value, onChange, onValidityChange, disabled });
  const formatRef = useRef(format);
  formatRef.current = format;
  const extensions = useMemo(() => [
    ...jsonExtensions,
    keymap.of([{ key: "Shift-Alt-f", run: () => formatRef.current() }]),
  ], []);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editorViewRef.current?.focus(),
      format: () => {
        if (!format()) return false;
        editorViewRef.current?.focus();
        return true;
      },
    }),
    [format],
  );

  return (
    <View style={[styles.container, style]}>
      <CodeMirror
        value={text}
        width="100%"
        height="100%"
        minHeight="0"
        maxHeight="100%"
        style={{
          height: "100%",
          minHeight: 0,
          maxHeight: "100%",
          overflow: "hidden",
        }}
        placeholder={placeholder}
        extensions={extensions}
        editable={!disabled}
        readOnly={disabled}
        basicSetup={{
          lineNumbers: showLineNumbers,
          foldGutter: showFoldGutter,
          highlightActiveLine: true,
          highlightActiveLineGutter: showLineNumbers,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
          lintKeymap: true,
        }}
        onCreateEditor={(editorView) => {
          editorViewRef.current = editorView;
        }}
        onChange={updateText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
});

export default JsonCodeEditorField;

const styles = StyleSheet.create<any>({
  container: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dedede",
  },
});
