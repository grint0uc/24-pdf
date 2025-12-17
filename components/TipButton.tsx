"use client";

interface TipButtonProps {
  className?: string;
}

export default function TipButton({ className = "" }: TipButtonProps) {
  const handleClick = () => {
    window.open("https://ko-fi.com/grint0uc", "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center px-4 py-2
        bg-amber-400 text-teal-900 rounded-lg
        hover:bg-amber-300 transition-colors
        text-sm font-medium
        ${className}
      `}
    >
      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      Leave a Tip
    </button>
  );
}
