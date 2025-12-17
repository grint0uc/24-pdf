"use client";

import { SpacingType } from "@/lib/pdf-processor";

interface SpacingSelectorProps {
  value: SpacingType;
  onChange: (spacing: SpacingType) => void;
}

export default function SpacingSelector({
  value,
  onChange,
}: SpacingSelectorProps) {
  const options: { value: SpacingType; label: string; description: string }[] =
    [
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
      <label className="block text-sm font-medium text-teal-200">Spacing</label>
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
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-teal-800
              ${
                value === option.value
                  ? "border-amber-400 bg-teal-700/80"
                  : "border-teal-600 bg-teal-700/40 hover:border-teal-400 hover:bg-teal-700/60"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`font-medium text-sm ${
                    value === option.value ? "text-amber-300" : "text-teal-100"
                  }`}
                >
                  {option.label}
                </p>
                <p className="text-xs text-teal-300">{option.description}</p>
              </div>
              <SpacingIcon
                type={option.value}
                selected={value === option.value}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SpacingIcon({
  type,
  selected,
}: {
  type: SpacingType;
  selected: boolean;
}) {
  const color = selected ? "#FF9F00" : "#66c3c3";

  // Different margin sizes based on spacing type
  const margins: Record<SpacingType, number> = {
    snug: 1,
    regular: 3,
    spacious: 5,
  };
  const m = margins[type];

  return (
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="23"
        rx="1.5"
        stroke={color}
        fill="none"
      />
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
