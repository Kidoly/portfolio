'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
}

export default function CopyCodeButton({ children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof children === 'string') {
      try {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
      title="Copy code"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}
