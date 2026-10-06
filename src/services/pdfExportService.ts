import jsPDF from 'jspdf';
import { JobOffer, UserProfile, TailoredDossier } from '../types';

export const pdfExportService = {
  /**
   * Generates and downloads the Official Swiss Motivation Letter as a high-fidelity PDF
   */
  generateMotivationLetterPdf(
    job: JobOffer,
    userProfile: UserProfile,
    letterText: string,
    recruiterName: string,
    recruiterTitle: string,
    candidateName: string
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxTextWidth = pageWidth - margin * 2;
    let y = margin;

    // 1. Candidate Header (Top Left - Swiss Standard)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(candidateName, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // Slate-600
    if (userProfile.address) {
      doc.text(userProfile.address, margin, y);
      y += 4;
    }
    const locationLine = `${userProfile.city || 'Lausanne'} (${userProfile.canton || 'VD'})`;
    doc.text(locationLine, margin, y);
    y += 4;
    doc.text(`Tél : ${userProfile.phone || '+41 79 000 00 00'} | Email : ${userProfile.email || 'contact@candidat.ch'}`, margin, y);
    y += 12;

    // 2. Recruiter & Company Block (Right-aligned, Swiss business standard)
    const rightMarginX = pageWidth - margin;
    const recLines: string[] = [
      job.company,
      recruiterName ? `À l'attention de ${recruiterName}` : "À l'attention de la Direction des RH",
      recruiterTitle || '',
      job.location ? `${job.location} (Suisse)` : 'Canton de Vaud (Suisse)'
    ].filter(Boolean);

    let recY = y;
    recLines.forEach(line => {
      doc.setFont('helvetica', line.startsWith('À l\'attention') ? 'bold' : 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(line, rightMarginX, recY, { align: 'right' });
      recY += 4.5;
    });

    y = Math.max(y + 24, recY + 8);

    // 3. Date & Place (Left-aligned, Swiss format)
    const todaySwiss = new Date().toLocaleDateString('fr-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Lausanne, le ${todaySwiss}`, margin, y);
    y += 9;

    // 4. Object Line (Bold, underlined or highlighted)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(220, 38, 38); // Red-600 accent
    const objectText = `Objet : Candidature au poste de ${job.title} – Référence : ${job.company}`;
    doc.text(objectText, margin, y);
    y += 8;

    // 5. Letter Content (Splits paragraphs and applies clean line height)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    // Clean body text by stripping redundant headers already printed above
    const rawParagraphs = letterText.split('\n\n').filter(p => p.trim().length > 0);

    rawParagraphs.forEach(p => {
      // Skip candidate's contact info or recipient if repeated in raw text
      if (
        p.includes(userProfile.email || '') ||
        p.startsWith("À l'attention") ||
        p.startsWith('Objet :') ||
        p.startsWith('Lausanne, le')
      ) {
        return;
      }

      const wrappedLines = doc.splitTextToSize(p.trim(), maxTextWidth);

      // Check if new page needed
      if (y + wrappedLines.length * 4.5 > 275) {
        doc.addPage();
        y = margin;
      }

      doc.text(wrappedLines, margin, y);
      y += wrappedLines.length * 4.5 + 4;
    });

    // 6. Applicant Signature Block (Guaranteed Swiss standard)
    if (y + 20 > 275) {
      doc.addPage();
      y = margin;
    }

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(candidateName, margin, y);
    y += 4.5;

    if (userProfile.jobTitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(userProfile.jobTitle, margin, y);
      y += 6;
    }

    // 7. Annexes Mention
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text('Annexes : Curriculum Vitae complet, Certificats de travail suisses, Diplômes.', margin, y);

    // Save PDF
    const cleanFileName = `Lettre_Motivation_${candidateName.replace(/\s+/g, '_')}_${job.company.replace(/\s+/g, '_')}.pdf`;
    doc.save(cleanFileName);
  },

  /**
   * Generates and downloads the Tailored Swiss CV as an elegant PDF
   */
  generateTailoredCvPdf(
    job: JobOffer,
    userProfile: UserProfile,
    candidateName: string
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header Background Accent Banner
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 38, 'F');

    // Candidate Name in Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(candidateName.toUpperCase(), margin, 14);

    // Job Title Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(239, 68, 68); // Red-500 accent
    const targetTitle = `${userProfile.jobTitle || job.title} • Candidature ciblée : ${job.company}`;
    doc.text(targetTitle, margin, 21);

    // Contact info bar
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225); // Slate-300
    const contactLine = `${userProfile.city || 'Lausanne'} (${userProfile.canton || 'VD'}) | ${userProfile.phone || '+41 79 000 00 00'} | ${userProfile.email || 'contact@candidat.ch'} | Permis suisse / Nationalité`;
    doc.text(contactLine, margin, 28);

    y = 46;

    // 1. Profil & Alignement Stratégique (Summary)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('PROFIL & SYNTHÈSE DE COMPATIBILITÉ SUISSE', margin, y);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 1.5, margin + 40, y + 1.5);
    y += 6;

    const summaryText =
      job.tailoredDossier?.tailoredCV?.summary ||
      `${candidateName}, professionnel confirmé (${userProfile.yearsOfExperience || 'plusieurs'} ans d'expérience en Suisse romande) basé à ${userProfile.city || 'Lausanne'}. Parcours rigoureux parfaitement aligné avec les exigences du poste chez ${job.company}.`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const wrappedSummary = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(wrappedSummary, margin, y);
    y += wrappedSummary.length * 4.2 + 6;

    // 2. Compétences Clés Mises en Avant
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('COMPÉTENCES CLÉS CIBLÉES', margin, y);
    doc.setDrawColor(220, 38, 38);
    doc.line(margin, y + 1.5, margin + 40, y + 1.5);
    y += 6;

    const skills = job.tailoredDossier?.tailoredCV?.highlightedSkills?.length
      ? job.tailoredDossier.tailoredCV.highlightedSkills
      : [
          ...(userProfile.skills.methodologies || []).slice(0, 3),
          ...(userProfile.skills.tools || []).slice(0, 3),
          ...(userProfile.skills.management || []).slice(0, 2)
        ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    const skillsGridText = skills.map(s => `✓ ${s}`).join('   •   ');
    const wrappedSkills = doc.splitTextToSize(skillsGridText, contentWidth);
    doc.text(wrappedSkills, margin, y);
    y += wrappedSkills.length * 4.2 + 6;

    // 3. Parcours Professionnel & Expériences Clés
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('EXPÉRIENCES PROFESSIONNELLES', margin, y);
    doc.setDrawColor(220, 38, 38);
    doc.line(margin, y + 1.5, margin + 40, y + 1.5);
    y += 6;

    const experiences = userProfile.experiences || [];
    experiences.forEach(exp => {
      if (y > 255) {
        doc.addPage();
        y = margin;
      }

      // Title & Period
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${exp.title} – ${exp.company}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(exp.period || '', pageWidth - margin, y, { align: 'right' });
      y += 4;

      if (exp.location) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(exp.location, margin, y);
        y += 4;
      }

      // Description
      if (exp.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        const wrappedDesc = doc.splitTextToSize(exp.description, contentWidth);
        doc.text(wrappedDesc, margin, y);
        y += wrappedDesc.length * 4 + 3;
      }
    });

    // 4. Diplômes & Certificats de travail suisses
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('FORMATIONS & CERTIFICATS DE TRAVAIL SUISSES', margin, y);
    doc.setDrawColor(220, 38, 38);
    doc.line(margin, y + 1.5, margin + 40, y + 1.5);
    y += 6;

    const diplomas = userProfile.diplomas || [];
    diplomas.forEach(d => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${d.title} – ${d.institution} (${d.year})`, margin, y);
      y += 4.5;
    });

    const certs = userProfile.swissCertificates || [];
    certs.forEach(c => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`• Certificat employeur suisse : ${c.company} (${c.period}) – Réf. vérifiée`, margin, y);
      y += 4.5;
    });

    // 5. Posture Salariale Suisse (Option C Standard)
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9); // Amber-700
    doc.text('Prétentions salariales : À discuter (Option C vaudoise / selon grille et responsabilités)', margin, y);

    // Save CV PDF
    const cleanFileName = `CV_${candidateName.replace(/\s+/g, '_')}_${job.company.replace(/\s+/g, '_')}.pdf`;
    doc.save(cleanFileName);
  },

  /**
   * Prepares and opens the native email application with standard Swiss formatting
   */
  openDirectEmailApplication(
    job: JobOffer,
    userProfile: UserProfile,
    candidateName: string
  ): { targetEmail: string; subject: string; body: string; mailtoUrl: string } {
    const targetEmail =
      job.actionChannel?.type === 'email' && job.actionChannel.target
        ? job.actionChannel.target
        : 'rh@' + (job.company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'entreprise') + '.ch';

    const subject = `Candidature : ${job.title} – ${candidateName}`;

    const body = `Madame, Monsieur,

Veuillez trouver ci-joint mon dossier complet de candidature pour le poste de ${job.title} au sein de votre organisation ${job.company}.

Mon dossier réunit :
- Mon Curriculum Vitae adapté aux exigences de votre annonce
- Ma Lettre de motivation personnalisée
- Mes certificats de travail et diplômes suisses

Restant à votre entière disposition pour convenir d'un entretien ou pour vous fournir tout renseignement complémentaire.

Dans cette attente, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${candidateName}
${userProfile.jobTitle ? `${userProfile.jobTitle}\n` : ''}${userProfile.phone ? `Tél : ${userProfile.phone}\n` : ''}${userProfile.email ? `Email : ${userProfile.email}\n` : ''}${userProfile.city || 'Lausanne'} (${userProfile.canton || 'VD'})`;

    const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    return {
      targetEmail,
      subject,
      body,
      mailtoUrl
    };
  }
};
