import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverLift?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = { none: "", sm: "p-4", md: "p-5", lg: "p-7" };

export default function Card({
  glass,
  hoverLift,
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-card border border-border-light bg-white shadow-soft transition-all duration-btn dark:border-border-dark dark:bg-surface-dark
        ${glass ? "bg-white/70 backdrop-blur-xl dark:bg-navy/60" : ""}
        ${hoverLift ? "hover:-translate-y-1 hover:shadow-lifted" : ""}
        ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
