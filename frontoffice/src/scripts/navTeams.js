// Populate the Teams section in the side nav with all 30 team links
import { TEAM_CONFIG, DIVISIONS } from './teamConfig.js';

const base = import.meta.env.BASE_URL;
const section = document.getElementById('teamNavSection');
if (section) {
  const byDiv = {};
  Object.values(TEAM_CONFIG).forEach(t => {
    if (!byDiv[t.div]) byDiv[t.div] = [];
    byDiv[t.div].push(t);
  });
  DIVISIONS.forEach(div => {
    const teams = (byDiv[div] || []).sort((a, b) => a.name.localeCompare(b.name));
    if (!teams.length) return;
    const label = document.createElement('div');
    label.className = 'nav-section-label';
    label.style.cssText = 'padding-top:8px;font-size:.6rem';
    label.textContent = div;
    section.appendChild(label);
    teams.forEach(t => {
      const a = document.createElement('a');
      a.href = `${base}team/${t.slug}/`;
      a.className = 'nav-link';
      if (location.pathname.includes(`/team/${t.slug}/`)) a.classList.add('active');
      a.innerHTML = `<img src="https://www.mlbstatic.com/team-logos/${t.id}.svg" width="15" height="15" alt="" style="object-fit:contain;border-radius:2px">${t.name}`;
      section.appendChild(a);
    });
  });
}
