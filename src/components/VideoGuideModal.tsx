import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Upload,
  Search,
  HelpCircle,
  FileText,
  Clock,
  ShieldCheck,
  Building,
  MousePointer,
  Send,
  Copy,
  ExternalLink,
  Check,
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';

interface VideoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUploadCV: () => void;
  onOpenAnalyzeJob: () => void;
  onOpenReport: () => void;
}

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  durationSeconds: number;
  icon: React.ElementType;
  badge: string;
  narrative: string;
  actionText: string;
  actionType: 'uploadCV' | 'analyze' | 'report' | 'none';
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: '1. Importer un CV (PDF ou Word)',
    subtitle: 'Glisser-déposer, lecture IA multimodale et extraction du Profil Maître',
    durationSeconds: 22,
    icon: Upload,
    badge: 'Étape Clé',
    narrative: 'Téléversez votre CV (PDF ou Word). L’IA Gemini extrait fidèlement vos coordonnées, compétences, expériences et diplômes pour alimenter votre CV Maître.',
    actionText: 'Importer mon CV maintenant',
    actionType: 'uploadCV'
  },
  {
    id: 2,
    title: '2. Analyser une offre d’emploi',
    subtitle: 'Contrôle 100% : employeur direct, rayon Lausanne 20-30km et nLPD',
    durationSeconds: 24,
    icon: Search,
    badge: 'Filtre Strict',
    narrative: 'Collez l’annonce. Le système valide automatiquement l’entreprise finale directe (rejet des cabinets de placement) et la proximité géographique vaudoise.',
    actionText: 'Tester l’Analyseur d’Offre',
    actionType: 'analyze'
  },
  {
    id: 3,
    title: '3. Arbitrage Option B & Zéro Hallucination',
    subtitle: 'Poser une question ciblée pour intégrer les compétences non listées',
    durationSeconds: 24,
    icon: HelpCircle,
    badge: 'Anti-Hallucination',
    narrative: 'Si un outil n’apparaît pas dans le CV, l’application vous interroge (Option B). Dès votre accord, la compétence est intégrée et le match passe à 100%.',
    actionText: 'Voir le flux Option B',
    actionType: 'none'
  },
  {
    id: 4,
    title: '4. Génération du dossier sur-mesure',
    subtitle: 'CV ordonné, lettre de motivation ciblée & certificats suisses',
    durationSeconds: 22,
    icon: FileText,
    badge: 'Prêt à l’envoi',
    narrative: 'L’IA prépare en un instant un dossier complet : CV adapté rehaussant les projets clés, lettre de motivation suisse personnalisée et pièces jointes.',
    actionText: 'Découvrir un dossier type',
    actionType: 'none'
  },
  {
    id: 5,
    title: '5. Rapport de 8h00 & Envoi WhatsApp',
    subtitle: 'La routine matinale des opportunités prêtes pour transmission',
    durationSeconds: 20,
    icon: Clock,
    badge: 'Routine 8h00',
    narrative: 'Chaque matin à 8h00, le rapport récapitule les opportunités validées. Transmettez-les en un clic via WhatsApp Web ou par email à votre réseau.',
    actionText: 'Consulter le Rapport 8h00',
    actionType: 'report'
  }
];

export const VideoGuideModal: React.FC<VideoGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenUploadCV,
  onOpenAnalyzeJob,
  onOpenReport
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0); // 0 to 100 within current chapter
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentChapter = CHAPTERS[currentChapterIndex];

  // Sound effects generator via Web Audio API (zero dependencies, completely self-contained)
  const playSoundEffect = (type: 'click' | 'success' | 'transition') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'click') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'transition') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // Audio not permitted or suspended by browser
    }
  };

  // Total duration in seconds
  const totalDuration = CHAPTERS.reduce((acc, c) => acc + c.durationSeconds, 0);

  // Total elapsed seconds
  const currentElapsed =
    CHAPTERS.slice(0, currentChapterIndex).reduce((acc, c) => acc + c.durationSeconds, 0) +
    (chapterProgress / 100) * currentChapter.durationSeconds;

  // Main playback loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const intervalTimeMs = 50;
    const increment = (intervalTimeMs / 1000 / currentChapter.durationSeconds) * 100 * playbackSpeed;

    const timer = setInterval(() => {
      setChapterProgress(prev => {
        if (prev + increment >= 100) {
          if (currentChapterIndex < CHAPTERS.length - 1) {
            setCurrentChapterIndex(idx => idx + 1);
            playSoundEffect('transition');
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + increment;
      });
    }, intervalTimeMs);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentChapterIndex, currentChapter.durationSeconds, playbackSpeed]);

  if (!isOpen) return null;

  const handleSeekChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setChapterProgress(0);
    setIsPlaying(true);
    playSoundEffect('transition');
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetElapsedSeconds = clickRatio * totalDuration;

    let accumulated = 0;
    for (let i = 0; i < CHAPTERS.length; i++) {
      const chDuration = CHAPTERS[i].durationSeconds;
      if (accumulated + chDuration >= targetElapsedSeconds) {
        setCurrentChapterIndex(i);
        const remainder = targetElapsedSeconds - accumulated;
        setChapterProgress((remainder / chDuration) * 100);
        setIsPlaying(true);
        playSoundEffect('click');
        return;
      }
      accumulated += chDuration;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleActionClick = (action: string) => {
    onClose();
    if (action === 'uploadCV') onOpenUploadCV();
    else if (action === 'analyze') onOpenAnalyzeJob();
    else if (action === 'report') onOpenReport();
  };

  // Cursor coordinates and action states driven by chapter progress (simulating real human mouse usage)
  const getCursorPosition = () => {
    const p = chapterProgress;
    // Normalized smooth cubic trajectory
    switch (currentChapter.id) {
      case 1: // Upload CV scene
        if (p < 25) return { x: 70 + p * 0.4, y: 15 + p * 0.3, clicking: p > 20 && p < 24 };
        if (p < 55) return { x: 45 + Math.sin(p * 0.2) * 5, y: 48, dragging: true };
        if (p < 80) return { x: 75, y: 78, clicking: p > 72 && p < 76 };
        return { x: 72, y: 84, clicking: p > 92 && p < 96 };
      case 2: // Analyze job scene
        if (p < 30) return { x: 80, y: 14, clicking: p > 24 && p < 28 };
        if (p < 60) return { x: 40 + p * 0.2, y: 45, typing: true };
        return { x: 78, y: 82, clicking: p > 65 && p < 70 };
      case 3: // Option B scene
        if (p < 40) return { x: 30 + p * 0.5, y: 35 };
        if (p < 75) return { x: 45, y: 62, clicking: p > 68 && p < 73 };
        return { x: 78, y: 80, clicking: p > 88 && p < 93 };
      case 4: // Dossier scene
        if (p < 35) return { x: 35 + p * 0.3, y: 22, clicking: p > 28 && p < 32 };
        if (p < 70) return { x: 60, y: 22, clicking: p > 62 && p < 66 };
        return { x: 82, y: 76, clicking: p > 82 && p < 86 };
      case 5: // Report scene
        if (p < 40) return { x: 62, y: 14, clicking: p > 32 && p < 36 };
        return { x: 76, y: 84, clicking: p > 78 && p < 82 };
      default:
        return { x: 50, y: 50 };
    }
  };

  const cursor = getCursorPosition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        ref={containerRef}
        className={`bg-slate-900 w-full max-w-5xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col ${
          isFullscreen ? 'h-screen max-w-none rounded-none' : 'max-h-[94vh]'
        }`}
      >
        {/* Video Player Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-red-600 text-white font-bold text-xs shadow-md">
              <Play className="w-3.5 h-3.5 fill-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Vidéo Démo : Enregistrement de Session Réelle
                </h3>
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  Capture Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Simulation interactive haute fidélité du fonctionnement de Job Matcher en situation réelle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Viewport & Chapters Split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-950">
          {/* Main Visual Screen: High-Fidelity UI Walkthrough */}
          <div className="lg:col-span-8 flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
            {/* Realistic Browser Window Frame */}
            <div className="relative rounded-xl border border-slate-700/80 bg-slate-950 shadow-2xl overflow-hidden aspect-video flex flex-col select-none">
              {/* Virtual Browser Chrome Bar */}
              <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                  </div>
                  <div className="ml-2 bg-slate-950 border border-slate-800 rounded-md px-3 py-0.5 text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>jobmatcher.ch/lausanne/candidature</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {formatTime(currentElapsed)}
                  </span>
                  <span className="text-red-400 font-bold">{currentChapter.badge}</span>
                </div>
              </div>

              {/* Realistic Live Screen Content Container */}
              <div className="flex-1 relative overflow-hidden bg-slate-950 p-4 text-white flex flex-col justify-between font-sans">
                {/* 1. Virtual Top Header Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                      🇨🇭
                    </div>
                    <span className="font-bold text-slate-200">Job Matcher (Lausanne & 20-30km)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                        currentChapter.id === 1 && chapterProgress < 25
                          ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      + Importer CV
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                        currentChapter.id === 2 && chapterProgress < 30
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                          : 'bg-emerald-700/80 text-white'
                      }`}
                    >
                      + Analyser Offre
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                        currentChapter.id === 5
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Rapport 8h00
                    </span>
                  </div>
                </div>

                {/* 2. Dynamic Live Scene Animation */}
                <div className="flex-1 my-auto flex items-center justify-center p-2">
                  {/* SCENE 1 : REAL CV UPLOAD & EXTRACTION */}
                  {currentChapter.id === 1 && (
                    <div className="w-full max-w-md bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-red-400" />
                          <span>Importer votre propre CV (PDF ou Word)</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Glisser-déposer</span>
                      </div>

                      {chapterProgress < 50 ? (
                        <div
                          className={`border-2 border-dashed rounded-lg p-5 text-center transition-all ${
                            chapterProgress > 30
                              ? 'border-emerald-500 bg-emerald-950/20'
                              : 'border-slate-700 bg-slate-950/50'
                          }`}
                        >
                          {chapterProgress > 30 ? (
                            <div className="space-y-1">
                              <FileText className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                              <div className="text-xs font-bold text-emerald-300">
                                CV_Candidat_Chef_de_Projet.pdf
                              </div>
                              <div className="text-[10px] text-slate-400">420 Ko • Prêt pour analyse</div>
                            </div>
                          ) : (
                            <div className="space-y-1 text-slate-400">
                              <Upload className="w-7 h-7 mx-auto text-slate-500" />
                              <div className="text-xs font-medium">Déposez votre fichier PDF ou Word</div>
                            </div>
                          )}
                        </div>
                      ) : chapterProgress < 75 ? (
                        <div className="p-4 rounded-lg bg-slate-950 text-center space-y-2">
                          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                          <div className="text-xs font-bold text-slate-200">
                            Extraction IA multimodale en cours...
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Identification : Compétences, Expériences BCV/Nestlé, Diplôme HEC...
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">Marc Delarue</span>
                            <span className="text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded font-bold">
                              8 ans exp.
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            Chef de Projet Senior IT & Transformation • Lausanne (VD)
                          </p>
                          <div className="flex flex-wrap gap-1 text-[9px] pt-1">
                            <span className="bg-red-950 text-red-300 px-1.5 py-0.5 rounded">PMP</span>
                            <span className="bg-red-950 text-red-300 px-1.5 py-0.5 rounded">Agile Scrum</span>
                            <span className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded">JIRA</span>
                            <span className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded">SAP</span>
                            <span className="bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">Master HEC</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-slate-500 text-[10px]">100% Souverain & Local</span>
                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded font-bold text-white text-[11px] transition-transform ${
                            chapterProgress >= 75
                              ? 'bg-emerald-600 shadow active:scale-95'
                              : 'bg-red-600'
                          }`}
                        >
                          {chapterProgress >= 75 ? '✓ Valider & Activer ce Profil' : 'Analyser mon CV'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCENE 2 : REAL JOB OFFER ANALYSIS */}
                  {currentChapter.id === 2 && (
                    <div className="w-full max-w-lg bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Analyseur d’Opportunité (Périmètre Vaudois)</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">100% Match Filter</span>
                      </div>

                      {chapterProgress < 60 ? (
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-slate-400">Texte de l'offre d'emploi :</div>
                          <div className="bg-slate-950 border border-slate-800 rounded p-2.5 text-[11px] font-mono text-slate-300 h-24 overflow-hidden leading-relaxed">
                            {chapterProgress > 15 ? (
                              <span>
                                EPFL - Direction des Systèmes d'Information<br />
                                Poste : Senior Project Manager Transformation Digitale<br />
                                Lieu : Lausanne / Ecublens (VD) • Taux : 100% CDI<br />
                                Responsabilités : Pilotage de programmes stratégiques, méthodes agiles Scrum/PMP...
                              </span>
                            ) : (
                              <span className="text-slate-600 italic">Saisie du texte en cours...</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-white">EPFL - Senior Project Manager</div>
                              <div className="text-[10px] text-slate-300">Ecublens (5.2 km de Lausanne) • 100% CDI</div>
                            </div>
                            <span className="bg-emerald-500 text-slate-950 font-black px-2 py-1 rounded text-xs">
                              100% MATCH
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>Employeur direct (Pas d'agence)</span>
                            </div>
                            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>Périmètre : &lt; 10 km (Conforme)</span>
                            </div>
                            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>Conforme nLPD Suisse</span>
                            </div>
                            <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>Salaire : Option C (À discuter)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500 text-[10px]">Rejet agences : Hays, Page, Adecco</span>
                        <button
                          type="button"
                          className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded font-bold text-white text-[11px]"
                        >
                          {chapterProgress > 60 ? 'Voir la Fiche Matchée' : 'Lancer l’Analyse 100%'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCENE 3 : OPTION B ARBITRATION */}
                  {currentChapter.id === 3 && (
                    <div className="w-full max-w-lg bg-slate-900 rounded-xl border border-amber-600/70 p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-amber-900/60 pb-1.5">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Arbitrage Option B : Validation sans hallucination</span>
                        </span>
                        <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-bold">
                          Compétence manquante
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                        <div className="text-slate-300 font-medium">
                          « L'offre de la Vaudoise Assurances exige le progiciel <span className="text-amber-400 font-bold">Guidewire PolicyCenter</span>. Avez-vous une expérience assimilable ? »
                        </div>
                        <div
                          className={`p-2.5 rounded border transition-colors cursor-pointer text-[11px] ${
                            chapterProgress > 60
                              ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                              : 'bg-slate-900 border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border border-emerald-500 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
                              ✓
                            </span>
                            <span>Option B : Oui, 18 mois d’expérience en intégration d’outils métiers complexes</span>
                          </div>
                        </div>
                      </div>

                      {chapterProgress > 70 ? (
                        <div className="p-2 rounded bg-emerald-950/50 border border-emerald-600 text-emerald-300 text-[11px] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Compétence mémorisée dans le Profil Maître • Match 100% activé !</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic">
                          L'IA n'invente jamais de compétences. Elle vous interroge et apprend continuellement.
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1 text-[11px]">
                        <button
                          type="button"
                          className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded text-[11px]"
                        >
                          Enregistrer & Matcher à 100%
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCENE 4 : TAILORED DOSSIER GENERATION */}
                  {currentChapter.id === 4 && (
                    <div className="w-full max-w-lg bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>Dossier de Candidature Prêt (3 Volets)</span>
                        </span>
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold ${chapterProgress < 50 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            CV Ciblé
                          </span>
                          <span className={`px-2 py-0.5 rounded font-bold ${chapterProgress >= 50 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            Lettre IA
                          </span>
                        </div>
                      </div>

                      {chapterProgress < 50 ? (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-300 font-bold pb-1 border-b border-slate-800">
                            <span>Curriculum Vitae Ciblé - EPFL</span>
                            <span className="text-[10px] text-emerald-400">Expériences Réordonnées</span>
                          </div>
                          <div className="text-[10px] text-slate-300 space-y-1 font-mono">
                            <div>• 2022-2026 : Senior PM Transformation SI (BCV Place St-François)</div>
                            <div>• 2019-2022 : Project Lead Digital Transformation (Nestlé)</div>
                            <div>• Diplôme : Master of Science HEC Lausanne (Mention Très Bien)</div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px] font-serif leading-relaxed text-slate-200">
                          <div className="text-[10px] font-sans font-bold text-slate-400">
                            À l'attention du Service Recrutement • EPFL Lausanne
                          </div>
                          <p className="italic text-[10px] text-slate-300">
                            « Madame, Monsieur, C’est avec une vive motivation que je vous soumets ma candidature pour le poste de Senior Project Manager. Fort d’un parcours de 8 ans mené en Suisse romande... »
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-sans pt-1 text-emerald-400">
                            <span>✓ Ton suisse sobre & direct</span>
                            <span>✓ Certificats BCV & Nestlé joints</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-slate-500 text-[10px]">Prêt pour envoi officiel</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-[11px] text-slate-200 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copier</span>
                          </button>
                          <button
                            type="button"
                            className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-[11px] text-white font-bold"
                          >
                            Télécharger le Pack
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 5 : MORNING 8H00 REPORT & WHATSAPP TRANSMISSION */}
                  {currentChapter.id === 5 && (
                    <div className="w-full max-w-lg bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Rapport Quotidien de 8h00</span>
                        </span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">
                          08:00 Prêt
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] font-mono text-emerald-300 space-y-1">
                        <div className="font-bold text-white">📋 RAPPORT DE 8H00 - JOB MATCHER LAUSANNE</div>
                        <div>📅 VENDREDI 4 OCTOBRE 2026</div>
                        <div className="pt-1 text-slate-200">
                          ━━━━━━━━━━━━━━━━━━━━━<br />
                          🟢 [Prêt à l'envoi] EPFL - Senior Project Manager IT (100% Match)<br />
                          🟢 [Prêt à l'envoi] Vaudoise Assurances - PM Digital (100% Match)<br />
                          ━━━━━━━━━━━━━━━━━━━━━
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500 text-[10px]">Transmission instantanée</span>
                        <button
                          type="button"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded text-[11px] flex items-center gap-1.5 shadow"
                        >
                          <Send className="w-3 h-3 text-emerald-200" />
                          <span>Transmettre via WhatsApp Web</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Virtual Interactive Mouse Pointer Animation */}
                <div
                  className="absolute pointer-events-none transition-all duration-300 ease-out z-30"
                  style={{
                    left: `${cursor.x}%`,
                    top: `${cursor.y}%`,
                    transform: 'translate(-2px, -2px)'
                  }}
                >
                  <div className="relative">
                    <MousePointer className="w-5 h-5 text-white fill-slate-900 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                    {cursor.clicking && (
                      <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full border-2 border-red-500 animate-ping"></span>
                    )}
                  </div>
                </div>

                {/* 4. Closed Captions / Live Narrative Subtitle */}
                {showCaptions && (
                  <div className="bg-slate-950/95 backdrop-blur-md rounded-lg p-2.5 border border-slate-800 text-center z-10">
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {currentChapter.narrative}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Controls Scrub Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
              {/* Scrubbable Timeline */}
              <div
                onClick={handleTimelineClick}
                className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all"
                title="Cliquer pour naviguer dans la vidéo"
              >
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-75"
                  style={{
                    width: `${((currentElapsed / totalDuration) * 100).toFixed(1)}%`
                  }}
                />
              </div>

              {/* Player Bottom Row */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      playSoundEffect('click');
                    }}
                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md"
                    title={isPlaying ? 'Pause' : 'Lecture'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentChapterIndex(0);
                      setChapterProgress(0);
                      setIsPlaying(true);
                      playSoundEffect('click');
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Recommencer depuis le début"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="font-mono text-slate-400 text-[11px]">
                    <span className="text-white font-semibold">{formatTime(currentElapsed)}</span>
                    <span> / {formatTime(totalDuration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed Switcher */}
                  <button
                    onClick={() => {
                      const speeds = [0.75, 1, 1.25, 1.5];
                      const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                      setPlaybackSpeed(next);
                      playSoundEffect('click');
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono font-bold text-slate-300 cursor-pointer"
                    title="Vitesse de lecture"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Captions Toggle */}
                  <button
                    onClick={() => setShowCaptions(!showCaptions)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      showCaptions
                        ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Sous-titres explicatifs"
                  >
                    CC
                  </button>

                  {/* Sound Toggle */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isMuted ? 'Activer le son (effets sonores de clic et validation)' : 'Couper le son'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chapters List & Quick Action */}
          <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between bg-slate-900/60 overflow-y-auto max-h-[480px] lg:max-h-none space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-200">Scénario de Démonstration ({CHAPTERS.length})</span>
                <span className="text-[10px] text-slate-400 font-mono">Total : {formatTime(totalDuration)}</span>
              </div>

              <div className="space-y-2">
                {CHAPTERS.map((ch, idx) => {
                  const Icon = ch.icon;
                  const isActive = idx === currentChapterIndex;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleSeekChapter(idx)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-red-950/40 border-red-600/80 text-white shadow-md ring-1 ring-red-500/30'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isActive
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs truncate">{ch.title}</h5>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {ch.durationSeconds}s
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {ch.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Micro-progression if active */}
                      {isActive && (
                        <div className="w-full h-1 bg-red-950 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full transition-all duration-75"
                            style={{ width: `${chapterProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Direct CTA */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Tester cette étape en situation réelle :</span>
              </div>
              {currentChapter.actionType !== 'none' ? (
                <button
                  onClick={() => handleActionClick(currentChapter.actionType)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-3 rounded-lg shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{currentChapter.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAnalyzeJob();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Lancer l'application réelle</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
