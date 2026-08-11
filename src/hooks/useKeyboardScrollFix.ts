import { useEffect } from "react";

/**
 * Global fix: on mobile, when the virtual keyboard opens (visualViewport shrinks),
 * ensure the currently focused input/textarea is scrolled into view so the
 * keyboard does not hide it. Smooth, 150–200ms feel.
 *
 * Safe no-op on desktop / browsers without visualViewport.
 */
export function useKeyboardScrollFix(): void {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const scrollFocusedIntoView = () => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      const tag = active.tagName.toLowerCase();
      if (tag !== "input" && tag !== "textarea" && !active.isContentEditable) return;

      const vvRect = {
        top: vv.offsetTop,
        bottom: vv.offsetTop + vv.height,
      };

      const elRect = active.getBoundingClientRect();
      const margin = 16;

      // Special handling for tall textareas: track caret line instead of centering full element
      if (tag === "textarea") {
        const ta = active as HTMLTextAreaElement;
        const textBeforeCaret = ta.value.substring(0, ta.selectionStart || 0);
        const lineIndex = textBeforeCaret.split("\n").length;
        const lineHeight = 24;
        const caretRectTop = elRect.top + Math.min(elRect.height, lineIndex * lineHeight);

        if (caretRectTop + 40 > vvRect.bottom || caretRectTop - 40 < vvRect.top) {
          const targetY = window.scrollY + caretRectTop - (vv.offsetTop + vv.height / 2);
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: "smooth",
          });
        }
        return;
      }

      if (elRect.bottom + margin > vvRect.bottom || elRect.top - margin < vvRect.top) {
        const targetY =
          window.scrollY +
          (elRect.top + elRect.height / 2) -
          (vv.offsetTop + vv.height / 2);

        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: "smooth",
        });
      }
    };

    const onResize = () => {
      // small debounce via rAF
      requestAnimationFrame(() => requestAnimationFrame(scrollFocusedIntoView));
    };
    const onScroll = () => {
      requestAnimationFrame(scrollFocusedIntoView);
    };

    // also trigger whenever focus changes inside an editable element
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || target.isContentEditable) {
        setTimeout(scrollFocusedIntoView, 150);
      }
    };

    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onScroll);
    window.addEventListener("focusin", onFocusIn);

    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onScroll);
      window.removeEventListener("focusin", onFocusIn);
    };
  }, []);
}
