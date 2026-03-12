// content.js — Capsensfaker

if (window.__capsensfakerLoaded) {
  // Already injected — skip to avoid duplicate listeners
} else {
window.__capsensfakerLoaded = true;

function triggerEvents(el) {
  ['input', 'change', 'blur'].forEach(name =>
    el.dispatchEvent(new Event(name, { bubbles: true }))
  );
}

function fillInput(el, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
  triggerEvents(el);
}

function fillField(el, value) {
  if (!el) return;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') fillInput(el, value);
  else if (el.tagName === 'SELECT') { fillSelect(el, value); }
}

function fillSelect(el, value) {
  const val = String(value);
  const valLower = val.toLowerCase();

  // 1. Exact value match
  for (const opt of el.options) {
    if (opt.value === val) { el.value = opt.value; triggerEvents(el); return true; }
  }
  // 2. Exact text match (case-insensitive)
  for (const opt of el.options) {
    if (opt.text.trim().toLowerCase() === valLower) { el.value = opt.value; triggerEvents(el); return true; }
  }
  // 3. Text contains value
  for (const opt of el.options) {
    if (opt.text.toLowerCase().includes(valLower)) { el.value = opt.value; triggerEvents(el); return true; }
  }
  // 4. Value contains value
  for (const opt of el.options) {
    if (opt.value.toLowerCase().includes(valLower)) { el.value = opt.value; triggerEvents(el); return true; }
  }

  return false;
}

function isAlreadyFilled(el) {
  return el && el.value && el.value.trim() !== '';
}

// ── Civilité keywords for select / radio matching ────────────
const CIVILITE_F = ['madame', 'mme', 'mme.', 'mrs', 'ms', 'female', 'femme', 'féminin', 'feminin'];
const CIVILITE_M = ['monsieur', 'mr', 'mr.', 'm.', 'male', 'homme', 'masculin'];

function getLabelTextFor(el) {
  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label) return label.textContent.toLowerCase().trim();
  }
  const parent = el.closest('label');
  return parent ? parent.textContent.toLowerCase().trim() : '';
}

function fillCivilite(el, isFemale) {
  const keywords = isFemale ? CIVILITE_F : CIVILITE_M;
  const letter   = isFemale ? 'f' : 'm';

  if (el.tagName === 'SELECT') {
    // Try keyword match on option text / value
    for (const opt of el.options) {
      const text = opt.textContent.toLowerCase().trim();
      const val  = opt.value.toLowerCase().trim();
      if (keywords.some(kw => text === kw || val === kw || text.includes(kw))) {
        el.value = opt.value;
        triggerEvents(el);
        return true;
      }
    }
    // Fallback: single-letter match (f/m)
    for (const opt of el.options) {
      if (opt.value.toLowerCase().trim() === letter) {
        el.value = opt.value;
        triggerEvents(el);
        return true;
      }
    }
    return false;
  }

  if (el.type === 'radio') {
    // Find all radios in the same group, pick the right one
    const radios = [...document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`)];
    for (const radio of radios) {
      const val   = radio.value.toLowerCase().trim();
      const label = getLabelTextFor(radio);
      if (keywords.some(kw => val === kw || val.includes(kw) || label.includes(kw))) {
        radio.checked = true;
        triggerEvents(radio);
        return true;
      }
    }
    // Fallback: single-letter match
    for (const radio of radios) {
      if (radio.value.toLowerCase().trim() === letter) {
        radio.checked = true;
        triggerEvents(radio);
        return true;
      }
    }
    return false;
  }

  // Text / textarea — just type the value
  fillInput(el, isFemale ? 'Madame' : 'Monsieur');
  return true;
}

// ── Input finder ─────────────────────────────────────────────
function getVisibleInputs(includeRadio = false) {
  return [...document.querySelectorAll('input, textarea, select')]
    .filter(el => {
      const t = (el.type || '').toLowerCase();
      const excluded = ['hidden', 'submit', 'button', 'reset', 'checkbox', 'file'];
      if (!includeRadio) excluded.push('radio');
      return !excluded.includes(t);
    });
}

function findInput(field, excludeEls = new Set()) {
  const { patterns, autocompleteNames, isCivilite } = field;
  const allInputs = getVisibleInputs(!!isCivilite).filter(el => !excludeEls.has(el));

  // Phase 0 — exact autocomplete attribute match (HTML standard, most reliable)
  if (autocompleteNames) {
    for (const ac of autocompleteNames) {
      const lac = ac.toLowerCase();
      for (const el of allInputs) {
        if ((el.autocomplete || '').toLowerCase() === lac) return el;
      }
    }
  }

  // Phase 1 — exact name / id match
  for (const pattern of patterns) {
    const lp = pattern.toLowerCase();
    for (const el of allInputs) {
      if ((el.name || '').toLowerCase() === lp || (el.id || '').toLowerCase() === lp) return el;
    }
  }

  // Phase 2 — partial name / id / placeholder match (no autocomplete — handled by Phase 0)
  for (const pattern of patterns) {
    const lp = pattern.toLowerCase();
    for (const el of allInputs) {
      const name        = (el.name        || '').toLowerCase();
      const id          = (el.id          || '').toLowerCase();
      const placeholder = (el.placeholder || '').toLowerCase();
      if (name.includes(lp) || id.includes(lp) || placeholder.includes(lp)) return el;
    }
  }

  // Phase 3 — label text match
  for (const pattern of patterns) {
    const lp = pattern.toLowerCase();
    for (const label of document.querySelectorAll('label')) {
      if (label.textContent.toLowerCase().includes(lp)) {
        const forId = label.getAttribute('for');
        if (forId) { const el = document.getElementById(forId); if (el && !excludeEls.has(el)) return el; }
        const el = label.querySelector('input, textarea, select');
        if (el && !excludeEls.has(el)) return el;
        const next = label.nextElementSibling;
        if (next && !excludeEls.has(next) && ['INPUT', 'TEXTAREA', 'SELECT'].includes(next.tagName)) return next;
      }
    }
  }

  return null;
}

// ── Field definitions ──────────────────────────────────────
function addressFields(num, name, full, city, zip, group) {
  return [
    {
      label: 'Numéro de rue',
      value: num,
      patterns: ['street_number', 'streetnumber', 'house_number', 'housenumber', 'numero_rue', 'numero_voie', 'num_voie', 'no_voie'],
      addressGroup: group,
    },
    {
      label: 'Nom de voie',
      value: name,
      patterns: ['street_name', 'streetname', 'route', 'nom_voie', 'nom_rue', 'libelle_voie'],
      addressGroup: group,
    },
    {
      label: 'Adresse',
      value: full,
      autocompleteNames: ['street-address', 'address-line1'],
      patterns: ['address', 'adresse', 'street', 'rue', 'addr', 'address1', 'address_line'],
      fallbackAddress: true,
      addressGroup: group,
    },
    {
      label: 'Ville',
      value: city,
      autocompleteNames: ['address-level2'],
      patterns: ['city', 'ville', 'localite', 'localité', 'locality', 'town', 'commune'],
      addressGroup: group,
    },
    {
      label: 'Code postal',
      value: zip,
      autocompleteNames: ['postal-code'],
      patterns: ['zip', 'postal', 'code_postal', 'postcode', 'post_code', 'zipcode', 'cp'],
      addressGroup: group,
    },
  ];
}

function getFieldMap(data, mode) {
  const isPP = mode !== 'pm';

  const personFields = [
    {
      label: 'Civilité',
      value: data.civilite,
      isFemale: data.isFemale,
      autocompleteNames: ['honorific-prefix', 'sex'],
      patterns: ['civilite', 'civilité', 'civility', 'title', 'gender', 'sexe', 'sex', 'salutation', 'titre'],
      isCivilite: true,
    },
    {
      label: 'Prénom',
      value: data.firstName,
      autocompleteNames: ['given-name'],
      patterns: ['first_name', 'firstname', 'prenom', 'prénom', 'given_name', 'given-name', 'fname'],
    },
    {
      label: 'Nom',
      value: data.lastName,
      autocompleteNames: ['family-name'],
      patterns: ['last_name', 'lastname', 'family_name', 'family-name', 'surname', 'lname', 'nom'],
    },
    {
      label: 'Nom complet',
      value: data.fullName,
      autocompleteNames: ['name'],
      patterns: ['full_name', 'fullname', 'full-name', 'name'],
      fallback: true,
    },
    {
      label: 'Email',
      value: data.email,
      autocompleteNames: ['email'],
      patterns: ['email', 'courriel', 'mail', 'e-mail'],
    },
    {
      label: 'Mot de passe',
      value: data.password,
      autocompleteNames: ['new-password', 'current-password'],
      patterns: ['password', 'mot_de_passe', 'mdp', 'passwd', 'pwd', 'pass'],
    },
    {
      label: 'Date de naissance',
      value: data.birthDateISO,
      autocompleteNames: ['bday'],
      patterns: ['birthdate', 'birth_date', 'birth-date', 'dob', 'date_of_birth', 'birthday', 'naissance', 'date_naissance'],
    },
    {
      label: 'Téléphone',
      value: data.phone,
      autocompleteNames: ['tel', 'tel-national'],
      patterns: ['phone', 'telephone', 'téléphone', 'tel', 'mobile', 'cellphone', 'portable'],
    },
  ];

  const companyFields = [
    {
      label: 'Raison sociale',
      value: data.raisonSociale,
      autocompleteNames: ['organization'],
      patterns: ['raison_sociale', 'raisonsociale', 'raison', 'company_name', 'companyname', 'company', 'societe', 'société', 'denomination', 'dénomination', 'nom_societe', 'nom_entreprise', 'entreprise'],
    },
    {
      label: 'SIRET',
      value: data.siret,
      patterns: ['siret', 'numero_siret', 'siret_number', 'siren'],
    },
    {
      label: 'Date de création',
      value: data.creationDateISO,
      patterns: ['creation_date', 'date_creation', 'created_at', 'founding_date', 'date_fondation', 'date_immatriculation', 'immatriculation', 'registration_date', 'date_registration', 'registered_at', 'date_enregistrement'],
    },
  ];

  const paysField = {
    label: 'Pays',
    value: data.country,
    autocompleteNames: ['country', 'country-name'],
    patterns: ['country', 'pays', 'nationality', 'nationalite', 'nationalité'],
  };

  if (isPP) {
    return [...personFields, ...addressFields(data.streetNumPP, data.streetNamePP, data.addressPP, data.cityPP, data.zipPP, 'pp'), paysField];
  }

  // PM: company + company address, then person + personal address
  return [
    ...companyFields,
    ...addressFields(data.streetNumPM, data.streetNamePM, data.addressPM, data.cityPM, data.zipPM, 'pm'),
    ...personFields,
    ...addressFields(data.streetNumPP, data.streetNamePP, data.addressPP, data.cityPP, data.zipPP, 'pp'),
    paysField,
  ];
}

function getSelector(el) {
  if (el.id)   return `#${el.id}`;
  if (el.name) return `[name="${el.name}"]`;
  return el.tagName.toLowerCase();
}

// ── Scan ───────────────────────────────────────────────────
function scanForm(data, mode) {
  const fieldMap = getFieldMap(data, mode);
  const results  = [];
  const usedEls  = new Set();
  let firstNameEl = null, lastNameEl = null;
  const streetFound = {}; // e.g. { pm: { num: true }, pp: { name: true } }

  // Main pass — with fallback logic
  for (const field of fieldMap) {
    if (field.fallback && (firstNameEl || lastNameEl)) {
      results.push({ label: field.label, value: field.value, status: 'skipped', reason: 'prénom/nom détectés séparément' });
      continue;
    }
    if (field.fallbackAddress && field.addressGroup) {
      const g = streetFound[field.addressGroup];
      if (g && (g.num || g.name)) {
        results.push({ label: field.label, value: field.value, status: 'skipped', reason: 'numéro/voie détectés séparément' });
        continue;
      }
    }

    const el = findInput(field, usedEls);
    if (!el) {
      results.push({ label: field.label, value: field.value, status: 'not_found' });
      continue;
    }

    usedEls.add(el);
    if (field.label === 'Prénom')  firstNameEl = el;
    if (field.label === 'Nom')    lastNameEl  = el;
    if (field.label === 'Numéro de rue' && field.addressGroup) {
      streetFound[field.addressGroup] = { ...streetFound[field.addressGroup], num: true };
    }
    if (field.label === 'Nom de voie' && field.addressGroup) {
      streetFound[field.addressGroup] = { ...streetFound[field.addressGroup], name: true };
    }

    results.push({
      label:    field.label,
      value:    field.value,
      status:   isAlreadyFilled(el) ? 'prefilled' : 'ready',
      current:  el.value || '',
      selector: getSelector(el),
    });
  }

  // Extra passes — catch duplicate fields (e.g. two city inputs)
  let foundMore = true;
  while (foundMore) {
    foundMore = false;
    for (const field of fieldMap) {
      if (field.fallback || field.fallbackAddress) continue;
      const el = findInput(field, usedEls);
      if (!el) continue;
      foundMore = true;
      usedEls.add(el);
      results.push({
        label:    field.label,
        value:    field.value,
        status:   isAlreadyFilled(el) ? 'prefilled' : 'ready',
        current:  el.value || '',
        selector: getSelector(el),
      });
    }
  }

  return results;
}

// ── Fill ───────────────────────────────────────────────────
function fillForms(data, mode) {
  const fieldMap = getFieldMap(data, mode);
  const results  = [];
  const usedEls  = new Set();
  let firstNameEl = null, lastNameEl = null;
  const streetFound = {};

  // Main pass — with fallback logic
  for (const field of fieldMap) {
    if (field.fallback && (firstNameEl || lastNameEl)) continue;
    if (field.fallbackAddress && field.addressGroup) {
      const g = streetFound[field.addressGroup];
      if (g && (g.num || g.name)) continue;
    }

    const el = findInput(field, usedEls);
    if (!el) {
      results.push({ label: field.label, value: field.value, filled: false, reason: 'non trouvé' });
      continue;
    }

    usedEls.add(el);
    if (field.label === 'Prénom')  firstNameEl = el;
    if (field.label === 'Nom')    lastNameEl  = el;
    if (field.label === 'Numéro de rue' && field.addressGroup) {
      streetFound[field.addressGroup] = { ...streetFound[field.addressGroup], num: true };
    }
    if (field.label === 'Nom de voie' && field.addressGroup) {
      streetFound[field.addressGroup] = { ...streetFound[field.addressGroup], name: true };
    }

    if (isAlreadyFilled(el) && el.type !== 'radio') {
      results.push({ label: field.label, value: field.value, filled: false, reason: 'déjà rempli' });
      continue;
    }

    if (field.isCivilite) {
      const oldValue = el.value;
      const ok = fillCivilite(el, field.isFemale);
      results.push({ label: field.label, value: field.value, filled: ok, oldValue, selector: getSelector(el) });
    } else {
      const oldValue = el.value;
      fillField(el, field.value);
      results.push({ label: field.label, value: field.value, filled: true, oldValue, selector: getSelector(el) });
    }
  }

  // Extra passes — fill duplicate fields (e.g. two city inputs)
  let foundMore = true;
  while (foundMore) {
    foundMore = false;
    for (const field of fieldMap) {
      if (field.fallback || field.fallbackAddress) continue;
      const el = findInput(field, usedEls);
      if (!el) continue;
      foundMore = true;
      usedEls.add(el);
      if (isAlreadyFilled(el) && el.type !== 'radio') {
        results.push({ label: field.label, value: field.value, filled: false, reason: 'déjà rempli' });
        continue;
      }
      if (field.isCivilite) {
        const oldValue = el.value;
        const ok = fillCivilite(el, field.isFemale);
        results.push({ label: field.label, value: field.value, filled: ok, oldValue, selector: getSelector(el) });
      } else {
        const oldValue = el.value;
        fillField(el, field.value);
        results.push({ label: field.label, value: field.value, filled: true, oldValue, selector: getSelector(el) });
      }
    }
  }

  // Random select pass — fill remaining visible selects with a random option
  for (const el of document.querySelectorAll('select')) {
    if (usedEls.has(el)) continue;
    if (isAlreadyFilled(el)) continue;
    const opts = [...el.options].filter(o => o.value && o.value !== '');
    if (opts.length < 2) continue;
    const oldValue = el.value;
    const pick = opts[Math.floor(Math.random() * opts.length)];
    el.value = pick.value;
    triggerEvents(el);
    usedEls.add(el);
    results.push({ label: 'Select aléatoire', value: pick.text, filled: true, oldValue, selector: getSelector(el) });
  }

  return results;
}

// ── Track last focused input ────────────────────────────────
let lastFocusedEl = null;

document.addEventListener('focusin', e => {
  const el = e.target;
  const tag = el.tagName;
  const t   = (el.type || '').toLowerCase();
  if (
    (tag === 'INPUT' || tag === 'TEXTAREA') &&
    !['hidden', 'submit', 'button', 'reset', 'checkbox', 'radio', 'file'].includes(t)
  ) {
    lastFocusedEl = el;
  }
}, true);

// ── Payment field definitions ────────────────────────────
function getPaymentFieldMap(data) {
  return [
    {
      label: 'Numéro de carte',
      value: data.cardNumber,
      autocompleteNames: ['cc-number'],
      patterns: ['card_number', 'cardnumber', 'card-number', 'cc_number', 'ccnumber', 'cc-number', 'pan', 'numero_carte', 'card_num'],
    },
    {
      label: 'Expiration',
      value: data.cardExpiry,
      autocompleteNames: ['cc-exp'],
      patterns: ['expiry', 'expiration', 'cc_exp', 'cc-exp', 'card_expiry', 'card-expiry', 'exp_date', 'expdate'],
    },
    {
      label: 'Mois d\'expiration',
      value: data.cardExpMonth,
      autocompleteNames: ['cc-exp-month'],
      patterns: ['exp_month', 'expmonth', 'cc-exp-month', 'card_exp_month', 'expiry_month', 'month'],
    },
    {
      label: 'Année d\'expiration',
      value: data.cardExpYear,
      autocompleteNames: ['cc-exp-year'],
      patterns: ['exp_year', 'expyear', 'cc-exp-year', 'card_exp_year', 'expiry_year', 'year'],
    },
    {
      label: 'CVV',
      value: data.cardCvv,
      autocompleteNames: ['cc-csc'],
      patterns: ['cvv', 'cvc', 'csc', 'cc_csc', 'cc-csc', 'security_code', 'card_cvv', 'card_cvc', 'cvv2'],
    },
    {
      label: 'Titulaire de la carte',
      value: data.cardHolder,
      autocompleteNames: ['cc-name'],
      patterns: ['cc_name', 'cc-name', 'card_name', 'cardholder', 'card_holder', 'card-holder', 'titulaire', 'holder_name'],
    },
    {
      label: 'IBAN',
      value: data.iban,
      patterns: ['iban', 'bank_iban', 'account_iban'],
    },
    {
      label: 'BIC',
      value: data.bic,
      patterns: ['bic', 'swift', 'bic_swift', 'bank_bic', 'swift_code'],
    },
  ];
}

function fillPaymentFields(data) {
  const fieldMap = getPaymentFieldMap(data);
  const results = [];
  const usedEls = new Set();

  for (const field of fieldMap) {
    const el = findInput(field, usedEls);
    if (!el) {
      results.push({ label: field.label, value: field.value, filled: false, reason: 'non trouvé' });
      continue;
    }
    usedEls.add(el);
    if (isAlreadyFilled(el)) {
      results.push({ label: field.label, value: field.value, filled: false, reason: 'déjà rempli' });
      continue;
    }
    fillField(el, field.value);
    results.push({ label: field.label, value: field.value, filled: true });
  }
  return results;
}

// ── Message listener ───────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse({ success: true });
  }
  if (message.action === 'scan') {
    const results = scanForm(message.data, message.mode || 'pp');
    sendResponse({ success: true, results: results.map(({ element, ...r }) => r) });
  }
  if (message.action === 'fill') {
    const results = fillForms(message.data, message.mode || 'pp');
    sendResponse({ success: true, results });
  }
  if (message.action === 'fillPayment') {
    const results = fillPaymentFields(message.data);
    sendResponse({ success: true, results });
  }
  if (message.action === 'restoreFields') {
    for (const entry of message.entries) {
      const el = document.querySelector(entry.selector);
      if (el) {
        fillField(el, entry.oldValue);
      }
    }
    sendResponse({ success: true });
  }
  if (message.action === 'fillFocused') {
    if (lastFocusedEl) {
      fillField(lastFocusedEl, message.value);
      sendResponse({ success: true, filled: true });
    } else {
      sendResponse({ success: true, filled: false });
    }
  }
});

} // end of __capsensfakerLoaded guard
