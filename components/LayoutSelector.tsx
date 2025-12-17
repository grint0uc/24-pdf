"use client";

import { LayoutType } from "@/lib/pdf-processor";

interface LayoutSelectorProps {
  value: LayoutType;
  onChange: (layout: LayoutType) => void;
}

export default function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  const options: { value: LayoutType; label: string; description: string }[] = [
    {
      value: "2-up",
      label: "2-up",
      description: "2 pages per sheet",
    },
    {
      value: "4-up",
      label: "4-up",
      description: "4 pages per sheet",
    },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Layout</label>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Page layout">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative p-3 rounded-lg border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${
                value === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }
            `}
          >
            {/* Visual representation */}
            <div className="flex justify-center mb-2">
              {option.value === "2-up" ? (
                <TwoUpIcon selected={value === option.value} />
              ) : (
                <FourUpIcon selected={value === option.value} />
              )}
            </div>
            <div className="text-center">
              <p
                className={`font-medium text-sm ${
                  value === option.value ? "text-blue-700" : "text-gray-900"
                }`}
              >
                {option.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TwoUpIcon({ selected }: { selected: boolean }) {
  const color = selected ? "#3B82F6" : "#9CA3AF";
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
      <rect x="1" y="1" width="46" height="34" rx="2" stroke={color} strokeWidth="2" fill="none" />
      <rect x="4" y="4" width="18" height="28" rx="1" fill={color} fillOpacity="0.2" stroke={color} />
      <rect x="26" y="4" width="18" height="28" rx="1" fill={color} fillOpacity="0.2" stroke={color} />
    </svg>
  );
}

function FourUpIcon({ selected }: { selected: boolean }) {
  const color = selected ? "#3B82F6" : "#9CA3AF";
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
      <rect x="1" y="1" width="46" height="34" rx="2" stroke={color} strokeWidth="2" fill="none" />
      <rect x="4" y="4" width="18" height="12" rx="1" fill={color} fillOpacity="0.2" stroke={color} />
      <rect x="26" y="4" width="18" height="12" rx="1" fill={color} fillOpacity="0.2" stroke={color} />
      <rect x="4" y="20" width="18" height="12" rx="1" fill={color} fillOpacity="0.2" stroke={color} />
      <rect x="26" y="20" width="18" height="12" rx="1" fill={color} fillOpacity="0.2" stroke={color} />
    </svg>
  );
}
