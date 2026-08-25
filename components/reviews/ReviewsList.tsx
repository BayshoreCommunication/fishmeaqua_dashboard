"use client";

import {
  listReviewsAction,
  moderateReviewAction,
  type Review,
  type ReviewFilterStatus,
  type ReviewListResult,
  type ReviewStatus,
} from "@/app/actions/review";
import Pagination from "@/components/shared/Pagination";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BiBox,
  BiCheckCircle,
  BiCommentDetail,
  BiFile,
  BiImage,
  BiLoaderAlt,
  BiSolidStar,
  BiStar,
  BiTimeFive,
  BiXCircle,
} from "react-icons/bi";

const PAGE_SIZE = 10;
const FILTERS: { value: ReviewFilterStatus; label: string }[] = [
  { value: "all", label: "All reviews" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const emptySummary: ReviewListResult["summary"] = {
  total: 0,
  statusCounts: { pending: 0, approved: 0, rejected: 0 },
  averageRating: 0,
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const statusBadgeClass = (status: ReviewStatus) => {
  switch (status) {
    case "approved":
      return "bg-green-50 text-green-700 ring-green-600/10";
    case "rejected":
      return "bg-red-50 text-red-700 ring-red-600/10";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/10";
  }
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) =>
      star <= rating ? (
        <BiSolidStar key={star} size={16} className="text-amber-400" />
      ) : (
        <BiStar key={star} size={16} className="text-gray-200" />
      ),
    )}
  </div>
);

const ReviewStatsSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="animate-pulse rounded border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-10 w-10 rounded-lg bg-gray-200" />
          <span className="h-4 w-28 rounded bg-gray-200" />
        </div>
        <span className="block h-8 w-24 rounded bg-gray-200" />
        <span className="mt-2 block h-3 w-36 rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

const ReviewTableSkeleton = () => (
  <div className="overflow-x-auto" role="status" aria-label="Loading reviews" aria-busy="true">
    <table className="w-full min-w-[1100px]">
      <thead className="border-b border-gray-200 bg-gray-50">
        <tr>
          {["Product", "Customer & order", "Rating", "Review", "Attachments", "Status / action"].map((heading) => (
            <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {Array.from({ length: 6 }).map((_, row) => (
          <tr key={row} className="animate-pulse align-top">
            <td className="px-5 py-5"><div className="flex items-center gap-3"><span className="h-11 w-11 rounded-lg bg-gray-200" /><div className="space-y-2"><span className="block h-3.5 w-32 rounded bg-gray-200" /><span className="block h-3 w-20 rounded bg-gray-100" /></div></div></td>
            <td className="px-5 py-5"><div className="space-y-2"><span className="block h-3.5 w-32 rounded bg-gray-200" /><span className="block h-3 w-40 rounded bg-gray-100" /><span className="block h-3 w-24 rounded bg-gray-100" /></div></td>
            <td className="px-5 py-5"><span className="block h-4 w-24 rounded bg-gray-200" /><span className="mt-2 block h-3 w-14 rounded bg-gray-100" /></td>
            <td className="px-5 py-5"><div className="space-y-2"><span className="block h-3.5 w-56 rounded bg-gray-200" /><span className="block h-3.5 w-44 rounded bg-gray-100" /><span className="block h-3.5 w-48 rounded bg-gray-100" /></div></td>
            <td className="px-5 py-5"><span className="block h-9 w-28 rounded-md bg-gray-200" /></td>
            <td className="px-5 py-5"><span className="block h-8 w-32 rounded-full bg-gray-200" /><span className="mt-2 block h-3 w-24 rounded bg-gray-100" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ReviewsList = () => {
  const [status, setStatus] = useState<ReviewFilterStatus>("all");
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectingReview, setRejectingReview] = useState<Review | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const response = await listReviewsAction({ status, page, limit: PAGE_SIZE });
    if (response.ok && response.data) {
      setReviews(response.data.reviews);
      setSummary(response.data.summary);
      setTotalPages(response.data.pagination.totalPages);
      if (page > response.data.pagination.totalPages) {
        setPage(response.data.pagination.totalPages);
      }
    } else {
      setReviews([]);
      toast.error(response.error || "Failed to load reviews");
    }
    setLoading(false);
  }, [page, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchReviews();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchReviews]);

  const selectStatus = (nextStatus: ReviewFilterStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const moderate = async (
    review: Review,
    nextStatus: "approved" | "rejected",
    moderationNote?: string,
  ) => {
    setUpdatingId(review._id);
    const response = await moderateReviewAction(review._id, {
      status: nextStatus,
      moderationNote: moderationNote?.trim() || undefined,
    });

    if (response.ok) {
      toast.success(
        nextStatus === "approved"
          ? "Review approved and published"
          : "Review rejected",
      );
      setRejectingReview(null);
      setRejectionNote("");
      await fetchReviews();
    } else {
      toast.error(response.error || "Failed to update review");
    }
    setUpdatingId(null);
  };

  const stats = [
    {
      title: "All Reviews",
      value: summary.total,
      subtitle: "Verified purchases",
      icon: <BiCommentDetail size={20} />,
      color: "bg-primary/10 text-primary-dark",
    },
    {
      title: "Pending",
      value: summary.statusCounts.pending,
      subtitle: "Needs your attention",
      icon: <BiTimeFive size={20} />,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Approved",
      value: summary.statusCounts.approved,
      subtitle: "Visible on products",
      icon: <BiCheckCircle size={20} />,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Average Rating",
      value: `${summary.averageRating.toFixed(1)} / 5`,
      subtitle: "Across all submissions",
      icon: <BiSolidStar size={20} />,
      color: "bg-purple-50 text-purple-600",
    },
  ];
  const filteredTotal =
    status === "all" ? summary.total : summary.statusCounts[status];

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-gray-50">
      <div className="rounded border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">
          Moderate verified customer reviews before they appear in the store.
        </p>
      </div>

      {loading ? <ReviewStatsSkeleton /> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                {stat.icon}
              </span>
              <h2 className="text-sm font-medium text-gray-700">{stat.title}</h2>
            </div>
            <p className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>}

      <section className="overflow-hidden rounded border border-gray-200 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
          <label className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Filter by status</span>
            <select
              value={status}
              onChange={(event) =>
                selectStatus(event.target.value as ReviewFilterStatus)
              }
              disabled={loading}
              className="h-10 min-w-48 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
            >
              {FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label} ({filter.value === "all" ? summary.total : summary.statusCounts[filter.value]})
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-gray-500">
            Showing {reviews.length} of {filteredTotal} {status === "all" ? "reviews" : `${status} reviews`}
          </p>
        </div>

        {loading ? (
          <ReviewTableSkeleton />
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <BiXCircle size={32} className="text-gray-300" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {status === "all" ? "No reviews yet" : `No ${status} reviews`}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              Customer reviews with this moderation status will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Product", "Customer & order", "Rating", "Review", "Attachments", "Status / action"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {reviews.map((review) => {
                  const customerName = review.customer
                    ? `${review.customer.firstName} ${review.customer.lastName}`.trim()
                    : "Deleted customer";
                  const isUpdating = updatingId === review._id;

                  return (
                    <tr key={review._id} className="align-top transition hover:bg-gray-50/70">
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          {review.product?.featureImage ? (
                            <Image
                              src={review.product.featureImage}
                              alt=""
                              width={44}
                              height={44}
                              className="h-11 w-11 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                              <BiBox size={19} />
                            </span>
                          )}
                          <div className="min-w-0 max-w-48">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {review.product?.title ?? "Deleted product"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              SKU: {review.product?.sku ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <p className="text-sm font-medium text-gray-800">{customerName}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {review.customer?.email || review.customer?.phone || "No contact"}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-primary-dark">
                          #{review.order?.orderNumber ?? "Deleted order"}
                        </p>
                      </td>
                      <td className="px-5 py-5">
                        <StarRating rating={review.rating} />
                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          {review.rating}.0 / 5
                        </p>
                      </td>
                      <td className="px-5 py-5">
                        <p className="max-w-xs whitespace-pre-wrap text-sm leading-6 text-gray-700">
                          {review.comment}
                        </p>
                        {review.moderationNote && (
                          <p className="mt-2 max-w-xs rounded bg-gray-50 px-2.5 py-2 text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">Staff note:</span>{" "}
                            {review.moderationNote}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        {review.attachments.length === 0 ? (
                          <span className="text-xs text-gray-400">No files</span>
                        ) : (
                          <div className="flex max-w-48 flex-col gap-1.5">
                            {review.attachments.map((attachment) => (
                              <a
                                key={attachment.url}
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-md border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 transition hover:border-primary/30 hover:text-primary-dark"
                              >
                                {attachment.type === "image" ? (
                                  <BiImage className="shrink-0" size={15} />
                                ) : (
                                  <BiFile className="shrink-0" size={15} />
                                )}
                                <span className="truncate">{attachment.name}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        <div className="relative w-fit">
                          <select
                            value={review.status}
                            disabled={isUpdating}
                            aria-label={`Change status for review by ${customerName}`}
                            onChange={(event) => {
                              const nextStatus = event.target.value as ReviewStatus;
                              if (nextStatus === review.status) return;
                              if (nextStatus === "rejected") {
                                setRejectingReview(review);
                                setRejectionNote("");
                                return;
                              }
                              void moderate(review, "approved");
                            }}
                            className={`min-w-32 cursor-pointer appearance-none rounded-full border-0 py-2 pl-3 pr-8 text-xs font-semibold capitalize outline-none ring-1 ring-inset transition focus:ring-2 focus:ring-primary/25 disabled:cursor-wait disabled:opacity-60 ${statusBadgeClass(review.status)}`}
                          >
                            <option
                              value="pending"
                              disabled={review.status !== "pending"}
                            >
                              Pending
                            </option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          {isUpdating && (
                            <BiLoaderAlt className="pointer-events-none absolute right-2.5 top-2.5 animate-spin" size={14} />
                          )}
                        </div>
                        <p className="mt-2 max-w-32 text-xs leading-5 text-gray-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && reviews.length > 0 && totalPages > 1 && (
          <div className="border-t border-gray-200 px-5 py-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </section>

      {rejectingReview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-review-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !updatingId) {
              setRejectingReview(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <BiXCircle size={24} />
            </span>
            <h2 id="reject-review-title" className="mt-4 text-xl font-bold text-gray-900">
              Reject this review?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              It will not appear on the product page. Add an internal note explaining the decision.
            </p>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                Moderation note <span className="font-normal text-gray-400">(optional)</span>
              </span>
              <textarea
                value={rejectionNote}
                onChange={(event) => setRejectionNote(event.target.value)}
                maxLength={500}
                rows={4}
                placeholder="For example: Contains unrelated or inappropriate content"
                className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <span className="mt-1 block text-right text-xs text-gray-400">
                {rejectionNote.length}/500
              </span>
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(updatingId)}
                onClick={() => setRejectingReview(null)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(updatingId)}
                onClick={() => moderate(rejectingReview, "rejected", rejectionNote)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {updatingId ? <BiLoaderAlt className="animate-spin" /> : <BiXCircle />}
                Reject review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
