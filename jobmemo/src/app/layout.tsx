import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobTracker",
  description: "Track your job applications",
};

const navItems = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "Applications", href: "/applications", icon: "file-text" },
  { label: "Interviews", href: "/interviews", icon: "calendar" },
  { label: "Analytics", href: "/analytics", icon: "chart-bar" },
  { label: "Gmail Sync", href: "/gmail", icon: "mail" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex h-screen overflow-hidden bg-zinc-100 font-sans antialiased">
        {/* Sidebar */}
        <aside className="w-[220px] flex-shrink-0 bg-[#0f1117] flex flex-col">
          <div className="px-5 py-5 border-b border-white/[0.08]">
            <p className="text-white text-[15px] font-medium tracking-tight">
              <span className="mr-1.5">💼</span>JobMemo
            </p>
            <p className="text-white/30 text-[11px] mt-0.5">
              Application Dashboard
            </p>
          </div>

          <nav className="flex-1 px-2.5 py-3 space-y-0.5">
            <p className="text-white/25 text-[10px] uppercase tracking-widest px-2.5 mb-1.5 mt-2">
              Main
            </p>
            {navItems.slice(0, 3).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-white/50 hover:text-white/85 hover:bg-white/[0.06] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <p className="text-white/25 text-[10px] uppercase tracking-widest px-2.5 mb-1.5 mt-4">
              More
            </p>
            {navItems.slice(3).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-white/50 hover:text-white/85 hover:bg-white/[0.06] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#378ADD] flex items-center justify-center text-[11px] font-medium text-white">
                YO
              </div>
              <span className="text-white/50 text-[12px]">Your Name</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
