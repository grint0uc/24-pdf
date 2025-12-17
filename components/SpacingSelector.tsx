"use client";

import { SpacingType } from "@/lib/pdf-processor";

interface SpacingSelectorProps {
  value: SpacingType;
  onChange: (spacing: SpacingType) => void;
}

export default function SpacingSelector({ value, onChange }: SpacingSelectorProps) {
  const options: { value: SpacingType; label: string; description: string }[] = [
    {
      value: "snug",
      label: "Snug",
      description: "Minimal margins",
    },
    {
      value: "regular",
      label: "Regular",
      description: "Balanced",
    },
    {
      value: "spacious",
      label: "Spacious",
      description: "Generous margins",
    },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Spacing</label>
      <div className="space-y-2" role="radiogroup" aria-label="Page spacing">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={`
              w-full p-3 rounded-lg border-2 transition-all text-left
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${
                value === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`font-medium text-sm ${
                    value === option.value ? "text-blue-700" : "text-gray-900"
                  }`}
                >
                  {option.label}
                </p>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
              <SpacingIcon type={option.value} selected={value === option.value} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SpacingIcon({ type, selected }: { type: SpacingType; selected: boolean }) {
  const color = selected ? "#3B82F6" : "#9CA3AF";

  // Different margin sizes based on spacing type
  const margins: Record<SpacingType, number> = {
    snug: 1,
    regular: 3,
    spacious: 5,
  };
  const m = margins[type];

  return (
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      <rect x="0.5" y="0.5" width="31" height="23" rx="1.5" stroke={color} fill="none" />
      <rect
        x={m + 0.5}
        y={m + 0.5}
        width={31 - m * 2}
        height={23 - m * 2}
        rx="1"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
      />
    </svg>
  );
}
