import type { ReactNode } from "react";

export interface SummaryCard {
  icon?: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}

interface SummaryCardsProps {
  cards: SummaryCard[];
}

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${Math.min(cards.length, 5)}, minmax(0, 1fr))`,
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 p-4 flex items-start gap-3"
        >
          {card.icon && <div className="mt-0.5">{card.icon}</div>}
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{card.value}</p>
            {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
