import Link from "next/link";
import type { ReactNode } from "react";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}

export function Button({ href, children, variant = "primary", className }: ButtonProps) {
  const cls = `btn ${variant === "primary" ? "btn-primary" : "btn-ghost"}${className ? ` ${className}` : ""}`;
  const external = href.startsWith("mailto:") || href.startsWith("http");
  if (external) {
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }
  return (
    <Link className={cls} href={href}>
      {children}
    </Link>
  );
}
