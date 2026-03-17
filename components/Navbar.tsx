"use client";

import Link from "next/link";
import { useState } from "react";
import { EdenLogo } from "@/components/EdenLogo";

const links = [
  { href: "/whitelist", label: "📝 Whitelist" },
  { href: "/normas", label: "📚 Normativas" },
  { href: "/tienda", label: "🛒 Tienda" },
  { href: process.env.NEXT_PUBLIC_DISCORD_INVITE || "#", label: "💬 Discord", external: true },
  { href: "/admin", label: "🛡️ Admin" }
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-black/55">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <EdenLogo />

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) =>
              link.external ? (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="nav-pill">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href} className="nav-pill">
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl md:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {open ? (
          <nav className="mt-4 grid gap-2 md:hidden">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-pill justify-center"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href} className="nav-pill justify-center" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              )
            )}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
