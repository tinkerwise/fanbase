const PREFS_KEY = 'fb_prefs';
const READ_KEY = 'fb_read';
const READ_ATH_KEY = 'fb_read_ath';

// One-time migration: Fanbase used to share yr_* keys with Yard Report on the
// same origin. Copy them to fb_* on first load so existing settings survive.
// The yr_* originals are left alone since Yard Report still uses them.
(function migrateLegacyKeys() {
  try {
    if (localStorage.getItem(PREFS_KEY) !== null) return;
    if (localStorage.getItem('yr_prefs') === null) return;
    for (const key of ['prefs', 'read', 'read_ath']) {
      const value = localStorage.getItem(`yr_${key}`);
      if (value !== null) localStorage.setItem(`fb_${key}`, value);
    }
  } catch { /* storage unavailable */ }
})();

export function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
}

export function savePrefs(updates) {
  const prefs = { ...loadPrefs(), ...updates };
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  return prefs;
}

export function getReadArticles() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY)) || []);
  } catch {
    return new Set();
  }
}

export function markRead(url) {
  const read = getReadArticles();
  read.add(url);
  const arr = [...read].slice(-200);
  localStorage.setItem(READ_KEY, JSON.stringify(arr));
}

export function unmarkRead(url) {
  const read = getReadArticles();
  read.delete(url);
  localStorage.setItem(READ_KEY, JSON.stringify([...read]));
}

export function getReadAthBundles() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_ATH_KEY)) || []);
  } catch {
    return new Set();
  }
}

export function markReadAthBundle(slug) {
  const read = getReadAthBundles();
  read.add(slug);
  const arr = [...read].slice(-100);
  localStorage.setItem(READ_ATH_KEY, JSON.stringify(arr));
}

export function getDisabledSources() {
  return new Set(loadPrefs().disabledSources || []);
}

export function saveDisabledSources(disabled) {
  savePrefs({ disabledSources: [...disabled] });
}
