/** Renders admin text where *words in asterisks* are set in italic. */
export function Emph({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em> : <span key={i}>{part}</span>,
      )}
    </>
  );
}
