import { JobOffer } from '../types';

export const initialMockJobs: JobOffer[] = [
  {
    id: 'job-epfl-001',
    url: 'https://jobs.epfl.ch',
    title: 'Chef de Projet SI & Gouvernance Digitale',
    company: 'EPFL (École Polytechnique Fédérale de Lausanne)',
    location: 'Lausanne (Ecublens)',
    recruiterName: 'Mme Céline Favre',
    recruiterTitle: 'Responsable Recrutement & Talents SI',
    contractType: 'CDI',
    activityRateMin: 80,
    activityRateMax: 100,
    publicationDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), // 2 days ago
    matchScore: 100,
    status: 'ready_to_send',
    isEliminated: false,
    precisionIndex: 'precise',
    theWhy:
      'Ce poste à l’EPFL correspond exactement à votre profil : pilotage de programmes IT complexes, maîtrise conjointe PMP/Agile et familiarité avec le tissu d’innovation vaudois. L’environnement académique de rang mondial valorisera pleinement votre sens du service public et votre expérience BCV/Nestlé.',
    actionChannel: {
      type: 'url',
      target: 'https://jobs.epfl.ch',
      contactName: 'Mme Céline Favre — Service des Ressources Humaines EPFL',
      notes: 'Portail officiel des offres d’emploi de l’EPFL (Lausanne Ecublens) — Postulation directe vérifiée'
    },
    jobLanguage: 'FR',
    rawText: `L'EPFL recherche pour sa Vice-présidence des Systèmes d'Information un(e) Chef de Projet SI & Gouvernance Digitale à 80%-100% en CDI sur le campus d'Ecublens (Lausanne).
Missions principales :
- Piloter des projets transverses de modernisation applicative et d'infrastructures de recherche.
- Coordonner les comités de pilotage et animer les cérémonies agiles (Scrum / SAFe).
- Maîtriser les budgets (CHF 500k à 2M) et assurer le suivi des risques et de la conformité LPD.
- Accompagner le changement auprès des facultés et laboratoires.
Profil recherché :
- Formation universitaire supérieure (EPFL, UNIL, HEC ou titre équivalent).
- Minimum 5 ans d'expérience avérée en gestion de projets informatiques complexes.
- Certifications PMP, Prince2 ou Scrum Master fortement appréciées.
- Excellente maîtrise du français et de l'anglais (environnement international).
- Rigueur, orientation utilisateur et esprit d'équipe.
Taux : 80% - 100%. Date d'entrée : de suite ou à convenir.`,
    matchBreakdown: {
      locationOk: true,
      locationReason: 'Ecublens / Lausanne (< 6 km du centre de Lausanne).',
      distanceKm: 5.5,
      directEmployerOk: true,
      directEmployerReason: 'Entreprise finale directe (EPFL - Institution publique fédérale).',
      legalOk: true,
      legalReason: 'Ouvert aux titulaires de Permis C / B / Suisse sans restriction de nationalité.',
      contractRateOk: true,
      contractRateReason: 'CDI à 80%-100% conforme aux préférences.',
      freshnessOk: true,
      freshnessReason: 'Publiée il y a 2 jours (règle <= 15 jours respectée).',
      rgpdComplianceOk: true,
      rgpdReason: 'Conforme RGPD / nLPD : canal direct et respect de la confidentialité des candidatures.',
      daysOld: 2,
      skillsMatchRate: 100,
      skillsMatched: [
        'PMP / Prince2',
        'Scrum / SAFe',
        'Budget CHF 500k-2M',
        'Conduite du changement',
        'Conformité LPD',
        'Français natif & Anglais C1'
      ],
      skillsMissing: [],
      seniorityMatch: true,
      seniorityNote: '8 ans d’expérience (requis: 5 ans, dépassement positif).'
    },
    optionBQuestions: [],
    tailoredDossier: {
      language: 'FR',
      generatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      tailoredCV: {
        headline: 'Chef de Projet Senior SI & Gouvernance Digitale',
        summary:
          'Expert en pilotage de programmes informatiques à fort impact institutionnel et réglementaire (BCV, Nestlé, Swisscom). Certifié PMP et Scrum Master, diplômé d’HEC Lausanne, avec une pratique éprouvée de la gouvernance agile et de la gestion budgétaire rigoureuse sur le campus lausannois.',
        reorderedExperienceIds: ['exp-1', 'exp-3', 'exp-2'],
        highlightedSkills: [
          'PMP & SAFe 5.1',
          'Conformité LPD Suisse',
          'Gestion budgétaire (CHF 2.8M)',
          'Change Management académique'
        ],
        salaryMention: 'À discuter (Option C - selon grille salariale EPFL et responsabilités)'
      },
      motivationLetter: `Marc Delarue
Avenue de Rumine 24
1005 Lausanne
contact@candidat.ch | +41 79 000 00 00

École Polytechnique Fédérale de Lausanne (EPFL)
À l'attention de Mme Céline Favre, Responsable Recrutement & Talents SI
Route Cantonale, 1015 Lausanne (Ecublens)

Objet : Candidature au poste de Chef de Projet SI & Gouvernance Digitale (Réf: EPFL-VPI-2026)

Madame Favre,

C’est avec un vif enthousiasme que je vous adresse ma candidature pour le poste de Chef de Projet SI & Gouvernance Digitale au sein de l'EPFL. Diplômé d'un Master à Lausanne et fort de huit années de conduite de projets informatiques stratégiques en Suisse romande, j’ai développé une expertise pointue dans le déploiement d’infrastructures complexes au service de communautés d’utilisateurs exigeantes.

Au cours de mes récentes responsabilités à la Banque Cantonale Vaudoise, j'ai notamment orchestré le cadrage et l'exécution de programmes digitaux majeurs sous le cadre SAFe, en assurant la stricte conformité à la nouvelle loi sur la protection des données (nLPD) et le respect scrupuleux d'un budget annuel de 2.8 millions de francs suisses. Précédemment, chez Nestlé et Swisscom, j'ai forgé une solide culture du delivery multilingue (français, anglais, allemand) et une capacité reconnue à instaurer un dialogue fluide entre ingénieurs techniques, directions métiers et comités de pilotage.

Rejoindre l'EPFL représente pour moi l'opportunité de mettre mon sens de l'organisation suisse, mes certifications PMP/Scrum et mon leadership bienveillant au service d'une institution phare du savoir et de l'innovation. Très attaché au dynamisme de la région lausannoise, je me réjouis de contribuer à la robustesse et à l'évolution des systèmes d'information académiques et scientifiques du campus.

Restant à votre entière disposition pour un échange approfondi, je vous prie d'agréer, Madame Favre, l'expression de mes salutations distinguées.

Marc Delarue
Chef de Projet SI Senior
+41 79 000 00 00 | contact@candidat.ch`,
      selectedAttachments: [
        {
          id: 'dip-1',
          title: 'Master of Science HEC Lausanne (UNIL)',
          type: 'diploma',
          relevanceReason: 'Diplôme universitaire supérieur en SI de premier plan dans le canton de Vaud.'
        },
        {
          id: 'cert-1',
          title: 'Certificat de travail BCV (Lausanne)',
          type: 'certificate',
          relevanceReason: 'Atteste d’une direction de projet d’envergure et d’un leadership rigoureux.'
        },
        {
          id: 'cert-2',
          title: 'Certificat de travail Nestlé Nespresso SA',
          type: 'certificate',
          relevanceReason: 'Preuve de livraison de projets internationaux multilingues dans les délais.'
        }
      ]
    },
    historyLog: [
      {
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        action: 'Création & Analyse initiale',
        details: 'Score 100% calculé avec succès. Lien officiel EPFL vérifié (jobs.epfl.ch).'
      }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'job-vaudoise-002',
    url: 'https://www.vaudoise.ch/fr/carrieres/travailler-a-la-vaudoise/professionnels-et-jeunes-diplomes',
    title: 'Project Manager Transformation Digitale & Sinistres',
    company: 'Vaudoise Assurances',
    location: 'Lausanne (Place de la Navigation)',
    recruiterName: 'M. Alexandre Rochat',
    recruiterTitle: 'Responsable Recrutement & Talents RH',
    contractType: 'CDI',
    activityRateMin: 80,
    activityRateMax: 100,
    publicationDate: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    matchScore: 88,
    status: 'waiting_info',
    isEliminated: false,
    precisionIndex: 'precise',
    theWhy:
      'Une opportunité de tout premier plan au siège historique de la Vaudoise Assurances au bord du lac Léman. Votre double compétence en gouvernance de projets bancaires vaudois et gestion du changement garantit une intégration naturelle, conditionnée à la validation de l’Option B sur les processus métiers assurances.',
    actionChannel: {
      type: 'url',
      target: 'https://www.vaudoise.ch/fr/carrieres/travailler-a-la-vaudoise/professionnels-et-jeunes-diplomes',
      contactName: 'M. Alexandre Rochat — Direction RH Vaudoise Assurances',
      notes: 'Portail carrières officiel Vaudoise Assurances (Lausanne Ouchy) — Page vérifiée'
    },
    jobLanguage: 'FR',
    rawText: `La Vaudoise Assurances recherche pour son siège à Lausanne un(e) Project Manager Transformation Digitale & Sinistres à 80%-100% en CDI.
Vos responsabilités :
- Piloter de bout en bout les initiatives stratégiques de digitalisation des parcours clients et agents d'assurance.
- Gérer les relations avec les partenaires technologiques et les éditeurs métiers (notamment Guidewire / outils de gestion de sinistres).
- Encadrer les cérémonies agiles et structurer les livrables avec les équipes métier et data.
- Participer activement à la gestion du changement et aux formations des collaborateurs romands et alémaniques.
Votre profil :
- Expérience confirmée d'au moins 5 ans en gestion de projets dans les services financiers (banque ou assurance).
- Excellente maîtrise des méthodes agiles et du pilotage budgétaire.
- Connaissance pratique des progiciels métiers de type Guidewire ou équivalent est un atout déterminant.
- Maîtrise du français et bon niveau d'allemand souhaité pour les échanges avec la Suisse alémanique.`,
    matchBreakdown: {
      locationOk: true,
      locationReason: 'Lausanne - Siège Ouchy (< 3 km).',
      distanceKm: 2.1,
      directEmployerOk: true,
      directEmployerReason: 'Entreprise finale directe (Vaudoise Assurances - Siège suisse).',
      legalOk: true,
      legalReason: 'Permis C et Suisse acceptés.',
      contractRateOk: true,
      contractRateReason: 'CDI 80-100% conforme.',
      freshnessOk: true,
      freshnessReason: 'Publiée il y a 4 jours.',
      rgpdComplianceOk: true,
      rgpdReason: 'Conforme RGPD / nLPD : données traitées au sein de l’Union/Suisse selon standards bancaires.',
      daysOld: 4,
      skillsMatchRate: 88,
      skillsMatched: [
        'Gestion de projet finance/banque',
        'Méthodes agiles',
        'Pilotage budgétaire',
        'Change management',
        'Allemand professionnel (B2)'
      ],
      skillsMissing: ['Connaissance pratique des outils métier assurance / Guidewire'],
      seniorityMatch: true,
      seniorityNote: '8 ans vs 5 ans requis.'
    },
    optionBQuestions: [
      {
        id: 'optb-vaudoise-1',
        skillName: 'Expérience Guidewire / Progiciel Sinistres',
        category: 'tool',
        questionText:
          'L’annonce valorise la "connaissance pratique de progiciels métiers type Guidewire / gestion sinistres". Possédez-vous cette compétence ou une expérience équivalente en core insurance / ERP complexe ?',
        contextSnippet:
          'Connaissance pratique des progiciels métiers de type Guidewire ou équivalent est un atout déterminant.',
        userResponse: undefined
      }
    ],
    tailoredDossier: {
      language: 'FR',
      generatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      tailoredCV: {
        headline: 'Project Manager Transformation Digitale & Services Financiers',
        summary:
          'Chef de projet senior vaudois fort de 8 ans de pilotage de transformations numériques bancaires et assurantielles. Expert en gouvernance agile, relations éditeurs et conduite du changement bilingue français-allemand.',
        reorderedExperienceIds: ['exp-1', 'exp-2', 'exp-3'],
        highlightedSkills: [
          'Gouvernance Agile & Scrum',
          'Gestion Budgétaire & Sinistres',
          'Conduite du changement bilingue FR/DE',
          'Relation éditeurs ERP / Core systems'
        ],
        salaryMention: 'À discuter (Option C - selon grille Vaudoise Assurances)'
      },
      motivationLetter: `Marc Delarue
Avenue de Rumine 24
1005 Lausanne
contact@candidat.ch | +41 79 000 00 00

Vaudoise Assurances
À l'attention de M. Alexandre Rochat, Responsable Recrutement & Talents RH
Place de la Navigation 9, 1001 Lausanne

Objet : Candidature au poste de Project Manager Transformation Digitale & Sinistres

Monsieur Rochat,

Attentif au dynamisme de la Vaudoise Assurances et à sa position d'acteur incontournable du paysage vaudois, c'est avec un vif intérêt que je vous présente ma candidature au poste de Project Manager Transformation Digitale & Sinistres à votre siège d'Ouchy.

Fort de huit années de pilotage de projets informatiques et organisationnels au sein d'institutions financières de premier plan (Banque Cantonale Vaudoise, Nestlé), j'ai conduit des chantiers majeurs d'optimisation des flux métiers et de modernisation applicative. Ma pratique quotidienne de la gestion des parties prenantes, combinée à une rigueur budgétaire sans faille et une aisance relationnelle en français et allemand, me permet de fédérer efficacement les équipes métiers, techniques et partenaires externes.

Rejoindre la Vaudoise Assurances représente pour moi l'opportunité de mettre mon expérience lausannoise au service d'une entreprise mutualiste réputée pour sa proximité et ses valeurs humaines.

Me tenant à votre entière disposition pour convenir d'un échange, je vous prie d'agréer, Monsieur Rochat, l'expression de mes salutations distinguées.

Marc Delarue
Chef de Projet Senior
+41 79 000 00 00 | contact@candidat.ch`,
      selectedAttachments: [
        {
          id: 'cert-1',
          title: 'Certificat de travail BCV (Lausanne)',
          type: 'certificate',
          relevanceReason: 'Attestation employeur certifiant les résultats et la rigueur dans le secteur financier vaudois.'
        },
        {
          id: 'dip-1',
          title: 'Master of Science HEC Lausanne (UNIL)',
          type: 'diploma',
          relevanceReason: 'Formation supérieure en management des systèmes d’information.'
        }
      ]
    },
    historyLog: [
      {
        timestamp: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        action: 'Analyse - Option B déclenchée',
        details: 'Score 88%. 1 compétence clé en attente d’arbitrage par l’utilisateur.'
      }
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'job-nestle-003',
    url: 'https://www.jobup.ch/fr/emplois/entreprises/nestle/',
    title: 'Global Digital & Tech Project Manager',
    company: 'Nestlé Health Science',
    location: 'Vevey / Lausanne (18km)',
    recruiterName: 'Mme Nathalie Mercier',
    recruiterTitle: 'Lead Talent Acquisition Romandie',
    contractType: 'CDI',
    activityRateMin: 100,
    activityRateMax: 100,
    publicationDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    matchScore: 100,
    status: 'ready_to_send',
    isEliminated: false,
    precisionIndex: 'precise',
    theWhy:
      'Ce rôle international chez Nestlé Health Science capitalise directement sur vos 3 ans d’expérience antérieure chez Nestlé Nespresso SA. Votre connaissance intime de la culture corporate et des flux ERP/SAP accélérera immédiatement votre impact.',
    actionChannel: {
      type: 'url',
      target: 'https://www.jobup.ch/fr/emplois/entreprises/nestle/',
      contactName: 'Mme Nathalie Mercier — Centre de Recrutement Nestlé Vevey',
      notes: 'Portail officiel des offres Nestlé Suisse (Vevey / Romandie) — Page vérifiée'
    },
    jobLanguage: 'EN',
    rawText: `Nestlé Health Science is seeking a Global Digital & Tech Project Manager (100%, Permanent) located in Vevey/Lausanne area.
Key Responsibilities:
- Lead end-to-end digital transformation programs spanning multiple global markets.
- Orchestrate integration between enterprise core systems (SAP ERP, Salesforce) and cloud analytics tools.
- Drive Agile ceremonies, manage project budgets upwards of 2.5M CHF, and oversee vendor deliverables.
- Foster change management and training initiatives across multi-functional stakeholders.
Requirements:
- Master’s degree in Business, Computer Science or equivalent.
- 6+ years of proven project management experience within multinational organizations.
- Solid background with SAP environments and cloud architectures.
- PMP, SAFe or Scrum Master certification is mandatory.
- Fluent in English (corporate language); French or German is a distinct advantage.`,
    matchBreakdown: {
      locationOk: true,
      locationReason: 'Vevey / Riviera vaudoise (18 km de Lausanne, direct train CFF 14 min).',
      distanceKm: 18,
      directEmployerOk: true,
      directEmployerReason: 'Entreprise finale directe (Nestlé Global Headquarter).',
      legalOk: true,
      legalReason: 'Ouvert Permis C / B / Suisse.',
      contractRateOk: true,
      contractRateReason: 'CDI 100% conforme.',
      freshnessOk: true,
      freshnessReason: 'Publiée hier (1 jour).',
      rgpdComplianceOk: true,
      rgpdReason: 'Conforme RGPD / nLPD : portail carrière sécurisé Nestlé Global Privacy.',
      daysOld: 1,
      skillsMatchRate: 100,
      skillsMatched: [
        'Global Digital Transformation',
        'SAP ERP & Salesforce',
        'PMP & Agile / SAFe',
        'Budget > 2.5M CHF',
        'Fluent English (C1)',
        'Ancienne expérience Nestlé confirmée'
      ],
      skillsMissing: [],
      seniorityMatch: true,
      seniorityNote: '8 ans vs 6 ans requis.'
    },
    optionBQuestions: [],
    tailoredDossier: {
      language: 'EN',
      generatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      tailoredCV: {
        headline: 'Global Digital & Technology Project Manager',
        summary:
          'Senior Project Manager with 8 years of successful delivery across enterprise IT & digital programs in Switzerland. Former Nestlé Nespresso project leader with in-depth knowledge of global SAP landscapes, SAFe agile governance, and multi-million CHF budget steering.',
        reorderedExperienceIds: ['exp-2', 'exp-1', 'exp-3'],
        highlightedSkills: [
          'Nestlé Ecosystem & SAP ERP',
          'SAFe 5.1 & Scrum Certified',
          'Global Stakeholder Alignment',
          'Multi-million CHF Budget Steering'
        ],
        salaryMention: 'To discuss (Option C - aligned with Nestlé Switzerland internal grade)'
      },
      motivationLetter: `Marc Delarue
Avenue de Rumine 24
1005 Lausanne
contact@candidat.ch | +41 79 000 00 00

Nestlé Health Science
To the attention of Ms. Nathalie Mercier, Lead Talent Acquisition Romandie
Avenue Reller 22, 1800 Vevey

Subject: Application for Global Digital & Tech Project Manager position

Dear Ms. Mercier,

Having previously contributed to the success of Nestlé Nespresso SA as an IT Project Specialist, I am enthusiastic to submit my application for the Global Digital & Tech Project Manager position within Nestlé Health Science in Vevey.

Over the past eight years, I have successfully steered high-impact transformation programs combining enterprise SAP landscapes, customer-facing digital applications, and cloud analytics. My hands-on familiarity with Nestlé’s values, operational excellence standards, and collaborative culture allows me to be immediately effective in aligning global cross-functional teams around ambitious delivery roadmaps.

Holding a Master’s degree from HEC Lausanne along with PMP and SAFe certifications, I bring proven leadership in managing multi-million Swiss franc budgets while maintaining strict data governance standards (Swiss FADP / GDPR).

I would welcome the opportunity to discuss with you how my expertise and dedication can actively support Nestlé Health Science’s growth.

Sincerely,

Marc Delarue
Senior Project Manager
+41 79 000 00 00 | contact@candidat.ch`,
      selectedAttachments: [
        {
          id: 'cert-2',
          title: 'Certificat de travail Nestlé Nespresso SA',
          type: 'certificate',
          relevanceReason: 'Attests to previous high-performance delivery within the Nestlé ecosystem.'
        },
        {
          id: 'cert-1',
          title: 'Certificat de travail BCV (Banque Cantonale Vaudoise)',
          type: 'certificate',
          relevanceReason: 'Attests to senior governance and compliance leadership.'
        }
      ]
    },
    historyLog: [
      {
        timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        action: 'Analyse 100% Match',
        details: 'Dossier complet généré en anglais avec valorisation de l’expérience Nestlé. Lien officiel vérifié.'
      }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'job-hays-elim-004',
    url: 'https://www.hays.ch/fr/',
    title: 'Chef de Projet Informatique Senior (Cabinet Hays)',
    company: 'Hays (Suisse) SA - Cabinet de recrutement',
    location: 'Lausanne Centre',
    contractType: 'CDI',
    activityRateMin: 100,
    activityRateMax: 100,
    publicationDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    matchScore: 0,
    status: 'rejected',
    isEliminated: true,
    eliminationReason:
      'Exclusion de sourcing stricte : Agence de placement / Cabinet de recrutement (Hays Suisse). La politique stricte exige uniquement des entreprises finales directes.',
    precisionIndex: 'vague_to_verify',
    theWhy:
      'Offre écartée automatiquement : issue d’un intermédiaire de placement (Hays). Le filtre strict "Entreprises finales uniquement" garantit une relation d’embauche directe sans opacité ni mandat de tiers.',
    actionChannel: {
      type: 'url',
      target: 'https://www.hays.ch/fr/',
      contactName: 'Agence Hays Lausanne',
      notes: 'Lien vérifié — Agence intermédiaire écartée par les critères stricts'
    },
    jobLanguage: 'FR',
    rawText: `Notre client, une société basée à Lausanne, recherche par l'intermédiaire de notre cabinet de recrutement Hays un Chef de Projet Informatique Senior. Vos missions : cadrage, coordination d'équipes et delivery. Profil : 5 ans d'expérience. Envoyez votre CV à notre consultant Hays.`,
    matchBreakdown: {
      locationOk: true,
      locationReason: 'Lausanne centre.',
      directEmployerOk: false,
      directEmployerReason: 'Éliminé : Hays est une agence de placement / cabinet de recrutement.',
      agencyName: 'Hays (Suisse) SA',
      legalOk: true,
      legalReason: 'Non vérifié car éliminé en amont.',
      contractRateOk: true,
      contractRateReason: 'CDI 100%.',
      freshnessOk: true,
      freshnessReason: 'Publiée il y a 3 jours.',
      rgpdComplianceOk: false,
      rgpdReason: 'Non vérifié : intermédiaire de recrutement non autorisé.',
      daysOld: 3,
      skillsMatchRate: 0,
      skillsMatched: [],
      skillsMissing: [],
      seniorityMatch: true,
      seniorityNote: 'N/A'
    },
    optionBQuestions: [],
    historyLog: [
      {
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        action: 'Élimination automatique',
        details: 'Règle #2 violée : Agence de placement détectée (Hays).'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'job-fedpol-elim-005',
    url: 'https://jobs.admin.ch',
    title: 'Chef de Projet Sécurité & Investigation Fédérale',
    company: 'fedpol - Office fédéral de la police',
    location: 'Lausanne (Antenne romande)',
    contractType: 'CDI',
    activityRateMin: 80,
    activityRateMax: 100,
    publicationDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    matchScore: 0,
    status: 'rejected',
    isEliminated: true,
    eliminationReason:
      'Exclusion juridique stricte : Poste exigeant impérativement la nationalité suisse exclusive et une assermentation fédérale de sécurité de degré 2 (incompatible avec profil Permis C).',
    precisionIndex: 'precise',
    theWhy:
      'Offre écartée automatiquement : fedpol impose la nationalité suisse sans dérogation pour ce poste de sécurité sensible. Votre profil détient un Permis C (établissement).',
    actionChannel: {
      type: 'url',
      target: 'https://jobs.admin.ch',
      contactName: 'Centre des carrières de l’Administration fédérale suisse',
      notes: 'Portail officiel des emplois de la Confédération (admin.ch) — Offre éliminée pour motif juridique'
    },
    jobLanguage: 'FR',
    rawText: `L'Office fédéral de la police (fedpol) recherche pour son antenne de Lausanne un Chef de Projet Sécurité Informatique.
Conditions strictes d'engagement :
- Être de nationalité suisse impérativement.
- Casier judiciaire vierge et soumission obligatoire à un contrôle de sécurité relatif aux personnes (CSP de niveau 2 secret).
- Expérience de 5 ans en gestion de projet complexe.`,
    matchBreakdown: {
      locationOk: true,
      locationReason: 'Lausanne antenne romande.',
      directEmployerOk: true,
      directEmployerReason: 'fedpol (Administration Fédérale).',
      legalOk: false,
      legalReason: 'Éliminé : Exigence stricte de nationalité suisse incompatible avec Permis C.',
      contractRateOk: true,
      contractRateReason: 'CDI 80-100%.',
      freshnessOk: true,
      freshnessReason: 'Publiée il y a 5 jours.',
      daysOld: 5,
      skillsMatchRate: 0,
      skillsMatched: [],
      skillsMissing: [],
      seniorityMatch: true,
      seniorityNote: 'N/A'
    },
    optionBQuestions: [],
    historyLog: [
      {
        timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        action: 'Élimination automatique',
        details: 'Règle #3 violée : Condition de nationalité suisse non remplie.'
      }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'job-swissquote-006',
    url: 'https://careers.smartrecruiters.com/Swissquote',
    title: 'Lead Project Manager FinTech & Trading Solutions',
    company: 'Swissquote Bank SA',
    location: 'Gland (24km de Lausanne)',
    recruiterName: 'Mme Sophie Blanc',
    recruiterTitle: 'Senior Talent Acquisition Specialist Tech & Digital',
    contractType: 'CDI',
    activityRateMin: 80,
    activityRateMax: 100,
    publicationDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    matchScore: 100,
    status: 'ready_to_send',
    isEliminated: false,
    precisionIndex: 'precise',
    theWhy:
      'Swissquote est le leader suisse de la banque en ligne et est idéalement situé à Gland, à 20 minutes en train de Lausanne. Votre solide expérience bancaire à la BCV et votre maîtrise des cycles agiles répondent à 100% aux exigences du poste.',
    actionChannel: {
      type: 'url',
      target: 'https://careers.smartrecruiters.com/Swissquote',
      contactName: 'Mme Sophie Blanc — Swissquote Talent Acquisition Gland',
      notes: 'Portail officiel des offres Swissquote Bank (Gland VD / Suisse) — Page vérifiée'
    },
    jobLanguage: 'FR',
    rawText: `Swissquote Bank SA recherche pour son siège de Gland (Vaud) un(e) Lead Project Manager FinTech à 80%-100% en CDI.
Rattaché au Chief Technology Officer :
- Vous pilotez les lancements d'outils de trading et applications mobiles innovantes.
- Vous coordonnez les architectes, les équipes de conformité FINMA et les développeurs.
- Vous garantissez la fluidité des cérémonies agiles et le respect des feuilles de route trimestrielles.
Profil :
- Formation universitaire en Informatique ou HEC.
- 5+ années en chefferie de projet dans le domaine bancaire / fintech en Suisse.
- Maîtrise éprouvée des outils JIRA, Confluence et des méthodologies agiles.
- Bonnes compétences en français et anglais indispensables.`,
    matchBreakdown: {
      locationOk: true,
      locationReason: 'Gland (24 km de Lausanne, bien desservi en train direct).',
      distanceKm: 24,
      directEmployerOk: true,
      directEmployerReason: 'Entreprise finale directe (Swissquote Bank SA).',
      legalOk: true,
      legalReason: 'Permis C et ressortissants UE/AELE/Suisse pleinement éligibles.',
      contractRateOk: true,
      contractRateReason: 'CDI 80-100%.',
      freshnessOk: true,
      freshnessReason: 'Publiée il y a 3 jours.',
      rgpdComplianceOk: true,
      rgpdReason: 'Conforme RGPD / nLPD : infrastructure bancaire FINMA avec protection renforcée des données.',
      daysOld: 3,
      skillsMatchRate: 100,
      skillsMatched: [
        'FinTech & Banque suisse',
        'JIRA / Confluence',
        'Conformité FINMA / LPD',
        'Scrum / Agile',
        'Français & Anglais C1'
      ],
      skillsMissing: [],
      seniorityMatch: true,
      seniorityNote: '8 ans vs 5 ans requis.'
    },
    optionBQuestions: [],
    tailoredDossier: {
      language: 'FR',
      generatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      tailoredCV: {
        headline: 'Lead Project Manager FinTech & Solutions Digitales',
        summary:
          'Chef de projet senior spécialisé dans le secteur bancaire suisse (BCV). Expérience confirmée dans la livraison de plateformes transactionnelles sécurisées, la gouvernance agile et la collaboration avec les instances de régulation FINMA/LPD.',
        reorderedExperienceIds: ['exp-1', 'exp-2', 'exp-3'],
        highlightedSkills: [
          'Gouvernance Bancaire & FINMA',
          'Méthodologie SAFe & Scrum',
          'Gestion budgétaire multi-millions',
          'Architecture Cloud & API'
        ],
        salaryMention: 'À discuter (Option C - selon standards FinTech vaudois)'
      },
      motivationLetter: `Marc Delarue
Avenue de Rumine 24
1005 Lausanne
contact@candidat.ch | +41 79 000 00 00

Swissquote Bank SA
À l'attention de Mme Sophie Blanc, Senior Talent Acquisition Specialist Tech & Digital
Chemin de la Crétaux 33, 1196 Gland

Objet : Candidature au poste de Lead Project Manager FinTech & Trading Solutions

Madame Blanc,

En tant que Chef de Projet Senior au sein de la Banque Cantonale Vaudoise à Lausanne, je suis avec grande admiration la capacité constante d’innovation de Swissquote sur la place financière suisse et européenne. C’est donc tout naturellement que je vous propose mes compétences pour le poste de Lead Project Manager FinTech.

Fort de 8 années passées à piloter des programmes informatiques d’envergure dans des environnements régulés (banque, multinationales), j'ai acquis une parfaite maîtrise des enjeux propres aux services financiers : exigences de sécurité, conformité réglementaire (LPD, FINMA), et nécessité d'offrir une expérience utilisateur irréprochable et performante. Mon quotidien à la BCV m'a amené à synchroniser des équipes pluridisciplinaires d'ingénieurs, de designers et d'experts métiers pour moderniser nos canaux digitaux, en maintenant une gouvernance agile rigoureuse et une haute vélocité de delivery.

Résidant à Lausanne, à proximité immédiate des axes menant à Gland, je souhaite m'investir au sein d'une structure audacieuse qui allie l'exigence bancaire suisse à l'agilité des meilleures entreprises technologiques. Mon sens de la rigueur, mes certifications PMP/Scrum et mon leadership d’équipe seront des atouts immédiats pour vos prochaines générations de produits financiers.

Je vous remercie par avance de l’intérêt porté à ma démarche et me tiens à votre entière disposition pour convenir d’un entretien.

Dans cette attente, je vous prie d'agréer, Madame Blanc, mes salutations les meilleures.

Marc Delarue
Lead Project Manager FinTech
+41 79 000 00 00 | contact@candidat.ch`,
      selectedAttachments: [
        {
          id: 'cert-1',
          title: 'Certificat de travail BCV (Banque Cantonale Vaudoise)',
          type: 'certificate',
          relevanceReason: 'Preuve concrète de réussite en environnement bancaire suisse régulé.'
        },
        {
          id: 'dip-1',
          title: 'Master en Systèmes d’Information HEC Lausanne',
          type: 'diploma',
          relevanceReason: 'Formation académique vaudoise reconnue en finance et technologies.'
        }
      ]
    },
    historyLog: [
      {
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        action: 'Analyse 100% Match',
        details: 'Distance 24km validée (< 30km). Portail officiel Swissquote (SmartRecruiters) vérifié et accessible.'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  }
];
