import { Logo } from "@/components/common/logo";
import { DashboardNav } from "./dashboard-nav";

export function DashboardSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <DashboardNav />
      </div>
    </aside>
  );
}
