import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Award,
  AlertCircle,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  Briefcase,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import jsPDF from 'jspdf';
import { JobOffer, UserProfile } from '../types';

export interface OrpEntry {
  id: string;
  date: string; // YYYY-MM-DD
  company: string;
  location: string;
  jobTitle: string;
  activityRate: string; // e.g. "80-100%"
  channel: 'email' | 'portal' | 'spontaneous' | 'phone' | 'network';
  channelLabel: string;
  contactPerson: string;
  result: 'waiting' | 'followup_sent' | 'interview_scheduled' | 'rejected' | 'accepted';
  resultLabel: string;
  notes?: string;
  proofRef: string;
  jobId?: string;
}

interface OrpJournalViewProps {
  jobs: JobOffer[];
  userProfile: UserProfile;
  onOpenDossier: (job: JobOffer) => void;
  onCopyNotice?: (text: string) => void;
}

export const OrpJournalView: React.FC<OrpJournalViewProps> = ({
  jobs,
  userProfile,
  onOpenDossier,
  onCopyNotice
}) => {
  // Selected month (format YYYY-MM)
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(10); // Standard Vaud ORP quota
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [advisorRef, setAdvisorRef] = useState<string>('ORP Lausanne - Région Centre');
  const [avsNumber, setAvsNumber] = useState<string>('756.2418.9032.14');

  // Manual extra entries stored in state/local storage
  const [manualEntries, setManualEntries] = useState<OrpEntry[]>(() => {
    try {
      const saved = localStorage.getItem('lausanne_orp_manual_entries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load manual ORP entries', e);
    }
    return [
      {
        id: 'orp-seed-1',
        date: '2026-10-02',
        company: 'CHUV - Centre Hospitalier Universitaire Vaudois',
        location: 'Rue du Bugnon 46, 1011 Lausanne',
        jobTitle: 'Chef de projet organisation & transformation digitale',
        activityRate: '100%',
        channel: 'email',
        channelLabel: 'Courriel direct avec dossier complet 3 volets',
        contactPerson: 'Mme Sophie Mottaz (Direction RH)',
        result: 'waiting',
        resultLabel: 'En attente de réponse (Dossier qualifié)',
        notes: 'Candidature transmise avec CV suisse, lettre signée et certificats de travail.',
        proofRef: 'CH-VD-2026-9812'
      },
      {
        id: 'orp-seed-2',
        date: '2026-10-03',
        company: 'Vaudoise Assurances',
        location: 'Place de Milan, 1007 Lausanne',
        jobTitle: 'Project Manager Digital Customer Experience',
        activityRate: '80-100%',
        channel: 'email',
        channelLabel: 'Courriel direct à la Direction des Ressources Humaines',
        contactPerson: 'M. Laurent Berney (Recrutement)',
        result: 'followup_sent',
        resultLabel: 'Relance courtoise J+7 effectuée',
        notes: 'Relance transmise selon le protocole helvétique.',
        proofRef: 'CH-VD-2026-9813'
      },
      {
        id: 'orp-seed-3',
        date: '2026-10-04',
        company: 'BCV - Banque Cantonale Vaudoise',
        location: 'Place Saint-François 14, 1003 Lausanne',
        jobTitle: 'Chef de Projet Stratégie & Systèmes',
        activityRate: '100%',
        channel: 'portal',
        channelLabel: 'Portail carrières direct BCV (sans intermédiaire)',
        contactPerson: 'Département Recrutement Cadres',
        result: 'interview_scheduled',
        resultLabel: 'Premier entretien fixé le 14.10.2026',
        notes: 'Entretien de cadrage en présentiel à Saint-François.',
        proofRef: 'CH-VD-2026-9814'
      },
      {
        id: 'orp-seed-4',
        date: '2026-10-05',
        company: 'EPFL - École Polytechnique Fédérale de Lausanne',
        location: 'Route Cantonale, 1015 Ecublens / Lausanne',
        jobTitle: 'Coordinateur de projets SI & Innovation',
        activityRate: '100%',
        channel: 'portal',
        channelLabel: 'Portail officiel EPFL Emplois',
        contactPerson: 'Service des Ressources Humaines EPFL',
        result: 'waiting',
        resultLabel: 'Candidature enregistrée en cours d\'examen',
        notes: 'Dossier complet téléversé.',
        proofRef: 'CH-VD-2026-9815'
      },
      {
        id: 'orp-seed-5',
        date: '2026-10-05',
        company: 'Logitech Europe SA',
        location: 'EPFL Innovation Park, Daniel Borel Innovation Center, 1015 Lausanne',
        jobTitle: 'Senior Project Manager Digital Operations',
        activityRate: '100%',
        channel: 'email',
        channelLabel: 'Candidature directe',
        contactPerson: 'Talent Acquisition Team',
        result: 'waiting',
        resultLabel: 'En attente de réponse',
        notes: 'Dossier transmis en français et anglais.',
        proofRef: 'CH-VD-2026-9816'
      }
    ];
  });

  // New entry form state
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('Lausanne');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formActivityRate, setFormActivityRate] = useState('100%');
  const [formChannel, setFormChannel] = useState<'email' | 'portal' | 'spontaneous' | 'phone' | 'network'>('email');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formResult, setFormResult] = useState<'waiting' | 'followup_sent' | 'interview_scheduled' | 'rejected' | 'accepted'>('waiting');
  const [formNotes, setFormNotes] = useState('');

  // Sync applied jobs from pipeline into ORP entries
  const allEntries: OrpEntry[] = useMemo(() => {
    const pipelineEntries: OrpEntry[] = jobs
      .filter(job => job.status === 'applied' || !!job.appliedDate)
      .map(job => {
        const appliedDate = job.appliedDate ? job.appliedDate.slice(0, 10) : job.createdAt.slice(0, 10);
        return {
          id: `job-${job.id}`,
          date: appliedDate,
          company: job.company,
          location: job.location || 'Lausanne',
          jobTitle: job.title,
          activityRate: `${job.activityRateMin}-${job.activityRateMax}%`,
          channel: job.actionChannel?.type === 'email' ? 'email' : 'portal',
          channelLabel:
            job.actionChannel?.type === 'email'
              ? `Courriel direct (${job.actionChannel.target})`
              : 'Portail carrières employeur direct',
          contactPerson: job.recruiterName || job.actionChannel?.contactName || 'Direction RH',
          result: 'waiting',
          resultLabel: 'Candidature transmise (Preuve horodatée)',
          notes: job.theWhy,
          proofRef: `CH-VD-2026-${job.id.slice(0, 4).toUpperCase()}`,
          jobId: job.id
        };
      });

    // Merge manual entries and pipeline entries, avoiding duplicates by company & date
    const merged = [...manualEntries];
    pipelineEntries.forEach(pe => {
      const exists = merged.some(m => m.company.toLowerCase() === pe.company.toLowerCase() && m.date === pe.date);
      if (!exists) {
        merged.push(pe);
      }
    });

    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [jobs, manualEntries]);

  // Filter entries for the selected month
  const monthlyEntries = useMemo(() => {
    return allEntries.filter(entry => entry.date.startsWith(selectedMonth));
  }, [allEntries, selectedMonth]);

  // Quota progress calculation
  const totalCount = monthlyEntries.length;
  const progressPercent = Math.min(100, Math.round((totalCount / monthlyTarget) * 100));
  const isTargetAchieved = totalCount >= monthlyTarget;

  // Add Manual Entry
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formJobTitle.trim()) return;

    const channelLabels: Record<string, string> = {
      email: 'Courriel direct avec dossier complet 3 volets',
      portal: 'Portail carrières employeur direct',
      spontaneous: 'Candidature spontanée ciblée',
      phone: 'Contact téléphonique préalable & dossier',
      network: 'Réseau professionnel direct en Romandie'
    };

    const resultLabels: Record<string, string> = {
      waiting: 'En attente de réponse',
      followup_sent: 'Relance courtoise J+7 effectuée',
      interview_scheduled: 'Entretien d\'embauche planifié',
      rejected: 'Réponse négative reçue et archivée',
      accepted: 'Offre d\'engagement reçue'
    };

    const newEntry: OrpEntry = {
      id: `orp-manual-${Date.now()}`,
      date: formDate,
      company: formCompany.trim(),
      location: formLocation.trim() || 'Lausanne',
      jobTitle: formJobTitle.trim(),
      activityRate: formActivityRate,
      channel: formChannel,
      channelLabel: channelLabels[formChannel] || 'Démarche directe',
      contactPerson: formContactPerson.trim() || 'Direction des Ressources Humaines',
      result: formResult,
      resultLabel: resultLabels[formResult] || 'En attente',
      notes: formNotes.trim(),
      proofRef: `CH-VD-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };

    const updated = [newEntry, ...manualEntries];
    setManualEntries(updated);
    try {
      localStorage.setItem('lausanne_orp_manual_entries', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save manual ORP entries', err);
    }

    setIsAddModalOpen(false);
    // Reset form
    setFormCompany('');
    setFormJobTitle('');
    setFormContactPerson('');
    setFormNotes('');
    if (onCopyNotice) {
      onCopyNotice('Recherche d\'emploi ajoutée avec succès au Journal ORP !');
    }
  };

  // Delete Entry
  const handleDeleteEntry = (id: string) => {
    const updated = manualEntries.filter(e => e.id !== id);
    setManualEntries(updated);
    try {
      localStorage.setItem('lausanne_orp_manual_entries', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save manual ORP entries', err);
    }
    if (onCopyNotice) {
      onCopyNotice('Entrée supprimée du Journal ORP.');
    }
  };

  // Export Official Swiss ORP PDF (Format A4 Paysage conforme LACI)
  const handleExportOrpPdf = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm
    const margin = 14;

    // Header bar
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('FORMULAIRE OFFICIEL DE PREUVES DE RECHERCHES PERSONNELLES D\'EMPLOI', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(239, 68, 68); // Red-500
    doc.text('ASSURANCE-CHÔMAGE SUISSE (LACI / OACI) • CANTON DE VAUD • ORP LAUSANNE & RÉGION', margin, 17);

    doc.setTextColor(203, 213, 225);
    const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' });
    doc.text(
      `Période de contrôle : ${monthName.toUpperCase()} • Objectif mensuel : ${monthlyTarget} recherches • Réalisées : ${monthlyEntries.length}`,
      margin,
      23
    );

    // Candidate details box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, 32, pageWidth - margin * 2, 16, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Candidat(e) : ${userProfile.fullName || 'Marc Delarue'}`, margin + 4, 38);
    doc.text(`Adresse : ${userProfile.address || 'Avenue de Rumine 12'}, ${userProfile.city || 'Lausanne'} (VD)`, margin + 4, 44);

    doc.text(`N° AVS : ${avsNumber}`, 115, 38);
    doc.text(`Téléphone : ${userProfile.phone || '+41 79 123 45 67'}`, 115, 44);

    doc.text(`Conseiller / Agence : ${advisorRef}`, 200, 38);
    doc.text(`Statut légal : Conformité 100% directe (Zéro agence)`, 200, 44);

    // Table Header
    let y = 53;
    const colX = [margin, margin + 22, margin + 85, margin + 145, margin + 165, margin + 215, margin + 265];
    const colWidths = [22, 63, 60, 20, 50, 50];

    doc.setFillColor(220, 38, 38); // Swiss Red
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Date', colX[0] + 2, y + 4.8);
    doc.text('Employeur & Localité', colX[1] + 2, y + 4.8);
    doc.text('Genre d\'activité / Poste', colX[2] + 2, y + 4.8);
    doc.text('Taux', colX[3] + 2, y + 4.8);
    doc.text('Forme & Contact RH', colX[4] + 2, y + 4.8);
    doc.text('Résultat / Statut de la démarche', colX[5] + 2, y + 4.8);

    y += 7;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    monthlyEntries.forEach((entry, idx) => {
      if (y > pageHeight - 32) {
        doc.addPage();
        y = margin;
      }

      // Alternating background
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, pageWidth - margin * 2, 9.5, 'F');
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 9.5, pageWidth - margin, y + 9.5);

      doc.setTextColor(15, 23, 42);
      // Date
      doc.text(new Date(entry.date).toLocaleDateString('fr-CH'), colX[0] + 2, y + 6);

      // Company
      doc.setFont('helvetica', 'bold');
      const compSnippet = doc.splitTextToSize(`${entry.company} (${entry.location})`, 60);
      doc.text(compSnippet[0] || entry.company, colX[1] + 2, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Réf: ${entry.proofRef}`, colX[1] + 2, y + 8);

      // Title
      doc.setTextColor(15, 23, 42);
      const titleSnippet = doc.splitTextToSize(entry.jobTitle, 58);
      doc.text(titleSnippet[0] || entry.jobTitle, colX[2] + 2, y + 6);

      // Rate
      doc.text(entry.activityRate, colX[3] + 2, y + 6);

      // Channel & Contact
      doc.setTextColor(51, 65, 85);
      const contactSnippet = doc.splitTextToSize(`${entry.contactPerson} • ${entry.channelLabel}`, 48);
      doc.text(contactSnippet[0] || entry.contactPerson, colX[4] + 2, y + 6);

      // Result
      doc.setTextColor(15, 23, 42);
      const resultSnippet = doc.splitTextToSize(entry.resultLabel, 48);
      doc.text(resultSnippet[0] || entry.resultLabel, colX[5] + 2, y + 6);

      y += 9.5;
    });

    // Signature box at bottom
    const sigY = pageHeight - 22;
    doc.setDrawColor(148, 163, 184);
    doc.rect(margin, sigY, pageWidth - margin * 2, 16);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Je certifie sur l\'honneur l\'exactitude et l\'exhaustivité des recherches personnelles d\'emploi mentionnées ci-dessus (art. 17 LACI).',
      margin + 4,
      sigY + 5
    );

    doc.setFont('helvetica', 'normal');
    doc.text(`Fait à Lausanne, le ${new Date().toLocaleDateString('fr-CH')}`, margin + 4, sigY + 11);

    doc.text('Signature de l\'assuré(e) : ____________________________________', pageWidth - margin - 85, sigY + 11);

    const fileName = `Formulaire_ORP_Vaud_${selectedMonth}_${(userProfile.fullName || 'Candidat').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

    if (onCopyNotice) {
      onCopyNotice('Formulaire officiel ORP généré et téléchargé en PDF (A4 Paysage) !');
    }
  };

  // Export CSV / Excel
  const handleExportCsv = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Date;Employeur;Localite;Poste;Taux;Forme_Candidature;Contact_RH;Resultat_Statut;Reference_Preuve;Notes\r\n';

    monthlyEntries.forEach(entry => {
      const row = [
        entry.date,
        `"${entry.company.replace(/"/g, '""')}"`,
        `"${entry.location.replace(/"/g, '""')}"`,
        `"${entry.jobTitle.replace(/"/g, '""')}"`,
        `"${entry.activityRate}"`,
        `"${entry.channelLabel.replace(/"/g, '""')}"`,
        `"${entry.contactPerson.replace(/"/g, '""')}"`,
        `"${entry.resultLabel.replace(/"/g, '""')}"`,
        `"${entry.proofRef}"`,
        `"${(entry.notes || '').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(';') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Journal_ORP_${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onCopyNotice) {
      onCopyNotice('Journal ORP exporté au format CSV / Excel !');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Banner: Swiss Official Compliance (LACI / ORP) */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-red-800/60 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-red-900/60 border border-red-700/60 text-red-200 text-xs px-3 py-1 rounded-full font-semibold">
              <FileCheck2 className="w-3.5 h-3.5 text-red-400" />
              <span>Étape 8 : Preuves de Recherches d'Emploi & Justificatifs ORP / Vaud</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>Journal Officiel ORP / LACI</span>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                100% Conforme Vaud
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Générez en 1 clic vos preuves de recherches personnelles d'emploi conformes aux exigences de l'assurance-chômage (art. 17 LACI). Exportez le formulaire officiel au format PDF A4 Paysage ou au format Excel pour votre conseiller(ère) ORP à Lausanne.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleExportCsv}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-3 rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Exporter le tableau sous format Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportOrpPdf}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Générer le Formulaire Officiel (PDF)</span>
            </button>
          </div>
        </div>

        {/* Quota & Compliance Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-200">
                Période de contrôle :
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
              />

              <span className="text-slate-400 hidden sm:inline">•</span>

              <div className="flex items-center gap-1.5 text-slate-300">
                <span>Quota mensuel :</span>
                <select
                  value={monthlyTarget}
                  onChange={e => setMonthlyTarget(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value={8}>8 démarches</option>
                  <option value={10}>10 démarches (Standard VD)</option>
                  <option value={12}>12 démarches</option>
                  <option value={14}>14 démarches</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isTargetAchieved
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800'
                }`}
              >
                {isTargetAchieved ? '✓ Quota Mensuel Validé (100%)' : `⏳ ${monthlyTarget - totalCount} recherche(s) restante(s)`}
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80 relative">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isTargetAchieved ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-red-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              <strong>{totalCount}</strong> démarches enregistrées pour {new Date(`${selectedMonth}-01`).toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' })}
            </span>
            <span>
              Objectif ORP : <strong>{monthlyTarget} recherches directes / mois</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Table: Official ORP Columns */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tableau des Recherches Personnelles d'Emploi ({monthlyEntries.length})
              </h3>
              <p className="text-xs text-slate-400">
                Colonnes standardisées selon le canevas officiel de l'ORP Vaud
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajouter une Démarche Manuelle</span>
          </button>
        </div>

        {monthlyEntries.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-3">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <p>
              Aucune démarche enregistrée pour le mois de {new Date(`${selectedMonth}-01`).toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' })}.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs text-red-500 hover:underline font-semibold"
            >
              + Enregistrer une première postulation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-950/60">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Employeur & Localité</th>
                  <th className="py-3 px-3">Poste Brigué</th>
                  <th className="py-3 px-3">Taux</th>
                  <th className="py-3 px-3">Forme & Contact RH</th>
                  <th className="py-3 px-3">Résultat / Statut</th>
                  <th className="py-3 px-3">Preuve Réf.</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {monthlyEntries.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                      {new Date(entry.date).toLocaleDateString('fr-CH')}
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {entry.company}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        📍 {entry.location}
                      </div>
                    </td>

                    {/* Job Title */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {entry.jobTitle}
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-semibold">
                      {entry.activityRate}
                    </td>

                    {/* Channel & Contact */}
                    <td className="py-3.5 px-3">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {entry.contactPerson}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {entry.channelLabel}
                      </div>
                    </td>

                    {/* Result */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          entry.result === 'interview_scheduled'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-800/60'
                            : entry.result === 'followup_sent'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-800/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {entry.resultLabel}
                      </span>
                    </td>

                    {/* Proof Ref */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        {entry.proofRef}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer cette entrée"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legal & ORP Guidelines Footer Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-300 text-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Cadre Réglementaire & Bonnes Pratiques ORP dans le Canton de Vaud</span>
        </div>
        <p className="leading-relaxed text-slate-400 text-[11px]">
          Conformément à l'article 17 de la loi fédérale sur l'assurance-chômage (LACI), le demandeur d'emploi doit entreprendre tout ce qu'on peut raisonnablement exiger de lui pour trouver un emploi convenable. Dans le canton de Vaud, la remise des preuves de recherches d'emploi s'effectue généralement au plus tard le 5 du mois suivant. Ce document généré intègre des entreprises directes avec coordonnées précises et preuves horodatées.
        </p>
      </div>

      {/* Modal: Add Manual Entry */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 text-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Ajouter une Démarche au Journal ORP
                </h3>
                <p className="text-xs text-slate-400">
                  Enregistrez une candidature directe, un contact réseau ou une candidature spontanée.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Date de la démarche :</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Taux d'activité :</label>
                  <select
                    value={formActivityRate}
                    onChange={e => setFormActivityRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="100%">100%</option>
                    <option value="80-100%">80 - 100%</option>
                    <option value="80%">80%</option>
                    <option value="50-80%">50 - 80%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nom de l'Employeur / Entreprise :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: CHUV, Nestlé, Vaudoise Assurances, etc."
                  value={formCompany}
                  onChange={e => setFormCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Localité / Ville vaudoise :</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Lausanne, Ecublens, Morges..."
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Canal de transmission :</label>
                  <select
                    value={formChannel}
                    onChange={e => setFormChannel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="email">Courriel direct RH</option>
                    <option value="portal">Portail carrières employeur</option>
                    <option value="spontaneous">Candidature spontanée ciblée</option>
                    <option value="phone">Contact téléphonique & dossier</option>
                    <option value="network">Réseau direct en Romandie</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Titre exact du Poste brigué :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Chef de Projet Digital, Coordinateur SI, etc."
                  value={formJobTitle}
                  onChange={e => setFormJobTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Contact RH / Destinataire :</label>
                  <input
                    type="text"
                    placeholder="ex: Mme Sophie Mottaz (RH)"
                    value={formContactPerson}
                    onChange={e => setFormContactPerson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Statut du Résultat :</label>
                  <select
                    value={formResult}
                    onChange={e => setFormResult(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="waiting">En attente de réponse</option>
                    <option value="followup_sent">Relance courtoise J+7 effectuée</option>
                    <option value="interview_scheduled">Entretien d'embauche fixé</option>
                    <option value="rejected">Réponse négative reçue</option>
                    <option value="accepted">Offre reçue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Remarques ou détails :</label>
                <input
                  type="text"
                  placeholder="Dossier 3 volets complet transmis"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Enregistrer la démarche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
