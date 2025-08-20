// PlayingCard.tsx
import React from "react";

type Suit = "s" | "h" | "d" | "c";
const suitChar: Record<Suit, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
const isRed = (s: Suit) => s === "h" || s === "d";

function parseCard(code: string): { rank: string; suit: Suit } {
  const raw = code.trim();
  const last = raw.slice(-1).toLowerCase();
  if ("shdc".includes(last)) return { rank: raw.slice(0, -1).toUpperCase(), suit: last as Suit };

  const sym = raw.slice(-1);
  const symMap: Record<string, Suit> = { "♠": "s", "♥": "h", "♦": "d", "♣": "c" };
  if (symMap[sym]) return { rank: raw.slice(0, -1).toUpperCase(), suit: symMap[sym] };

  return { rank: raw.toUpperCase(), suit: "s" };
}

export function PlayingCard({
  code,
  className = "",
}: { code: string; className?: string }) {
  const { rank, suit } = parseCard(code);
  const red = isRed(suit);

  // Slightly smaller center text for '10' so it stays perfectly centered
  const centerSize = rank === "10" ? "text-2xl" : "text-3xl";

  return (
    <div
className="relative w-12 h-20 rounded-lg bg-gray-100 border border-gray-300 shadow-md overflow-hidden select-none 
             transition-transform duration-200 hover:scale-105"      aria-label={`${rank}${suitChar[suit]}`}
    >
      {/* subtle inner bevel */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/60 pointer-events-none" />
      <div className="absolute inset-0 rounded-[1rem] bg-gradient-to-br from-white/40 to-black/0 pointer-events-none" />

      {/* TOP-LEFT suit (exact corner) */}
      <div
        className={`absolute top-2 left-2 ${red ? "text-red-600" : "text-gray-900"} text-base leading-none`}
      >
        {suitChar[suit]}
      </div>

      {/* BOTTOM-RIGHT suit (exact corner) */}
      <div
        className={`absolute bottom-2 right-2 ${red ? "text-red-600" : "text-gray-900"} text-base leading-none`}
      >
        {suitChar[suit]}
      </div>

      {/* BIG CENTERED RANK (true center via 50%/50% + translate) */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] ${centerSize}
                    ${red ? "text-red-700" : "text-gray-900"} font-black tracking-tight leading-none text-center`}
        style={{
          // white "stroke" so it pops like printed cards (better cross-browser than WebkitTextStroke)
          textShadow:
            "0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff, 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff",
        }}
      >
        {rank}
      </div>
    </div>
  );
}
