"use client";

import { OrientationType } from "@/lib/pdf-processor";

interface OrientationSelectorProps {
  value: OrientationType;
  onChange: (orientation: OrientationType) => void;
}

export default function OrientationSelector({
  value,
  onChange,
}: OrientationSelectorProps) {
  const options: {
    value: OrientationType;
    label: string;
    description: string;
  }[] = [
    {
      value: "landscape",
      label: "Landscape",
      description: "Horizontal layout",
    },
    {
      value: "portrait",
      label: "Portrait",
      description: "Vertical layout",
    },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Orientation
      </label>
      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Page orientation"
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
              focus:outline-none focus:ring-2 focus:ring-[#c41e3a] focus:ring-offset-2 focus:ring-offset-brown-800
              ${
                value === option.value
                  ? "border-[#c41e3a] bg-brown-700"
                  : "border-brown-500 bg-brown-700/50 hover:border-brown-300 hover:bg-brown-700"
              }
            `}
          >
            {/* Visual representation */}
            <div className="flex justify-center mb-2">
              {option.value === "landscape" ? (
                <LandscapeIcon selected={value === option.value} />
              ) : (
                <PortraitIcon selected={value === option.value} />
              )}
            </div>
            <div className="text-center">
              <p
                className={`font-medium text-sm ${
                  value === option.value ? "text-[#c41e3a]" : "text-white"
                }`}
              >
                {option.label}
              </p>
              <p className="text-xs text-brown-300 mt-0.5">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LandscapeIcon({ selected }: { selected: boolean }) {
  const color = selected ? "#c41e3a" : "#ffffff";
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
      <rect
        x="4"
        y="6"
        width="40"
        height="24"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity="0.1"
      />
      <line
        x1="12"
        y1="12"
        x2="36"
        y2="12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="18"
        x2="30"
        y2="18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="24"
        x2="24"
        y2="24"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PortraitIcon({ selected }: { selected: boolean }) {
  const color = selected ? "#c41e3a" : "#ffffff";
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
      <rect
        x="14"
        y="2"
        width="20"
        height="32"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity="0.1"
      />
      <line
        x1="18"
        y1="8"
        x2="30"
        y2="8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="14"
        x2="28"
        y2="14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="20"
        x2="26"
        y2="20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
