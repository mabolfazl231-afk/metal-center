import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "danger" | "success" | "outline";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-blue text-white hover:bg-navy",
  ghost: "bg-transparent border border-border-light dark:border-border-dark text-ink dark:text-white hover:bg-steel dark:hover:bg-white/5",
  outline: "bg-transparent border-2 border-blue text-blue hover:bg-blue hover:text-white",
  danger: "bg-danger text-white hover:bg-danger/85",
  success: "bg-success text-white hover:bg-success/85",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-[18px] py-[11px] text-sm",
  lg: "px-6 py-3.5 text-[15px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-all duration-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
