"use client";

import Pagination from "@/components/shared/Pagination";
import { useMemo, useState } from "react";
import {
  BiBox,
  BiCheckCircle,
  BiCommentDetail,
  BiSolidStar,
  BiStar,
  BiTimeFive,
  BiTrash,
  BiXCircle,
} from "react-icons/bi";

const PAGE_SIZE = 10;

type ReviewStatus = "published" | "pending" | "hidden";

interface Review {
  id: string;
  productTitle: string;
  productImage?: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

const REVIEW_STATUSES: ReviewStatus[] = ["published", "pending", "hidden"];

// Design-only placeholder data — no backend/API wiring.
const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    productTitle: "API Stress Coat Water Conditioner",
    customerName: "Rahim Uddin",
    rating: 5,
    title: "Works instantly",
    comment:
      "Removed the chlorine smell right away and my fish looked comfortable within an hour.",
    status: "published",
    createdAt: "2026-08-12T10:00:00.000Z",
  },
  {
    id: "2",
    productTitle: "Fish Food Pellets 200g",
    customerName: "Karim Hossain",
    rating: 4,
    title: "Good value",
    comment: "My guppies love it, though the bag could be a bit bigger for the price.",
    status: "published",
    createdAt: "2026-08-11T14:30:00.000Z",
  },
  {
    id: "3",
    productTitle: "Aquarium LED Light Bar",
    customerName: "Jamal Ahmed",
    rating: 3,
    title: "Decent but noisy",
    comment: "Light quality is nice but the built-in fan has a faint hum at night.",
    status: "pending",
    createdAt: "2026-08-10T09:15:00.000Z",
  },
  {
    id: "4",
    productTitle: "Internal Aquarium Filter 500L/H",
    customerName: "Nusrat Jahan",
    rating: 5,
    title: "Very quiet",
    comment: "Barely hear it running. Water stayed clear within two days of setup.",
    status: "published",
    createdAt: "2026-08-09T18:45:00.000Z",
  },
  {
    id: "5",
    productTitle: "Aquarium Filter",
    customerName: "Sabbir Islam",
    rating: 2,
    title: "Stopped working after a week",
    comment: "Motor died after 8 days of use. Waiting on a replacement.",
    status: "pending",
    createdAt: "2026-08-08T11:20:00.000Z",
  },
  {
    id: "6",
    productTitle: "Fish Food Pellets 200g",
    customerName: "Tania Akter",
    rating: 5,
    title: "My bettas love these",
    comment: "Bought a second bag already. Great texture and color for the fish.",
    status: "published",
    createdAt: "2026-08-07T08:00:00.000Z",
  },
  {
    id: "7",
    productTitle: "Aquarium LED Light Bar",
    customerName: "Farhan Kabir",
    rating: 1,
    title: "Not as described",
    comment: "Color temperature is way cooler than shown in the photos. Disappointed.",
    status: "hidden",
    createdAt: "2026-08-06T16:10:00.000Z",
  },
  {
    id: "8",
    productTitle: "API Stress Coat Water Conditioner",
    customerName: "Mitu Rahman",
    rating: 4,
    title: "Reliable",
    comment: "Been using this for months, no issues at all.",
    status: "published",
    createdAt: "2026-08-05T13:25:00.000Z",
  },
  {
    id: "9",
    productTitle: "Internal Aquarium Filter 500L/H",
    customerName: "Sadia Islam",
    rating: 3,
    title: "Average",
    comment: "Does the job but the intake gets clogged with gravel easily.",
    status: "pending",
    createdAt: "2026-08-04T07:40:00.000Z",
  },
  {
    id: "10",
    productTitle: "Aquarium Filter",
    customerName: "Hasan Mahmud",
    rating: 5,
    title: "Excellent filtration",
    comment: "Water clarity improved dramatically within the first day.",
    status: "published",
    createdAt: "2026-08-03T19:55:00.000Z",
  },
  {
    id: "11",
    productTitle: "Fish Food Pellets 200g",
    customerName: "Imran Chowdhury",
    rating: 4,
    title: "Fish seem healthier",
    comment: "Noticed better color on my discus after switching to this food.",
    status: "published",
    createdAt: "2026-08-02T12:05:00.000Z",
  },
  {
    id: "12",
    productTitle: "Aquarium LED Light Bar",
    customerName: "Ruma Begum",
    rating: 5,
    title: "Beautiful glow",
    comment: "Makes my planted tank look amazing in the evening.",
    status: "published",
    createdAt: "2026-08-01T15:30:00.000Z",
  },
];

function ratingBadgeClass(rating: number) {
  if (rating >= 4) return "text-amber-500";
  if (rating === 3) return "text-amber-400";
  return "text-gray-300";
}

function reviewStatusBadgeClass(status: ReviewStatus) {
  switch (status) {
    case "published":
      return "bg-green-50 text-green-700";
    case "hidden":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className={`flex items-center gap-0.5 ${ratingBadgeClass(rating)}`}>
    {Array.from({ length: 5 }).map((_, i) =>
      i < rating ? (
        <BiSolidStar key={i} size={15} />
      ) : (
        <BiStar key={i} size={15} className="text-gray-200" />
      ),
    )}
  </div>
);

const ReviewsList = () => {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedReviews = useMemo(
    () => reviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [reviews, currentPage],
  );

  // Statistics
  const totalReviews = reviews.length;
  const publishedReviews = reviews.filter((r) => r.status === "published").length;
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const stats = [
    {
      title: "Total Reviews",
      value: totalReviews,
      subtitle: "All customer reviews",
      icon: <BiCommentDetail size={20} />,
      color: "bg-primary/10",
      iconColor: "text-primary-dark",
    },
    {
      title: "Published",
      value: publishedReviews,
      subtitle: "Visible in the storefront",
      icon: <BiCheckCircle size={20} />,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Pending",
      value: pendingReviews,
      subtitle: "Awaiting moderation",
      icon: <BiTimeFive size={20} />,
      color: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Average Rating",
      value: `${averageRating} / 5`,
      subtitle: "Across all reviews",
      icon: <BiSolidStar size={20} />,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const handleStatusChange = (review: Review, status: ReviewStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, status } : r)),
    );
  };

  const handleDelete = (review: Review) => {
    if (!confirm(`Delete this review by "${review.customerName}"?`)) return;
    setReviews((prev) => prev.filter((r) => r.id !== review.id));
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
            <p className="text-sm text-gray-500 mt-1">
              Moderate and manage customer product reviews
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
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
            <p className="mb-1 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        <BiBox size={18} />
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                        {review.productTitle}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-700 truncate max-w-[140px]">
                      {review.customerName}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0 max-w-xs">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {review.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {review.comment}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={review.status}
                      onChange={(e) =>
                        handleStatusChange(review, e.target.value as ReviewStatus)
                      }
                      className={`rounded-full border-0 px-3 py-1 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-primary/20 ${reviewStatusBadgeClass(review.status)}`}
                    >
                      {REVIEW_STATUSES.map((status) => (
                        <option key={status} value={status} className="capitalize">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(review)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Delete review"
                    >
                      <BiTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {reviews.length === 0 && (
          <div className="text-center py-20 bg-white">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BiXCircle size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No reviews yet
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Reviews left by customers will appear here.
            </p>
          </div>
        )}

        {reviews.length > 0 && totalPages > 1 && (
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

export default ReviewsList;
