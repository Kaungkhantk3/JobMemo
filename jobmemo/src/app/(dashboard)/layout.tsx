import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { SidebarWrapper } from "@/components/ui/sidebar-wrapper";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <SidebarWrapper user={session.user}>{children}</SidebarWrapper>;
}
