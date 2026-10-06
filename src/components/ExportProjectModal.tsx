import React, { useState } from 'react';
import {
  X,
  Download,
  FolderArchive,
  Terminal,
  CheckCircle,
  Copy,
  Check,
  HardDrive,
  Info,
  FolderCheck,
  ExternalLink
} from 'lucide-react';

interface ExportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyNotice?: (text: string) => void;
}

export const ExportProjectModal: React.FC<ExportProjectModalProps> = ({
  isOpen,
  onClose,
  onCopyNotice
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  if (!isOpen) return null;

  const targetPath = `C:\\Users\\fabri\\Desktop\\Coursera\\SaaS_Coursea`;
  const powershellCmd = `Expand-Archive -Path "$HOME\\Downloads\\SaaS_Coursea_JobMatcher_Swiss.zip" -DestinationPath "${targetPath}" -Force`;

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    // Trigger download via invisible anchor
    const link = document.createElement('a');
    link.href = '/api/export-project';
    link.download = 'SaaS_Coursea_JobMatcher_Swiss.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      if (onCopyNotice) {
        onCopyNotice('Archive ZIP téléchargée ! Prête pour votre dossier Windows.');
      }
    }, 1500);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(powershellCmd);
    setCopiedCmd(true);
    if (onCopyNotice) {
      onCopyNotice('Commande PowerShell copiée dans le presse-papier !');
    }
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(targetPath);
    setCopiedPath(true);
    if (onCopyNotice) {
      onCopyNotice('Chemin Windows copié !');
    }
    setTimeout(() => setCopiedPath(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 dark:bg-red-600/20 text-red-600 flex items-center justify-center font-bold">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Exporter tous les fichiers vers Windows
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Copie complète du code source vers votre dossier Coursera
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Target Folder Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-blue-500" />
                <span>Dossier Windows de destination :</span>
              </span>
              <button
                onClick={handleCopyPath}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPath ? 'Copié' : 'Copier chemin'}</span>
              </button>
            </div>
            <div className="font-mono text-xs bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-red-600 dark:text-red-400 font-bold select-all break-all">
              {targetPath}
            </div>
          </div>

          {/* Download Action Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-slate-900 border border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                <FolderCheck className="w-4 h-4 text-red-600" />
                <span>Archive ZIP complète (Code source)</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Inclut <code className="bg-red-100 dark:bg-red-950/80 px-1 rounded">src/</code>, <code className="bg-red-100 dark:bg-red-950/80 px-1 rounded">server.ts</code>, <code className="bg-red-100 dark:bg-red-950/80 px-1 rounded">package.json</code>, tous les composants et instructions.
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto shrink-0 bg-red-600 hover:bg-red-500 disabled:bg-slate-400 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDownloading ? (
                <span>Génération du ZIP...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger l'archive ZIP</span>
                </>
              )}
            </button>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Téléchargement lancé ! Vous pouvez maintenant extraire le fichier dans votre dossier Windows.
              </span>
            </div>
          )}

          {/* Fast PowerShell Extraction Command */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span>Extraction automatique en 1 clic (PowerShell Windows) :</span>
              </span>
              <button
                onClick={handleCopyCommand}
                className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd ? 'Copié !' : 'Copier la commande'}</span>
              </button>
            </div>
            <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800 relative group overflow-x-auto">
              <code>{powershellCmd}</code>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              Collez cette ligne dans PowerShell pour décompresser automatiquement l'archive dans <span className="font-semibold">{targetPath}</span>.
            </p>
          </div>

          {/* Steps summary */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-slate-600 dark:text-slate-400">
            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
              Guide d'installation local (Node.js) :
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>Ouvrez un terminal dans <code className="text-red-500">C:\Users\fabri\Desktop\Coursera\SaaS_Coursea</code></li>
              <li>Exécutez <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">npm install</code> pour installer les dépendances</li>
              <li>Lancez l'application avec <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">npm run dev</code></li>
              <li>Ouvrez votre navigateur sur <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">http://localhost:3000</code></li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
