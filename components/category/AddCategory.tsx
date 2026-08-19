"use client";

import { Category, createCategoryAction, listCategoriesAction } from "@/app/actions/category";
import CategoryForm from "./CategoryForm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";

const AddCategory = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await listCategoriesAction();
      if (res.ok && res.data) setCategories(res.data);
      setLoadingCategories(false);
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      const res = await createCategoryAction(formData);
      if (res.ok) {
        toast.success("Category created");
        router.push("/products/categories");
      } else {
        toast.error(res.error || "Failed to create category");
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
            <h1 className="text-2xl font-bold text-gray-900">Add Category</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new product category
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
      {loadingCategories ? (
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
      ) : (
        <CategoryForm
          layout="page"
          categories={categories}
          submitting={submitting}
          submitLabel="Create Category"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/products/categories")}
        />
      )}
    </div>
  );
};

export default AddCategory;
