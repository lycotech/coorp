'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils"; // Assuming utils file exists from shadcn init
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"; // Import Collapsible
import {
  LayoutDashboard, // Dashboard
  Users, // Member
  CreditCard, // Re-add Contribution icon
  HandCoins, // Re-add Loan icon
  ReceiptText, // Transactions
  AreaChart, // Reports
  Settings, // Re-add Admin Settings icon
  SlidersHorizontal, // Re-add Preferences icon
  ChevronRight, // Icon for collapsible trigger
  UserCog, // Icon for Manage Users
  UserCheck, // Icon for Membership Approval
  UploadCloud, // Icon for Upload User
  UserCircle, // Personal Details
  BookUser, // Membership Form
  FileText, // Transaction Details
  FileCheck2, // Apply Loan
  ShieldCheck // Guarantor
} from "lucide-react";

// Define interface for menu items and potential sub-items
interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  subItems?: MenuItem[];
  roles?: string[]; // Add optional roles array (e.g., ['Administrator', 'President'])
}

// --- Define Menu Structures ---

const adminMenu: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Member",
    href: "/dashboard/member", // Base path for collapsible parent
    icon: Users,
    roles: ["SuperAdmin"], // Allow SuperAdmin to see the Member parent
    subItems: [
      { name: "Manage Users", href: "/dashboard/member/manage-users", icon: UserCog, roles: ["SuperAdmin"] },
      { name: "Membership Approval", href: "/dashboard/member/membership-approval", icon: UserCheck, roles: ["SuperAdmin"] },
      { name: "Upload User", href: "/dashboard/member/upload-user", icon: UploadCloud, roles: ["SuperAdmin"] },
    ],
  },
  { name: "Contribution", href: "/dashboard/contribution", icon: CreditCard, roles: ["SuperAdmin"] },
  { name: "Loan", href: "/dashboard/loan", icon: HandCoins, roles: ["SuperAdmin"] },
  { name: "Transactions", href: "/dashboard/transactions", icon: ReceiptText, roles: ["SuperAdmin"] },
  { name: "Reports", href: "/dashboard/reports", icon: AreaChart, roles: ["SuperAdmin"] },
  { name: "Admin Settings", href: "/dashboard/admin-settings", icon: Settings, roles: ["SuperAdmin"] },
  { name: "Preferences", href: "/dashboard/preferences", icon: SlidersHorizontal }, // Assuming all non-members see this? Or add roles: ["SuperAdmin"]
];

const memberMenu: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Personal Details",
    href: "#", // Placeholder href for parent
    icon: UserCircle,
    subItems: [
        { name: "View/Update Details", href: "/dashboard/personal/details", icon: UserCog },
        { name: "Membership Form", href: "/dashboard/personal/membership-form", icon: BookUser },
    ]
  },
  { name: "Transaction Details", href: "/dashboard/member-transactions", icon: FileText },
  { name: "Contributions", href: "/dashboard/member-contributions", icon: CreditCard },
  {
    name: "Loan",
    href: "#", // Placeholder href for parent
    icon: HandCoins,
    subItems: [
      { name: "All Loan", href: "/dashboard/loan/all", icon: ReceiptText },
      { name: "Apply for loan", href: "/dashboard/loan/apply", icon: FileCheck2 },
      { name: "Guarantor", href: "/dashboard/loan/guarantor", icon: ShieldCheck },
    ],
  },
  // Member logout is usually in the header dropdown, but can be added here if needed
  // { name: "Logout", href: "/logout", icon: LogOut },
];

// Define props interface for Sidebar
interface SidebarProps {
  userType: string | null; // Accept user type from parent
}

export function Sidebar({ userType }: SidebarProps) { // Destructure userType from props
  const pathname = usePathname();
  const [openState, setOpenState] = useState<{ [key: string]: boolean }>({});

  // Determine which menu structure to use based on userType prop
  const menuItems = userType === 'Member' ? memberMenu : adminMenu;

  // Filter menu items based on userType prop
  const filteredMenuItems = useMemo(() => {
    // No need for isLoading check here
    if (!userType) {
        return []; // No user type, no menu
    }

    const filterItems = (items: MenuItem[]): MenuItem[] => {
      // Filter creates a new array, map creates new item objects if needed
      return items.filter(item => {
        const hasAccess = !item.roles || item.roles.includes(userType);
        if (!hasAccess) return false;

        // Handle sub-items recursively
        if (item.subItems) {
          const visibleSubItems = filterItems(item.subItems);
          // Only include subItems if there are any visible ones
          if (visibleSubItems.length > 0) {
            // Return a new item object with filtered subItems to avoid mutation
            return { ...item, subItems: visibleSubItems };
          } else {
            // Exclude the parent item if all its sub-items are filtered out
            // Or, if you want to show the parent anyway, return { ...item, subItems: [] };
            return false; // Hide parent if no sub-items are visible
          }
        }
        // If it's not a sub-item container or has access, keep it
        return true;
      }); // .map(item => ({ ...item })) // map is not strictly necessary if filter returns new objects for subitems
    };

    // Filter directly from the selected menu (menuItems is already the correct reference)
    // Removed: const menuItemsCopy = JSON.parse(JSON.stringify(menuItems));
    return filterItems(menuItems);

  }, [userType, menuItems]); // Depend on userType prop

  // Initialize open state based on path and *filtered* menu
  useEffect(() => {
    const initialOpenState: { [key: string]: boolean } = {};
    filteredMenuItems.forEach(item => {
      if (item.subItems && item.subItems.length > 0) { // Check length > 0
        const isChildActive = item.subItems.some(sub => pathname.startsWith(sub.href));
        initialOpenState[item.name] = isChildActive;
      }
    });
    setOpenState(initialOpenState);
  }, [pathname, filteredMenuItems]);

  const handleOpenChange = (itemName: string, isOpen: boolean) => {
    setOpenState(prev => ({ ...prev, [itemName]: isOpen }));
  };

  const renderLink = (item: MenuItem, isSubItem = false) => {
    const isActiveStrict = pathname === item.href;
    const isActiveBranch = item.href !== '#' && item.href !== '/dashboard' && pathname.startsWith(item.href);
    const isActive = isActiveStrict || isActiveBranch;

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center px-3 py-2 rounded-md text-sm font-medium",
          isSubItem && "pl-9",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
        {item.name}
      </Link>
    );
  }

  // No loading state needed here as data comes from parent
  // Removed: if (isLoading) { ... }

  // Optional: Handle case where userType is null (e.g., not logged in, token invalid)
  if (!userType) {
      // Option 1: Render nothing or minimal sidebar
      return <aside className="hidden md:block w-64 border-r p-4">Please log in.</aside>;
      // Option 2: Render the sidebar structure but without menu items
      // return <aside className="hidden md:block w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground p-4 flex-shrink-0 overflow-y-auto">...</aside>;
  }

  return (
    <aside className="hidden md:block w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground p-4 flex-shrink-0 overflow-y-auto">
      <div className="flex items-center mb-8">
        <span className="text-xl font-semibold">Coop Portal</span>
      </div>
      <nav className="space-y-1">
        {filteredMenuItems.map((item) => {
          if (item.subItems && item.subItems.length > 0) {
            const isParentActive = item.subItems.some(sub => sub.href !== '#' && pathname.startsWith(sub.href));
            const isOpen = openState[item.name] ?? false;

            return (
              <Collapsible
                key={item.name}
                open={isOpen}
                onOpenChange={(open) => handleOpenChange(item.name, open)}
              >
                <CollapsibleTrigger asChild>
                   <button
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium",
                         isParentActive
                         ? "bg-sidebar-accent text-sidebar-accent-foreground"
                         : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </div>
                      <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-90")} />
                   </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1">
                  {item.subItems.map((subItem) => renderLink(subItem, true))}
                </CollapsibleContent>
              </Collapsible>
            );
          } else if (!item.subItems) {
            return renderLink(item);
          }
          return null;
        })}
      </nav>
    </aside>
  );
}

// CSS rule in globals.css handles chevron rotation 