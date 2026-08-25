"use client";

import {
  getMessageConversationAction,
  getMessageRealtimeTicketAction,
  listMessageConversationsAction,
  replyToMessageConversationAction,
  updateMessageConversationStatusAction,
  type ConversationDetailsData,
  type ConversationStatus,
  type MessageConversation,
  type MessageRecord,
} from "@/app/actions/message";
import { ConversationRow, messageContactName } from "@/components/messages/MessagesList";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { BiArrowBack, BiCheckCircle, BiLoaderAlt, BiMessageDetail, BiSearch, BiSend } from "react-icons/bi";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");

const MessageDetails = () => {
  const params = useParams<{ id: string }>();
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [selected, setSelected] = useState<ConversationDetailsData | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"all" | ConversationStatus>("all");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    const response = await listMessageConversationsAction({ page: 1, limit: 50, status, search: debouncedSearch || undefined });
    if (response.ok && response.data) setConversations(response.data.conversations);
    else toast.error(response.error || "Could not load conversations");
    setListLoading(false);
  }, [debouncedSearch, status]);

  const loadThread = useCallback(async (showLoader = true) => {
    if (showLoader) setThreadLoading(true);
    const response = await getMessageConversationAction(params.id);
    if (response.ok && response.data) {
      setSelected(response.data);
      void loadList();
    } else toast.error(response.error || "Could not load conversation");
    setThreadLoading(false);
  }, [loadList, params.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void loadList(); void loadThread(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadList, loadThread]);

  useEffect(() => {
    let disposed = false;
    const timeoutId = window.setTimeout(async () => {
      const response = await getMessageRealtimeTicketAction();
      if (disposed || !response.ok || !response.data) return;
      const socket = io(SOCKET_URL, { auth: { ticket: response.data.ticket }, transports: ["websocket", "polling"] });
      socket.on("messages:new", (event: { conversationId: string; message: MessageRecord }) => {
        if (event.conversationId === params.id) {
          setSelected((current) => {
            if (!current || current.messages.some((item) => item._id === event.message._id)) return current;
            return { ...current, messages: [...current.messages, event.message] };
          });
        }
        void loadList();
      });
      socket.on("messages:conversation-updated", () => void loadList());
      socketRef.current = socket;
    }, 0);
    return () => { disposed = true; window.clearTimeout(timeoutId); socketRef.current?.disconnect(); socketRef.current = null; };
  }, [loadList, params.id]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  const sendReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = reply.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    setReply("");
    const response = await replyToMessageConversationAction(selected.conversation._id, text);
    setSending(false);
    if (!response.ok || !response.data) {
      setReply(text);
      toast.error(response.error || "Could not send reply");
      return;
    }
    const saved = response.data.message;
    setSelected((current) => current && !current.messages.some((item) => item._id === saved._id) ? { ...current, messages: [...current.messages, saved] } : current);
    void loadList();
  };

  const changeStatus = async () => {
    if (!selected) return;
    const nextStatus = selected.conversation.status === "open" ? "closed" : "open";
    const response = await updateMessageConversationStatusAction(selected.conversation._id, nextStatus);
    if (!response.ok) return toast.error(response.error || "Could not update conversation");
    setSelected((current) => current ? { ...current, conversation: { ...current.conversation, status: nextStatus } } : current);
    toast.success(nextStatus === "closed" ? "Conversation closed" : "Conversation reopened");
    void loadList();
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 bg-gray-50">
      <header className="flex items-center justify-between rounded border border-gray-200 bg-white p-5">
        <div><h1 className="text-2xl font-bold text-gray-900">Messages</h1><p className="mt-1 text-sm text-gray-500">Customer and visitor support inbox</p></div>
        <Link href="/messages" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"><BiArrowBack /> All messages</Link>
      </header>

      <div className="grid h-[calc(100dvh-13rem)] min-h-[620px] overflow-hidden rounded border border-gray-200 bg-white lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 flex-col border-r border-gray-200 lg:flex">
          <div className="space-y-3 border-b border-gray-200 p-4">
            <div className="relative"><BiSearch className="absolute left-3 top-3 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></div>
            <select value={status} onChange={(event) => setStatus(event.target.value as "all" | ConversationStatus)} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 outline-none"><option value="all">All conversations</option><option value="open">Open</option><option value="closed">Closed</option></select>
          </div>
          <div className="flex-1 overflow-y-auto">{listLoading ? <ConversationListSkeleton /> : conversations.length ? conversations.map((item) => <ConversationRow key={item._id} conversation={item} active={item._id === params.id} />) : <p className="p-8 text-center text-sm text-gray-400">No conversations found</p>}</div>
        </aside>

        <main className="flex min-h-0 flex-col">
          {threadLoading ? <ConversationThreadSkeleton /> : !selected ? <div className="flex flex-1 flex-col items-center justify-center text-gray-400"><BiMessageDetail size={42} /><p className="mt-3 text-sm">Conversation unavailable</p></div> : (
            <>
              <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-4 sm:px-6">
                <div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate font-bold text-gray-900">{messageContactName(selected.conversation)}</h2>{!selected.conversation.customer && <span className="rounded bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase text-gray-500">Guest</span>}</div><p className="mt-1 truncate text-xs text-gray-500">{selected.conversation.customer?.email || selected.conversation.customer?.phone || `Visitor ID: ${selected.conversation.visitorId}`}</p></div>
                <button type="button" onClick={() => void changeStatus()} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${selected.conversation.status === "open" ? "border border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-green-50 text-green-700"}`}><BiCheckCircle />{selected.conversation.status === "open" ? "Close conversation" : "Reopen conversation"}</button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50 p-4 sm:p-6">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Conversation started {new Date(selected.conversation.createdAt).toLocaleDateString()}</p>
                {selected.messages.map((item) => <MessageBubble key={item._id} message={item} />)}
                <div ref={threadEndRef} />
              </div>

              <form onSubmit={sendReply} className="border-t border-gray-200 bg-white p-4">
                <div className="flex items-end gap-2 rounded-xl border border-gray-200 p-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"><textarea value={reply} onChange={(event) => setReply(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} maxLength={2000} rows={2} placeholder="Write a reply…" className="max-h-28 flex-1 resize-none px-2 py-2 text-sm outline-none" /><button type="submit" disabled={!reply.trim() || sending} className="flex h-11 w-11 items-center justify-center rounded-lg bg-black text-white transition hover:bg-black/85 disabled:opacity-40">{sending ? <BiLoaderAlt className="animate-spin" /> : <BiSend size={19} />}</button></div><p className="mt-2 text-center text-[10px] text-gray-400">Press Enter to send · Shift + Enter for a new line</p>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: MessageRecord }) => {
  const staff = message.sender === "staff";
  const senderName = staff && message.senderUser ? `${message.senderUser.firstName} ${message.senderUser.lastName}` : staff ? "Support team" : "Customer";
  return <div className={`flex ${staff ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] ${staff ? "text-right" : "text-left"}`}><p className="mb-1 text-[10px] font-semibold text-gray-400">{senderName}</p><div className={`rounded-2xl px-4 py-3 text-left text-sm leading-6 shadow-sm ${staff ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-gray-100 bg-white text-gray-700"}`}>{message.text}</div><p className="mt-1 text-[10px] text-gray-400">{new Date(message.createdAt).toLocaleString()}</p></div></div>;
};

const Skeleton = ({ className }: { className: string }) => (
  <span className={`block animate-pulse rounded bg-gray-200 ${className}`} />
);

const ConversationListSkeleton = () => (
  <div className="divide-y divide-gray-100" aria-label="Loading conversation list" aria-busy="true">
    {Array.from({ length: 7 }).map((_, index) => (
      <div key={index} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="min-w-0 space-y-2"><Skeleton className={`h-3.5 ${index % 2 ? "w-28" : "w-36"}`} /><Skeleton className="h-3 w-full" /></div>
        <div className="space-y-2"><Skeleton className="h-3 w-12" /><Skeleton className="h-5 w-14 rounded-full" /></div>
      </div>
    ))}
  </div>
);

const ConversationThreadSkeleton = () => (
  <div className="flex min-h-0 flex-1 flex-col" aria-label="Loading conversation" aria-busy="true">
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-56" /></div>
      <Skeleton className="h-9 w-36" />
    </div>
    <div className="flex-1 space-y-6 overflow-hidden bg-gray-50 p-6">
      <Skeleton className="mx-auto h-3 w-44" />
      <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-16 w-[58%] rounded-2xl" /><Skeleton className="h-3 w-24" /></div>
      <div className="ml-auto flex w-full flex-col items-end space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-20 w-[64%] rounded-2xl" /><Skeleton className="h-3 w-20" /></div>
      <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-14 w-[48%] rounded-2xl" /><Skeleton className="h-3 w-24" /></div>
      <div className="ml-auto flex w-full flex-col items-end space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-16 w-[55%] rounded-2xl" /><Skeleton className="h-3 w-20" /></div>
    </div>
    <div className="border-t border-gray-200 bg-white p-4"><div className="flex items-end gap-3 rounded-xl border border-gray-200 p-3"><Skeleton className="h-12 flex-1" /><Skeleton className="h-11 w-11" /></div><Skeleton className="mx-auto mt-2 h-2.5 w-48" /></div>
  </div>
);

export default MessageDetails;
