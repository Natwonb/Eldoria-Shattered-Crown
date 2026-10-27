export const RARITY = {
  common: { label: 'Common', color: '#9a9282' },
  uncommon: { label: 'Uncommon', color: '#7f9d6d' },
  rare: { label: 'Rare', color: '#7492b8' },
  epic: { label: 'Epic', color: '#9b76b8' },
  legendary: { label: 'Legendary', color: '#c9a94f' },
};

// icon keys map to lucide icons in components/ItemGlyph.jsx
export const ITEMS = {
  sword_rusted: { id: 'sword_rusted', name: 'Rusted Longsword', category: 'weapon', slot: 'weapon', attack: 4, rarity: 'common', value: 15, icon: 'sword', description: 'Pitted, notched, and honest. It has one more good fight in it and so do you.' },
  staff_apprentice: { id: 'staff_apprentice', name: 'Apprentice Staff', category: 'weapon', slot: 'weapon', attack: 4, rarity: 'common', value: 15, icon: 'staff', description: 'Ash wood bound in copper. The tip still remembers a small fire.' },
  daggers_pair: { id: 'daggers_pair', name: 'Pair of Daggers', category: 'weapon', slot: 'weapon', attack: 3, rarity: 'common', value: 18, icon: 'dagger', description: 'Matched, balanced, and cheap enough to abandon.' },
  mace_dawn: { id: 'mace_dawn', name: 'Mace of Dawn', category: 'weapon', slot: 'weapon', attack: 4, rarity: 'common', value: 20, icon: 'mace', description: 'A flanged head on a haft of pale wood. Blessing optional, effective regardless.' },
  bow_yew: { id: 'bow_yew', name: 'Yew Shortbow', category: 'weapon', slot: 'weapon', attack: 5, rarity: 'common', value: 16, icon: 'bow', description: 'Strung with sinew and patience.' },
  blade_oath: { id: 'blade_oath', name: 'Oathkeeper Blade', category: 'weapon', slot: 'weapon', attack: 5, rarity: 'uncommon', value: 40, icon: 'sword', description: 'The fuller is engraved with an oath worn nearly smooth by a thumb.' },
  rod_ashen: { id: 'rod_ashen', name: 'Ashen Rod', category: 'weapon', slot: 'weapon', attack: 4, rarity: 'common', value: 18, icon: 'staff', description: 'Blackened bone that hums when you are being watched.' },

  leather_vest: { id: 'leather_vest', name: 'Boiled Leather Vest', category: 'armor', slot: 'armor', defense: 2, rarity: 'common', value: 14, icon: 'armor', description: 'Stiff, cracked, better than a shirt.' },
  chain_shirt: { id: 'chain_shirt', name: 'Riveted Chain Shirt', category: 'armor', slot: 'armor', defense: 4, hp: 10, rarity: 'uncommon', value: 45, icon: 'armor', description: 'Heavy enough to be a decision.' },
  robe_apprentice: { id: 'robe_apprentice', name: 'Apprentice Robes', category: 'armor', slot: 'armor', defense: 1, resource: 5, rarity: 'common', value: 16, icon: 'robe', description: 'Ink-stained at the cuffs. The stains are load-bearing.' },
  vestments_dawn: { id: 'vestments_dawn', name: 'Vestments of Dawn', category: 'armor', slot: 'armor', defense: 2, resource: 4, rarity: 'uncommon', value: 34, icon: 'robe', description: 'Ivory linen with a sun disc stitched in gold thread.' },

  mail_of_the_guard: { id: 'mail_of_the_guard', name: 'Radiant Guard Mail', category: 'armor', slot: 'armor', defense: 6, hp: 20, rarity: 'rare', value: 120, icon: 'armor', description: 'Issued to the Guard, and never returned. Until now.' },
  shadow_cloak: { id: 'shadow_cloak', name: 'Cloak of Quiet Steps', category: 'armor', slot: 'armor', defense: 3, resource: 8, rarity: 'rare', value: 110, icon: 'robe', description: 'The hem never quite touches the floor.' },
  thorn_mantle: { id: 'thorn_mantle', name: 'Thornbound Mantle', category: 'armor', slot: 'armor', defense: 5, hp: 15, rarity: 'rare', value: 110, icon: 'robe', description: 'Woven living briar that tightens when something approaches.' },

  amulet_dawn: { id: 'amulet_dawn', name: 'Amulet of the Dawn', category: 'trinket', slot: 'trinket', hp: 25, rarity: 'rare', value: 90, icon: 'amulet', description: 'A shard of the Cathedral rose window, warm at dawn.' },
  ring_ember: { id: 'ring_ember', name: 'Ember Signet', category: 'trinket', slot: 'trinket', attack: 4, rarity: 'rare', value: 95, icon: 'ring', description: 'Set with a coal that has not gone out in a hundred years.' },
  sigil_tide: { id: 'sigil_tide', name: 'Tidecaller Sigil', category: 'trinket', slot: 'trinket', resource: 12, rarity: 'rare', value: 95, icon: 'amulet', description: 'Salt-etched bronze. You can hear the harbour in it.' },

  potion_minor: { id: 'potion_minor', name: 'Salve of Mending', category: 'potion', rarity: 'common', value: 12, icon: 'potion', heal: 0.35, description: 'Bitter, thick, and worth it. Restores 35% of your health.' },
  potion_greater: { id: 'potion_greater', name: 'Greater Elixir', category: 'potion', rarity: 'uncommon', value: 40, icon: 'potion', heal: 0.7, description: 'Restores 70% of your health.' },
  elixir_focus: { id: 'elixir_focus', name: 'Elixir of Resolve', category: 'potion', rarity: 'rare', value: 55, icon: 'potion', heal: 1.0, description: 'Restores all of your health.' },

  ash_shard: { id: 'ash_shard', name: 'Shard of Ashen Glass', category: 'quest', rarity: 'rare', value: 60, icon: 'gem', description: 'A finger of grey glass. One of the Crown\'s scattered pieces.' },
  tide_pearl: { id: 'tide_pearl', name: 'Stormwater Pearl', category: 'quest', rarity: 'rare', value: 60, icon: 'gem', description: 'Cold, heavy, and faintly listening.' },
  thorn_essence: { id: 'thorn_essence', name: 'Thorn Essence', category: 'quest', rarity: 'rare', value: 60, icon: 'gem', description: 'A bead of green light from the Rootbound Court.' },
  crown_fragment: { id: 'crown_fragment', name: 'Crown Fragment', category: 'quest', rarity: 'legendary', value: 250, icon: 'crown', description: 'A curved sliver of gold, still warm from a fire that ended a century ago.' },
  scroll_ward: { id: 'scroll_ward', name: 'Warding Scroll', category: 'quest', rarity: 'uncommon', value: 25, icon: 'scroll', description: 'A single-use ward against things that arrive uninvited.' },
  ledger_guild: { id: 'ledger_guild', name: 'Guild Ledger Page', category: 'quest', rarity: 'uncommon', value: 30, icon: 'scroll', description: 'Three names, one of them crossed out twice.' },
};

export const ITEM_LIST = Object.values(ITEMS);
export const getItem = (id) => ITEMS[id];
export const CONSUMABLES = ITEM_LIST.filter((i) => i.category === 'potion');