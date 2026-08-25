"use client";

import {
  getMessageRealtimeTicketAction,
  listMessageConversationsAction,
  type ConversationListData,
  type ConversationStatus,
  type MessageConversation,
} from "@/app/actions/message";
import Pagination from "@/components/shared/Pagination";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BiConversation,
  BiEnvelope,
  BiLockOpen,
  BiMessageDetail,
  BiRefresh,
  BiChevronRight,
  BiSearch,
  BiUser,
} from "react-icons/bi";
import { io, type Socket } from "socket.io-client";

const PAGE_SIZE = 10;
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001")
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/$/, "");
const emptySummary: ConversationListData["summary"] = {
  total: 0,
  totalMessages: 0,
  open: 0,
  closed: 0,
  unread: 0,
};

export const messageContactName = (conversation: MessageConversation) =>
  conversation.customer
    ? `${conversation.customer.firstName} ${conversation.customer.lastName}`
    : `Visitor ${conversation.visitorId?.slice(0, 8) || "Unknown"}`;

export const messageTime = (value: string) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(value).toLocaleDateString();
};

const MessagesList = () => {
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<"all" | ConversationStatus>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const response = await listMessageConversationsAction({
      page,
      limit: PAGE_SIZE,
      status,
      search: debouncedSearch || undefined,
    });
    if (response.ok && response.data) {
      setConversations(response.data.conversations);
      setSummary(response.data.summary);
      setTotalPages(response.data.pagination.totalPages);
    } else toast.error(response.error || "Could not load messages");
    setLoading(false);
  }, [debouncedSearch, page, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchConversations(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchConversations]);

  useEffect(() => {
    let disposed = false;
    const timeoutId = window.setTimeout(async () => {
      const response = await getMessageRealtimeTicketAction();
      if (disposed || !response.ok || !response.data) return;
      const socket = io(SOCKET_URL, {
        auth: { ticket: response.data.ticket },
        transports: ["websocket", "polling"],
      });
      socket.on("messages:new", () => void fetchConversations());
      socket.on(
        "messages:conversation-updated",
        () => void fetchConversations(),
      );
      socketRef.current = socket;
    }, 0);
    return () => {
      disposed = true;
      window.clearTimeout(timeoutId);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [fetchConversations]);

  const stats = [
    {
      label: "Total Chats",
      value: summary.total,
      icon: <BiConversation />,
      color: "bg-primary/10 text-primary-dark",
    },
    {
      label: "Total Messages",
      value: summary.totalMessages,
      icon: <BiMessageDetail />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Open Chats",
      value: summary.open,
      icon: <BiLockOpen />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Needs Response",
      value: summary.unread,
      icon: <BiEnvelope />,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-gray-50">
      <header className="rounded border border-gray-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            <p className="mt-1 text-sm text-gray-500">
              Customer and visitor conversations — select one to view its full chat history
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-72">
              <BiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer or visitor..."
                className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "all" | ConversationStatus);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 outline-none"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
            <button
              type="button"
              onClick={() => void fetchConversations()}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <BiRefresh className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${item.color}`}>
                {item.icon}
              </span>
              <p className="text-sm font-medium text-gray-600">{item.label}</p>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded border border-gray-200 bg-white">
        {loading ? (
          <Loading />
        ) : conversations.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {[
                    "Customer / Visitor",
                    "Last Message",
                    "Messages",
                    "Unread",
                    "Status",
                    "Last Activity",
                    "",
                  ].map((heading) => (
                    <th key={heading} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {conversations.map((item) => <ConversationTableRow key={item._id} conversation={item} />)}
              </tbody>
            </table>
          </div>
        )}
        {!loading && conversations.length > 0 && totalPages > 1 && (
          <div className="border-t border-gray-200 px-5 py-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>
    </div>
  );
};

const ConversationTableRow = ({
  conversation,
}: {
  conversation: MessageConversation;
}) => {
  const name = conversation.customer
    ? messageContactName(conversation)
    : "Visitor";
  const secondary = conversation.customer
    ? conversation.customer.email || conversation.customer.phone || "Registered customer"
    : conversation.visitorId || "Unknown visitor";
  const initial = (conversation.customer
    ? conversation.customer.firstName
    : conversation.visitorId || "V")
    .charAt(0)
    .toUpperCase();

  return (
    <tr className="group transition hover:bg-gray-50">
      <td className="px-6 py-4">
        <Link href={`/messages/${conversation._id}`} className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
            {initial}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-gray-900">{name}</span>
              {!conversation.customer && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-500">Visitor</span>}
            </span>
            <span className="mt-0.5 block max-w-72 break-all text-xs text-gray-500">{secondary}</span>
          </span>
        </Link>
      </td>
      <td className="max-w-xs px-6 py-4">
        <p className="truncate text-sm text-gray-600" title={conversation.lastMessage}>
          {conversation.lastMessage || "Conversation started"}
        </p>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-700">
        {conversation.messageCount ?? 0}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${conversation.unreadForStaff > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          {conversation.unreadForStaff}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${conversation.status === "open" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
          {conversation.status}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {new Date(conversation.lastMessageAt).toLocaleString()}
      </td>
      <td className="px-6 py-4 text-right">
        <Link href={`/messages/${conversation._id}`} aria-label={`Open chat with ${name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-300 transition group-hover:bg-primary/10 group-hover:text-primary-dark">
          <BiChevronRight size={20} />
        </Link>
      </td>
    </tr>
  );
};

export const ConversationRow = ({
  conversation,
  active = false,
}: {
  conversation: MessageConversation;
  active?: boolean;
}) => (
  <Link
    href={`/messages/${conversation._id}`}
    className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4 text-left transition ${active ? "bg-primary/[0.08]" : "hover:bg-gray-50"}`}
  >
    <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-bold text-primary-dark">
      <BiUser size={20} />
      {conversation.unreadForStaff > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
          {conversation.unreadForStaff > 9 ? "9+" : conversation.unreadForStaff}
        </span>
      )}
    </span>
    <span className="min-w-0">
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-semibold text-gray-900">
          {conversation.customer ? messageContactName(conversation) : "Visitor"}
        </span>
        {!conversation.customer && (
          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-500">
            Visitor
          </span>
        )}
      </span>
      {!conversation.customer && (
        <span className="mt-1 block break-all text-[10px] leading-4 text-gray-400">
          {conversation.visitorId}
        </span>
      )}
      <span className="mt-1 block truncate text-xs text-gray-500">
        {conversation.lastMessage || "Conversation started"}
      </span>
    </span>
    <span className="text-right">
      <span className="block whitespace-nowrap text-[11px] text-gray-400">
        {messageTime(conversation.lastMessageAt)}
      </span>
      <span className="mt-2 flex items-center justify-end gap-1.5">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-semibold text-gray-600">
          {conversation.messageCount ?? 0} msg
        </span>
        <span
          className={`rounded-full px-2 py-1 text-[9px] font-semibold capitalize ${conversation.status === "open" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}
        >
          {conversation.status}
        </span>
      </span>
    </span>
  </Link>
);

const Skeleton = ({ className }: { className: string }) => (
  <span className={`block animate-pulse rounded bg-gray-200 ${className}`} />
);

const Loading = () => (
  <div className="overflow-hidden" aria-label="Loading conversations" aria-busy="true">
    <div className="grid min-w-[1100px] grid-cols-[2fr_1.5fr_.6fr_.6fr_.7fr_1.2fr_.25fr] border-b border-gray-200 bg-gray-50 px-6 py-4">
      {["w-36", "w-24", "w-16", "w-12", "w-12", "w-24", "w-4"].map((width, index) => (
        <Skeleton key={index} className={`h-3 ${width}`} />
      ))}
    </div>
    <div className="min-w-[1100px] divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[2fr_1.5fr_.6fr_.6fr_.7fr_1.2fr_.25fr] items-center px-6 py-4">
          <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 shrink-0" /><div className="space-y-2"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-44" /></div></div>
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-6 w-8 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);
const Empty = () => (
  <div className="py-20 text-center">
    <BiMessageDetail className="mx-auto text-gray-300" size={38} />
    <h2 className="mt-4 font-semibold text-gray-900">No conversations found</h2>
    <p className="mt-1 text-sm text-gray-500">
      New website chats will appear here in real time.
    </p>
  </div>
);

export default MessagesList;
