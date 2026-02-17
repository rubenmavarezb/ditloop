import { useState } from 'react';

/**
 * AI Chat panel — center-top panel for conversing with AI about workspace code.
 * Includes editor tabs, chat messages with code blocks, and input area.
 */
export function AiChatPanel() {
  const [message, setMessage] = useState('');

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
        <TabButton label="AI Chat" icon="message-square" active />
        <TabButton label="event-bus.ts" icon="file-code" />
        <TabButton label="workspace-manager.ts" icon="file-code" />
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
          height: 65,
          borderBottom: '1px solid var(--dl-border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: 'var(--dl-bg-panel-hover)',
              border: '1px solid var(--dl-border-subtle)',
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: 'var(--dl-accent-primary)' }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--dl-text-primary)' }}>
              Claude Sonnet
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--dl-text-muted)' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <span className="text-xs" style={{ color: 'var(--dl-text-muted)' }}>
            Context: 2 files, 1 role
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded"
            style={{ color: 'var(--dl-text-secondary)', background: 'var(--dl-bg-panel-hover)' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Sample User Message */}
        <ChatMessage
          role="user"
          content="Review the event bus implementation and suggest improvements for type safety."
        />

        {/* Sample AI Response */}
        <ChatMessage
          role="assistant"
          content={`I'll review your EventBus implementation. I can see you're using a typed event system which is great. Here are my suggestions:\n\n\`\`\`typescript\nexport interface EventMap {\n  'workspace:changed': { id: string };\n  'profile:switched': { name: string };\n}\n\nexport class EventBus<T extends EventMap> {\n  private listeners = new Map<keyof T, Set<Function>>();\n  \n  on<K extends keyof T>(event: K, fn: (data: T[K]) => void) {\n    // Type-safe event subscription\n  }\n}\n\`\`\`\n\nThe key improvement is using a generic constraint on the EventMap to ensure type safety at the subscription level.`}
        />
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
            className="flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
            style={{
              background: 'var(--dl-accent-gradient)',
              color: 'var(--dl-text-inverse)',
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
function TabButton({ label, icon, active }: { label: string; icon: string; active?: boolean }) {
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

/** Chat message bubble. */
function ChatMessage({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  // Simple code block detection
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{
          background: role === 'user'
            ? 'var(--dl-accent-gradient)'
            : 'var(--dl-bg-panel-hover)',
          color: role === 'user'
            ? 'var(--dl-text-inverse)'
            : 'var(--dl-accent-primary)',
          border: role === 'assistant' ? '1px solid var(--dl-border-default)' : undefined,
        }}
      >
        {role === 'user' ? 'U' : 'AI'}
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
                  <div className="mb-2 text-xs" style={{ color: 'var(--dl-text-muted)' }}>
                    {lang}
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

        {/* Action buttons for assistant messages */}
        {role === 'assistant' && (
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
