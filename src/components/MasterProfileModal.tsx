import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Briefcase,
  Award,
  BookOpen,
  Sparkles,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Building,
  FileText
} from 'lucide-react';
import { UserProfile, LearnedSkill } from '../types';

interface MasterProfileModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenUploadCV?: () => void;
}

export const MasterProfileModal: React.FC<MasterProfileModalProps> = ({
  userProfile,
  onUpdateProfile,
  onOpenUploadCV
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [newSkillText, setNewSkillText] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'methodologies' | 'tools' | 'management'>('tools');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  const handleSave = () => {
    onUpdateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddSkill = () => {
    if (!newSkillText.trim()) return;
    const category = newSkillCategory;
    const currentList = profile.skills[category];
    if (!currentList.includes(newSkillText.trim())) {
      const updated = {
        ...profile,
        skills: {
          ...profile.skills,
          [category]: [...currentList, newSkillText.trim()]
        }
      };
      setProfile(updated);
      onUpdateProfile(updated);
      setNewSkillText('');
    }
  };

  const handleRemoveSkill = (category: 'methodologies' | 'tools' | 'management', skillName: string) => {
    const updated = {
      ...profile,
      skills: {
        ...profile.skills,
        [category]: profile.skills[category].filter(s => s !== skillName)
      }
    };
    setProfile(updated);
    onUpdateProfile(updated);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cv-maitre-lausanne-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/80 shadow-md text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-red-600/30 border border-red-500/40 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-semibold mb-1">
              <span>🇨🇭</span>
              <span>CV Maître & Profil Persistant (Lausanne)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Référentiel Unique & Source de Vérité
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Toutes les analyses et générations de dossiers s'appuient strictement sur ce CV Maître. Conformément à la règle anti-hallucination <strong className="text-white">Source-Check</strong>, aucun outil non présent ici ne peut être inventé.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Exporter une sauvegarde du profil en JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exporter JSON</span>
            </button>
            <button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedSuccess ? 'Enregistré !' : 'Enregistrer le Profil'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card: Uploaded CV Status */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            profile.hasCvUploaded
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {profile.hasCvUploaded ? (profile.cvFileName || 'CV Importé') : 'Aucun fichier CV importé'}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                profile.hasCvUploaded
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {profile.hasCvUploaded ? 'Document Actif' : 'En attente'}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {profile.hasCvUploaded
                ? `Téléversé le ${new Date(profile.cvUploadedAt || Date.now()).toLocaleDateString('fr-CH')} • Sert de base au matching et aux dossiers`
                : 'Importez votre propre CV (PDF ou Word) pour extraire automatiquement votre profil et vos compétences.'}
            </p>
          </div>
        </div>

        {onOpenUploadCV && (
          <button
            type="button"
            onClick={onOpenUploadCV}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{profile.hasCvUploaded ? 'Remplacer le CV (PDF/Word)' : 'Importer mon CV (PDF/Word)'}</span>
          </button>
        )}
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal info & Strict criteria settings */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card: Identity & Legal */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <User className="w-4 h-4 text-blue-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Identité & Statut Juridique Suisse
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Nom complet :</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Votre prénom et nom"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Titre de poste cible :</label>
                <input
                  type="text"
                  value={profile.jobTitle}
                  onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Email :</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    placeholder="votre.email@domaine.ch"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Téléphone :</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+41 79 123 45 67"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Adresse à Lausanne :</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Nationalité & Permis */}
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Nationalité & Permis de séjour :
                </label>
                <select
                  value={profile.nationalityStatus}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      nationalityStatus: e.target.value as any,
                      nationalityLabel:
                        e.target.value === 'swiss'
                          ? 'Nationalité Suisse (Aucune restriction)'
                          : e.target.value === 'permit_c'
                          ? 'Permis C (Établissement permanent en Suisse)'
                          : 'Permis B (Séjour avec autorisation de travail)'
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100"
                >
                  <option value="permit_c">Permis C (Établissement suisse)</option>
                  <option value="swiss">Nationalité Suisse</option>
                  <option value="permit_b">Permis B (Autorisation de travail)</option>
                  <option value="eu_efta">Ressortissant UE/AELE</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  Utilisé pour le filtre juridique éliminant automatiquement les postes exigeant la citoyenneté suisse exclusive (ex: fedpol, armée).
                </p>
              </div>
            </div>
          </div>

          {/* Card: Lausanne Search Criteria */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-red-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Périmètre & Préférences Contractuelles
              </h4>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Rayon max (km) :</label>
                  <input
                    type="number"
                    value={profile.maxCommuteKm}
                    onChange={e => setProfile({ ...profile, maxCommuteKm: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Expérience (ans) :</label>
                  <input
                    type="number"
                    value={profile.yearsOfExperience}
                    onChange={e => setProfile({ ...profile, yearsOfExperience: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Taux d'activité souhaité :</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={profile.activityRateMin}
                    onChange={e => setProfile({ ...profile, activityRateMin: Number(e.target.value) })}
                    className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100"
                  />
                  <span>% à</span>
                  <input
                    type="number"
                    value={profile.activityRateMax}
                    onChange={e => setProfile({ ...profile, activityRateMax: Number(e.target.value) })}
                    className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100"
                  />
                  <span>%</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Posture Salariale (Règle suisse #5) :
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.salaryPosture}
                  className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 italic"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Verrouillé sur l'Option C ("À discuter") conformément au standard vaudois.
                </p>
              </div>
            </div>
          </div>

          {/* Card: RGPD & nLPD Control Instruction */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Instruction de Contrôle RGPD / nLPD Suisse
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Légal Conforme
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Paramètres de conformité au <strong>Règlement Général sur la Protection des Données (RGPD UE)</strong> et à la <strong>Loi fédérale sur la Protection des Données (nLPD Suisse)</strong> régissant l'analyse des annonces et vos données personnelles.
            </p>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.rgpdSettings?.enabled ?? true}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      rgpdSettings: {
                        ...(profile.rgpdSettings || {
                          enabled: true,
                          blockIllegalDataRequests: true,
                          localSovereigntyConsent: true,
                          anonymizeDirectContacts: false
                        }),
                        enabled: e.target.checked
                      }
                    })
                  }
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Activer le contrôle systématique RGPD & nLPD sur chaque offre
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Vérifie que l'annonce respecte le principe de proportionnalité et ne conditionne pas la postulation à des données abusives.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.rgpdSettings?.blockIllegalDataRequests ?? true}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      rgpdSettings: {
                        ...(profile.rgpdSettings || {
                          enabled: true,
                          blockIllegalDataRequests: true,
                          localSovereigntyConsent: true,
                          anonymizeDirectContacts: false
                        }),
                        blockIllegalDataRequests: e.target.checked
                      }
                    })
                  }
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Alerter / rejeter les collectes sensibles illégitimes (Art. 9 RGPD / Art. 5 nLPD)
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Détecte les demandes abusives préalables : extrait de casier judiciaire sans impératif de sécurité, certificat médical d'embauche, situation de famille ou numéro AVS.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.rgpdSettings?.localSovereigntyConsent ?? true}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      rgpdSettings: {
                        ...(profile.rgpdSettings || {
                          enabled: true,
                          blockIllegalDataRequests: true,
                          localSovereigntyConsent: true,
                          anonymizeDirectContacts: false
                        }),
                        localSovereigntyConsent: e.target.checked
                      }
                    })
                  }
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Souveraineté des données 100% locale (Privacy by Design)
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Toutes vos informations sont stockées exclusivement sur votre navigateur. Aucun traceur tiers, aucune revente ni fuite vers des tiers.
                  </span>
                </div>
              </label>
            </div>

            {/* RGPD User Rights Buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Exercice de vos droits RGPD :</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold underline cursor-pointer"
                  title="Télécharger l'intégralité de vos données personnelles (Art. 20 RGPD)"
                >
                  Portabilité (Art. 20)
                </button>
                <span className="text-slate-400">·</span>
                {confirmPurge ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-800">
                    <span>Confirmer la purge ?</span>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="px-1.5 py-0.2 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] cursor-pointer"
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmPurge(false)}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-[10px] cursor-pointer"
                    >
                      Non
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmPurge(true)}
                    className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold underline cursor-pointer"
                    title="Droit à l'effacement définitif de toutes les données du navigateur (Art. 17 RGPD)"
                  >
                    Droit à l'oubli (Art. 17)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills, Swiss Certificates & Diplomas */}
        <div className="lg:col-span-7 space-y-5">
          {/* Skills Management */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Compétences & Outils du CV Maître
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Source de Vérité</span>
            </div>

            {/* Add new skill form */}
            <div className="flex items-center gap-2">
              <select
                value={newSkillCategory}
                onChange={e => setNewSkillCategory(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 text-xs"
              >
                <option value="methodologies">Méthodologie</option>
                <option value="tools">Outil / Logiciel</option>
                <option value="management">Management</option>
              </select>

              <input
                type="text"
                value={newSkillText}
                onChange={e => setNewSkillText(e.target.value)}
                placeholder="Ex: Prince2, SAFe, SAP, Guidewire, Azure..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-red-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddSkill();
                }}
              />

              <button
                onClick={handleAddSkill}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            {/* Category: Methodologies */}
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                Méthodologies & Gouvernance :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.methodologies.map((m, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px]"
                  >
                    <span>{m}</span>
                    <button
                      onClick={() => handleRemoveSkill('methodologies', m)}
                      className="text-slate-400 hover:text-rose-500 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Category: Tools */}
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                Outils & Logiciels Maîtrisés :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.tools.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[11px]"
                  >
                    <span>{t}</span>
                    <button
                      onClick={() => handleRemoveSkill('tools', t)}
                      className="text-blue-400 hover:text-rose-500 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                Langues :
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.skills.languages.map((lang, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px]"
                  >
                    <strong>{lang.name}</strong> : {lang.level}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Swiss Work Certificates */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Certificats de Travail Suisses Disponibles
              </h4>
            </div>

            <div className="space-y-2">
              {profile.swissCertificates.map(cert => (
                <div
                  key={cert.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>{cert.company}</span>
                    <span className="text-slate-500 text-[10px]">{cert.period}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] italic">
                    Appréciation : "{cert.rating}"
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    Signataire : {cert.signatory}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
