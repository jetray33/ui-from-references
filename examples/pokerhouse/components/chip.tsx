/**
 * Chip — filter pill used in c08 game-list.
 *
 * Tokens: design-tokens.json (v0.1.0)
 *
 * No emoji, no inline hex, no arbitrary Tailwind values.
 */
import type { ReactNode } from "react";

type ChipProps = {
  active?: boolean;
  size?: "md" | "sm";
  children: ReactNode;
  onClick?: () => void;
};

export function Chip({ active = false, size = "md", children, onClick }: ChipProps) {
  const sizing = size === "md" ? "h-10 px-4 text-caption" : "h-8 px-3 text-micro";

  const styling = active
    ? "bg-accent-primary text-text-inverse font-bold"
    : "bg-bg-raised border border-border-subtle text-text-secondary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-pill whitespace-nowrap transition-colors duration-fast ${sizing} ${styling}`}
    >
      {children}
    </button>
  );
}
