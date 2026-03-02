import React, { useState } from 'react';
import { Check, Copy, Layout } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
  onOpenCanvas: (code: string) => void;
  canvasEnabled: boolean;
}

export function CodeBlock({ language, code, onOpenCanvas, canvasEnabled }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRenderable = canvasEnabled && (language === 'html' || language === 'svg' || language === 'xml');

  return (
    <div className="relative group rounded-xl border border-[var(--border)] bg-[var(--muted)] overflow-hidden my-4 max-w-full" dir="ltr">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg)]">
        <span className="text-xs font-mono text-[var(--muted-fg)] uppercase">{language || 'text'}</span>
        <div className="flex items-center gap-2">
          {isRenderable && (
            <button onClick={() => onOpenCanvas(code)} className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--border)] text-xs text-[var(--muted-fg)] transition-colors">
              <Layout className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
          )}
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--border)] text-xs text-[var(--muted-fg)] transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <div className="overflow-auto max-h-[400px] max-w-full w-full">
        <pre className="p-4 text-sm bg-[var(--muted)] text-[var(--fg)] min-w-fit">
          <code className={language ? `language-${language}` : ''} style={{ fontFamily: 'var(--font-mono)' }}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
