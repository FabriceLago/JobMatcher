import React from 'react';
import {
  Gift,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  X,
  ArrowRight,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import { UserAccount, calculateTrialDaysRemaining } from '../types/auth';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onExtendTrial: () => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onExtendTrial
}) => {
  if (!isOpen) return null;

  const trialInfo = calculateTrialDaysRemaining(currentUser.trialExpiresAt);
  const formattedExpiry = new Date(currentUser.trialExpiresAt).toLocaleDateString('fr-CH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden text-white my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-red-800/40 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-red-600/30 border border-red-500/40 text-red-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              <Gift className="w-3.5 h-3.5" />
              <span>Votre Période d'Essai Gratuit</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              7 Jours d'Accès Illimité Offerts
            </h3>
            <p className="text-xs text-slate-300">
              Profitez sans restriction de l'ensemble du moteur de matching 100% sur Lausanne.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs sm:text-sm">
          {/* Countdown Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                {trialInfo.formattedText}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Votre essai gratuit prendra fin le : <strong className="text-slate-200">{formattedExpiry}</strong>
              </p>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.max(10, Math.min(100, (trialInfo.days / 7) * 100))}%` }}
              ></div>
            </div>
          </div>

          {/* Included Features */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Inclus pendant vos 7 jours :
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Analyses illimitées 20-30 km</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Import de CV (PDF ou Word)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Arbitrage Option B interactif</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Rapports 8h00 WhatsApp / Mail</span>
              </div>
            </div>
          </div>

          {/* Extend trial simulator for evaluation */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Besoin de plus de temps pour évaluer ?</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Prolongez votre période d'essai de 7 jours supplémentaires en 1 clic.
              </p>
            </div>
            <button
              onClick={onExtendTrial}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-2 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>+7 Jours</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Compte : {currentUser.email}</span>
          </div>

          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Continuer à utiliser l'application
          </button>
        </div>
      </div>
    </div>
  );
};
