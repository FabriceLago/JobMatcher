import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Trash2,
  History,
  Building
} from 'lucide-react';
import { JobOffer, OptionBQuestion, UserProfile, LearnedSkill } from '../types';

interface OptionBManagerProps {
  jobs: JobOffer[];
  userProfile: UserProfile;
  onResolveOptionB: (
    jobId: string,
    questionId: string,
    response: 'yes' | 'no' | 'partial',
    details?: string,
    skillToLearn?: { name: string; category: string }
  ) => void;
  onRemoveLearnedSkill: (skillId: string) => void;
  onOpenDossier: (job: JobOffer) => void;
  onNavigateDashboard?: () => void;
}

export const OptionBManager: React.FC<OptionBManagerProps> = ({
  jobs,
  userProfile,
  onResolveOptionB,
  onRemoveLearnedSkill,
  onOpenDossier,
  onNavigateDashboard
}) => {
  const [activeDetailsInput, setActiveDetailsInput] = useState<{ [qId: string]: string }>({});

  // Jobs that currently have pending Option B questions
  const pendingJobs = jobs.filter(
    j => j.status === 'waiting_info' && j.optionBQuestions && j.optionBQuestions.length > 0
  );

  const handleResponse = (
    job: JobOffer,
    question: OptionBQuestion,
    response: 'yes' | 'no' | 'partial'
  ) => {
    const details = activeDetailsInput[question.id] || '';
    const skillToLearn =
      response === 'yes' || response === 'partial'
        ? { name: question.skillName, category: question.category || 'tool' }
        : undefined;

    onResolveOptionB(job.id, question.id, response, details, skillToLearn);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 rounded-2xl p-6 border border-amber-800/60 shadow-md text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Système Expert Apprenant • Option B & Mémoire Permanente</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Gestion des Écarts (&gt;85%) & Apprentissage Dynamique
            </h2>
            <p className="text-xs text-amber-200/80 max-w-2xl leading-relaxed">
              Lorsqu'une offre dépasse 85% d'adéquation mais qu'un critère précis manque, l'IA vous consulte. Chaque confirmation enrichit définitivement votre <strong className="text-white">Profil Persistant</strong> pour les futures offres.
            </p>
          </div>

          <div className="bg-amber-900/60 border border-amber-700/80 px-4 py-3 rounded-xl text-center">
            <div className="text-2xl font-black text-amber-300">{pendingJobs.length}</div>
            <div className="text-[11px] text-amber-200">Arbitrage{pendingJobs.length > 1 ? 's' : ''} en attente</div>
          </div>
        </div>
      </div>

      {/* Section 1: Pending Option B Questions */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>Questions d'Arbitrage Actives ({pendingJobs.length})</span>
        </h3>

        {pendingJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Aucun arbitrage en attente
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Toutes vos opportunités sont soit validées à 100% et prêtes à l'envoi, soit éliminées d'office selon vos critères stricts.
            </p>
            {onNavigateDashboard && (
              <div className="pt-2">
                <button
                  onClick={onNavigateDashboard}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Voir le tableau de bord</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {pendingJobs.map(job => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-amber-900/80 shadow-sm p-5 space-y-4"
              >
                {/* Job Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                      Score : {job.matchScore}% • Option B requise
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {job.title}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5" />
                      <span>{job.company}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenDossier(job)}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium underline"
                  >
                    Voir l'offre complète
                  </button>
                </div>

                {/* Questions for this job */}
                <div className="space-y-3">
                  {job.optionBQuestions.map(q => (
                    <div
                      key={q.id}
                      className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          ?
                        </span>
                        <div className="space-y-1 flex-1 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {q.questionText}
                          </p>
                          {q.contextSnippet && (
                            <p className="text-slate-500 italic bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                              Extrait annonce : "{q.contextSnippet}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Optional details input */}
                      <div>
                        <input
                          type="text"
                          value={activeDetailsInput[q.id] || ''}
                          onChange={e =>
                            setActiveDetailsInput(prev => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder="Détails complémentaires (ex: 'Pratique de 2 ans en projet banque', 'Certifié en 2024')..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <button
                          onClick={() => handleResponse(job, q, 'yes')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Oui, je la maîtrise (Apprendre & Passer à 100%)</span>
                        </button>

                        <button
                          onClick={() => handleResponse(job, q, 'partial')}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Partiellement / Notions équivalentes</span>
                        </button>

                        <button
                          onClick={() => handleResponse(job, q, 'no')}
                          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Non, compétence absente</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Persistent Learning Register */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Mémoire Persistante & Compétences Apprises Dynamiquement ({userProfile.learnedSkills.length})
              </h3>
              <p className="text-xs text-slate-500">
                Ces compétences ont été confirmées via l'Option B et sont automatiquement reconnues par l'IA pour toutes les futures analyses.
              </p>
            </div>
          </div>
        </div>

        {userProfile.learnedSkills.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            Aucune compétence apprise pour l'instant. Elles s'ajouteront automatiquement lorsque vous confirmerez une Option B.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userProfile.learnedSkills.map(skill => (
              <div
                key={skill.id}
                className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-emerald-300 text-sm">
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.2 rounded-full">
                      Appris
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Source : <em>{skill.addedFromJobTitle}</em> ({skill.dateAdded})
                  </p>
                  {skill.notes && (
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                      "{skill.notes}"
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onRemoveLearnedSkill(skill.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded"
                  title="Supprimer cette compétence du profil persistant"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
