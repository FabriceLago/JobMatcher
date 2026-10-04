import React, { useState } from 'react';
import {
  ExternalLink,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Send,
  Trash2,
  MapPin,
  Building,
  Calendar,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
  X
} from 'lucide-react';
import { JobOffer, JobStatus } from '../types';

interface JobCardProps {
  job: JobOffer;
  onOpenDossier: (job: JobOffer) => void;
  onOpenOptionB: (job: JobOffer) => void;
  onUpdateStatus: (jobId: string, newStatus: JobStatus) => void;
  onDeleteJob: (jobId: string) => void;
  onCopyNotice?: (text: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onOpenDossier,
  onOpenOptionB,
  onUpdateStatus,
  onDeleteJob,
  onCopyNotice
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const is100 = job.matchScore === 100;
  const isOptionB = job.status === 'waiting_info';
  const isEliminated = job.isEliminated || job.status === 'rejected';
  const isApplied = job.status === 'applied';

  const handleCopyLink = () => {
    const textToCopy = job.url || `${job.title} chez ${job.company}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    if (onCopyNotice) {
      onCopyNotice('Lien copié dans le presse-papier !');
    }
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getStatusBadge = () => {
    switch (job.status) {
      case 'ready_to_send':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Prêt à envoyer (100% Match)
          </span>
        );
      case 'waiting_info':
        return (
          <button
            onClick={() => onOpenOptionB(job)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
            Option B : Action requise
          </button>
        );
      case 'applied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Postulé
          </span>
        );
      case 'to_validate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            À valider
          </span>
        );
      case 'rejected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Éliminé d'office
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md flex flex-col justify-between ${
        is100
          ? 'border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-400/20'
          : isOptionB
          ? 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-400/20'
          : isEliminated
          ? 'border-slate-200 dark:border-slate-800 opacity-80 bg-slate-50/50 dark:bg-slate-950/40'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="p-5">
        {/* Top Meta: Status + Match Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge()}
            {job.precisionIndex === 'vague_to_verify' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                À vérifier (annonce succincte)
              </span>
            )}
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {job.jobLanguage}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
              title="Copier le lien ou l'intitulé"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tabular-nums flex items-center gap-1 ${
                job.matchScore >= 95
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : job.matchScore >= 80
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-600 text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{job.matchScore}%</span>
            </div>
          </div>
        </div>

        {/* Title & Company */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1">
          {job.title}
        </h3>

        <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            {job.company}
          </span>
          <span className="text-slate-400">·</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {job.location}
          </span>
          <span className="text-slate-400">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {job.activityRateMin}-{job.activityRateMax}% · {job.contractType}
          </span>
        </div>

        {/* Synthèse de Pertinence ("The Why") */}
        {job.theWhy && (
          <div className={`p-3 rounded-lg text-xs mb-3.5 ${
            isEliminated
              ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
              : 'bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
          }`}>
            <div className="font-semibold mb-1 flex items-center gap-1.5 text-slate-900 dark:text-slate-200">
              <span>💡</span>
              <span>{isEliminated ? 'Motif d’exclusion stricte' : 'Synthèse de pertinence ("The Why")'}</span>
            </div>
            <p className="leading-relaxed italic">"{job.theWhy}"</p>
          </div>
        )}

        {/* Matched & Missing Skills text items */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] mb-2 text-slate-600 dark:text-slate-400">
          {job.matchBreakdown?.skillsMatched?.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="text-emerald-700 dark:text-emerald-400 font-medium">
              ✓ {skill}
            </span>
          ))}

          {job.matchBreakdown?.skillsMissing?.map((missing, idx) => (
            <span key={idx} className="text-amber-700 dark:text-amber-400 font-medium">
              ? {missing}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 rounded-b-xl flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Status Quick-Switch */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-500 font-medium text-[11px]">Statut :</label>
          <select
            value={job.status}
            onChange={e => onUpdateStatus(job.id, e.target.value as JobStatus)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            <option value="to_validate">À valider</option>
            <option value="waiting_info">Option B (en attente)</option>
            <option value="ready_to_send">Prêt à envoyer (100%)</option>
            <option value="applied">Postulé</option>
            <option value="rejected">Refusé / Éliminé</option>
          </select>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Action Channel Button: 1-click apply */}
          {job.actionChannel?.target && !isEliminated && (
            <a
              href={job.actionChannel.target}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
              title={job.actionChannel.notes || 'Postuler en 1 clic'}
            >
              {job.actionChannel.type === 'email' ? (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email RH</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Postuler</span>
                </>
              )}
            </a>
          )}

          {/* Dossier button */}
          {!isEliminated && (
            <button
              onClick={() => onOpenDossier(job)}
              className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Dossier sur-mesure</span>
            </button>
          )}

          {/* Option B quick button */}
          {isOptionB && (
            <button
              onClick={() => onOpenOptionB(job)}
              className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-medium px-2.5 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Arbitrer</span>
            </button>
          )}

          {/* Safe Inline Delete confirmation */}
          {isDeleting ? (
            <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 px-2 py-1 rounded-md border border-rose-300 dark:border-rose-800">
              <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">Supprimer ?</span>
              <button
                onClick={() => onDeleteJob(job.id)}
                className="text-rose-700 dark:text-rose-300 hover:underline font-bold text-[11px] px-1 cursor-pointer"
              >
                Oui
              </button>
              <button
                onClick={() => setIsDeleting(false)}
                className="text-slate-500 hover:text-slate-700 text-[11px] px-1 cursor-pointer"
              >
                Non
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsDeleting(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Supprimer cette opportunité"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
