interface DotProps {
  color: string;
  size?: number;
}

export function Dot({ color, size = 8 }: DotProps) {
  return (
    <span
      style={{ backgroundColor: color, width: size, height: size }}
      className="inline-block rounded-full flex-shrink-0"
    />
  );
}
