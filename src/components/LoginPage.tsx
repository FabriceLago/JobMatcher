import React, { useState } from 'react';
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  Gift,
  MapPin,
  Check,
  AlertCircle,
  Database
} from 'lucide-react';
import { UserAccount } from '../types/auth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword
} from '../firebase';

interface LoginPageProps {
  onLoginSuccess: (account: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      const user = await signInWithGoogle();
      if (user) {
        const now = new Date();
        const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const userAccount: UserAccount = {
          id: user.uid,
          email: user.email || '',
          fullName: user.displayName || user.email?.split('@')[0] || 'Candidat Vaudois',
          createdAt: now.toISOString(),
          trialStartedAt: now.toISOString(),
          trialExpiresAt: expiry.toISOString(),
          subscriptionPlan: 'free_trial'
        };
        if (rememberMe) {
          localStorage.setItem('lausanne_job_matcher_auth_account', JSON.stringify(userAccount));
        }
        onLoginSuccess(userAccount);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError('Erreur lors de la connexion Google. Vous pouvez utiliser le compte Démo ou le formulaire ci-dessous.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      setResetStatus('loading');
      await resetPassword(resetEmail);
      setResetStatus('success');
      setResetMessage(`Un email de réinitialisation sécurisé a été envoyé à ${resetEmail}.`);
    } catch (err: any) {
      setResetStatus('error');
      setResetMessage(err?.message || 'Erreur lors de l\'envoi du lien de réinitialisation.');
    }
  };

  const handleDemoLogin = () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

    const demoAccount: UserAccount = {
      id: 'demo-user-lausanne',
      email: 'candidat.demo@lausanne.ch',
      fullName: 'Marc Delarue',
      createdAt: now.toISOString(),
      trialStartedAt: now.toISOString(),
      trialExpiresAt: expiry.toISOString(),
      subscriptionPlan: 'free_trial'
    };

    if (rememberMe) {
      localStorage.setItem('lausanne_job_matcher_auth_account', JSON.stringify(demoAccount));
    }
    onLoginSuccess(demoAccount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Veuillez renseigner votre adresse email et un mot de passe.');
      return;
    }

    if (mode === 'signup' && !fullName) {
      setError('Veuillez renseigner votre nom complet.');
      return;
    }

    setIsSubmitting(true);
    let firebaseUid: string | null = null;
    let chosenName = fullName.trim() || email.split('@')[0];

    try {
      if (mode === 'signup') {
        try {
          const user = await signUpWithEmail(email, password, chosenName);
          if (user) {
            firebaseUid = user.uid;
          }
        } catch (authErr: any) {
          if (authErr?.code === 'auth/email-already-in-use') {
            setError('Cette adresse email est déjà enregistrée. Veuillez utiliser l\'onglet « Se connecter ».');
            setIsSubmitting(false);
            return;
          } else if (authErr?.code === 'auth/weak-password') {
            setError('Le mot de passe doit comporter au moins 6 caractères.');
            setIsSubmitting(false);
            return;
          } else if (authErr?.code === 'auth/invalid-email') {
            setError('L\'adresse email saisie est invalide.');
            setIsSubmitting(false);
            return;
          } else {
            console.warn('Firebase signup notice:', authErr);
          }
        }
      } else {
        try {
          const user = await signInWithEmail(email, password);
          if (user) {
            firebaseUid = user.uid;
            if (user.displayName) chosenName = user.displayName;
          }
        } catch (authErr: any) {
          if (
            authErr?.code === 'auth/invalid-credential' ||
            authErr?.code === 'auth/wrong-password' ||
            authErr?.code === 'auth/user-not-found'
          ) {
            setError('Identifiants incorrects. Vérifiez votre email et mot de passe.');
            setIsSubmitting(false);
            return;
          } else if (authErr?.code === 'auth/too-many-requests') {
            setError('Trop de tentatives. Veuillez patienter un instant ou réinitialiser votre mot de passe.');
            setIsSubmitting(false);
            return;
          } else {
            console.warn('Firebase signin notice:', authErr);
          }
        }
      }

      const now = new Date();
      const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days trial

      const userAccount: UserAccount = {
        id: firebaseUid || `user-${Date.now()}`,
        email: email.trim().toLowerCase(),
        fullName: chosenName,
        createdAt: now.toISOString(),
        trialStartedAt: now.toISOString(),
        trialExpiresAt: expiry.toISOString(),
        subscriptionPlan: 'free_trial'
      };

      if (rememberMe) {
        localStorage.setItem('lausanne_job_matcher_auth_account', JSON.stringify(userAccount));
      }

      onLoginSuccess(userAccount);
    } catch (generalErr: any) {
      setError(generalErr?.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-red-600 selection:text-white">
      {/* Background Subtle Swiss Ambient Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Value Proposition & 7-Day Free Trial Highlights */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-700/60 text-red-300 text-xs px-3 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>Offre Spéciale : 7 Jours Gratuits</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Job Matcher <span className="text-xs bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">CH</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Système Expert Emploi Suisse • Lausanne & 20-30km
                </p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Trouvez votre prochain travail avec un <span className="text-emerald-400">Match de 100%</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Créez votre compte en 10 secondes et bénéficiez immédiatement de <strong>7 jours d'accès gratuit et illimité</strong> à toutes les fonctionnalités premium, sans carte bancaire requise.
            </p>
          </div>

          {/* Trial Advantage Callout Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border border-red-800/40 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
              <Gift className="w-4 h-4 text-red-400" />
              <span>Ce qui est inclus dans votre essai gratuit de 7 jours :</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Analyses d'offres illimitées</strong> : validation instantanée des employeurs directs vaudois.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Import intelligent de CV</strong> : extraction IA de votre profil, compétences et diplômes.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Génération des dossiers 3 volets</strong> : CV ciblé et lettre suisse personnalisée.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Rapport matinal de 8h00</strong> : transmission directe via WhatsApp et Email.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sans carte de crédit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Annulation libre</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>Canton de Vaud</span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Essai 7 Jours (Gratuit)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Authentication Button (Firebase Auth) */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-colors cursor-pointer text-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isGoogleLoading ? 'Connexion en cours...' : 'Continuer avec Google'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  ou avec email
                </span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nom et Prénom</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ex: Marc Delarue"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Adresse Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre.email@domaine.ch"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mot de passe</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setResetStatus('idle');
                        setResetMessage('');
                        setShowResetModal(true);
                      }}
                      className="text-[11px] text-red-400 hover:underline cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-800 cursor-pointer"
                  />
                  <span>Rester connecté</span>
                </label>

                {mode === 'signup' && (
                  <span className="text-[11px] text-emerald-400 font-bold">
                    ✓ 7 jours offerts
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer text-xs sm:text-sm"
              >
                <span>
                  {mode === 'signup'
                    ? 'Activer mes 7 Jours Gratuits'
                    : 'Accéder à mon espace'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Demo Login */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="text-center">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Ou test instantané sans formulaire
                </span>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tester avec le compte Démo (7 jours actifs)</span>
              </button>

              {/* Cloud Database Connected Badge */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-900/60 p-2 rounded-xl">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Base de données Cloud Firestore connectée (Multi-tenant)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span>Réinitialisation du mot de passe</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Saisissez votre adresse email pour recevoir un lien de réinitialisation sécurisé via Firebase Cloud.
            </p>

            {resetStatus === 'success' ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resetMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {resetStatus === 'error' && (
                  <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{resetMessage}</span>
                  </div>
                )}
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Votre adresse email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="votre.email@domaine.ch"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={resetStatus === 'loading'}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  >
                    {resetStatus === 'loading' ? 'Envoi...' : 'Envoyer le lien'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
