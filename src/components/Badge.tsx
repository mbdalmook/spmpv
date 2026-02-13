import type { ReactNode } from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "md"
  | "manager"
  | "senior"
  | "staff";

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  error: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  neutral: "bg-gray-50 text-gray-600 border border-gray-200",
  md: "bg-blue-100 text-blue-700 border border-blue-200",
  manager: "bg-orange-100 text-orange-700 border border-orange-200",
  senior: "bg-slate-100 text-slate-600 border border-slate-200",
  staff: "bg-gray-100 text-gray-500 border border-gray-200",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variantClasses = BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
}
