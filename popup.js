// popup.js — Capsensfaker

// ── Auth ─────────────────────────────────────────────────────
const ALLOWED_DOMAIN = '@capsens.eu';

function checkAuth() {
  chrome.storage.local.get('authedUser', ({ authedUser }) => {
    if (authedUser?.email?.endsWith(ALLOWED_DOMAIN)) {
      showAuthedUI(authedUser);
    }
    // else: authOverlay stays visible (shown by default in HTML)
  });
}

function showAuthedUI(user) {
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('userName').textContent =
    user.given_name || user.email.split('@')[0];
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

document.getElementById('btnLogout').addEventListener('click', () => {
  chrome.identity.getAuthToken({ interactive: false }, (token) => {
    if (token) chrome.identity.removeCachedAuthToken({ token }, () => {});
  });
  chrome.storage.local.remove('authedUser', () => {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('authOverlay').style.display = 'flex';
  });
});

// ─────────────────────────────────────────────────────────────

let mode = 'pp';
let currentData = null;
let projectType = 'startup';
let currentProject = null;

// ── Persist state ────────────────────────────────────────────
function saveState() {
  chrome.storage.local.set({
    fakerState: { currentData, mode, projectType, currentProject }
  });
}

// ── Render identity card ─────────────────────────────────────
function renderData() {
  const d = currentData;
  const isPP = mode === 'pp';

  const fields = isPP ? `
    <div class="identity-field">
      <div class="field-label">Téléphone</div>
      <div class="field-value" data-value="${d.phone}">${d.phone}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Naissance</div>
      <div class="field-value" data-value="${d.birthDateFR}">${d.birthDateFR}</div>
    </div>
    <div class="identity-field full">
      <div class="field-label">Adresse</div>
      <div class="field-value" data-value="${d.addressPP}, ${d.zipPP} ${d.cityPP}">${d.addressPP}, ${d.zipPP} ${d.cityPP}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">CP</div>
      <div class="field-value" data-value="${d.zipPP}">${d.zipPP}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Ville</div>
      <div class="field-value" data-value="${d.cityPP}">${d.cityPP}</div>
    </div>
  ` : `
    <div class="identity-field full">
      <div class="field-label">Raison sociale</div>
      <div class="field-value" data-value="${d.raisonSociale}">${d.raisonSociale}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">SIRET</div>
      <div class="field-value" data-value="${d.siret}">${d.siret}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Création</div>
      <div class="field-value" data-value="${d.creationDateFR}">${d.creationDateFR}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Téléphone</div>
      <div class="field-value" data-value="${d.phone}">${d.phone}</div>
    </div>
    <div class="identity-field">
      <div class="field-label">Naissance</div>
      <div class="field-value" data-value="${d.birthDateFR}">${d.birthDateFR}</div>
    </div>
    <div class="identity-field full">
      <div class="field-label">Adresse société</div>
      <div class="field-value" data-value="${d.addressPM}, ${d.zipPM} ${d.cityPM}">${d.addressPM}, ${d.zipPM} ${d.cityPM}</div>
    </div>
    <div class="identity-field full">
      <div class="field-label">Adresse perso</div>
      <div class="field-value" data-value="${d.addressPP}, ${d.zipPP} ${d.cityPP}">${d.addressPP}, ${d.zipPP} ${d.cityPP}</div>
    </div>
  `;

  document.getElementById('identityCard').innerHTML = `
    <div class="identity-civilite" data-value="${d.civilite}">${d.civilite}</div>
    <div class="identity-name" data-value="${d.firstName} ${d.lastName}">${d.firstName} ${d.lastName}</div>
    <div class="identity-email" data-value="${d.email}">${d.email}</div>
    <div class="identity-password" data-value="${d.password}">${d.password}</div>
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
  img.onerror = () => { wrap.style.display = 'none'; showToast(`Image introuvable : ${file}`); };
  img.src = url;
}

// ── Switch tab view ──────────────────────────────────────────
function applyMode(newMode) {
  mode = newMode;
  document.querySelectorAll('.mode-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.mode === mode)
  );
  const isProjet = mode === 'projet';
  document.getElementById('identityView').style.display = isProjet ? 'none' : 'block';
  document.getElementById('projectView').style.display  = isProjet ? 'block' : 'none';
  if (!isProjet) {
    document.getElementById('scanPanel').style.display = 'none';
    renderData();
  }
}

// ── Toast ────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Init from storage (called after auth) ────────────────────
function initApp() {
  chrome.storage.local.get(['fakerState', 'fakerSettings'], ({ fakerState, fakerSettings }) => {
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

    renderProject();
    applyMode(fakerState?.mode || 'pp');

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

  currentData = generateData(alias);
  if (phone) currentData.phone = phone;

  renderData();
  document.getElementById('scanPanel').style.display = 'none';
  saveState();
});

// ── Click to copy / fill focused ─────────────────────────────
document.getElementById('identityCard').addEventListener('click', e => {
  const el = e.target.closest('.field-value, .identity-civilite, .identity-name, .identity-email, .identity-password');
  if (!el) return;

  const value = el.dataset.value ?? el.textContent.trim();
  if (!value) return;

  navigator.clipboard.writeText(value).catch(() => {});

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) { showToast('✓ Copié'); return; }
    chrome.tabs.sendMessage(tab.id, { action: 'fillFocused', value }, response => {
      if (chrome.runtime.lastError || !response?.success) {
        showToast('✓ Copié');
        return;
      }
      showToast(response.filled ? '✓✓ Copié et rempli' : '✓ Copié');
    });
  });
});

// ── Scan ─────────────────────────────────────────────────────
document.getElementById('btnScan').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) return;
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
      document.getElementById('scanList').innerHTML = response.results
        .filter(r => r.status === 'ready' || r.status === 'prefilled')
        .map(r => `
        <div class="scan-item">
          <span class="scan-dot dot-${r.status}"></span>
          <span class="scan-label">${r.label}</span>
          <span class="scan-status">${statusLabel[r.status] || r.status}</span>
        </div>
      `).join('');
      document.getElementById('scanPanel').style.display = 'block';
    });
  });
});

// ── Fill ─────────────────────────────────────────────────────
document.getElementById('btnFill').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { action: 'fill', data: currentData, mode }, response => {
      if (chrome.runtime.lastError || !response?.success) {
        showToast('Impossible de remplir cette page');
        return;
      }
      const filled = response.results.filter(r => r.filled).length;
      showToast(filled > 0
        ? `${filled} champ${filled > 1 ? 's' : ''} rempli${filled > 1 ? 's' : ''}`
        : 'Aucun champ à remplir'
      );
      document.getElementById('scanPanel').style.display = 'none';
    });
  });
});

// ── Project type tabs (switch only, no regen) ────────────────
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
  const text = document.getElementById('projectName').textContent.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).catch(() => {});
  showToast('✓ Nom copié');
});

document.getElementById('projectDesc').addEventListener('click', () => {
  const text = document.getElementById('projectDesc').textContent.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).catch(() => {});
  showToast('✓ Description copiée');
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

// ── AI toggle ────────────────────────────────────────────────
let aiVisible = false;
document.getElementById('btnToggleAI').addEventListener('click', () => {
  aiVisible = !aiVisible;
  document.getElementById('aiPanel').style.display = aiVisible ? 'block' : 'none';
  document.getElementById('btnToggleAI').classList.toggle('active', aiVisible);
  if (aiVisible) {
    chrome.storage.sync.get('geminiKey', ({ geminiKey }) => {
      if (geminiKey) document.getElementById('apiKey').value = geminiKey;
    });
  }
});

document.getElementById('btnSaveKey').addEventListener('click', () => {
  const key = document.getElementById('apiKey').value.trim();
  if (!key) { showToast('Clé vide'); return; }
  chrome.storage.sync.set({ geminiKey: key }, () => showToast('Clé sauvegardée'));
});

// ── AI generation ─────────────────────────────────────────────
document.getElementById('btnGenAI').addEventListener('click', async () => {
  const key = document.getElementById('apiKey').value.trim();
  if (!key) { showToast('Clé API manquante'); return; }

  const userContext = document.getElementById('aiPrompt').value.trim();
  const btn = document.getElementById('btnGenAI');
  btn.innerHTML = '<span class="spinner"></span>';
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
});

// ── Boot ─────────────────────────────────────────────────────
checkAuth();
