import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Send,
  ShieldAlert,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  PlusCircle,
  X,
  ArrowUpDown,
  Upload,
  FileText,
  Play
} from 'lucide-react';
import { JobOffer, JobStatus, UserProfile } from '../types';
import { UserAccount } from '../types/auth';
import { JobCard } from './JobCard';

interface DashboardViewProps {
  jobs: JobOffer[];
  userProfile: UserProfile;
  currentUser?: UserAccount;
  onOpenNewOffer: () => void;
  onOpenUploadCV?: () => void;
  onOpenVideoGuide?: () => void;
  onOpenWelcome?: () => void;
  onOpenTrialModal?: () => void;
  onOpenDossier: (job: JobOffer) => void;
  onOpenOptionB: (job: JobOffer) => void;
  onUpdateStatus: (jobId: string, newStatus: JobStatus) => void;
  onDeleteJob: (jobId: string) => void;
  onResetDemoData: () => void;
  onCopyNotice?: (text: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  userProfile,
  currentUser,
  onOpenNewOffer,
  onOpenUploadCV,
  onOpenVideoGuide,
  onOpenWelcome,
  onOpenTrialModal,
  onOpenDossier,
  onOpenOptionB,
  onUpdateStatus,
  onDeleteJob,
  onResetDemoData,
  onCopyNotice
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ready' | 'optionB' | 'applied' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'date' | 'company'>('match');

  // Counters
  const countReady = jobs.filter(j => j.status === 'ready_to_send').length;
  const countOptionB = jobs.filter(j => j.status === 'waiting_info').length;
  const countApplied = jobs.filter(j => j.status === 'applied').length;
  const countRejected = jobs.filter(j => j.status === 'rejected' || j.isEliminated).length;

  // Filtered jobs
  const filteredJobs = jobs
    .filter(job => {
      // Status filter
      if (selectedFilter === 'ready' && job.status !== 'ready_to_send') return false;
      if (selectedFilter === 'optionB' && job.status !== 'waiting_info') return false;
      if (selectedFilter === 'applied' && job.status !== 'applied') return false;
      if (selectedFilter === 'rejected' && (!job.isEliminated && job.status !== 'rejected')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCompany = job.company.toLowerCase().includes(q);
        const matchLocation = job.location.toLowerCase().includes(q);
        const matchWhy = job.theWhy?.toLowerCase().includes(q);
        return matchTitle || matchCompany || matchLocation || matchWhy;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match') {
        return b.matchScore - a.matchScore;
      }
      if (sortBy === 'date') {
        const dateA = new Date(a.publicationDate || a.createdAt).getTime();
        const dateB = new Date(b.publicationDate || b.createdAt).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });

  const handleResetFilters = () => {
    setSelectedFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Onboarding Callout if no CV uploaded yet */}
      {!userProfile.hasCvUploaded && (
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 rounded-2xl p-6 border border-red-600/60 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Étape 1 : Votre Profil Candidat</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight">
              Importez votre CV en format PDF ou Word
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Téléversez votre propre curriculum vitae. L'intelligence artificielle en extrait automatiquement toutes vos compétences, diplômes et expériences pour personnaliser le matching à 100% et rédiger vos dossiers de candidature.
            </p>
          </div>
          {onOpenUploadCV && (
            <button
              onClick={onOpenUploadCV}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0 self-start md:self-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Importer mon CV (PDF / Word)</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner: Presentation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/80 shadow-md text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-red-600/30 border border-red-500/40 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-semibold mb-1">
              <span>🇨🇭</span>
              <span>Job Matcher</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Tableau de Bord & Pipeline de Candidatures
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Filtrage strict à 100% {userProfile.hasCvUploaded && userProfile.jobTitle ? <span>pour <strong className="text-white">{userProfile.jobTitle}</strong></span> : 'adapté à votre profil'}. Entreprises finales directes, rayon de 20-30km autour de Lausanne, dédoublonnage automatique et apprentissage continu.
            </p>
            {userProfile.hasCvUploaded && (
              <div className="pt-1 flex items-center gap-2 text-xs text-emerald-400">
                <FileText className="w-3.5 h-3.5" />
                <span>CV actif : <strong>{userProfile.cvFileName}</strong></span>
                {onOpenUploadCV && (
                  <button
                    onClick={onOpenUploadCV}
                    className="text-[11px] text-slate-300 hover:text-white underline ml-1 cursor-pointer"
                  >
                    Remplacer
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenWelcome && (
              <button
                onClick={onOpenWelcome}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Consulter le guide de bienvenue et explications"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Guide de Bienvenue</span>
              </button>
            )}
            {onOpenVideoGuide && (
              <button
                onClick={onOpenVideoGuide}
                className="bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-700/60 text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Regarder la vidéo démo explicative du fonctionnement"
              >
                <Play className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                <span>Vidéo Démo (2 min)</span>
              </button>
            )}
            <button
              onClick={onOpenNewOffer}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Analyser une offre</span>
            </button>
            <button
              onClick={onResetDemoData}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Recharger les exemples de référence (EPFL, Vaudoise, Nestlé, Swissquote...)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Exemples</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Free Trial Notice Bar */}
      {currentUser && (
        <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-800/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              🎁 <strong>Essai gratuit actif (7 jours offerts) :</strong> Accès illimité à l'analyseur d'offres, aux dossiers suisses et au rapport matinal.
            </span>
          </div>
          {onOpenTrialModal && (
            <button
              onClick={onOpenTrialModal}
              className="text-[11px] font-bold text-red-300 hover:text-white underline cursor-pointer"
            >
              Détails de mon essai gratuit →
            </button>
          )}
        </div>
      )}

      {/* KPI Stats Cards - Clickable to filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setSelectedFilter(selectedFilter === 'ready' ? 'all' : 'ready')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedFilter === 'ready'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">100% Matchs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400">{countReady}</div>
          <p className="text-[11px] text-slate-500 mt-1">Prêts à l'envoi immédiat</p>
        </div>

        <div
          onClick={() => setSelectedFilter(selectedFilter === 'optionB' ? 'all' : 'optionB')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedFilter === 'optionB'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Option B</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-amber-700 dark:text-amber-400">{countOptionB}</div>
          <p className="text-[11px] text-slate-500 mt-1">Arbitrage en attente (&gt;85%)</p>
        </div>

        <div
          onClick={() => setSelectedFilter(selectedFilter === 'applied' ? 'all' : 'applied')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedFilter === 'applied'
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Postulés</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-blue-700 dark:text-blue-400">{countApplied}</div>
          <p className="text-[11px] text-slate-500 mt-1">Dossiers transmis</p>
        </div>

        <div
          onClick={() => setSelectedFilter(selectedFilter === 'rejected' ? 'all' : 'rejected')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedFilter === 'rejected'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/30'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Éliminés</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-rose-700 dark:text-rose-400">{countRejected}</div>
          <p className="text-[11px] text-slate-500 mt-1">Cabinets, hors-zone, juridique</p>
        </div>
      </div>

      {/* Filter Bar, Sort & Search */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Toutes ({jobs.length})
          </button>
          <button
            onClick={() => setSelectedFilter('ready')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'ready'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            100% Prêts ({countReady})
          </button>
          <button
            onClick={() => setSelectedFilter('optionB')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'optionB'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Option B ({countOptionB})
          </button>
          <button
            onClick={() => setSelectedFilter('applied')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'applied'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Postulés ({countApplied})
          </button>
          <button
            onClick={() => setSelectedFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedFilter === 'rejected'
                ? 'bg-rose-700 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Éliminés ({countRejected})
          </button>
        </div>

        {/* Right: Sort and Search */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
            >
              <option value="match">Trier par score</option>
              <option value="date">Plus récentes</option>
              <option value="company">Entreprise (A-Z)</option>
            </select>
          </div>

          {/* Search bar with clear button */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher titre, entreprise..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Aucune opportunité ne correspond à ces critères
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedFilter !== 'all'
              ? 'Essayez de réinitialiser vos filtres ou d’ajuster votre recherche.'
              : 'Commencez par analyser une offre d’emploi pour enrichir votre tableau de bord.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {(searchQuery || selectedFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
            <button
              onClick={onOpenNewOffer}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Analyser une annonce</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onOpenDossier={onOpenDossier}
              onOpenOptionB={onOpenOptionB}
              onUpdateStatus={onUpdateStatus}
              onDeleteJob={onDeleteJob}
              onCopyNotice={onCopyNotice}
            />
          ))}
        </div>
      )}
    </div>
  );
};
