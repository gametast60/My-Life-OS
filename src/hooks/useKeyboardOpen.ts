import { useState, useEffect } from "react";

/**
 * Returns true when the virtual keyboard is open on mobile.
 * Uses visualViewport resize (falls back to false on unsupported browsers).
 */
export function useKeyboardOpen(): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return; // SSR or unsupported — safe default

    const handler = () => {
      // If visual viewport is significantly shorter than the layout viewport, keyboard is likely open
      setIsOpen(vv.height < window.innerHeight - 150);
    };

    vv.addEventListener("resize", handler);
    return () => vv.removeEventListener("resize", handler);
  }, []);

  return isOpen;
}
