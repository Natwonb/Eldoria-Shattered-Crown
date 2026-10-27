const SAVE_KEY = 'eldoria.shattered-crown.save.v1';
export const CLOUD_SLOT = 'slot-1';

export function saveGame(game) {
  try {
    const stamped = { ...game, savedAt: new Date().toISOString() };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(stamped));
    return stamped;
  } catch (error) {
    console.warn('Eldoria: could not write save', error);
    return game;
  }
}

export function loadGame() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.character) return null;
    return parsed;
  } catch (error) {
    console.warn('Eldoria: could not read save', error);
    return null;
  }
}

export function clearGame() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.warn('Eldoria: could not clear save', error);
  }
}

export function hasSave() {
  return !!loadGame();
}

export function getLocalSavedAt(game) {
  const ts = game?.savedAt;
  const n = Date.parse(ts || '');
  return Number.isFinite(n) ? n : 0;
}

export function getCloudSavedAt(record) {
  const n = Date.parse(record?.saved_at || '');
  return Number.isFinite(n) ? n : 0;
}

export function parseCloudState(record) {
  if (!record?.state_json) return null;
  try {
    const parsed = JSON.parse(record.state_json);
    if (!parsed?.character) return null;
    return { ...parsed, savedAt: record.saved_at || parsed.savedAt };
  } catch (error) {
    console.warn('Eldoria: could not parse cloud save', error);
    return null;
  }
}

/** Fetch the signed-in user's cloud save for the default slot. Requires auth. */
export async function fetchCloudSave(base44, slot = CLOUD_SLOT) {
  const page = await base44.entities.SaveGame.filter({ slot }, { limit: 1, sort: '-saved_at' });
  return (page.items || [])[0] || null;
}

/** Create or update the cloud save from a game object. Always also writes localStorage. */
export async function upsertCloudSave(base44, game, existing = null, slot = CLOUD_SLOT) {
  const stamped = saveGame(game);
  const payload = {
    slot,
    character_name: stamped.character?.name || 'Unknown',
    character_level: Number(stamped.character?.level) || 1,
    saved_at: stamped.savedAt,
    state_json: JSON.stringify(stamped),
  };
  if (existing?.id) {
    return base44.entities.SaveGame.update(existing.id, payload);
  }
  return base44.entities.SaveGame.create(payload);
}

/** Apply a cloud record into localStorage and return the game object. */
export function applyCloudToLocal(record) {
  const state = parseCloudState(record);
  if (!state) return null;
  return saveGame(state);
}
