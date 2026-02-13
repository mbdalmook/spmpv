import type { ComponentType, ReactNode, SVGProps } from "react";

type ButtonVariant = "primary" | "danger" | "secondary";
type ButtonSize = "sm" | "md";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function PrimaryButton({
  children,
  onClick,
  icon: Icon,
  disabled = false,
  variant = "primary",
  size = "md",
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
