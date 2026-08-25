"use server";

import { auth } from "@/auth";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/v1`;

export type ConversationStatus = "open" | "closed";

export interface MessageCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface MessageSenderUser {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

export interface MessageRecord {
  _id: string;
  conversation: string;
  sender: "customer" | "visitor" | "staff";
  senderUser?: MessageSenderUser;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageConversation {
  _id: string;
  customer?: MessageCustomer;
  visitorId?: string;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadForStaff: number;
  unreadForCustomer: number;
  messageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListData {
  conversations: MessageConversation[];
  summary: {
    total: number;
    totalMessages: number;
    open: number;
    closed: number;
    unread: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface ConversationDetailsData {
  conversation: MessageConversation;
  messages: MessageRecord[];
}

type Result<T> = { ok: boolean; data?: T; error?: string };

const getToken = async () => {
  const session = await auth();
  return (session?.user as { accessToken?: string } | undefined)?.accessToken;
};

const request = async (path: string, init: RequestInit = {}) => {
  const token = await getToken();
  if (!token) return { response: null, error: "Not authenticated." };
  try {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
      cache: "no-store",
    });
    return { response };
  } catch {
    return { response: null, error: "Network error. Please try again." };
  }
};

const parse = async <T>(response: Response | null, fallback: string): Promise<Result<T>> => {
  if (!response) return { ok: false, error: fallback };
  try {
    const body = await response.json();
    if (!response.ok) return { ok: false, error: body?.message || fallback };
    return { ok: true, data: body.data as T };
  } catch {
    return { ok: false, error: fallback };
  }
};

export async function listMessageConversationsAction(params: {
  page?: number;
  limit?: number;
  status?: "all" | ConversationStatus;
  search?: string;
} = {}): Promise<Result<ConversationListData>> {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 10),
    status: params.status || "all",
  });
  if (params.search) query.set("search", params.search);
  const { response, error } = await request(`/messages/admin/conversations?${query}`);
  return response ? parse(response, "Could not load conversations.") : { ok: false, error };
}

export async function getMessageConversationAction(id: string): Promise<Result<ConversationDetailsData>> {
  const { response, error } = await request(`/messages/admin/conversations/${id}`);
  return response ? parse(response, "Could not load conversation.") : { ok: false, error };
}

export async function replyToMessageConversationAction(id: string, text: string): Promise<Result<{ conversationId: string; message: MessageRecord }>> {
  const { response, error } = await request(`/messages/admin/conversations/${id}/replies`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return response ? parse(response, "Could not send reply.") : { ok: false, error };
}

export async function updateMessageConversationStatusAction(id: string, status: ConversationStatus): Promise<Result<MessageConversation>> {
  const { response, error } = await request(`/messages/admin/conversations/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response ? parse(response, "Could not update conversation.") : { ok: false, error };
}

export async function getMessageRealtimeTicketAction(): Promise<Result<{ ticket: string }>> {
  const { response, error } = await request("/messages/realtime-ticket", { method: "POST" });
  return response ? parse(response, "Could not connect to live messages.") : { ok: false, error };
}
