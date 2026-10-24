// ── Video theater ─────────────────────────────────────────────────
// The YouTube overlay the Home video widget and the Postseason page open.
// Video ids come from feed links and data-* attributes, so they're checked
// against YouTube's id format before they reach the embed URL.
import { safeUrl } from './utils.js';

const VIDEO_ID = /^[\w-]{11}$/;

/** The YouTube id in a watch or youtu.be link, or '' if there isn't a valid one. */
export function extractVideoId(link) {
  const id = String(link ?? '').match(/[?&]v=([^&#]+)/)?.[1] || String(link ?? '').match(/youtu\.be\/([^?&#/]+)/)?.[1] || '';
  return VIDEO_ID.test(id) ? id : '';
}

export function openVideoTheater(videoId) {
  if (!VIDEO_ID.test(videoId ?? '')) return;
  let overlay = document.getElementById('videoTheater');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'videoTheater';
    overlay.className = 'video-theater';
    overlay.innerHTML = `
      <div class="video-theater-backdrop"></div>
      <div class="video-theater-content">
        <button class="video-theater-close" aria-label="Close">&times;</button>
        <div class="video-theater-player"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.video-theater-backdrop').addEventListener('click', closeVideoTheater);
    overlay.querySelector('.video-theater-close').addEventListener('click', closeVideoTheater);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoTheater(); });
  }
  overlay.querySelector('.video-theater-player').innerHTML =
    `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeVideoTheater() {
  const overlay = document.getElementById('videoTheater');
  if (!overlay) return;
  overlay.classList.remove('active');
  overlay.querySelector('.video-theater-player').innerHTML = '';
  document.body.style.overflow = '';
}

// Video cards carry data-video-id (play here) or data-video-url (open on YouTube)
export function bindVideoClicks(container, selector) {
  container.querySelectorAll(selector).forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const id = el.dataset.videoId;
      if (id) openVideoTheater(id);
      else if (safeUrl(el.dataset.videoUrl)) window.open(el.dataset.videoUrl, '_blank', 'noopener');
    });
  });
}
