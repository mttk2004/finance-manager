'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AccentColorId = 'emerald' | 'sky' | 'violet' | 'rose' | 'orange';

export interface AccentPreset {
  id: AccentColorId;
  label: string;
  hex: string;
  hoverHex: string;
  rgb: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'emerald', label: 'Xanh Mint', hex: '#10b981', hoverHex: '#059669', rgb: '16, 185, 129' },
  { id: 'sky', label: 'Xanh Sapphire', hex: '#0ea5e9', hoverHex: '#0284c7', rgb: '14, 165, 233' },
  { id: 'violet', label: 'Tím Lavender', hex: '#8b5cf6', hoverHex: '#7c3aed', rgb: '139, 92, 246' },
  { id: 'rose', label: 'Hồng Đào', hex: '#f43f5e', hoverHex: '#e11d48', rgb: '244, 63, 94' },
  { id: 'orange', label: 'Cam Amber', hex: '#f97316', hoverHex: '#ea580c', rgb: '249, 115, 22' },
];

interface AccentContextType {
  accent: AccentColorId;
  setAccent: (id: AccentColorId) => void;
}

const AccentContext = createContext<AccentContextType | undefined>(undefined);

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentColorId>('emerald');

  useEffect(() => {
    const saved = localStorage.getItem('app_accent_color') as AccentColorId;
    if (saved && ACCENT_PRESETS.some(p => p.id === saved)) {
      setAccentState(saved);
      applyAccent(saved);
    }
  }, []);

  const applyAccent = (id: AccentColorId) => {
    const preset = ACCENT_PRESETS.find(p => p.id === id);
    if (preset) {
      document.documentElement.style.setProperty('--primary-accent', preset.hex);
      document.documentElement.style.setProperty('--primary-accent-hover', preset.hoverHex);
      document.documentElement.style.setProperty('--primary-accent-rgb', preset.rgb);
    }
  };

  const setAccent = (id: AccentColorId) => {
    setAccentState(id);
    localStorage.setItem('app_accent_color', id);
    applyAccent(id);
  };

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent() {
  const context = useContext(AccentContext);
  if (!context) {
    throw new Error('useAccent must be used within an AccentProvider');
  }
  return context;
}
