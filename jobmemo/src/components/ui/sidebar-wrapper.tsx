"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";

type SidebarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const navItems = [{ label: "Dashboard", href: "/" }];

const moreItems: { label: string; href: string }[] = [];

function NavLink({
  href,
  label,
  pathname,
  onNavigate,
}: {
  href: string;
  label: string;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center px-2.5 py-2 rounded-md text-[13px] transition-colors
        ${
          active
            ? "bg-white/10 text-white"
            : "text-white/50 hover:text-white/85 hover:bg-white/6"
        }`}
    >
      {label}
    </Link>
  );
}

function Sidebar({
  pathname,
  onNavigate,
  onClose,
  user,
  showClose = false,
}: {
  pathname: string;
  onNavigate: () => void;
  onClose: () => void;
  user: SidebarUser;
  showClose?: boolean;
}) {
  const displayName = user.name ?? "Signed in user";
  const displayEmail = user.email ?? "";
  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="w-55 shrink-0 bg-[#0f1117] flex flex-col h-full">
      <div className="px-4 py-5 border-b border-white/8">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="px-6 py-6 border-b border-white/8">
            <Image
              src="/logo.png"
              alt="JobMemo Logo"
              width={150}
              height={40}
              priority
              className="h-auto w-auto object-contain"
            />
          </div>

          {showClose && (
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="text-white/40 hover:text-white transition-colors p-1 rounded shrink-0"
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
      </div>
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-white/25 text-[10px] uppercase tracking-widest px-2.5 mb-1.5 mt-2">
          Main
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
        <p className="text-white/25 text-[10px] uppercase tracking-widest px-2.5 mb-1.5 mt-4">
          More
        </p>
        {moreItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#378ADD] flex items-center justify-center text-[11px] font-medium text-white shrink-0 overflow-hidden">
            {user.image ? (
              <Image
                src={user.image}
                alt={displayName}
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <span className="block text-white/85 text-[12px] truncate">
              {displayName}
            </span>
            {displayEmail ? (
              <span className="block text-white/50 text-[11px] truncate">
                {displayEmail}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-2 text-[13px] text-white/70 hover:text-white bg-transparent rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export function SidebarWrapper({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SidebarUser;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          pathname={pathname}
          onNavigate={() => setOpen(false)}
          onClose={() => setOpen(false)}
          user={user}
        />
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
        <Sidebar
          pathname={pathname}
          onNavigate={() => setOpen(false)}
          onClose={() => setOpen(false)}
          user={user}
          showClose
        />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile topbar — hamburger only, no overlapping X */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#0f1117] border-b border-white/8">
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
          <span className="text-white text-[14px] font-medium">JobMemo</span>
        </div>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
