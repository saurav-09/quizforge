function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary:
      "bg-brand text-white hover:bg-brand-hover",
    secondary:
      "border border-border bg-white text-text-primary hover:bg-surface",
    ghost:
      "text-text-secondary hover:bg-surface hover:text-text-primary",
    danger:
      "bg-error text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;