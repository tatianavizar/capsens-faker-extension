// popup.js — Capsensfaker

// ── HTML sanitization ────────────────────────────────────────
function esc(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Auth ─────────────────────────────────────────────────────
const ALLOWED_DOMAIN = '@capsens.eu';

function checkAuth() {
  chrome.storage.local.get('authedUser', ({ authedUser }) => {
    if (authedUser?.email?.endsWith(ALLOWED_DOMAIN)) {
      showAuthedUI(authedUser);
    }
  });
}

function showAuthedUI(user) {
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  initApp();
}

document.getElementById('btnGoogleLogin').addEventListener('click', () => {
  const btn = document.getElementById('btnGoogleLogin');
  const err = document.getElementById('authError');
  btn.disabled = true;
  err.textContent = '';

  chrome.identity.getAuthToken({ interactive: true }, async (token) => {
    if (chrome.runtime.lastError || !token) {
      err.textContent = 'Connexion annulée ou impossible.';
      btn.disabled = false;
      return;
    }
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      if (!user.email?.endsWith(ALLOWED_DOMAIN)) {
        err.textContent = `Accès refusé — utilise ton email @capsens.eu.`;
        chrome.identity.removeCachedAuthToken({ token }, () => {});
        btn.disabled = false;
        return;
      }
      chrome.storage.local.set({ authedUser: user }, () => showAuthedUI(user));
    } catch (e) {
      err.textContent = 'Erreur de connexion, réessaie.';
      btn.disabled = false;
    }
  });
});

// Logout is handled via settings when auth is re-enabled

// ── On-demand content script injection ──────────────────────
function ensureContentScript(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        chrome.scripting.executeScript(
          { target: { tabId }, files: ['content.js'] },
          () => resolve(!chrome.runtime.lastError)
        );
      } else {
        resolve(true);
      }
    });
  });
}

let mode = 'pp';
let currentData = null;
let projectType = 'startup';
let currentProject = null;
let lastFillSnapshot = null;
let lastFillTabId = null;

// ── Persist state ────────────────────────────────────────────
function saveState() {
  chrome.storage.local.set({
    fakerState: { currentData, mode, projectType, currentProject }
  });
}

// ── Copied flash feedback (#9) ───────────────────────────────
function flashCopied(el) {
  el.classList.add('copied');
  setTimeout(() => el.classList.remove('copied'), 500);
}

// ── Render identity card ─────────────────────────────────────
function renderData() {
  const d = currentData;
  const isPP = mode === 'pp';

  const copyAttrs = (value) => `role="button" tabindex="0" data-value="${escAttr(value)}"`;

  const fields = isPP ? `
    <div class="identity-field">
      <div class="field-label">Téléphone</div>
      <div class="field-value" ${copyAttrs(d.phone)}>${esc(d.phone)}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Naissance</div>
      <div class="field-value" ${copyAttrs(d.birthDateFR)}>${esc(d.birthDateFR)}</div>
    </div>
    <div class="identity-field full">
      <div class="field-label">Adresse</div>
      <div class="field-value" ${copyAttrs(`${d.addressPP}, ${d.zipPP} ${d.cityPP}`)}>${esc(d.addressPP)}, ${esc(d.zipPP)} ${esc(d.cityPP)}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">CP</div>
      <div class="field-value" ${copyAttrs(d.zipPP)}>${esc(d.zipPP)}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Ville</div>
      <div class="field-value" ${copyAttrs(d.cityPP)}>${esc(d.cityPP)}</div>
    </div>
  ` : `
    <div class="identity-field full">
      <div class="field-label">Raison sociale</div>
      <div class="field-value" ${copyAttrs(d.raisonSociale)}>${esc(d.raisonSociale)}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">SIRET</div>
      <div class="field-value" ${copyAttrs(d.siret)}>${esc(d.siret)}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Création</div>
      <div class="field-value" ${copyAttrs(d.creationDateFR)}>${esc(d.creationDateFR)}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Téléphone</div>
      <div class="field-value" ${copyAttrs(d.phone)}>${esc(d.phone)}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Naissance</div>
      <div class="field-value" ${copyAttrs(d.birthDateFR)}>${esc(d.birthDateFR)}</div>
    </div>
    <div class="identity-field full">
      <div class="field-label">Adresse société</div>
      <div class="field-value" ${copyAttrs(`${d.addressPM}, ${d.zipPM} ${d.cityPM}`)}>${esc(d.addressPM)}, ${esc(d.zipPM)} ${esc(d.cityPM)}</div>
    </div>
    <div class="identity-field full">
      <div class="field-label">Adresse perso</div>
      <div class="field-value" ${copyAttrs(`${d.addressPP}, ${d.zipPP} ${d.cityPP}`)}>${esc(d.addressPP)}, ${esc(d.zipPP)} ${esc(d.cityPP)}</div>
    </div>
  `;

  document.getElementById('identityCard').innerHTML = `
    <div class="identity-civilite" ${copyAttrs(d.civilite)}>${esc(d.civilite)}</div>
    <div class="identity-name" ${copyAttrs(`${d.firstName} ${d.lastName}`)}>${esc(d.firstName)} ${esc(d.lastName)}</div>
    <div class="identity-email" ${copyAttrs(d.email)}>${esc(d.email)}</div>
    <div class="identity-password" ${copyAttrs(d.password)}>${esc(d.password)}</div>
    <div class="identity-divider"></div>
    <div class="identity-grid">${fields}</div>
  `;
}

// ── Render project card ──────────────────────────────────────
function renderProject() {
  document.getElementById('projectName').textContent = currentProject.name;
  document.getElementById('projectDesc').textContent = currentProject.description;
  renderProjectImage();
}

// ── Project image ─────────────────────────────────────────────
function renderProjectImage() {
  const list = IMAGE_CONFIG[projectType] || [];
  const btn  = document.getElementById('btnRandomImg');
  const wrap = document.getElementById('projectImageWrap');

  if (!list.length) {
    btn.style.display  = 'none';
    wrap.style.display = 'none';
    return;
  }

  btn.style.display = 'flex';
  loadRandomImage();
}

function loadRandomImage() {
  const list = IMAGE_CONFIG[projectType] || [];
  if (!list.length) return;

  const file = list[Math.floor(Math.random() * list.length)];
  const url  = chrome.runtime.getURL(`images/${projectType}/${file}`);
  const img  = document.getElementById('projectImg');
  const wrap = document.getElementById('projectImageWrap');

  img.onload  = () => { wrap.style.display = 'block'; };
  img.onerror = () => { wrap.style.display = 'none'; showToast('Image introuvable'); };
  img.src = url;
}

// ── Switch tab view ──────────────────────────────────────────
function applyMode(newMode) {
  mode = newMode;

  // Update ARIA on tabs
  document.querySelectorAll('.mode-tab').forEach(t => {
    const selected = t.dataset.mode === mode;
    t.setAttribute('aria-selected', String(selected));
  });

  // Show/hide panels
  const panels = {
    identityView: mode === 'pp' || mode === 'pm',
    projectView:  mode === 'projet',
    paymentView:  mode === 'paiement',
  };
  Object.entries(panels).forEach(([id, show]) => {
    document.getElementById(id).style.display = show ? 'block' : 'none';
  });

  if (mode === 'pp' || mode === 'pm') {
    document.getElementById('scanPanel').style.display = 'none';
    renderData();
  }
  if (mode === 'paiement') renderPayment();
}

// ── Toast ────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, action = null) {
  const t = document.getElementById('toast');
  if (action) {
    t.innerHTML = `<span>${esc(msg)}</span><button class="toast-action" id="toastAction">${esc(action.label)}</button>`;
    document.getElementById('toastAction').addEventListener('click', () => {
      action.onClick();
      t.classList.remove('show');
    });
  } else {
    t.textContent = msg;
  }
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), action ? 7000 : 4500);
}

// ── Settings panel ───────────────────────────────────────────
let settingsVisible = false;

document.getElementById('btnSettings').addEventListener('click', () => {
  settingsVisible = !settingsVisible;
  document.getElementById('settingsPanel').style.display = settingsVisible ? 'block' : 'none';
  document.getElementById('btnSettings').classList.toggle('active', settingsVisible);
  // Hide tabs and content when settings is open
  document.querySelector('.mode-tabs').style.display = settingsVisible ? 'none' : 'flex';
  document.getElementById('identityView').style.display = settingsVisible ? 'none' : ((mode === 'pp' || mode === 'pm') ? 'block' : 'none');
  document.getElementById('projectView').style.display = settingsVisible ? 'none' : (mode === 'projet' ? 'block' : 'none');
  document.getElementById('paymentView').style.display = settingsVisible ? 'none' : (mode === 'paiement' ? 'block' : 'none');
  if (settingsVisible) loadSettings();
});

function loadSettings() {
  chrome.storage.local.get(['fakerPrefs', 'geminiKey'], ({ fakerPrefs, geminiKey }) => {
    const prefs = fakerPrefs || {};

    document.querySelectorAll('[data-default-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.defaultTab === (prefs.defaultTab || 'pp'));
    });
    document.querySelectorAll('[data-default-psp]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.defaultPsp === (prefs.defaultPsp || 'stripe'));
    });
    if (geminiKey) document.getElementById('apiKey').value = geminiKey;
  });
}

function savePrefs(updates) {
  chrome.storage.local.get('fakerPrefs', ({ fakerPrefs }) => {
    chrome.storage.local.set({ fakerPrefs: { ...(fakerPrefs || {}), ...updates } });
  });
}

document.querySelectorAll('[data-default-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-default-tab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    savePrefs({ defaultTab: btn.dataset.defaultTab });
  });
});

document.querySelectorAll('[data-default-psp]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-default-psp]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    savePrefs({ defaultPsp: btn.dataset.defaultPsp });
  });
});

document.getElementById('btnSaveKey').addEventListener('click', () => {
  const key = document.getElementById('apiKey').value.trim();
  if (!key) { showToast('Clé vide'); return; }
  chrome.storage.local.set({ geminiKey: key }, () => showToast('Clé sauvegardée'));
});

// ── Init from storage (called after auth) ────────────────────
function initApp() {
  chrome.storage.local.get(['fakerState', 'fakerSettings', 'fakerPrefs'], ({ fakerState, fakerSettings, fakerPrefs }) => {
    const prefs = fakerPrefs || {};

    if (fakerState?.currentData) {
      currentData    = fakerState.currentData;
      projectType    = fakerState.projectType    || 'startup';
      currentProject = fakerState.currentProject || generateProject(projectType);
    } else {
      currentData    = generateData();
      currentProject = generateProject(projectType);
    }

    // Restore saved alias + phone
    if (fakerSettings?.alias) document.getElementById('alias').value = fakerSettings.alias;
    if (fakerSettings?.phone) document.getElementById('phone').value = fakerSettings.phone;

    // Restore project type button
    document.querySelectorAll('.project-type-btn').forEach(t =>
      t.classList.toggle('active', t.dataset.ptype === projectType)
    );

    // Apply preferred PSP
    if (prefs.defaultPsp) {
      currentPsp = prefs.defaultPsp;
      document.querySelectorAll('.psp-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.psp === currentPsp)
      );
    }

    renderProject();
    applyMode(fakerState?.mode || prefs.defaultTab || 'pp');

    if (chrome.runtime?.getManifest) {
      document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;
    }
  });
}

// ── Persist alias + phone on input ───────────────────────────
function saveSettings() {
  chrome.storage.local.set({
    fakerSettings: {
      alias: document.getElementById('alias').value.trim(),
      phone: document.getElementById('phone').value.trim(),
    }
  });
}
document.getElementById('alias').addEventListener('input', saveSettings);
document.getElementById('phone').addEventListener('input', saveSettings);

document.getElementById('btnResetSettings').addEventListener('click', () => {
  document.getElementById('alias').value = '';
  document.getElementById('phone').value = '';
  chrome.storage.local.remove('fakerSettings');
});

// ── Mode tabs ────────────────────────────────────────────────
document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    applyMode(tab.dataset.mode);
    saveState();
  });
});

// ── Generate ─────────────────────────────────────────────────
document.getElementById('btnGenerate').addEventListener('click', () => {
  const alias = document.getElementById('alias').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const btn = document.getElementById('btnGenerate');
  const card = document.getElementById('identityCard');

  currentData = generateData(alias);
  if (phone) currentData.phone = phone;

  // Animation feedback
  btn.classList.add('loading');
  card.classList.add('refreshing');
  setTimeout(() => {
    btn.classList.remove('loading');
    card.classList.remove('refreshing');
  }, 400);

  renderData();
  document.getElementById('scanPanel').style.display = 'none';
  saveState();
});

// ── Click to copy / fill focused (#3 keyboard + #9 flash) ───
document.getElementById('identityCard').addEventListener('click', handleCopyClick);
document.getElementById('identityCard').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleCopyClick(e);
  }
});

function handleCopyClick(e) {
  const el = e.target.closest('[role="button"][data-value], .field-value, .identity-civilite, .identity-name, .identity-email, .identity-password');
  if (!el) return;

  const value = el.dataset.value ?? el.textContent.trim();
  if (!value) return;

  navigator.clipboard.writeText(value).catch(() => {});
  flashCopied(el);

  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    if (!tab) { showToast('Copié'); return; }
    const ok = await ensureContentScript(tab.id);
    if (!ok) { showToast('Copié'); return; }
    chrome.tabs.sendMessage(tab.id, { action: 'fillFocused', value }, response => {
      if (chrome.runtime.lastError || !response?.success) {
        showToast('Copié');
        return;
      }
      showToast(response.filled ? 'Copié et rempli' : 'Copié');
    });
  });
}

// ── Scan ─────────────────────────────────────────────────────
document.getElementById('btnScan').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    if (!tab) return;
    const ok = await ensureContentScript(tab.id);
    if (!ok) { showToast('Impossible de scanner cette page'); return; }
    chrome.tabs.sendMessage(tab.id, { action: 'scan', data: currentData, mode }, response => {
      if (chrome.runtime.lastError || !response?.success) {
        showToast('Impossible de scanner cette page');
        return;
      }
      const statusLabel = {
        ready:     'Prêt',
        prefilled: 'Déjà rempli',
        not_found: 'Non trouvé',
        skipped:   'Ignoré',
      };
      const visible = response.results.filter(r => r.status === 'ready' || r.status === 'prefilled');

      if (visible.length === 0) {
        document.getElementById('scanList').innerHTML =
          '<div class="scan-empty">Aucun champ de formulaire détecté sur cette page.</div>';
      } else {
        document.getElementById('scanList').innerHTML = visible
          .map(r => `
          <div class="scan-item">
            <span class="scan-dot dot-${escAttr(r.status)}" aria-hidden="true"></span>
            <span class="scan-label">${esc(r.label)}</span>
            <span class="scan-status">${esc(statusLabel[r.status] || r.status)}</span>
          </div>
        `).join('');
      }
      document.getElementById('scanPanel').style.display = 'block';
    });
  });
});

// ── Fill (with loading state + undo) ─────────────────────────
document.getElementById('btnFill').addEventListener('click', () => {
  const btn = document.getElementById('btnFill');
  btn.classList.add('loading');
  btn.innerHTML = '<span class="spinner"></span> Remplissage…';

  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    if (!tab) { resetFillBtn(btn); return; }
    const ok = await ensureContentScript(tab.id);
    if (!ok) { showToast('Impossible de remplir cette page'); resetFillBtn(btn); return; }
    chrome.tabs.sendMessage(tab.id, { action: 'fill', data: currentData, mode }, response => {
      resetFillBtn(btn);
      if (chrome.runtime.lastError || !response?.success) {
        showToast('Impossible de remplir cette page');
        return;
      }
      const filled = response.results.filter(r => r.filled).length;
      const undoEntries = response.results.filter(r => r.filled && r.selector);

      if (filled > 0 && undoEntries.length > 0) {
        lastFillSnapshot = undoEntries;
        lastFillTabId = tab.id;
        showToast(
          `${filled} champ${filled > 1 ? 's' : ''} rempli${filled > 1 ? 's' : ''}`,
          { label: 'Annuler', onClick: undoLastFill }
        );
      } else {
        showToast(filled > 0
          ? `${filled} champ${filled > 1 ? 's' : ''} rempli${filled > 1 ? 's' : ''}`
          : 'Aucun champ à remplir'
        );
      }
      document.getElementById('scanPanel').style.display = 'none';
    });
  });
});

function resetFillBtn(btn) {
  btn.classList.remove('loading');
  btn.textContent = 'Remplir le formulaire';
}

function undoLastFill() {
  if (!lastFillSnapshot || !lastFillTabId) return;
  chrome.tabs.sendMessage(lastFillTabId, {
    action: 'restoreFields',
    entries: lastFillSnapshot.map(r => ({ selector: r.selector, oldValue: r.oldValue }))
  }, response => {
    if (response?.success) showToast('Remplissage annulé');
  });
  lastFillSnapshot = null;
}

// ── Project type tabs ────────────────────────────────────────
document.querySelectorAll('.project-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    projectType = btn.dataset.ptype;
    document.querySelectorAll('.project-type-btn').forEach(t =>
      t.classList.toggle('active', t === btn)
    );
    saveState();
  });
});

document.getElementById('btnRegenProject').addEventListener('click', () => {
  currentProject = generateProject(projectType);
  renderProject();
  saveState();
});

document.getElementById('btnRandomImg').addEventListener('click', () => {
  loadRandomImage();
});

// ── Project click-to-copy + image download ───────────────────
document.getElementById('projectName').addEventListener('click', () => {
  const el = document.getElementById('projectName');
  const text = el.textContent.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).catch(() => {});
  flashCopied(el);
  showToast('Nom copié');
});
document.getElementById('projectName').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); }
});

document.getElementById('projectDesc').addEventListener('click', () => {
  const el = document.getElementById('projectDesc');
  const text = el.textContent.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).catch(() => {});
  flashCopied(el);
  showToast('Description copiée');
});
document.getElementById('projectDesc').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); }
});

document.getElementById('projectImg').addEventListener('click', () => {
  const img = document.getElementById('projectImg');
  if (!img.src) return;
  if (!confirm('Télécharger cette image ?')) return;
  const a = document.createElement('a');
  a.href = img.src;
  a.download = img.src.split('/').pop() || 'project-image.jpg';
  a.click();
});

// ── AI toggle & generation ───────────────────────────────────
let aiVisible = false;
document.getElementById('btnToggleAI').addEventListener('click', () => {
  aiVisible = !aiVisible;
  document.getElementById('aiPanel').style.display = aiVisible ? 'block' : 'none';
  document.getElementById('btnToggleAI').classList.toggle('active', aiVisible);
  if (aiVisible) renderAIPanel();
});

function renderAIPanel() {
  chrome.storage.local.get('geminiKey', ({ geminiKey }) => {
    const container = document.getElementById('aiContent');
    if (!geminiKey) {
      container.innerHTML = `
        <div class="ai-no-key">
          Clé API Gemini non configurée.<br>
          <button id="btnGoSettings">Ouvrir les paramètres</button>
        </div>`;
      document.getElementById('btnGoSettings').addEventListener('click', () => {
        document.getElementById('btnSettings').click();
        setTimeout(() => document.getElementById('apiKey').focus(), 100);
      });
    } else {
      container.innerHTML = `
        <textarea class="ai-prompt" id="aiPrompt" rows="2" placeholder="Contexte optionnel… ex : green tech en Bretagne" aria-label="Contexte pour la génération IA"></textarea>
        <button class="btn-gen-ai" id="btnGenAI">Générer avec Gemini</button>`;
      document.getElementById('btnGenAI').addEventListener('click', generateWithAI);
    }
  });
}

async function generateWithAI() {
  const btn = document.getElementById('btnGenAI');
  const promptEl = document.getElementById('aiPrompt');

  const { geminiKey: key } = await new Promise(r => chrome.storage.local.get('geminiKey', r));
  if (!key) { showToast('Clé API manquante'); return; }

  const userContext = promptEl ? promptEl.value.trim() : '';
  btn.innerHTML = '<span class="spinner spinner--light"></span>';
  btn.disabled = true;

  const typeLabel = projectType === 'immobilier' ? 'immobilier' : 'startup';
  const systemPrompt = [
    `Tu génères des données fictives pour des tests de formulaires.`,
    `Génère un projet de type "${typeLabel}" avec un nom court (2–5 mots) et une description convaincante (2–3 phrases max).`,
    userContext ? `Contexte : ${userContext}` : '',
    `Réponds uniquement en JSON avec les clés "name" et "description", sans markdown.`,
  ].filter(Boolean).join(' ');

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 300 },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) { showToast(data.error?.message || `Erreur ${res.status}`); return; }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) { showToast('Réponse IA invalide'); return; }

    const parsed = JSON.parse(match[0]);
    if (!parsed.name || !parsed.description) { showToast('JSON incomplet'); return; }

    currentProject = parsed;
    renderProject();
    saveState();
    showToast('Projet généré par IA');
  } catch (err) {
    showToast('Erreur : ' + err.message);
  } finally {
    btn.textContent = 'Générer avec Gemini';
    btn.disabled = false;
  }
}

// ── Payment tab ─────────────────────────────────────────────
let currentPsp = 'stripe';

function renderPayment() {
  renderCards();
  renderIbans();
}

function renderCards() {
  const cards = TEST_CARDS[currentPsp] || [];
  document.getElementById('cardList').innerHTML = cards.map(c => `
    <div class="payment-item" data-copy="${escAttr(c.number.replace(/\s/g, ''))}" role="button" tabindex="0" aria-label="${escAttr(c.label)} — ${escAttr(c.number)}">
      <div>
        <div class="payment-item-label">${esc(c.label)}</div>
        <div class="payment-item-value">${esc(c.number)}</div>
      </div>
      <div class="payment-item-sub">${esc(c.brand)}</div>
    </div>
  `).join('');
}

function renderIbans() {
  document.getElementById('ibanList').innerHTML = TEST_IBANS.map(i => `
    <div class="payment-item" data-copy="${escAttr(i.iban.replace(/\s/g, ''))}" role="button" tabindex="0" aria-label="${escAttr(i.label)} — ${escAttr(i.iban)}">
      <div>
        <div class="payment-item-label">${esc(i.label)}</div>
        <div class="payment-item-value">${esc(i.iban)}</div>
      </div>
      <div class="payment-item-sub" data-copy="${escAttr(i.bic)}" role="button" tabindex="0" aria-label="Copier BIC ${escAttr(i.bic)}">${esc(i.bic)}</div>
    </div>
  `).join('');
}

// PSP tabs
document.querySelectorAll('.psp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentPsp = tab.dataset.psp;
    document.querySelectorAll('.psp-tab').forEach(t =>
      t.classList.toggle('active', t === tab)
    );
    renderCards();
    document.getElementById('cardFilter').value = '';
  });
});

// Payment filter (#30)
document.getElementById('cardFilter').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#cardList .payment-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    item.classList.toggle('hidden', q && !text.includes(q));
  });
});

// Click-to-copy on payment items (with keyboard support)
document.getElementById('paymentView').addEventListener('click', handlePaymentCopy);
document.getElementById('paymentView').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handlePaymentCopy(e);
  }
});

function handlePaymentCopy(e) {
  const sub = e.target.closest('.payment-item-sub[data-copy]');
  if (sub) {
    e.stopPropagation();
    navigator.clipboard.writeText(sub.dataset.copy).catch(() => {});
    flashCopied(sub);
    showToast('BIC copié');
    return;
  }
  const item = e.target.closest('.payment-item[data-copy]');
  if (item) {
    navigator.clipboard.writeText(item.dataset.copy).catch(() => {});
    flashCopied(item);
    showToast('Copié');
  }
}

// Copy CVV / Expiration
document.getElementById('btnCopyCvv').addEventListener('click', (e) => {
  navigator.clipboard.writeText('123').catch(() => {});
  flashCopied(e.target);
  showToast('CVV copié');
});
document.getElementById('btnCopyExp').addEventListener('click', (e) => {
  navigator.clipboard.writeText('1230').catch(() => {});
  flashCopied(e.target);
  showToast('Expiration copiée');
});

// Fill payment fields on page
document.getElementById('btnFillPayment').addEventListener('click', () => {
  const cards = TEST_CARDS[currentPsp] || [];
  const successCard = cards[0];
  if (!successCard) return;

  const btn = document.getElementById('btnFillPayment');
  btn.classList.add('loading');
  btn.innerHTML = '<span class="spinner"></span> Remplissage…';

  const paymentData = {
    cardNumber: successCard.number.replace(/\s/g, ''),
    cardExpiry: '12/30',
    cardExpMonth: '12',
    cardExpYear: '2030',
    cardCvv: '123',
    cardHolder: currentData ? `${currentData.firstName} ${currentData.lastName}` : 'Jean Dupont',
    iban: TEST_IBANS[0].iban.replace(/\s/g, ''),
    bic: TEST_IBANS[0].bic,
  };

  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    if (!tab) { resetPayFillBtn(btn); return; }
    const ok = await ensureContentScript(tab.id);
    if (!ok) { showToast('Impossible de remplir cette page'); resetPayFillBtn(btn); return; }
    chrome.tabs.sendMessage(tab.id, { action: 'fillPayment', data: paymentData }, response => {
      resetPayFillBtn(btn);
      if (chrome.runtime.lastError || !response?.success) {
        showToast('Impossible de remplir cette page');
        return;
      }
      const filled = response.results.filter(r => r.filled).length;
      showToast(filled > 0
        ? `${filled} champ${filled > 1 ? 's' : ''} rempli${filled > 1 ? 's' : ''}`
        : 'Aucun champ de paiement trouvé'
      );
    });
  });
});

function resetPayFillBtn(btn) {
  btn.classList.remove('loading');
  btn.textContent = 'Remplir le formulaire';
}

// ── Boot ─────────────────────────────────────────────────────
// checkAuth();
showAuthedUI({ email: 'dev@capsens.eu', given_name: 'Dev' });
