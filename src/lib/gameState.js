import { getRace } from '@/data/races';
import { getClass } from '@/data/classes';
import { getItem } from '@/data/items';

export const ATTRS = ['might', 'agility', 'arcana', 'spirit', 'vitality'];

export const ATTR_LABELS = {
  might: 'Might',
  agility: 'Agility',
  arcana: 'Arcana',
  spirit: 'Spirit',
  vitality: 'Vitality',
};

export const ATTR_DESCRIPTIONS = {
  might: 'Raw force. Drives Warrior damage and heavy weapons.',
  agility: 'Speed and precision. Governs critical strikes and defense.',
  arcana: 'Command of the unseen. Fuels Mage and Warlock power.',
  spirit: 'Conviction. The well Clerics and Paladins draw from.',
  vitality: 'Endurance. Every point widens your health.',
};

export const APPEARANCE_OPTIONS = {
  build: ['Lean', 'Wiry', 'Broad', 'Towering', 'Slight'],
  hair: ['Raven', 'Ash-blond', 'Copper', 'Silver', 'Shorn', 'Braided dark'],
  eyes: ['Grey', 'Amber', 'Storm blue', 'Green', 'Pale gold', 'Coal-black'],
  mark: ['None', 'A scar across the brow', 'Ritual ink on the forearm', 'A burn that never healed', 'Frost-scarred knuckles'],
};

export function xpToNext(level) {
  return 90 + (level - 1) * 70;
}

export function createCharacter({ name, raceId, classId, appearance, biography }) {
  const race = getRace(raceId);
  const cls = getClass(classId);
  const attributes = { ...cls.base };
  Object.entries(race.bonuses || {}).forEach(([key, value]) => {
    attributes[key] = (attributes[key] || 0) + value;
  });

  const character = {
    name: name?.trim() || 'Nameless Wanderer',
    raceId: race.id,
    classId: cls.id,
    appearance: appearance || {},
    biography: biography || '',
    level: 1,
    xp: 0,
    attributes,
    hp: 1,
    gold: 35,
    equipment: { weapon: cls.startingWeapon, armor: cls.startingArmor, trinket: null },
    inventory: [
      { id: cls.startingWeapon, qty: 1 },
      { id: cls.startingArmor, qty: 1 },
      { id: 'potion_minor', qty: 3 },
    ],
    createdAt: new Date().toISOString(),
  };
  character.hp = getDerived(character).maxHp;
  return character;
}

export function getDerived(character) {
  const cls = getClass(character.classId);
  const race = getRace(character.raceId);
  const a = character.attributes || {};
  const mods = race.mods || {};
  const equipped = character.equipment || {};
  const weapon = equipped.weapon ? getItem(equipped.weapon) : null;
  const armor = equipped.armor ? getItem(equipped.armor) : null;
  const trinket = equipped.trinket ? getItem(equipped.trinket) : null;
  const level = character.level || 1;

  const primary = a[cls.primary] || 4;

  const maxHp = Math.round(
    45 + (a.vitality || 0) * 7 + level * 6 + (cls.hpBonus || 0) +
    (armor?.hp || 0) + (trinket?.hp || 0) + (mods.hp || 0)
  );
  const maxResource = Math.round(
    24 + primary * 4 + level * 2 + (armor?.resource || 0) + (trinket?.resource || 0) + (mods.resource || 0)
  );
  const attack = Math.round(
    9 + primary * 1.7 + level * 2 + (weapon?.attack || 0) + (trinket?.attack || 0) + (mods.attack || 0)
  );
  const defense = Math.round(
    2 + (a.agility || 0) * 0.6 + (a.vitality || 0) * 0.4 +
    (armor?.defense || 0) + (trinket?.defense || 0) + (mods.defense || 0)
  );

  return {
    maxHp,
    maxResource,
    attack,
    defense,
    crit: Math.min(0.6, 0.05 + (a.agility || 0) * 0.005 + (mods.crit || 0)),
    resourceName: cls.resource.name,
    resourceRegen: cls.resource.regen,
    resourceColor: cls.resource.color,
    class: cls,
    race,
    xpMultiplier: 1 + (mods.xp || 0),
  };
}

export function knownAbilities(character) {
  const cls = getClass(character.classId);
  return cls.abilities.filter((ab) => ab.level <= (character.level || 1));
}

export function lockedAbilities(character) {
  const cls = getClass(character.classId);
  return cls.abilities.filter((ab) => ab.level > (character.level || 1));
}

export function applyXp(character, amount) {
  const race = getRace(character.raceId);
  const gained = Math.round(amount * (1 + (race.mods?.xp || 0)));
  const next = {
    ...character,
    attributes: { ...character.attributes },
    xp: character.xp + gained,
  };
  let levels = 0;
  while (next.xp >= xpToNext(next.level)) {
    next.xp -= xpToNext(next.level);
    next.level += 1;
    levels += 1;
    const cls = getClass(next.classId);
    next.attributes[cls.primary] = (next.attributes[cls.primary] || 0) + 1;
    next.attributes[cls.secondary] = (next.attributes[cls.secondary] || 0) + 1;
    next.attributes.vitality = (next.attributes.vitality || 0) + 1;
  }
  const derived = getDerived(next);
  next.hp = Math.min(derived.maxHp, (character.hp || 0) + levels * 12);
  return { character: next, levels, gained };
}

export function xpPercent(character) {
  return Math.min(100, Math.round(((character.xp || 0) / xpToNext(character.level || 1)) * 100));
}