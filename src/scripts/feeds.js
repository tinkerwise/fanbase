async function loadFeeds() {
  const panel = document.getElementById('feeds-panel');
  if (!panel) return;

  try {
    const res = await fetch('/feeds.json');
    if (!res.ok) throw new Error('Failed to load feeds');
    const feeds = await res.json();

    panel.innerHTML = '';

    if (feeds.length === 0) {
      panel.innerHTML = '<p class="loading">No feeds available.</p>';
      return;
    }

    const list = document.createElement('ul');
    list.className = 'feed-list';

    feeds.forEach(feed => {
      const li = document.createElement('li');
      li.className = 'feed-item';
      li.innerHTML = `
        <a href="${feed.url}" target="_blank" rel="noopener noreferrer" class="feed-link">
          <span class="feed-label">${feed.label}</span>
          <span class="feed-type">${feed.type || 'rss'}</span>
        </a>`;
      list.appendChild(li);
    });

    panel.appendChild(list);
  } catch (err) {
    panel.innerHTML = `<p class="error">Could not load feeds: ${err.message}</p>`;
  }
}

loadFeeds();
