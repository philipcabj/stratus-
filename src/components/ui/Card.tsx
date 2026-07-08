interface CardProps {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, right, children, className = '' }: CardProps) {
  return (
    <div className={`bg-card rounded-2xl border border-line shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-line">
          <h3 className="font-archivo font-600 text-sm text-ink">{title}</h3>
          {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
