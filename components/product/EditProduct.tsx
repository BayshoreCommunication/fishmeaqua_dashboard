"use client";

import { Category, listCategoriesAction } from "@/app/actions/category";
import {
  Product,
  ProductCategoryRef,
  getProductAction,
  updateProductAction,
} from "@/app/actions/product";
import ProductForm, { ProductFormValues } from "./ProductForm";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";

const EditProduct = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No product selected.");
      setLoading(false);
      return;
    }

    (async () => {
      const [productRes, categoriesRes] = await Promise.all([
        getProductAction(id),
        listCategoriesAction(),
      ]);

      if (productRes.ok && productRes.data) {
        setProduct(productRes.data);
      } else {
        setError(productRes.error || "Product not found.");
      }

      if (categoriesRes.ok && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await updateProductAction(id, formData);
      if (res.ok) {
        toast.success("Product updated");
        router.push("/products");
      } else {
        toast.error(
          res.fieldErrors?.join(" ") ||
            res.error ||
            "Failed to update product",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const categoryId =
    typeof product?.category === "string"
      ? product.category
      : (product?.category as ProductCategoryRef | undefined)?._id;

  const initialValues: ProductFormValues | undefined = product
    ? {
        title: product.title,
        sku: product.sku,
        category: categoryId || "",
        shortDescription: product.shortDescription || "",
        overview: product.overview || "",
        price: String(product.price),
        discountPrice: product.discountPrice ? String(product.discountPrice) : "",
        unit: product.unit,
        weight: String(product.weight),
        stock: String(product.stock),
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        sortOrder: String(product.sortOrder),
      }
    : undefined;

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update this product
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BiArrowBack size={18} />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-gray-100 animate-pulse"
                />
              ))}
            </div>
            <div className="space-y-4 lg:col-span-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      ) : error || !product ? (
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
      ) : (
        <ProductForm
          categories={categories}
          initialValues={initialValues}
          initialFeatureImage={product.featureImage || ""}
          initialGalleryImages={product.galleryImages}
          submitting={submitting}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/products")}
        />
      )}
    </div>
  );
};

export default EditProduct;
