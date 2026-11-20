import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas-white flex text-charcoal">
      <AppSidebar userRole="MANAGER" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userName="Demo Administrator" userRole="MANAGER" />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
