import { ENEMIES } from '@/data/enemies';
import { getDerived } from './gameState';

let seq = 0;
const uid = () => `c${Date.now().toString(36)}${seq++}`;

const pushLog = (state, text, kind = 'info') => {
  state.log.push({ id: uid(), text, kind });
  if (state.log.length > 80) state.log.shift();
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export const DIFFICULTY = {
  casual: { label: 'Story', enemyMultiplier: 0.7, note: 'Enemies hit for 30% less.' },
  normal: { label: 'Balanced', enemyMultiplier: 1, note: 'The intended experience.' },
  brutal: { label: 'Brutal', enemyMultiplier: 1.35, note: 'Enemies hit for 35% more.' },
};

export function startCombat(character, encounter, difficulty = 'normal') {
  const derived = getDerived(character);
  const enemies = encounter.enemies.map((enemyId) => {
    const base = ENEMIES[enemyId];
    return {
      uid: uid(),
      id: enemyId,
      name: base.name,
      hp: base.hp,
      maxHp: base.hp,
      attack: base.attack,
      armor: base.armor,
      statuses: [],
      sigil: base.sigil,
      color: base.color,
      description: base.description,
      onHit: base.onHit || null,
    };
  });
  const rewards = {
    xp: encounter.enemies.reduce((total, id) => total + (ENEMIES[id].xp || 0), 0),
    gold: encounter.enemies.reduce((total, id) => total + (ENEMIES[id].gold || 0), 0),
    items: encounter.enemies.flatMap((id) => ENEMIES[id].loot || []),
  };
  return {
    encounterId: encounter.id,
    encounterName: encounter.name,
    description: encounter.description,
    difficulty,
    enemies,
    playerHp: Math.min(character.hp, derived.maxHp),
    playerMaxHp: derived.maxHp,
    playerShield: 0,
    playerResource: derived.maxResource,
    playerMaxResource: derived.maxResource,
    playerStatuses: [],
    buffs: [],
    cooldowns: {},
    turn: 1,
    phase: 'player',
    racialUsed: false,
    rewards,
    log: [{ id: uid(), text: encounter.description, kind: 'info' }],
  };
}

function critMultiplier(derived) {
  return Math.random() < derived.crit ? 1.6 : 1;
}

function damageToEnemy(state, enemy, amount, label) {
  const dealt = Math.max(1, Math.round(amount));
  enemy.hp = Math.max(0, enemy.hp - dealt);
  pushLog(state, `${enemy.name} takes ${dealt} ${label}.`, 'damage');
  if (enemy.hp === 0) pushLog(state, `${enemy.name} falls.`, 'fall');
}

function applyStatus(target, status) {
  if (!status) return;
  const existing = target.statuses.find((s) => s.type === status.type);
  if (existing) {
    existing.duration = Math.max(existing.duration, status.duration);
    existing.value = Math.max(existing.value || 0, status.value || 0);
  } else {
    target.statuses.push({ ...status });
  }
}

function damagePlayer(state, amount) {
  let remaining = Math.max(0, Math.round(amount));
  if (state.playerShield > 0) {
    const absorbed = Math.min(state.playerShield, remaining);
    state.playerShield -= absorbed;
    remaining -= absorbed;
    if (absorbed > 0) pushLog(state, `Your ward absorbs ${absorbed} damage.`, 'buff');
  }
  if (remaining > 0) {
    state.playerHp = Math.max(0, state.playerHp - remaining);
    pushLog(state, `You take ${remaining} damage.`, 'hurt');
  }
}

function dotTick(state, target, isPlayer) {
  target.statuses.forEach((status) => {
    if (!['burn', 'poison', 'bleed'].includes(status.type)) return;
    const maxHp = isPlayer ? state.playerMaxHp : target.maxHp;
    const dmg = Math.max(1, Math.round(maxHp * (status.value || 0.05)));
    if (isPlayer) {
      state.playerHp = Math.max(0, state.playerHp - dmg);
      pushLog(state, `You suffer ${dmg} ${status.type} damage.`, 'hurt');
    } else {
      target.hp = Math.max(0, target.hp - dmg);
      pushLog(state, `${target.name} suffers ${dmg} ${status.type} damage.`, 'damage');
    }
  });
}

function expireStatuses(target) {
  target.statuses.forEach((s) => { s.duration -= 1; });
  target.statuses = target.statuses.filter((s) => s.duration > 0);
}

function enemyPhase(state, character) {
  const derived = getDerived(character);
  const diff = DIFFICULTY[state.difficulty] || DIFFICULTY.normal;
  const evasion = state.buffs.filter((b) => b.stat === 'evasion').reduce((t, b) => t + b.amount, 0);

  state.enemies.filter((e) => e.hp > 0).forEach((enemy) => {
    const stunned = enemy.statuses.some((s) => s.type === 'stun');
    const blinded = enemy.statuses.some((s) => s.type === 'blind');
    if (stunned) {
      pushLog(state, `${enemy.name} is stunned and cannot act.`, 'info');
      return;
    }
    if (blinded && Math.random() < 0.55) {
      pushLog(state, `${enemy.name} strikes at smoke and misses.`, 'info');
      return;
    }
    if (evasion > 0 && Math.random() < evasion) {
      pushLog(state, `You slip aside — ${enemy.name} misses.`, 'info');
      return;
    }
    const raw = enemy.attack * (0.9 + Math.random() * 0.2) * diff.enemyMultiplier;
    const mitigated = raw - derived.defense * 0.35;
    pushLog(state, `${enemy.name} attacks.`, 'enemy');
    damagePlayer(state, Math.max(1, mitigated));
    if (enemy.onHit && Math.random() < (enemy.onHit.chance || 0.25)) {
      applyStatus({ statuses: state.playerStatuses }, enemy.onHit);
      pushLog(state, `You are afflicted with ${enemy.onHit.type}.`, 'hurt');
    }
  });

  dotTick(state, { statuses: state.playerStatuses, maxHp: state.playerMaxHp }, true);
  expireStatuses({ get statuses() { return state.playerStatuses; }, set statuses(v) { state.playerStatuses = v; } });

  state.enemies.filter((e) => e.hp > 0).forEach((enemy) => {
    dotTick(state, enemy, false);
    expireStatuses(enemy);
  });

  state.buffs = state.buffs
    .map((b) => ({ ...b, duration: b.duration - 1 }))
    .filter((b) => b.duration > 0);

  Object.keys(state.cooldowns).forEach((key) => {
    if (state.cooldowns[key] > 0) state.cooldowns[key] -= 1;
  });

  state.playerResource = Math.min(state.playerMaxResource, state.playerResource + derived.resourceRegen);
  state.turn += 1;

  if (state.enemies.every((e) => e.hp <= 0)) {
    state.phase = 'victory';
    pushLog(state, 'The last of them falls. The field is yours.', 'victory');
  } else if (state.playerHp <= 0) {
    state.phase = 'defeat';
    pushLog(state, 'Your knees give. The world narrows to a point of light, and goes out.', 'defeat');
  }
  return state;
}

/**
 * Resolve a player action. `ability` is either a class ability or a racial ability.
 */
export function resolveAbility(prev, character, ability, targetIndex = 0, options = {}) {
  if (prev.phase !== 'player' || !ability) return prev;

  const racial = !!options.racial;
  if (racial) {
    if (prev.racialUsed) return prev;
  } else {
    if ((prev.cooldowns[ability.id] || 0) > 0) return prev;
    if (prev.playerResource < (ability.cost || 0)) return prev;
  }

  const state = clone(prev);
  const derived = getDerived(character);
  const attackBuff = state.buffs.filter((b) => b.stat === 'attack').reduce((t, b) => t + b.amount, 0);
  const attack = derived.attack * (1 + attackBuff);

  if (racial) {
    state.racialUsed = true;
  } else {
    state.playerResource = Math.max(0, state.playerResource - (ability.cost || 0));
    if (ability.cooldown) state.cooldowns[ability.id] = ability.cooldown;
  }

  pushLog(state, `You invoke ${ability.name}.`, 'player');

  const living = state.enemies.filter((e) => e.hp > 0);
  const primaryTarget = state.enemies[targetIndex]?.hp > 0 ? state.enemies[targetIndex] : living[0];
  const targets = ability.target === 'all' ? living : primaryTarget ? [primaryTarget] : [];

  let drained = 0;

  targets.forEach((enemy) => {
    if (ability.kind === 'damage') {
      const crit = critMultiplier(derived);
      const armor = ability.pierce ? 0 : enemy.armor * 0.5;
      const vulnerable = enemy.statuses.some((s) => s.type === 'vulnerable') ? 1.25 : 1;
      const raw = attack * (ability.power || 1) * (0.9 + Math.random() * 0.2) * crit * vulnerable - armor;
      const dealt = Math.max(1, Math.round(raw));
      enemy.hp = Math.max(0, enemy.hp - dealt);
      pushLog(state, `${enemy.name} takes ${dealt} damage${crit > 1 ? ' — a critical strike!' : '.'}`, crit > 1 ? 'crit' : 'damage');
      if (ability.status) applyStatus(enemy, ability.status);
      if (ability.drain) drained += Math.round(dealt * ability.drain);
      if (enemy.hp === 0) pushLog(state, `${enemy.name} falls.`, 'fall');
    }
  });

  if (ability.kind === 'heal') {
    const heal = Math.round(state.playerMaxHp * (ability.power || 0.3));
    state.playerHp = Math.min(state.playerMaxHp, state.playerHp + heal);
    pushLog(state, `You recover ${heal} health.`, 'heal');
    if (ability.cleanse) {
      state.playerStatuses = [];
      pushLog(state, 'Afflictions burn away.', 'heal');
    }
  }

  if (ability.kind === 'shield') {
    const shield = Math.round(state.playerMaxHp * (ability.power || 0.3));
    state.playerShield += shield;
    pushLog(state, `A ward settles over you, absorbing ${shield} damage.`, 'buff');
  }

  if (ability.kind === 'buff' && ability.buff) {
    state.buffs.push({
      stat: ability.buff.stat,
      amount: ability.buff.amount,
      duration: ability.buff.duration,
      label: ability.name,
    });
    pushLog(state, `${ability.name} takes hold.`, 'buff');
  }

  if (ability.kind === 'debuff' && ability.status) {
    targets.forEach((enemy) => {
      applyStatus(enemy, ability.status);
      pushLog(state, `${enemy.name} is ${ability.status.type === 'stun' ? 'stunned' : ability.status.type === 'blind' ? 'blinded' : ability.status.type === 'vulnerable' ? 'made vulnerable' : 'afflicted'}.`, 'buff');
    });
  }

  if (ability.shield) {
    const shield = Math.round(state.playerMaxHp * ability.shield);
    state.playerShield += shield;
    pushLog(state, `A ward settles over you, absorbing ${shield} damage.`, 'buff');
  }

  if (drained > 0) {
    state.playerHp = Math.min(state.playerMaxHp, state.playerHp + drained);
    pushLog(state, `You draw ${drained} vitality from the wound.`, 'heal');
  }

  if (state.enemies.every((e) => e.hp <= 0)) {
    state.phase = 'victory';
    pushLog(state, 'The last of them falls. The field is yours.', 'victory');
    return state;
  }

  return enemyPhase(state, character);
}

export function fleeCombat(prev) {
  if (prev.phase !== 'player') return prev;
  const state = clone(prev);
  state.phase = 'fled';
  pushLog(state, 'You break away and take the road back.', 'info');
  return state;
}

export function abilityReady(state, ability, racial = false) {
  if (!state || state.phase !== 'player') return false;
  if (racial) return !state.racialUsed;
  if ((state.cooldowns[ability.id] || 0) > 0) return false;
  return state.playerResource >= (ability.cost || 0);
}