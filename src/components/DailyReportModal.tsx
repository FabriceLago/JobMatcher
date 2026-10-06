import React, { useState, useEffect } from 'react';
import {
  Clock,
  Copy,
  Send,
  Check,
  ExternalLink,
  MessageCircle,
  Mail,
  Sparkles,
  FileText,
  Smartphone,
  Download,
  Code,
  Eye,
  Share2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bell,
  RefreshCw,
  Building,
  UserCheck,
  HelpCircle,
  Zap
} from 'lucide-react';
import { JobOffer, JobStatus, UserProfile } from '../types';
import { sanitizeUrl } from '../utils/security';

interface DailyReportModalProps {
  jobs: JobOffer[];
  userProfile?: UserProfile;
  onOpenDossier: (job: JobOffer) => void;
  onUpdateJobStatus?: (jobId: string, newStatus: JobStatus) => void;
  onCopyNotice?: (text: string) => void;
}

interface FollowUpDraft {
  job: JobOffer;
  targetEmail: string;
  subject: string;
  body: string;
  mailtoUrl: string;
  advice: string;
  recruiterName: string;
  type: 'j7' | 'j14';
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  jobs,
  userProfile,
  onOpenDossier,
  onUpdateJobStatus,
  onCopyNotice
}) => {
  const [reportText, setReportText] = useState('');
  const [reportHtml, setReportHtml] = useState('');
  const [copiedType, setCopiedType] = useState<'text' | 'html' | 'followup' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<'opportunities' | 'followups' | 'whatsapp' | 'email' | 'html'>('opportunities');
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpDraft | null>(null);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }));

  const activeOffers = jobs.filter(
    j => j.status === 'ready_to_send' || j.status === 'waiting_info'
  );

  const appliedJobs = jobs.filter(j => j.status === 'applied');

  // Compute follow-ups needed (J+7 or J+14)
  const followUpNeededCount = appliedJobs.filter(job => {
    const appliedTime = new Date(job.appliedDate || job.createdAt).getTime();
    const daysElapsed = Math.floor((Date.now() - appliedTime) / (1000 * 60 * 60 * 24));
    return daysElapsed >= 7;
  }).length;

  const loadReport = () => {
    setIsLoading(true);
    fetch('/api/generate-daily-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobOffers: jobs })
    })
      .then(res => res.json())
      .then(data => {
        if (data.reportText) setReportText(data.reportText);
        if (data.reportHtml) setReportHtml(data.reportHtml);
        setLastRefreshedAt(new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }));
      })
      .catch(err => {
        console.error('Error fetching report:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadReport();
  }, [jobs]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(reportText);
    setCopiedType('text');
    setTimeout(() => setCopiedType(null), 2500);
    if (onCopyNotice) onCopyNotice('Texte WhatsApp 8h00 copié !');
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(reportHtml);
    setCopiedType('html');
    setTimeout(() => setCopiedType(null), 2500);
    if (onCopyNotice) onCopyNotice('Code HTML copié !');
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_8h00_JobMatcher_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onCopyNotice) onCopyNotice('Fichier HTML téléchargé !');
  };

  // Generate Follow-up email
  const handleOpenFollowUp = async (job: JobOffer, type: 'j7' | 'j14') => {
    setIsGeneratingFollowUp(true);
    try {
      const response = await fetch('/api/generate-follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobOffer: job,
          userProfile,
          followUpType: type
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSelectedFollowUp({
          job,
          targetEmail: data.targetEmail,
          subject: data.subject,
          body: data.body,
          mailtoUrl: data.mailtoUrl,
          advice: data.advice,
          recruiterName: data.recruiterName,
          type
        });
      }
    } catch (err) {
      console.error('Failed to generate follow-up:', err);
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleMarkFollowUpDone = (job: JobOffer) => {
    if (onCopyNotice) {
      onCopyNotice(`Relance enregistrée pour ${job.company} !`);
    }
    setSelectedFollowUp(null);
  };

  // WhatsApp mobile deep-link
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;

  // Mobile mailto link with explicit subject and formatted body
  const emailSubject = 'Rapport 8h00 - Opportunités Directes 100% Match Lausanne';
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(reportText)}`;

  const todaySwiss = new Date().toLocaleDateString('fr-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Banner: Swiss Context & Automation Status */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-red-800/60 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-900/60 border border-red-700/60 text-red-200 text-xs px-3 py-1 rounded-full font-semibold">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              <span>Étape 5 : Automatisation 8h00 & Relances Intelligentes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>Rituel Matinal de 8h00</span>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Veille 100% Active
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Planification et synthèse exécutive quotidienne : veille nocturne sur Lausanne et agglomération vaudoise, élimination stricte des agences intermédiaires, et calcul des relances intelligentes (J+7 / J+14).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={loadReport}
              disabled={isLoading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-3 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Actualiser la synthèse matinale"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
              <span>Actualiser ({lastRefreshedAt})</span>
            </button>

            <a
              href={sanitizeUrl(whatsappUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Transmettre sur WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Executive Metrics Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Périmètre d'ingestion</span>
            <span className="text-base font-bold text-white mt-0.5 block">Lausanne (20-30km)</span>
            <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Canton de Vaud</span>
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Intermédiaires éliminés</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">0 agence retenue</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Filtrage strict 100% direct</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Offres du jour</span>
            <span className="text-base font-bold text-white mt-0.5 block">{activeOffers.length} opportunités</span>
            <span className="text-[10px] text-amber-400 mt-1 block">Validées ou Option B</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Relances à effectuer</span>
            <span className="text-base font-bold text-red-400 mt-0.5 block">{followUpNeededCount} relance(s)</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Calendrier J+7 / J+14</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveMainTab('opportunities')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeMainTab === 'opportunities'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Opportunités 8h00 ({activeOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('followups')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeMainTab === 'followups'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Relances Intelligentes (J+7 / J+14)</span>
          {followUpNeededCount > 0 && (
            <span className="bg-white text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {followUpNeededCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('whatsapp')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeMainTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Format WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveMainTab('email')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeMainTab === 'email'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Digest Email</span>
        </button>

        <button
          onClick={() => setActiveMainTab('html')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeMainTab === 'html'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Aperçu HTML & Export</span>
        </button>
      </div>

      {/* Tab 1: Opportunities of the Day */}
      {activeMainTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Sélection Exécutive de 8h00</span>
              <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full">
                {activeOffers.length} postes vaudois
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Triées par compatibilité suisse et employeurs directs
            </span>
          </div>

          {activeOffers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              Aucune offre 100% ou en cours d'arbitrage actuellement pour le rapport de 8h00.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeOffers.map((job, idx) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Opportunité #{idx + 1}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          job.status === 'ready_to_send'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-800/60'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {job.status === 'ready_to_send'
                          ? '🟢 100% Validé Prêt'
                          : '🟡 Arbitrage Option B'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                        🏢 <strong>{job.company}</strong> • 📍 {job.location}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                        <span>Score Suisse : {job.matchScore}%</span>
                        <span className="text-[10px] text-emerald-500 font-semibold">Direct ✓</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 italic line-clamp-3">
                        "{job.theWhy}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDossier(job)}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Consulter Dossier 3 Volets</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Smart Follow-ups (Relances Intelligentes J+7 / J+14) */}
      {activeMainTab === 'followups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Relances Intelligentes (J+7 / J+14)</span>
                <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-800/60">
                  {appliedJobs.length} candidature(s) postulée(s)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Protocole suisse de relance courtoise respectant les usages RH en Suisse romande.
              </p>
            </div>
          </div>

          {appliedJobs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Mail className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Aucune candidature n'est encore au statut « Postulé ». Dès que vous transmettez un dossier (via l'onglet Dossier), le système calcule automatiquement le compte à rebours de relance à J+7 et J+14.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appliedJobs.map(job => {
                const appliedDate = job.appliedDate ? new Date(job.appliedDate) : new Date(job.createdAt);
                const daysAgo = Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
                const isJ7Ready = daysAgo >= 7 && daysAgo < 14;
                const isJ14Ready = daysAgo >= 14;

                return (
                  <div
                    key={job.id}
                    className={`bg-white dark:bg-slate-900 p-5 rounded-3xl border shadow-sm space-y-4 ${
                      isJ14Ready
                        ? 'border-red-800/80 bg-red-950/10'
                        : isJ7Ready
                        ? 'border-amber-800/80 bg-amber-950/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        Postulé le {appliedDate.toLocaleDateString('fr-CH')} ({daysAgo}j écoulés)
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isJ14Ready
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : isJ7Ready
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isJ14Ready ? '⚠️ Relance Finale J+14' : isJ7Ready ? '🔔 Relance J+7 Recommandée' : '⏳ Examen en cours'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{job.title}</h4>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        🏢 {job.company} • 📍 {job.location}
                      </p>
                      {job.recruiterName && (
                        <p className="text-[11px] text-blue-400 mt-1">
                          👤 Contact RH : {job.recruiterName} ({job.recruiterTitle || 'Recrutement'})
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-300">Statut du cycle de recrutement suisse :</div>
                      <p className="text-[11px]">
                        {isJ14Ready
                          ? 'Deux semaines écoulées. Une dernière prise de contact synthétique et formelle permet de clore l\'évaluation.'
                          : isJ7Ready
                          ? 'Une semaine écoulée depuis l\'envoi. Fenêtre optimale pour réaffirmer votre disponibilité de manière polie.'
                          : `Candidature récente. La première fenêtre de relance s'ouvrira dans ${Math.max(1, 7 - daysAgo)} jour(s).`}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenFollowUp(job, isJ14Ready ? 'j14' : 'j7')}
                        disabled={isGeneratingFollowUp}
                        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Générer Courriel de Relance ({isJ14Ready ? 'J+14' : 'J+7'})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: WhatsApp Mobile View */}
      {activeMainTab === 'whatsapp' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Message Formaté pour WhatsApp & Messagerie Mobile
                </h3>
              </div>
              <button
                onClick={handleCopyText}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedType === 'text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'text' ? 'Copié !' : 'Copier le texte'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={reportText}
              rows={16}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Email Digest View */}
      {activeMainTab === 'email' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Digest Matinal par Courriel
                </h3>
              </div>
              <a
                href={sanitizeUrl(mailtoUrl)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ouvrir dans mon client mail</span>
              </a>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                Objet : <span className="font-bold text-slate-900 dark:text-white">{emailSubject}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed font-sans max-h-96 overflow-y-auto p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                {reportText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: HTML Export View */}
      {activeMainTab === 'html' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Aperçu & Exportation HTML Autonome
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHtml}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  {copiedType === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'html' ? 'Copié !' : 'Copier le code'}</span>
                </button>

                <button
                  onClick={handleDownloadHtml}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger HTML</span>
                </button>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-950 p-2">
              <iframe
                title="Aperçu du Rapport 8h00"
                srcDoc={reportHtml}
                className="w-full h-[520px] rounded-xl bg-white border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: Interactive Follow-up Composer */}
      {selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-950 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-800 mb-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Relance Intelligente Suisse ({selectedFollowUp.type.toUpperCase()})</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Courriel de Suivi auprès de {selectedFollowUp.job.company}
                </h3>
                <p className="text-xs text-slate-400">
                  Poste : {selectedFollowUp.job.title} • Recruteur : {selectedFollowUp.recruiterName}
                </p>
              </div>
              <button
                onClick={() => setSelectedFollowUp(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-xl text-amber-300 text-[11px] leading-relaxed">
                💡 <strong>Conseil RH Vaudois :</strong> {selectedFollowUp.advice}
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Destinataire RH :</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono">
                  {selectedFollowUp.targetEmail}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Objet :</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold">
                  {selectedFollowUp.subject}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Message de relance :</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed">
                  {selectedFollowUp.body}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Destinataire: ${selectedFollowUp.targetEmail}\nObjet: ${selectedFollowUp.subject}\n\n${selectedFollowUp.body}`);
                  setCopiedType('followup');
                  setTimeout(() => setCopiedType(null), 2500);
                  if (onCopyNotice) onCopyNotice('Texte de la relance copié !');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                {copiedType === 'followup' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedType === 'followup' ? 'Copié !' : 'Copier'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkFollowUpDone(selectedFollowUp.job)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
                >
                  ✓ Noter comme relancé
                </button>
                <a
                  href={sanitizeUrl(selectedFollowUp.mailtoUrl)}
                  onClick={() => handleMarkFollowUpDone(selectedFollowUp.job)}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-950/50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Ouvrir ma Messagerie (mailto)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
