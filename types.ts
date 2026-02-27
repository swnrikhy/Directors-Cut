
export interface VideoPrompt {
  narasi: string;
  prompt: string;
  duration: number; // Duration of the scene in seconds
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
