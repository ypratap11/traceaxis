type Props = {
  active?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-3.5 w-3.5"
} as const;

export function Pulse({ active = true, size = "md" }: Props) {
  return (
    <span
      data-testid="pulse"
      aria-hidden="true"
      className={`inline-block rounded-full bg-bloom ${sizeClass[size]} ${
        active ? "animate-breath" : ""
      }`}
    />
  );
}
