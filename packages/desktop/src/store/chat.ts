import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** A single chat message. */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  /** Whether the message is still streaming. */
  streaming?: boolean;
}

/** Chat conversation for a workspace. */
export interface ChatConversation {
  workspaceId: string;
  messages: ChatMessage[];
  provider: string;
  model: string;
}

/** Chat store state. */
export interface ChatState {
  /** Per-workspace conversations keyed by workspace ID. */
  conversations: Record<string, ChatConversation>;
  /** Currently selected provider. */
  activeProvider: string;
  /** Currently selected model. */
  activeModel: string;
}

/** Chat store actions. */
export interface ChatActions {
  /** Add a user message to a workspace conversation. */
  addMessage: (workspaceId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  /** Append content to the last assistant message (for streaming). */
  appendToLastMessage: (workspaceId: string, content: string) => void;
  /** Mark the last message as done streaming. */
  finishStreaming: (workspaceId: string) => void;
  /** Clear conversation for a workspace. */
  clearConversation: (workspaceId: string) => void;
  /** Set active provider and model. */
  setProvider: (provider: string, model: string) => void;
  /** Get or create conversation for a workspace. */
  getConversation: (workspaceId: string) => ChatConversation;
}

/** Combined chat store type. */
export type ChatStore = ChatState & ChatActions;

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Zustand store for AI chat with per-workspace conversation history. */
export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: {},
      activeProvider: 'anthropic',
      activeModel: 'claude-sonnet-4-6',

      addMessage: (workspaceId, message) => {
        set((state) => {
          const conv = state.conversations[workspaceId] ?? {
            workspaceId,
            messages: [],
            provider: state.activeProvider,
            model: state.activeModel,
          };
          return {
            conversations: {
              ...state.conversations,
              [workspaceId]: {
                ...conv,
                messages: [
                  ...conv.messages,
                  { ...message, id: generateId(), timestamp: Date.now() },
                ],
              },
            },
          };
        });
      },

      appendToLastMessage: (workspaceId, content) => {
        set((state) => {
          const conv = state.conversations[workspaceId];
          if (!conv || conv.messages.length === 0) return state;
          const messages = [...conv.messages];
          const last = { ...messages[messages.length - 1] };
          last.content += content;
          messages[messages.length - 1] = last;
          return {
            conversations: {
              ...state.conversations,
              [workspaceId]: { ...conv, messages },
            },
          };
        });
      },

      finishStreaming: (workspaceId) => {
        set((state) => {
          const conv = state.conversations[workspaceId];
          if (!conv || conv.messages.length === 0) return state;
          const messages = [...conv.messages];
          const last = { ...messages[messages.length - 1] };
          last.streaming = false;
          messages[messages.length - 1] = last;
          return {
            conversations: {
              ...state.conversations,
              [workspaceId]: { ...conv, messages },
            },
          };
        });
      },

      clearConversation: (workspaceId) => {
        set((state) => {
          const { [workspaceId]: _, ...rest } = state.conversations;
          return { conversations: rest };
        });
      },

      setProvider: (provider, model) => {
        set({ activeProvider: provider, activeModel: model });
      },

      getConversation: (workspaceId) => {
        const state = get();
        return (
          state.conversations[workspaceId] ?? {
            workspaceId,
            messages: [],
            provider: state.activeProvider,
            model: state.activeModel,
          }
        );
      },
    }),
    {
      name: 'ditloop-chat-store',
      partialize: (state) => ({
        conversations: state.conversations,
        activeProvider: state.activeProvider,
        activeModel: state.activeModel,
      }),
    },
  ),
);
