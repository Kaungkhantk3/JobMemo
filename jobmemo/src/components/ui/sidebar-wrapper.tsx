"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Applications", href: "/applications" },
  { label: "Interviews", href: "/interviews" },
];
const moreItems = [
  { label: "Analytics", href: "/analytics" },
  { label: "Gmail Sync", href: "/gmail" },
  { label: "Settings", href: "/settings" },
];

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function NavLink({ href, label }: { href: string; label: string }) {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center px-2.5 py-2 rounded-md text-[13px] transition-colors
          ${
            active
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white/85 hover:bg-white/[0.06]"
          }`}
      >
        {label}
      </Link>
    );
  }

  const Sidebar = ({ showClose = false }: { showClose?: boolean }) => (
    <aside className="w-[220px] flex-shrink-0 bg-[#0f1117] flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <p className="text-white text-[15px] font-medium tracking-tight">
            <span className="mr-1.5">💼</span>JobTracker
          </p>
          <p className="text-white/30 text-[11px] mt-0.5">
            Application Dashboard
          </p>
        </div>
        {showClose && (
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-white/40 hover:text-white transition-colors p-1 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-white/25 text-[10px] uppercase tracking-widest px-2.5 mb-1.5 mt-2">
          Main
        </p>
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <p className="text-white/25 text-[10px] uppercase tracking-widest px-2.5 mb-1.5 mt-4">
          More
        </p>
        {moreItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#378ADD] flex items-center justify-center text-[11px] font-medium text-white flex-shrink-0">
            YO
          </div>
          <span className="text-white/50 text-[12px] truncate">Your Name</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer — close button is inside the sidebar header */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar showClose />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile topbar — hamburger only, no overlapping X */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#0f1117] border-b border-white/[0.08]">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="text-white/70 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-white text-[14px] font-medium">
            💼 JobTracker
          </span>
        </div>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
