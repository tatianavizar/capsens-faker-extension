// faker-data.js — Capsens test data norms

const FIRST_NAMES_F = [
  'Adèle', 'Amandine', 'Aurélie', 'Béatrice', 'Camille', 'Caroline',
  'Charlotte', 'Coralie', 'Delphine', 'Eléonore', 'Emilie', 'Fabienne',
  'Gaëlle', 'Hélène', 'Justine', 'Léa', 'Lucie', 'Margaux', 'Mélanie',
  'Noemie', 'Pauline', 'Sandrine', 'Stéphanie', 'Valérie', 'Virginie'
];

const FIRST_NAMES_M = [
  'Alexis', 'Antoine', 'Baptiste', 'Benjamin', 'Cédric', 'Clément',
  'Damien', 'Edouard', 'Etienne', 'Florent', 'Guillaume', 'Jacques',
  'Laurent', 'Mathieu', 'Nicolas', 'Olivier', 'Pierre', 'Raphaël',
  'Sébastien', 'Thibault', 'Vincent', 'Xavier', 'Yannick'
];

// ⚠️ Norme Capsens : pas de "Test", "Nom", "Prénom" (refusés par Lemonway)
const LAST_NAMES = [
  'Aubert', 'Barbier', 'Blanchard', 'Bourgeois', 'Breton', 'Brunet',
  'Carpentier', 'Chevalier', 'Clement', 'Colin', 'Conte', 'Caron',
  'Dufour', 'Dupont', 'Faure', 'Fontaine', 'Fournier', 'Francois',
  'Garnier', 'Gauthier', 'Girard', 'Guerin', 'Henry', 'Herve',
  'Lambert', 'Leblanc', 'Leclerc', 'Lecomte', 'Lefebvre', 'Legrand',
  'Lemaire', 'Leroux', 'Leroy', 'Lucas', 'Marchand', 'Masson',
  'Meunier', 'Meyer', 'Michaud', 'Morel', 'Moulin', 'Muller',
  'Noel', 'Paris', 'Perez', 'Perrin', 'Philippe', 'Renard',
  'Renault', 'Rey', 'Richard', 'Robin', 'Roger', 'Roland',
  'Rousseau', 'Roussel', 'Schmitt', 'Simon', 'Vidal', 'Weber'
];

const STREETS_PP = [
  'rue de la Paix', 'avenue des Ternes', 'rue du Docteur Schweitzer',
  'impasse des Lilas', 'allée des Roses', 'rue Pasteur',
  'avenue Jean Jaurès', 'rue des Acacias', 'chemin du Moulin',
  'rue Victor Hugo', 'passage des Artisans', 'rue de la République'
];

const STREETS_PM = [
  'avenue Georges Pompidou', 'rue du Commerce', 'boulevard Haussmann',
  'rue du Faubourg Saint-Antoine', 'avenue Montaigne', 'rue de Rivoli',
  'boulevard Saint-Germain', 'rue Lafayette', "avenue de l'Opéra",
  'rue du 4 Septembre', 'boulevard des Italiens', 'rue de Châteaudun'
];

const CITIES_PP = [
  { name: 'Bordeaux',         zip: '33000' },
  { name: 'Nantes',           zip: '44000' },
  { name: 'Rennes',           zip: '35000' },
  { name: 'Grenoble',         zip: '38000' },
  { name: 'Montpellier',      zip: '34000' },
  { name: 'Angers',           zip: '49000' },
  { name: 'Dijon',            zip: '21000' },
  { name: 'Reims',            zip: '51100' },
  { name: 'Brest',            zip: '29200' },
  { name: 'Clermont-Ferrand', zip: '63000' },
  { name: 'Aix-en-Provence',  zip: '13100' },
  { name: 'Rouen',            zip: '76000' },
  { name: 'Toulon',           zip: '83000' },
  { name: 'Amiens',           zip: '80000' },
  { name: 'Caen',             zip: '14000' },
  { name: 'Tours',            zip: '37000' },
  { name: 'Limoges',          zip: '87000' },
  { name: 'Metz',             zip: '57000' },
  { name: 'Besançon',         zip: '25000' },
  { name: 'Orléans',          zip: '45000' },
  { name: 'Perpignan',        zip: '66000' },
  { name: 'Nancy',            zip: '54000' },
  { name: 'Poitiers',         zip: '86000' },
  { name: 'Le Mans',          zip: '72000' },
  { name: 'Nîmes',            zip: '30000' },
  { name: 'La Rochelle',      zip: '17000' },
  { name: 'Troyes',           zip: '10000' },
  { name: 'Pau',              zip: '64000' },
  { name: 'Valence',          zip: '26000' },
  { name: 'Chambéry',         zip: '73000' },
];

const CITIES_PM = [
  { name: 'Paris',            zip: '75008' },
  { name: 'Lyon',             zip: '69002' },
  { name: 'Marseille',        zip: '13001' },
  { name: 'Lille',            zip: '59000' },
  { name: 'Toulouse',         zip: '31000' },
  { name: 'Strasbourg',       zip: '67000' },
  { name: 'Nice',             zip: '06000' },
  { name: 'Nantes',           zip: '44200' },
  { name: 'Bordeaux',         zip: '33000' },
  { name: 'Rennes',           zip: '35000' },
  { name: 'Montpellier',      zip: '34000' },
  { name: 'Grenoble',         zip: '38000' },
  { name: 'Aix-en-Provence',  zip: '13100' },
  { name: 'Rouen',            zip: '76000' },
  { name: 'Toulon',           zip: '83000' },
  { name: 'Metz',             zip: '57000' },
  { name: 'Nancy',            zip: '54000' },
  { name: 'Clermont-Ferrand', zip: '63000' },
  { name: 'Dijon',            zip: '21000' },
  { name: 'Reims',            zip: '51100' },
];

const COMPANY_NAMES = [
  'SCI Les Acacias', 'SARL Durand & Fils', 'Holding Fontaine Capital',
  'SAS Renard Immobilier', 'EURL Blanchard Solutions', 'SCI du Lac Bleu',
  'SARL Techno Invest', 'SAS Leblanc Développement', 'Groupe Leroy & Associés',
  'SCI Les Terrasses du Midi', 'SARL Clement Services', 'SAS Gauthier Finance',
  'Holding Marchand & Cie', 'SCI Fontaine Résidences', 'SARL Chevalier Conseil',
  'SAS Dupont Patrimoine', 'EURL Garnier Investissements', 'SCI Morel & Partenaires',
  'SARL Rousseau Transactions', 'SAS Lecomte Capital', 'SCI des Quatre Saisons',
  'SARL Henry Gestion', 'SAS Girard & Associés', 'Holding Lambert Entreprises'
];

// ── Project generation (static fallback) ──────────────────

const IMMO_PREFIXES = [
  'Résidence', 'Villa', 'Les Terrasses de', 'Le Domaine de',
  'Les Jardins de', 'Le Clos', 'Le Hameau de', 'Les Bastides de',
  "L'Écrin de", 'Les Villas de', 'Le Mas de', 'Les Balcons de'
];

const IMMO_PLACES = [
  'Saint-Martin', 'Bellecour', 'des Pins', 'du Lac', 'du Midi',
  'Beausoleil', 'la Garenne', "Val d'Or", 'Côte Bleue', 'la Source',
  'Bois Joli', 'Soleil Levant', 'la Colline', 'Bel Air', 'les Alpilles',
  'Fontaine Dorée', 'la Forêt', 'les Cèdres', 'la Paix', 'Sainte-Croix',
  'Bellevue', 'les Oliviers', 'du Château', 'la Riviera', 'Val Fleuri'
];

const IMMO_DESCRIPTIONS = [
  "Résidence haut de gamme de 24 appartements BBC en cœur de quartier prisé. Rendement locatif cible 4,8 % net. Livraison T3 2026.",
  "Programme neuf de 18 logements en zone tendue. Fort potentiel locatif, dispositif Pinel éligible. Taux de pré-commercialisation 70 %.",
  "Réhabilitation d'un bâtiment classé en 12 lofts d'exception. Emplacement premium, rentabilité cible 5,2 % brut.",
  "Résidence services seniors de 36 suites meublées. Bail commercial 12 ans, loyers garantis par exploitant national.",
  "Ensemble mixte bureaux/logements en centre-ville. Permis purgé, commercialisation avancée, livraison sous 18 mois.",
  "Opération marchands de biens sur immeuble de rapport. 8 lots rénovés clé en main, cash-flow positif dès le premier mois.",
  "Résidence étudiante de 45 studios meublés à 200 m d'un campus. Taux d'occupation historique 98 %, gestionnaire expérimenté.",
  "Villa de prestige divisée en 6 appartements atypiques. Quartier historique, forte demande locative saisonnière et annuelle.",
  "Immeuble de bureaux restructuré en 10 lofts contemporains. Secteur en mutation, plus-value à la revente estimée 30 %.",
  "Résidence de tourisme 4★ de 28 appartements en station balnéaire. Exploitant référencé, loyers indexés sur l'inflation.",
  "Coliving nouvelle génération de 32 chambres tout équipées. Taux de remplissage > 95 %, loyers supérieurs de 20 % au marché.",
  "Rénovation énergétique d'un immeuble haussmannien en 15 appartements. Label RE2020, déficit foncier optimisé."
];

const STARTUP_NAMES = [
  'Lumio', 'Karbón', 'Treevo', 'Wavo', 'Solis', 'Nexio',
  'Folia', 'Orbis', 'Velox', 'Nimbus', 'Aevo', 'Fluxo',
  'Sylva', 'Helian', 'Verdeo', 'Tactio', 'Prixo', 'Cleyro',
  'Bravio', 'Strivo', 'Vantio', 'Klaro', 'Zemio', 'Aptivo'
];

const STARTUP_DESCRIPTIONS = [
  "Plateforme SaaS B2B de gestion énergétique pour PME industrielles. Réduction de 30 % des coûts en moyenne. Déjà 120 clients actifs.",
  "Marketplace de financement participatif dédiée aux TPE françaises. 8 M€ distribués en 18 mois, taux de défaut < 1 %.",
  "Solution IA pour l'optimisation des tournées logistiques. ROI prouvé en 3 mois, intégration native avec les ERP du marché.",
  "Application de télémédecine spécialisée santé mentale. 15 000 utilisateurs actifs, agréée par 200 mutuelles partenaires.",
  "Plateforme d'achat groupé d'énergie verte pour copropriétés. Économies moyennes de 22 %, déjà 400 résidences engagées.",
  "SaaS RH de gestion des talents pour ETI. Réduit le turnover de 40 %, adopté par 85 entreprises en moins d'un an.",
  "Fintech de paiement fractionné BtoB pour achats professionnels. Volume traité : 12 M€/mois, marges nettes 18 %.",
  "Agritech de pilotage d'irrigation par satellite et IA. Économie d'eau de 35 %, 300 exploitations équipées en France.",
  "EdTech de formation continue certifiante en microlearning. 50 000 apprenants, taux de complétion 78 %, CPF éligible.",
  "Insurtech d'assurance paramétrique pour risques climatiques agricoles. Indemnisation automatique en 48 h, sans expertise.",
  "Outil no-code de création de contrats juridiques pour startups. 2 000 contrats générés/mois, validé par 15 cabinets partenaires.",
  "Plateforme de mise en relation artisans/promoteurs pour chantiers RSE. 600 artisans labellisés, 3 M€ de chantiers signés."
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateData(alias = '') {
  const isFemale  = Math.random() < 0.5;
  const firstName = isFemale ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
  const lastName  = pick(LAST_NAMES);
  const civilite  = isFemale ? 'Madame' : 'Monsieur';

  // Email norme Capsens : alias+prenomnom@capsens.eu
  const firstSlug = firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lastSlug  = lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const prefix = alias ? `${alias}+` : '';
  const email  = `${prefix}${firstSlug}${lastSlug}@capsens.eu`;
  const password = alias
    ? `1${alias.charAt(0).toUpperCase()}${email}`
    : `1${email}`;

  // Birthdate norme Capsens : +18 ans, jour > 12 pour éviter confusion J/M
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const minAge = 18 * msPerYear;
  const maxAge = 70 * msPerYear;
  let birthDate;
  do {
    birthDate = new Date(Date.now() - (minAge + Math.random() * (maxAge - minAge)));
  } while (birthDate.getDate() <= 12);

  const birthDay   = String(birthDate.getDate()).padStart(2, '0');
  const birthMonth = String(birthDate.getMonth() + 1).padStart(2, '0');
  const birthYear  = birthDate.getFullYear();
  const birthDateISO = `${birthYear}-${birthMonth}-${birthDay}`;
  const birthDateFR  = `${birthDay}/${birthMonth}/${birthYear}`;

  // Phone format international +33
  const phonePrefix = Math.random() > 0.5 ? '6' : '7';
  const phoneRest = Array.from({ length: 4 }, () =>
    String(Math.floor(Math.random() * 100)).padStart(2, '0')
  ).join(' ');
  const phone = `+33 ${phonePrefix} ${phoneRest}`;

  // Date de création PM : entre 1 et 20 ans
  const minCreation = 1  * msPerYear;
  const maxCreation = 20 * msPerYear;
  const creationDate = new Date(Date.now() - (minCreation + Math.random() * (maxCreation - minCreation)));
  const creationDay   = String(creationDate.getDate()).padStart(2, '0');
  const creationMonth = String(creationDate.getMonth() + 1).padStart(2, '0');
  const creationYear  = creationDate.getFullYear();
  const creationDateFR  = `${creationDay}-${creationMonth}-${creationYear}`;
  const creationDateISO = `${creationYear}-${creationMonth}-${creationDay}`;

  // Adresse PP
  const cityPP   = pick(CITIES_PP);
  const numPP    = Math.floor(Math.random() * 150) + 1;
  const streetPP = pick(STREETS_PP);

  // Adresse PM
  const cityPM   = pick(CITIES_PM);
  const numPM    = Math.floor(Math.random() * 200) + 1;
  const streetPM = pick(STREETS_PM);

  // Raison sociale
  const raisonSociale = pick(COMPANY_NAMES);

  // SIRET : 9 chiffres SIREN + 5 chiffres NIC
  const siren = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  const nic   = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
  const siret = `${siren}${nic}`;

  return {
    civilite,
    isFemale,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email,
    password,
    birthDateISO,
    birthDateFR,
    phone,
    addressPP: `${numPP} ${streetPP}`,
    streetNumPP: String(numPP),
    streetNamePP: streetPP,
    cityPP: cityPP.name,
    zipPP: cityPP.zip,
    addressPM: `${numPM} ${streetPM}`,
    streetNumPM: String(numPM),
    streetNamePM: streetPM,
    cityPM: cityPM.name,
    zipPM: cityPM.zip,
    raisonSociale,
    siret,
    creationDateFR,
    creationDateISO,
    country: 'France',
  };
}

// ── Payment test data ─────────────────────────────────────
const TEST_CARDS = {
  stripe: [
    { label: 'Visa (succès)',       number: '4242 4242 4242 4242', brand: 'Visa' },
    { label: 'Mastercard (succès)', number: '5555 5555 5555 4444', brand: 'Mastercard' },
    { label: 'Visa (refusée)',      number: '4000 0000 0000 0002', brand: 'Visa' },
  ],
  lemonway: [
    { label: 'CB (succès)',         number: '5017 6791 1038 0400', brand: 'CB' },
    { label: 'Visa FR (succès)',    number: '4600 0000 1000 0400', brand: 'Visa' },
    { label: 'Mastercard (succès)', number: '5017 6792 1000 0700', brand: 'Mastercard' },
    { label: 'CB (refusée)',        number: '5017 6791 1038 0905', brand: 'CB' },
  ],
  mangopay: [
    { label: 'Frictionless (succès)', number: '4970 1071 1111 1119', brand: 'Visa' },
    { label: '3DS Challenge',         number: '4970 1051 8181 8183', brand: 'Visa' },
  ],
};

const TEST_IBANS = [
  { label: 'FR — BNP Paribas',    iban: 'FR76 3000 6000 0112 3456 7890 189', bic: 'BNPAFRPPXXX' },
  { label: 'FR — Crédit Agricole', iban: 'FR76 1820 6000 1112 3456 7890 168', bic: 'AGRIFRPPXXX' },
  { label: 'FR — Société Générale',iban: 'FR76 3000 3000 0100 0000 0000 157', bic: 'SOGEFRPPXXX' },
];

function generateProject(type) {
  if (type === 'immobilier') {
    return {
      name:        `${pick(IMMO_PREFIXES)} ${pick(IMMO_PLACES)}`,
      description: pick(IMMO_DESCRIPTIONS)
    };
  }
  return {
    name:        pick(STARTUP_NAMES),
    description: pick(STARTUP_DESCRIPTIONS)
  };
}
