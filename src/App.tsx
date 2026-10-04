import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AnalyzeJobModal } from './components/AnalyzeJobModal';
import { OptionBManager } from './components/OptionBManager';
import { DossierModal } from './components/DossierModal';
import { DailyReportModal } from './components/DailyReportModal';
import { MasterProfileModal } from './components/MasterProfileModal';
import { UploadCVModal } from './components/UploadCVModal';
import { VideoGuideModal } from './components/VideoGuideModal';
import { WelcomeModal } from './components/WelcomeModal';
import { LoginPage } from './components/LoginPage';
import { TrialModal } from './components/TrialModal';
import { JobOffer, JobStatus, UserProfile, TailoredDossier } from './types';
import { UserAccount } from './types/auth';
import { defaultUserProfile } from './data/defaultProfile';
import { initialMockJobs } from './data/mockJobs';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export default function App() {
  // Local storage initialization with automated sanitizer
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('lausanne_job_matcher_profile_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it's an old hardcoded profile or no CV has been uploaded, start with clean default
        if (!parsed.hasCvUploaded) {
          return defaultUserProfile;
        }
        return parsed;
      }
      return defaultUserProfile;
    } catch {
      return defaultUserProfile;
    }
  });

  const [jobs, setJobs] = useState<JobOffer[]>(() => {
    try {
      const saved = localStorage.getItem('lausanne_job_matcher_jobs_v2');
      if (saved) {
        const parsed: JobOffer[] = JSON.parse(saved);
        return parsed;
      }
      return initialMockJobs;
    } catch {
      return initialMockJobs;
    }
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'analyzer' | 'optionB' | 'dossier' | 'report' | 'profile'
  >('dashboard');

  // Authentication & 7-Day Free Trial State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('lausanne_job_matcher_auth_account');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [isUploadCVModalOpen, setIsUploadCVModalOpen] = useState(false);
  const [isVideoGuideOpen, setIsVideoGuideOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => {
    try {
      const dismissed = localStorage.getItem('lausanne_job_matcher_welcome_dismissed');
      return dismissed !== 'true';
    } catch {
      return true;
    }
  });
  const [selectedJobForDossier, setSelectedJobForDossier] = useState<JobOffer | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const handleLoginSuccess = (account: UserAccount) => {
    setCurrentUser(account);
    if (account.fullName && !userProfile.fullName) {
      setUserProfile(prev => ({
        ...prev,
        fullName: account.fullName,
        email: account.email
      }));
    }
    showToast(`Bienvenue ${account.fullName || ''} ! Vos 7 jours d'essai gratuit sont activés.`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('lausanne_job_matcher_auth_account');
    setCurrentUser(null);
    showToast('Vous êtes déconnecté', 'info');
  };

  const handleExtendTrial = () => {
    if (!currentUser) return;
    const currentExpiry = new Date(currentUser.trialExpiresAt).getTime();
    const newExpiry = new Date(Math.max(Date.now(), currentExpiry) + 7 * 24 * 60 * 60 * 1000);
    const updatedAccount: UserAccount = {
      ...currentUser,
      trialExpiresAt: newExpiry.toISOString(),
      subscriptionPlan: 'free_trial'
    };
    setCurrentUser(updatedAccount);
    localStorage.setItem('lausanne_job_matcher_auth_account', JSON.stringify(updatedAccount));
    showToast('Votre essai gratuit a été prolongé de 7 jours supplémentaires !', 'success');
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('lausanne_job_matcher_profile_v2', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('lausanne_job_matcher_jobs_v2', JSON.stringify(jobs));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [jobs]);

  // Handler: Update Job Status
  const handleUpdateStatus = (jobId: string, newStatus: JobStatus) => {
    const statusLabels: Record<JobStatus, string> = {
      ready_to_send: 'Prêt à l\'envoi (100%)',
      waiting_info: 'En attente d\'arbitrage Option B',
      applied: 'Postulé',
      to_validate: 'À valider',
      rejected: 'Refusé / Éliminé'
    };

    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job.id === jobId) {
          const updatedHistory = [
            ...job.historyLog,
            {
              timestamp: new Date().toISOString(),
              action: `Changement de statut : ${newStatus}`,
            },
          ];
          return {
            ...job,
            status: newStatus,
            appliedDate: newStatus === 'applied' ? new Date().toISOString() : job.appliedDate,
            historyLog: updatedHistory,
            updatedAt: new Date().toISOString(),
          };
        }
        return job;
      })
    );

    showToast(`Statut mis à jour : ${statusLabels[newStatus] || newStatus}`, 'success');
  };

  // Handler: Delete Job
  const handleDeleteJob = (jobId: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    if (selectedJobForDossier?.id === jobId) {
      setSelectedJobForDossier(null);
      setIsDossierModalOpen(false);
    }
    showToast('Offre retirée de votre pipeline', 'info');
  };

  // Handler: Open Dossier
  const handleOpenDossier = (job: JobOffer) => {
    setSelectedJobForDossier(job);
    setIsDossierModalOpen(true);
  };

  // Handler: Open Option B from card
  const handleOpenOptionB = (_job: JobOffer) => {
    setActiveTab('optionB');
  };

  // Handler: Resolve Option B question + Dynamic Learning
  const handleResolveOptionB = (
    jobId: string,
    questionId: string,
    response: 'yes' | 'no' | 'partial',
    details?: string,
    skillToLearn?: { name: string; category: string }
  ) => {
    if ((response === 'yes' || response === 'partial') && skillToLearn) {
      const alreadyLearned = userProfile.learnedSkills.some(
        s => s.name.toLowerCase() === skillToLearn.name.toLowerCase()
      );

      if (!alreadyLearned) {
        const newLearnedSkill = {
          id: `learn-${Date.now()}`,
          name: skillToLearn.name,
          category: skillToLearn.category,
          addedFromJobId: jobId,
          addedFromJobTitle: jobs.find(j => j.id === jobId)?.title || 'Offre Lausanne',
          dateAdded: new Date().toISOString().split('T')[0],
          notes: details || 'Confirmé via Option B (Apprentissage dynamique)',
        };

        setUserProfile(prev => ({
          ...prev,
          learnedSkills: [newLearnedSkill, ...prev.learnedSkills],
          skills: {
            ...prev.skills,
            tools: [...prev.skills.tools, skillToLearn.name],
          },
        }));
      }
    }

    setJobs(prevJobs =>
      prevJobs.map(job => {
        if (job.id === jobId) {
          const updatedQuestions = job.optionBQuestions.map(q => {
            if (q.id === questionId) {
              return {
                ...q,
                userResponse: response,
                userDetails: details,
                answeredAt: new Date().toISOString(),
              };
            }
            return q;
          });

          const isNow100 = response === 'yes' || response === 'partial';
          const newScore = isNow100 ? 100 : job.matchScore;
          const newStatus: JobStatus = isNow100 ? 'ready_to_send' : 'to_validate';

          return {
            ...job,
            matchScore: newScore,
            status: newStatus,
            optionBQuestions: updatedQuestions,
            theWhy: isNow100
              ? `Compétence "${skillToLearn?.name}" confirmée avec succès. Le poste valide désormais 100% de vos compétences clés pour ${job.company}.`
              : job.theWhy,
            historyLog: [
              ...job.historyLog,
              {
                timestamp: new Date().toISOString(),
                action: `Arbitrage Option B (${response})`,
                details: `Compétence traitée : ${skillToLearn?.name || 'N/A'}. Nouveau statut : ${newStatus}.`,
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return job;
      })
    );

    if (response === 'yes' || response === 'partial') {
      showToast(`Compétence "${skillToLearn?.name || ''}" validée ! Score porté à 100%`, 'success');
    } else {
      showToast('Arbitrage enregistré.', 'info');
    }
  };

  // Handler: Add Newly Analyzed Job
  const handleAddAnalyzedJob = (newJob: JobOffer) => {
    setJobs(prev => [newJob, ...prev]);
    setActiveTab('dashboard');
    showToast(`Offre « ${newJob.title} » ajoutée avec succès !`, 'success');
    if (newJob.matchScore === 100 && !newJob.isEliminated) {
      setSelectedJobForDossier(newJob);
      setIsDossierModalOpen(true);
    }
  };

  // Handler: Update Dossier for Job
  const handleUpdateJobDossier = (jobId: string, updatedDossier: TailoredDossier) => {
    setJobs(prevJobs =>
      prevJobs.map(job => (job.id === jobId ? { ...job, tailoredDossier: updatedDossier } : job))
    );
    if (selectedJobForDossier?.id === jobId) {
      setSelectedJobForDossier(prev => (prev ? { ...prev, tailoredDossier: updatedDossier } : null));
    }
  };

  // Handler: Remove a learned skill from profile
  const handleRemoveLearnedSkill = (skillId: string) => {
    setUserProfile(prev => ({
      ...prev,
      learnedSkills: prev.learnedSkills.filter(s => s.id !== skillId),
    }));
    showToast('Compétence retirée de la mémoire permanente', 'info');
  };

  // Handler: Reset demo data
  const handleResetDemoData = () => {
    setJobs(initialMockJobs);
    setUserProfile(defaultUserProfile);
    localStorage.removeItem('lausanne_job_matcher_jobs_v2');
    localStorage.removeItem('lausanne_job_matcher_profile_v2');
    showToast('Exemples de référence réinitialisés avec succès', 'info');
  };

  // If not authenticated, display full LoginPage with 7-Day Free Trial
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white relative">
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white ${
                toast.type === 'success'
                  ? 'bg-emerald-600'
                  : toast.type === 'warning'
                  ? 'bg-amber-600'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-white shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-red-500 selection:text-white relative">
      {/* Main Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jobs={jobs}
        userProfile={userProfile}
        currentUser={currentUser}
        onOpenNewOffer={() => setIsAnalyzeModalOpen(true)}
        onOpenUploadCV={() => setIsUploadCVModalOpen(true)}
        onOpenVideoGuide={() => setIsVideoGuideOpen(true)}
        onOpenWelcome={() => setIsWelcomeModalOpen(true)}
        onOpenTrialModal={() => setIsTrialModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            jobs={jobs}
            userProfile={userProfile}
            currentUser={currentUser}
            onOpenNewOffer={() => setIsAnalyzeModalOpen(true)}
            onOpenUploadCV={() => setIsUploadCVModalOpen(true)}
            onOpenVideoGuide={() => setIsVideoGuideOpen(true)}
            onOpenWelcome={() => setIsWelcomeModalOpen(true)}
            onOpenTrialModal={() => setIsTrialModalOpen(true)}
            onOpenDossier={handleOpenDossier}
            onOpenOptionB={handleOpenOptionB}
            onUpdateStatus={handleUpdateStatus}
            onDeleteJob={handleDeleteJob}
            onResetDemoData={handleResetDemoData}
            onCopyNotice={msg => showToast(msg, 'info')}
          />
        )}

        {activeTab === 'optionB' && (
          <OptionBManager
            jobs={jobs}
            userProfile={userProfile}
            onResolveOptionB={handleResolveOptionB}
            onRemoveLearnedSkill={handleRemoveLearnedSkill}
            onOpenDossier={handleOpenDossier}
            onNavigateDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'report' && (
          <DailyReportModal jobs={jobs} onOpenDossier={handleOpenDossier} />
        )}

        {activeTab === 'profile' && (
          <MasterProfileModal
            userProfile={userProfile}
            onOpenUploadCV={() => setIsUploadCVModalOpen(true)}
            onUpdateProfile={updated => {
              setUserProfile(updated);
              showToast('Profil maître sauvegardé avec succès !', 'success');
            }}
          />
        )}
      </main>

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/80 shadow-emerald-950/20'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-100 border-amber-500/80 shadow-amber-950/20'
                : 'bg-slate-900 text-white border-blue-500/80 shadow-blue-950/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadCVModal
        isOpen={isUploadCVModalOpen}
        onClose={() => setIsUploadCVModalOpen(false)}
        onProfileUpdated={newProfile => {
          setUserProfile(newProfile);
          showToast(`CV "${newProfile.cvFileName || 'téléversé'}" importé avec succès !`, 'success');
        }}
        currentProfile={userProfile}
      />

      <AnalyzeJobModal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        userProfile={userProfile}
        existingJobs={jobs}
        onAddAnalyzedJob={handleAddAnalyzedJob}
        onOpenExistingJob={handleOpenDossier}
      />

      <DossierModal
        job={selectedJobForDossier}
        isOpen={isDossierModalOpen}
        onClose={() => {
          setIsDossierModalOpen(false);
          setSelectedJobForDossier(null);
        }}
        userProfile={userProfile}
        onUpdateJobDossier={handleUpdateJobDossier}
        onCopyNotice={msg => showToast(msg, 'info')}
      />

      <VideoGuideModal
        isOpen={isVideoGuideOpen}
        onClose={() => setIsVideoGuideOpen(false)}
        onOpenUploadCV={() => setIsUploadCVModalOpen(true)}
        onOpenAnalyzeJob={() => setIsAnalyzeModalOpen(true)}
        onOpenReport={() => setActiveTab('report')}
      />

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onStartUploadCV={() => setIsUploadCVModalOpen(true)}
        onWatchVideoDemo={() => setIsVideoGuideOpen(true)}
        onExploreDashboard={() => setActiveTab('dashboard')}
      />

      {currentUser && (
        <TrialModal
          isOpen={isTrialModalOpen}
          onClose={() => setIsTrialModalOpen(false)}
          currentUser={currentUser}
          onExtendTrial={handleExtendTrial}
        />
      )}
    </div>
  );
}
