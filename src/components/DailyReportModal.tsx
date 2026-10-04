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
  Share2
} from 'lucide-react';
import { JobOffer } from '../types';

interface DailyReportModalProps {
  jobs: JobOffer[];
  onOpenDossier: (job: JobOffer) => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  jobs,
  onOpenDossier
}) => {
  const [reportText, setReportText] = useState('');
  const [reportHtml, setReportHtml] = useState('');
  const [copiedType, setCopiedType] = useState<'text' | 'html' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mobile' | 'whatsapp' | 'email' | 'html'>('mobile');

  const activeOffers = jobs.filter(
    j => j.status === 'ready_to_send' || j.status === 'waiting_info'
  );

  useEffect(() => {
    fetch('/api/generate-daily-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobOffers: jobs })
    })
      .then(res => res.json())
      .then(data => {
        if (data.reportText) {
          setReportText(data.reportText);
        }
        if (data.reportHtml) {
          setReportHtml(data.reportHtml);
        }
      })
      .catch(err => {
        console.error('Error fetching report:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [jobs]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(reportText);
    setCopiedType('text');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(reportHtml);
    setCopiedType('html');
    setTimeout(() => setCopiedType(null), 2500);
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
  };

  // WhatsApp mobile deep-link (compatible with mobile apps & WhatsApp Web)
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(reportText)}`;

  // Mobile mailto link with explicit subject and formatted body
  const emailSubject = 'Rapport 8h00 - Opportunités Validées 100% Match Lausanne';
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(reportText)}`;

  return (
    <div className="space-y-6">
      {/* Top Banner: Swiss Context & Actions */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 rounded-2xl p-6 border border-red-800/60 shadow-md text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-red-600/30 border border-red-500/40 text-red-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Rapport Quotidien Matinal de 8h00</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Diffusion Mobile : WhatsApp, Email & Format HTML
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Format standardisé et calibré pour une consultation optimale sur smartphone : Synthèse "The Why", note d'adéquation à 100%, liens cliquables et design responsive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* WhatsApp Mobile Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                !reportText || isLoading ? 'pointer-events-none opacity-50' : ''
              }`}
              title="Transmettre directement sur WhatsApp (Application mobile ou Web)"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>WhatsApp Mobile</span>
            </a>

            {/* Email Mobile Button */}
            <a
              href={mailtoUrl}
              className={`bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                !reportText || isLoading ? 'pointer-events-none opacity-50' : ''
              }`}
              title="Ouvrir dans votre client email mobile"
            >
              <Mail className="w-4 h-4 text-white" />
              <span>Email Mobile</span>
            </a>

            {/* Download HTML Button */}
            <button
              onClick={handleDownloadHtml}
              disabled={!reportHtml || isLoading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Télécharger la version HTML autonome pour smartphone"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Télécharger HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Opportunities List on Left, Multi-Format Mobile Consultation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Selected Opportunities List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Opportunités du Jour ({activeOffers.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Employeurs directs vaudois
            </span>
          </div>

          {activeOffers.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              Aucune offre 100% ou en cours d'arbitrage actuellement pour le rapport de 8h00.
            </div>
          ) : (
            <div className="space-y-3">
              {activeOffers.map((job, idx) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Opportunité #{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'ready_to_send'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {job.status === 'ready_to_send'
                        ? '🟢 100% Match Prêt'
                        : '🟡 Action Requise (Option B)'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {job.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      🏢 <strong>{job.company}</strong> • 📍 {job.location} • ⏱️ {job.activityRateMin}-{job.activityRateMax}% • {job.contractType}
                    </p>
                  </div>

                  {/* Note de Match + Synthèse */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                      <span>🎯 Note de Match : {job.matchScore}%</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      💡 "{job.theWhy}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      {job.actionChannel?.target && (
                        <a
                          href={job.actionChannel.target}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-500 text-white font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Lien vers l'offre</span>
                        </a>
                      )}

                      {job.status === 'ready_to_send' && (
                        <button
                          onClick={() => onOpenDossier(job)}
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>Voir le dossier</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Format Switcher & Mobile Consultation Container */}
        <div className="lg:col-span-6 space-y-4">
          {/* Format Tabs Switcher */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('mobile')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'mobile'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Format HTML Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'email'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'html'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code HTML</span>
              </button>
            </div>

            {/* Quick Copy Action */}
            <div className="pr-1">
              {activeTab === 'html' ? (
                <button
                  onClick={handleCopyHtml}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'html' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier HTML</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCopyText}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'text' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier Texte</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: Mobile Smartphone Simulator View */}
          {activeTab === 'mobile' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Eye className="w-3.5 h-3.5 text-red-500" />
                  <span>Aperçu interactif : rendu sur écran smartphone (375px)</span>
                </span>
                <button
                  onClick={handleDownloadHtml}
                  className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                >
                  Télécharger le fichier .html
                </button>
              </div>

              {/* Smartphone Frame Simulator */}
              <div className="mx-auto max-w-[390px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800">
                {/* Mobile Top Speaker & Camera Notch */}
                <div className="w-32 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2 flex items-center justify-center gap-2">
                  <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                </div>

                {/* Mobile Screen Iframe */}
                <div className="bg-slate-50 rounded-[28px] overflow-hidden border border-slate-300 h-[560px] relative shadow-inner">
                  {reportHtml ? (
                    <iframe
                      srcDoc={reportHtml}
                      title="Rapport 8h00 Mobile HTML"
                      className="w-full h-full border-0 select-text"
                      sandbox="allow-same-origin allow-popups allow-scripts"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-slate-400">
                      Génération du rendu mobile en cours...
                    </div>
                  )}
                </div>

                {/* Mobile Bottom Home Bar Indicator */}
                <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
              </div>
            </div>
          )}

          {/* TAB 2: WhatsApp Chat Bubble View */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Optimisé pour WhatsApp (titres gras, puces claires et retours à la ligne)
                </span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3 h-3" />
                  <span>Envoyer via WhatsApp</span>
                </a>
              </div>

              {/* WhatsApp Mock Chat Bubble */}
              <div className="bg-[#0b141a] rounded-2xl p-4 border border-[#202c33] shadow-md space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#202c33] text-xs text-[#8696a0]">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-[#e9edef]">WhatsApp Message Preview</span>
                  <span className="ml-auto text-[10px]">08:00</span>
                </div>

                <div className="bg-[#005c4b] text-[#e9edef] rounded-xl p-3.5 font-sans text-xs leading-relaxed whitespace-pre-wrap select-all max-h-[500px] overflow-y-auto shadow">
                  {reportText}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Email Mobile Client View */}
          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Prêt à envoyer avec objet et corps de texte calibrés
                </span>
                <a
                  href={mailtoUrl}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3 h-3" />
                  <span>Ouvrir Mail Mobile</span>
                </a>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-md text-xs">
                <div className="space-y-1.5 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-semibold w-16">Objet :</span>
                    <span className="text-slate-900 dark:text-white font-medium select-all">
                      {emailSubject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-semibold w-16">Format :</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Texte brut + version HTML mobile disponible
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-[460px] overflow-y-auto select-all">
                  {reportText}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Raw HTML Code View */}
          {activeTab === 'html' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Code HTML autonome avec styles inline (compatible iOS Mail, Android Gmail, Outlook)
                </span>
                <button
                  onClick={handleCopyHtml}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedType === 'html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'html' ? 'Copié !' : 'Copier tout le code HTML'}</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto select-all shadow-inner">
                {reportHtml}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
