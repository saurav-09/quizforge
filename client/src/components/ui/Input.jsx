function Input({
  label,
  error,
  className = "",
  id,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:border-brand focus:ring-2 focus:ring-brand/10 ${className}`}
        {...props}
      />

      {error && (
        <p className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;