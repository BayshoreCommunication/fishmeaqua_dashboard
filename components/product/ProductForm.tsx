"use client";

import { Category } from "@/app/actions/category";
import { ProductUnit } from "@/app/actions/product";
import RichTextEditor from "@/components/shared/RichTextEditor";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { BiImageAdd, BiX } from "react-icons/bi";

const MAX_GALLERY_IMAGES = 6;

export type ProductFormValues = {
  title: string;
  sku: string;
  category: string;
  shortDescription: string;
  overview: string;
  price: string;
  discountPrice: string;
  unit: ProductUnit;
  weight: string;
  stock: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
};

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  title: "",
  sku: "",
  category: "",
  shortDescription: "",
  overview: "",
  price: "",
  discountPrice: "",
  unit: "pcs",
  weight: "1",
  stock: "0",
  isActive: true,
  isFeatured: false,
  sortOrder: "0",
};

const PRODUCT_UNITS: ProductUnit[] = ["kg", "g", "l", "ml", "pcs"];

interface ProductFormProps {
  categories: Category[];
  initialValues?: ProductFormValues;
  initialFeatureImage?: string;
  initialGalleryImages?: string[];
  submitting: boolean;
  submitLabel: string;
  onSubmit: (formData: FormData) => void | Promise<void>;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-500";

const ProductForm = ({
  categories,
  initialValues = EMPTY_PRODUCT_FORM,
  initialFeatureImage = "",
  initialGalleryImages = [],
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const [form, setForm] = useState<ProductFormValues>(initialValues);

  const [featureFile, setFeatureFile] = useState<File | null>(null);
  const [featurePreview, setFeaturePreview] = useState<string>(
    initialFeatureImage,
  );
  const [removeFeatureImage, setRemoveFeatureImage] = useState(false);
  const featureInputRef = useRef<HTMLInputElement>(null);

  // Existing (already-uploaded) gallery images kept for this save, and newly
  // picked local files — kept as separate lists so images can be removed
  // individually instead of the whole gallery being replaced on each pick.
  const [keptGalleryImages, setKeptGalleryImages] = useState<string[]>(
    initialGalleryImages,
  );
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const gallerySlotsUsed = keptGalleryImages.length + galleryFiles.length;
  const gallerySlotsLeft = MAX_GALLERY_IMAGES - gallerySlotsUsed;

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeatureFile(file);
    setFeaturePreview(URL.createObjectURL(file));
    setRemoveFeatureImage(false);
  };

  const handleRemoveFeatureImage = () => {
    setFeatureFile(null);
    setFeaturePreview("");
    if (featureInputRef.current) featureInputRef.current.value = "";
    if (initialFeatureImage) setRemoveFeatureImage(true);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const accepted = files.slice(0, gallerySlotsLeft);
    if (files.length > accepted.length) {
      toast.error(`You can add up to ${MAX_GALLERY_IMAGES} gallery images.`);
    }
    if (accepted.length === 0) return;

    setGalleryFiles((prev) => [...prev, ...accepted]);
    setGalleryPreviews((prev) => [
      ...prev,
      ...accepted.map((file) => URL.createObjectURL(file)),
    ]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleRemoveKeptGalleryImage = (index: number) => {
    setKeptGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const discountPriceInvalid =
    form.discountPrice !== "" &&
    form.price !== "" &&
    Number(form.discountPrice) >= Number(form.price);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (discountPriceInvalid) {
      toast.error("Discount price must be less than the regular price.");
      return;
    }

    const formData = new FormData();
    formData.set("title", form.title);
    formData.set("sku", form.sku);
    formData.set("category", form.category);
    formData.set("shortDescription", form.shortDescription);
    formData.set("overview", form.overview);
    formData.set("price", form.price);
    if (form.discountPrice) formData.set("discountPrice", form.discountPrice);
    formData.set("unit", form.unit);
    formData.set("weight", form.weight);
    formData.set("stock", form.stock);
    formData.set("isActive", String(form.isActive));
    formData.set("isFeatured", String(form.isFeatured));
    formData.set("sortOrder", form.sortOrder);
    if (featureFile) {
      formData.set("featureImage", featureFile);
    } else if (removeFeatureImage) {
      formData.set("removeFeatureImage", "true");
    }
    formData.set("keepGalleryImages", JSON.stringify(keptGalleryImages));
    galleryFiles.forEach((file) => formData.append("galleryImages", file));
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded border border-gray-200 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.sku}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="e.g. FMA-WC-1"
                />
                <p className="text-xs text-gray-500">
                  Auto-generated — edit it if you&apos;d rather set your own.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Descriptions
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Short Description</label>
                <textarea
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      shortDescription: e.target.value,
                    }))
                  }
                  className={`${inputClass} resize-none`}
                  placeholder="A brief one- or two-line summary shown on product cards"
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Overview</label>
                <RichTextEditor
                  value={form.overview}
                  onChange={(html) =>
                    setForm((f) => ({ ...f, overview: html }))
                  }
                  placeholder="Full product description shown on the product detail page"
                />
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Images
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Feature Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0">
                    <button
                      type="button"
                      onClick={() => featureInputRef.current?.click()}
                      className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-primary hover:text-primary transition-colors"
                    >
                      {featurePreview ? (
                        <Image
                          src={featurePreview}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BiImageAdd size={24} />
                      )}
                    </button>
                    {featurePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveFeatureImage}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove feature image"
                      >
                        <BiX size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    ref={featureInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFeatureChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500">
                    The main image shown on cards and at the top of the
                    product page.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Gallery Images</label>
                <div className="flex flex-wrap items-center gap-3">
                  {keptGalleryImages.map((src, i) => (
                    <div key={`kept-${src}`} className="relative h-16 w-16 shrink-0">
                      <div className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                        <Image
                          src={src}
                          alt={`Gallery ${i + 1}`}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeptGalleryImage(i)}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove gallery image"
                      >
                        <BiX size={14} />
                      </button>
                    </div>
                  ))}
                  {galleryPreviews.map((src, i) => (
                    <div key={`new-${src}`} className="relative h-16 w-16 shrink-0">
                      <div className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                        <Image
                          src={src}
                          alt={`New gallery ${i + 1}`}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewGalleryImage(i)}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove gallery image"
                      >
                        <BiX size={14} />
                      </button>
                    </div>
                  ))}
                  {gallerySlotsLeft > 0 && (
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-primary hover:text-primary transition-colors"
                    >
                      <BiImageAdd size={24} />
                    </button>
                  )}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Up to {MAX_GALLERY_IMAGES} images ({gallerySlotsUsed}/
                  {MAX_GALLERY_IMAGES} used). Click the × on an image to
                  remove it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded border border-gray-200 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Organization
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Weight/Volume</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.weight}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, weight: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        unit: e.target.value as ProductUnit,
                      }))
                    }
                    className={inputClass}
                  >
                    {PRODUCT_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Pricing (BDT ৳)
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>
                  Regular Price <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Discount Price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.discountPrice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountPrice: e.target.value,
                    }))
                  }
                  className={`${inputClass} ${
                    discountPriceInvalid
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : ""
                  }`}
                  placeholder="Optional sale price"
                />
                {discountPriceInvalid && (
                  <p className="text-xs text-red-500">
                    Must be less than the regular price.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Inventory &amp; Status
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Stock</label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Status</label>
                <select
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      isActive: e.target.value === "active",
                    }))
                  }
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Sort Order</label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      isFeatured: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                Featured product
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
