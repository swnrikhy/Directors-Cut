import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { ModelSelector, Provider } from './ModelSelector';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { 
    keys: { gemini?: string; openai?: string };
    settings: { provider: Provider; model: string };
  }) => void;
  savedKeys: { gemini?: string; openai?: string };
  currentProvider: Provider;
  currentModel: string;
  onRemove: (provider: 'gemini' | 'openai') => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  savedKeys,
  currentProvider,
  currentModel,
  onRemove,
}) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  
  // Local state for settings
  const [provider, setProvider] = useState<Provider>('gemini');
  const [model, setModel] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(savedKeys.gemini || '');
      setOpenaiKey(savedKeys.openai || '');
      setProvider(currentProvider);
      setModel(currentModel);
    }
  }, [isOpen, savedKeys, currentProvider, currentModel]);

  const handleSave = () => {
    onSave({
      keys: {
        gemini: geminiKey.trim() || undefined,
        openai: openaiKey.trim() || undefined,
      },
      settings: {
        provider,
        model,
      }
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between bg-[#0f0f0f] z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Configuration</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Keys & Models
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Model Selection Section */}
              <section>
                <ModelSelector 
                  provider={provider}
                  setProvider={setProvider}
                  model={model}
                  setModel={setModel}
                />
              </section>

              {/* API Keys Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 dark:opacity-30">
                    API Credentials
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs leading-relaxed flex gap-3">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-400" />
                  <p>
                    Keys are stored locally in your browser. They are never sent to our servers.
                  </p>
                </div>

                {/* Gemini Key */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      Gemini API Key
                    </label>
                    {savedKeys.gemini && (
                      <button
                        onClick={() => {
                          onRemove('gemini');
                          setGeminiKey('');
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                    />
                    <button
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* OpenAI Key */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      OpenAI API Key
                    </label>
                    {savedKeys.openai && (
                      <button
                        onClick={() => {
                          onRemove('openai');
                          setOpenaiKey('');
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors font-mono"
                    />
                    <button
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 pt-4 border-t border-white/5 bg-[#0f0f0f]">
              <button
                onClick={handleSave}
                className="w-full px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-purple-500/20"
              >
                Save Configuration
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
