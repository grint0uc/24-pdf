"use client";

import { LayoutType } from "@/lib/pdf-processor";

interface LayoutSelectorProps {
  value: LayoutType;
  onChange: (layout: LayoutType) => void;
}

export default function LayoutSelector({
  value,
  onChange,
}: LayoutSelectorProps) {
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
      <label className="block text-sm font-medium text-teal-200">Layout</label>
      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Page layout"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative p-3 rounded-lg border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-teal-800
              ${
                value === option.value
                  ? "border-amber-400 bg-teal-700/80"
                  : "border-teal-600 bg-teal-700/40 hover:border-teal-400 hover:bg-teal-700/60"
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
                  value === option.value ? "text-amber-300" : "text-teal-100"
                }`}
              >
                {option.label}
              </p>
              <p className="text-xs text-teal-300 mt-0.5">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TwoUpIcon({ selected }: { selected: boolean }) {
  const color = selected ? "#FF9F00" : "#66c3c3";
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
      <rect
        x="1"
        y="1"
        width="46"
        height="34"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="4"
        y="4"
        width="18"
        height="28"
        rx="1"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
      />
      <rect
        x="26"
        y="4"
        width="18"
        height="28"
        rx="1"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
      />
    </svg>
  );
}

function FourUpIcon({ selected }: { selected: boolean }) {
  const color = selected ? "#FF9F00" : "#66c3c3";
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
      <rect
        x="1"
        y="1"
        width="46"
        height="34"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="4"
        y="4"
        width="18"
        height="12"
        rx="1"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
      />
      <rect
        x="26"
        y="4"
        width="18"
        height="12"
        rx="1"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
      />
      <rect
        x="4"
        y="20"
        width="18"
        height="12"
        rx="1"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
      />
      <rect
        x="26"
        y="20"
        width="18"
        height="12"
        rx="1"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
      />
    </svg>
  );
}
