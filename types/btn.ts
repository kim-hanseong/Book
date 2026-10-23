export type ButtonEffect = "water" | "gate" | "ripple" | "none";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  effect?: ButtonEffect;
  variant?: "primary" | "secondary";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}
