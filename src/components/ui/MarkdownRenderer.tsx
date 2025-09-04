'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean;
}

export default function MarkdownRenderer({ 
  content, 
  className, 
  compact = false 
}: MarkdownRendererProps) {
  const baseClasses = compact ? 
    'prose-sm prose-p:my-1 prose-headings:my-1' : 
    'prose prose-lg';

  const proseClasses = cn(
    'prose',
    baseClasses,
    'prose-gray dark:prose-invert',
    'prose-headings:text-foreground',
    'prose-p:text-muted-foreground',
    'prose-strong:text-foreground',
    'prose-em:text-muted-foreground',
    'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
    'prose-pre:bg-muted prose-pre:border',
    'prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-4',
    'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
    'prose-li:text-muted-foreground',
    'prose-th:text-foreground prose-td:text-muted-foreground',
    'max-w-none',
    className
  );

  return (
    <div className={proseClasses}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Component customization if needed
        p: ({ children }) => (
          <p className={compact ? 'mb-2 last:mb-0' : 'mb-4 last:mb-0'}>
            {children}
          </p>
        ),
        h1: ({ children }) => (
          <h1 className={compact ? 'text-base font-semibold mb-1' : 'text-2xl font-bold mb-3'}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className={compact ? 'text-sm font-semibold mb-1' : 'text-xl font-semibold mb-2'}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className={compact ? 'text-sm font-medium mb-1' : 'text-lg font-medium mb-2'}>
            {children}
          </h3>
        ),
        ul: ({ children }) => (
          <ul className={compact ? 'list-disc pl-4 mb-2' : 'list-disc pl-6 mb-4'}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className={compact ? 'list-decimal pl-4 mb-2' : 'list-decimal pl-6 mb-4'}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className={compact ? 'mb-0.5' : 'mb-1'}>
            {children}
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className={compact ? 'border-l-2 border-l-primary pl-2 my-1 italic' : 'border-l-4 border-l-primary pl-4 my-4 italic'}>
            {children}
          </blockquote>
        ),
        code: ({ children, inline }) => 
          inline ? (
            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ) : (
            <code className="block bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}