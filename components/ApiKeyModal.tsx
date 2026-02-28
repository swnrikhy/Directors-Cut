import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, Check, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  savedKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, savedKey }) => {
  const [key, setKey] = useState(savedKey);

  useEffect(() => {
    setKey(savedKey);
  }, [savedKey, isOpen]);

  const handleSave = () => {
    onSave(key.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-6 rounded-2xl shadow-2xl border bg-[#1a1a1a] border-white/10 text-white"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Key className="w-5 h-5 text-brand-primary" />
                </div>
                <h2 className="text-lg font-bold tracking-tight">API Key Settings</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all bg-black/20 border-white/10 text-white placeholder-white/20"
                />
              </div>

              <div className="p-3 rounded-lg text-xs flex items-start gap-2 bg-blue-500/10 text-blue-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Your API key is stored locally in your browser and is never sent to our servers. 
                  You can get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold">Google AI Studio</a>.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-colors bg-white/5 hover:bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-secondary text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Key
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
