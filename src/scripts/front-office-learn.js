// ── How a Front Office Works ──────────────────────────────────────
// /front-office/how-it-works/ (#43). The page is static and works without a
// team; once one is picked (or ?view= shows one), the sections about the
// owner, president, GM and manager name that club's people.
import './theme.js';
import './teamPicker.js';
import { TEAM, PICKED_TEAM_ID } from './config.js';
import { loadTeamFile, chainOfCommand, fillClubPeople } from './frontOfficeData.js';

if (PICKED_TEAM_ID) {
  loadTeamFile(TEAM.id).then(file => {
    if (file) fillClubPeople(TEAM, chainOfCommand(file));
  });
}
