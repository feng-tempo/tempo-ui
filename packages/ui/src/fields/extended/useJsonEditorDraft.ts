import { useEffect, useRef, useState } from "react";
import type { JsonCodeEditorFieldProps } from "./JsonCodeEditorField.types";

const stringify = (value: unknown) => value === undefined ? "" : JSON.stringify(value, null, 2);
const parse = (text: string): unknown => {
  if (!text.trim()) throw new Error("JSON is required.");
  return JSON.parse(text);
};

/** Own invalid text locally; only parsed values cross the document boundary. */
export function useJsonEditorDraft({ value, onChange, onValidityChange, disabled }: JsonCodeEditorFieldProps) {
  const [text, setText] = useState(() => stringify(value));
  const textRef = useRef(text);
  const lastEmitted = useRef<string | null>(null);
  const validityCallback = useRef(onValidityChange);
  validityCallback.current = onValidityChange;

  useEffect(() => {
    const next = stringify(value);
    if (lastEmitted.current === next) {
      lastEmitted.current = null;
      return;
    }
    textRef.current = next;
    setText(next);
    let valid = true;
    try { parse(next); } catch { valid = false; }
    validityCallback.current?.(valid);
  }, [value]);

  const updateText = (next: string) => {
    if (disabled) return;
    textRef.current = next;
    setText(next);
    let parsed: unknown;
    try { parsed = parse(next); } catch {
      lastEmitted.current = null;
      onValidityChange?.(false);
      return;
    }
    lastEmitted.current = stringify(parsed);
    onValidityChange?.(true);
    onChange?.(parsed);
  };

  const format = () => {
    if (disabled) return false;
    let parsed: unknown;
    try { parsed = parse(textRef.current); } catch {
      onValidityChange?.(false);
      return false;
    }
    updateText(stringify(parsed));
    return true;
  };

  return { text, updateText, format };
}
