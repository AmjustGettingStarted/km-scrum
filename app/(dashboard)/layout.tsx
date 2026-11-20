import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { getSessionFromCookies } from "@/lib/auth/session";

async function AuthenticatedSidebar() {
  const session = await getSessionFromCookies();
  const userRole = session?.user.role || "DEVELOPER";
  return <AppSidebar userRole={userRole} />;
}

async function AuthenticatedHeader() {
  const session = await getSessionFromCookies();
  const userRole = session?.user.role || "DEVELOPER";
  const userName = session?.user.fullName || session?.user.username || "Team Member";
  return <Header userName={userName} userRole={userRole} />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas-white flex text-charcoal">
      <Suspense fallback={<aside className="w-60 shrink-0 border-r border-ash bg-canvas-white" />}>
        <AuthenticatedSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<header className="h-14 border-b border-ash bg-canvas-white px-6 flex items-center justify-between" />}>
          <AuthenticatedHeader />
        </Suspense>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
