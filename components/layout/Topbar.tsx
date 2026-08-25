"use client";

import { getMyAdminProfileAction, signoutAction } from "@/app/actions/auth";
import { useSidebarContext } from "@/lib/SidebarContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BiCategory,
  BiChevronDown,
  BiCog,
  BiGroup,
  BiHome,
  BiLogOut,
  BiMessage,
  BiPackage,
  BiPlusCircle,
  BiReceipt,
  BiSearch,
  BiShieldQuarter,
  BiStar,
  BiUser,
  BiUserCircle,
} from "react-icons/bi";
import type { IconType } from "react-icons";

interface User {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
}

type SearchPage = {
  label: string;
  href: string;
  description: string;
  section: "Overview" | "Catalog" | "Sales" | "People" | "Support" | "Settings";
  keywords: string[];
  icon: IconType;
};

const SEARCH_PAGES: SearchPage[] = [
  { label: "Dashboard Overview", href: "/dashboard", description: "Orders, revenue, charts and best sellers", section: "Overview", keywords: ["home", "analytics", "reports", "sales"], icon: BiHome },
  { label: "All Products", href: "/products", description: "Browse and manage the product catalog", section: "Catalog", keywords: ["product", "inventory", "stock", "catalog"], icon: BiPackage },
  { label: "Add Product", href: "/products/add", description: "Create a new product listing", section: "Catalog", keywords: ["new product", "create item", "inventory"], icon: BiPlusCircle },
  { label: "Categories", href: "/products/categories", description: "Manage product categories", section: "Catalog", keywords: ["category", "catalog", "group"], icon: BiCategory },
  { label: "Add Category", href: "/products/categories/add", description: "Create a new product category", section: "Catalog", keywords: ["new category", "create category"], icon: BiPlusCircle },
  { label: "All Orders", href: "/orders", description: "View and manage customer orders", section: "Sales", keywords: ["orders", "sales", "delivery", "payment"], icon: BiReceipt },
  { label: "Add Order", href: "/orders/add", description: "Create an order manually", section: "Sales", keywords: ["new order", "create sale", "manual order"], icon: BiPlusCircle },
  { label: "Reviews", href: "/reviews", description: "Moderate customer product reviews", section: "Sales", keywords: ["rating", "feedback", "approve", "reject"], icon: BiStar },
  { label: "All Customers", href: "/customers", description: "Browse and manage customer accounts", section: "People", keywords: ["customer", "buyers", "accounts"], icon: BiGroup },
  { label: "Add Customer", href: "/customers/add", description: "Create a new customer account", section: "People", keywords: ["new customer", "create customer"], icon: BiPlusCircle },
  { label: "Staff Users", href: "/users", description: "Manage dashboard staff accounts", section: "People", keywords: ["users", "staff", "admin", "manager", "moderator"], icon: BiUser },
  { label: "Messages", href: "/messages", description: "Open customer and visitor conversations", section: "Support", keywords: ["chat", "inbox", "support", "visitor", "reply"], icon: BiMessage },
  { label: "General Settings", href: "/settings", description: "Configure general platform settings", section: "Settings", keywords: ["configuration", "general", "website"], icon: BiCog },
  { label: "Roles & Permissions", href: "/settings/roles", description: "Manage staff roles and access", section: "Settings", keywords: ["role", "permission", "access", "security"], icon: BiShieldQuarter },
  { label: "My Profile", href: "/profile", description: "View your staff profile", section: "Settings", keywords: ["profile", "account", "personal"], icon: BiUserCircle },
  { label: "Account Settings", href: "/user-settings", description: "Update your account information", section: "Settings", keywords: ["password", "account", "profile", "security"], icon: BiUserCircle },
];

const Topbar = () => {
  const { isExpanded } = useSidebarContext();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const matchedPages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SEARCH_PAGES.slice(0, 7);

    return SEARCH_PAGES.map((page) => {
      const label = page.label.toLowerCase();
      const searchable = [page.label, page.description, page.section, page.href, ...page.keywords]
        .join(" ")
        .toLowerCase();
      const score = label.startsWith(query) ? 0 : label.includes(query) ? 1 : searchable.includes(query) ? 2 : 99;
      return { page, score };
    })
      .filter(({ score }) => score < 99)
      .sort((a, b) => a.score - b.score || a.page.label.localeCompare(b.page.label))
      .map(({ page }) => page);
  }, [searchQuery]);

  useEffect(() => {
    const openGlobalSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", openGlobalSearch);
    return () => window.removeEventListener("keydown", openGlobalSearch);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const goToPage = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResult((current) => Math.min(current + 1, matchedPages.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResult((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && matchedPages[activeResult]) {
      event.preventDefault();
      goToPage(matchedPages[activeResult].href);
    }
  };

  // Get current route name
  const getCurrentRoute = () => {
    const pathSegments = pathname.split("/").filter(Boolean);

    // If the path is just "/" or empty, return Dashboard
    if (pathSegments.length === 0) {
      return "Dashboard";
    }

    // For paths like /products, /dashboard/products, etc.
    // We want to get the main section (not "dashboard")
    let mainSection = pathSegments[0];

    // If first segment is "dashboard", get the next segment
    if (mainSection === "dashboard" && pathSegments.length > 1) {
      mainSection = pathSegments[1];
    }

    // If we're exactly on /dashboard, show Dashboard
    if (mainSection === "dashboard") {
      return "Dashboard";
    }

    // Map routes to their parent sections
    const routeMap: { [key: string]: string } = {
      // Settings sub-routes
      "user-profile": "Settings",
      "user-settings": "Settings",
      "chat-widget-update": "Settings",
      "create-chat-widget": "Settings",
      settings: "Settings",
      profile: "Settings",

      // Main routes
      dashboard: "Dashboard",
    };

    // Check if the route has a custom mapping
    if (routeMap[mainSection]) {
      return routeMap[mainSection];
    }

    // Capitalize first letter as fallback
    return mainSection.charAt(0).toUpperCase() + mainSection.slice(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMyAdminProfileAction();
        if (response.ok && response.data) {
          setUser({
            name: `${response.data.firstName} ${response.data.lastName}`.trim(),
            email: response.data.email,
            avatar: response.data.avatar,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signoutAction();
  };

  return (
    <div
      className="fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 transition-all duration-300"
      style={{ left: isExpanded ? "256px" : "80px" }}
    >
      {/* Current Route */}
      <div className="flex items-center">
        <span className="text-lg font-semibold text-gray-900">
          {getCurrentRoute()}
        </span>
      </div>

      {/* Right side - Search and User */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative w-72 xl:w-96" ref={searchRef}>
          <BiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            role="combobox"
            aria-expanded={isSearchOpen}
            aria-controls="dashboard-global-search"
            aria-activedescendant={matchedPages[activeResult] ? `search-result-${activeResult}` : undefined}
            placeholder="Search dashboard..."
            value={searchQuery}
            onChange={(event) => { setSearchQuery(event.target.value); setActiveResult(0); setIsSearchOpen(true); }}
            onFocus={() => { setIsSearchOpen(true); setActiveResult(0); }}
            onKeyDown={handleSearchKeyDown}
            className="h-10 w-full rounded-lg border border-gray-200 py-2 pl-10 pr-16 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-gray-400 xl:inline">⌘ K</kbd>

          {isSearchOpen && (
            <div id="dashboard-global-search" role="listbox" className="absolute right-0 mt-2 w-[420px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(0,0,0,0.16)]">
              {matchedPages.length > 0 && (
                <div className="max-h-[430px] overflow-y-auto p-2">
                  <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    {searchQuery.trim() ? `${matchedPages.length} result${matchedPages.length === 1 ? "" : "s"}` : "Quick access"}
                  </p>
                  {matchedPages.map((page, index) => {
                    const Icon = page.icon;
                    return (
                      <button
                        key={page.href}
                        id={`search-result-${index}`}
                        role="option"
                        aria-selected={activeResult === index}
                        onMouseEnter={() => setActiveResult(index)}
                        onClick={() => goToPage(page.href)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${activeResult === index ? "bg-primary/[0.08]" : "hover:bg-gray-50"}`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activeResult === index ? "bg-primary/15 text-primary-dark" : "bg-gray-100 text-gray-500"}`}><Icon className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-gray-800">{page.label}</span><span className="mt-0.5 block truncate text-xs text-gray-400">{page.description}</span></span>
                        <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-gray-400">{page.section}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {matchedPages.length === 0 && (
                <div className="px-6 py-10 text-center"><BiSearch className="mx-auto text-gray-300" size={30} /><p className="mt-3 text-sm font-semibold text-gray-700">No dashboard pages found</p><p className="mt-1 text-xs text-gray-400">Try products, orders, customers, messages, or settings.</p></div>
              )}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 text-[10px] text-gray-400"><span><kbd className="rounded border bg-white px-1">↑</kbd> <kbd className="rounded border bg-white px-1">↓</kbd> Navigate</span><span><kbd className="rounded border bg-white px-1">Enter</kbd> Open · <kbd className="rounded border bg-white px-1">Esc</kbd> Close</span></div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 overflow-hidden relative border border-gray-200">
              {user?.avatar ? (
                <span
                  aria-label="User avatar"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${user.avatar}")` }}
                />
              ) : (
                <span className="text-sm font-semibold text-white">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <BiChevronDown
              className={`text-gray-500 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ""}
                </p>
              </div>
              <Link
                href="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <BiUser className="mr-3 h-5 w-5 text-gray-400" />
                Profile
              </Link>

              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <BiLogOut className="mr-3 h-5 w-5 text-gray-400" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
