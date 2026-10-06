import React, { useState } from 'react';
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
  LogOut,
  FolderArchive,
  Menu,
  X,
  Radar,
  Award,
  FileCheck2
} from 'lucide-react';
import { JobOffer, UserProfile } from '../types';
import { UserAccount, calculateTrialDaysRemaining } from '../types/auth';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  activeTab: 'dashboard' | 'analyzer' | 'radar' | 'optionB' | 'dossier' | 'report' | 'profile' | 'coaching' | 'orp';
  setActiveTab: (tab: 'dashboard' | 'analyzer' | 'radar' | 'optionB' | 'dossier' | 'report' | 'profile' | 'coaching' | 'orp') => void;
  jobs: JobOffer[];
  userProfile: UserProfile;
  currentUser: UserAccount;
  onOpenNewOffer: () => void;
  onOpenUploadCV: () => void;
  onOpenVideoGuide: () => void;
  onOpenWelcome: () => void;
  onOpenTrialModal: () => void;
  onOpenExportProject: () => void;
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
  onOpenExportProject,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const readyCount = jobs.filter(j => j.status === 'ready_to_send').length;
  const waitingOptionBCount = jobs.filter(j => j.status === 'waiting_info').length;
  const learnedCount = userProfile.learnedSkills.length;
  const trialInfo = calculateTrialDaysRemaining(currentUser.trialExpiresAt);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-lg">
      {/* Top Banner: Swiss Context & Profile Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between border-b border-slate-800/80 text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-600 font-bold text-white text-[11px] shadow-sm">
            🇨🇭
          </span>
          <span className="font-semibold text-slate-100">Lausanne & Vaud (20-30km)</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-emerald-400 hidden sm:flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Entreprises directes
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-amber-300 hidden md:inline">Salaire : Option C (À discuter)</span>
          <span className="text-slate-600 hidden lg:inline">•</span>
          <div className="hidden lg:flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cloud Multi-tenant (Firebase)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* In-App PWA Install Button */}
          <PWAInstallButton />

          {/* Export Windows Coursera Button */}
          <button
            onClick={onOpenExportProject}
            className="flex items-center gap-1 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/80 px-2.5 py-1 rounded-full cursor-pointer transition-colors shadow-sm font-semibold text-[11px]"
            title="Exporter l'application complète dans C:\Users\fabri\Desktop\Coursera\SaaS_Coursea"
          >
            <FolderArchive className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Exporter (Windows)</span>
            <span className="sm:hidden">Exporter</span>
          </button>

          {userProfile.hasCvUploaded ? (
            <button
              onClick={onOpenUploadCV}
              className="flex items-center gap-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-800/60 cursor-pointer transition-colors text-left"
              title="Cliquer pour remplacer ou mettre à jour votre CV"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium max-w-[120px] truncate">{userProfile.cvFileName || 'CV Chargé'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Actif</span>
            </button>
          ) : (
            <button
              onClick={onOpenUploadCV}
              className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 px-2.5 py-1 rounded-full border border-red-700/80 cursor-pointer transition-colors animate-pulse"
              title="Téléverser votre CV en format PDF ou Word"
            >
              <Upload className="w-3.5 h-3.5 text-red-400" />
              <span className="font-bold text-[11px]">Importer CV</span>
            </button>
          )}

          {/* 7-Day Free Trial & Swiss Billing Badge */}
          <button
            onClick={onOpenTrialModal}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border cursor-pointer transition-colors shadow-sm ${
              currentUser.subscriptionPlan === 'pro_lausanne'
                ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border-amber-700/80'
                : currentUser.subscriptionPlan === 'standard_lausanne'
                ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border-emerald-700/80'
                : 'bg-red-950/80 hover:bg-red-900 text-red-200 border-red-700/80'
            }`}
            title="Gérer mon abonnement en CHF ou consulter ma période d'essai"
          >
            {currentUser.subscriptionPlan === 'pro_lausanne' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-[11px]">Abonné Pro (CHF 69.-)</span>
              </>
            ) : currentUser.subscriptionPlan === 'standard_lausanne' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-[11px]">Abonné Standard (CHF 39.-)</span>
              </>
            ) : (
              <>
                <Gift className="w-3.5 h-3.5 text-red-400" />
                <span className="font-bold text-[11px]">Essai : {trialInfo.formattedText}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-full border border-slate-700 cursor-pointer transition-colors text-left"
            title="Consulter et modifier mon profil"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-200 font-medium max-w-[120px] truncate">{userProfile.fullName || currentUser.fullName || 'Mon Profil'}</span>
          </button>

          {/* System MatchMedia Theme Toggle */}
          <ThemeToggle />

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-800 px-2 py-1 rounded-full cursor-pointer transition-colors"
            title={`Se déconnecter (${currentUser.email})`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-950/40">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                Job Matcher
              </h1>
              <span className="text-[10px] font-bold bg-red-600/30 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded hidden sm:inline">
                Suisse
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Lausanne & Romandie • Matching 100%
            </p>
          </div>
        </div>

        {/* Tab Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-red-400" />
            <span>Radar d'Offres</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveTab('optionB')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'report'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Rapport 8h00</span>
          </button>

          <button
            onClick={() => setActiveTab('coaching')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'coaching'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Entretiens & KPI</span>
          </button>

          <button
            onClick={() => setActiveTab('orp')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orp'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Journal ORP</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
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
            onClick={onOpenNewOffer}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline">+ Analyser une Offre</span>
            <span className="sm:hidden">+ Offre</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Menu de navigation mobile"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Responsive Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg font-medium flex items-center justify-between cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-red-600 text-white font-bold' : 'bg-slate-900 text-slate-300'
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
              onClick={() => {
                setActiveTab('radar');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg font-medium flex items-center justify-between cursor-pointer ${
                activeTab === 'radar' ? 'bg-red-600 text-white font-bold' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-red-400" />
                <span>Radar d'Offres Suisses</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            <button
              onClick={() => {
                setActiveTab('optionB');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg font-medium flex items-center justify-between cursor-pointer ${
                activeTab === 'optionB' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <span>Option B</span>
              {waitingOptionBCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {waitingOptionBCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('report');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'report' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Rapport 8h00</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('coaching');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'coaching' ? 'bg-red-600 text-white font-bold' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Entretiens & KPI</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('orp');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'orp' ? 'bg-red-600 text-white font-bold' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Journal ORP</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>CV Maître</span>
            </button>
          </nav>

          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenExportProject();
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-lg bg-red-950/80 text-red-200 border border-red-700/80 flex items-center justify-between text-xs font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-red-400" />
                <span>Exporter vers dossier Windows Coursea</span>
              </span>
              <span className="text-[10px] bg-red-800/60 px-2 py-0.5 rounded">ZIP</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  onOpenVideoGuide();
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-red-400" />
                <span>Vidéo Démo</span>
              </button>

              <button
                onClick={() => {
                  onOpenWelcome();
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
