"use client";

import {
  Product,
  ProductCategoryRef,
  deleteProductAction,
  getProductAction,
} from "@/app/actions/product";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BiArrowBack,
  BiBox,
  BiCheck,
  BiPencil,
  BiTrash,
} from "react-icons/bi";

const currency = (value: number) =>
  `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

const categoryName = (category: Product["category"]): string =>
  typeof category === "string"
    ? "—"
    : (category as ProductCategoryRef)?.name || "—";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ProductDetails = () => {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState<string | null>(
    slug ? null : "No product selected.",
  );
  const [deleting, setDeleting] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      setLoading(true);
      const res = await getProductAction(slug);
      if (res.ok && res.data) {
        setProduct(res.data);
        setActiveImage(res.data.featureImage || res.data.galleryImages[0] || null);
      } else {
        setError(res.error || "Product not found.");
      }
      setLoading(false);
    })();
  }, [slug]);

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`Delete product "${product.title}"? This cannot be undone.`))
      return;

    setDeleting(true);
    const res = await deleteProductAction(product._id);
    if (res.ok) {
      toast.success("Product deleted");
      router.push("/products");
    } else {
      toast.error(res.error || "Failed to delete product");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-gray-100 animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="h-9 w-20 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-9 w-24 rounded-lg bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Product overview */}
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left: images */}
            <div>
              <div className="aspect-square w-full rounded-lg bg-gray-100 animate-pulse" />
              <div className="mt-4 flex flex-wrap gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Right: info */}
            <div className="flex flex-col">
              <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
              <div className="mt-2 h-7 w-3/4 rounded bg-gray-100 animate-pulse" />
              <div className="mt-2 h-4 w-32 rounded bg-gray-100 animate-pulse" />

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="h-6 w-16 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-gray-100 animate-pulse" />
              </div>

              <div className="mt-5 rounded-lg bg-gray-50 p-4">
                <div className="h-8 w-40 rounded bg-gray-100 animate-pulse" />
                <div className="mt-2 h-3 w-24 rounded bg-gray-100 animate-pulse" />
              </div>

              <div className="mt-5 space-y-2">
                <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 w-full max-w-xs rounded bg-gray-100 animate-pulse"
                  />
                ))}
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                <div className="mt-3 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between"
                    >
                      <div className="h-3.5 w-24 rounded bg-gray-100 animate-pulse" />
                      <div className="h-3.5 w-20 rounded bg-gray-100 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-3.5 w-full rounded bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        <div className="rounded border border-gray-200 bg-white py-20 text-center">
          <p className="text-sm text-gray-500">
            {error || "Could not load this product."}
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BiArrowBack size={16} /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const gallery = [product.featureImage, ...product.galleryImages].filter(
    (src): src is string => Boolean(src),
  );

  const discountPercent =
    product.discountPrice && product.price > 0
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100,
        )
      : null;

  const features = (product.shortDescription || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <BiArrowBack size={18} />
            Back to Products
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/products/edit?id=${product._id}`}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BiPencil size={18} />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              <BiTrash size={18} />
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Product overview: gallery left, info right */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: images */}
          <div>
            <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.title}
                  width={640}
                  height={640}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <BiBox size={64} />
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(src)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                      activeImage === src
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.title} ${i + 1}`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: info */}
          <div className="flex flex-col">
            {/* Identity */}
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark">
              {categoryName(product.category)}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {product.title}
            </h1>
            <p className="mt-1 text-sm text-gray-400">SKU: {product.sku}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  product.isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
              {product.isFeatured && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  Featured
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  product.stock === 0
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {product.stock === 0
                  ? "Out of stock"
                  : `${product.stock} in stock`}
              </span>
            </div>

            {/* Pricing — set apart in its own highlighted block */}
            <div className="mt-5 rounded-lg bg-gray-50 p-4">
              <div className="flex flex-wrap items-end gap-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900">
                      {currency(product.discountPrice)}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {currency(product.price)}
                    </span>
                    {discountPercent ? (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                        {discountPercent}% OFF
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {currency(product.price)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Sold per {product.weight} {product.unit}
              </p>
            </div>

            {/* Features (short description) */}
            {features.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Key Features
                </h3>
                <ul className="mt-2.5 space-y-2">
                  {features.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <BiCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-primary-dark"
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Details — structured label/value list */}
            <div className="mt-5 border-t border-gray-200 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Details
              </h3>
              <dl className="mt-2 divide-y divide-gray-100">
                {[
                  { label: "Category", value: categoryName(product.category) },
                  {
                    label: "Weight / Volume",
                    value: `${product.weight} ${product.unit}`,
                  },
                  { label: "Stock", value: `${product.stock} units` },
                  { label: "Sort Order", value: String(product.sortOrder) },
                  { label: "Created", value: formatDate(product.createdAt) },
                  {
                    label: "Last Updated",
                    value: formatDate(product.updatedAt),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <dt className="text-gray-500">{row.label}</dt>
                    <dd className="font-medium text-gray-900">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      {product.overview && (
        <div className="rounded border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Overview
          </h3>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.overview }}
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
