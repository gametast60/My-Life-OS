/**
 * Accurately count words for Thai, English, and multilingual text.
 * Uses Intl.Segmenter with 'th' locale and 'word' granularity when available,
 * with fallback to whitespace splitting.
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;

  try {
    if (typeof Intl !== "undefined" && typeof (Intl as any).Segmenter === "function") {
      const segmenter = new (Intl as any).Segmenter("th", { granularity: "word" });
      const segments = Array.from(segmenter.segment(text));
      const wordCount = segments.filter((segment: any) => segment.isWordLike).length;
      if (wordCount > 0) return wordCount;
    }
  } catch (err) {
    console.warn("[textUtils] Intl.Segmenter word count fallback triggered:", err);
  }

  // Fallback for browsers without Intl.Segmenter support
  return text.trim().split(/\s+/).filter(Boolean).length;
}
