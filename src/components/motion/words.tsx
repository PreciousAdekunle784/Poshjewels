import type { CSSProperties } from "react";

/**
 * Splits text into masked words for the rising headline treatment.
 * Words wrapped in *asterisks* are set in the hairline weight (see `.display .emph`).
 * Screen readers get the sentence once, via aria-label on the parent.
 */
export function Words({ text, offset = 0 }: { text: string; offset?: number }) {
  // Each token is one masked word; `glue` marks text that follows the previous word with no space
  // (e.g. the full stop after an emphasised word), so it rides in the same mask.
  const tokens: { parts: { text: string; emph: boolean }[] }[] = [];
  let previous = "";
  for (const part of text.split(/(\*[^*]+\*)/g)) {
    if (!part) continue;
    const emph = part.startsWith("*") && part.endsWith("*") && part.length > 2;
    const clean = emph ? part.slice(1, -1) : part;
    const glue = tokens.length > 0 && !/\s$/.test(previous) && !/^\s/.test(clean);
    previous = clean;
    clean.split(/\s+/).forEach((word, j) => {
      if (!word) return;
      if (j === 0 && glue) tokens[tokens.length - 1].parts.push({ text: word, emph });
      else tokens.push({ parts: [{ text: word, emph }] });
    });
  }
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} aria-hidden>
          <span className="w">
            <span style={{ "--i": i + offset } as CSSProperties}>
              {t.parts.map((p, k) => (
                <span key={k} className={p.emph ? "emph" : undefined}>
                  {p.text}
                </span>
              ))}
            </span>
          </span>
          {i < tokens.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export function plain(text: string) {
  return text.replace(/\*/g, "");
}
