import { ReactNode } from "react";
import { auth } from "@cms/lib/auth";
import { AdminThemeProvider } from "@cms/components/admin/ThemeProvider";
import { AdminSidebar } from "@cms/components/admin/AdminSidebar";
import { NavigationGuardProvider } from "@cms/components/admin/NavigationGuardProvider";
import { TooltipProvider } from "@cms/components/ui/tooltip";
import { Toaster } from "sonner";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role ?? "VIEWER";
  const userName = session?.user?.name || session?.user?.email || "";

  return (
    <AdminThemeProvider>
      <TooltipProvider delayDuration={0}>
        <NavigationGuardProvider>
          <AdminSidebar role={role} userName={userName}>
            {children}
          </AdminSidebar>
        </NavigationGuardProvider>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </AdminThemeProvider>
  );
}
