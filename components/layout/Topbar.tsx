"use client";

import { getMyAdminProfileAction, signoutAction } from "@/app/actions/auth";
import { useSidebarContext } from "@/lib/SidebarContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BiChevronDown,
  BiCog,
  BiEnvelope,
  BiHome,
  BiLogOut,
  BiMessage,
  BiSearch,
  BiUser,
  BiUserCircle,
} from "react-icons/bi";

interface User {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
}

type SearchPage = {
  label: string;
  href: string;
  icon: typeof BiHome;
};

// Kept in sync with admin/config/navigation.tsx (the sidebar) plus Account
// Settings, which lives at /user-settings but isn't in the sidebar itself.
const SEARCH_PAGES: SearchPage[] = [
  { label: "Dashboard", href: "/dashboard", icon: BiHome },
  { label: "Users", href: "/users", icon: BiUser },
  { label: "Messages", href: "/messages", icon: BiEnvelope },
  { label: "Settings", href: "/settings", icon: BiCog },
  { label: "Account Settings", href: "/user-settings", icon: BiUserCircle },
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
  const searchRef = useRef<HTMLDivElement>(null);

  const matchedPages = searchQuery.trim()
    ? SEARCH_PAGES.filter((page) =>
        page.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : [];

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
        <div className="relative w-80" ref={searchRef}>
          <BiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />

          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {matchedPages.length > 0 && (
                <div className="border-b border-gray-100 py-1">
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Pages
                  </p>
                  {matchedPages.map((page) => {
                    const Icon = page.icon;
                    return (
                      <button
                        key={page.href}
                        onClick={() => goToPage(page.href)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Icon className="h-4 w-4 text-gray-400" />
                        {page.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {matchedPages.length === 0 && (
                <p className="px-3 py-3 text-sm text-gray-400">
                  No results for &ldquo;{searchQuery}&rdquo;
                </p>
              )}
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
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="h-full w-full object-cover"
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
