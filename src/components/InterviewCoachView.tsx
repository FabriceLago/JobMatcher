import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Building,
  MapPin,
  Calendar,
  Send,
  Loader2,
  Download,
  BookOpen,
  Check,
  ChevronRight,
  ShieldCheck,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';
import jsPDF from 'jspdf';
import { JobOffer, UserProfile } from '../types';

interface InterviewCoachViewProps {
  jobs: JobOffer[];
  userProfile: UserProfile;
  onOpenDossier: (job: JobOffer) => void;
  onCopyNotice?: (text: string) => void;
}

interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  intent: string;
  tip: string;
}

interface AnswerFeedback {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export const InterviewCoachView: React.FC<InterviewCoachViewProps> = ({
  jobs,
  userProfile,
  onOpenDossier,
  onCopyNotice
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, AnswerFeedback>>({});
  const [activeSection, setActiveSection] = useState<'simulator' | 'kpis' | 'cheatsheet'>('simulator');

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Pipeline metrics
  const totalJobs = jobs.length;
  const readyJobs = jobs.filter(j => j.status === 'ready_to_send').length;
  const appliedJobs = jobs.filter(j => j.status === 'applied').length;
  const optionBJobs = jobs.filter(j => j.status === 'waiting_info').length;

  // Load questions when selected job changes
  useEffect(() => {
    if (!selectedJob) return;

    setIsLoadingQuestions(true);
    setFeedback(null);
    setCandidateAnswer('');

    fetch('/api/interview-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobOffer: selectedJob,
        userProfile,
        action: 'generate_questions'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setActiveQuestionIndex(0);
        }
      })
      .catch(err => {
        console.error('Error fetching interview questions:', err);
      })
      .finally(() => {
        setIsLoadingQuestions(false);
      });
  }, [selectedJobId]);

  const activeQuestion = questions[activeQuestionIndex];

  // Evaluate candidate answer with AI
  const handleEvaluate = async () => {
    if (!candidateAnswer.trim() || !activeQuestion) return;

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/interview-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobOffer: selectedJob,
          userProfile,
          question: activeQuestion.question,
          candidateAnswer,
          action: 'evaluate'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const result: AnswerFeedback = {
          score: data.score,
          verdict: data.verdict,
          strengths: data.strengths,
          improvements: data.improvements,
          modelAnswer: data.modelAnswer
        };
        setFeedback(result);
        setCompletedQuestions(prev => ({
          ...prev,
          [activeQuestion.id]: result
        }));
        if (onCopyNotice) {
          onCopyNotice(`Réponse analysée : Score ${data.score}/100 !`);
        }
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Show Model Answer directly
  const handleShowModelAnswer = () => {
    if (!activeQuestion) return;
    const defaultModel = `Dans cette situation, ma priorité est de privilégier l'écoute active et la recherche d'un consensus factuel. Je réunis les parties prenantes autour d'objectifs partagés, ce qui permet d'aboutir à un compromis constructif et pérenne pour ${selectedJob?.company || 'l\'organisation'}.`;
    setCandidateAnswer(defaultModel);
    handleEvaluate();
  };

  // Export Cheat Sheet PDF
  const handleExportCheatSheetPdf = () => {
    if (!selectedJob) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header Banner
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 34, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('FICHE DE PRÉPARATION D\'ENTRETIEN SUISSE', margin, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(239, 68, 68); // Red-500
    doc.text(`Candidat : ${userProfile.fullName || 'Marc Delarue'} • Entreprise : ${selectedJob.company}`, margin, 20);

    doc.setTextColor(203, 213, 225);
    doc.text(`Poste : ${selectedJob.title} • Lieu : ${selectedJob.location} (Suisse)`, margin, 26);

    y = 42;

    // 1. Posture Salariale Suisse (Option C)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. POSTURE SALARIALE VAUDOISE (OPTION C)', margin, y);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 1.5, margin + 45, y + 1.5);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const postureText =
      'Formule recommandée : "Mes prétentions s\'inscrivent dans la grille de référence pour ce niveau de responsabilités à Lausanne. Mon objectif prioritaire est la valeur mutuelle du projet ; je suis totalement ouvert à la discussion sur le package global."';
    const wrappedPosture = doc.splitTextToSize(postureText, contentWidth);
    doc.text(wrappedPosture, margin, y);
    y += wrappedPosture.length * 4.2 + 6;

    // 2. Questions & Réponses Modèles
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. QUESTIONS CLÉS DU RECRUTEUR & FORMULATIONS VAUDOISES', margin, y);
    doc.line(margin, y + 1.5, margin + 45, y + 1.5);
    y += 7;

    questions.forEach((q, idx) => {
      if (y > 250) {
        doc.addPage();
        y = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Q${idx + 1} (${q.category}) : ${q.question}`, margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Attente RH : ${q.intent}`, margin, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9); // Amber-700
      doc.text(`Conseil d'or : ${q.tip}`, margin, y);
      y += 6;
    });

    // 3. Points d'ancrage local à Lausanne
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. RAPPELS CULTURELS POUR LAUSANNE & VAUD', margin, y);
    doc.line(margin, y + 1.5, margin + 45, y + 1.5);
    y += 6;

    const reminders = [
      '• Esprit de consensus : valoriser la consultation et le dialogue inter-services.',
      '• Discrétion et ponctualité helvétique : arriver 5 à 10 minutes à l\'avance.',
      '• Clarté factuelle : privilégier les résultats chiffrés et la rigueur d\'exécution.',
      '• Absence de comparaison agressive : valoriser votre apport sans dénigrer la concurrence.'
    ];

    reminders.forEach(r => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(r, margin, y);
      y += 4.5;
    });

    const fileName = `CheatSheet_Entretien_${selectedJob.company.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    if (onCopyNotice) {
      onCopyNotice('Fiche d\'entretien téléchargée en PDF !');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Banner: Swiss Coaching & Interview Prep */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-red-800/60 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-900/60 border border-red-700/60 text-red-200 text-xs px-3 py-1 rounded-full font-semibold">
              <Award className="w-3.5 h-3.5 text-red-400" />
              <span>Étape 6 : Simulateur d'Entretien Suisse & Pipeline KPI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>Coaching & Entraînement RH Vaudois</span>
              <span className="text-xs bg-red-950 text-red-300 border border-red-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                100% Spécifique Suisse
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Préparez vos entretiens d'embauche auprès des entreprises directes vaudoises : culture du consensus, négociation salariale (Option C), questions pièges et simulateur d'entretien avec feedback IA instantané.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleExportCheatSheetPdf}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger la Fiche PDF (Cheat Sheet)</span>
            </button>
          </div>
        </div>

        {/* Executive Conversion Pipeline */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">1. Offres Ingestion</span>
            <span className="text-base font-bold text-white mt-0.5 block">{totalJobs} opportunités</span>
            <span className="text-[10px] text-emerald-400 mt-1 block">Lausanne (20-30km)</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">2. Dossiers Prêts (100%)</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">{readyJobs} dossiers</span>
            <span className="text-[10px] text-slate-400 mt-1 block">CV & Lettre signée</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">3. Candidatures Postulées</span>
            <span className="text-base font-bold text-blue-400 mt-0.5 block">{appliedJobs} transmises</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Suivi & Relances J+7</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">4. Taux de Réponse Estimé</span>
            <span className="text-base font-bold text-amber-400 mt-0.5 block">24% - 32%</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Employeurs directs suisses</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSection('simulator')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSection === 'simulator'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Simulateur d'Entretien IA</span>
        </button>

        <button
          onClick={() => setActiveSection('cheatsheet')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSection === 'cheatsheet'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Codes Culturels Suisses (Cheat Sheet)</span>
        </button>

        <button
          onClick={() => setActiveSection('kpis')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeSection === 'kpis'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tableau de Bord KPI & Délais RH</span>
        </button>
      </div>

      {/* SECTION 1: INTERVIEW SIMULATOR */}
      {activeSection === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Target Job Selector & Questions List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Sélectionner l'Entreprise Cible :
              </label>
              <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
              >
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.company} • {job.title.slice(0, 32)}
                  </option>
                ))}
              </select>

              {selectedJob && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-400 space-y-1">
                  <div className="font-bold text-slate-200">{selectedJob.title}</div>
                  <div className="text-[11px]">🏢 {selectedJob.company} • 📍 {selectedJob.location}</div>
                  {selectedJob.recruiterName && (
                    <div className="text-[11px] text-blue-400 font-medium">
                      👤 Recruteur : {selectedJob.recruiterName}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Questions Steps */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Questions d'Entretien ({questions.length})
                </span>
                <span className="text-[11px] text-emerald-500 font-medium">
                  {Object.keys(completedQuestions).length} complétée(s)
                </span>
              </div>

              {isLoadingQuestions ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-red-500" />
                  <p>Génération des questions ciblées pour {selectedJob?.company}...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {questions.map((q, idx) => {
                    const isCompleted = !!completedQuestions[q.id];
                    const isSelected = activeQuestionIndex === idx;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setActiveQuestionIndex(idx);
                          setCandidateAnswer('');
                          setFeedback(completedQuestions[q.id] || null);
                        }}
                        className={`w-full text-left p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-slate-900 dark:text-white font-bold'
                            : isCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-800/40 text-slate-700 dark:text-slate-300 font-medium'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Q{idx + 1} • {q.category}
                          </div>
                          <div className="line-clamp-1">{q.question}</div>
                        </div>

                        <div className="shrink-0">
                          {isCompleted ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Question Card & Answering Area */}
          <div className="lg:col-span-8 space-y-4">
            {activeQuestion ? (
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                {/* Question Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-red-950 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-800">
                      <span>Question #{activeQuestionIndex + 1} sur {questions.length}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {activeQuestion.category}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    « {activeQuestion.question} »
                  </h2>
                </div>

                {/* Recruiter Intent & Swiss Tip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ce que cherche à évaluer le recruteur suisse :</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {activeQuestion.intent}
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-1">
                    <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Conseil d'or pour la Romandie :</span>
                    </span>
                    <p className="text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed">
                      {activeQuestion.tip}
                    </p>
                  </div>
                </div>

                {/* Candidate Answering Area */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Votre réponse formulée :
                  </label>
                  <textarea
                    rows={5}
                    value={candidateAnswer}
                    onChange={e => setCandidateAnswer(e.target.value)}
                    placeholder="Saisissez votre réponse comme si vous étiez face au recruteur à Lausanne..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-xs font-sans text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleShowModelAnswer}
                      className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Insérer un exemple de formulation modèle suisse</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleEvaluate}
                      disabled={isEvaluating || !candidateAnswer.trim()}
                      className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Évaluation RH en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Faire Évaluer par l'IA Recruteur</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Feedback Box */}
                {feedback && (
                  <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-emerald-400">
                          {feedback.score}/100
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {feedback.verdict}
                        </span>
                      </div>
                      <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Évaluation Conforme</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="font-bold text-emerald-400 block">Points forts remarqués :</span>
                        <ul className="space-y-1 text-slate-300 text-[11px]">
                          {feedback.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-bold text-amber-400 block">Axes d'ajustement suisse :</span>
                        <ul className="space-y-1 text-slate-300 text-[11px]">
                          {feedback.improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-blue-400 block mb-1">
                        Formulation Modèle Recommandée pour le Marché Suisse :
                      </span>
                      <p className="text-slate-300 italic p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 leading-relaxed text-[11px]">
                        « {feedback.modelAnswer} »
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                Sélectionnez une question pour démarrer la simulation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: CHEAT SHEET & CULTURAL CODES */}
      {activeSection === 'cheatsheet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Les 4 Piliers de l'Entretien d'Embauche en Suisse Romande
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">1. La Culture du Consensus (Konsens)</span>
                <p className="text-[11px]">
                  En Suisse, la décision découle du débat constructif. Les recruteurs évaluent si vous savez défendre vos arguments avec calme, sans écraser vos interlocuteurs et en cherchant le compromis.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">2. La Sobriété & l'Excellence d'Exécution</span>
                <p className="text-[11px]">
                  Évitez les affirmations grandiloquentes. Les chiffres précis, les étapes méthodologiques et le respect strict du cahier des charges sont infiniment plus convaincants.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">3. La Négociation Salariale (Option C)</span>
                <p className="text-[11px]">
                  Ne donnez pas un chiffre rigide prématurément. Répondez que vous vous alignez sur la grille et le niveau de responsabilité du poste, en restant ouvert à la discussion sur l'ensemble des avantages.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">4. La Ponctualité & la Discrétion</span>
                <p className="text-[11px]">
                  Arrivez 7 minutes avant l'heure exacte. Ne divulguez jamais d'informations confidentielles sur vos anciens employeurs suisses ou étrangers.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Fiche de Préparation Synthétique (Cheat Sheet)
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Téléchargez la fiche mémorielle condensée au format PDF pour réviser dans le train ou les transports en commun juste avant votre rendez-vous à Lausanne.
              </p>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-200">Ce que contient le document :</div>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li>✓ Rappel de l'intitulé exact et de l'entreprise cible</li>
                  <li>✓ Formule modèle pour répondre aux questions de prétentions salariales</li>
                  <li>✓ Les 5 questions types du recruteur et les arguments clés</li>
                  <li>✓ Méthode STAR adaptée au canton de Vaud</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportCheatSheetPdf}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-red-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger ma Fiche PDF Immédiatement</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: KPIS & EMPLOYER RESPONSE DELAYS */}
      {activeSection === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">Délai Moyen de Réponse RH</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">12 à 18 jours</span>
              <p className="text-[11px] text-slate-500">
                Moyenne observée auprès des entreprises directes (hors agences) dans le canton de Vaud.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">Taux de Dossiers Qualifiés</span>
              <span className="text-2xl font-black text-emerald-500 block">100%</span>
              <p className="text-[11px] text-slate-500">
                Tous les dossiers préparés respectent les 3 volets suisses (CV adapté, lettre signée, certificats).
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">Prétentions Salariales</span>
              <span className="text-2xl font-black text-amber-500 block">Option C Active</span>
              <p className="text-[11px] text-slate-500">
                Garantit zéro disqualification automatique avant le premier entretien d'embauche.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Délais Estimés par Employeur Direct Vaudois
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { company: 'CHUV (Centre Hospitalier Universitaire Vaudois)', location: 'Lausanne', delay: '14 - 21 jours', rate: '92% de réponse' },
                { company: 'BCV (Banque Cantonale Vaudoise)', location: 'Lausanne / Prilly', delay: '10 - 15 jours', rate: '88% de réponse' },
                { company: 'Vaudoise Assurances', location: 'Lausanne', delay: '12 - 16 jours', rate: '90% de réponse' },
                { company: 'EPFL (École Polytechnique Fédérale)', location: 'Ecublens / Lausanne', delay: '15 - 24 jours', rate: '95% de réponse' },
                { company: 'Logitech Europe', location: 'Lausanne (EPFL Innovation)', delay: '8 - 14 jours', rate: '85% de réponse' },
                { company: 'Swissquote', location: 'Gland (Vaud)', delay: '7 - 12 jours', rate: '91% de réponse' }
              ].map((emp, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 gap-2"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{emp.company}</span>
                    <span className="text-slate-400 text-[11px] ml-2">📍 {emp.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-amber-500 font-semibold">⏱️ {emp.delay}</span>
                    <span className="text-emerald-500 font-semibold">✓ {emp.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
