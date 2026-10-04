import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  Search,
  HelpCircle,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Play,
  ArrowRight,
  X,
  MapPin,
  Briefcase
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartUploadCV: () => void;
  onWatchVideoDemo: () => void;
  onExploreDashboard: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartUploadCV,
  onWatchVideoDemo,
  onExploreDashboard
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('lausanne_job_matcher_welcome_dismissed', 'true');
    }
    onClose();
  };

  const handleUploadCV = () => {
    if (dontShowAgain) {
      localStorage.setItem('lausanne_job_matcher_welcome_dismissed', 'true');
    }
    onClose();
    onStartUploadCV();
  };

  const handleVideoDemo = () => {
    if (dontShowAgain) {
      localStorage.setItem('lausanne_job_matcher_welcome_dismissed', 'true');
    }
    onClose();
    onWatchVideoDemo();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-red-800/40 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-600/30 border border-red-500/40 text-red-200 text-xs px-3 py-1 rounded-full font-semibold">
              <span>🇨🇭</span>
              <span>Bienvenue sur Job Matcher Lausanne</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Trouvez votre prochain emploi avec un Matching 100%
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Votre assistant expert dédié au marché de l'emploi en Suisse romande (Lausanne et 20-30 km). Quel que soit votre métier, bénéficiez d'un filtrage strict auprès d'employeurs directs, sans intermédiaire ni compromis, pour trouver le poste parfaitement calibré à 100% avec votre profil.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm">
          {/* Key Value Proposition Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Employeurs Directs</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Entreprises finales uniquement (EPFL, BCV, Nestlé...). Les cabinets de placement sont automatiquement écartés.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Rayon Lausanne</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Périmètre strict de 20 à 30 km pour garantir un temps de trajet maîtrisé sans mobilité excessive.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zéro Hallucination</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Vos compétences réelles sont la seule source de vérité. Aucune compétence n'est inventée pour forcer un matching.
              </p>
            </div>
          </div>

          {/* 4 Main Features */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-500">
              Fonctionnalités Clés à Votre Disposition
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    1. Import de votre propre CV (PDF / Word)
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Téléversez votre CV. L'IA en extrait automatiquement votre profil, vos méthodes, outils et diplômes pour calibrer le matching.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    2. Analyse d'Offres & Contrôle 100%
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Collez une annonce pour vérifier en temps réel le taux d'adéquation, le type de contrat (CDI/CDD) et la conformité nLPD suisse.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    3. Arbitrage Option B & Apprentissage
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Si un outil requis n'est pas explicité sur votre CV, une question ciblée vous est posée. Dès validation, elle est mémorisée à vie.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">
                    4. Dossiers Sur-Mesure & Rapport 8h00
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Générez un CV réordonné, une lettre sobre suisse et transmettez votre rapport matinal d'un clic via WhatsApp ou Email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Where to start - Recommended first step */}
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Par où commencer ? Étape 1 recommandée</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Pour que le système évalue vos chances à 100% et personnalise vos lettres de motivation, <strong>importez votre CV au format PDF ou Word</strong>. Cela ne prend que 15 secondes et configure l'ensemble de l'outil à votre image.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span>Ne plus afficher ce message au démarrage</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleVideoDemo}
              className="px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>Voir la démo (2 min)</span>
            </button>

            <button
              onClick={handleUploadCV}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importer mon CV (PDF / Word)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
