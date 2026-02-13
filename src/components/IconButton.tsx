import type { ComponentType, SVGProps } from "react";

type IconButtonVariant = "neutral" | "danger" | "primary";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  neutral: "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
  danger: "text-red-400 hover:text-red-600 hover:bg-red-50",
  primary: "text-blue-500 hover:text-blue-700 hover:bg-blue-50",
};

interface IconButtonProps {
  icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
  onClick?: () => void;
  variant?: IconButtonVariant;
  title?: string;
}

export function IconButton({
  icon: Icon,
  onClick,
  variant = "neutral",
  title = "",
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${VARIANT_CLASSES[variant]}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
