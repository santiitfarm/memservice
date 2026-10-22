"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderTree,
  Tag,
  ImageIcon,
  ShoppingBag,
  Stethoscope,
  Users,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Ticket,
  MessageSquare,
  CalendarDays,
  Sliders,
  Layout,
  Menu as MenuIcon,
  FileText,
  HelpCircle,
  Truck,
  Layers,
  UserCheck,
} from "lucide-react";
import DarkMood from "./ui/DarkMood";
import { logout } from "@/app/actions";
import { rankOf } from "@/lib/roles";

export default function NavSideBar({ setIsCollapsed, isCollapsed, isSmall }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const rank = rankOf(session?.user?.role);

  const navigationGroups = [
    {
      title: "Overview",
      items: [
        {
          href: "/dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
          exact: true,
        },
      ],
    },
    {
      title: "Catalog",
      items: [
        {
          href: "/dashboard/products",
          icon: Package,
          label: "Products",
        },
        {
          href: "/dashboard/inventory",
          icon: Boxes,
          label: "Inventory",
        },
        {
          href: "/dashboard/category",
          icon: FolderTree,
          label: "Categories",
        },
        {
          href: "/dashboard/brands",
          icon: Tag,
          label: "Brands",
        },
        {
          href: "/dashboard/coupons",
          icon: Ticket,
          label: "Coupons",
        },
      ],
    },
    {
      title: "Sales & Care",
      items: [
        {
          href: "/dashboard/orders",
          icon: ShoppingBag,
          label: "Orders",
        },
        {
          href: "/dashboard/reviews",
          icon: MessageSquare,
          label: "Reviews",
        },
        {
          href: "/dashboard/doctors",
          icon: Stethoscope,
          label: "Doctors",
        },
        {
          href: "/dashboard/appointments",
          icon: CalendarDays,
          label: "Appointments",
        },
      ],
    },
    {
      title: "Content (CMS)",
      items: [
        {
          href: "/dashboard/cms/settings",
          icon: Sliders,
          label: "Site Settings",
        },
        {
          href: "/dashboard/cms/home-layout",
          icon: Layout,
          label: "Home Layout",
        },
        {
          href: "/dashboard/cms/menus",
          icon: MenuIcon,
          label: "Menus",
        },
        {
          href: "/dashboard/cms/pages",
          icon: FileText,
          label: "Pages",
        },
        {
          href: "/dashboard/cms/faqs",
          icon: HelpCircle,
          label: "FAQs",
        },
        {
          href: "/dashboard/cms/media",
          icon: ImageIcon,
          label: "Media Library",
        },
        {
          href: "/dashboard/banners",
          icon: ImageIcon,
          label: "Banners",
        },
      ],
    },
    {
      title: "Operations & Settings",
      items: [
        {
          href: "/dashboard/delivery",
          icon: Truck,
          label: "Delivery Zones",
        },
        {
          href: "/dashboard/integrations",
          icon: Layers,
          label: "Integration Hub",
          minRank: 2,
        },
        {
          href: "/dashboard/user",
          icon: Users,
          label: "Staff & Users",
          minRank: 2,
        },
        {
          href: "/dashboard/profile",
          icon: UserCheck,
          label: "Profile & Security",
        },
      ],
    },
    {
      title: "Storefront",
      items: [
        {
          href: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
          icon: ExternalLink,
          label: "Live Store",
          external: true,
        },
      ],
    },
  ];


  const handleSignOut = async () => {
    const res = await logout();
    if (res?.success) {
      router.refresh();
      router.push("/admin-login");
    }
  };

  const isLinkActive = (item) => {
    if (item.external) return false;
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <span className="font-bold text-lg tracking-tight text-primary">Mem Service</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              Admin
            </span>
          </Link>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => rank >= (item.minRank ?? 1)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2">
                  {group.title}
                </p>
              )}

              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all select-none ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                    onClick={() => isSmall && setIsCollapsed(true)}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom Controls: Theme & Logout */}
      <div className="p-3 border-t border-border space-y-2 bg-card">
        <DarkMood isCollapsed={isCollapsed} />

        {session?.user && (
          <button
            type="button"
            onClick={handleSignOut}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate font-semibold">Log out</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
