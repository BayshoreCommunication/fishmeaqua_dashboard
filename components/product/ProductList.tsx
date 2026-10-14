"use client";

import {
  Product,
  ProductCategoryRef,
  ProductStats,
  deleteProductAction,
  getProductStatsAction,
  listProductsAction,
} from "@/app/actions/product";
import Pagination from "@/components/shared/Pagination";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BiBox,
  BiCheckCircle,
  BiPackage,
  BiPencil,
  BiPlus,
  BiSearch,
  BiStar,
  BiTrash,
  BiXCircle,
} from "react-icons/bi";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

type StatusFilter = "all" | "active" | "inactive";

const currency = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const categoryName = (category: Product["category"]): string =>
  typeof category === "string"
    ? "—"
    : (category as ProductCategoryRef)?.name || "—";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Only the latest request may write state — a slow response for an older
  // page/search must not overwrite a newer one.
  const requestId = useRef(0);

  const fetchProducts = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    const res = await listProductsAction({
      page,
      limit: PAGE_SIZE,
      sort: "newest",
      search: search || undefined,
      isActive: status === "all" ? undefined : status === "active",
    });
    if (id !== requestId.current) return;

    if (res.ok && res.data) {
      // Deleting the last item on the last page leaves us past the end.
      if (res.data.products.length === 0 && page > 1) {
        setPage(res.data.totalPages);
        return;
      }
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } else {
      toast.error(res.error || "Failed to load products");
    }
    setLoading(false);
  }, [page, search, status]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await getProductStatsAction();
    if (res.ok && res.data) {
      setStats(res.data);
    } else {
      toast.error(res.error || "Failed to load product stats");
    }
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusChange = (value: StatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);
  const isFiltered = Boolean(search) || status !== "all";

  const statCards = [
    {
      title: "Total Products",
      value: stats?.total ?? 0,
      subtitle: "All catalog items",
      icon: <BiPackage size={20} />,
      color: "bg-primary/10",
      iconColor: "text-primary-dark",
    },
    {
      title: "Active",
      value: stats?.active ?? 0,
      subtitle: "Visible in the storefront",
      icon: <BiCheckCircle size={20} />,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Inactive",
      value: stats?.inactive ?? 0,
      subtitle: "Hidden from customers",
      icon: <BiXCircle size={20} />,
      color: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Featured",
      value: stats?.featured ?? 0,
      subtitle: "Highlighted products",
      icon: <BiStar size={20} />,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete product "${product.title}"? This cannot be undone.`))
      return;

    const res = await deleteProductAction(product._id);
    if (res.ok) {
      toast.success("Product deleted");
      // Refetch so the page backfills from the next one and counts stay right.
      fetchProducts();
      fetchStats();
    } else {
      toast.error(res.error || "Failed to delete product");
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your aquarium product catalog
            </p>
          </div>
          <Link
            href="/products/add"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors"
          >
            <BiPlus size={18} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
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
            <p className="mb-1 text-3xl font-bold text-gray-900">
              {statsLoading ? (
                <span className="block h-8 w-16 bg-gray-100 animate-pulse rounded"></span>
              ) : (
                stat.value
              )}
            </p>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <BiSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title or SKU"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
            />
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
            {(["all", "active", "inactive"] as StatusFilter[]).map((value) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  status === value
                    ? "bg-black text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 shrink-0 bg-gray-100 animate-pulse rounded-lg"></div>
                          <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-10 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-gray-100 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-12 bg-gray-100 animate-pulse rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                : products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/products/${product.slug}`}
                          className="flex items-center gap-2.5 group"
                        >
                          {product.featureImage ? (
                            <Image
                              src={product.featureImage}
                              alt={product.title}
                              width={36}
                              height={36}
                              className="h-9 w-9 shrink-0 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                              <BiBox size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[180px] group-hover:underline">
                              {product.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[180px]">
                              {product.sku}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {categoryName(product.category)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.discountPrice ? (
                            <>
                              <span className="font-medium">
                                {currency(product.discountPrice)}
                              </span>{" "}
                              <span className="text-xs text-gray-400 line-through">
                                {currency(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium">
                              {currency(product.price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm ${
                            product.stock === 0
                              ? "text-red-600 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            product.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/products/edit?id=${product._id}`}
                            className="text-gray-500 hover:text-gray-900 transition-colors p-1"
                            title="Edit product"
                          >
                            <BiPencil size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="Delete product"
                          >
                            <BiTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-white">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BiPackage size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {isFiltered ? "No matching products" : "No products yet"}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              {isFiltered
                ? "Try a different search or status filter."
                : "Add your first product to start building the catalog."}
            </p>
          </div>
        )}

        {total > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {rangeStart}–{rangeEnd}
              </span>{" "}
              of <span className="font-medium text-gray-900">{total}</span>{" "}
              products
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
