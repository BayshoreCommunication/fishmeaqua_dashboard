export type ConversationHistoryMessage = {
  role: string;
  content: string;
  timestamp: string | null;
  source?: string;
};

export type ConversationHistoryItem = {
  session_id: string;
  exchange_count: number;
  lead_captured: boolean;
  lead_name: string | null;
  lead_phone: string | null;
  lead_email: string | null;
  created_at: string | null;
  updated_at: string | null;
  tools_used_history: string[][];
  messages: ConversationHistoryMessage[];
};

export type ConversationHistoryResponse = {
  company_id: string;
  total_sessions: number;
  limit: number;
  offset: number;
  sessions: ConversationHistoryItem[];
};

export type ConversationHistoryActionResult = {
  ok: boolean;
  data?: ConversationHistoryResponse;
  error?: string;
  statusCode?: number;
};
