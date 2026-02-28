import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Video, Brain, Cpu, Bot } from 'lucide-react';

export type Provider = 'gemini' | 'openai';

interface ModelSelectorProps {
  provider: Provider;
  setProvider: (provider: Provider) => void;
  model: string;
  setModel: (model: string) => void;
  disabled?: boolean;
}

const MODEL_INFO = {
  gemini: [
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro',
      description: 'Best for complex narrative reasoning & detail.',
      icon: Brain,
    },
    {
      id: 'gemini-3-flash-preview',
      name: 'Gemini 3 Flash',
      description: 'Fast, efficient, and low latency.',
      icon: Zap,
    },
    {
      id: 'veo-3.1-fast-generate-preview',
      name: 'Veo 3.1 Fast',
      description: 'Optimized specifically for video generation prompts.',
      icon: Video,
    },
  ],
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Most capable model for complex tasks.',
      icon: Brain,
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Fast and cost-effective for simple prompts.',
      icon: Zap,
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Legacy model, good for basic speed.',
      icon: Cpu,
    },
  ],
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  provider,
  setProvider,
  model,
  setModel,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 dark:opacity-30">
          AI Model Configuration
        </label>
      </div>

      {/* Provider Toggle */}
      <div className="p-1 bg-black/20 rounded-xl border border-white/5 flex">
        <button
          onClick={() => {
            setProvider('gemini');
            setModel('gemini-3.1-pro-preview');
          }}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
            provider === 'gemini'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          Gemini
        </button>
        <button
          onClick={() => {
            setProvider('openai');
            setModel('gpt-4o');
          }}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
            provider === 'openai'
              ? 'bg-green-600 text-white shadow-lg'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Bot className="w-3 h-3" />
          OpenAI
        </button>
      </div>

      {/* Model List */}
      <div className="grid grid-cols-1 gap-2">
        {MODEL_INFO[provider].map((m) => {
          const Icon = m.icon;
          const isSelected = model === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              disabled={disabled}
              className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all group ${
                isSelected
                  ? 'bg-white/5 border-white/20 shadow-inner'
                  : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isSelected
                    ? provider === 'gemini'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-green-500/20 text-green-400'
                    : 'bg-white/5 text-gray-500 group-hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  >
                    {m.name}
                  </span>
                  {isSelected && (
                    <motion.div
                      layoutId="active-indicator"
                      className={`w-1.5 h-1.5 rounded-full ${
                        provider === 'gemini' ? 'bg-purple-400' : 'bg-green-400'
                      }`}
                    />
                  )}
                </div>
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                  {m.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
