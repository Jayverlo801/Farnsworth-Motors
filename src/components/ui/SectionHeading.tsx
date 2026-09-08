import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  index: string;
  label: string;
  title: ReactNode;
  small?: boolean;
  className?: string;
}

export function SectionHeading({ index, label, title, small = false, className }: SectionHeadingProps) {
  return (
    <Reveal className={className}>
      <p className="eyebrow mb-7">
        {index} / {label}
      </p>
      <h2 className={small ? "display-sm" : "display"}>{title}</h2>
    </Reveal>
  );
}
