
import React, { useState, useCallback } from 'react';
import { generateVideoPrompts } from './services/geminiService';
import type { VideoPrompt } from './types';
import { PromptTable } from './components/PromptTable';
import { Spinner } from './components/Spinner';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Clock, Palette, Zap, Wand2, Copy, Check, Info, Settings, Key } from 'lucide-react';

const ART_STYLES = [
  '3D Pixar', 'Anime', 'Cartoon', 'Cinematic', 'Cyberpunk', 
  'Fantasy Art', 'Impressionistic', 'Oil Painting', 'Realistic', 
  'Sci-Fi', 'Watercolor',
];

const LIGHTING_STYLES = [
  'Backlight', 'Dramatic Lighting', 'High-Key Lighting', 'Low-Key Lighting',
  'Natural Light', 'Neon Glow', 'Soft Lighting', 'Volumetric Lighting',
];

const COLOR_PALETTES = [
  'Black and White', 'Cool Tones', 'Monochromatic', 'Muted Tones',
  'Pastel Colors', 'Sepia', 'Vibrant Colors', 'Warm Tones',
];

const App: React.FC = () => {
  const [narrative, setNarrative] = useState<string>('');
  const [mins, setMins] = useState<number>(0);
  const [secs, setSecs] = useState<number>(0);
  const [artStyle, setArtStyle] = useState<string>('Cinematic');
  const [lightingStyle, setLightingStyle] = useState<string>('Natural Light');
  const [colorPalette, setColorPalette] = useState<string>('Vibrant Colors');
  const [prompts, setPrompts] = useState<VideoPrompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [showStyleGuide, setShowStyleGuide] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
  const [activeGuideTab, setActiveGuideTab] = useState<'style' | 'lighting' | 'palette'>('style');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const styleReferences = [
    { name: '3D Pixar', desc: 'High-quality 3D animation, expressive characters, vibrant lighting.', seed: 'pixar-3d-character' },
    { name: 'Anime', desc: 'Japanese animation style, vibrant colors, expressive characters.', seed: 'anime-manga-art' },
    { name: 'Cartoon', desc: 'Bold outlines, flat colors, playful and exaggerated.', seed: 'cartoon-illustration' },
    { name: 'Cinematic', desc: 'High contrast, dramatic lighting, 35mm film look.', seed: 'cinematic-film-still' },
    { name: 'Cyberpunk', desc: 'Neon lights, dark rainy streets, high-tech low-life.', seed: 'cyberpunk-city-neon' },
    { name: 'Fantasy Art', desc: 'Epic scales, magical elements, mythical creatures.', seed: 'fantasy-landscape-dragon' },
    { name: 'Impressionistic', desc: 'Emphasis on light and movement, short dabs of color.', seed: 'impressionist-painting-monet' },
    { name: 'Oil Painting', desc: 'Thick brushstrokes, rich textures, classical feel.', seed: 'oil-painting-canvas' },
    { name: 'Realistic', desc: 'Lifelike details, natural lighting, photographic quality.', seed: 'realistic-portrait-photo' },
    { name: 'Sci-Fi', desc: 'Futuristic technology, space exploration, sleek designs.', seed: 'sci-fi-spaceship-future' },
    { name: 'Watercolor', desc: 'Soft edges, fluid colors, paper texture.', seed: 'watercolor-painting-soft' },
  ];

  const lightingReferences = [
    { name: 'Backlight', desc: 'Light from behind, creates silhouettes and rim light.', seed: 'backlight-silhouette-sunset' },
    { name: 'Dramatic Lighting', desc: 'High contrast, deep shadows, moody and intense.', seed: 'dramatic-noir-lighting' },
    { name: 'High-Key Lighting', desc: 'Bright, minimal shadows, optimistic and clean.', seed: 'high-key-studio-bright' },
    { name: 'Low-Key Lighting', desc: 'Dark, heavy shadows, mysterious and suspenseful.', seed: 'low-key-moody-dark' },
    { name: 'Natural Light', desc: 'Sunlight, soft shadows, realistic and organic.', seed: 'natural-window-sunlight' },
    { name: 'Neon Glow', desc: 'Vibrant artificial lights, futuristic and urban.', seed: 'neon-lights-night' },
    { name: 'Soft Lighting', desc: 'Even illumination, gentle shadows, flattering and calm.', seed: 'soft-diffused-lighting' },
    { name: 'Volumetric Lighting', desc: 'Visible light beams, atmospheric and ethereal.', seed: 'volumetric-light-rays' },
  ];

  const paletteReferences = [
    { name: 'Black and White', desc: 'Grayscale, timeless and dramatic.', seed: 'black-white-photography' },
    { name: 'Cool Tones', desc: 'Blues, greens, purples, calm and professional.', seed: 'cool-blue-tones' },
    { name: 'Monochromatic', seed: 'monochrome-blue-art', desc: 'Varying shades of a single color, focused and artistic.' },
    { name: 'Muted Tones', desc: 'Desaturated, subtle and sophisticated.', seed: 'muted-earth-tones' },
    { name: 'Pastel Colors', desc: 'Soft, light colors, gentle and dreamy.', seed: 'pastel-color-palette' },
    { name: 'Sepia', desc: 'Reddish-brown tones, nostalgic and vintage.', seed: 'sepia-vintage-photo' },
    { name: 'Vibrant Colors', desc: 'Highly saturated, energetic and bold.', seed: 'vibrant-saturated-colors' },
    { name: 'Warm Tones', desc: 'Reds, oranges, yellows, cozy and inviting.', seed: 'warm-sunset-colors' },
  ];

  const filteredStyles = styleReferences.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLighting = lightingReferences.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPalettes = paletteReferences.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleMinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setMins(Math.max(0, Math.min(99, val)));
  };

  const handleSecsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setSecs(Math.max(0, Math.min(59, val)));
  };

  const handleGenerateClick = useCallback(async () => {
    if (!narrative.trim()) {
      setError('Please enter a narrative.');
      return;
    }

    const totalDuration = mins * 60 + secs;

    if (totalDuration <= 0) {
      setError('Total duration must be greater than 0.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrompts([]);

    try {
      const generatedPrompts = await generateVideoPrompts(narrative, totalDuration, 5, artStyle, lightingStyle, colorPalette, apiKey);
      setPrompts(generatedPrompts);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate prompts: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [narrative, mins, secs, artStyle, lightingStyle, colorPalette, apiKey]);

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', tempApiKey);
    setApiKey(tempApiKey);
    setShowSettings(false);
  };

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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/60">AI-Powered Cinematic Tool</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-7xl font-bold tracking-tighter text-gradient mb-6"
          >
            Director's Cut
          </motion.h1>

          <div className="absolute top-8 right-8">
            <button 
              onClick={() => { setTempApiKey(apiKey); setShowSettings(true); }}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/40 max-w-2xl mx-auto font-serif italic"
          >
            Transform your narrative vision into precise, production-ready video prompts for generative AI models.
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
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <Wand2 className="w-3 h-3" /> The Narrative
                </label>
                <textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Describe your story or sequence here..."
                  className="input-field h-64 resize-none font-typewriter text-lg leading-relaxed tracking-wide"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <Clock className="w-3 h-3" /> Total Duration (MM:SS)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={mins}
                      onChange={handleMinsChange}
                      placeholder="00"
                      className="input-field font-mono text-center text-xl"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="text-xl font-bold text-white/20 pt-6">:</div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-1">Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={secs}
                      onChange={handleSecsChange}
                      placeholder="00"
                      className="input-field font-mono text-center text-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                      <Palette className="w-3 h-3" /> Visual Style
                    </label>
                    <button 
                      onClick={() => setShowStyleGuide(true)}
                      className="text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      <Info className="w-3 h-3" /> Style Guide
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
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Lighting</label>
                      <button 
                        onClick={() => { setActiveGuideTab('lighting'); setShowStyleGuide(true); }}
                        className="text-[8px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
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
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Palette</label>
                      <button 
                        onClick={() => { setActiveGuideTab('palette'); setShowStyleGuide(true); }}
                        className="text-[8px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
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
                disabled={isLoading || !narrative.trim() || (mins === 0 && secs === 0)}
                className="btn-primary w-full flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current group-hover:animate-bounce" />
                    <span>Generate Sequence</span>
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
                  <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Generated Sequence</h2>
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
              <div className="h-full min-h-[400px] glass flex flex-col items-center justify-center text-center p-12 border-dashed border-white/5">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Wand2 className="w-8 h-8 text-white/10" />
                </div>
                <h3 className="text-xl font-medium text-white/20 mb-2 font-serif italic">Awaiting your vision</h3>
                <p className="text-sm text-white/10 max-w-xs">Enter your narrative on the left to generate a cinematic sequence of prompts.</p>
              </div>
            )}
          </motion.div>
        </div>

        <footer className="mt-24 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
          <p>© 2026 Director's Cut AI</p>
          <div className="flex items-center gap-6">
            <span>Powered by Gemini 3.1 Pro</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Optimized for Video Gen</span>
          </div>
        </footer>
      </div>

      {/* Style Guide Modal */}
      <AnimatePresence>
        {showStyleGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStyleGuide(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden glass flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap">
                    <Palette className="w-5 h-5 text-purple-400" /> Reference Guide
                  </h2>
                  <div className="flex items-center bg-white/5 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
                    <button 
                      onClick={() => { setActiveGuideTab('style'); setSearchQuery(''); }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${activeGuideTab === 'style' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      Styles
                    </button>
                    <button 
                      onClick={() => { setActiveGuideTab('lighting'); setSearchQuery(''); }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${activeGuideTab === 'lighting' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      Lighting
                    </button>
                    <button 
                      onClick={() => { setActiveGuideTab('palette'); setSearchQuery(''); }}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${activeGuideTab === 'palette' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      Palettes
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search A-Z..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <button 
                    onClick={() => setShowStyleGuide(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
                  >
                    <Zap className="w-5 h-5 text-white/40 rotate-45" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeGuideTab === 'style' && filteredStyles.map((style) => (
                  <button 
                    key={style.name} 
                    onClick={() => { setArtStyle(style.name); }}
                    className={`flex gap-4 p-4 rounded-xl border transition-all text-left group ${artStyle === style.name ? 'bg-purple-600/20 border-purple-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={`https://picsum.photos/seed/${style.seed}/200/200`} 
                        alt={style.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                      {artStyle === style.name && (
                        <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        {style.name}
                        {artStyle === style.name && <span className="text-[8px] bg-purple-500 text-white px-1.5 py-0.5 rounded uppercase">Active</span>}
                      </h3>
                      <p className="text-xs text-white/40 leading-relaxed">{style.desc}</p>
                    </div>
                  </button>
                ))}
                {activeGuideTab === 'lighting' && filteredLighting.map((light) => (
                  <button 
                    key={light.name} 
                    onClick={() => { setLightingStyle(light.name); }}
                    className={`flex gap-4 p-4 rounded-xl border transition-all text-left group ${lightingStyle === light.name ? 'bg-purple-600/20 border-purple-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={`https://picsum.photos/seed/${light.seed}/200/200`} 
                        alt={light.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                      {lightingStyle === light.name && (
                        <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        {light.name}
                        {lightingStyle === light.name && <span className="text-[8px] bg-purple-500 text-white px-1.5 py-0.5 rounded uppercase">Active</span>}
                      </h3>
                      <p className="text-xs text-white/40 leading-relaxed">{light.desc}</p>
                    </div>
                  </button>
                ))}
                {activeGuideTab === 'palette' && filteredPalettes.map((palette) => (
                  <button 
                    key={palette.name} 
                    onClick={() => { setColorPalette(palette.name); }}
                    className={`flex gap-4 p-4 rounded-xl border transition-all text-left group ${colorPalette === palette.name ? 'bg-purple-600/20 border-purple-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={`https://picsum.photos/seed/${palette.seed}/200/200`} 
                        alt={palette.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                      {colorPalette === palette.name && (
                        <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        {palette.name}
                        {colorPalette === palette.name && <span className="text-[8px] bg-purple-500 text-white px-1.5 py-0.5 rounded uppercase">Active</span>}
                      </h3>
                      <p className="text-xs text-white/40 leading-relaxed">{palette.desc}</p>
                    </div>
                  </button>
                ))}
                
                {((activeGuideTab === 'style' && filteredStyles.length === 0) ||
                  (activeGuideTab === 'lighting' && filteredLighting.length === 0) ||
                  (activeGuideTab === 'palette' && filteredPalettes.length === 0)) && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-white/20 text-sm italic">No matches found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-white/10 bg-white/5 text-center">
                <button 
                  onClick={() => setShowStyleGuide(false)}
                  className="btn-primary px-8 py-2 text-sm"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden glass flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" /> Settings
                </h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <Zap className="w-5 h-5 text-white/40 rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                    <Key className="w-3 h-3" /> Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="input-field font-mono text-sm"
                  />
                  <p className="text-[10px] text-white/20 leading-relaxed italic">
                    Your API key is stored locally in your browser and never sent to our servers. 
                    If left empty, the application will attempt to use the system default key.
                  </p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveApiKey}
                    className="flex-1 btn-primary py-2 text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
