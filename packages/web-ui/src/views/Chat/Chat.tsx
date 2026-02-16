import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../api/index.js';
import { ditloopWs } from '../../api/index.js';
import { useConnectionStore } from '../../store/connection.js';
import { MessageBubble } from '../../components/MessageBubble/index.js';

/** A single chat message. */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/** Connection status indicator dot colors. */
const STATUS_COLORS: Record<string, string> = {
  connected: 'bg-green-500',
  connecting: 'bg-yellow-500',
  disconnected: 'bg-slate-500',
  error: 'bg-red-500',
};

/**
 * Full-screen chat interface for interacting with the DitLoop AI assistant.
 * Sends prompts via the REST API and receives streaming responses over WebSocket.
 */
export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const status = useConnectionStore((s) => s.status);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to chat WebSocket events
  useEffect(() => {
    const unsubscribe = ditloopWs.onMessage((message) => {
      if (!message.event.startsWith('chat:')) return;

      if (message.event === 'chat:chunk') {
        const { messageId, content } = message.data as {
          messageId: string;
          content: string;
        };
        setStreamingId(messageId);
        setMessages((prev) => {
          const existing = prev.find((m) => m.id === messageId);
          if (existing) {
            return prev.map((m) =>
              m.id === messageId ? { ...m, content: m.content + content } : m,
            );
          }
          return [
            ...prev,
            {
              id: messageId,
              role: 'assistant',
              content,
              timestamp: message.timestamp,
            },
          ];
        });
      } else if (message.event === 'chat:done') {
        setStreamingId(null);
      } else if (message.event === 'chat:error') {
        const { messageId, error } = message.data as {
          messageId: string;
          error: string;
        };
        setStreamingId(null);
        setMessages((prev) => {
          const existing = prev.find((m) => m.id === messageId);
          if (existing) {
            return prev.map((m) =>
              m.id === messageId
                ? { ...m, content: m.content + `\n\n_Error: ${error}_` }
                : m,
            );
          }
          return [
            ...prev,
            {
              id: messageId ?? crypto.randomUUID(),
              role: 'assistant',
              content: `_Error: ${error}_`,
              timestamp: Date.now(),
            },
          ];
        });
      }
    });

    return unsubscribe;
  }, []);

  const handleSend = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || streamingId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      await apiFetch('/execute', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Failed to send message. Please check your connection.',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [input, streamingId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.disconnected;

  return (
    <div className="flex h-full flex-col">
      {/* Header with status indicator */}
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
        <span className={`h-2 w-2 rounded-full ${statusColor}`} />
        <span className="text-xs text-slate-400 capitalize">{status}</span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-slate-600">
            Send a message to start
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
            streaming={msg.id === streamingId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-800 bg-slate-950/80 p-3 pb-safe backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask DitLoop..."
            disabled={!!streamingId}
            className="flex-1 rounded-full bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-700 focus:ring-ditloop-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !!streamingId}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ditloop-600 text-white transition-colors active:bg-ditloop-700 disabled:opacity-40"
          >
            <span className="text-lg font-bold">&uarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
