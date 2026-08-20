function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-[10px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0B1A] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] text-white shadow-[0_8px_30px_rgba(139,92,246,0.22)] hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(139,92,246,0.35)]",

    secondary:
      "border border-white/10 bg-white/[0.04] text-[#F8FAFC] backdrop-blur-xl hover:border-[#8B5CF6]/40 hover:bg-white/[0.07]",

    ghost:
      "text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC]",
  };

  const sizes = {
    sm: "h-9 px-3.5 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
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