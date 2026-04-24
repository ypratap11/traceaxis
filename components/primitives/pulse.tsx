type Props = {
  breathing?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-3.5 w-3.5"
} as const;

export function Pulse({ breathing = true, size = "md" }: Props) {
  const animation = breathing ? "animate-breath motion-reduce:animate-none" : "";

  return (
    <span
      data-testid="pulse"
      aria-hidden="true"
      className={`inline-block rounded-full bg-bloom ${sizeClass[size]} ${animation}`.trim()}
    />
  );
}
