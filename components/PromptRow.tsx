import React, { useState } from 'react';
import type { VideoPrompt } from '../types';

interface PromptRowProps {
  item: VideoPrompt;
  index: number;
}

export const PromptRow: React.FC<PromptRowProps> = ({ item, index }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset 'Copied!' message after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <tr key={index} className="hover:bg-gray-800/50 transition-colors duration-200">
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-300 sm:pl-6">
        {index + 1}
      </td>
      <td className="whitespace-pre-wrap px-3 py-4 text-sm text-gray-400 align-top">
        {item.narasi}
      </td>
      <td className="whitespace-pre-wrap px-3 py-4 text-sm text-gray-200 align-top">
        {item.prompt}
      </td>
      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6 text-right">
        <button
          onClick={() => handleCopy(item.prompt)}
          className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </td>
    </tr>
  );
};
