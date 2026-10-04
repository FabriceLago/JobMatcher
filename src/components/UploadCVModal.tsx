import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';

interface UploadCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (profile: UserProfile) => void;
  currentProfile?: UserProfile;
}

export const UploadCVModal: React.FC<UploadCVModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  currentProfile
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [activeMode, setActiveMode] = useState<'file' | 'text'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<UserProfile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!isValid) {
      setErrorMsg('Format non supporté. Veuillez sélectionner un fichier PDF (.pdf) ou Word (.docx).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Le fichier dépasse la taille maximale autorisée de 20 Mo.');
      return;
    }

    setSelectedFile(file);
    setExtractedProfile(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartParsing = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    setLoadingStep('Lecture et encodage du document...');

    try {
      let fileBase64 = '';
      let fileType = 'text';

      if (activeMode === 'file' && selectedFile) {
        const lower = selectedFile.name.toLowerCase();
        if (lower.endsWith('.pdf')) fileType = 'pdf';
        else if (lower.endsWith('.docx')) fileType = 'docx';
        else if (lower.endsWith('.doc')) fileType = 'docx';

        setLoadingStep('Extraction du document en cours...');
        const buffer = await selectedFile.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        fileBase64 = btoa(binary);
      }

      setLoadingStep('Analyse IA : structuration du Profil Maître suisse...');

      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64,
          fileName: selectedFile?.name || 'CV_Candidat',
          fileType,
          rawText: activeMode === 'text' ? rawText : undefined
        })
      });

      if (!res.ok) {
        throw new Error('Échec de la lecture du fichier par le serveur.');
      }

      const data = await res.json();
      if (data.profile) {
        setExtractedProfile(data.profile);
      } else {
        throw new Error('Données de profil introuvables.');
      }
    } catch (err: any) {
      console.error('Error during CV parsing:', err);
      setErrorMsg(err.message || 'Une erreur est survenue lors de l’analyse du CV.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleConfirmProfile = () => {
    if (extractedProfile) {
      onProfileUpdated(extractedProfile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 border-b border-red-800/40 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Import de CV Personnalisé</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Importer votre propre CV (PDF ou Word)
            </h3>
            <p className="text-xs text-slate-300 max-w-lg">
              Téléversez votre curriculum vitae. L'intelligence extrait fidèlement vos coordonnées, compétences, expériences et diplômes pour calibrer le matching et vos dossiers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Switcher */}
          {!extractedProfile && (
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setActiveMode('file')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeMode === 'file'
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Fichier PDF ou Word (.docx)
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('text')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeMode === 'text'
                    ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Copier-Coller le texte du CV
              </button>
            </div>
          )}

          {/* File Upload Zone */}
          {!extractedProfile && activeMode === 'file' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {selectedFile.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} Ko • Prêt pour l'extraction
                    </p>
                  </div>
                  <span className="text-[11px] text-red-600 dark:text-red-400 hover:underline inline-block">
                    Cliquer pour changer de fichier
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Glissez-déposez votre CV ici
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Formats acceptés : <strong>PDF (.pdf)</strong> ou <strong>Word (.docx)</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Parcourir les fichiers
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Textarea Mode */}
          {!extractedProfile && activeMode === 'text' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Collez l'intégralité du texte de votre CV :
              </label>
              <textarea
                rows={8}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Exemple : Jean Dupont - Ingénieur Logiciel / Responsable Marketing / Comptable - 5 ans d'expérience - Compétences clés..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          )}

          {/* RGPD Guarantee Banner */}
          {!extractedProfile && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Confidentialité & RGPD :</strong> Votre document est traité localement et sert exclusivement à paramétrer votre compte dans ce navigateur. Aucune donnée n'est revendue.
              </span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {loadingStep || 'Lecture du document en cours...'}
              </h4>
              <p className="text-xs text-slate-500">
                Identification automatique des compétences, de l'historique et des certifications suisses...
              </p>
            </div>
          )}

          {/* Extracted Profile Preview */}
          {extractedProfile && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">CV analysé et structuré avec succès !</span>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Vérifiez les données extraites ci-dessous avant d'activer votre Profil Maître.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExtractedProfile(null)}
                  className="text-[11px] font-semibold underline text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
                >
                  Changer de fichier
                </button>
              </div>

              {/* Identity & Headline Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {extractedProfile.fullName || 'Nom non détecté'}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      {extractedProfile.jobTitle || 'Métier / Spécialité'}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      📍 {extractedProfile.city || 'Lausanne'} ({extractedProfile.canton || 'VD'}) • ✉️ {extractedProfile.email || 'Email non spécifié'} • 📞 {extractedProfile.phone || 'Téléphone non spécifié'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {extractedProfile.yearsOfExperience} ans d'expérience
                    </span>
                  </div>
                </div>

                {extractedProfile.summary && (
                  <p className="text-slate-600 dark:text-slate-300 italic pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    "{extractedProfile.summary}"
                  </p>
                )}
              </div>

              {/* Skills Preview */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>Compétences & Outils détectés</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {extractedProfile.skills.methodologies.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-medium">
                      {m}
                    </span>
                  ))}
                  {extractedProfile.skills.tools.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-medium">
                      {t}
                    </span>
                  ))}
                  {extractedProfile.skills.management.map((mgmt, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                      {mgmt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experiences & Diplomas Count */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                  <Briefcase className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-100">
                      {extractedProfile.experiences.length} Expériences extraites
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {extractedProfile.experiences[0]?.company || 'Parcours pro'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-purple-500 shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-100">
                      {extractedProfile.diplomas.length} Formations / Diplômes
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {extractedProfile.diplomas[0]?.title || 'Cursus académique'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Fermer
          </button>

          {!extractedProfile ? (
            <button
              type="button"
              disabled={isLoading || (activeMode === 'file' ? !selectedFile : !rawText.trim())}
              onClick={handleStartParsing}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyser mon CV</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmProfile}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider & Activer ce Profil Maître</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
