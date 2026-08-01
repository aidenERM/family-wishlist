import type { StatusColor } from '../types';

const ANIMATION: Record<StatusColor, string> = {
  verde: 'animate-pulse-slow',
  naranja: 'animate-blink',
  rojo: 'animate-blink-fast',
};

export default function StatusDot({ status, size = 10 }: { status: StatusColor; size?: number }) {
  return (
    <span
      className={`status-dot status-dot--${status} ${ANIMATION[status]}`}
      style={{ width: size, height: size }}
      aria-label={`estado: ${status}`}
    />
  );
}
