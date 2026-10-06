import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-bounce transition-all">
      <div className="flex items-center gap-2.5 bg-amber-950/95 border border-amber-600/80 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-semibold">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <div>
          <span className="font-bold text-white block">Mode Hors-Ligne Suisse Actif</span>
          <span className="text-[11px] text-amber-300/90 font-normal">
            Consultation des offres, dossiers et fiches d'entretien préservée (ex: trajets CFF).
          </span>
        </div>
      </div>
    </div>
  );
};
