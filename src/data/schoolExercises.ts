/**
 * NOVA SCHOOL — Catalogue Exhaustif d'Exercices, Quiz et Corrigés
 * Adapté aux programmes d'Afrique Centrale et du Congo-Brazzaville
 * Couvre les 7 matières demandées, classées par chapitre et niveaux (Facile, Moyen, Difficile)
 */

import { SchoolExercise, SchoolSubject } from '../types';

export const SCHOOL_SUBJECTS_LIST: { id: SchoolSubject; label: string; iconColor: string }[] = [
  { id: 'maths', label: 'Mathématiques', iconColor: '#38BDF8' },
  { id: 'physique', label: 'Physique-Chimie', iconColor: '#818CF8' },
  { id: 'svt', label: 'SVT', iconColor: '#34D399' },
  { id: 'francais', label: 'Français', iconColor: '#F472B6' },
  { id: 'anglais', label: 'Anglais', iconColor: '#FBBF24' },
  { id: 'histoire_geo', label: 'Histoire-Géo', iconColor: '#FB923C' },
  { id: 'philo', label: 'Philosophie', iconColor: '#A78BFA' },
];

export const SCHOOL_EXERCISES_DATA: SchoolExercise[] = [
  // ==========================================
  // 1. MATHÉMATIQUES
  // ==========================================
  {
    id: 'math-1',
    subject: 'maths',
    subjectLabel: 'Mathématiques',
    chapter: 'Analyse & Limites de Fonctions',
    title: 'Détermination de limites et asymptotes obliques',
    difficulty: 'facile',
    durationMinutes: 5,
    curriculum: 'Terminale C & D (Congo)',
    summary: 'Calculer la limite en +∞ et identifier le comportement asymptotique de fonctions rationnelles.',
    questions: [
      {
        id: 'm1-q1',
        question: 'Quelle est la limite quand x tend vers +∞ de f(x) = (3x² - 5x + 2) / (x² + 4) ?',
        options: ['0', '3', '+∞', 'N’existe pas'],
        correctIndex: 1,
        explanation: 'En +∞, le comportement d’une fraction rationnelle est déterminé par le rapport des termes de plus haut degré : lim (3x² / x²) = 3.',
        stepByStepDetails: [
          'Étape 1 : Mettre en facteur le terme de plus haut degré x² au numérateur et au dénominateur.',
          'Étape 2 : Numérateur = x²(3 - 5/x + 2/x²).',
          'Étape 3 : Dénominateur = x²(1 + 4/x²).',
          'Étape 4 : Simplifier par x² pour x ≠ 0, les termes en 1/x et 1/x² tendent vers 0.',
          'Étape 5 : La limite est donc 3/1 = 3 (asymptote horizontale y = 3).'
        ]
      },
      {
        id: 'm1-q2',
        question: 'Quelle est la dérivée de f(x) = ln(2x² + 1) ?',
        options: ['1 / (2x² + 1)', '4x / (2x² + 1)', '2x / (2x² + 1)', '4 / (2x² + 1)'],
        correctIndex: 1,
        explanation: 'La dérivée de ln(u(x)) est u’(x)/u(x). Ici u(x) = 2x² + 1 donc u’(x) = 4x.',
        stepByStepDetails: [
          'Étape 1 : Identifier la formule de composition (ln u)’ = u’ / u.',
          'Étape 2 : Poser u(x) = 2x² + 1.',
          'Étape 3 : Calculer la dérivée u’(x) = d(2x² + 1)/dx = 4x.',
          'Étape 4 : Composer : f’(x) = 4x / (2x² + 1).'
        ]
      }
    ]
  },
  {
    id: 'math-2',
    subject: 'maths',
    subjectLabel: 'Mathématiques',
    chapter: 'Nombres Complexes & Géométrie',
    title: 'Forme exponentielle et transformations du plan',
    difficulty: 'moyen',
    durationMinutes: 8,
    curriculum: 'Bac C & D — Espace Mathématique',
    summary: 'Calcul du module, de l’argument et interprétation géométrique des rotations dans le plan complexe.',
    questions: [
      {
        id: 'm2-q1',
        question: 'Quel est le module et un argument du complexe z = 1 + i√3 ?',
        options: ['|z| = 2 et arg(z) = π/3 [2π]', '|z| = 4 et arg(z) = π/6 [2π]', '|z| = 2 et arg(z) = 2π/3 [2π]', '|z| = 1 et arg(z) = π/4 [2π]'],
        correctIndex: 0,
        explanation: '|z| = √(1² + (√3)²) = √(1 + 3) = 2. cos θ = 1/2 et sin θ = √3/2, donc θ = π/3.',
        stepByStepDetails: [
          'Étape 1 : Calcul du module |z| = √(a² + b²) = √(1 + 3) = 2.',
          'Étape 2 : Factoriser par le module : z = 2(1/2 + i√3/2).',
          'Étape 3 : Résoudre cos θ = 1/2 et sin θ = √3/2.',
          'Étape 4 : Déduire l’angle fondamental : θ = π/3 rad.'
        ]
      },
      {
        id: 'm2-q2',
        question: 'Si l’affixe z’ d’un point M’ est donnée par z’ = i·z, quelle est la transformation géométrique associée ?',
        options: ['Une translation de vecteur (0, 1)', 'Une rotation de centre O et d’angle π/2', 'Une homothétie de rapport 2', 'Une réflexion d’axe (Ox)'],
        correctIndex: 1,
        explanation: 'Multiplier par i = e^(iπ/2) correspond à une rotation de centre l’origine O et d’angle π/2 (90°).',
        stepByStepDetails: [
          'Étape 1 : Écrire le complexe i sous forme exponentielle : i = e^(iπ/2).',
          'Étape 2 : Écrire l’équation : z’ - 0 = e^(iπ/2) · (z - 0).',
          'Étape 3 : Reconnaître la forme z’ - ω = e^(iα)(z - ω).',
          'Étape 4 : Conclusion : rotation de centre O(0;0) et d’angle +π/2.'
        ]
      }
    ]
  },
  {
    id: 'math-3',
    subject: 'maths',
    subjectLabel: 'Mathématiques',
    chapter: 'Intégrales & Équations Différentielles',
    title: 'Intégration par parties et résolution de y’ - 2y = 0',
    difficulty: 'difficile',
    durationMinutes: 12,
    curriculum: 'Terminale C (Spécialité Maths)',
    summary: 'Maîtriser la méthode d’intégration par parties et la résolution rigoureuse d’équations différentielles linéaires.',
    questions: [
      {
        id: 'm3-q1',
        question: 'Quelle est la valeur de l’intégrale I = ∫[0 à 1] x·e^x dx ?',
        options: ['1', 'e - 1', 'e - 2', '2e'],
        correctIndex: 0,
        explanation: 'En posant u = x (donc u’ = 1) et v’ = e^x (donc v = e^x) : I = [x e^x][0 à 1] - ∫[0 à 1] e^x dx = e - (e - 1) = 1.',
        stepByStepDetails: [
          'Étape 1 : Choisir u(x) = x => u’(x) = 1.',
          'Étape 2 : Choisir v’(x) = e^x => v(x) = e^x.',
          'Étape 3 : Appliquer la formule ∫ u v’ = [u v] - ∫ u’ v.',
          'Étape 4 : [x e^x] entre 0 et 1 donne (1·e^1 - 0) = e.',
          'Étape 5 : ∫[0 à 1] e^x dx = [e^x] entre 0 et 1 = e - 1.',
          'Étape 6 : I = e - (e - 1) = 1.'
        ]
      }
    ]
  },

  // ==========================================
  // 2. PHYSIQUE-CHIMIE
  // ==========================================
  {
    id: 'phys-1',
    subject: 'physique',
    subjectLabel: 'Physique-Chimie',
    chapter: 'Mécanique Newtonienne & Balistique',
    title: 'Mouvement d’un projectile dans le champ de pesanteur uniforme',
    difficulty: 'moyen',
    durationMinutes: 8,
    curriculum: 'Bac Série C & D',
    summary: 'Établir les équations horaires du mouvement et déterminer la flèche et la portée d’un tir.',
    questions: [
      {
        id: 'p1-q1',
        question: 'Un ballon est lancé du sol avec une vitesse v0 faisant un angle α avec l’horizontale. Quelle est l’accélération du ballon ?',
        options: ['a = v0 · g', 'a = (0, -g)', 'a = (g cos α, g sin α)', 'a = 0'],
        correctIndex: 1,
        explanation: 'La seule force exercée (en négligeant les frottements de l’air) est le poids P = m·g. D’après la 2nde loi de Newton : a = g, dirigé vers le bas (-g).',
        stepByStepDetails: [
          'Étape 1 : Bilan des forces appliquées au projectile : uniquement le poids P = m g.',
          'Étape 2 : 2nde loi de Newton : Σ F = m a => m g = m a => a = g.',
          'Étape 3 : Projection sur l’axe Ox horizontal : ax = 0.',
          'Étape 4 : Projection sur l’axe Oy vertical orienté vers le haut : ay = -g.',
          'Étape 5 : Vecteur accélération a = (0; -g).'
        ]
      },
      {
        id: 'p1-q2',
        question: 'Quelle est la trajectoire décrite par le projectile ?',
        options: ['Une hyperbole', 'Une parabole', 'Une droite verticale', 'Une ellipse fermée'],
        correctIndex: 1,
        explanation: 'En éliminant le temps t entre x(t) = (v0 cos α)t et y(t) = -1/2 gt² + (v0 sin α)t, on obtient une équation cartésienne y = A x² + B x qui est une parabole.',
        stepByStepDetails: [
          'Étape 1 : x(t) = v0 cos(α) · t => t = x / (v0 cos α).',
          'Étape 2 : Remplacer t dans y(t) = -1/2 g t² + v0 sin(α) · t.',
          'Étape 3 : y(x) = - [g / (2 v0² cos² α)] x² + tan(α) · x.',
          'Étape 4 : Cette relation quadratique est l’équation d’une parabole concave vers le bas.'
        ]
      }
    ]
  },
  {
    id: 'phys-2',
    subject: 'physique',
    subjectLabel: 'Physique-Chimie',
    chapter: 'Chimie des Solutions & Acides-Bases',
    title: 'pH des solutions aqueuses et titrage acido-basique',
    difficulty: 'facile',
    durationMinutes: 5,
    curriculum: 'Première & Terminale Scientifique',
    summary: 'Comprendre la relation entre concentration en ions oxonium [H3O+] et le pH.',
    questions: [
      {
        id: 'p2-q1',
        question: 'Une solution aqueuse a une concentration [H3O+] = 1,0 × 10^(-3) mol/L. Quel est son pH ?',
        options: ['pH = 1', 'pH = 3', 'pH = 11', 'pH = 7'],
        correctIndex: 1,
        explanation: 'pH = -log([H3O+]) = -log(10^(-3)) = 3. La solution est acide (pH < 7).',
        stepByStepDetails: [
          'Étape 1 : Rappeler la définition de Sørensen : pH = -log10([H3O+]/C0).',
          'Étape 2 : Calculer -log(1,0 × 10^(-3)).',
          'Étape 3 : Le logarithme décimal de 10^(-3) vaut -3.',
          'Étape 4 : -(-3) = 3.'
        ]
      }
    ]
  },

  // ==========================================
  // 3. SVT (SCIENCES DE LA VIE ET DE LA TERRE)
  // ==========================================
  {
    id: 'svt-1',
    subject: 'svt',
    subjectLabel: 'SVT',
    chapter: 'Génétique Moléculaire & Synthèse des Protéines',
    title: 'Du gène à la protéine : Transcription et Traduction',
    difficulty: 'facile',
    durationMinutes: 6,
    curriculum: 'Bac D (Biologie & Géologie)',
    summary: 'Comprendre le code génétique, le rôle de l’ARNm et des ribosomes.',
    questions: [
      {
        id: 's1-q1',
        question: 'Quel brin d’ARN messager est transcrit à partir du brin d’ADN matrice 3’-TAC GGC TTA-5’ ?',
        options: ['5’-AUG CCG AAU-3’', '5’-ATG CCG AAT-3’', '5’-UAC GGC UUA-3’', '3’-AUG CCG AAU-5’'],
        correctIndex: 0,
        explanation: 'L’ARN est complémentaire et antiparallèle : T s’apparie avec A, A avec U, C avec G, G avec C. 3’-TAC GGC TTA-5’ donne 5’-AUG CCG AAU-3’.',
        stepByStepDetails: [
          'Étape 1 : Règle de complémentarité ADN matrice -> ARNm : T->A, A->U (l’uracile remplace la thymine), C->G, G->C.',
          'Étape 2 : Orientation antiparallèle : le brin matrice 3’->5’ est transcrit en ARNm 5’->3’.',
          'Étape 3 : TAC devient AUG (codon initiateur méthionine).',
          'Étape 4 : GGC devient CCG.',
          'Étape 5 : TTA devient AAU. Résultat : 5’-AUG CCG AAU-3’.'
        ]
      }
    ]
  },
  {
    id: 'svt-2',
    subject: 'svt',
    subjectLabel: 'SVT',
    chapter: 'Géologie & Bassin Sédimentaire du Congo',
    title: 'Tectonique et dynamique sédimentaire du Bassin du Congo',
    difficulty: 'moyen',
    durationMinutes: 7,
    curriculum: 'Programme officiel Congo-Brazzaville SVT',
    summary: 'Analyser la formation de la cuvette congolaise et les séries stratigraphiques côtières de Pointe-Noire.',
    questions: [
      {
        id: 's2-q1',
        question: 'Le bassin sédimentaire côtier de Pointe-Noire (Kouilou) s’est principalement formé lors de quel événement géotectonique ?',
        options: [
          'L’ouverture de l’océan Atlantique Sud au Crétacé',
          'La collision himalayenne au Tertiaire',
          'Le volcanisme du rift est-africain au Quaternaire',
          'L’orogenèse calédonienne'
        ],
        correctIndex: 0,
        explanation: 'Le bassin côtier du Congo est une marge passive formée lors du rifting et de la séparation entre l’Afrique et l’Amérique du Sud au Crétacé inférieur (il y a ~130 millions d’années).',
        stepByStepDetails: [
          'Étape 1 : Contexte tectonique : fracturation du supercontinent Gondwana.',
          'Étape 2 : Phase de rifting avec dépôts continentaux lacustres puis salifères.',
          'Étape 3 : Ouverture océanique avec transgression marine et dépôts d’argiles et de grès pétrolifères.',
          'Étape 4 : Constitution de la marge passive congolaise actuelle.'
        ]
      }
    ]
  },

  // ==========================================
  // 4. FRANÇAIS
  // ==========================================
  {
    id: 'fr-1',
    subject: 'francais',
    subjectLabel: 'Français',
    chapter: 'Littérature Africaine & Négritude',
    title: 'La poésie de Tchicaya U Tam’si et Léopold Sédar Senghor',
    difficulty: 'facile',
    durationMinutes: 5,
    curriculum: 'Premières & Terminales Littéraires (Congo)',
    summary: 'Identifier les registres, les figures de style et l’engagement littéraire congolais et africain.',
    questions: [
      {
        id: 'f1-q1',
        question: 'Gérald-Félix Tchicaya U Tam’si est l’une des plus grandes voix poétiques du Congo. Quelle figure de style est employée dans le vers : "Mon cœur est un fleuve qui déborde de douleur" ?',
        options: ['Une métaphore', 'Une comparaison', 'Une litote', 'Une métonymie'],
        correctIndex: 0,
        explanation: 'C’est une métaphore car l’analogie entre le cœur et le fleuve est établie directement sans mot de comparaison (comme "comme" ou "semblable à").',
        stepByStepDetails: [
          'Étape 1 : Observer les éléments comparés : le comparé (le cœur) et le comparant (un fleuve).',
          'Étape 2 : Vérifier la présence d’un outil grammatical de comparaison (comme, tel, pareil à).',
          'Étape 3 : Aucun outil n’est présent : il s’agit donc d’une métaphore directe.'
        ]
      }
    ]
  },
  {
    id: 'fr-2',
    subject: 'francais',
    subjectLabel: 'Français',
    chapter: 'Grammaire & Syntaxe Avancée',
    title: 'La concordance des temps et les propositions subordonnées',
    difficulty: 'moyen',
    durationMinutes: 7,
    curriculum: 'Bac Littéraire & Scientifique',
    summary: 'Maîtriser les modes (indicatif, subjonctif) et l’expression de l’hypothèse.',
    questions: [
      {
        id: 'f2-q1',
        question: 'Complétez correctement la phrase : "Bien que les épreuves _______ difficiles, les candidats ont brillamment réussi."',
        options: ['sont', 'soient', 'seront', 'fussent'],
        correctIndex: 1,
        explanation: 'La conjonction de subordination de concession "bien que" exige obligatoirement le subjonctif présent : "soient".',
        stepByStepDetails: [
          'Étape 1 : Identifier la locution conjonctive "bien que".',
          'Étape 2 : Règle syntaxique : "bien que" + subjonctif (exprime une opposition/concession).',
          'Étape 3 : Le sujet est "les épreuves" (3ème personne du pluriel).',
          'Étape 4 : Conjuguer le verbe être au subjonctif présent : qu’elles soient.'
        ]
      }
    ]
  },

  // ==========================================
  // 5. ANGLAIS
  // ==========================================
  {
    id: 'ang-1',
    subject: 'anglais',
    subjectLabel: 'Anglais',
    chapter: 'Grammar & Conditionals',
    title: 'Mastering the 2nd and 3rd Conditionals',
    difficulty: 'facile',
    durationMinutes: 5,
    curriculum: 'High School English / Baccalauréat',
    summary: 'Expressing hypothetical situations and past regrets in correct grammatical English.',
    questions: [
      {
        id: 'a1-q1',
        question: 'Complete the sentence: "If she _______ harder last term, she would have passed her exams."',
        options: ['studied', 'had studied', 'has studied', 'would study'],
        correctIndex: 1,
        explanation: 'Third conditional structure: If + past perfect (had studied), would have + past participle (would have passed). It expresses an unfulfilled past situation.',
        stepByStepDetails: [
          'Step 1: Identify the conditional type by looking at the main clause: "would have passed".',
          'Step 2: Recognize the 3rd conditional pattern used for past regrets.',
          'Step 3: The if-clause requires the past perfect tense: had + past participle.',
          'Step 4: Therefore, "had studied" is the only correct answer.'
        ]
      }
    ]
  },
  {
    id: 'ang-2',
    subject: 'anglais',
    subjectLabel: 'Anglais',
    chapter: 'Reading & Scientific Vocabulary',
    title: 'Renewable Energies and Global Innovation',
    difficulty: 'moyen',
    durationMinutes: 7,
    curriculum: 'English for Science & Technology',
    summary: 'Vocabulary relating to solar panels, hydroelectric power stations, and sustainable growth.',
    questions: [
      {
        id: 'a2-q1',
        question: 'Which word is the closest synonym to "sustainable" in the context of development?',
        options: ['Temporary', 'Eco-friendly & durable', 'Expensive', 'Extinct'],
        correctIndex: 1,
        explanation: '"Sustainable" refers to practices that can be maintained over time without depleting natural resources or harming ecosystems.',
        stepByStepDetails: [
          'Step 1: Analyze the root verb "to sustain" (maintain, keep alive).',
          'Step 2: Apply to ecology and economics: sustainable development meets present needs without compromising future generations.',
          'Step 3: Correct equivalent: Eco-friendly and durable.'
        ]
      }
    ]
  },

  // ==========================================
  // 6. HISTOIRE-GÉOGRAPHIE
  // ==========================================
  {
    id: 'hg-1',
    subject: 'histoire_geo',
    subjectLabel: 'Histoire-Géo',
    chapter: 'Histoire du Congo & Décolonisation',
    title: 'L’accession à l’indépendance de la République du Congo (1960)',
    difficulty: 'facile',
    durationMinutes: 6,
    curriculum: 'Histoire Nationale & Panafricaine (Terminale)',
    summary: 'Les étapes de la proclamation de la République et les grandes figures politiques de l’émancipation congolaise.',
    questions: [
      {
        id: 'hg1-q1',
        question: 'En quelle date la République du Congo a-t-elle proclamé officiellement son indépendance ?',
        options: ['15 Août 1960', '1er Janvier 1960', '28 Novembre 1958', '11 Juillet 1962'],
        correctIndex: 0,
        explanation: 'La République du Congo accède à la souveraineté internationale le 15 août 1960, avec l’Abbé Fulbert Youlou comme premier président de la République.',
        stepByStepDetails: [
          'Étape 1 : Le 28 novembre 1958 : proclamation de la République autonome au sein de la Communauté française.',
          'Étape 2 : Négociations d’émancipation totale en 1960.',
          'Étape 3 : 15 août 1960 : signature des accords de souveraineté et proclamation solennelle à Brazzaville.',
          'Étape 4 : Fête nationale commémorée chaque 15 août.'
        ]
      }
    ]
  },
  {
    id: 'hg-2',
    subject: 'histoire_geo',
    subjectLabel: 'Histoire-Géo',
    chapter: 'Géographie Économique & Mondialisation',
    title: 'Le Port Autonome de Pointe-Noire (PAPN), hub maritime en eau profonde',
    difficulty: 'moyen',
    durationMinutes: 8,
    curriculum: 'Géographie Régionale & Mondiale',
    summary: 'Rôle stratégique du port de Pointe-Noire pour le commerce maritime de la sous-région CEMAC.',
    questions: [
      {
        id: 'hg2-q1',
        question: 'Pourquoi le Port Autonome de Pointe-Noire (PAPN) est-il qualifié de port en eau profonde stratégique dans le golfe de Guinée ?',
        options: [
          'Parce qu’il permet l’accueil de porte-conteneurs géants de nouvelle génération grâce à un tirant d’eau supérieur à 15 mètres',
          'Parce qu’il est situé sur le fleuve Congo à plus de 500 km des côtes',
          'Parce qu’il n’exporte que du bois brut',
          'Parce qu’il est réservé uniquement aux embarcations de pêche artisanale'
        ],
        correctIndex: 0,
        explanation: 'Le PAPN est le seul port naturel en eau profonde de la région (tirant d’eau jusqu’à 16 m), ce qui en fait la plateforme de transbordement majeure pour l’Afrique centrale.',
        stepByStepDetails: [
          'Étape 1 : Situation géographique : façade maritime sur l’océan Atlantique Sud.',
          'Étape 2 : Avantage physique : tirant d’eau naturel important permettant l’accueil des navires post-Panamax.',
          'Étape 3 : Raccordement multimodal : couloir logistique avec le CFCO (Chemin de fer Congo-Océan) et la Route Nationale 1 vers Brazzaville et l’hinterland centrafricain.',
          'Étape 4 : Rôle de hub de transbordement sous-régional.'
        ]
      }
    ]
  },

  // ==========================================
  // 7. PHILOSOPHIE
  // ==========================================
  {
    id: 'philo-1',
    subject: 'philo',
    subjectLabel: 'Philosophie',
    chapter: 'La Conscience, l’Inconscient et le Sujet',
    title: 'La certitude du Cogito cartésien et la révolution freudienne',
    difficulty: 'facile',
    durationMinutes: 6,
    curriculum: 'Terminale Toutes Séries (A, C, D)',
    summary: 'Distinguer la conscience réflexive selon Descartes et les remises en cause par la psychanalyse.',
    questions: [
      {
        id: 'ph1-q1',
        question: 'Que signifie précisément la célèbre formule de René Descartes : "Cogito, ergo sum" (Je pense, donc je suis) ?',
        options: [
          'La pensée est la première certitude indubitable qui résiste au doute méthodique et prouve l’existence du sujet',
          'L’homme doit beaucoup penser avant d’agir en société',
          'Les pensées de l’homme sont prédéterminées par l’inconscient',
          'L’existence humaine n’a aucune valeur sans diplôme'
        ],
        correctIndex: 0,
        explanation: 'Dans le Discours de la méthode, Descartes met tout en doute. Même si un mauvais génie le trompe, pour douter ou être trompé, il faut nécessairement penser. Penser prouve l’existence.',
        stepByStepDetails: [
          'Étape 1 : Contexte de la démarche cartésienne : le doute méthodique radical (remise en cause des sens et des évidences).',
          'Étape 2 : Découverte du point d’Archimède : je peux douter de tout, sauf que je doute.',
          'Étape 3 : Or douter, c’est penser.',
          'Étape 4 : Pour penser, il faut nécessairement exister comme substance pensante (res cogitans).',
          'Étape 5 : Première vérité fondamentale et indubitable.'
        ]
      }
    ]
  },
  {
    id: 'philo-2',
    subject: 'philo',
    subjectLabel: 'Philosophie',
    chapter: 'La Liberté, la Loi et l’État',
    title: 'L’obéissance à la loi est-elle la négation de la liberté ?',
    difficulty: 'difficile',
    durationMinutes: 10,
    curriculum: 'Bac Série A & C — Dissertation et Analyse',
    summary: 'Analyser la thèse de Jean-Jacques Rousseau sur la liberté civile et le contrat social.',
    questions: [
      {
        id: 'ph2-q1',
        question: 'Selon Jean-Jacques Rousseau dans "Du Contrat Social", comment concilier la loi et la liberté ?',
        options: [
          'En supprimant toutes les lois pour revenir à l’état de nature',
          '"L’obéissance à la loi qu’on s’est prescrite est liberté"',
          'En confiant tous les pouvoirs à un souverain absolu non élu',
          'La liberté et la loi sont irréconciliables par nature'
        ],
        correctIndex: 1,
        explanation: 'Pour Rousseau, l’homme passe de la liberté naturelle (instinctive) à la liberté civile où, en participant à la volonté générale, il n’obéit qu’à lui-même en obéissant à la loi.',
        stepByStepDetails: [
          'Étape 1 : Problématique : La loi semble limiter l’indépendance de l’individu.',
          'Étape 2 : Distinction clé : liberté naturelle (satisfaction des impulsions) vs liberté civile et morale (autonomie).',
          'Étape 3 : Théorie de la volonté générale : les citoyens sont à la fois auteurs et sujets de la loi.',
          'Étape 4 : Conclusion rousseauiste : l’autonomie morale consiste à obéir à une règle que l’on s’est soi-même donnée.'
        ]
      }
    ]
  }
];
