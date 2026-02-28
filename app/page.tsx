'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { generateVideoPrompts } from '../services/geminiService';
import { generateOpenAIPrompts } from '../services/openaiService';
import type { VideoPrompt } from '../types';
import { PromptTable } from '../components/PromptTable';
import { Spinner } from '../components/Spinner';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Clock, Palette, Zap, Wand2, Copy, Check, Info, Key } from 'lucide-react';

import { ApiKeyModal } from '../components/ApiKeyModal';
import { StyleReferenceModal } from '../components/StyleReferenceModal';
import { ART_STYLE_REFS, LIGHTING_STYLE_REFS, COLOR_PALETTE_REFS } from '../constants/styleReferences';
import { Provider } from '../components/ModelSelector';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const ART_STYLES = ART_STYLE_REFS.map(r => r.name);
const LIGHTING_STYLES = LIGHTING_STYLE_REFS.map(r => r.name);
const COLOR_PALETTES = COLOR_PALETTE_REFS.map(r => r.name);

export default function Home() {
  const [narrative, setNarrative] = useState<string>('');
  const [minutes, setMinutes] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(0);
  const [artStyle, setArtStyle] = useState<string>('Cinematic');
  const [lightingStyle, setLightingStyle] = useState<string>('Natural Light');
  const [colorPalette, setColorPalette] = useState<string>('Vibrant Colors');
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'art' | 'lighting' | 'palette' | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [userApiKeys, setUserApiKeys] = useState<{ gemini?: string; openai?: string }>({});
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [model, setModel] = useState<string>('gemini-3.1-pro-preview');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');

    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      } else {
        // Check local storage for user provided keys
        const storedGeminiKey = localStorage.getItem('gemini_api_key');
        const storedOpenaiKey = localStorage.getItem('openai_api_key');
        
        const keys = {
          gemini: storedGeminiKey || undefined,
          openai: storedOpenaiKey || undefined,
        };
        
        setUserApiKeys(keys);

        if (storedGeminiKey || storedOpenaiKey) {
          setApiKeySelected(true);
          // Default to available provider
          if (!storedGeminiKey && storedOpenaiKey) {
            setProvider('openai');
            setModel('gpt-4o');
          }
        } else {
          // If no key found in local storage, prompt user
          setApiKeySelected(false);
          setShowApiKeyModal(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleSaveApiKeys = (data: { 
    keys: { gemini?: string; openai?: string };
    settings: { provider: Provider; model: string };
  }) => {
    if (data.keys.gemini) localStorage.setItem('gemini_api_key', data.keys.gemini);
    if (data.keys.openai) localStorage.setItem('openai_api_key', data.keys.openai);
    
    setUserApiKeys(prev => ({ ...prev, ...data.keys }));
    setProvider(data.settings.provider);
    setModel(data.settings.model);
    
    setApiKeySelected(true);
    setShowApiKeyModal(false);
  };

  const handleRemoveApiKey = (providerToRemove: 'gemini' | 'openai') => {
    if (providerToRemove === 'gemini') {
      localStorage.removeItem('gemini_api_key');
      setUserApiKeys(prev => ({ ...prev, gemini: undefined }));
    } else {
      localStorage.removeItem('openai_api_key');
      setUserApiKeys(prev => ({ ...prev, openai: undefined }));
    }
    
    // If no keys left, show modal
    if ((providerToRemove === 'gemini' && !userApiKeys.openai) || 
        (providerToRemove === 'openai' && !userApiKeys.gemini)) {
      setApiKeySelected(false);
    }
  };

  const openApiKeySettings = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKeySelected(true);
    } else {
      setShowApiKeyModal(true);
    }
  };

  const adjustTime = (amount: number) => {
    const total = minutes * 60 + seconds + amount;
    if (total < 0) return;
    setMinutes(Math.floor(total / 60));
    setSeconds(total % 60);
  };

  const handleGenerateClick = useCallback(async () => {
    if (!narrative.trim()) {
      setError('Please enter a narrative.');
      return;
    }

    const totalDuration = minutes * 60 + seconds;

    if (totalDuration <= 0) {
      setError('Total duration must be greater than 0.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrompts([]);

    try {
      let generatedPrompts: VideoPrompt[] = [];
      
      if (provider === 'gemini') {
        // Pass the userApiKey if available
        generatedPrompts = await generateVideoPrompts(
          narrative, 
          totalDuration, 
          5, 
          artStyle, 
          lightingStyle, 
          colorPalette, 
          userApiKeys.gemini || undefined,
          model
        );
      } else {
        if (!userApiKeys.openai) {
          throw new Error("OpenAI API Key is missing. Please configure it in settings.");
        }
        generatedPrompts = await generateOpenAIPrompts(narrative, totalDuration, 5, artStyle, lightingStyle, colorPalette, userApiKeys.openai, model);
      }
      
      setPrompts(generatedPrompts);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate prompts: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [narrative, minutes, seconds, artStyle, lightingStyle, colorPalette, provider, model, userApiKeys]);

  const handleCopyAll = useCallback(async () => {
    const allPromptsText = prompts.map(p => p.prompt).join('\n\n');
    try {
      await navigator.clipboard.writeText(allPromptsText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy all prompts: ', err);
    }
  }, [prompts]);

  if (!apiKeySelected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
        <div className="glass p-8 rounded-2xl text-center max-w-md">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">AI Configuration Required</h1>
          <p className="text-gray-400 mb-6">
            To use this tool, please configure your AI provider settings.
            This ensures access to advanced features like video generation.
          </p>
          <button
            onClick={openApiKeySettings}
            className="btn-primary w-full"
          >
            Configure AI
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Learn more about billing: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ai.google.dev/gemini-api/docs/billing</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] -z-10 animate-pulse transition-colors duration-500 bg-purple-600/20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] -z-10 transition-colors duration-500 bg-pink-600/10" />

      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16 relative">
          <div className="absolute right-0 top-0">
            <button
              onClick={openApiKeySettings}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all duration-300 group shadow-sm text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
              title="AI Settings"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-color)] border border-[var(--border-color)] mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold tracking-widest uppercase opacity-70 dark:opacity-60">AI-Powered Cinematic Tool</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-7xl font-bold tracking-tighter text-gradient mb-6"
          >
            Director's Cut
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg opacity-60 max-w-2xl mx-auto font-serif italic"
          >
            Crafting cinematic prompts in the shadows of your imagination.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="glass p-8 space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 dark:opacity-40">
                  <Wand2 className="w-3 h-3" /> The Narrative
                </label>
                <textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Unfold your dark tale here..."
                  className="input-field h-64 resize-none font-serif text-lg leading-relaxed"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 dark:opacity-40">
                  <Clock className="w-3 h-3" /> Total Duration
                </label>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2 glass p-2 px-4">
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        value={minutes}
                        onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-transparent text-2xl font-mono text-center focus:outline-none"
                        placeholder="00"
                      />
                      <span className="text-[10px] uppercase tracking-widest opacity-40 dark:opacity-20 block">Min</span>
                    </div>
                    <span className="text-2xl font-mono opacity-40 dark:opacity-20">:</span>
                    <div className="flex-1 text-center">
                      <input
                        type="number"
                        value={seconds}
                        onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                        className="w-full bg-transparent text-2xl font-mono text-center focus:outline-none"
                        placeholder="00"
                      />
                      <span className="text-[10px] uppercase tracking-widest opacity-40 dark:opacity-20 block">Sec</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[15, 30, 60, 300].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => adjustTime(amount)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--surface-color)] hover:bg-[var(--surface-color)]/20 border border-[var(--border-color)] text-[10px] font-bold uppercase tracking-widest opacity-60 dark:opacity-40 hover:opacity-100 transition-all"
                    >
                      +{amount < 60 ? `${amount}s` : `${amount / 60}m`}
                    </button>
                  ))}
                  <button
                    onClick={() => { setMinutes(0); setSeconds(0); }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest text-red-500 transition-all ml-auto"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 dark:opacity-40">
                      <Palette className="w-3 h-3" /> Visual Style
                    </label>
                    <button
                      onClick={() => setActiveModal('art')}
                      className="text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View Guide
                    </button>
                  </div>
                  <select
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    className="input-field appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    {ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 dark:opacity-30">Lighting</label>
                      <button
                        onClick={() => setActiveModal('lighting')}
                        className="text-[8px] font-bold uppercase tracking-widest text-brand-primary dark:text-purple-400 hover:opacity-80 transition-colors"
                      >
                        Guide
                      </button>
                    </div>
                    <select
                      value={lightingStyle}
                      onChange={(e) => setLightingStyle(e.target.value)}
                      className="input-field text-sm"
                      disabled={isLoading}
                    >
                      {LIGHTING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 dark:opacity-30">Palette</label>
                      <button
                        onClick={() => setActiveModal('palette')}
                        className="text-[8px] font-bold uppercase tracking-widest text-brand-primary dark:text-purple-400 hover:opacity-80 transition-colors"
                      >
                        Guide
                      </button>
                    </div>
                    <select
                      value={colorPalette}
                      onChange={(e) => setColorPalette(e.target.value)}
                      className="input-field text-sm"
                      disabled={isLoading}
                    >
                      {COLOR_PALETTES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateClick}
                disabled={isLoading || !narrative.trim() || (minutes === 0 && seconds === 0)}
                className="btn-primary w-full flex items-center justify-center gap-3 group shadow-lg"
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current group-hover:animate-bounce" />
                    <span>Ignite Sequence</span>
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3"
                >
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Output Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7"
          >
            {prompts.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest opacity-60 dark:opacity-40">Generated Sequence</h2>
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary hover:text-brand-secondary transition-colors"
                  >
                    {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedAll ? 'Copied' : 'Copy All'}
                  </button>
                </div>
                <PromptTable prompts={prompts} />
              </div>
            ) : (
              <div className="h-full min-h-[400px] glass flex flex-col items-center justify-center text-center p-12 border-dashed border-[var(--border-color)]">
                <div className="w-16 h-16 rounded-full bg-[var(--surface-color)] flex items-center justify-center mb-6">
                  <Wand2 className="w-8 h-8 opacity-10" />
                </div>
                <h3 className="text-xl font-medium opacity-40 mb-2 font-serif italic">
                  Awaiting your vision
                </h3>
                <p className="text-sm opacity-20 max-w-xs">
                  Enter your narrative on the left to generate a cinematic sequence.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <footer className="mt-24 pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 dark:opacity-20">
          <p>© 2026 Director's Cut AI</p>
          <div className="flex items-center gap-6">
            <span>Powered by {provider === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'}</span>
            <span className="w-1 h-1 bg-current opacity-20 rounded-full" />
            <span>{model}</span>
          </div>
        </footer>
      </div>

      <StyleReferenceModal
        isOpen={activeModal === 'art'}
        onClose={() => setActiveModal(null)}
        title="Art Styles"
        references={ART_STYLE_REFS}
        onSelect={setArtStyle}
        currentValue={artStyle}
      />

      <StyleReferenceModal
        isOpen={activeModal === 'lighting'}
        onClose={() => setActiveModal(null)}
        title="Lighting Styles"
        references={LIGHTING_STYLE_REFS}
        onSelect={setLightingStyle}
        currentValue={lightingStyle}
      />

      <StyleReferenceModal
        isOpen={activeModal === 'palette'}
        onClose={() => setActiveModal(null)}
        title="Color Palettes"
        references={COLOR_PALETTE_REFS}
        onSelect={setColorPalette}
        currentValue={colorPalette}
      />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKeys}
        savedKeys={userApiKeys}
        currentProvider={provider}
        currentModel={model}
        onRemove={handleRemoveApiKey}
      />
    </div>
  );
}
