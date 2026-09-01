import { Fragment } from "react";
import { parseRichText } from "@/domain/rich-text";

/**
 * Renders announcement text with **bold** / *italic* support. Each run is a
 * plain string placed as a React child (auto-escaped), so there is no HTML
 * injection surface — see `@/domain/rich-text`.
 */
export function RichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const tokens = parseRichText(text);
  return (
    <span className={className}>
      {tokens.map((token, i) => {
        if (token.type === "bold") {
          return <strong key={i}>{token.value}</strong>;
        }
        if (token.type === "italic") {
          return <em key={i}>{token.value}</em>;
        }
        return <Fragment key={i}>{token.value}</Fragment>;
      })}
    </span>
  );
}
