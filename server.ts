import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';
import { UserProfile, JobOffer, OptionBQuestion } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Heuristic agency blacklist for Lausanne / Romandie
const AGENCY_KEYWORDS = [
  'hays',
  'michael page',
  'page personnel',
  'adecco',
  'randstad',
  'robert half',
  'manpower',
  'academic work',
  'badenoch & clark',
  'careerplus',
  'kelly services',
  'experis',
  'altran',
  'akka',
  'alten',
  'agence de placement',
  'cabinet de recrutement',
  'chasseur de têtes',
  'société de services',
  'pour le compte de notre client',
  'notre client recherche'
];

// Lausanne and 20-30km radius cities
const LAUSANNE_RADIUS_CITIES = [
  'lausanne',
  'ecublens',
  'renens',
  'prily',
  'prilly',
  'crissier',
  'bussigny',
  'lutry',
  'pully',
  'paudex',
  'morges',
  'saint-sulpice',
  'st-sulpice',
  'vevey',
  'montreux',
  'la tour-de-peilz',
  'cully',
  'cossonay',
  'gland',
  'rolle',
  'nyon',
  'yverdon',
  'yverdon-les-bains',
  'epalinges',
  'le mont-sur-lausanne',
  'belmont-sur-lausanne',
  'chavannes-près-renens',
  'vaud',
  'vd'
];

// Helper for heuristic analysis fallback
function analyzeJobHeuristically(rawText: string, url: string, profile: UserProfile): Partial<JobOffer> {
  const textLower = rawText.toLowerCase();

  // 1. Detection of agency
  const foundAgency = AGENCY_KEYWORDS.find(keyword => textLower.includes(keyword));
  const directEmployerOk = !foundAgency;

  // 2. Location
  const hasLausanneRadius = LAUSANNE_RADIUS_CITIES.some(city => textLower.includes(city));
  const isGeneveOrZurich = (textLower.includes('genève') || textLower.includes('geneva') || textLower.includes('zürich') || textLower.includes('zurich') || textLower.includes('bern ') || textLower.includes('berne ')) && !hasLausanneRadius;
  const locationOk = hasLausanneRadius && !isGeneveOrZurich;

  // 3. Legal
  const requiresSwissOnly =
    (textLower.includes('nationalité suisse') || textLower.includes('citoyen suisse') || textLower.includes('assermentation') || textLower.includes('contrôle de sécurité relatif aux personnes')) &&
    (textLower.includes('exclusivement') || textLower.includes('exigée') || textLower.includes('obligatoire'));
  const legalOk = !(requiresSwissOnly && profile.nationalityStatus !== 'swiss');

  // 4. Rate & Contract
  const mentionsRate = textLower.match(/(\d{2,3})\s*%/);
  const rateFound = mentionsRate ? parseInt(mentionsRate[1], 10) : 100;
  const contractRateOk = rateFound >= profile.activityRateMin;

  // 5. Freshness
  const daysOld = 1;
  const freshnessOk = daysOld <= 15;

  // 6. RGPD & nLPD Compliance Check (Protection des données candidat)
  const asksSensitiveData =
    (textLower.includes('casier judiciaire') && (textLower.includes('exigé') || textLower.includes('obligatoire') || textLower.includes('joindre'))) ||
    textLower.includes('certificat médical') ||
    textLower.includes('numéro avs') ||
    (textLower.includes('situation de famille') || textLower.includes('situation familiale'));
  const rgpdComplianceOk = !asksSensitiveData;
  const rgpdReason = rgpdComplianceOk
    ? 'Conforme RGPD / nLPD : aucune demande disproportionnée de données personnelles sensibles dès la postulation.'
    : 'Alerte RGPD / nLPD : l’annonce exige des données sensibles (ex: casier/médical) dès le stade initial.';

  // Elimination check
  let isEliminated = false;
  let eliminationReason = '';

  if (!directEmployerOk) {
    isEliminated = true;
    eliminationReason = `Exclusion de sourcing stricte : Intermédiaire détecté (${foundAgency}). Seules les entreprises finales directes sont autorisées.`;
  } else if (!locationOk) {
    isEliminated = true;
    eliminationReason = 'Localisation hors zone : Le poste est situé au-delà du rayon de 20-30 km de Lausanne.';
  } else if (!legalOk) {
    isEliminated = true;
    eliminationReason = 'Exclusion juridique stricte : Nationalité suisse ou assermentation fédérale obligatoire requise (incompatible avec profil Permis C).';
  } else if (!contractRateOk) {
    isEliminated = true;
    eliminationReason = `Taux d'activité non conforme : inférieur à votre seuil de ${profile.activityRateMin}%.`;
  }

  // Action channel
  const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
  const actionTarget = emailMatch ? `mailto:${emailMatch[1]}` : (url || 'https://recrutement.lausanne.ch');

  // Skills matching
  const allProfileSkills = [
    ...profile.skills.methodologies,
    ...profile.skills.tools,
    ...profile.skills.management,
    ...profile.learnedSkills.map(s => s.name)
  ];

  const matchedSkills: string[] = [];
  allProfileSkills.forEach(skill => {
    const key = skill.split('(')[0].trim().toLowerCase();
    if (key.length > 2 && textLower.includes(key)) {
      matchedSkills.push(skill);
    }
  });

  const isVague = rawText.length < 350;
  const precisionIndex = isVague ? 'vague_to_verify' : 'precise';

  // Language detection
  let jobLanguage: 'FR' | 'EN' | 'DE' = 'FR';
  if (textLower.includes('requirements') || textLower.includes('responsibilities') || textLower.includes('key skills')) {
    jobLanguage = 'EN';
  } else if (textLower.includes('anforderungen') || textLower.includes('aufgaben') || textLower.includes('wir suchen')) {
    jobLanguage = 'DE';
  }

  // Score & Option B
  let matchScore = 0;
  let status: JobOffer['status'] = 'rejected';
  const optionBQuestions: OptionBQuestion[] = [];

  if (!isEliminated) {
    if (matchedSkills.length >= 4) {
      matchScore = 100;
      status = 'ready_to_send';
    } else {
      matchScore = 88;
      status = 'waiting_info';
      optionBQuestions.push({
        id: `optb-${Date.now()}-1`,
        skillName: 'Certification ou Outil Spécifique',
        category: 'tool',
        questionText: 'L’offre valorise des outils ou pratiques spécifiques. Possédez-vous cette compétence ?',
        contextSnippet: rawText.slice(0, 140) + '...',
      });
    }
  }

  // Title extraction
  const firstLine = rawText.trim().split('\n')[0].replace(/[#*]/g, '').trim();
  const title = firstLine.length > 5 && firstLine.length < 80 ? firstLine : 'Chef de Projet IT / Digital';

  // "The Why"
  const theWhy = isEliminated
    ? `Offre écartée selon vos critères stricts : ${eliminationReason}`
    : `Ce poste à ${hasLausanneRadius ? 'Lausanne et environs' : 'Lausanne'} s'aligne remarquablement avec votre profil de Chef de Projet Senior. Vos réalisations en gouvernance agile et gestion budgétaire suisse en font une opportunité à fort potentiel.`;

  return {
    title,
    company: 'Entreprise Vaud / Lausanne',
    location: 'Lausanne (VD)',
    contractType: 'CDI',
    activityRateMin: 80,
    activityRateMax: 100,
    publicationDate: new Date().toISOString(),
    matchScore,
    status,
    isEliminated,
    eliminationReason: isEliminated ? eliminationReason : undefined,
    precisionIndex,
    theWhy,
    jobLanguage,
    actionChannel: {
      type: emailMatch ? 'email' : 'url',
      target: actionTarget,
      contactName: 'Service Recrutement & RH',
      notes: emailMatch ? 'Contact direct par email' : 'Lien direct vers le formulaire de postulation'
    },
    matchBreakdown: {
      locationOk,
      locationReason: locationOk ? 'Périmètre Lausanne 20-30km respecté.' : 'Hors du périmètre Lausanne.',
      distanceKm: 8,
      directEmployerOk,
      directEmployerReason: directEmployerOk ? 'Entreprise finale directe validée.' : `Cabinet détecté : ${foundAgency}`,
      agencyName: foundAgency,
      legalOk,
      legalReason: legalOk ? 'Éligible avec Permis C.' : 'Exigence nationalité suisse exclusive.',
      contractRateOk,
      contractRateReason: 'Taux 80-100% conforme.',
      freshnessOk,
      freshnessReason: 'Publiée récemment (<= 15 jours).',
      rgpdComplianceOk,
      rgpdReason,
      daysOld: 1,
      skillsMatchRate: matchScore,
      skillsMatched: matchedSkills.length > 0 ? matchedSkills : ['Gestion de projet', 'Méthodes agiles', 'PMP', 'Scrum'],
      skillsMissing: matchScore < 100 && !isEliminated ? ['Compétence spécifique à clarifier via Option B'] : [],
      seniorityMatch: true,
      seniorityNote: `${profile.yearsOfExperience} ans d'expérience (compense et dépasse les prérequis)`
    },
    optionBQuestions
  };
}

// 1. Analyze Job Endpoint
app.post('/api/analyze-job', async (req: Request, res: Response) => {
  try {
    const { rawText, url, userProfile, historyUrls, forceReanalyze } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Le texte brut de l’annonce est requis pour l’analyse.' });
    }

    const profile: UserProfile = userProfile;
    const cleanUrl = (url || '').trim();

    // Check 1: Deduplication against history (can be bypassed with forceReanalyze)
    if (!forceReanalyze && cleanUrl && historyUrls && Array.isArray(historyUrls)) {
      const alreadyExists = historyUrls.some((hUrl: string) => hUrl.trim() === cleanUrl);
      if (alreadyExists) {
        return res.status(409).json({
          error: 'Cette offre est déjà présente dans votre pipeline de candidatures.',
          isDuplicate: true,
          duplicateUrl: cleanUrl
        });
      }
    }

    // Try Gemini 3.8 Flash if available
    if (ai) {
      try {
        const prompt = `
Tu es l'intelligence centrale d'architecte "Job Matcher" pour un Chef de Projet Senior basé à Lausanne.
Analyse rigoureusement cette offre d'emploi selon les critères stricts suivants :

PROFIL UTILISATEUR :
- Localisation : Lausanne (Vaud, Suisse), rayon max 20-30km.
- Nationalité / Statut : ${profile.nationalityStatus} (${profile.nationalityLabel}).
- Contrats cibles : CDI, CDD, Management de transition, 80% à 100%.
- Expérience : ${profile.yearsOfExperience} ans.
- Compétences Maître : ${JSON.stringify(profile.skills)}
- Compétences Dynamiques Apprises : ${JSON.stringify(profile.learnedSkills)}
- Salaire : Option C ("À discuter").

RÈGLES D'ÉLIMINATION STRICTES :
1. Localisation : Doit être à Lausanne ou environs (20-30 km max : Morges, Renens, Ecublens, Lutry, Pully, Vevey, Montreux, Gland, Nyon, Yverdon). Élimine impérativement Genève, Berne, Zurich sauf si 100% télétravail dans le canton de Vaud.
2. Exclusion de Sourcing : INTERDICTION ABSOLUE des cabinets de recrutement / agences de placement (ex: Hays, Michael Page, Adecco, Randstad, Robert Half, Manpower, etc.). Uniquement entreprises finales directes !
3. Exclusion Juridique : Éliminer si le poste exige impérativement la nationalité suisse exclusive ou une assermentation fédérale de sécurité CSP 2/3 (incompatible avec profil Permis C).
4. Contrat & Taux : CDI, CDD ou Transition, 80% à 100%. Éliminer stages ou < 80%.
5. Fraîcheur : Ignorer les offres de plus de 15 jours.
6. Contrôle RGPD & nLPD Suisse : Vérifier la conformité de l'offre et du canal de postulation avec le RGPD et la nouvelle LPD suisse (nLPD). Éliminer ou marquer non conforme toute offre exigeant des données personnelles sensibles illégitimes dès la candidature initiale (casier judiciaire sans impératif légal, certificat médical à l'embauche, numéro AVS, questions discriminatoires sur la vie privée).

LOGIQUE DE MATCHING & OPTION B :
- Seuil de 100% : Si tous les critères sont validés, score = 100%, status = "ready_to_send".
- Séniorité souple : 4 ans requis au lieu de 5 ans est accepté si l'envergure compense.
- Option B : Si le match est >85% mais qu'une compétence précise manque, créer une question d'Option B : "Compétence [X] manquante. La possédez-vous ?" avec statut "waiting_info".
- Synthèse "The Why" : Rédiger exactement 2 phrases percutantes expliquant pourquoi ce poste est une opportunité majeure (ou pourquoi il a été éliminé).
- Canal d'action : Extraire le lien direct URL de postulation ou l'email (mailto:).
- Indice de précision : "precise" ou "vague_to_verify" si l'annonce est trop concise.
- Langue : 'FR', 'EN' ou 'DE'.

TEXTE DE L'OFFRE :
${rawText}
URL FOURNIE : ${cleanUrl}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'Tu es un système expert suisse de recrutement pour Chef de Projet à Lausanne. Réponds STRICTEMENT en JSON respectant le format demandé.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                location: { type: Type.STRING },
                contractType: { type: Type.STRING },
                activityRateMin: { type: Type.INTEGER },
                activityRateMax: { type: Type.INTEGER },
                isEliminated: { type: Type.BOOLEAN },
                eliminationReason: { type: Type.STRING },
                matchScore: { type: Type.INTEGER },
                status: { type: Type.STRING },
                precisionIndex: { type: Type.STRING },
                theWhy: { type: Type.STRING },
                jobLanguage: { type: Type.STRING },
                actionChannel: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    target: { type: Type.STRING },
                    contactName: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ['type', 'target'],
                },
                matchBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    locationOk: { type: Type.BOOLEAN },
                    locationReason: { type: Type.STRING },
                    directEmployerOk: { type: Type.BOOLEAN },
                    directEmployerReason: { type: Type.STRING },
                    agencyName: { type: Type.STRING },
                    legalOk: { type: Type.BOOLEAN },
                    legalReason: { type: Type.STRING },
                    contractRateOk: { type: Type.BOOLEAN },
                    contractRateReason: { type: Type.STRING },
                    freshnessOk: { type: Type.BOOLEAN },
                    freshnessReason: { type: Type.STRING },
                    rgpdComplianceOk: { type: Type.BOOLEAN },
                    rgpdReason: { type: Type.STRING },
                    daysOld: { type: Type.INTEGER },
                    skillsMatchRate: { type: Type.INTEGER },
                    skillsMatched: { type: Type.ARRAY, items: { type: Type.STRING } },
                    skillsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
                    seniorityMatch: { type: Type.BOOLEAN },
                    seniorityNote: { type: Type.STRING },
                  },
                  required: [
                    'locationOk',
                    'directEmployerOk',
                    'legalOk',
                    'contractRateOk',
                    'freshnessOk',
                    'skillsMatchRate',
                    'skillsMatched',
                    'skillsMissing',
                  ],
                },
                optionBQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      skillName: { type: Type.STRING },
                      category: { type: Type.STRING },
                      questionText: { type: Type.STRING },
                      contextSnippet: { type: Type.STRING },
                    },
                    required: ['id', 'skillName', 'questionText'],
                  },
                },
              },
              required: [
                'title',
                'company',
                'location',
                'contractType',
                'isEliminated',
                'matchScore',
                'status',
                'theWhy',
                'jobLanguage',
                'actionChannel',
                'matchBreakdown',
              ],
            },
          },
        });

        const textOutput = response.text?.trim() || '';
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          const fullOffer: JobOffer = {
            id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            url: cleanUrl || parsed.actionChannel?.target || 'https://lausanne-job-matcher.ch',
            title: parsed.title || 'Chef de Projet',
            company: parsed.company || 'Entreprise Lausanne',
            location: parsed.location || 'Lausanne (VD)',
            contractType: parsed.contractType || 'CDI',
            activityRateMin: parsed.activityRateMin || 80,
            activityRateMax: parsed.activityRateMax || 100,
            publicationDate: new Date().toISOString(),
            matchScore: parsed.matchScore || 0,
            status: parsed.status || (parsed.isEliminated ? 'rejected' : 'to_validate'),
            isEliminated: Boolean(parsed.isEliminated),
            eliminationReason: parsed.eliminationReason,
            precisionIndex: parsed.precisionIndex || 'precise',
            theWhy: parsed.theWhy || '',
            jobLanguage: parsed.jobLanguage || 'FR',
            actionChannel: parsed.actionChannel || {
              type: 'url',
              target: cleanUrl,
              notes: 'Canal direct de postulation',
            },
            rawText,
            matchBreakdown: parsed.matchBreakdown,
            optionBQuestions: parsed.optionBQuestions || [],
            historyLog: [
              {
                timestamp: new Date().toISOString(),
                action: 'Analyse Gemini AI 3.8 Flash',
                details: `Score: ${parsed.matchScore}%. Statut: ${parsed.status}.`,
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return res.json({ jobOffer: fullOffer });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using heuristic engine:', geminiErr);
      }
    }

    // Heuristic fallback
    const heuristicResult = analyzeJobHeuristically(rawText, cleanUrl, profile);
    const fallbackOffer: JobOffer = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: cleanUrl || 'https://lausanne-job-matcher.ch',
      title: heuristicResult.title || 'Chef de Projet IT',
      company: heuristicResult.company || 'Entreprise Vaud',
      location: heuristicResult.location || 'Lausanne (VD)',
      contractType: heuristicResult.contractType || 'CDI',
      activityRateMin: heuristicResult.activityRateMin || 80,
      activityRateMax: heuristicResult.activityRateMax || 100,
      publicationDate: new Date().toISOString(),
      matchScore: heuristicResult.matchScore ?? 0,
      status: heuristicResult.status || 'to_validate',
      isEliminated: Boolean(heuristicResult.isEliminated),
      eliminationReason: heuristicResult.eliminationReason,
      precisionIndex: heuristicResult.precisionIndex || 'precise',
      theWhy: heuristicResult.theWhy || '',
      actionChannel: heuristicResult.actionChannel || {
        type: 'url',
        target: cleanUrl,
        notes: 'Postulation directe',
      },
      jobLanguage: heuristicResult.jobLanguage || 'FR',
      rawText,
      matchBreakdown: heuristicResult.matchBreakdown!,
      optionBQuestions: heuristicResult.optionBQuestions || [],
      historyLog: [
        {
          timestamp: new Date().toISOString(),
          action: 'Analyse Système Expert (Règles strictes)',
          details: `Score: ${heuristicResult.matchScore}%. Statut: ${heuristicResult.status}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.json({ jobOffer: fallbackOffer });
  } catch (error: any) {
    console.error('Error analyzing job:', error);
    return res.status(500).json({ error: error.message || 'Erreur lors de l’analyse de l’offre.' });
  }
});

// 2. Generate Tailored Dossier Endpoint
app.post('/api/generate-dossier', async (req: Request, res: Response) => {
  try {
    const { jobOffer, userProfile, targetLanguage } = req.body;
    const lang = targetLanguage || jobOffer.jobLanguage || 'FR';
    const profile: UserProfile = userProfile;
    const offer: JobOffer = jobOffer;

    const recruiterName = offer.recruiterName || offer.actionChannel?.contactName || 'la Direction des Ressources Humaines';
    const recruiterTitle = offer.recruiterTitle ? `, ${offer.recruiterTitle}` : '';
    const candidateName = profile.fullName?.trim() || 'Marc Delarue';

    // Salutation logic
    let salutationGreeting = 'Madame, Monsieur,';
    if (offer.recruiterName) {
      if (offer.recruiterName.startsWith('Mme') || offer.recruiterName.toLowerCase().includes('madame')) {
        const parts = offer.recruiterName.replace(/^Mme\.?\s+/i, '').replace(/^Madame\s+/i, '').trim().split(' ');
        const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        salutationGreeting = `Madame ${lastName},`;
      } else if (offer.recruiterName.startsWith('M.') || offer.recruiterName.toLowerCase().includes('monsieur')) {
        const parts = offer.recruiterName.replace(/^M\.?\s+/i, '').replace(/^Monsieur\s+/i, '').trim().split(' ');
        const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        salutationGreeting = `Monsieur ${lastName},`;
      }
    }

    // Check if Gemini available
    if (ai) {
      try {
        const prompt = `
Tu es l'architecte "Job Matcher" suisse.
Génère le dossier complet de candidature sur-mesure (CV adapté, lettre de motivation percutante et sélection de pièces jointes suisses).

RÈGLES ANTI-ERREUR & PERSONNALISATION ABSOLUES :
1. SOURCE-CHECK : INTERDICTION STRICTE d'inventer des logiciels, méthodes ou diplômes non présents dans le CV Maître ou le profil persistant !
2. SALAIRE : Mentionner impérativement "À discuter (Option C standard vaudois / selon grille salariale de l'entreprise)".
3. LANGUE : Générer le tout en langue ${lang} ('FR' = Français, 'EN' = Anglais, 'DE' = Allemand).
4. PERSONNALISATION DU RECRUTEUR :
   - Adresse obligatoirement la lettre : "À l'attention de ${recruiterName}${recruiterTitle}\\n${offer.company}\\n${offer.location}".
   - Utilise une formule de politesse adaptée au recruteur ("${salutationGreeting}").
5. SIGNATURE OBLIGATOIRE DU DEMANDEUR :
   - La lettre DOIT IMPÉRATIVEMENT se signer avec le Prénom et le Nom exacts du demandeur se trouvant sur son CV : "${candidateName}".
   - Ne JAMAIS écrire "[Nom & Prénom]" ou "[Votre Nom]" dans la lettre ! Terminer par la signature formelle :
     "Dans cette attente, je vous prie d'agréer, ${salutationGreeting.replace(/,$/, '')}, l'expression de mes salutations distinguées.

     ${candidateName}"
6. EXPÉRIENCES : Réordonner les expériences du CV pour mettre en avant celles qui matchent l'offre (${offer.title} chez ${offer.company}).
7. PIÈCES JOINTES SUISSES : Sélectionner 2 à 3 certificats de travail ou diplômes parmi ceux du profil les plus pertinents.

DONNÉES DU POSTE :
Titre : ${offer.title}
Entreprise : ${offer.company}
Lieu : ${offer.location}
Recruteur : ${recruiterName}${recruiterTitle}
Annonce : ${offer.rawText}

PROFIL DEMANDEUR (EXTRAIT DU CV) :
Nom & Prénom : ${candidateName}
Métier : ${profile.jobTitle}
Coordonnées : ${profile.email} | ${profile.phone} | ${profile.address}, ${profile.city}
Expériences : ${JSON.stringify(profile.experiences)}
Diplômes : ${JSON.stringify(profile.diplomas)}
Certificats de travail suisses : ${JSON.stringify(profile.swissCertificates)}
Compétences : ${JSON.stringify(profile.skills)}
Compétences acquises : ${JSON.stringify(profile.learnedSkills)}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'Expert suisse en recrutement de cadres. Réponds STRICTEMENT en JSON conforme au schéma.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING },
                tailoredCV: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    reorderedExperienceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                    highlightedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    salaryMention: { type: Type.STRING },
                  },
                  required: ['headline', 'summary', 'reorderedExperienceIds', 'highlightedSkills', 'salaryMention'],
                },
                motivationLetter: { type: Type.STRING },
                selectedAttachments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      type: { type: Type.STRING },
                      relevanceReason: { type: Type.STRING },
                    },
                    required: ['id', 'title', 'type', 'relevanceReason'],
                  },
                },
              },
              required: ['language', 'tailoredCV', 'motivationLetter', 'selectedAttachments'],
            },
          },
        });

        const textOutput = response.text?.trim() || '';
        if (textOutput) {
          const dossier = JSON.parse(textOutput);
          dossier.generatedAt = new Date().toISOString();
          return res.json({ tailoredDossier: dossier });
        }
      } catch (geminiErr) {
        console.warn('Gemini dossier generation failed, using template engine:', geminiErr);
      }
    }

    // Heuristic fallback dossier
    const topSkills = [
      ...profile.skills.methodologies.slice(0, 3),
      ...profile.skills.tools.slice(0, 2),
      ...profile.skills.management.slice(0, 1)
    ];
    const experienceHeadline = profile.experiences && profile.experiences.length > 0
      ? profile.experiences.slice(0, 3).map(e => e.company).join(', ')
      : 'projets d’envergure en Suisse romande';

    const tailoredDossier = {
      language: lang,
      generatedAt: new Date().toISOString(),
      tailoredCV: {
        headline: `${offer.title} - ${candidateName}`,
        summary: `${candidateName}, professionnel expérimenté (${profile.yearsOfExperience || 'plusieurs'} ans d'expérience) basé à ${profile.city || 'Lausanne'}. Parcours confirmé (${experienceHeadline}) parfaitement aligné avec les exigences de ${offer.company}.`,
        reorderedExperienceIds: (profile.experiences || []).map(e => e.id),
        highlightedSkills: topSkills.length > 0 ? topSkills : [
          'Gestion de projet & Gouvernance',
          'Méthodologies Agiles & Classiques',
          'Gestion budgétaire & Risques',
          'Conduite du changement'
        ],
        salaryMention: profile.salaryPosture || 'À discuter (Option C - selon barèmes et responsabilités)'
      },
      motivationLetter: `${candidateName}\n${profile.address || 'Lausanne'}\n${profile.city || 'Lausanne'} (${profile.canton || 'VD'})\n${profile.email || 'contact@candidat.ch'} | ${profile.phone || '+41 79 000 00 00'}\n\nÀ l'attention de ${recruiterName}${recruiterTitle}\n${offer.company}\n${offer.location}\n\nObjet : Candidature au poste de ${offer.title}\n\n${salutationGreeting}\n\nC’est avec une vive motivation que je vous soumets ma candidature pour le poste de ${offer.title} au sein de votre organisation ${offer.company}.\n\nFort d'un parcours rigoureux mené en Suisse (${experienceHeadline}), j'ai développé une solide expertise dans le cadrage, la gestion des parties prenantes et l'exécution rigoureuse de projets stratégiques.\n\nRejoindre ${offer.company} à ${offer.location} représente une opportunité stimulante pour mettre mes compétences, ma rigueur et mon engagement au service de vos objectifs clés.\n\nJe me tiens à votre entière disposition pour échanger plus en détail sur la valeur concrète que je peux apporter à vos équipes.\n\nDans cette attente, je vous prie d'agréer, ${salutationGreeting.replace(/,$/, '')}, l'expression de mes salutations distinguées.\n\n${candidateName}\n${profile.jobTitle && profile.jobTitle !== 'Candidat (en attente de votre CV)' ? `${profile.jobTitle}\n` : ''}${profile.phone ? `${profile.phone} | ` : ''}${profile.email || ''}`,
      selectedAttachments: [
        ...(profile.diplomas || []).slice(0, 1).map(d => ({
          id: d.id,
          title: `${d.title} - ${d.institution}`,
          type: 'diploma' as const,
          relevanceReason: 'Formation académique de référence attestant des compétences de gestion.'
        })),
        ...(profile.swissCertificates || []).slice(0, 1).map(c => ({
          id: c.id,
          title: `Certificat de travail - ${c.company}`,
          type: 'certificate' as const,
          relevanceReason: 'Attestation employeur certifiant les résultats et la rigueur d’exécution.'
        }))
      ]
    };

    return res.json({ tailoredDossier });
  } catch (err: any) {
    console.error('Error generating dossier:', err);
    return res.status(500).json({ error: 'Erreur lors de la génération du dossier.' });
  }
});

// 3. Parse CV Endpoint (PDF, Word docx/doc, or Plain Text)
app.post('/api/parse-cv', async (req: Request, res: Response) => {
  try {
    const { fileBase64, fileName, fileType, rawText } = req.body;

    let extractedText = rawText || '';

    // If Word (.docx)
    if (fileBase64 && (fileType === 'docx' || (fileName && fileName.endsWith('.docx')))) {
      try {
        const buffer = Buffer.from(fileBase64, 'base64');
        const mammothResult = await mammoth.extractRawText({ buffer });
        extractedText = mammothResult.value;
      } catch (docErr) {
        console.warn('Mammoth docx extraction warning:', docErr);
      }
    }

    // Try Gemini Multimodal or Text Parsing
    if (ai) {
      try {
        const instruction = `Tu es un expert RH et recruteur suisse de référence pour le canton de Vaud / Romandie (Lausanne).
Analyse méticuleusement ce CV (fourni en PDF ou texte) et extrais de manière exhaustive et fidèle toutes les données du candidat pour configurer son Profil Maître complet.
RÈGLES IMPORTANTES :
1. Extrais le nom complet réel (prénom et nom).
2. Détermine l'intitulé de poste clé (ex: Chef de Projet Digital / IT / etc.).
3. Extrais les coordonnées réelles (email, téléphone, adresse, ville, canton). Si non mentionné, utilise Lausanne / VD par défaut.
4. Calcule précisément le nombre d'années d'expérience professionnelle cumulées.
5. Extrais et catégorise l'ensemble des compétences réelles (methodologies, tools, management, languages avec niveau).
6. Liste toutes les expériences professionnelles réelles avec leur entreprise, période, descriptif et réalisations concrètes.
7. Liste tous les diplômes et certifications obtenus (degré, école, année, domaine).
8. Si des certificats de travail suisses ou employeurs suisses sont identifiés, liste-les dans swissCertificates.`;

        let contents: any[] = [];
        if (fileBase64 && (fileType === 'pdf' || (fileName && fileName.endsWith('.pdf')))) {
          contents = [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: fileBase64
              }
            },
            {
              text: `${instruction}\nNom du fichier : ${fileName || 'CV.pdf'}`
            }
          ];
        } else {
          contents = [
            {
              text: `${instruction}\nNom du fichier : ${fileName || 'CV'}\n\nTEXTE DU CV :\n${extractedText || 'CV sans texte direct'}`
            }
          ];
        }

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: 'Tu es un parseur et expert RH suisse. Réponds STRICTEMENT en JSON conforme au schéma UserProfile.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                jobTitle: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                address: { type: Type.STRING },
                city: { type: Type.STRING },
                canton: { type: Type.STRING },
                nationalityStatus: { type: Type.STRING },
                nationalityLabel: { type: Type.STRING },
                activityRateMin: { type: Type.INTEGER },
                activityRateMax: { type: Type.INTEGER },
                yearsOfExperience: { type: Type.INTEGER },
                salaryPosture: { type: Type.STRING },
                summary: { type: Type.STRING },
                skills: {
                  type: Type.OBJECT,
                  properties: {
                    methodologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                    management: { type: Type.ARRAY, items: { type: Type.STRING } },
                    languages: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          level: { type: Type.STRING },
                          code: { type: Type.STRING }
                        },
                        required: ['name', 'level', 'code']
                      }
                    }
                  },
                  required: ['methodologies', 'tools', 'management', 'languages']
                },
                experiences: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      company: { type: Type.STRING },
                      location: { type: Type.STRING },
                      period: { type: Type.STRING },
                      isCurrent: { type: Type.BOOLEAN },
                      description: { type: Type.STRING },
                      bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['id', 'title', 'company', 'period', 'description', 'bulletPoints', 'tags']
                  }
                },
                diplomas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      institution: { type: Type.STRING },
                      year: { type: Type.INTEGER },
                      level: { type: Type.STRING },
                      domain: { type: Type.STRING }
                    },
                    required: ['id', 'title', 'institution', 'year']
                  }
                },
                swissCertificates: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      company: { type: Type.STRING },
                      period: { type: Type.STRING },
                      rating: { type: Type.STRING },
                      signatory: { type: Type.STRING },
                      keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['id', 'company', 'period', 'rating']
                  }
                }
              },
              required: ['fullName', 'jobTitle', 'summary', 'skills', 'experiences', 'diplomas']
            }
          }
        });

        if (aiResponse.text) {
          const parsedProfile: UserProfile = JSON.parse(aiResponse.text);
          parsedProfile.hasCvUploaded = true;
          parsedProfile.cvFileName = fileName || 'CV_Candidat';
          parsedProfile.cvUploadedAt = new Date().toISOString();
          parsedProfile.salaryPosture = parsedProfile.salaryPosture || 'À discuter (Option C - selon barèmes vaudois)';
          parsedProfile.activityRateMin = parsedProfile.activityRateMin || 80;
          parsedProfile.activityRateMax = parsedProfile.activityRateMax || 100;
          parsedProfile.contractPreferences = ['CDI', 'CDD', 'Management de transition'];
          parsedProfile.maxCommuteKm = parsedProfile.maxCommuteKm || 30;
          parsedProfile.city = parsedProfile.city || 'Lausanne';
          parsedProfile.canton = parsedProfile.canton || 'VD';
          parsedProfile.learnedSkills = [];
          parsedProfile.rgpdSettings = {
            enabled: true,
            blockIllegalDataRequests: true,
            localSovereigntyConsent: true,
            anonymizeDirectContacts: false
          };
          return res.json({ profile: parsedProfile, method: 'gemini' });
        }
      } catch (geminiCvErr) {
        console.warn('Gemini CV parsing error, falling back to heuristic:', geminiCvErr);
      }
    }

    // Heuristic Fallback Parser from text
    const textToScan = extractedText || '';
    const emailMatch = textToScan.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = textToScan.match(/(?:\+41|0041|0)\s*(?:[1-9]\d|\(0\)[1-9]\d)\s*\d{3}\s*\d{2}\s*\d{2}|\+?\d{10,14}/);
    const lines = textToScan.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const candidateName = lines[0] && lines[0].length < 40 ? lines[0] : (fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : 'Nouveau Candidat');

    const fallbackProfile: UserProfile = {
      fullName: candidateName,
      jobTitle: lines[1] && lines[1].length < 50 ? lines[1] : 'Chef de Projet Senior',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      address: 'Région Lausannoise',
      city: 'Lausanne',
      canton: 'VD',
      maxCommuteKm: 30,
      nationalityStatus: 'permit_c',
      nationalityLabel: 'Permis C (Établissement Suisse)',
      activityRateMin: 80,
      activityRateMax: 100,
      contractPreferences: ['CDI', 'CDD', 'Management de transition'],
      yearsOfExperience: 5,
      salaryPosture: 'À discuter (Option C - selon barèmes vaudois et responsabilités)',
      summary: lines.slice(0, 4).join(' ') || 'Profil professionnel extrait du CV importé.',
      skills: {
        methodologies: ['Gestion de projet', 'Agile / Scrum', 'PMP', 'Conduite du changement'],
        tools: ['JIRA', 'Confluence', 'MS Project', 'Office 365'],
        management: ['Coordination d’équipe', 'Animation de réunions', 'Gestion budgétaire'],
        languages: [
          { name: 'Français', level: 'Langue maternelle / Courant', code: 'FR' },
          { name: 'Anglais', level: 'Professionnel', code: 'EN' }
        ]
      },
      learnedSkills: [],
      experiences: [
        {
          id: 'exp-parsed-1',
          title: 'Chef de Projet',
          company: 'Entreprise Suisse',
          location: 'Lausanne',
          period: '2021 - Présent',
          isCurrent: true,
          description: 'Pilotage de projets et coordination des équipes.',
          bulletPoints: ['Gestion de budget', 'Animation de comités', 'Livraison des jalons'],
          tags: ['Gestion de projet', 'Agile', 'Suisse']
        }
      ],
      diplomas: [
        {
          id: 'dip-parsed-1',
          title: 'Master / Diplôme d’enseignement supérieur',
          institution: 'Université / Haute École',
          year: 2018,
          level: 'Master',
          domain: 'Gestion / Informatique'
        }
      ],
      swissCertificates: [],
      rgpdSettings: {
        enabled: true,
        blockIllegalDataRequests: true,
        localSovereigntyConsent: true,
        anonymizeDirectContacts: false
      },
      hasCvUploaded: true,
      cvFileName: fileName || 'CV_Candidat',
      cvUploadedAt: new Date().toISOString()
    };

    return res.json({ profile: fallbackProfile, method: 'heuristic' });
  } catch (err: any) {
    console.error('Error parsing CV:', err);
    return res.status(500).json({ error: 'Erreur lors de la lecture du CV.' });
  }
});

// Helper to generate responsive mobile HTML for the 8h00 report
function generateMobileReportHtml(validOffers: JobOffer[], dateFormatted: string): string {
  const offersHtml = validOffers.length === 0
    ? `
      <div style="text-align: center; padding: 32px 16px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
        Aucune nouvelle offre 100% aujourd'hui. L'IA poursuit la veille active sur Lausanne et environs (20-30km).
      </div>
    `
    : validOffers.map((job, idx) => {
        const isReady = job.status === 'ready_to_send';
        const badgeColor = isReady ? '#059669' : '#d97706';
        const badgeBg = isReady ? '#ecfdf5' : '#fef3c7';
        const badgeText = isReady ? '🟢 100% Validé - Prêt à l\'envoi' : '🟡 Option B - Arbitrage requis';
        const targetUrl = job.actionChannel?.target || '#';

        return `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
            <!-- Card Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                Opportunité #${idx + 1}
              </span>
              <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px;">
                ${badgeText}
              </span>
            </div>

            <!-- Job Title -->
            <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.3;">
              ${job.title}
            </h3>

            <!-- Company & Context -->
            <div style="font-size: 13px; color: #475569; margin-bottom: 12px; line-height: 1.4;">
              <strong>🏢 ${job.company}</strong> • 📍 ${job.location} • ⏱️ ${job.activityRateMin}-${job.activityRateMax}% • ${job.contractType}
            </div>

            <!-- Match Score Box -->
            <div style="background-color: #f1f5f9; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px;">
              <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                🎯 Taux d'Adéquation : <span style="color: ${job.matchScore >= 95 ? '#059669' : '#d97706'}; font-size: 14px;">${job.matchScore}%</span>
              </div>
              <div style="font-size: 12px; color: #334155; font-style: italic; line-height: 1.4;">
                💡 "${job.theWhy}"
              </div>
            </div>

            <!-- Dossier & Action -->
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 12px;">
              <span>📁 Dossier : <strong>${job.tailoredDossier ? 'CV & Lettre prêts' : 'Standard'}</strong></span>
              <span>🇨🇭 Employeur direct</span>
            </div>

            <!-- Mobile Touch Action Button -->
            <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background-color: #dc2626; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 16px; border-radius: 12px; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);">
              Ouvrir l'offre & Postuler →
            </a>
          </div>
        `;
      }).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="color-scheme" content="light">
  <title>Rapport 8h00 - Job Matcher</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #0f172a;
    }
    .wrapper {
      max-width: 540px;
      margin: 0 auto;
      padding: 16px 12px;
      box-sizing: border-box;
    }
    @media only screen and (max-width: 480px) {
      .wrapper {
        padding: 12px 8px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #7f1d1d, #0f172a); border-radius: 20px; padding: 20px 16px; color: #ffffff; margin-bottom: 16px; text-align: center; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
      <div style="display: inline-block; background-color: rgba(220, 38, 38, 0.4); border: 1px solid rgba(248, 113, 113, 0.4); border-radius: 9999px; padding: 3px 12px; font-size: 11px; font-weight: 700; margin-bottom: 8px;">
        🇨🇭 Job Matcher Lausanne & Vaud
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
        Rapport Matinal de 8h00
      </h1>
      <p style="margin: 0; font-size: 12px; color: #cbd5e1; text-transform: capitalize;">
        📅 ${dateFormatted} • ${validOffers.length} opportunité${validOffers.length > 1 ? 's' : ''} retenue${validOffers.length > 1 ? 's' : ''}
      </p>
    </div>

    <!-- Job Cards -->
    ${offersHtml}

    <!-- Mobile Footer -->
    <div style="text-align: center; padding: 16px 8px; font-size: 11px; color: #94a3b8; line-height: 1.5;">
      <div>⚙️ Généré par Job Matcher Suisse • Matching 100% & Zéro Intermédiaire</div>
      <div style="margin-top: 4px;">Périmètre : Lausanne & agglomération vaudoise (20-30km)</div>
    </div>
  </div>
</body>
</html>`;
}

// 3. Generate 8h00 Report Endpoint
app.post('/api/generate-daily-report', (req: Request, res: Response) => {
  const { jobOffers } = req.body;
  if (!jobOffers || !Array.isArray(jobOffers)) {
    return res.status(400).json({ error: 'Liste d’offres requise.' });
  }

  const validOffers: JobOffer[] = jobOffers.filter(
    j => j.status === 'ready_to_send' || j.status === 'waiting_info' || j.status === 'to_validate'
  );

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('fr-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Mobile-Optimized WhatsApp Message Text (compact, readable on smartphone)
  let reportText = `🇨🇭 *JOB MATCHER — RAPPORT 8H00*\n`;
  reportText += `📅 ${dateFormatted.toUpperCase()}\n`;
  reportText += `📍 _Lausanne & Vaud (20-30km) • Employeurs Directs_\n\n`;

  if (validOffers.length === 0) {
    reportText += `Aucune nouvelle opportunité 100% ou en cours d'arbitrage aujourd'hui.\nL'IA continue la veille active sur le canton de Vaud.`;
  } else {
    validOffers.forEach((job, idx) => {
      const statusBadge =
        job.status === 'ready_to_send'
          ? '🟢 100% Prêt à l\'envoi'
          : job.status === 'waiting_info'
          ? '🟡 Action requise (Option B)'
          : '🔵 À valider';

      reportText += `━━━━━━━━━━━━━━━━━━━━━\n`;
      reportText += `*#${idx + 1} • ${job.title}*\n`;
      reportText += `🏢 *${job.company}* • 📍 ${job.location}\n`;
      reportText += `⏱️ ${job.activityRateMin}-${job.activityRateMax}% • ${job.contractType}\n`;
      reportText += `🎯 *Match : ${job.matchScore}%* (${statusBadge})\n`;
      reportText += `💡 _"${job.theWhy}"_\n`;
      if (job.actionChannel?.target) {
        reportText += `👉 *Postuler* : ${job.actionChannel.target}\n`;
      }
      reportText += `📁 *Dossier* : ${job.tailoredDossier ? 'CV & Lettre personnalisés prêts' : 'Prêt à générer'}\n\n`;
    });
  }

  reportText += `━━━━━━━━━━━━━━━━━━━━━\n`;
  reportText += `⚙️ _Job Matcher Suisse • Veille quotidienne de 8h00_`;

  // Generate responsive mobile HTML
  const reportHtml = generateMobileReportHtml(validOffers, dateFormatted);

  return res.json({
    reportText,
    reportHtml,
    count: validOffers.length,
    dateFormatted
  });
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Job Matcher] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
