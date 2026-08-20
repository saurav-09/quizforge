function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-border bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;