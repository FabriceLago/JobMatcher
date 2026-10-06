import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, systemIsDark, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      mode: 'system',
      label: 'Système (Auto)',
      icon: <Laptop className="w-3.5 h-3.5 text-blue-400" />,
      desc: systemIsDark ? 'Mode sombre détecté' : 'Mode clair détecté'
    },
    {
      mode: 'dark',
      label: 'Sombre',
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
      desc: 'Arrière-plan sombre reposant'
    },
    {
      mode: 'light',
      label: 'Clair',
      icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
      desc: 'Arrière-plan clair standard'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-full border border-slate-700 cursor-pointer transition-all text-xs"
        title={`Thème actif : ${theme === 'system' ? `Système (${resolvedTheme === 'dark' ? 'Sombre' : 'Clair'})` : theme === 'dark' ? 'Sombre' : 'Clair'}`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        )}
        <span className="hidden xl:inline font-medium text-[11px]">
          {theme === 'system' ? 'Auto' : theme === 'dark' ? 'Sombre' : 'Clair'}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-1.5 z-50 text-xs text-white space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
            Préférence de Thème
          </div>

          {options.map(opt => {
            const isSelected = theme === opt.mode;

            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => {
                  setTheme(opt.mode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-red-600/30 border border-red-500/40 text-white font-bold'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <div>
                    <div className="font-semibold text-xs leading-none">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </div>

                {isSelected && <Check className="w-3.5 h-3.5 text-red-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
