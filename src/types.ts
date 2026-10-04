export type ContractType = 'CDI' | 'CDD' | 'Management de transition' | 'Stage' | 'Freelance' | 'Autre';

export type JobStatus =
  | 'to_validate'     // À valider
  | 'waiting_info'    // En attente d'info (Option B)
  | 'ready_to_send'   // Prêt à envoyer (100% match)
  | 'applied'        // Postulé
  | 'rejected';       // Refusé / Éliminé

export type PrecisionIndex = 'precise' | 'vague_to_verify';

export interface OptionBQuestion {
  id: string;
  skillName: string;
  category: 'methodology' | 'tool' | 'domain' | 'soft_skill' | 'language' | 'other';
  questionText: string;
  contextSnippet?: string;
  userResponse?: 'yes' | 'no' | 'partial';
  userDetails?: string;
  answeredAt?: string;
}

export interface ActionChannel {
  type: 'url' | 'email' | 'form' | 'unknown';
  target: string; // URL or email
  contactName?: string;
  notes?: string;
}

export interface MatchBreakdown {
  locationOk: boolean;
  locationReason: string;
  distanceKm?: number;
  directEmployerOk: boolean;
  directEmployerReason: string;
  agencyName?: string;
  legalOk: boolean;
  legalReason: string;
  contractRateOk: boolean;
  contractRateReason: string;
  freshnessOk: boolean;
  freshnessReason: string;
  rgpdComplianceOk?: boolean;
  rgpdReason?: string;
  daysOld: number;
  skillsMatchRate: number; // 0 - 100
  skillsMatched: string[];
  skillsMissing: string[];
  seniorityMatch: boolean;
  seniorityNote: string;
}

export interface TailoredDossier {
  language: 'FR' | 'EN' | 'DE';
  generatedAt: string;
  tailoredCV: {
    headline: string;
    summary: string;
    reorderedExperienceIds: string[];
    highlightedSkills: string[];
    salaryMention: string; // Always "À discuter"
  };
  motivationLetter: string;
  selectedAttachments: Array<{
    id: string;
    title: string;
    type: 'diploma' | 'certificate' | 'reference';
    relevanceReason: string;
  }>;
}

export interface JobOffer {
  id: string;
  url: string;
  title: string;
  company: string;
  location: string;
  recruiterName?: string; // Nom & Prénom du recruteur ou responsable RH
  recruiterTitle?: string; // Fonction du recruteur (ex: Responsable Recrutement)
  contractType: ContractType;
  activityRateMin: number;
  activityRateMax: number;
  publicationDate: string; // ISO date
  matchScore: number; // 0 - 100
  status: JobStatus;
  isEliminated: boolean;
  eliminationReason?: string;
  precisionIndex: PrecisionIndex;
  theWhy: string; // Synthèse de pertinence en 2 phrases
  actionChannel: ActionChannel;
  jobLanguage: 'FR' | 'EN' | 'DE';
  rawText: string;
  matchBreakdown: MatchBreakdown;
  optionBQuestions: OptionBQuestion[];
  tailoredDossier?: TailoredDossier;
  appliedDate?: string;
  appliedNotes?: string;
  historyLog: Array<{
    timestamp: string;
    action: string;
    details?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string; // e.g. "2021 - Présent"
  isCurrent: boolean;
  description: string;
  bulletPoints: string[];
  tags: string[];
}

export interface SwissWorkCertificate {
  id: string;
  company: string;
  period: string;
  rating: string; // e.g. "Très satisfaisant / Pleine et entière satisfaction"
  signatory: string;
  keywords: string[];
}

export interface Diploma {
  id: string;
  title: string;
  institution: string;
  year: number;
  level: string;
  domain: string;
}

export interface LearnedSkill {
  id: string;
  name: string;
  category: string;
  addedFromJobId: string;
  addedFromJobTitle: string;
  dateAdded: string;
  notes?: string;
}

export interface RgpdControlSettings {
  enabled: boolean;
  blockIllegalDataRequests: boolean; // Éliminer si l'annonce exige des données sensibles illégitimes
  localSovereigntyConsent: boolean; // Traitement 100% souverain local
  anonymizeDirectContacts: boolean; // Minimisation des données
}

export interface UserProfile {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  city: string; // "Lausanne"
  canton: string; // "VD"
  maxCommuteKm: number; // 25-30 km default
  nationalityStatus: 'swiss' | 'permit_c' | 'permit_b' | 'eu_efta' | 'other';
  nationalityLabel: string;
  activityRateMin: number;
  activityRateMax: number;
  contractPreferences: ContractType[];
  yearsOfExperience: number;
  salaryPosture: string; // "À discuter" (Option C standard suisse)
  summary: string;
  skills: {
    methodologies: string[];
    tools: string[];
    management: string[];
    languages: Array<{ name: string; level: string; code: 'FR' | 'EN' | 'DE' | 'IT' }>;
  };
  learnedSkills: LearnedSkill[];
  experiences: WorkExperience[];
  diplomas: Diploma[];
  swissCertificates: SwissWorkCertificate[];
  rgpdSettings?: RgpdControlSettings;
  cvFileName?: string;
  cvUploadedAt?: string;
  hasCvUploaded?: boolean;
}
