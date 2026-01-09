'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    if (!content) return null;

    return (
        <div className={`prose prose-invert prose-sm md:prose-base max-w-none 
            prose-headings:text-white prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-3
            prose-strong:text-white prose-strong:font-bold
            prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
            prose-li:text-gray-300 prose-li:mb-1
            ${className}`}
        >
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}
