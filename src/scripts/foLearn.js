// ── Front Office Explainer: popovers (#43) ──────────────────────
// The explainer that used to sit at the bottom of the Front Office page
// ("Front Office 101", #40) is its own page now: /front-office/explainer/.
// On the Front Office page, each job in the chain of command and each
// widget heading opens a short popover from this list, with a link to the
// section of that page that goes deeper. FoLearnPopovers.astro renders
// them; front-office.js and FrontOfficeWidgets.astro add the buttons.

export const LEARN_PATH = 'front-office/explainer/';

// key → { section: id on the Front Office Explainer page, title, short }
export const LEARN_TOPICS = {
  owner: {
    section: 'fo-learn-money',
    title: 'Who sets the payroll?',
    short: 'The owner decides how much the club can spend, and the front office decides how to spend it. MLB has no salary cap, but many clubs treat the luxury tax line as one.',
  },
  president: {
    section: 'fo-learn-president',
    title: 'President vs. GM',
    short: 'Most clubs now put a president of baseball operations above the GM. The president owns the long-term plan and the final call; the GM handles the daily dealmaking. Some clubs give one person both jobs.',
  },
  gm: {
    section: 'fo-learn-gm',
    title: 'What a GM does',
    short: 'The GM builds the roster: trades, contracts and dozens of 40-man roster moves a season, drawing on the scouting, analytics and player development staffs.',
  },
  manager: {
    section: 'fo-learn-manager',
    title: 'What the manager does',
    short: 'The manager runs the team on the field: lineups, pitching changes and the clubhouse. More and more of it is planned before the game with the front office\'s analysts.',
  },
  development: {
    section: 'fo-learn-development',
    title: 'Player development',
    short: 'Draft picks, international signings and prospects from trades become big leaguers in the minor league system, with coaches, pitch and swing labs, and sports science.',
  },
  scouting: {
    section: 'fo-learn-scouting',
    title: 'Scouting and analytics',
    short: 'Scouts judge players in person; analysts work from tracking data and models. Nearly every club blends the two, and the draft still leans hardest on scouts.',
  },
  roster: {
    section: 'fo-learn-rules',
    title: 'The 40-man roster',
    short: 'Every player under a major league contract, and the only players who can play in the majors. 26 are active at a time. Adding a prospect protects him from the Rule 5 Draft.',
  },
  il: {
    section: 'fo-learn-rules',
    title: 'The injured list',
    short: 'A hurt player goes on the 10-day injured list (15 days for pitchers). The 60-day list also frees up his spot on the 40-man roster.',
  },
  moves: {
    section: 'fo-learn-rules',
    title: 'Reading the moves',
    short: 'Most moves are routine: options to the minors, recalls and injured list stints. Designating a player for assignment takes him off the 40-man, and within a week he\'s traded, released or put on waivers.',
  },
  contracts: {
    section: 'fo-learn-money',
    title: 'How salaries are set',
    short: 'Young players earn close to the minimum, reach arbitration after about three years in the majors and free agency after six. Payroll above the luxury tax threshold is taxed.',
  },
  calendar: {
    section: 'fo-learn-calendar',
    title: 'A front office\'s year',
    short: 'Free agency and roster trimming after the World Series, the Winter Meetings and Rule 5 Draft in December, the draft in July and the trade deadline at the end of it.',
  },
};

/** The id of a topic's popover element. */
export const popId = key => `fo-pop-${key}`;

/** A button that opens a topic's popover. `label` is the visible text; an
 * empty label makes a small ⓘ icon button. */
export function learnButton(key, label = '') {
  const t = LEARN_TOPICS[key];
  if (!t) return '';
  return label
    ? `<button type="button" class="fo-pop-btn" popovertarget="${popId(key)}">${label}</button>`
    : `<button type="button" class="fo-pop-btn fo-pop-btn--icon" popovertarget="${popId(key)}" aria-label="About: ${t.title}">i</button>`;
}
