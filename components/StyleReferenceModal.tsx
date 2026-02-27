
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info } from 'lucide-react';
import { StyleRef } from '../constants/styleReferences';

interface StyleReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  references: StyleRef[];
  onSelect: (name: string) => void;
  currentValue: string;
}

export const StyleReferenceModal: React.FC<StyleReferenceModalProps> = ({
  isOpen,
  onClose,
  title,
  references,
  onSelect,
  currentValue,
}) => {
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl max-h-[90vh] bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                  <p className="text-xs opacity-40 uppercase tracking-widest font-bold">
                    Cinematic Reference
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--surface-color)] rounded-full transition-colors"
              >
                <X className="w-6 h-6 opacity-40" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {references.map((ref) => (
                  <motion.div
                    key={ref.name}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      onSelect(ref.name);
                      onClose();
                    }}
                    className={`group cursor-pointer rounded-lg overflow-hidden border transition-all duration-300 ${
                      currentValue === ref.name
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-[var(--border-color)] bg-[var(--surface-color)] hover:border-[var(--border-color)]'
                    }`}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={ref.image}
                        alt={ref.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {currentValue === ref.name && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                          <div className="bg-purple-500 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                            Selected
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold mb-0.5">{ref.name}</h3>
                      <p className="text-[10px] opacity-40 leading-tight line-clamp-2">{ref.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
