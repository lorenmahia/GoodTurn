export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 30" className={className} aria-hidden fill="#4a6bd6">
      {/* stylized eagle: two swept wings meeting at a head */}
      <path d="M24 12C19 3 9 0 1 3c7 3 10 6 12 13 3-5 7-6 11-2 4-4 8-3 11 2C37 9 40 6 47 3 39 0 29 3 24 12Z" />
      <circle cx="24" cy="15" r="3" />
      <path d="M24 18l-3 9h6l-3-9Z" />
    </svg>
  );
}
