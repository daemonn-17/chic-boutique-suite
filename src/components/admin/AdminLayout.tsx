import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b bg-card px-4 gap-4">
            <SidebarTrigger />
            <span className="text-sm font-medium text-muted-foreground">Store Administration</span>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
