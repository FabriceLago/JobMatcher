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
import { ExportProjectModal } from './components/ExportProjectModal';
import { JobRadarView } from './components/JobRadarView';
import { InterviewCoachView } from './components/InterviewCoachView';
import { OrpJournalView } from './components/OrpJournalView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { firestoreSyncService } from './services/firestoreSyncService';
import { logOutFirebase, subscribeToAuthState } from './firebase';
import { JobOffer, JobStatus, UserProfile, TailoredDossier } from './types';
import { UserAccount } from './types/auth';
import { defaultUserProfile } from './data/defaultProfile';
import { initialMockJobs } from './data/mockJobs';
import { useTheme } from './hooks/useTheme';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export default function App() {
  // Initialize system preference matchMedia & theme synchronization
  useTheme();

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
    'dashboard' | 'analyzer' | 'radar' | 'optionB' | 'dossier' | 'report' | 'profile' | 'coaching' | 'orp'
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const handleLoginSuccess = async (account: UserAccount) => {
    setCurrentUser(account);
    try {
      await firestoreSyncService.saveUserAccount(account);
    } catch (e) {
      console.warn('Sync account error:', e);
    }
    if (account.fullName && !userProfile.fullName) {
      setUserProfile(prev => ({
        ...prev,
        fullName: account.fullName,
        email: account.email
      }));
    }
    showToast(`Bienvenue ${account.fullName || ''} ! Vos 7 jours d'essai gratuit sont activés.`, 'success');
  };

  const handleLogout = async () => {
    try {
      await logOutFirebase();
    } catch (e) {
      console.warn('Firebase logout notice:', e);
    }
    localStorage.removeItem('lausanne_job_matcher_auth_account');
    setCurrentUser(null);
    showToast('Vous êtes déconnecté', 'info');
  };

  const handleExtendTrial = async () => {
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
    try {
      await firestoreSyncService.saveUserAccount(updatedAccount);
    } catch (e) {
      console.warn('Account sync notice:', e);
    }
    showToast('Votre essai gratuit a été prolongé de 7 jours supplémentaires !', 'success');
  };

  // Firebase Auth State Listener (Automatic Session Persistence & Multi-Tenant Restore)
  useEffect(() => {
    const unsub = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const existingAccount = await firestoreSyncService.getUserAccount(firebaseUser.uid);
          if (existingAccount) {
            setCurrentUser(existingAccount);
            localStorage.setItem('lausanne_job_matcher_auth_account', JSON.stringify(existingAccount));
          } else {
            const now = new Date();
            const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const newAccount: UserAccount = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Candidat Vaudois',
              createdAt: now.toISOString(),
              trialStartedAt: now.toISOString(),
              trialExpiresAt: expiry.toISOString(),
              subscriptionPlan: 'free_trial'
            };
            await firestoreSyncService.saveUserAccount(newAccount);
            setCurrentUser(newAccount);
            localStorage.setItem('lausanne_job_matcher_auth_account', JSON.stringify(newAccount));
          }
        } catch (authSyncErr) {
          console.warn('Auth state sync notice:', authSyncErr);
        }
      }
    });

    return () => unsub();
  }, []);

  // Realtime Cloud Firestore Sync for Multi-Tenant Architecture
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    // 1. Initial fetch & real-time listener for User Profile
    const unsubProfile = firestoreSyncService.subscribeToProfile(currentUser.id, cloudProfile => {
      if (cloudProfile && cloudProfile.fullName) {
        setUserProfile(cloudProfile);
      }
    });

    // 2. Initial fetch & real-time listener for User Jobs pipeline
    const unsubJobs = firestoreSyncService.subscribeToJobs(currentUser.id, cloudJobs => {
      if (cloudJobs && cloudJobs.length > 0) {
        setJobs(cloudJobs);
      }
    });

    return () => {
      unsubProfile();
      unsubJobs();
    };
  }, [currentUser]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sync to local storage & Cloud Firestore
  useEffect(() => {
    try {
      localStorage.setItem('lausanne_job_matcher_profile_v2', JSON.stringify(userProfile));
      if (currentUser?.id) {
        firestoreSyncService.saveUserProfile(currentUser.id, userProfile);
      }
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [userProfile, currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('lausanne_job_matcher_jobs_v2', JSON.stringify(jobs));
      if (currentUser?.id) {
        jobs.forEach(job => {
          firestoreSyncService.saveJobOffer(currentUser.id, job);
        });
      }
    } catch (e) {
      console.warn('Jobs storage error:', e);
    }
  }, [jobs, currentUser]);

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
    if (currentUser?.id) {
      firestoreSyncService.deleteJobOffer(currentUser.id, jobId);
    }
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

  // Handler: Add AI Suggested Keyword to Master Profile
  const handleAddKeywordToProfile = (skillName: string, category: string, reason?: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    const alreadyLearned = userProfile.learnedSkills.some(
      s => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    const inProfileTools = userProfile.skills.tools.some(t => t.toLowerCase() === trimmed.toLowerCase());
    const inProfileMethod = userProfile.skills.methodologies.some(m => m.toLowerCase() === trimmed.toLowerCase());

    if (alreadyLearned || inProfileTools || inProfileMethod) {
      showToast(`Le mot-clé « ${trimmed} » figure déjà dans votre profil.`, 'info');
      return;
    }

    const newLearnedSkill = {
      id: `learn-ai-${Date.now()}`,
      name: trimmed,
      category: category || 'methodology',
      addedFromJobId: 'ai-dashboard-gap',
      addedFromJobTitle: 'Analyseur IA de Mots-Clés',
      dateAdded: new Date().toISOString().split('T')[0],
      notes: reason || 'Ajouté via suggestion IA du Tableau de Bord',
    };

    const updatedProfile: UserProfile = {
      ...userProfile,
      learnedSkills: [newLearnedSkill, ...userProfile.learnedSkills],
      skills: {
        ...userProfile.skills,
        methodologies: category === 'methodology' ? [...userProfile.skills.methodologies, trimmed] : userProfile.skills.methodologies,
        tools: category !== 'methodology' ? [...userProfile.skills.tools, trimmed] : userProfile.skills.tools,
      }
    };

    setUserProfile(updatedProfile);
    if (currentUser?.id) {
      firestoreSyncService.saveUserProfile(currentUser.id, updatedProfile);
    }
    showToast(`✓ Mot-clé « ${trimmed} » ajouté avec succès à votre profil maître !`, 'success');
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-red-500 selection:text-white relative transition-colors duration-200">
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
        onOpenExportProject={() => setIsExportModalOpen(true)}
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
            onNavigateRadar={() => setActiveTab('radar')}
            onOpenUploadCV={() => setIsUploadCVModalOpen(true)}
            onOpenVideoGuide={() => setIsVideoGuideOpen(true)}
            onOpenWelcome={() => setIsWelcomeModalOpen(true)}
            onOpenTrialModal={() => setIsTrialModalOpen(true)}
            onOpenDossier={handleOpenDossier}
            onOpenOptionB={handleOpenOptionB}
            onUpdateStatus={handleUpdateStatus}
            onDeleteJob={handleDeleteJob}
            onResetDemoData={handleResetDemoData}
            onAddSkillToProfile={handleAddKeywordToProfile}
            onCopyNotice={msg => showToast(msg, 'info')}
          />
        )}

        {activeTab === 'radar' && (
          <JobRadarView
            userProfile={userProfile}
            existingJobs={jobs}
            onIngestJob={job => {
              setJobs(prev => [job, ...prev]);
              if (currentUser?.id) {
                firestoreSyncService.saveJobOffer(currentUser.id, job);
              }
              showToast(`Offre « ${job.title} » ingérée avec succès dans votre pipeline !`, 'success');
            }}
            onIngestAndOpenDossier={job => {
              setJobs(prev => [job, ...prev]);
              if (currentUser?.id) {
                firestoreSyncService.saveJobOffer(currentUser.id, job);
              }
              setSelectedJobForDossier(job);
              setIsDossierModalOpen(true);
              showToast(`Offre « ${job.title} » ingérée ! Préparation du dossier en cours.`, 'success');
            }}
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
          <DailyReportModal
            jobs={jobs}
            userProfile={userProfile}
            onOpenDossier={handleOpenDossier}
            onUpdateJobStatus={handleUpdateStatus}
            onCopyNotice={msg => showToast(msg, 'info')}
          />
        )}

        {activeTab === 'coaching' && (
          <InterviewCoachView
            jobs={jobs}
            userProfile={userProfile}
            onOpenDossier={handleOpenDossier}
            onCopyNotice={msg => showToast(msg, 'info')}
          />
        )}

        {activeTab === 'orp' && (
          <OrpJournalView
            jobs={jobs}
            userProfile={userProfile}
            onOpenDossier={handleOpenDossier}
            onCopyNotice={msg => showToast(msg, 'info')}
          />
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

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

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
        onUpdateJobStatus={handleUpdateStatus}
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
          userProfile={userProfile}
          onExtendTrial={handleExtendTrial}
          onUpgradePlan={newPlan => {
            const updatedUser: UserAccount = {
              ...currentUser,
              subscriptionPlan: newPlan
            };
            setCurrentUser(updatedUser);
            localStorage.setItem('lausanne_job_matcher_auth_account', JSON.stringify(updatedUser));
            if (currentUser.id) {
              firestoreSyncService.saveUserAccount(updatedUser);
            }
            showToast(`Abonnement ${newPlan === 'pro_lausanne' ? 'Pro' : 'Standard'} activé avec succès !`, 'success');
          }}
        />
      )}

      <ExportProjectModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onCopyNotice={msg => showToast(msg, 'info')}
      />
    </div>
  );
}
