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
      <!-- Background circles -->
      <circle cx="150" cy="150" r="148" fill="#080F0B"/>
      <circle cx="150" cy="150" r="141" fill="#112019"/>
      <!-- Outer stitch ring -->
      <circle cx="150" cy="150" r="140" fill="none" stroke="#C84B11" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round"/>
      <!-- Inner thin ring -->
      <circle cx="150" cy="150" r="133" fill="none" stroke="#C84B11" stroke-width="0.75" opacity="0.5"/>

      <!-- Baseball seam — left outer -->
      <path d="M 105 48 C 42 85 42 215 105 252" fill="none" stroke="#C84B11" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Baseball seam — left inner -->
      <path d="M 118 56 C 62 90 62 210 118 244" fill="none" stroke="#C84B11" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Cross-stitches left -->
      <line x1="88"  y1="62"  x2="103" y2="69"  stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="75"  y1="80"  x2="91"  y2="85"  stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="65"  y1="101" x2="83"  y2="105" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="60"  y1="125" x2="78"  y2="127" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="58"  y1="150" x2="76"  y2="150" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="60"  y1="175" x2="78"  y2="173" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="65"  y1="199" x2="83"  y2="195" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="75"  y1="220" x2="91"  y2="215" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="88"  y1="238" x2="103" y2="231" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>

      <!-- Baseball seam — right outer -->
      <path d="M 195 48 C 258 85 258 215 195 252" fill="none" stroke="#C84B11" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Baseball seam — right inner -->
      <path d="M 182 56 C 238 90 238 210 182 244" fill="none" stroke="#C84B11" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Cross-stitches right -->
      <line x1="212" y1="62"  x2="197" y2="69"  stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="225" y1="80"  x2="209" y2="85"  stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="235" y1="101" x2="217" y2="105" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="240" y1="125" x2="222" y2="127" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="242" y1="150" x2="224" y2="150" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="240" y1="175" x2="222" y2="173" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="235" y1="199" x2="217" y2="195" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="225" y1="220" x2="209" y2="215" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>
      <line x1="212" y1="238" x2="197" y2="231" stroke="#C84B11" stroke-width="1.4" stroke-linecap="round"/>

      <!-- Text content -->
      <text x="150" y="92"  text-anchor="middle" font-family="'Graduate',Georgia,serif" font-size="13" fill="#C84B11" letter-spacing="3">BALTIMORE</text>
      <text x="150" y="108" text-anchor="middle" font-family="'Graduate',Georgia,serif" font-size="11" fill="#C84B11" letter-spacing="5" opacity="0.8">ORIOLES</text>
      <!-- Top rule -->
      <line x1="125" y1="117" x2="175" y2="117" stroke="#C84B11" stroke-width="0.7" opacity="0.55"/>

      <text x="150" y="141" text-anchor="middle" font-family="'Graduate',Georgia,serif" font-size="13" fill="#FFFFFF" letter-spacing="1">FROM THE STOOP</text>
      <text x="150" y="159" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#C84B11" letter-spacing="4" font-style="italic">to</text>
      <text x="150" y="177" text-anchor="middle" font-family="'Graduate',Georgia,serif" font-size="13" fill="#FFFFFF" letter-spacing="1">THE YARD</text>
      <!-- Bottom rule -->
      <line x1="125" y1="187" x2="175" y2="187" stroke="#C84B11" stroke-width="0.7" opacity="0.55"/>

      <text x="150" y="206" text-anchor="middle" font-family="'Graduate',Georgia,serif" font-size="13" fill="#C84B11" letter-spacing="5">· 410 ·</text>
      <text x="150" y="221" text-anchor="middle" font-family="'Graduate',Georgia,serif" font-size="7.5" fill="#C84B11" letter-spacing="2.5" opacity="0.6">BMORE · CITY CONNECT</text>
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
