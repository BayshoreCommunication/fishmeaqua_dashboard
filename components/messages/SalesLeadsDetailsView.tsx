"use client";

import Pagination from "@/components/shared/Pagination";
import { useMemo, useState } from "react";
import {
  BiCheckCircle,
  BiEnvelope,
  BiEnvelopeOpen,
  BiMessageDetail,
  BiTimeFive,
  BiX,
} from "react-icons/bi";

const PAGE_SIZE = 10;

type MessageStatus = "new" | "read" | "replied";

interface CustomerMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

const MESSAGE_STATUSES: MessageStatus[] = ["new", "read", "replied"];

// Design-only placeholder data — no backend/API wiring.
const MOCK_MESSAGES: CustomerMessage[] = [
  {
    id: "1",
    name: "Rahim Uddin",
    email: "rahim@example.com",
    phone: "+8801711111111",
    subject: "Question about delivery time",
    message:
      "Hi, I placed order FMA-ORD-4 yesterday. How long does delivery usually take for Inside Dhaka addresses?",
    status: "new",
    createdAt: "2026-08-18T10:00:00.000Z",
  },
  {
    id: "2",
    name: "Karim Hossain",
    email: "karim@example.com",
    phone: "+8801822222222",
    subject: "Filter not working",
    message:
      "The internal filter I bought last week stopped running after 3 days. Can I get a replacement or refund?",
    status: "new",
    createdAt: "2026-08-17T14:30:00.000Z",
  },
  {
    id: "3",
    name: "Jamal Ahmed",
    email: "jamal@example.com",
    subject: "Bulk order for shop",
    message:
      "I run a small aquarium shop in Chattogram and would like to know if you offer wholesale pricing for bulk orders.",
    status: "read",
    createdAt: "2026-08-16T09:15:00.000Z",
  },
  {
    id: "4",
    name: "Nusrat Jahan",
    email: "nusrat@example.com",
    phone: "+8801644444444",
    subject: "Product recommendation",
    message:
      "Can you suggest a good water conditioner for a 20 gallon planted tank with a few tetras?",
    status: "replied",
    createdAt: "2026-08-15T18:45:00.000Z",
  },
  {
    id: "5",
    name: "Sabbir Islam",
    email: "sabbir@example.com",
    subject: "Wrong item received",
    message:
      "I ordered fish food pellets but received a different product. Order number is FMA-ORD-2.",
    status: "new",
    createdAt: "2026-08-14T11:20:00.000Z",
  },
  {
    id: "6",
    name: "Tania Akter",
    email: "tania@example.com",
    phone: "+8801366666666",
    subject: "Payment issue",
    message:
      "My bKash payment was deducted but the order didn't go through on the website. Please check.",
    status: "read",
    createdAt: "2026-08-13T08:00:00.000Z",
  },
  {
    id: "7",
    name: "Farhan Kabir",
    email: "farhan@example.com",
    subject: "LED light warranty",
    message:
      "Does the aquarium LED light bar come with a warranty? Couldn't find this info on the product page.",
    status: "replied",
    createdAt: "2026-08-12T16:10:00.000Z",
  },
  {
    id: "8",
    name: "Mitu Rahman",
    email: "mitu@example.com",
    phone: "+8801888888888",
    subject: "Cancel my order",
    message:
      "I'd like to cancel order FMA-ORD-7 placed this morning, ordered the wrong quantity by mistake.",
    status: "new",
    createdAt: "2026-08-11T13:25:00.000Z",
  },
];

function truncateWords(text: string, limit = 8): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "...";
}

function statusBadgeClass(status: MessageStatus) {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700";
    case "replied":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

const SalesLeadsDetailsView = () => {
  const [messages, setMessages] = useState<CustomerMessage[]>(MOCK_MESSAGES);
  const [viewingMessage, setViewingMessage] = useState<CustomerMessage | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedMessages = useMemo(
    () => messages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [messages, currentPage],
  );

  // Statistics
  const totalMessages = messages.length;
  const newMessages = messages.filter((m) => m.status === "new").length;
  const readMessages = messages.filter((m) => m.status === "read").length;
  const repliedMessages = messages.filter((m) => m.status === "replied").length;

  const stats = [
    {
      title: "Total Messages",
      value: totalMessages,
      subtitle: "All customer inquiries",
      icon: <BiMessageDetail size={20} />,
      color: "bg-primary/10",
      iconColor: "text-primary-dark",
    },
    {
      title: "New",
      value: newMessages,
      subtitle: "Not yet opened",
      icon: <BiEnvelope size={20} />,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Read",
      value: readMessages,
      subtitle: "Opened, awaiting reply",
      icon: <BiTimeFive size={20} />,
      color: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Replied",
      value: repliedMessages,
      subtitle: "Resolved inquiries",
      icon: <BiCheckCircle size={20} />,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  const handleStatusChange = (message: CustomerMessage, status: MessageStatus) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, status } : m)),
    );
  };

  const handleOpenMessage = (message: CustomerMessage) => {
    setViewingMessage(message);
    if (message.status === "new") {
      handleStatusChange(message, "read");
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              Customer inquiries submitted from the website contact form
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

      {/* Messages Table */}
      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Subject &amp; Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedMessages.map((msg) => (
                <tr key={msg.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {msg.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <BiEnvelope size={12} />
                      {msg.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${
                        !msg.phone ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      {msg.phone || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleOpenMessage(msg)}
                      className="block max-w-xs text-left"
                    >
                      <p className="text-sm font-medium text-gray-900 hover:text-primary-dark hover:underline">
                        {msg.subject}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {truncateWords(msg.message)}
                      </p>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={msg.status}
                      onChange={(e) =>
                        handleStatusChange(msg, e.target.value as MessageStatus)
                      }
                      className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${statusBadgeClass(msg.status)}`}
                    >
                      {MESSAGE_STATUSES.map((status) => (
                        <option key={status} value={status} className="capitalize">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="text-center py-20 bg-white">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BiEnvelopeOpen size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No messages yet
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Inquiries submitted from the website contact form will appear
              here.
            </p>
          </div>
        )}

        {messages.length > 0 && totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Full message modal */}
      {viewingMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewingMessage(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {viewingMessage.subject}
                </h2>
                <p className="text-xs text-gray-500">
                  {viewingMessage.name} · {viewingMessage.email}
                </p>
              </div>
              <button
                onClick={() => setViewingMessage(null)}
                className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <BiX size={22} />
              </button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {viewingMessage.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesLeadsDetailsView;
