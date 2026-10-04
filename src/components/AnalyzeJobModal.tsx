import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  ShieldAlert,
  Loader2,
  Check,
  ClipboardPaste,
  RotateCcw,
  ExternalLink,
  Info
} from 'lucide-react';
import { JobOffer, UserProfile } from '../types';

interface AnalyzeJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  existingJobs: JobOffer[];
  onAddAnalyzedJob: (newJob: JobOffer) => void;
  onOpenExistingJob?: (job: JobOffer) => void;
}

export const AnalyzeJobModal: React.FC<AnalyzeJobModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  existingJobs,
  onAddAnalyzedJob,
  onOpenExistingJob
}) => {
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<JobOffer | null>(null);
  const [analyzedPreview, setAnalyzedPreview] = useState<JobOffer | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  if (!isOpen) return null;

  // Preset job templates for instant Lausanne testing
  const presets = [
    {
      label: 'EPFL - SI & Recherche (100% Match)',
      url: 'https://recrutement.epfl.ch/position/chef-de-projet-si-recherche-2026',
      text: `L'EPFL recherche pour sa Vice-présidence des Systèmes d'Information un(e) Chef de Projet SI & Gouvernance Digitale à 80%-100% en CDI sur le campus d'Ecublens (Lausanne).
Missions :
- Piloter des projets transverses de modernisation applicative et d'infrastructures de recherche.
- Coordonner les comités de pilotage et animer les cérémonies agiles (Scrum / SAFe).
- Maîtriser les budgets (CHF 500k à 2M) et assurer le suivi des risques et de la conformité LPD.
Profil recherché :
- Formation universitaire supérieure (EPFL, UNIL, HEC ou titre équivalent).
- Minimum 5 ans d'expérience avérée en gestion de projets informatiques complexes.
- Certifications PMP, Prince2 ou Scrum Master fortement appréciées.
- Excellente maîtrise du français et de l'anglais.
Contact : recrutement-vpi@epfl.ch`
    },
    {
      label: 'Vaudoise Assurances - Transformation (Option B 88%)',
      url: 'https://carrieres.vaudoise.ch/jobs/project-manager-transformation-digitale-ouchy',
      text: `La Vaudoise Assurances recherche pour son siège à Lausanne (Place de la Navigation) un(e) Project Manager Transformation Digitale à 80%-100% en CDI.
Responsabilités :
- Piloter les chantiers de digitalisation des processus et outils métier.
- Coordonner les éditeurs et architectes autour des progiciels métiers de type Guidewire / core insurance.
- Encadrer les cérémonies agiles et le cadrage budgétaire.
Profil :
- 5 ans d'expérience en gestion de projets financiers (banque ou assurance).
- Compétences en méthodes agiles, PMP et pilotage budgétaire suisse.
- Atout déterminant : connaissance pratique de Guidewire ou progiciel sinistres assurance.`
    },
    {
      label: 'Hays Lausanne (Test Rejet Cabinet de Recrutement)',
      url: 'https://hays.ch/fr/job/chef-de-projet-informatique-lausanne-vd-test',
      text: `Notre client, une prestigieuse entreprise vaudoise, mandate notre cabinet de recrutement Hays Suisse pour recruter un Chef de Projet IT Senior en CDI à Lausanne.
Missions : Cadrage et suivi de projets informatiques.
Envoyez votre dossier à notre consultant Hays.`
    },
    {
      label: 'fedpol Sécurité (Test Rejet Juridique Nationalité)',
      url: 'https://jobs.admin.ch/fedpol/chef-de-projet-securite-fed-lausanne-test',
      text: `L'Office fédéral de la police (fedpol) recherche pour son antenne de Lausanne un Chef de Projet Sécurité Informatique.
Conditions strictes d'engagement :
- Être de nationalité suisse impérativement (exigence absolue).
- Soumission obligatoire au contrôle de sécurité relatif aux personnes (CSP secret 2).`
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setUrl(preset.url);
    setRawText(preset.text);
    setErrorMsg(null);
    setAnalyzedPreview(null);
    handleCheckDeduplication(preset.url);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setRawText(text);
          setErrorMsg(null);
          const matchUrl = text.match(/https?:\/\/[^\s]+/i);
          if (matchUrl && !url) {
            setUrl(matchUrl[0]);
            handleCheckDeduplication(matchUrl[0]);
          }
        }
      }
    } catch {
      // Browser permissions fallback
    }
  };

  const handleClear = () => {
    setUrl('');
    setRawText('');
    setErrorMsg(null);
    setDuplicateWarning(null);
    setAnalyzedPreview(null);
  };

  const handleCheckDeduplication = (urlToCheck: string) => {
    if (!urlToCheck.trim()) {
      setDuplicateWarning(null);
      return null;
    }
    const clean = urlToCheck.trim().toLowerCase();
    const existing = existingJobs.find(j => j.url.toLowerCase() === clean);
    if (existing) {
      setDuplicateWarning(existing);
      return existing;
    }
    setDuplicateWarning(null);
    return null;
  };

  const handleAnalyze = async (force: boolean = false) => {
    setErrorMsg(null);
    if (!rawText.trim()) {
      setErrorMsg('Veuillez coller le descriptif de l’annonce ou charger un exemple.');
      return;
    }

    const dup = handleCheckDeduplication(url);
    if (dup && !force) {
      return;
    }

    setIsLoading(true);
    setAnalysisStep('1/3. Vérification des critères suisses (rayon 30km, employeur direct)...');

    setTimeout(() => {
      setAnalysisStep('2/3. Évaluation de l’adéquation des compétences & cadre vaudois...');
    }, 600);

    setTimeout(() => {
      setAnalysisStep('3/3. Calcul du score 100% et diagnostic d’arbitrage...');
    }, 1200);

    try {
      const response = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          url,
          userProfile,
          historyUrls: existingJobs.map(j => j.url),
          forceReanalyze: force || Boolean(dup)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l’analyse.');
      }

      setAnalyzedPreview(data.jobOffer);
      setDuplicateWarning(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible d’analyser l’offre.');
    } finally {
      setIsLoading(false);
      setAnalysisStep('');
    }
  };

  const handleConfirmAdd = () => {
    if (!analyzedPreview) return;
    onAddAnalyzedJob(analyzedPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Analyser une Offre d'Emploi
              </h3>
              <p className="text-xs text-slate-500">
                Évaluation selon vos critères stricts (Lausanne & environs, entreprise directe, taux 80-100%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Tester immédiatement avec un cas d'usage :
              </span>
              <span className="text-[11px] text-slate-400">Cliquez pour charger</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  type="button"
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-600 bg-slate-50 dark:bg-slate-800/40 text-left transition-all hover:shadow-xs group cursor-pointer"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 flex items-center justify-between">
                    <span>{preset.label.split('(')[0].trim()}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-red-500">Charger</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {preset.label.includes('(') ? preset.label.split('(')[1].replace(')', '') : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form: URL & Raw Text */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Lien ou URL de l'offre (optionnel) :
                </label>
                {duplicateWarning && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Offre déjà répertoriée
                  </span>
                )}
              </div>
              <input
                type="url"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  handleCheckDeduplication(e.target.value);
                }}
                placeholder="https://recrutement.epfl.ch/position/..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Texte de l'annonce d'emploi :
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Coller depuis le presse-papier"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Coller</span>
                  </button>
                  {rawText && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Effacer le texte"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Vider</span>
                    </button>
                  )}
                </div>
              </div>
              <textarea
                rows={6}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Collez ici l'annonce (titre, missions, profil requis, entreprise, localisation, taux)..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 font-sans text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Friendly Deduplication Notice with Direct Actions */}
          {duplicateWarning && !analyzedPreview && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    Cette offre est déjà enregistrée dans votre pipeline
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    Titre : <strong>{duplicateWarning.title}</strong> chez {duplicateWarning.company} (Statut : {duplicateWarning.status}).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {onOpenExistingJob && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenExistingJob(duplicateWarning);
                      onClose();
                    }}
                    className="bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Consulter l'offre existante</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAnalyze(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ré-analyser quand même</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Steps State */}
          {isLoading && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-red-600 mx-auto" />
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                {analysisStep || 'Analyse approfondie en cours...'}
              </div>
              <p className="text-[11px] text-slate-500">
                Filtrage géographique 20-30km • Contrôle employeur direct • Vérification Permis C
              </p>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          {/* Analyzed Preview Result */}
          {analyzedPreview && (
            <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-950 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Résultat du diagnostic</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {analyzedPreview.title} • {analyzedPreview.company}
                  </h4>
                </div>
                <div className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 ${
                  analyzedPreview.isEliminated
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                    : analyzedPreview.matchScore === 100
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {analyzedPreview.isEliminated ? 'Éliminé d’office' : `${analyzedPreview.matchScore}% Match`}
                </div>
              </div>

              {/* Checklist 5 règles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className={analyzedPreview.matchBreakdown.locationOk ? 'text-emerald-600' : 'text-rose-600 font-bold'}>
                    {analyzedPreview.matchBreakdown.locationOk ? '✓' : '✗'}
                  </span>
                  <span><strong>Zone :</strong> {analyzedPreview.matchBreakdown.locationReason}</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className={analyzedPreview.matchBreakdown.directEmployerOk ? 'text-emerald-600' : 'text-rose-600 font-bold'}>
                    {analyzedPreview.matchBreakdown.directEmployerOk ? '✓' : '✗'}
                  </span>
                  <span><strong>Sourcing :</strong> {analyzedPreview.matchBreakdown.directEmployerReason}</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className={analyzedPreview.matchBreakdown.legalOk ? 'text-emerald-600' : 'text-rose-600 font-bold'}>
                    {analyzedPreview.matchBreakdown.legalOk ? '✓' : '✗'}
                  </span>
                  <span><strong>Juridique :</strong> {analyzedPreview.matchBreakdown.legalReason}</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className={analyzedPreview.matchBreakdown.contractRateOk ? 'text-emerald-600' : 'text-rose-600 font-bold'}>
                    {analyzedPreview.matchBreakdown.contractRateOk ? '✓' : '✗'}
                  </span>
                  <span><strong>Contrat :</strong> {analyzedPreview.contractType} ({analyzedPreview.activityRateMin}-{analyzedPreview.activityRateMax}%)</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                  <span className={analyzedPreview.matchBreakdown.rgpdComplianceOk !== false ? 'text-emerald-600' : 'text-rose-600 font-bold'}>
                    {analyzedPreview.matchBreakdown.rgpdComplianceOk !== false ? '✓' : '✗'}
                  </span>
                  <span><strong>Contrôle RGPD / nLPD :</strong> {analyzedPreview.matchBreakdown.rgpdReason || 'Protection des données conforme (aucune collecte sensible disproportionnée).'}</span>
                </div>
              </div>

              {/* The Why */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200">
                <div className="font-semibold mb-1">💡 Synthèse de Pertinence ("The Why") :</div>
                <p className="italic">"{analyzedPreview.theWhy}"</p>
              </div>

              {/* Action Channel */}
              <div className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Canal direct d'action :</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 truncate max-w-xs">
                  {analyzedPreview.actionChannel.target}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-xs cursor-pointer"
          >
            Fermer
          </button>

          <div className="flex items-center gap-2">
            {!analyzedPreview ? (
              <button
                onClick={() => handleAnalyze(false)}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyse experte en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Lancer l'Analyse 100%</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleConfirmAdd}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer dans le Tableau de Bord</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
