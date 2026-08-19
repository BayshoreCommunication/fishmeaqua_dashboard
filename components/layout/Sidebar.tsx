"use client";

import { navigationConfig, NavItem } from "@/config/navigation";
import { useSidebarContext } from "@/lib/SidebarContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BiChevronDown,
  BiChevronsLeft,
  BiChevronsRight,
  BiChevronUp,
} from "react-icons/bi";

const Sidebar = () => {
  const pathname = usePathname();
  const { isExpanded, toggleSidebar } = useSidebarContext();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Toggle sub-menu
  const toggleSubMenu = (itemId: string) => {
    setOpenMenus((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  // Check if current path matches the item or its sub-items
  const isItemActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.sub) {
      return item.sub.some((subItem) => pathname === subItem.href);
    }
    return false;
  };

  // Check if sub-item is active
  const isSubItemActive = (href: string) => pathname === href;

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300",
        isExpanded ? "w-64" : "w-20",
      )}
    >
      {/* Logo */}

      <div className="flex h-16 items-center border-b border-gray-200 px-4 ml-3">
        <Link
          href="/dashboard"
          className="flex flex-shrink-0 items-center transition-opacity hover:opacity-80"
        >
          {isExpanded ? (
            <span className="font-dynapuff text-2xl font-bold tracking-tight">
              <span className="text-primary">Fishme</span>
              <span className="text-black">aqua.</span>
            </span>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
              F
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 py-6 px-3 overflow-y-auto overflow-x-hidden">
        {navigationConfig.map((item) => {
          const isActive = isItemActive(item);
          const isOpen = openMenus.includes(item.id);
          const hasSub = item.sub && item.sub.length > 0;

          return (
            <div key={item.id}>
              {/* Main nav item */}
              {hasSub ? (
                <button
                  onClick={() => isExpanded && toggleSubMenu(item.id)}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded transition-all",
                    isExpanded ? "px-4 py-3" : "justify-center p-3",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>

                  {isExpanded && (
                    <>
                      <span className="text-sm font-medium flex-1 text-left">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                          {item.badge}
                        </span>
                      )}
                      {isOpen ? (
                        <BiChevronUp size={16} className="flex-shrink-0" />
                      ) : (
                        <BiChevronDown size={16} className="flex-shrink-0" />
                      )}
                    </>
                  )}

                  {!isExpanded && item.badge && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] text-white">
                      {item.badge}
                    </span>
                  )}

                  {isActive && !isExpanded && (
                    <div className="absolute -right-3 top-1/2 h-6 w-1 -translate-y-1/2 transform rounded-l-full bg-gray-900" />
                  )}

                  {/* Tooltip - only show when collapsed */}
                  {!isExpanded && (
                    <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.title}
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded transition-all",
                    isExpanded ? "px-4 py-3" : "justify-center p-3",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>

                  {isExpanded && (
                    <>
                      <span className="text-sm font-medium flex-1">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {!isExpanded && item.badge && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] text-white">
                      {item.badge}
                    </span>
                  )}

                  {isActive && !isExpanded && (
                    <div className="absolute -right-3 top-1/2 h-6 w-1 -translate-y-1/2 transform rounded-l-full bg-gray-900" />
                  )}

                  {/* Tooltip - only show when collapsed */}
                  {!isExpanded && (
                    <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.title}
                    </div>
                  )}
                </Link>
              )}

              {/* Sub-menu items */}
              {hasSub && isExpanded && isOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                  {item.sub?.map((subItem) => (
                    <Link
                      key={subItem.id}
                      href={subItem.href}
                      className={cn(
                        "flex items-center gap-3 rounded px-3 py-2 text-sm transition-all",
                        isSubItemActive(subItem.href)
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <span className="flex-shrink-0">{subItem.icon}</span>
                      <span>{subItem.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Toggle Button - Centered vertically on right edge */}
      <button
        onClick={toggleSidebar}
        className="fixed top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:border-gray-900 hover:text-gray-900 transition-all duration-300 z-50"
        style={{ left: isExpanded ? "244px" : "68px" }}
      >
        {isExpanded ? (
          <BiChevronsLeft size={14} />
        ) : (
          <BiChevronsRight size={14} />
        )}
      </button>
    </div>
  );
};

export default Sidebar;
