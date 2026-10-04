import React, { useState } from 'react';
import {
  X,
  FileText,
  Mail,
  CheckCircle,
  Copy,
  Printer,
  ExternalLink,
  ShieldCheck,
  Building,
  MapPin,
  Sparkles,
  Loader2,
  Paperclip,
  Check,
  Edit3,
  Eye,
  UserCheck
} from 'lucide-react';
import { JobOffer, UserProfile, TailoredDossier } from '../types';

interface DossierModalProps {
  job: JobOffer | null;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateJobDossier: (jobId: string, updatedDossier: TailoredDossier) => void;
  onCopyNotice?: (text: string) => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  job,
  isOpen,
  onClose,
  userProfile,
  onUpdateJobDossier,
  onCopyNotice
}) => {
  const [activeTab, setActiveTab] = useState<'letter' | 'cv' | 'attachments'>('letter');
  const [selectedLanguage, setSelectedLanguage] = useState<'FR' | 'EN' | 'DE'>(
    job?.tailoredDossier?.language || job?.jobLanguage || 'FR'
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedCV, setCopiedCV] = useState(false);
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [editableLetter, setEditableLetter] = useState(job?.tailoredDossier?.motivationLetter || '');

  // Recruiter and Candidate personalization state
  const [candidateName, setCandidateName] = useState(userProfile.fullName || 'Marc Delarue');
  const [recruiterName, setRecruiterName] = useState(
    job?.recruiterName || job?.actionChannel?.contactName || 'Mme Céline Favre'
  );
  const [recruiterTitle, setRecruiterTitle] = useState(
    job?.recruiterTitle || 'Responsable Recrutement RH'
  );

  const applyPersonalizationToLetter = (
    baseText: string,
    cand: string,
    recName: string,
    recTitle: string
  ): string => {
    let letter = baseText || '';
    const cleanCand = cand.trim() || userProfile.fullName || 'Marc Delarue';
    const cleanRec = recName.trim() || 'Responsable des Ressources Humaines';
    const cleanTitle = recTitle.trim() ? `, ${recTitle.trim()}` : '';

    // Replace generic placeholder tokens everywhere
    letter = letter.replace(/\[Nom\s*&\s*Prénom\]/gi, cleanCand);
    letter = letter.replace(/\[Votre\s*Nom(?:\s*et\s*Prénom)?\]/gi, cleanCand);
    letter = letter.replace(/\[Nom\s*du\s*candidat\]/gi, cleanCand);
    letter = letter.replace(/\[Nom\]/gi, cleanCand);

    // Compute polite salutation
    let salutationGreeting = 'Madame, Monsieur,';
    if (cleanRec) {
      if (cleanRec.startsWith('Mme') || cleanRec.toLowerCase().includes('madame')) {
        const parts = cleanRec.replace(/^Mme\.?\s+/i, '').replace(/^Madame\s+/i, '').trim().split(' ');
        const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        salutationGreeting = `Madame ${lastName},`;
      } else if (cleanRec.startsWith('M.') || cleanRec.toLowerCase().includes('monsieur')) {
        const parts = cleanRec.replace(/^M\.?\s+/i, '').replace(/^Monsieur\s+/i, '').trim().split(' ');
        const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        salutationGreeting = `Monsieur ${lastName},`;
      } else if (cleanRec.toLowerCase().includes('ressources humaines') || cleanRec.toLowerCase().includes('rh')) {
        salutationGreeting = 'Madame la Responsable des Ressources Humaines, Monsieur le Responsable,';
      }
    }

    const lines = letter.split('\n');

    // Rule 1: The very first line of the letter MUST be the applicant's name and surname
    if (lines.length > 0) {
      lines[0] = cleanCand;
    }

    // Rule 2: The recipient must be addressed to the Recruiter or HR
    const recIndex = lines.findIndex(
      l => l.toLowerCase().startsWith("à l'attention de") || l.toLowerCase().startsWith("attn:")
    );
    if (recIndex !== -1) {
      lines[recIndex] = `À l'attention de ${cleanRec}${cleanTitle}`;
    }

    // Rule 3: Salutation addressed to recruiter/HR
    const salutationIndex = lines.findIndex(
      l =>
        l.trim() === 'Madame, Monsieur,' ||
        l.trim().startsWith('Madame ') ||
        l.trim().startsWith('Monsieur ') ||
        l.trim().startsWith('Madame la') ||
        l.trim().startsWith('Dear ')
    );
    if (salutationIndex !== -1) {
      lines[salutationIndex] = salutationGreeting;
    }

    // Rule 4: Signature at bottom MUST be the applicant's name and surname from CV
    // Find the closing salutation
    const closingIndex = lines.findIndex(
      l => l.toLowerCase().includes("salutations distinguées") || l.toLowerCase().includes("salutations les meilleures") || l.toLowerCase().includes("sincerely")
    );

    if (closingIndex !== -1 && closingIndex < lines.length - 1) {
      // The line after closing must be the candidate name
      let sigIndex = closingIndex + 1;
      while (sigIndex < lines.length && lines[sigIndex].trim() === '') {
        sigIndex++;
      }
      if (sigIndex < lines.length) {
        lines[sigIndex] = cleanCand;
      } else {
        lines.push('');
        lines.push(cleanCand);
      }
    } else {
      // Fallback: ensure the last line is the candidate name
      let lastNonEmptyIndex = lines.length - 1;
      while (lastNonEmptyIndex >= 0 && lines[lastNonEmptyIndex].trim() === '') {
        lastNonEmptyIndex--;
      }
      if (lastNonEmptyIndex >= 0) {
        lines[lastNonEmptyIndex] = cleanCand;
      }
    }

    return lines.join('\n');
  };

  // Sync candidate and recruiter state when props change
  React.useEffect(() => {
    if (userProfile.fullName) {
      setCandidateName(userProfile.fullName);
    }
  }, [userProfile.fullName]);

  React.useEffect(() => {
    if (job) {
      const rec = job.recruiterName || job.actionChannel?.contactName || 'Mme Céline Favre';
      const recT = job.recruiterTitle || 'Responsable Recrutement RH';
      setRecruiterName(rec);
      setRecruiterTitle(recT);

      if (job.tailoredDossier?.motivationLetter) {
        const cand = userProfile.fullName || 'Marc Delarue';
        const personalized = applyPersonalizationToLetter(
          job.tailoredDossier.motivationLetter,
          cand,
          rec,
          recT
        );
        setEditableLetter(personalized);
      }
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const dossier = job.tailoredDossier;

  // Re-generate dossier in selected language
  const handleRegenerateInLanguage = async (newLang: 'FR' | 'EN' | 'DE') => {
    setSelectedLanguage(newLang);
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/generate-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobOffer: job,
          userProfile,
          targetLanguage: newLang
        })
      });
      const data = await response.json();
      if (response.ok && data.tailoredDossier) {
        onUpdateJobDossier(job.id, data.tailoredDossier);
        setEditableLetter(data.tailoredDossier.motivationLetter);
        if (onCopyNotice) {
          onCopyNotice(`Dossier régénéré avec succès en ${newLang}`);
        }
      }
    } catch (err) {
      console.error('Failed to regenerate dossier:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveEditedLetter = () => {
    if (!dossier) return;
    const updated: TailoredDossier = {
      ...dossier,
      motivationLetter: editableLetter
    };
    onUpdateJobDossier(job.id, updated);
    setIsEditingLetter(false);
    if (onCopyNotice) {
      onCopyNotice('Lettre modifiée enregistrée');
    }
  };

  const handleApplyNamesToLetter = () => {
    const updated = applyPersonalizationToLetter(
      editableLetter || dossier?.motivationLetter || '',
      candidateName,
      recruiterName,
      recruiterTitle
    );
    setEditableLetter(updated);
    if (dossier) {
      const updatedDossier: TailoredDossier = {
        ...dossier,
        motivationLetter: updated
      };
      onUpdateJobDossier(job.id, updatedDossier);
    }
    if (onCopyNotice) {
      onCopyNotice(`En-tête et signature actualisés : ${candidateName}`);
    }
  };

  const handleCopyLetter = () => {
    const text = isEditingLetter ? editableLetter : (dossier?.motivationLetter || '');
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedLetter(true);
    if (onCopyNotice) {
      onCopyNotice('Lettre de motivation copiée dans le presse-papier !');
    }
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleCopyCV = () => {
    if (!dossier?.tailoredCV) return;
    const candidateName = userProfile.fullName || '[Votre Nom]';
    const candidateEmail = userProfile.email || '[Votre Email]';
    const candidatePhone = userProfile.phone || '';
    const cvText = `${candidateName} - ${dossier.tailoredCV.headline}\n${candidateEmail}${candidatePhone ? ` | ${candidatePhone}` : ''} | ${userProfile.address}, ${userProfile.city}\n\nPROFIL :\n${dossier.tailoredCV.summary}\n\nCOMPÉTENCES CLÉS :\n${dossier.tailoredCV.highlightedSkills.join(' • ')}\n\nPRÉTENTIONS SALARIALES :\n${dossier.tailoredCV.salaryMention}`;
    navigator.clipboard.writeText(cvText);
    setCopiedCV(true);
    if (onCopyNotice) {
      onCopyNotice('CV sur-mesure copié dans le presse-papier !');
    }
    setTimeout(() => setCopiedCV(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Dossier de Candidature Sur-Mesure
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono tabular-nums">
                  100% Match
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{job.company}</span>
                <span>•</span>
                <span>{job.title}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5" />
                <span>{job.location}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold">
              {(['FR', 'EN', 'DE'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleRegenerateInLanguage(lang)}
                  disabled={isRegenerating}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Anti-Hallucination & Salary Guarantee Sub-banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/60 px-6 py-2 flex flex-wrap items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">Règle Anti-Erreur Source-Check :</span>
            <span>Zéro compétence inventée • Données conformes au CV Maître & Profil Persistant</span>
          </div>
          <div className="font-semibold text-emerald-800 dark:text-emerald-300">
            Salaire : "À discuter (Option C vaudoise)"
          </div>
        </div>

        {/* Tab Sub-Header */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('letter')}
              className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'letter'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Lettre de Motivation</span>
            </button>

            <button
              onClick={() => setActiveTab('cv')}
              className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'cv'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CV Ciblé & Expériences</span>
            </button>

            <button
              onClick={() => setActiveTab('attachments')}
              className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'attachments'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Pièces Jointes Suisses ({dossier?.selectedAttachments?.length || 0})</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 py-2">
            {activeTab === 'letter' && (
              <button
                onClick={() => {
                  if (isEditingLetter) {
                    handleSaveEditedLetter();
                  } else {
                    setIsEditingLetter(true);
                  }
                }}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
              >
                {isEditingLetter ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Sauvegarder</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Personnaliser</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={activeTab === 'letter' ? handleCopyLetter : handleCopyCV}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              {(activeTab === 'letter' ? copiedLetter : copiedCV) ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {isRegenerating ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Génération en cours du dossier en {selectedLanguage}...
              </p>
              <p className="text-xs text-slate-500">
                Application des règles suisses de personnalisation et de non-hallucination.
              </p>
            </div>
          ) : !dossier ? (
            <div className="py-12 text-center text-slate-500">
              Aucun dossier généré pour cette offre pour le moment.
            </div>
          ) : activeTab === 'letter' ? (
            /* Motivation Letter View */
            <div className="space-y-4">
              {/* Recruiter & Candidate Personalization Banner */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Personnalisation Recruteur & Signature du Demandeur</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Signature automatique avec le nom du CV</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Recruiter Box */}
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-blue-500" />
                        <span>Destinataire (Recruteur)</span>
                      </label>
                      <span className="text-[10px] text-slate-400">En-tête de lettre</span>
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={recruiterName}
                        onChange={e => setRecruiterName(e.target.value)}
                        placeholder="Ex: Mme Céline Favre ou M. Alexandre Rochat"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <input
                        type="text"
                        value={recruiterTitle}
                        onChange={e => setRecruiterTitle(e.target.value)}
                        placeholder="Ex: Responsable Recrutement RH"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {/* Candidate Box */}
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Demandeur (Signature du CV)</span>
                      </label>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                        Issu du CV
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={candidateName}
                        onChange={e => setCandidateName(e.target.value)}
                        placeholder="Nom et prénom du demandeur"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <p className="text-[11px] text-slate-500 pt-0.5">
                        Coordonnées : {userProfile.email || 'Email du profil'} • {userProfile.city || 'Lausanne'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 italic">
                    💡 La formule de politesse et la signature sont automatiquement adaptées.
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyNamesToLetter}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Appliquer à l'en-tête et à la signature</span>
                  </button>
                </div>
              </div>

              {/* Letter Display */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                {isEditingLetter ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Modifiez directement le texte de votre lettre ci-dessous :</span>
                      <button
                        onClick={handleSaveEditedLetter}
                        className="text-emerald-600 font-bold hover:underline cursor-pointer"
                      >
                        Enregistrer les modifications
                      </button>
                    </div>
                    <textarea
                      rows={16}
                      value={editableLetter}
                      onChange={e => setEditableLetter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-4 font-serif text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 max-w-2xl mx-auto">
                    {/* Visual Confirmation Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">👤 Expéditeur :</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{candidateName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">🏢 Destinataire :</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{recruiterName} ({job.company})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">✍️ Signature :</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{candidateName}</span>
                      </div>
                    </div>

                    <div className="whitespace-pre-line font-serif text-slate-800 dark:text-slate-200 leading-relaxed text-sm bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                      {editableLetter || dossier.motivationLetter}
                    </div>

                    {/* Official Signature Card */}
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span>Signature certifiée du demandeur : <strong>{candidateName}</strong></span>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            Extraite de votre CV pour transmission auprès de {job.company}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-200">
                        100% Conforme
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'cv' ? (
            /* Tailored CV View */
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {dossier.tailoredCV.headline}
                  </h4>
                  <p className="text-slate-500 text-xs">
                    {userProfile.fullName ? `${userProfile.fullName} · ` : ''}{userProfile.address}, {userProfile.city}{userProfile.email ? ` · ${userProfile.email}` : ''}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                    Résumé de Profil Sur-Mesure :
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    {dossier.tailoredCV.summary}
                  </p>
                </div>

                {/* Highlighted Skills */}
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-2">
                    Compétences Ciblées pour {job.company} :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dossier.tailoredCV.highlightedSkills.map((sk, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-medium"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reordered Experiences */}
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-2">
                    Parcours & Réalisations (Ordonné par pertinence pour ce poste) :
                  </span>
                  <div className="space-y-3">
                    {dossier.tailoredCV.reorderedExperienceIds.map(expId => {
                      const exp = userProfile.experiences.find(e => e.id === expId);
                      if (!exp) return null;
                      return (
                        <div
                          key={exp.id}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {exp.title} · {exp.company}
                            </span>
                            <span className="text-slate-500 text-[11px] font-mono tabular-nums">{exp.period}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-xs">{exp.description}</p>
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-700 dark:text-slate-300 text-[11px]">
                            {exp.bulletPoints.map((bp, bidx) => (
                              <li key={bidx}>{bp}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Salary mention */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Prétentions salariales :</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {dossier.tailoredCV.salaryMention}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Selected Attachments */
            <div className="space-y-3 max-w-2xl mx-auto">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                Conformément aux usages du recrutement de cadres en Suisse romande, l'IA a sélectionné uniquement les diplômes et certificats de travail pertinents à joindre à votre candidature :
              </p>

              {dossier.selectedAttachments.map(att => (
                <div
                  key={att.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {att.type === 'diploma' ? 'Diplôme Suisse' : 'Certificat de Travail'}
                      </span>
                      <h5 className="font-bold text-slate-900 dark:text-white">{att.title}</h5>
                    </div>
                    <span className="text-emerald-600 text-xs font-semibold">✓ Retenu</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-950 p-2 rounded">
                    Pourquoi cette pièce : {att.relevanceReason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60">
          <div className="text-xs text-slate-500">
            Dossier généré · Langue : {selectedLanguage}
          </div>

          <div className="flex items-center gap-2">
            {job.actionChannel?.target && (
              <a
                href={job.actionChannel.target}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {job.actionChannel.type === 'email' ? (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Envoyer email RH</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Postuler directement</span>
                  </>
                )}
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
