
import React, { useState } from 'react';
import type { VideoPrompt } from '../types';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PromptTableProps {
  prompts: VideoPrompt[];
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg bg-[var(--surface-color)] hover:opacity-80 border border-[var(--border-color)] transition-all duration-200 group"
      title="Copy prompt"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <Copy className="w-4 h-4 opacity-40 group-hover:opacity-80" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export const PromptTable: React.FC<PromptTableProps> = ({ prompts }) => {
  return (
    <div className="w-full overflow-hidden glass">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest opacity-40 font-mono">
                #
              </th>
              <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest opacity-40 font-mono">
                Segment
              </th>
              <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest opacity-40 font-mono">
                AI Prompt
              </th>
              <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-widest opacity-40 font-mono">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {prompts.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-[var(--surface-color)] transition-colors"
              >
                <td className="py-6 px-6 text-sm font-mono opacity-30 align-top">
                  {(index + 1).toString().padStart(2, '0')}
                </td>
                <td className="py-6 px-6 text-sm opacity-60 leading-relaxed align-top max-w-xs italic font-serif">
                  "{item.narasi}"
                </td>
                <td className="py-6 px-6 text-sm opacity-90 leading-relaxed align-top font-mono">
                  <div className="bg-[var(--surface-color)] p-4 rounded-xl border border-[var(--border-color)] group-hover:border-[var(--border-color)] transition-colors">
                    {item.prompt}
                  </div>
                </td>
                <td className="py-6 px-6 text-right align-top">
                  <CopyButton text={item.prompt} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
