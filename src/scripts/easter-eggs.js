// ── Easter Eggs ───────────────────────────────────────────────────
import { applyTheme } from './theme.js';
import { loadPrefs } from './storage.js';

export function triggerOriolesMagic() {
  const container = document.createElement('div');
  container.className = 'magic-confetti';
  const birdNum = Math.floor(Math.random() * 10) + 1;
  container.innerHTML = `<div class="magic-banner"><img src="/yardreport/img/randBird${birdNum}.png" alt="Oriole Bird" class="magic-bird"></div>`;
  document.body.appendChild(container);

  const audio = new Audio('/yardreport/audio/orioles_magic_short.mp3');
  audio.volume = 0.7;
  let confettiInterval = null;
  let confettiKickoff = null;
  let fallbackDismissTimer = null;
  let isDismissing = false;

  function emitConfettiBurst() {
    if (!container.isConnected) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const colors = ['#df4601', '#000', '#fff', '#f59e0b', '#ff6b1a'];

    for (let i = 0; i < 48; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-burst';
      const angle = Math.random() * Math.PI * 2;
      const dist = 160 + Math.random() * 420;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      piece.style.left = cx + 'px';
      piece.style.top = cy + 'px';
      piece.style.setProperty('--dx', dx + 'px');
      piece.style.setProperty('--dy', dy + 'px');
      piece.style.animationDelay = Math.random() * 0.18 + 's';
      piece.style.animationDuration = (0.9 + Math.random() * 1.2) + 's';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (4 + Math.random() * 8) + 'px';
      piece.style.height = (4 + Math.random() * 8) + 'px';
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
      container.appendChild(piece);
    }
  }

  const dismiss = () => {
    if (isDismissing) return;
    isDismissing = true;
    clearTimeout(confettiKickoff);
    clearInterval(confettiInterval);
    clearTimeout(fallbackDismissTimer);
    audio.pause();
    audio.currentTime = 0;
    container.classList.add('magic-fade-out');
    setTimeout(() => container.remove(), 600);
    document.removeEventListener('keydown', onKey);
  };
  const onKey = e => { if (e.key === 'Escape') dismiss(); };
  document.addEventListener('keydown', onKey);
  container.addEventListener('click', dismiss);

  audio.addEventListener('ended', dismiss);
  audio.play().catch(() => {
    fallbackDismissTimer = setTimeout(dismiss, 5000);
  });

  confettiKickoff = setTimeout(() => {
    emitConfettiBurst();
    confettiInterval = setInterval(emitConfettiBurst, 650);
  }, 600);
}

export function triggerSevenNationArmy() {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  logo.classList.add('sna-chant');

  const overlay = document.createElement('div');
  overlay.className = 'sna-overlay';
  overlay.innerHTML = `
    <div class="sna-text">
      <span>OH</span><span>OH</span><span>OH</span>
      <span>OH</span><span>OH</span>
      <span class="sna-big">OH-OH</span>
    </div>`;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    logo.classList.remove('sna-chant');
  }, 4000);
}

export function toggleOpacyTheme() {
  const html = document.documentElement;
  if (html.getAttribute('data-theme') === 'opacy') {
    applyTheme(loadPrefs().theme || 'dark');
  } else {
    html.setAttribute('data-theme', 'opacy');
  }
}

export function toggleCityConnectTheme() {
  const html = document.documentElement;
  if (html.getAttribute('data-theme') === 'city-connect') {
    applyTheme(loadPrefs().theme || 'dark');
  } else {
    html.setAttribute('data-theme', 'city-connect');
    triggerCityConnectBanner();
  }
}

export function triggerCityConnectBanner() {
  const banner = document.createElement('div');
  banner.className = 'city-connect-banner';
  banner.innerHTML = `
    <svg class="cc-patch-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-label="From the Stoop to the Yard">
      <!-- Background -->
      <circle cx="150" cy="150" r="148" fill="#080F0B"/>
      <circle cx="150" cy="150" r="141" fill="#0E1C12"/>
      <!-- Outer stitch ring -->
      <circle cx="150" cy="150" r="139" fill="none" stroke="#C84B11" stroke-width="2.8" stroke-dasharray="6 5.2" stroke-linecap="round"/>
      <!-- Inner border ring -->
      <circle cx="150" cy="150" r="131" fill="none" stroke="#C84B11" stroke-width="0.9" opacity="0.6"/>

      <!-- BALTIMORE -->
      <text x="150" y="90"
        text-anchor="middle"
        font-family="Georgia,'Times New Roman',serif"
        font-size="11.5" font-weight="bold" fill="#C84B11" letter-spacing="4.5">BALTIMORE</text>

      <!-- ORIOLES -->
      <text x="150" y="127"
        text-anchor="middle"
        font-family="Georgia,'Times New Roman',serif"
        font-size="38" font-weight="bold" fill="#C84B11" letter-spacing="1.5">ORIOLES</text>

      <!-- Rule -->
      <line x1="100" y1="138" x2="200" y2="138" stroke="#C84B11" stroke-width="0.9" opacity="0.55"/>

      <!-- FROM THE STOOP -->
      <text x="150" y="160"
        text-anchor="middle"
        font-family="Georgia,'Times New Roman',serif"
        font-size="14.5" font-weight="bold" fill="#ffffff" letter-spacing="1.5">FROM THE STOOP</text>

      <!-- TO THE YARD -->
      <text x="150" y="179"
        text-anchor="middle"
        font-family="Georgia,'Times New Roman',serif"
        font-size="14.5" font-weight="bold" fill="#ffffff" letter-spacing="1.5">TO THE YARD</text>

      <!-- Rule -->
      <line x1="100" y1="190" x2="200" y2="190" stroke="#C84B11" stroke-width="0.9" opacity="0.55"/>

      <!-- 410 -->
      <text x="150" y="215"
        text-anchor="middle"
        font-family="Georgia,'Times New Roman',serif"
        font-size="24" font-weight="bold" fill="#C84B11" letter-spacing="5">410</text>
    </svg>`;
  document.body.appendChild(banner);

  const dismiss = () => {
    banner.classList.add('city-connect-banner-out');
    setTimeout(() => banner.remove(), 500);
    document.removeEventListener('keydown', onKey);
  };
  const onKey = e => { if (e.key === 'Escape') dismiss(); };
  document.addEventListener('keydown', onKey);
  banner.addEventListener('click', dismiss);
  setTimeout(dismiss, 3500);
}
