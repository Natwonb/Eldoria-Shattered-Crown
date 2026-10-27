import { ART } from './art';

// Aurelion and Thornveil are fully explorable. Stormhaven is visible on the
 // world map and its people and quests exist in the record, but its streets are
 // sealed until the next chapter.
 // Towns/cities are SAFE hubs (NPCs, shops, quests). Wilds and Dungeons hold
 // hostile encounters. Travel between them via each location's `travel` links.

export const CITIES = [
  {
    id: 'aurelion',
    name: 'Aurelion',
    subtitle: 'The Gilded Capital',
    playable: true,
    art: ART.aurelion,
    color: '#c9a94f',
    x: 48,
    y: 56,
    population: 'Forty thousand souls, and half of them keeping a secret',
    faction: { id: 'dawn', name: 'The Dawn Covenant', motto: 'Light is a debt we repay daily.' },
    description:
      'White marble and gold leaf, built on the bones of the old empire. The Cathedral bell has rung at Midnight for nine nights without a hand to pull it, and nobody in the palace will say the word "Crown" out loud.',
    locations: [
      'cathedral', 'market', 'spire', 'barracks',
      'ashen_crypt', 'cutpurse_alley', 'rift_landing', 'western_road', 'gate',
    ],
  },
  {
    id: 'thornveil',
    name: 'Thornveil',
    subtitle: 'The Rootbound Court',
    playable: true,
    art: null,
    sigil: 'root',
    color: '#6f8a5c',
    x: 22,
    y: 34,
    population: 'The forest decides how many',
    faction: { id: 'root', name: 'The Rootbound Court', motto: 'What is cut grows back angrier.' },
    description:
      'A wood that has been at war with an idea. The old roads into Thornveil are closed by order of the Warden, and the trees have begun to eat the signs.',
    locations: [
      'heartwood', 'waystone', 'forge', 'hollow',
      'grove', 'closed_road', 'hollow_watch',
    ],
  },
  {
    id: 'stormhaven',
    name: 'Stormhaven',
    subtitle: 'The Drowned Harbor',
    playable: false,
    art: null,
    color: '#5b7b8c',
    x: 74,
    y: 68,
    population: 'Whoever the tide left',
    faction: { id: 'tide', name: 'The Tide Compact', motto: 'Every debt comes back with the water.' },
    description:
      'Cliffside taverns, black-sailed ships and a lighthouse that lights for no one. The Ash Prophet has been seen walking the breakwater, which means something is about to be paid for.',
    locations: [],
  },
];

export const LOCATIONS = {
  // ——— AURELION TOWNS (safe hubs) ———
  cathedral: {
    id: 'cathedral',
    cityId: 'aurelion',
    type: 'Town',
    name: 'Cathedral of Dawn',
    short: 'The Dawn',
    art: ART.cathedral,
    x: 28,
    y: 30,
    description:
      'Incense, gold leaf and the sound of a bell that should be silent. Sisters of the Dawn move between the pews without quite meeting your eyes. No steel is drawn here.',
    detail:
      'Nine nights ago the Ashen Bell began to toll at midnight. The crypt beneath the nave has been sealed since the Crown shattered, and the seal is now warm to the touch. The High Priestess keeps vigil upstairs; whatever answers the bell waits below.',
    npcs: ['seraphine'],
    encounters: [],
    travel: [
      { to: 'ashen_crypt', label: 'Descend to the Ashen Crypt' },
      { to: 'market', label: 'Walk to the Market of Coins' },
      { to: 'spire', label: 'Climb toward the Arcane Spire' },
    ],
    search: {
      label: 'Search the candle niches',
      item: 'ash_shard',
      text: 'Behind a row of votive candles you find a finger of grey glass, warm as a living thing. Ash-glass — the leftovers of something that burned too brightly.',
    },
  },
  market: {
    id: 'market',
    cityId: 'aurelion',
    type: 'Town',
    name: 'Market of Coins',
    short: 'The Market',
    art: ART.market,
    x: 62,
    y: 44,
    description:
      'Spice, tallow and rumour. Every stall sells something and every third stall sells something else under the counter. The Guild keeps the square itself honest — the alley behind it does not.',
    detail:
      'The Guild of the Coin keeps the market honest by keeping a very precise record of who is not. Two nights ago, three of those records went missing. Mira Goldleaf holds court among the stalls; cutpurses hunt the shadowed lane behind the tanner.',
    npcs: ['mira'],
    encounters: [],
    travel: [
      { to: 'cutpurse_alley', label: 'Slip into Cutpurse Alley' },
      { to: 'cathedral', label: 'Return to the Cathedral' },
      { to: 'barracks', label: 'Cross to the Radiant Barracks' },
      { to: 'gate', label: 'Take the harbour road to the Drowned Gate' },
    ],
    search: {
      label: "Search the tanner's refuse",
      item: 'potion_minor',
      text: 'A stoppered vial rolls out of a discarded crate — someone dropped their evening courage and never came back for it.',
    },
  },
  spire: {
    id: 'spire',
    cityId: 'aurelion',
    type: 'Town',
    name: 'The Arcane Spire',
    short: 'The Spire',
    art: ART.spire,
    x: 44,
    y: 20,
    description:
      'Six hundred steps of dark stone, and at the top a room where the ceiling is a chart of a sky that never was. Scholars argue in whispers. Steel stays sheathed until the fourth landing.',
    detail:
      'A rift has opened on the fourth landing. It is not large. It is, as the Archmage says, extremely loud. Elowen receives visitors in her study; the tear itself waits one flight down.',
    npcs: ['elowen'],
    encounters: [],
    travel: [
      { to: 'rift_landing', label: 'Descend to the Rift Landing' },
      { to: 'cathedral', label: 'Return toward the Cathedral' },
      { to: 'barracks', label: 'Cut across to the Barracks' },
    ],
    search: {
      label: 'Read the loose grimoire page',
      item: 'scroll_ward',
      text: 'A torn page clings to the stairwell, still humming: a ward against things that arrive uninvited.',
    },
  },
  barracks: {
    id: 'barracks',
    cityId: 'aurelion',
    type: 'Town',
    name: 'Radiant Barracks',
    short: 'The Barracks',
    art: ART.barracks,
    x: 76,
    y: 26,
    description:
      'Drill yards, weapon racks, and ivory banners that have not been replaced since the Crown fell. Inside the walls you are among soldiers, not monsters.',
    detail:
      'Half the Radiant Guard is deployed to the western road and the other half is not being discussed. Commander Thorne keeps his office here. The thing that woke in the abandoned parade ground waits outside the walls.',
    npcs: ['aldric'],
    encounters: [],
    travel: [
      { to: 'western_road', label: 'March out to the Western Road' },
      { to: 'market', label: 'Return to the Market' },
      { to: 'gate', label: 'Ride for the Drowned Gate' },
    ],
    search: {
      label: "Check the quartermaster's crate",
      item: 'potion_minor',
      text: 'A field dressing kit, still sealed. You take it, and leave a coin where the quartermaster will pretend not to find it.',
    },
  },

  // ——— AURELION WILDS / DUNGEONS ———
  ashen_crypt: {
    id: 'ashen_crypt',
    cityId: 'aurelion',
    type: 'Dungeon',
    name: 'The Ashen Crypt',
    short: 'The Crypt',
    art: ART.cathedral,
    sigil: 'skull',
    x: 22,
    y: 42,
    description:
      'Cold stone, warm seals, and a rope that moves without a hand. The sisters will not come down here. Neither will Seraphine — the seal refuses her.',
    detail:
      'Wisps of grey vapour drift between the tombs. The Ashen Bell hangs in the dark and remembers being whole. This is no place for trade or prayer — only steel and silence.',
    npcs: [],
    encounters: ['enc_crypt'],
    travel: [
      { to: 'cathedral', label: 'Climb back to the Cathedral' },
    ],
    search: {
      label: 'Pry open a cracked reliquary',
      item: 'ash_shard',
      text: 'Ash flakes away from a finger of grey glass. It pulses once in your palm, then goes still.',
    },
  },
  cutpurse_alley: {
    id: 'cutpurse_alley',
    cityId: 'aurelion',
    type: 'Wilds',
    name: 'Cutpurse Alley',
    short: 'The Alley',
    art: ART.market,
    sigil: 'dagger',
    x: 70,
    y: 52,
    description:
      'A lane behind the Guild stalls where the lanterns end early. Three shapes peel away from the wall when they hear coin.',
    detail:
      'Two of the cutpurses answer to Mira. The third does not. The alley is not the Market — leave the Guild square if you want a fight.',
    npcs: [],
    encounters: ['enc_alley'],
    travel: [
      { to: 'market', label: 'Return to the Market square' },
      { to: 'gate', label: 'Cut toward the harbour gate' },
    ],
  },
  rift_landing: {
    id: 'rift_landing',
    cityId: 'aurelion',
    type: 'Dungeon',
    name: 'The Spire Rift',
    short: 'The Rift',
    art: ART.spire,
    sigil: 'eye',
    x: 38,
    y: 14,
    description:
      'The fourth landing of the Spire, where the air tears and exhales ash. Cultists step through as if invited.',
    detail:
      'Elowen closed this twice. It opened three times. Correspondence, she calls it. Down here there are no scholars — only ash with opinions.',
    npcs: [],
    encounters: ['enc_rift'],
    travel: [
      { to: 'spire', label: 'Climb back to the Archmage\'s study' },
    ],
  },
  western_road: {
    id: 'western_road',
    cityId: 'aurelion',
    type: 'Wilds',
    name: 'The Western Road',
    short: 'West Road',
    art: ART.barracks,
    sigil: 'shield',
    x: 88,
    y: 34,
    description:
      'The abandoned parade ground and the first mile of the western road. An old construct decided the drill never ended.',
    detail:
      'Aldric will not send a squad he does not have. The sentinel walks the empty yard beyond the barracks wall. Beyond that, the road goes quiet in a particular way.',
    npcs: [],
    encounters: ['enc_yard'],
    travel: [
      { to: 'barracks', label: 'Return to the Radiant Barracks' },
      { to: 'gate', label: 'Follow the road toward the Gate' },
    ],
  },
  gate: {
    id: 'gate',
    cityId: 'aurelion',
    type: 'Wilds',
    name: 'The Drowned Gate',
    short: 'The Gate',
    art: ART.gate,
    x: 84,
    y: 62,
    description:
      'The old harbour gate, half sunk, its portcullis rusted into a permanent shrug. Fog comes in from the water and does not leave. No stalls. No sisters. Only the road and the tide.',
    detail:
      'Refugees from the coast have been camped outside for a week. Last night something came up out of the water and took two of them. When the Crown shard surfaces, the Herald waits here.',
    npcs: [],
    encounters: ['enc_gate', 'enc_crown'],
    travel: [
      { to: 'market', label: 'Retreat to the Market of Coins' },
      { to: 'barracks', label: 'Ride for the Barracks' },
      { to: 'cutpurse_alley', label: 'Cut through the alley' },
    ],
    search: {
      label: 'Search the flooded watchroom',
      item: 'tide_pearl',
      text: 'Wedged in a rotted desk drawer: a pearl the colour of storm water. It is colder than the room, and it is listening.',
    },
  },

  // ——— THORNVEIL TOWNS ———
  heartwood: {
    id: 'heartwood',
    cityId: 'thornveil',
    type: 'Town',
    name: 'The Heartwood Court',
    short: 'Heartwood',
    art: null,
    sigil: 'leaf',
    x: 34,
    y: 40,
    description:
      'A circle of trees grown into a hall, each trunk carved with a name that is not quite a name. Nobody raises their voice here, and nobody has to. Steel stays outside the circle.',
    detail:
      'Elder Sylvara receives standing, because sitting would mean choosing which root is hers. The Court has not declared for or against the Crown in a century.',
    npcs: ['sylvara'],
    encounters: [],
    travel: [
      { to: 'waystone', label: 'Walk to the Waystone Gate' },
      { to: 'forge', label: 'Take the hill path to the Forge' },
      { to: 'grove', label: 'Enter the Blighted Grove (dangerous)' },
    ],
    search: {
      label: 'Search the offering hollow',
      item: 'potion_greater',
      text: 'A carved bowl under the roots holds a stoppered green draught and three teeth. The teeth are not the offering.',
    },
  },
  waystone: {
    id: 'waystone',
    cityId: 'thornveil',
    type: 'Town',
    name: 'The Waystone Gate',
    short: 'Waystone',
    art: null,
    sigil: 'compass',
    x: 58,
    y: 26,
    description:
      'Where the old imperial road ends and the trees begin to lean over it. The Warden keeps no hall — only this gate, a fire, and a great deal of patience. Safe ground, for as long as Kaelen says so.',
    detail:
      'The road beyond was closed by Kaelen\'s own order. Something has been coming up that road at night. Speak with the Warden here; fight whatever walks the closed road beyond the ropes.',
    npcs: ['kaelen'],
    encounters: [],
    travel: [
      { to: 'closed_road', label: 'Step past the ropes onto the Closed Road' },
      { to: 'heartwood', label: 'Return to Heartwood Court' },
      { to: 'hollow', label: 'Take the side path to the Hollow' },
    ],
    search: {
      label: 'Search the abandoned wagon',
      item: 'potion_minor',
      text: 'A merchant\'s wagon sits where the trees ate its wheels. Inside, a salve still sealed against the damp.',
    },
  },
  forge: {
    id: 'forge',
    cityId: 'thornveil',
    type: 'Town',
    name: 'The Deep Roads Forge',
    short: 'The Forge',
    art: null,
    sigil: 'mace',
    x: 74,
    y: 48,
    description:
      'A dwarven doorway in the flank of a hill, opened because Bran could no longer work underground. The light inside is orange and the language inside is mostly swearing. Safe, if loud.',
    detail:
      'Bran Ironhide was the last smith to touch the Crown. He holds that it spoke his name before it broke, and he has made nothing but horseshoes, hinges and one very good shovel since.',
    npcs: ['bran'],
    encounters: [],
    travel: [
      { to: 'heartwood', label: 'Return to Heartwood' },
      { to: 'grove', label: 'Cut toward the Blighted Grove' },
      { to: 'waystone', label: 'Follow the ridge to Waystone' },
    ],
    search: {
      label: 'Search the scrap heap',
      item: 'ring_ember',
      text: 'Under a heap of failed hinges lies an old signet, its coal still banked and warm. Bran does not look up. "That one has been waiting for somebody. Take it."',
    },
  },
  hollow: {
    id: 'hollow',
    cityId: 'thornveil',
    type: 'Town',
    name: 'The Whispering Hollow',
    short: 'The Hollow',
    art: null,
    sigil: 'eye',
    x: 20,
    y: 74,
    description:
      'A fold in the wood where sound arrives before it is made. Rope bridges, drying herbs, three exits, and a woman who has already read your expression. Her den is neutral ground — barely.',
    detail:
      'Nyx Whisperwind trades in what the three cities would rather forget. The watchers that haunt the fringe of her hollow wait outside her firelight.',
    npcs: ['nyx'],
    encounters: [],
    travel: [
      { to: 'hollow_watch', label: 'Step into the Watchers\' Fringe' },
      { to: 'waystone', label: 'Return toward Waystone' },
      { to: 'grove', label: 'Skirt toward the Blighted Grove' },
    ],
    search: {
      label: 'Search the hanging satchel',
      item: 'elixir_focus',
      text: 'A flask of clear liquid hangs with the drying herbs, tagged in Nyx\'s shorthand: "for the day it goes badly." She will pretend it was a gift.',
    },
  },

  // ——— THORNVEIL WILDS ———
  grove: {
    id: 'grove',
    cityId: 'thornveil',
    type: 'Wilds',
    name: 'The Blighted Grove',
    short: 'The Grove',
    art: null,
    sigil: 'skull',
    x: 42,
    y: 72,
    description:
      'Birch gone grey in a single season, ground soft where it should be frozen, and a smell like an old wound. No Court. No forge. Only rot with a direction.',
    detail:
      'Two shrines stand in the grove and both are buried. Whatever wakes down there wakes slowly, and it is waking anyway. Bring iron. Leave promises.',
    npcs: [],
    encounters: ['enc_grove'],
    travel: [
      { to: 'heartwood', label: 'Flee back to Heartwood Court' },
      { to: 'waystone', label: 'Cut for the Waystone Gate' },
      { to: 'hollow', label: 'Slip toward the Hollow' },
    ],
    search: {
      label: 'Cut a bead from the rot',
      item: 'thorn_essence',
      text: 'You cut a swollen knot from a dead trunk. Green light leaks out of it, slow and deliberate, like something thinking.',
    },
  },
  closed_road: {
    id: 'closed_road',
    cityId: 'thornveil',
    type: 'Wilds',
    name: 'The Closed Road',
    short: 'Closed Road',
    art: null,
    sigil: 'compass',
    x: 66,
    y: 18,
    description:
      'Iron nails in the waystones, rope across the ruts, a warning nobody has read twice. The ropes have been dragged into a heap. The heap stands up.',
    detail:
      'Kaelen closed this road. Whatever comes up it at night does not step around the ropes. The Warden\'s fire is behind you; the rot is ahead.',
    npcs: [],
    encounters: ['enc_waystone'],
    travel: [
      { to: 'waystone', label: 'Fall back to the Waystone Gate' },
      { to: 'grove', label: 'Push on toward the Grove' },
    ],
  },
  hollow_watch: {
    id: 'hollow_watch',
    cityId: 'thornveil',
    type: 'Wilds',
    name: "Watchers' Fringe",
    short: 'The Fringe',
    art: null,
    sigil: 'eye',
    x: 14,
    y: 82,
    description:
      'The hollow goes quiet beyond Nyx\'s firelight, which in Thornveil means something has arrived. Thornsprites and worse keep watch.',
    detail:
      'Nyx leaves the fringe unlocked on purpose. She sells maps of it. The maps are accurate until they are not.',
    npcs: [],
    encounters: ['enc_hollow'],
    travel: [
      { to: 'hollow', label: 'Return to Nyx\'s fire' },
      { to: 'grove', label: 'Skirt into the Blighted Grove' },
    ],
  },
};

export const ENCOUNTERS = {
  enc_crypt: {
    id: 'enc_crypt',
    name: 'The Ashen Crypt',
    locationId: 'ashen_crypt',
    cityId: 'aurelion',
    description: 'Two wisps of grey vapour drift between the tombs, and the bell rope moves on its own.',
    enemies: ['hollow_wisp', 'hollow_wisp'],
  },
  enc_alley: {
    id: 'enc_alley',
    name: 'Cutpurse Alley',
    locationId: 'cutpurse_alley',
    cityId: 'aurelion',
    description: 'Three shapes peel away from the wall. The one in front has a knife and a plan.',
    enemies: ['bandit_marauder', 'bone_hound'],
  },
  enc_yard: {
    id: 'enc_yard',
    name: 'Sentinel of the Road',
    locationId: 'western_road',
    cityId: 'aurelion',
    description: 'An old parade construct has woken on the western road and decided the drill never ended.',
    enemies: ['stone_sentinel'],
  },
  enc_rift: {
    id: 'enc_rift',
    name: 'The Spire Rift',
    locationId: 'rift_landing',
    cityId: 'aurelion',
    description: 'The tear in the air exhales ash. A cultist steps out of it, delighted.',
    enemies: ['ash_cultist', 'hollow_wisp'],
  },
  enc_gate: {
    id: 'enc_gate',
    name: 'The Drowned Gate',
    locationId: 'gate',
    cityId: 'aurelion',
    description: 'Something dead has walked up out of the harbour and brought friends.',
    enemies: ['drowned_reaver', 'bandit_marauder'],
  },
  enc_crown: {
    id: 'enc_crown',
    name: 'The Shattered Throne',
    locationId: 'gate',
    cityId: 'aurelion',
    description: 'The Herald stands where the throne used to be, wearing a crown made of every shard you have chased.',
    enemies: ['crown_herald'],
    requires: 'crown_shard_aurelion',
  },
  enc_grove: {
    id: 'enc_grove',
    name: 'The Blighted Grove',
    locationId: 'grove',
    cityId: 'thornveil',
    description: 'Rot with a direction. It walks, and the small offended things of the wood walk with it.',
    enemies: ['rot_shambler', 'thornsprite'],
  },
  enc_waystone: {
    id: 'enc_waystone',
    name: 'Something on the Closed Road',
    locationId: 'closed_road',
    cityId: 'thornveil',
    description: 'The ropes across the road have been dragged into a heap. The heap stands up.',
    enemies: ['rot_shambler'],
  },
  enc_hollow: {
    id: 'enc_hollow',
    name: 'Watchers in the Fringe',
    locationId: 'hollow_watch',
    cityId: 'thornveil',
    description: 'The fringe goes quiet, which in Thornveil means something has arrived.',
    enemies: ['thornsprite', 'shadow_assassin'],
  },
  enc_docks: {
    id: 'enc_docks',
    name: 'The Drowned Choir',
    locationId: null,
    cityId: 'stormhaven',
    description: 'Voices under the pier. Sealed with the rest of Stormhaven.',
    enemies: ['drowned_reaver', 'sea_wyrm'],
  },
};

export const getCity = (id) => CITIES.find((c) => c.id === id);
export const getLocation = (id) => LOCATIONS[id];
export const getEncounter = (id) => ENCOUNTERS[id];

export const START_LOCATION = 'cathedral';
