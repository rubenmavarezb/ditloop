import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '../../store/chat.js';
import { useWorkspaceTabsStore } from '../../store/workspace-tabs.js';

/** Available AI providers. */
const PROVIDERS = [
  { id: 'anthropic', name: 'Claude', models: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001'] },
  { id: 'openai', name: 'GPT', models: ['gpt-4o', 'gpt-4o-mini'] },
  { id: 'local', name: 'Local', models: ['ollama/llama3', 'ollama/codellama'] },
];

/**
 * AI Chat panel — center-top panel for conversing with AI about workspace code.
 * Includes editor tabs, chat messages with code blocks, provider selector, and input area.
 * Uses Zustand chat store for per-workspace conversation persistence.
 */
export function AiChatPanel() {
  const { activeTabId } = useWorkspaceTabsStore();
  const workspaceId = activeTabId ?? 'global';

  const {
    addMessage,
    clearConversation,
    getConversation,
    activeProvider,
    activeModel,
    setProvider,
  } = useChatStore();

  const conversation = useChatStore((s) => s.conversations[workspaceId]);
  const messages = conversation?.messages ?? [];

  const [input, setInput] = useState('');
  const [showProviders, setShowProviders] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentProvider = PROVIDERS.find((p) => p.id === activeProvider) ?? PROVIDERS[0];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    addMessage(workspaceId, { role: 'user', content: text });
    setInput('');

    // Simulate an AI response (real integration will use streaming API)
    setTimeout(() => {
      addMessage(workspaceId, {
        role: 'assistant',
        content: `I'll help you with that. Let me analyze your request about: "${text.slice(0, 50)}..."

This is a placeholder response. Real AI integration will stream tokens from the selected provider (${activeProvider}/${activeModel}).`,
        streaming: false,
      });
    }, 800);
  }, [input, workspaceId, addMessage, activeProvider, activeModel]);

  return (
    <div className="flex h-full flex-col">
      {/* Editor Tabs */}
      <div
        className="flex shrink-0"
        style={{
          height: 44,
          background: 'var(--dl-bg-panel-hover, rgba(255, 255, 255, 0.03))',
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <TabButton label="AI Chat" icon="message" active />
        <TabButton label="event-bus.ts" icon="file" />
        <TabButton label="workspace-manager.ts" icon="file" />
        <button
          className="flex items-center justify-center px-3"
          style={{ color: 'var(--dl-text-muted)' }}
        >
          <span className="text-lg">+</span>
        </button>
      </div>

      {/* Chat Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4"
        style={{
          height: 52,
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Provider Selector */}
          <div className="relative">
            <button
              onClick={() => setShowProviders(!showProviders)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: 'var(--dl-bg-panel-hover)',
                border: '1px solid var(--dl-border-subtle)',
              }}
            >
              <div className="h-2 w-2 rounded-full" style={{ background: 'var(--dl-accent-primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--dl-text-primary)' }}>
                {currentProvider.name} {activeModel.split('/').pop()?.split('-').slice(0, 2).join('-')}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--dl-text-muted)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showProviders && (
              <ProviderDropdown
                providers={PROVIDERS}
                activeProvider={activeProvider}
                activeModel={activeModel}
                onSelect={(provider, model) => {
                  setProvider(provider, model);
                  setShowProviders(false);
                }}
                onClose={() => setShowProviders(false)}
              />
            )}
          </div>
          <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
            {messages.length} messages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => clearConversation(workspaceId)}
            className="text-xs px-2 py-1 rounded"
            style={{ color: 'var(--dl-text-secondary)', background: 'var(--dl-bg-panel-hover)' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: 'var(--dl-accent-gradient)',
                opacity: 0.6,
              }}
            >
              <span className="text-lg font-bold" style={{ color: 'var(--dl-text-inverse)' }}>AI</span>
            </div>
            <span className="text-sm" style={{ color: 'var(--dl-text-muted)' }}>
              Ask about your code, request changes, or start a task...
            </span>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="shrink-0 p-4"
        style={{
          background: 'var(--dl-bg-overlay, rgba(0, 0, 0, 0.2))',
          borderTop: '1px solid var(--dl-border-subtle)',
        }}
      >
        <div
          className="flex items-end gap-3 rounded-lg p-3"
          style={{
            background: 'var(--dl-bg-input, rgba(0, 0, 0, 0.2))',
            border: '1px solid var(--dl-border-default)',
            borderRadius: 'var(--dl-radius-card)',
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your code, request changes..."
            className="flex-1 resize-none bg-transparent text-sm outline-none selectable"
            style={{
              color: 'var(--dl-text-primary)',
              fontFamily: 'var(--dl-font-sans)',
              minHeight: 40,
              maxHeight: 120,
            }}
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
            style={{
              background: input.trim() ? 'var(--dl-accent-gradient)' : 'var(--dl-bg-panel-hover)',
              color: input.trim() ? 'var(--dl-text-inverse)' : 'var(--dl-text-muted)',
              borderRadius: 'var(--dl-radius-button)',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/** Tab button in the editor tab bar. */
function TabButton({ label, active }: { label: string; icon: string; active?: boolean }) {
  return (
    <button
      className="flex items-center gap-2 px-4 text-xs font-medium"
      style={{
        color: active ? 'var(--dl-text-primary)' : 'var(--dl-text-muted)',
        background: active ? 'var(--dl-bg-panel-hover)' : 'transparent',
        borderBottom: active ? '2px solid var(--dl-accent-primary)' : '2px solid transparent',
        borderRight: '1px solid var(--dl-border-subtle)',
      }}
    >
      {label}
    </button>
  );
}

/** Provider dropdown selector. */
function ProviderDropdown({
  providers,
  activeProvider,
  activeModel,
  onSelect,
  onClose,
}: {
  providers: typeof PROVIDERS;
  activeProvider: string;
  activeModel: string;
  onSelect: (provider: string, model: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute top-full left-0 mt-1 z-50 rounded-lg overflow-hidden"
        style={{
          background: 'var(--dl-bg-surface, #0f0f13)',
          border: '1px solid var(--dl-border-default)',
          borderRadius: 'var(--dl-radius-card)',
          minWidth: 200,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {providers.map((p) => (
          <div key={p.id}>
            <div className="px-3 py-1.5" style={{ color: 'var(--dl-text-muted)', fontSize: 10, fontWeight: 600 }}>
              {p.name.toUpperCase()}
            </div>
            {p.models.map((model) => (
              <button
                key={model}
                onClick={() => onSelect(p.id, model)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs"
                style={{
                  color: p.id === activeProvider && model === activeModel
                    ? 'var(--dl-accent-primary)'
                    : 'var(--dl-text-secondary)',
                  background: p.id === activeProvider && model === activeModel
                    ? 'rgba(0, 217, 255, 0.1)'
                    : 'transparent',
                }}
              >
                {model}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/** Chat message bubble with code block detection. */
function ChatMessage({ message }: { message: { id: string; role: string; content: string; streaming?: boolean } }) {
  // Split content into text and code blocks
  const parts = message.content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{
          background: message.role === 'user' ? 'var(--dl-accent-gradient)' : 'var(--dl-bg-panel-hover)',
          color: message.role === 'user' ? 'var(--dl-text-inverse)' : 'var(--dl-accent-primary)',
          border: message.role === 'assistant' ? '1px solid var(--dl-border-default)' : undefined,
        }}
      >
        {message.role === 'user' ? 'U' : 'AI'}
      </div>
      <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {parts.map((part, i) => {
          if (part.startsWith('```')) {
            const lines = part.split('\n');
            const lang = lines[0].replace('```', '').trim();
            const code = lines.slice(1, -1).join('\n');
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-lg p-3 text-xs selectable"
                style={{
                  background: 'var(--dl-bg-terminal, #08080a)',
                  border: '1px solid var(--dl-border-subtle)',
                  borderRadius: 'var(--dl-radius-button)',
                  fontFamily: 'var(--dl-font-mono)',
                  color: 'var(--dl-text-primary)',
                }}
              >
                {lang && (
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>{lang}</span>
                    <button className="text-xs px-2 py-0.5 rounded" style={{ color: 'var(--dl-text-muted)', background: 'var(--dl-bg-panel-hover)' }}>
                      Copy
                    </button>
                  </div>
                )}
                <code>{code}</code>
              </pre>
            );
          }
          return (
            <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--dl-text-primary)' }}>
              {part}
            </p>
          );
        })}

        {/* Streaming indicator */}
        {message.streaming && (
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--dl-accent-primary)' }} />
            <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>Thinking...</span>
          </div>
        )}

        {/* Action buttons for assistant messages */}
        {message.role === 'assistant' && !message.streaming && (
          <div className="flex items-center gap-2 mt-1">
            <button
              className="text-xs px-3 py-1.5 rounded font-medium"
              style={{
                background: 'var(--dl-accent-primary)',
                color: 'var(--dl-text-inverse)',
                borderRadius: 'var(--dl-radius-small)',
              }}
            >
              APPLY CHANGES
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded font-medium"
              style={{
                background: 'var(--dl-bg-panel-hover)',
                color: 'var(--dl-text-secondary)',
                border: '1px solid var(--dl-border-default)',
                borderRadius: 'var(--dl-radius-small)',
              }}
            >
              CREATE TASK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
