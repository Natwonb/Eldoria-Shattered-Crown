import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createCharacter } from '@/lib/gameState';
import {
  createGame,
  startQuest,
  failQuest,
  advanceQuests,
  markVisited,
  recordVictory,
  recordDefeat,
  addItem,
  removeItem,
  equipItem,
  consumePotion,
  addRelationship,
  setFlag,
  pushEvent,
  checkAchievements,
  completedCount,
  computeEnding,
  listQuests,
} from '@/lib/gameEngine';
import {
  saveGame,
  loadGame,
  clearGame,
  fetchCloudSave,
  upsertCloudSave,
  applyCloudToLocal,
  parseCloudState,
  getLocalSavedAt,
  getCloudSavedAt,
} from '@/lib/save';
import { getQuest } from '@/data/quests';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const GameContext = createContext(null);

function newlyCompleted(before, after) {
  return Object.keys(after.quests || {}).filter(
    (id) => after.quests[id]?.status === 'completed' && before.quests?.[id]?.status !== 'completed'
  );
}

export function GameProvider({ children }) {
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const [game, setGame] = useState(() => loadGame());
  const [notice, setNotice] = useState(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMeta, setCloudMeta] = useState(null);
  const [cloudError, setCloudError] = useState(null);
  const [conflict, setConflict] = useState(null);
  const gameRef = useRef(game);
  const cloudRecordRef = useRef(null);
  const syncStartedRef = useRef(false);
  const cloudTimerRef = useRef(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 5200);
    return () => clearTimeout(timer);
  }, [notice]);

  const announce = useCallback((payload) => {
    if (!payload?.title) return;
    setNotice({ ...payload, key: Date.now() });
  }, []);

  const refreshCloudMeta = useCallback((record) => {
    cloudRecordRef.current = record;
    if (!record) {
      setCloudMeta(null);
      return;
    }
    setCloudMeta({
      id: record.id,
      saved_at: record.saved_at,
      character_name: record.character_name,
      character_level: record.character_level,
    });
  }, []);

  const queueCloudSave = useCallback((nextGame) => {
    if (!isAuthenticated || !nextGame?.character) return;
    if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current);
    cloudTimerRef.current = setTimeout(async () => {
      try {
        setCloudError(null);
        const record = await upsertCloudSave(base44, nextGame, cloudRecordRef.current);
        refreshCloudMeta(record);
      } catch (error) {
        console.warn('Eldoria: cloud autosave failed', error);
        setCloudError(error?.message || 'Cloud save failed');
      }
    }, 1800);
  }, [isAuthenticated, refreshCloudMeta]);

  const commit = useCallback((next, extra) => {
    if (!next) return;
    const stamped = saveGame(next);
    gameRef.current = stamped;
    setGame(stamped);
    queueCloudSave(stamped);
    if (extra) announce(extra);
  }, [announce, queueCloudSave]);

  const applyGame = useCallback((next, extra) => {
    if (!next) return;
    const stamped = saveGame(next);
    gameRef.current = stamped;
    setGame(stamped);
    if (extra) announce(extra);
  }, [announce]);

  const newGame = useCallback((setup) => {
    const character = createCharacter(setup);
    const fresh = createGame(character);
    const stamped = saveGame(fresh);
    gameRef.current = stamped;
    setGame(stamped);
    queueCloudSave(stamped);
    return stamped;
  }, [queueCloudSave]);

  const resetGame = useCallback(() => {
    if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current);
    clearGame();
    gameRef.current = null;
    setGame(null);
    setNotice(null);
    setConflict(null);
  }, []);

  const saveToCloud = useCallback(async () => {
    const current = gameRef.current;
    if (!isAuthenticated) {
      setCloudError('Sign in to save to the cloud.');
      return { ok: false, reason: 'guest' };
    }
    if (!current?.character) {
      setCloudError('No chronicle to save.');
      return { ok: false, reason: 'empty' };
    }
    setCloudBusy(true);
    setCloudError(null);
    try {
      const record = await upsertCloudSave(base44, current, cloudRecordRef.current);
      refreshCloudMeta(record);
      announce({ title: 'Cloud save', text: 'Chronicle written to your account.' });
      return { ok: true, record };
    } catch (error) {
      const message = error?.message || 'Cloud save failed';
      setCloudError(message);
      return { ok: false, reason: 'error', message };
    } finally {
      setCloudBusy(false);
    }
  }, [announce, isAuthenticated, refreshCloudMeta]);

  const loadFromCloud = useCallback(async ({ force = false } = {}) => {
    if (!isAuthenticated) {
      setCloudError('Sign in to load a cloud save.');
      return { ok: false, reason: 'guest' };
    }
    setCloudBusy(true);
    setCloudError(null);
    try {
      const record = await fetchCloudSave(base44);
      refreshCloudMeta(record);
      if (!record) {
        setCloudError('No cloud save found on this account.');
        return { ok: false, reason: 'missing' };
      }
      const cloudGame = parseCloudState(record);
      if (!cloudGame) {
        setCloudError('Cloud save is damaged.');
        return { ok: false, reason: 'corrupt' };
      }
      const local = gameRef.current;
      if (!force && local?.character) {
        const localTs = getLocalSavedAt(local);
        const cloudTs = getCloudSavedAt(record);
        if (localTs && cloudTs && Math.abs(localTs - cloudTs) > 2000 && localTs > cloudTs) {
          setConflict({
            reason: 'local_newer',
            local,
            cloud: cloudGame,
            cloudRecord: record,
            localAt: new Date(localTs).toISOString(),
            cloudAt: record.saved_at,
          });
          return { ok: false, reason: 'conflict' };
        }
      }
      applyGame(cloudGame, {
        title: 'Cloud load',
        text: `${cloudGame.character?.name || 'Chronicle'} restored from your account.`,
      });
      return { ok: true, record };
    } catch (error) {
      const message = error?.message || 'Cloud load failed';
      setCloudError(message);
      return { ok: false, reason: 'error', message };
    } finally {
      setCloudBusy(false);
    }
  }, [applyGame, isAuthenticated, refreshCloudMeta]);

  const resolveConflict = useCallback(async (choice) => {
    if (!conflict) return;
    setCloudBusy(true);
    setCloudError(null);
    try {
      if (choice === 'local') {
        const record = await upsertCloudSave(base44, conflict.local, conflict.cloudRecord || cloudRecordRef.current);
        refreshCloudMeta(record);
        applyGame(conflict.local, { title: 'Kept local', text: 'Local chronicle uploaded to the cloud.' });
      } else if (choice === 'cloud') {
        applyCloudToLocal(conflict.cloudRecord);
        applyGame(conflict.cloud, { title: 'Kept cloud', text: 'Cloud chronicle loaded onto this device.' });
        refreshCloudMeta(conflict.cloudRecord);
      }
      setConflict(null);
    } catch (error) {
      setCloudError(error?.message || 'Could not resolve save conflict');
    } finally {
      setCloudBusy(false);
    }
  }, [applyGame, conflict, refreshCloudMeta]);

  // On login: migrate local → cloud if empty; otherwise pick newest or prompt.
  useEffect(() => {
    if (!authChecked || isLoadingAuth) return undefined;
    if (!isAuthenticated) {
      syncStartedRef.current = false;
      refreshCloudMeta(null);
      setConflict(null);
      return undefined;
    }
    if (syncStartedRef.current) return undefined;
    syncStartedRef.current = true;

    let cancelled = false;
    (async () => {
      setCloudBusy(true);
      setCloudError(null);
      try {
        const record = await fetchCloudSave(base44);
        if (cancelled) return;
        refreshCloudMeta(record);
        const local = gameRef.current || loadGame();
        const cloudGame = record ? parseCloudState(record) : null;

        if (!record && local?.character) {
          const created = await upsertCloudSave(base44, local, null);
          if (cancelled) return;
          refreshCloudMeta(created);
          announce({ title: 'Synced to cloud', text: 'Your local chronicle is now on your account.' });
          return;
        }

        if (record && !local?.character && cloudGame) {
          applyGame(cloudGame, {
            title: 'Cloud restore',
            text: `${cloudGame.character?.name || 'Chronicle'} loaded from your account.`,
          });
          return;
        }

        if (record && local?.character && cloudGame) {
          const localTs = getLocalSavedAt(local);
          const cloudTs = getCloudSavedAt(record);
          if (Math.abs(localTs - cloudTs) <= 2000) return;
          if (cloudTs > localTs) {
            setConflict({
              reason: 'cloud_newer',
              local,
              cloud: cloudGame,
              cloudRecord: record,
              localAt: local.savedAt || new Date(localTs).toISOString(),
              cloudAt: record.saved_at,
            });
          } else if (localTs > cloudTs) {
            setConflict({
              reason: 'local_newer',
              local,
              cloud: cloudGame,
              cloudRecord: record,
              localAt: local.savedAt || new Date(localTs).toISOString(),
              cloudAt: record.saved_at,
            });
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Eldoria: cloud sync on login failed', error);
          setCloudError(error?.message || 'Cloud sync failed');
        }
      } finally {
        if (!cancelled) setCloudBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authChecked, isLoadingAuth, isAuthenticated, announce, applyGame, refreshCloudMeta]);

  useEffect(() => () => {
    if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current);
  }, []);

  const updateCharacter = useCallback((updater) => {
    const current = gameRef.current;
    if (!current) return;
    const character = typeof updater === 'function' ? updater(current.character) : { ...current.character, ...updater };
    commit({ ...current, character });
  }, [commit]);

  const acceptQuest = useCallback((questId, spokeWithGiver = false) => {
    const current = gameRef.current;
    if (!current) return;
    const next = startQuest(current, questId, spokeWithGiver);
    if (next === current) return;
    commit(next, { title: 'Quest Accepted', text: getQuest(questId)?.title });
  }, [commit]);

  const abandonQuest = useCallback((questId) => {
    const current = gameRef.current;
    if (!current) return;
    commit(failQuest(current, questId), { title: 'Quest Failed', text: getQuest(questId)?.title });
  }, [commit]);

  const talkTo = useCallback((npcId) => {
    const current = gameRef.current;
    if (!current) return;
    const { game: advanced } = advanceQuests(current, 'talk', npcId);
    const done = newlyCompleted(current, advanced);
    commit(checkAchievements(advanced), done.length ? { title: 'Quest Complete', text: done.map((id) => getQuest(id)?.title).join(' · ') } : null);
  }, [commit]);

  const explore = useCallback((locationId) => {
    const current = gameRef.current;
    if (!current) return;
    let next = markVisited(current, locationId);
    const { game: advanced } = advanceQuests(next, 'explore', locationId);
    next = advanced;
    const done = newlyCompleted(current, next);
    commit(next, done.length ? { title: 'Quest Complete', text: done.map((id) => getQuest(id)?.title).join(' · ') } : null);
  }, [commit]);

  const awardVictory = useCallback((payload) => {
    const current = gameRef.current;
    if (!current) return;
    const beforeLevel = current.character.level;
    const next = recordVictory(current, payload);
    const done = newlyCompleted(current, next);
    let extra = null;
    if (done.length) extra = { title: 'Quest Complete', text: done.map((id) => getQuest(id)?.title).join(' · ') };
    else if (next.character.level > beforeLevel) extra = { title: `Level ${next.character.level}`, text: 'Attributes raised. New abilities may be ready.' };
    commit(next, extra);
  }, [commit]);

  const sufferDefeat = useCallback(() => {
    const current = gameRef.current;
    if (!current) return;
    commit(recordDefeat(current), { title: 'Defeated', text: 'You wake at the Cathedral steps, lighter of purse.' });
  }, [commit]);

  const changeRelationship = useCallback((npcId, delta) => {
    const current = gameRef.current;
    if (!current) return;
    commit(addRelationship(current, npcId, delta));
  }, [commit]);

  const applyFlag = useCallback((flag) => {
    const current = gameRef.current;
    if (!current || !flag) return;
    commit(setFlag(current, flag));
  }, [commit]);

  const grantItem = useCallback((itemId, qty = 1) => {
    const current = gameRef.current;
    if (!current) return;
    commit(addItem(current, itemId, qty));
  }, [commit]);

  const dropItem = useCallback((itemId, qty = 1) => {
    const current = gameRef.current;
    if (!current) return;
    commit(removeItem(current, itemId, qty));
  }, [commit]);

  const equip = useCallback((itemId) => {
    const current = gameRef.current;
    if (!current) return;
    commit(equipItem(current, itemId));
  }, [commit]);

  const drink = useCallback((itemId) => {
    const current = gameRef.current;
    if (!current) return;
    commit(consumePotion(current, itemId));
  }, [commit]);

  const recordEvent = useCallback((event) => {
    const current = gameRef.current;
    if (!current) return;
    commit(pushEvent(current, event));
  }, [commit]);

  const setDifficulty = useCallback((difficulty) => {
    const current = gameRef.current;
    if (!current) return;
    commit({ ...current, settings: { ...(current.settings || {}), difficulty } });
  }, [commit]);

  const value = {
    game,
    character: game?.character || null,
    hasGame: !!game,
    notice,
    dismissNotice: () => setNotice(null),
    newGame,
    resetGame,
    updateCharacter,
    acceptQuest,
    abandonQuest,
    talkTo,
    explore,
    awardVictory,
    sufferDefeat,
    changeRelationship,
    applyFlag,
    grantItem,
    dropItem,
    equip,
    drink,
    recordEvent,
    setDifficulty,
    questsFor: (status) => (game ? listQuests(game, status) : []),
    completedCount: game ? completedCount(game) : 0,
    ending: game ? computeEnding(game) : null,
    cloudBusy,
    cloudMeta,
    cloudError,
    conflict,
    saveToCloud,
    loadFromCloud,
    resolveConflict,
    clearCloudError: () => setCloudError(null),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

export default GameProvider;
