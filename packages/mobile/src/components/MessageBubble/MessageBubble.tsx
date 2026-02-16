import { useState } from 'react';

/** Props for the MessageBubble component. */
interface MessageBubbleProps {
  /** Message role: user or assistant. */
  role: 'user' | 'assistant';
  /** Message text content (may contain markdown code blocks). */
  content: string;
  /** ISO timestamp for the message. */
  timestamp: number;
  /** Whether the assistant is still streaming this message. */
  streaming?: boolean;
}

/** Regex to split content into text and fenced code blocks. */
const CODE_BLOCK_RE = /(```[\s\S]*?```)/g;

/** Renders a fenced code block with a copy button. */
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  // Strip the opening ```lang and closing ```
  const lines = code.split('\n');
  const body = lines.slice(1, -1).join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  return (
    <div className="relative my-2 rounded-lg bg-slate-900 p-3">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300 active:bg-slate-600"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto text-xs leading-relaxed text-slate-200">
        <code>{body}</code>
      </pre>
    </div>
  );
}

/**
 * Renders a single chat message bubble.
 * User messages are right-aligned with blue background.
 * Assistant messages are left-aligned with slate background.
 * Detects fenced code blocks and renders them with a dark background and copy button.
 */
export function MessageBubble({ role, content, timestamp, streaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  // Split content into text segments and code blocks
  const parts = content.split(CODE_BLOCK_RE);

  const timeStr = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'rounded-br-md bg-blue-600 text-white'
            : 'rounded-bl-md bg-slate-800 text-slate-100'
        }`}
      >
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {parts.map((part, i) =>
            part.startsWith('```') ? (
              <CodeBlock key={i} code={part} />
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
          {streaming && (
            <span className="ml-0.5 inline-block animate-pulse text-ditloop-400">|</span>
          )}
        </div>
        <div
          className={`mt-1 text-[10px] ${
            isUser ? 'text-blue-200' : 'text-slate-500'
          }`}
        >
          {timeStr}
        </div>
      </div>
    </div>
  );
}
