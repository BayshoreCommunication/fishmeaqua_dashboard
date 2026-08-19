"use client";

import { getAllUserData, UserFull } from "@/app/actions/user";
import { getUserStage, StageKey } from "@/lib/userStage";
import Pagination from "@/components/shared/Pagination";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BiCheckShield,
  BiCrown,
  BiSearch,
  BiUserCheck,
  BiUserPlus,
} from "react-icons/bi";

const PAGE_SIZE = 10;

const UsersDetailsView = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserFull[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await getAllUserData(1, 100);
    if (res.ok && res.data) {
      setUsers(res.data.users);
      setTotal(res.data.total);
    } else {
      toast.error(res.error || "Failed to load users");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(
    (u) =>
      u.company_name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const stageCounts = useMemo(() => {
    const counts: Record<StageKey, number> = {
      signed_up: 0,
      verified: 0,
      trial_not_setup: 0,
      trial_active: 0,
      trial_expired: 0,
      paying: 0,
    };
    users.forEach((u) => {
      counts[getUserStage(u).key] += 1;
    });
    return counts;
  }, [users]);

  const stats = [
    {
      title: "Total Sign-ups",
      value: total,
      icon: <BiUserPlus size={20} />,
      color: "bg-primary/10",
      iconColor: "text-primary-dark",
    },
    {
      title: "Trial – Active & Testing",
      value: stageCounts.trial_active,
      icon: <BiCheckShield size={20} />,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Trial – Widget Not Set Up",
      value: stageCounts.trial_not_setup,
      icon: <BiUserCheck size={20} />,
      color: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Paying Customers",
      value: stageCounts.paying,
      icon: <BiCrown size={20} />,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">
              Companies signed up to the platform — track where each one sits
              in the sign-up → trial → paid journey
            </p>
          </div>
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by company or email..."
              className="w-64 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
              >
                <span className={stat.iconColor}>{stat.icon}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">
                {stat.title}
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? (
                <span className="block h-8 w-16 bg-gray-100 animate-pulse rounded"></span>
              ) : (
                stat.value
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Journey Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Signed Up
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-40 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                    </tr>
                  ))
                : paginated.map((user) => {
                    const stage = getUserStage(user);
                    return (
                      <tr
                        key={user.id}
                        onClick={() => router.push(`/users/${user.id}`)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.company_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${stage.badgeClass}`}
                          >
                            {stage.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.has_paid_subscription
                                ? "bg-purple-50 text-purple-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {user.subscription_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.is_active
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No users found
            </h3>
            <p className="text-gray-500 text-sm">
              {query ? "Try a different search term." : "No one has signed up yet."}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersDetailsView;
