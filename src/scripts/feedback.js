// ── Feedback ──────────────────────────────────────────────────────
// A rating (👎 😐 👍) and an optional comment, opened by any
// [data-feedback] button (the footer in Layout.astro). Ported from
// tailgate's thanks.js without its visit-count popover: it only opens when
// asked. Entries go to feedback.php; read them at feedback-admin.php or
// with `npm run feedback`.
import { TEAM_KEY } from './config.js';

const ENDPOINT = `${import.meta.env.BASE_URL}feedback.php`;

const RATINGS = [
  { value: -1, emoji: '👎', label: 'Not great' },
  { value: 0, emoji: '😐', label: 'It’s okay' },
  { value: 1, emoji: '👍', label: 'Love it' },
];

export function openFeedback() {
  const overlay = document.createElement('div');
  overlay.className = 'thanks-overlay';
  overlay.innerHTML = `
    <section class="thanks-dialog" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle">
      <button class="thanks-close" type="button" aria-label="Close">✕</button>
      <h2 class="thanks-title" id="feedbackTitle">Send feedback</h2>
      <form class="thanks-form">
        <fieldset class="thanks-scale">
          <legend>How’s Fanbase working for you?</legend>
          ${RATINGS.map(r => `
            <label class="thanks-rating">
              <input type="radio" name="rating" value="${r.value}" required>
              <span class="thanks-emoji" aria-hidden="true">${r.emoji}</span>
              <span class="thanks-rating-label">${r.label}</span>
            </label>`).join('')}
        </fieldset>
        <label class="thanks-comment-label" for="feedbackComment">Anything to add? <span>(optional)</span></label>
        <textarea class="thanks-comment" id="feedbackComment" name="comment" rows="3" maxlength="1000" placeholder="What would make it better?"></textarea>
        <input class="thanks-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="thanks-status" role="status"></p>
        <div class="thanks-actions">
          <button class="thanks-later" type="button">Cancel</button>
          <button class="thanks-send" type="submit">Send feedback</button>
        </div>
      </form>
    </section>`;
  document.body.appendChild(overlay);

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const form = overlay.querySelector('.thanks-form');
  const status = overlay.querySelector('.thanks-status');
  const send = overlay.querySelector('.thanks-send');

  function close() {
    overlay.remove();
    document.body.style.overflow = previousOverflow;
    document.removeEventListener('keydown', onKeydown);
  }

  function onKeydown(event) {
    if (event.key === 'Escape') close();
  }

  overlay.addEventListener('click', event => {
    if (event.target === overlay || event.target.closest('.thanks-close, .thanks-later')) close();
  });
  document.addEventListener('keydown', onKeydown);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(form);
    let team = '';
    try { team = localStorage.getItem(TEAM_KEY) || ''; } catch { /* storage blocked */ }
    send.disabled = true;
    status.textContent = 'Sending…';
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: Number(data.get('rating')),
          comment: String(data.get('comment') || '').trim(),
          website: String(data.get('website') || ''),
          team,
          page: location.pathname,
        }),
      });
      if (!response.ok) throw new Error(`Feedback request failed (${response.status})`);
      form.innerHTML = '<p class="thanks-sent">Got it, thank you! ⚾</p>';
      setTimeout(close, 1800);
    } catch (error) {
      console.error('Unable to send feedback', error);
      status.textContent = 'That didn’t go through. Please try again in a bit.';
      send.disabled = false;
    }
  });

  overlay.querySelector('.thanks-dialog').focus();
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-feedback]')) openFeedback();
});
