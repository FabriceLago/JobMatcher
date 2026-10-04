import { UserProfile } from '../types';

export const defaultUserProfile: UserProfile = {
  fullName: '',
  jobTitle: 'Candidat (en attente de votre CV)',
  email: '',
  phone: '',
  address: '',
  city: 'Lausanne',
  canton: 'VD',
  maxCommuteKm: 30,
  nationalityStatus: 'permit_c',
  nationalityLabel: 'Permis C (Établissement permanent en Suisse)',
  activityRateMin: 80,
  activityRateMax: 100,
  contractPreferences: ['CDI', 'CDD', 'Management de transition'],
  yearsOfExperience: 0,
  salaryPosture: 'À discuter (Option C - selon barèmes vaudois et responsabilités)',
  summary: 'Importez votre CV (PDF ou Word) pour extraire automatiquement vos expériences, compétences et certifications.',
  skills: {
    methodologies: [],
    tools: [],
    management: [],
    languages: [
      { name: 'Français', level: 'Courant / Bilingue', code: 'FR' },
      { name: 'Anglais', level: 'Professionnel', code: 'EN' }
    ]
  },
  learnedSkills: [],
  experiences: [],
  diplomas: [],
  swissCertificates: [],
  rgpdSettings: {
    enabled: true,
    blockIllegalDataRequests: true,
    localSovereigntyConsent: true,
    anonymizeDirectContacts: false
  },
  hasCvUploaded: false
};
