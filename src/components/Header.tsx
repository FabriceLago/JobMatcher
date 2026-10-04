import React from 'react';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  ShieldCheck,
  UserCheck,
  Upload,
  FileText,
  Play,
  Gift,
  LogOut
} from 'lucide-react';
import { JobOffer, UserProfile } from '../types';
import { UserAccount, calculateTrialDaysRemaining } from '../types/auth';

interface HeaderProps {
  activeTab: 'dashboard' | 'analyzer' | 'optionB' | 'dossier' | 'report' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'analyzer' | 'optionB' | 'dossier' | 'report' | 'profile') => void;
  jobs: JobOffer[];
  userProfile: UserProfile;
  currentUser: UserAccount;
  onOpenNewOffer: () => void;
  onOpenUploadCV: () => void;
  onOpenVideoGuide: () => void;
  onOpenWelcome: () => void;
  onOpenTrialModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  jobs,
  userProfile,
  currentUser,
  onOpenNewOffer,
  onOpenUploadCV,
  onOpenVideoGuide,
  onOpenWelcome,
  onOpenTrialModal,
  onLogout
}) => {
  const readyCount = jobs.filter(j => j.status === 'ready_to_send').length;
  const waitingOptionBCount = jobs.filter(j => j.status === 'waiting_info').length;
  const appliedCount = jobs.filter(j => j.status === 'applied').length;
  const learnedCount = userProfile.learnedSkills.length;
  const trialInfo = calculateTrialDaysRemaining(currentUser.trialExpiresAt);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-lg">
      {/* Top Banner: Swiss Context & Profile Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-800/80 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-600 font-bold text-white text-[11px] shadow-sm">
            🇨🇭
          </span>
          <span className="font-semibold text-slate-100">Périmètre Vaudois :</span>
          <span>Lausanne & environs (20-30km)</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Entreprises finales uniquement
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-300">Salaire : Option C (À discuter)</span>
        </div>

        <div className="flex items-center gap-3">
          {userProfile.hasCvUploaded ? (
            <button
              onClick={onOpenUploadCV}
              className="flex items-center gap-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-800/60 cursor-pointer transition-colors text-left"
              title="Cliquer pour remplacer ou mettre à jour votre CV"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium max-w-[150px] truncate">{userProfile.cvFileName || 'CV Chargé'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Actif</span>
            </button>
          ) : (
            <button
              onClick={onOpenUploadCV}
              className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 px-2.5 py-1 rounded-full border border-red-700/80 cursor-pointer transition-colors animate-pulse"
              title="Téléverser votre CV en format PDF ou Word"
            >
              <Upload className="w-3.5 h-3.5 text-red-400" />
              <span className="font-bold text-[11px]">Importer mon CV (PDF/Word)</span>
            </button>
          )}

          {/* 7-Day Free Trial Badge */}
          <button
            onClick={onOpenTrialModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-950 to-slate-900 hover:from-red-900 hover:to-slate-800 text-red-200 border border-red-700/80 px-2.5 py-1 rounded-full cursor-pointer transition-colors shadow-sm"
            title="Détails de votre essai gratuit de 7 jours"
          >
            <Gift className="w-3.5 h-3.5 text-red-400" />
            <span className="font-bold text-[11px]">{trialInfo.formattedText}</span>
          </button>

          <button
            onClick={onOpenWelcome}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 cursor-pointer transition-colors text-slate-300 hover:text-white"
            title="Guide de bienvenue & explications de l'application"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-[11px]">Bienvenue</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-full border border-slate-700 cursor-pointer transition-colors text-left"
            title="Consulter et modifier mon profil"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-200 font-medium">{userProfile.fullName || currentUser.fullName || 'Mon Profil'}</span>
            <span className="text-slate-400 text-[10px]">({userProfile.nationalityLabel.split('(')[0].trim()})</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-800 px-2 py-1 rounded-full cursor-pointer transition-colors"
            title={`Se déconnecter (${currentUser.email})`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">Quitter</span>
          </button>
          {learnedCount > 0 && (
            <div
              onClick={() => setActiveTab('optionB')}
              className="cursor-pointer bg-emerald-950/80 text-emerald-300 border border-emerald-800/70 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-emerald-900 transition-colors"
              title="Compétences intégrées dynamiquement via l'Option B"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{learnedCount} apprise{learnedCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-950/40">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Job Matcher
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Système Expert Emploi Suisse • Matching 100% • Apprentissage Continu
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Tableau de bord</span>
            {readyCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {readyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('optionB')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'optionB'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>Option B</span>
            {waitingOptionBCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {waitingOptionBCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Rapport 8h00</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>CV Maître</span>
          </button>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVideoGuide}
            className="bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-700/60 text-xs font-semibold px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Lancer le guide explicatif vidéo interactif"
          >
            <Play className="w-3.5 h-3.5 fill-red-400 text-red-400" />
            <span className="hidden md:inline">Vidéo Démo</span>
            <span className="md:hidden">Démo</span>
          </button>

          <button
            onClick={onOpenUploadCV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Téléverser votre CV en format PDF ou Word"
          >
            <Upload className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">{userProfile.hasCvUploaded ? 'Changer de CV' : 'Importer CV'}</span>
            <span className="sm:hidden">CV</span>
          </button>

          <button
            onClick={onOpenNewOffer}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>+ Analyser une Offre</span>
          </button>
        </div>
      </div>
    </header>
  );
};
