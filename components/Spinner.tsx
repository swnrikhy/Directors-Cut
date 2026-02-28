
import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="w-1 h-1 bg-black rounded-full animate-bounce" />
  </div>
);
