"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { LayoutDashboard, LogOut, Mail, UserCircle } from "lucide-react";

type SidebarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type SidebarIcon = ComponentType<{ className?: string }>;

const navItems: { label: string; href: string; icon: SidebarIcon }[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
];

const moreItems: { label: string; href: string; icon: SidebarIcon }[] = [
  { label: "Gmail Sync", href: "/gmail", icon: Mail },
];

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: SidebarIcon;
  pathname: string;
  onNavigate: () => void;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-body transition-smooth
        ${
          active
            ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "text-white/55 hover:bg-white/5 hover:text-white"
        }`}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-4 w-4 shrink-0 text-current opacity-85 transition-transform duration-200 group-hover:scale-105" />
      <span>{label}</span>
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
  const [mounted, setMounted] = useState(false);
  const displayName = user.name ?? "Signed in user";
  const displayEmail = user.email ?? "";
  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const showProfileText = mounted;

  return (
    <aside className="w-55 shrink-0 flex flex-col h-full" style={{ backgroundColor: "var(--color-sidebar-bg)" }}>
      <div className="px-4 py-5 border-b border-white/8">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="h-10 w-34.5 shrink-0">
            <Image
              src="/logo.png"
              alt="JobMemo Logo"
              width={138}
              height={40}
              priority
              className="h-10 w-34.5 object-contain"
            />
          </div>

          {showClose && (
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="text-white/40 hover:text-white transition-colors p-2 rounded-lg shrink-0 hover:bg-white/5"
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-white/25 text-label-sm uppercase px-2.5 mb-2 mt-3">
          Main
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
        <p className="text-white/25 text-label-sm uppercase px-2.5 mb-2 mt-4">
          More
        </p>
        {moreItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={LayoutDashboard}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/8 space-y-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 hover:bg-white/8 transition-colors">
          <UserCircle className="h-5 w-5 shrink-0 text-white/55" />
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#378ADD] text-body-xs font-medium text-white">
            {mounted && user.image ? (
              <Image
                src={user.image}
                alt={displayName}
                width={28}
                height={28}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            {showProfileText ? (
              <>
                <span className="block text-white/85 text-body-sm font-medium truncate">
                  {displayName}
                </span>
                {displayEmail ? (
                  <span className="block text-white/50 text-body-xs truncate">
                    {displayEmail}
                  </span>
                ) : null}
              </>
            ) : (
              <>
                <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                <div className="mt-1 h-3 w-32 rounded bg-white/5 animate-pulse" />
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-body text-white/70 transition-smooth hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        <div className="flex items-center justify-between gap-3 text-body-xs text-white/40 px-1">
          <Link
            href="/privacy"
            className="transition-colors hover:text-white/75"
          >
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white/75">
            Terms
          </Link>
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
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300
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
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/8 transition-smooth" style={{ backgroundColor: "var(--color-sidebar-bg)" }}>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
          <span className="text-white text-body font-semibold">JobMemo</span>
        </div>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
