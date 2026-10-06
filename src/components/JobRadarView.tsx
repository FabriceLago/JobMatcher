import React, { useState, useEffect } from 'react';
import {
  Radar,
  Search,
  Sparkles,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
  Filter,
  Building,
  Check,
  Zap,
  HelpCircle,
  FileText,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { JobOffer, UserProfile } from '../types';
import { sanitizeUrl } from '../utils/security';

interface JobRadarViewProps {
  userProfile: UserProfile;
  existingJobs: JobOffer[];
  onIngestJob: (job: JobOffer) => void;
  onIngestAndOpenDossier: (job: JobOffer) => void;
}

export const JobRadarView: React.FC<JobRadarViewProps> = ({
  userProfile,
  existingJobs,
  onIngestJob,
  onIngestAndOpenDossier,
}) => {
  const [keywords, setKeywords] = useState(
    userProfile.jobTitle && userProfile.jobTitle !== 'Candidat (en attente de votre CV)'
      ? userProfile.jobTitle
      : 'Chef de Projet'
  );
  const [canton, setCanton] = useState('VD');
  const [radiusKm, setRadiusKm] = useState(25);
  const [activityRate, setActivityRate] = useState('80-100%');
  const [excludeAgencies, setExcludeAgencies] = useState(true);
  const [onlyDirectEmployers, setOnlyDirectEmployers] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredJobs, setDiscoveredJobs] = useState<JobOffer[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [ingestedJobIds, setIngestedJobIds] = useState<Set<string>>(() => {
    return new Set(existingJobs.map(j => j.url || j.id));
  });
  const [selectedJobPreview, setSelectedJobPreview] = useState<JobOffer | null>(null);

  // Sync existing jobs to prevent duplicates
  useEffect(() => {
    setIngestedJobIds(new Set(existingJobs.map(j => j.url || j.id)));
  }, [existingJobs]);

  const handleScan = async () => {
    setIsScanning(true);
    setHasScanned(true);

    try {
      const response = await fetch('/api/discover-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          canton,
          radiusKm,
          activityRate,
          excludeAgencies,
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du scan du radar');
      }

      const data = await response.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        setDiscoveredJobs(data.jobs);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Run initial scan on mount
  useEffect(() => {
    handleScan();
  }, []);

  const handleSingleIngest = (job: JobOffer) => {
    onIngestJob(job);
    setIngestedJobIds(prev => new Set([...prev, job.url || job.id, job.id]));
  };

  const handleIngestAndDossier = (job: JobOffer) => {
    onIngestAndOpenDossier(job);
    setIngestedJobIds(prev => new Set([...prev, job.url || job.id, job.id]));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-700/60 text-red-300 text-xs px-3 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>Étape 3 : Scraping & Ingestion Automatisée Suisse</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Radar className="w-7 h-7 text-red-500 shrink-0" />
              <span>Radar d'Offres Directes (Romandie)</span>
            </h1>
            <p className="text-sm text-slate-300">
              Détectez en temps réel les opportunités publiées sur <strong>Jobup.ch, Indeed.ch, LinkedIn Jobs Suisse</strong> et les portails carrières vaudois, avec exclusion stricte et automatisée des agences intermédiaires.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2.5 transition-all cursor-pointer text-sm"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Scan des portails en cours...</span>
                </>
              ) : (
                <>
                  <Radar className="w-4 h-4" />
                  <span>Scanner le marché vaudois</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Filter Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-red-400" />
              <span>Intitulé du poste / Mots-clés</span>
            </label>
            <input
              type="text"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="Ex: Chef de projet IT, Responsable Comptable..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="lg:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Canton & Périmètre</span>
            </label>
            <select
              value={canton}
              onChange={e => setCanton(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="VD">Canton de Vaud (Lausanne & 20-30km)</option>
              <option value="GE">Canton de Genève (Genève & environs)</option>
              <option value="FR">Canton de Fribourg</option>
              <option value="NE">Canton de Neuchâtel</option>
              <option value="VS">Canton du Valais</option>
            </select>
          </div>

          <div className="lg:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Taux d'activité</span>
            </label>
            <select
              value={activityRate}
              onChange={e => setActivityRate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="80-100%">80% - 100%</option>
              <option value="100%">100% uniquement</option>
              <option value="50-80%">50% - 80%</option>
            </select>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeAgencies}
                onChange={e => setExcludeAgencies(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-800 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Exclure les agences de placement</span>
              </span>
            </label>
            <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyDirectEmployers}
                onChange={e => setOnlyDirectEmployers(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-800 cursor-pointer"
              />
              <span>Entreprises directes vérifiées (CHUV, BCV, Vaudoise...)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sources Verification Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-200">Portails scannés en direct :</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 text-[11px]">Jobup.ch</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 text-[11px]">Indeed.ch</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 text-[11px]">LinkedIn Jobs Suisse</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 text-[11px]">Portails Directs (Vaud)</span>
        </div>

        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Filtre suisse anti-intermédiaire actif</span>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Opportunités Détectées</span>
            <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
              {discoveredJobs.length} offres
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Triées par score de matching avec votre profil ({userProfile.fullName || 'Profil Maître'})
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isScanning && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-slate-800 rounded-md w-3/4"></div>
              <div className="h-4 bg-slate-800 rounded-md w-1/2"></div>
              <div className="h-20 bg-slate-800/60 rounded-xl"></div>
              <div className="h-10 bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Discovered Jobs Grid */}
      {!isScanning && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discoveredJobs.map(job => {
            const isAlreadyIngested = ingestedJobIds.has(job.url || job.id) || ingestedJobIds.has(job.id);
            const is100Match = job.matchScore === 100;

            return (
              <div
                key={job.id}
                className={`bg-slate-900 border rounded-3xl p-6 shadow-xl transition-all duration-200 flex flex-col justify-between relative group ${
                  isAlreadyIngested
                    ? 'border-emerald-800/60 bg-emerald-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Match Score & Direct Employer Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        is100Match
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/80'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{job.matchScore}% Match Suisse</span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-900/80 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Direct</span>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </div>
                  </div>

                  {/* Metadata Chips: Location, Contract, Taux */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <Briefcase className="w-3 h-3 text-blue-400" />
                      <span>{job.activityRateMin}-{job.activityRateMax}% {job.contractType}</span>
                    </span>
                  </div>

                  {/* The Why (Swiss Context) */}
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                    <p className="line-clamp-3">{job.theWhy}</p>
                  </div>

                  {/* Skills tags preview */}
                  {job.matchBreakdown?.skillsMatched && job.matchBreakdown.skillsMatched.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Compétences validées :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {job.matchBreakdown.skillsMatched.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 px-2 py-0.5 rounded-md font-medium"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                        {job.matchBreakdown.skillsMatched.length > 3 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{job.matchBreakdown.skillsMatched.length - 3} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Option B teaser if any */}
                  {job.optionBQuestions && job.optionBQuestions.length > 0 && (
                    <div className="p-2.5 bg-amber-950/30 border border-amber-900/50 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                      <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span>1 question Option B disponible pour hisser ce poste à 100%.</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                  {isAlreadyIngested ? (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Présent dans votre pipeline</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSingleIngest(job)}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Ingérer immédiatement dans votre pipeline"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ingérer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleIngestAndDossier(job)}
                        className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Ingérer et générer immédiatement le dossier 3 volets"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedJobPreview(job)}
                      className="hover:text-slate-200 underline cursor-pointer"
                    >
                      Détail de l'annonce
                    </button>
                    <a
                      href={sanitizeUrl(job.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-red-400 transition-colors"
                    >
                      <span>Portail source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Job Details Preview */}
      {selectedJobPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Entreprise directe vérifiée</span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedJobPreview.title}</h2>
                <p className="text-sm text-slate-300 font-semibold">{selectedJobPreview.company} • {selectedJobPreview.location}</p>
              </div>
              <button
                onClick={() => setSelectedJobPreview(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800 whitespace-pre-line">
              {selectedJobPreview.rawText}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedJobPreview(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSingleIngest(selectedJobPreview);
                  setSelectedJobPreview(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-red-950/50"
              >
                <Zap className="w-4 h-4" />
                <span>Ingérer dans mon Pipeline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
