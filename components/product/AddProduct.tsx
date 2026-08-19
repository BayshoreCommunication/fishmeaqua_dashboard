"use client";

import { Category, listCategoriesAction } from "@/app/actions/category";
import { createProductAction, getNextSkuAction } from "@/app/actions/product";
import ProductForm, { EMPTY_PRODUCT_FORM } from "./ProductForm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";

const AddProduct = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestedSku, setSuggestedSku] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [categoriesRes, skuRes] = await Promise.all([
        listCategoriesAction(),
        getNextSkuAction(),
      ]);
      if (categoriesRes.ok && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (skuRes.ok && skuRes.data) setSuggestedSku(skuRes.data.sku);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      const res = await createProductAction(formData);
      if (res.ok) {
        toast.success("Product created");
        router.push("/products");
      } else {
        toast.error(
          res.fieldErrors?.join(" ") ||
            res.error ||
            "Failed to create product",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add a new product to the catalog
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
      ) : categories.length === 0 ? (
        <div className="rounded border border-gray-200 bg-white py-20 text-center">
          <p className="text-sm text-gray-500">
            You need at least one category before adding a product.
          </p>
          <Link
            href="/products/categories/add"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 transition-colors"
          >
            Add a Category
          </Link>
        </div>
      ) : (
        <ProductForm
          categories={categories}
          initialValues={{ ...EMPTY_PRODUCT_FORM, sku: suggestedSku }}
          submitting={submitting}
          submitLabel="Create Product"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/products")}
        />
      )}
    </div>
  );
};

export default AddProduct;
