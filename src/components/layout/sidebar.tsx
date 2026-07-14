"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Armchair,
  BookOpen,
  ClipboardList,
  ChefHat,
  Receipt,
  CalendarDays,
  Package,
  User,
  Settings,
  Menu,
  X,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tables", label: "Tables", icon: Armchair },
  { href: "/menu", label: "Menu", icon: BookOpen },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4">
        <UtensilsCrossed className="mr-2 h-6 w-6 text-orange-500" />
        <span className="text-lg font-bold tracking-tight">RMS</span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile header with sheet */}
      <div className="lg:hidden flex h-14 items-center justify-between border-b bg-background px-4 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-orange-500" />
          <span className="text-lg font-bold tracking-tight">RMS</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" />
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
