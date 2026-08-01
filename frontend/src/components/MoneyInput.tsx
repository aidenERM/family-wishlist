function formatDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('es-CO').format(Number(digits));
}

export function parseDigits(formatted: string): number {
  const digits = formatted.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export default function MoneyInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  className,
  autoFocus,
  placeholder,
}: {
  value: string;
  onChange: (raw: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      autoFocus={autoFocus}
      inputMode="numeric"
      className={className}
      value={formatDigits(value)}
      placeholder={placeholder}
      onChange={(e) => onChange(String(parseDigits(e.target.value)))}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
}
