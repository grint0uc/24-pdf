import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-teal-600 bg-teal-800/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-teal-100">
          PDF Combiner
        </Link>
        <nav>
          <Link
            href="/"
            className="text-teal-200 hover:text-white transition-colors"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
