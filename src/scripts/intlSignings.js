// ── International amateur signings ────────────────────────────────
// The Stats API files an international amateur signing as a plain minor
// league free-agent signing (typeCode SFA). What tells them apart is the
// player: a teenager born outside the countries that go through the draft.
// Shared by Cleanup (cleanup.js) and the Draft page (draftWinter.js, #18).
import { MLB } from './config.js';

// Players born here go through the draft, not the international market
export const DRAFT_COUNTRIES = new Set(['USA', 'Canada', 'Puerto Rico']);

/**
 * The international amateur signings among `transactions` by team `teamId`:
 * [{ t, person: { id, currentAge, birthCountry } }]. One /people call for
 * all of them. Rejects if that call fails.
 */
export async function findIntlSignings(transactions, teamId) {
  const candidates = transactions.filter(t =>
    t.typeCode === 'SFA' && t.toTeam?.id === teamId && /minor league/i.test(t.description ?? '') && t.person?.id);
  if (!candidates.length) return [];
  const ids = [...new Set(candidates.map(t => t.person.id))].slice(0, 300);
  const res = await fetch(`${MLB}/people?personIds=${ids.join(',')}&fields=people,id,currentAge,birthCountry`);
  if (!res.ok) throw new Error(`people ${res.status}`);
  const info = new Map(((await res.json()).people ?? []).map(p => [p.id, p]));
  return candidates
    .map(t => ({ t, person: info.get(t.person.id) }))
    .filter(({ person: p }) => p && p.currentAge <= 19 && p.birthCountry && !DRAFT_COUNTRIES.has(p.birthCountry));
}
