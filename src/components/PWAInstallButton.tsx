import React, { useState } from 'react';
import { Smartphone, Download, Share2, PlusSquare, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed, show small subtle badge or return null
  if (isInstalled) {
    return (
      <div className="hidden xl:flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>PWA Installée</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-full cursor-pointer transition-all shadow-md shadow-red-950/40 text-[11px] font-bold shrink-0 animate-pulse hover:animate-none"
        title="Installer Job Matcher comme application mobile sur votre écran d'accueil"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installer l'App</span>
        <span className="sm:hidden">App</span>
      </button>

      {/* Installation Guide Modal (iOS Safari & Desktop Browsers) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5 text-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  🇨🇭
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Installer Job Matcher</h3>
                  <p className="text-xs text-slate-400">Application PWA Suisse autonome</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              {isIOS ? (
                <>
                  <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-2xl text-red-200 text-[11px]">
                    📱 <strong>Sur iPhone & iPad (Safari) :</strong>
                  </div>
                  <ol className="space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Touchez le bouton <strong>Partager</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> dans la barre de navigation Safari (en bas).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span>
                        Faites défiler la liste vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-300" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span>
                        Touchez <strong>« Ajouter »</strong> en haut à droite. L'icône suisse apparaîtra immédiatement sur votre écran !
                      </span>
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] text-slate-300">
                    💻 <strong>Sur Android / Chrome / Edge :</strong>
                  </div>
                  <p>
                    Cliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur ou touchez le menu ⋮ puis <strong>« Installer l'application »</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    L'application se lance en plein écran avec accès hors-ligne et chargement ultra-rapide.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer border border-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
