import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-brown-600 bg-brown-900">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          2up4up
        </Link>
        <nav>
          <Link
            href="/"
            className="text-brown-200 hover:text-white transition-colors"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
