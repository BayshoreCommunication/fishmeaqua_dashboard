"use client";

import {
  Category,
  getCategoryAction,
  listCategoriesAction,
  updateCategoryAction,
} from "@/app/actions/category";
import CategoryForm, { CategoryFormValues } from "./CategoryForm";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";

const EditCategory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No category selected.");
      setLoading(false);
      return;
    }

    (async () => {
      const [categoryRes, listRes] = await Promise.all([
        getCategoryAction(id),
        listCategoriesAction(),
      ]);

      if (categoryRes.ok && categoryRes.data) {
        setCategory(categoryRes.data);
      } else {
        setError(categoryRes.error || "Category not found.");
      }

      if (listRes.ok && listRes.data) setCategories(listRes.data);
      setLoading(false);
    })();
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await updateCategoryAction(id, formData);
      if (res.ok) {
        toast.success("Category updated");
        router.push("/products/categories");
      } else {
        toast.error(res.error || "Failed to update category");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues: CategoryFormValues | undefined = category
    ? {
        name: category.name,
        description: category.description || "",
        parent: category.parent || "",
        isActive: category.isActive,
        sortOrder: String(category.sortOrder),
      }
    : undefined;

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update this product category
            </p>
          </div>
          <Link
            href="/products/categories"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BiArrowBack size={18} />
            Back to Categories
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
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      ) : error || !category ? (
        <div className="rounded border border-gray-200 bg-white py-20 text-center">
          <p className="text-sm text-gray-500">
            {error || "Could not load this category."}
          </p>
          <Link
            href="/products/categories"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <BiArrowBack size={16} /> Back to Categories
          </Link>
        </div>
      ) : (
        <CategoryForm
          layout="page"
          categories={categories}
          excludeCategoryId={category._id}
          initialValues={initialValues}
          initialImage={category.image || ""}
          submitting={submitting}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/products/categories")}
        />
      )}
    </div>
  );
};

export default EditCategory;
