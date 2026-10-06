import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  CreditCard,
  QrCode,
  Download,
  Clock,
  Gift,
  RefreshCw,
  FileText,
  Building,
  Check,
  X,
  Lock,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import { UserAccount, calculateTrialDaysRemaining, InvoiceReceipt } from '../types/auth';
import { UserProfile } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  userProfile?: UserProfile;
  onExtendTrial: () => void;
  onUpgradePlan: (newPlan: 'standard_lausanne' | 'pro_lausanne') => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onExtendTrial,
  onUpgradePlan
}) => {
  if (!isOpen) return null;

  const [selectedPlan, setSelectedPlan] = useState<'standard_lausanne' | 'pro_lausanne'>('pro_lausanne');
  const [paymentMethod, setPaymentMethod] = useState<'stripe_card' | 'qr_bill_swiss'>('stripe_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'invoices'>('plans');

  const trialInfo = calculateTrialDaysRemaining(currentUser.trialExpiresAt);
  const formattedExpiry = new Date(currentUser.trialExpiresAt).toLocaleDateString('fr-CH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isPro = currentUser.subscriptionPlan === 'pro_lausanne';
  const isStandard = currentUser.subscriptionPlan === 'standard_lausanne';

  // Handle Checkout / Upgrade
  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod,
          userEmail: currentUser.email,
          candidateName: userProfile?.fullName || currentUser.fullName || 'Marc Delarue'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setLastInvoice(data.invoice);
        if (paymentMethod === 'qr_bill_swiss') {
          setShowQrModal(true);
        } else {
          onUpgradePlan(selectedPlan);
          alert(`Félicitations ! Votre abonnement ${selectedPlan === 'pro_lausanne' ? 'Pro' : 'Standard'} est maintenant actif.`);
        }
      }
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Swiss Tax Invoice PDF (Déductible Vaud)
  const handleDownloadInvoicePdf = (inv?: any) => {
    const invoice = inv || lastInvoice || {
      invoiceNumber: `CH-INV-${new Date().getFullYear()}-841290`,
      date: new Date().toISOString().slice(0, 10),
      planName: isPro ? 'Abonnement Pro & Cadres Supérieurs' : 'Abonnement Standard Lausanne',
      amountChf: isPro ? 69.00 : 39.00,
      netChf: isPro ? 63.83 : 36.08,
      vatChf: isPro ? 5.17 : 2.92,
      currency: 'CHF',
      vatRate: '8.1%',
      creditor: {
        name: 'Job Matcher Suisse Sàrl',
        address: 'Rue de Bourg 28, 1003 Lausanne (Vaud)',
        tvaNumber: 'CHE-412.890.312 TVA',
        iban: 'CH93 0076 2011 6238 5295 7'
      }
    };

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header Creditor
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('JOB MATCHER SUISSE SÀRL', margin, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Rue de Bourg 28 • 1003 Lausanne • Vaud • Suisse', margin, 31);
    doc.text('IDE / TVA : CHE-412.890.312 TVA • IBAN : CH93 0076 2011 6238 5295 7', margin, 36);

    // Candidate Debtor Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(pageWidth - margin - 85, 25, 85, 26, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(userProfile?.fullName || currentUser.fullName || 'Marc Delarue', pageWidth - margin - 80, 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(userProfile?.address || 'Avenue de Rumine 12', pageWidth - margin - 80, 38);
    doc.text(`${userProfile?.city || '1005 Lausanne'} (VD) • Suisse`, pageWidth - margin - 80, 44);

    // Invoice Title & Ref
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text('FACTURE ACQUITTÉE / QUITTANCE FISCALE', margin, 65);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`Facture N° : ${invoice.invoiceNumber}`, margin, 72);
    doc.text(`Date d'émission : ${new Date(invoice.date).toLocaleDateString('fr-CH')}`, margin, 77);
    doc.text(`Statut du paiement : PAYÉ / ACQUITTÉ (Par carte bancaire)`, margin, 82);

    // Items Table
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, 90, pageWidth - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Désignation de la prestation', margin + 3, 94.5);
    doc.text('Période', 140, 94.5);
    doc.text('Montant Net', 190, 94.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.planName, margin + 3, 105);
    doc.text('1 mois', 140, 105);
    doc.text(`CHF ${invoice.netChf.toFixed(2)}`, 190, 105);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 112, pageWidth - margin, 112);

    // Totals
    doc.setFont('helvetica', 'normal');
    doc.text('Sous-total net :', 140, 120);
    doc.text(`CHF ${invoice.netChf.toFixed(2)}`, 190, 120);

    doc.text(`TVA suisse (${invoice.vatRate}) :`, 140, 126);
    doc.text(`CHF ${invoice.vatChf.toFixed(2)}`, 190, 126);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total payé (CHF) :', 140, 134);
    doc.text(`CHF ${invoice.amountChf.toFixed(2)}`, 190, 134);

    // Tax Deduction Notice (Canton de Vaud / LIFD)
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.rect(margin, 150, pageWidth - margin * 2, 24, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.text('ATTESTATION POUR LA DÉDUCTION FISCALE (CANTON DE VAUD) :', margin + 4, 156);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(69, 10, 10);
    const taxNotice =
      'Ce justificatif est déductible du revenu imposable au titre des frais de perfectionnement et de recherche d\'emploi (art. 33 al. 1 let. j LIFD et art. 37 al. 1 let. i de la loi vaudoise sur les impôts directs cantonaux LI-VD). Veuillez conserver cette quittance pour votre déclaration d\'impôt.';
    const splitNotice = doc.splitTextToSize(taxNotice, pageWidth - margin * 2 - 8);
    doc.text(splitNotice, margin + 4, 162);

    // Signature
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Job Matcher Suisse Sàrl • Département Comptabilité & Facturation • Lausanne', margin, 240);

    doc.save(`Facture_JobMatcher_${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden text-white my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-red-800/40 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-red-600/30 border border-red-500/40 text-red-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                <Gift className="w-3.5 h-3.5" />
                <span>Facturation & Abonnements Suisse (CHF)</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                TVA 8.1% CHE-412.890.312
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Tarification en Francs Suisses (CHF)</span>
            </h2>
            <p className="text-xs text-slate-300">
              Débloquez l'intégralité du potentiel de recherche à Lausanne et Vaud avec déductibilité fiscale cantonale garantie.
            </p>
          </div>

          {/* Trial countdown mini-bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                Statut actuel : <strong className="text-white">{isPro ? 'Abonné Pro' : isStandard ? 'Abonné Standard' : trialInfo.formattedText}</strong>
              </span>
            </div>

            {!isPro && !isStandard && (
              <button
                type="button"
                onClick={onExtendTrial}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Prolonger l'essai gratuit (+7 jours)</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Standard */}
            <div
              onClick={() => setSelectedPlan('standard_lausanne')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                selectedPlan === 'standard_lausanne'
                  ? 'bg-slate-800/90 border-red-500 ring-2 ring-red-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Plan Standard
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Lausanne & Vaud
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-white">CHF 39.-</span>
                    <span className="text-xs text-slate-400">/ mois</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    L'essentiel pour postuler efficacement aux employeurs directs.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Veille matinale quotidienne de 8h00</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>15 Dossiers 3 volets personnalisés / mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Journal ORP & Formulaire PDF officiel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Filtrage strict : 0 agence intermédiaire</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <div
                  className={`w-full py-2 rounded-xl text-center font-bold text-xs ${
                    selectedPlan === 'standard_lausanne'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {selectedPlan === 'standard_lausanne' ? '✓ Sélectionné' : 'Choisir Standard'}
                </div>
              </div>
            </div>

            {/* Plan Pro / Cadres Supérieurs */}
            <div
              onClick={() => setSelectedPlan('pro_lausanne')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                selectedPlan === 'pro_lausanne'
                  ? 'bg-slate-800/90 border-red-500 ring-2 ring-red-500/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                ★ Recommandé
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Plan Pro & Cadres
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-800">
                    Accès Intégral
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-white">CHF 69.-</span>
                    <span className="text-xs text-slate-400">/ mois</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Toutes les fonctionnalités IA illimitées pour maximiser vos entretiens.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Dossiers 3 volets illimités</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Simulateur d'entretien IA suisse illimité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Relances J+7 / J+14 avec courriels automatiques</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Journal ORP LACI mensuel en illimité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>100% Déductible des impôts vaudois</strong></span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <div
                  className={`w-full py-2 rounded-xl text-center font-bold text-xs ${
                    selectedPlan === 'pro_lausanne'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {selectedPlan === 'pro_lausanne' ? '✓ Sélectionné' : 'Choisir Pro'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Mode de Règlement Sécurisé en Suisse :
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe_card')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  paymentMethod === 'stripe_card'
                    ? 'bg-red-950/40 border-red-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-100">Carte Bancaire / Stripe</div>
                  <div className="text-[10px] text-slate-400">Visa, Mastercard, PostFinance, Apple Pay</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qr_bill_swiss')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  paymentMethod === 'qr_bill_swiss'
                    ? 'bg-red-950/40 border-red-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-100">Facture QR Suisse (SIX)</div>
                  <div className="text-[10px] text-slate-400">Bulletin de versement avec QR-Code suisse</div>
                </div>
              </button>
            </div>
          </div>

          {/* Tax Deductibility Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-slate-200">
                Déductibilité Fiscale dans le Canton de Vaud (art. 33 LIFD / art. 37 LI-VD)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Les abonnements Job Matcher sont considérés comme des dépenses de perfectionnement et de réinsertion professionnelle, déductibles de votre revenu imposable sur votre déclaration fiscale vaudoise. Vous recevrez une quittance officielle avec numéro de TVA suisse après chaque règlement.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Paiement crypté SSL 256 bits conforme FINMA / SIX</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleDownloadInvoicePdf()}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Télécharger un modèle de quittance fiscale"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Quittance Fiscale (PDF)</span>
            </button>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <>
                  <span>
                    Activer {selectedPlan === 'pro_lausanne' ? 'le Plan Pro (CHF 69.-)' : 'le Plan Standard (CHF 39.-)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Swiss QR-Bill Modal */}
      {showQrModal && lastInvoice && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Facture QR Suisse (Bulletin de Versement)</h3>
              </div>
              <button
                onClick={() => {
                  setShowQrModal(false);
                  onUpgradePlan(selectedPlan);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white text-slate-900 rounded-2xl space-y-3 font-mono text-[11px] border">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold">Section Paiement QR Suisse</span>
                <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">CHF {lastInvoice.amountChf.toFixed(2)}</span>
              </div>

              <div>
                <strong>Créancier :</strong><br />
                {lastInvoice.creditor.name}<br />
                {lastInvoice.creditor.address}<br />
                IBAN : {lastInvoice.creditor.iban}
              </div>

              <div>
                <strong>Débiteur :</strong><br />
                {userProfile?.fullName || currentUser.fullName || 'Marc Delarue'}<br />
                {userProfile?.address || 'Avenue de Rumine 12, 1005 Lausanne'}
              </div>

              <div className="pt-2 border-t text-[10px] text-slate-500">
                Référence : {lastInvoice.qrReference}<br />
                Motif : {lastInvoice.planName} ({lastInvoice.invoiceNumber})
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleDownloadInvoicePdf(lastInvoice)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger la QR-Facture (PDF)</span>
              </button>

              <button
                onClick={() => {
                  setShowQrModal(false);
                  onUpgradePlan(selectedPlan);
                }}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                ✓ Confirmer & Activer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
