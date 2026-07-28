import { useLayoutEffect, useRef, type Ref, type CSSProperties, type TextareaHTMLAttributes } from "react";

interface UseAutoResizeTextareaOptions {
  /** Minimum visible rows (default 3) */
  minRows?: number;
  /** Maximum visible rows before scrolling (default 9) */
  maxRows?: number;
}

interface AutoResizeTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style" | "rows"> {
  ref?: Ref<HTMLTextAreaElement>;
  style?: CSSProperties;
}

/**
 * Shared hook for auto-expanding textareas.
 * - Starts at ~minRows, grows with content up to ~maxRows, then scrolls.
 * - Resizes immediately when `value` changes (handles edit-existing).
 * - Returns a stable ref + spread-ready props to apply to <textarea>.
 */
export function useAutoResizeTextarea(
  value: string,
  opts: UseAutoResizeTextareaOptions = {},
) {
   const { minRows = 3, maxRows = 9 } = opts;
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const lineHeightRef = useRef<number>(0);

  useLayoutEffect(() => {
    const el = internalRef.current;
    if (!el) return;

    // Measure line-height once from computed style
    if (!lineHeightRef.current) {
      const computed = getComputedStyle(el);
      lineHeightRef.current =
        parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5 || 20;
    }

    // Reset height to auto so scrollHeight reflects actual content
    el.style.height = "auto";
    const scrollH = el.scrollHeight;
    const maxH = lineHeightRef.current * maxRows;
    el.style.height = `${Math.min(scrollH, maxH)}px`;
    el.style.overflowY = scrollH > maxH ? "auto" : "hidden";
  }, [value, maxRows]);

  const lineHeight = lineHeightRef.current || 20;

  return {
    ref: internalRef,
    textAreaProps: {
      rows: minRows,
      value,
      style: {
        maxHeight: `${lineHeight * maxRows}px`,
      },
    } as AutoResizeTextareaProps,
  };
}
