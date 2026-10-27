import { getQuest, QUESTS } from '@/data/quests';
import { getItem } from '@/data/items';
import { getNpc } from '@/data/npcs';
import { applyXp, getDerived } from './gameState';
export const ACHIEVEMENTS = [
	{
		id: "first_blood",
		name: "First Blood",
		description: "Win your first battle.",
		test: (g) => g.defeated >= 1
	},
	{
		id: "veteran",
		name: "Veteran",
		description: "Win ten battles.",
		test: (g) => g.defeated >= 10
	},
	{
		id: "adept",
		name: "Adept",
		description: "Reach level 5.",
		test: (g) => g.character.level >= 5
	},
	{
		id: "master",
		name: "Master of the Ninth Step",
		description: "Reach level 10.",
		test: (g) => g.character.level >= 10
	},
	{
		id: "questkeeper",
		name: "Questkeeper",
		description: "Complete five quests.",
		test: (g) => completedCount(g) >= 5
	},
	{
		id: "renowned",
		name: "Renowned",
		description: "Complete fifteen quests.",
		test: (g) => completedCount(g) >= 15
	},
	{
		id: "wanderer",
		name: "Wanderer",
		description: "Visit every location in Aurelion.",
		test: (g) => (g.visited || []).length >= 5
	},
	{
		id: "trusted",
		name: "Trusted",
		description: "Earn a bond of 5 or more with someone.",
		test: (g) => Object.values(g.relationships || {}).some((v) => v >= 5)
	},
	{
		id: "wealthy",
		name: "Wealthy",
		description: "Hold 500 gold at once.",
		test: (g) => g.character.gold >= 500
	},
	{
		id: "crownbreaker",
		name: "Crownbreaker",
		description: "Face the Crown's Herald and end it.",
		test: (g) => !!g.flags?.crown_destroyed
	}
];
export function createGame(character) {
	return {
		version: 1,
		character,
		quests: {},
		relationships: {},
		flags: {},
		reputation: {
			aurelion: 0,
			thornveil: 0,
			stormhaven: 0
		},
		worldEvents: [],
		visited: [],
		defeated: 0,
		achievements: [],
		settings: { difficulty: "normal" },
		createdAt: new Date().toISOString()
	};
}
export function completedCount(game) {
	return Object.values(game.quests || {}).filter((q) => q.status === "completed").length;
}
export function objectiveState(game, quest) {
	const entry = game.quests?.[quest.id];
	return quest.objectives.map((objective, index) => ({
		...objective,
		index,
		done: !!entry?.progress?.[index]
	}));
}
export function isQuestComplete(game, questId) {
	const quest = getQuest(questId);
	if (!quest) return false;
	return objectiveState(game, quest).every((o) => o.done);
}
export function questStatus(game, questId) {
	return game.quests?.[questId]?.status || "available";
}
export function questLocked(game, quest) {
  if (!quest) return false;
  const need = quest.requires || {};
  if (need.level && (game.character?.level || 1) < need.level) return true;
  if (need.quests?.length && !need.quests.every((id) => game.quests?.[id]?.status === 'completed')) return true;
  return false;
}
export function startQuest(game, questId, spokeWithGiver = false) {
	const quest = getQuest(questId);
	if (!quest) return game;
	const entry = game.quests[questId];
	if (entry && (entry.status === "active" || entry.status === "completed")) return game;
	if (questLocked(game, quest)) {
		return game;
	}
	// Taking a task from the person asking it means you have already spoken with them.
	const progress = {};
	if (spokeWithGiver) {
		quest.objectives.forEach((objective, index) => {
			if (objective.kind === "talk" && objective.target === quest.giver) progress[index] = 1;
		});
	}
	return {
		...game,
		quests: {
			...game.quests,
			[questId]: {
				status: "active",
				progress,
				acceptedAt: new Date().toISOString()
			}
		}
	};
}
export function failQuest(game, questId) {
	const entry = game.quests[questId];
	if (!entry || entry.status !== "active") return game;
	return {
		...game,
		quests: {
			...game.quests,
			[questId]: {
				...entry,
				status: "failed"
			}
		}
	};
}
export function advanceQuests(game, kind, target) {
	let next = {
		...game,
		quests: { ...game.quests }
	};
	const completed = [];
	Object.keys(next.quests).forEach((questId) => {
		const entry = next.quests[questId];
		if (entry.status !== "active") return;
		const quest = getQuest(questId);
		if (!quest) return;
		const progress = { ...entry.progress || {} };
		let changed = false;
		quest.objectives.forEach((objective, index) => {
			if (progress[index]) return;
			if (objective.kind === kind && objective.target === target) {
				progress[index] = 1;
				changed = true;
			}
		});
		if (!changed) return;
		next.quests[questId] = {
			...entry,
			progress
		};
		if (quest.objectives.every((_, index) => progress[index])) {
			const result = completeQuest(next, questId);
			next = result.game;
			completed.push({
				id: questId,
				title: quest.title,
				rewards: quest.rewards
			});
		}
	});
	return {
		game: next,
		completed
	};
}
export function completeQuest(game, questId) {
	const quest = getQuest(questId);
	const entry = game.quests[questId];
	if (!quest || entry?.status === "completed") return { game };
	let next = {
		...game,
		quests: {
			...game.quests,
			[questId]: {
				...entry || {},
				status: "completed",
				progress: entry?.progress || {},
				completedAt: new Date().toISOString()
			}
		}
	};
	const rewards = quest.rewards || {};
	const { character } = applyXp(next.character, rewards.xp || 0);
	next.character = {
		...character,
		gold: (character.gold || 0) + (rewards.gold || 0)
	};
	(rewards.items || []).forEach((itemId) => {
		next = addItem(next, itemId, 1);
	});
	Object.entries(rewards.relationship || {}).forEach(([npcId, delta]) => {
		next = addRelationship(next, npcId, delta);
	});
	Object.entries(rewards.reputation || {}).forEach(([cityId, delta]) => {
		next = addReputation(next, cityId, delta);
	});
	(quest.consequences?.flags || []).forEach((flag) => {
		next = setFlag(next, flag);
	});
	if (quest.consequences?.event) {
		next = pushEvent(next, {
			...quest.consequences.event,
			cityId: quest.cityId
		});
	}
	return { game: checkAchievements(next) };
}
export function addItem(game, itemId, qty = 1) {
	if (!getItem(itemId)) return game;
	const inventory = (game.character.inventory || []).map((entry) => ({ ...entry }));
	const existing = inventory.find((entry) => entry.id === itemId);
	if (existing) existing.qty = (existing.qty || 0) + qty;
	else inventory.push({
		id: itemId,
		qty
	});
	return {
		...game,
		character: {
			...game.character,
			inventory
		}
	};
}
export function removeItem(game, itemId, qty = 1) {
	const inventory = (game.character.inventory || []).map((entry) => entry.id === itemId ? {
		...entry,
		qty: (entry.qty || 0) - qty
	} : { ...entry }).filter((entry) => entry.qty > 0);
	return {
		...game,
		character: {
			...game.character,
			inventory
		}
	};
}
export function equipItem(game, itemId) {
	const item = getItem(itemId);
	if (!item?.slot) return game;
	const owned = (game.character.inventory || []).some((entry) => entry.id === itemId);
	if (!owned) return game;
	return {
		...game,
		character: {
			...game.character,
			equipment: {
				...game.character.equipment,
				[item.slot]: itemId
			}
		}
	};
}
export function consumePotion(game, itemId) {
	const item = getItem(itemId);
	if (!item?.heal) return game;
	const derived = getDerived(game.character);
	if (game.character.hp >= derived.maxHp) return game;
	const hp = Math.min(derived.maxHp, (game.character.hp || 0) + Math.round(derived.maxHp * item.heal));
	return removeItem({
		...game,
		character: {
			...game.character,
			hp
		}
	}, itemId, 1);
}
export function addRelationship(game, npcId, delta) {
	if (!getNpc(npcId) || !delta) return game;
	const current = game.relationships?.[npcId] || 0;
	const next = Math.max(-10, Math.min(10, current + delta));
	return {
		...game,
		relationships: {
			...game.relationships,
			[npcId]: next
		}
	};
}
export function addReputation(game, cityId, delta) {
	const current = game.reputation?.[cityId] || 0;
	const next = Math.max(-20, Math.min(30, current + delta));
	return {
		...game,
		reputation: {
			...game.reputation,
			[cityId]: next
		}
	};
}
export function setFlag(game, flag) {
	if (!flag || game.flags?.[flag]) return game;
	return {
		...game,
		flags: {
			...game.flags,
			[flag]: true
		}
	};
}
export function pushEvent(game, event) {
	if (!event?.title) return game;
	if ((game.worldEvents || []).some((entry) => entry.title === event.title)) return game;
	const entry = {
		id: `ev${(game.worldEvents || []).length + 1}`,
		title: event.title,
		text: event.text,
		cityId: event.cityId || "aurelion",
		ending: !!event.ending,
		at: new Date().toISOString()
	};
	return {
		...game,
		worldEvents: [...game.worldEvents || [], entry]
	};
}
export function markVisited(game, locationId) {
	if (!locationId || (game.visited || []).includes(locationId)) return game;
	return checkAchievements({
		...game,
		visited: [...game.visited || [], locationId]
	});
}
export function checkAchievements(game) {
	const earned = game.achievements || [];
	const newly = ACHIEVEMENTS.filter((a) => !earned.includes(a.id) && a.test(game)).map((a) => a.id);
	if (!newly.length) return game;
	return {
		...game,
		achievements: [...earned, ...newly]
	};
}
export function recordVictory(game, { xp, gold, items, encounterId }) {
	const { character } = applyXp(game.character, xp || 0);
	const derived = getDerived(character);
	let next = {
		...game,
		character: {
			...character,
			gold: (character.gold || 0) + (gold || 0),
			hp: Math.max(1, Math.round(derived.maxHp * .75))
		},
		defeated: (game.defeated || 0) + 1
	};
	(items || []).forEach((itemId) => {
		next = addItem(next, itemId, 1);
	});
	if (encounterId) {
		const { game: advanced } = advanceQuests(next, "kill", encounterId);
		next = advanced;
	}
	return checkAchievements(next);
}
export function recordDefeat(game) {
	const derived = getDerived(game.character);
	const lost = Math.min(game.character.gold || 0, Math.round((game.character.gold || 0) * .25));
	return {
		...game,
		character: {
			...game.character,
			hp: Math.max(1, Math.round(derived.maxHp * .3)),
			gold: (game.character.gold || 0) - lost
		}
	};
}
export function listQuests(game, status) {
	return QUESTS.filter((quest) => {
		const current = questStatus(game, quest.id);
		return current === status;
	});
}
export function computeEnding(game) {
	const flags = game.flags || {};
	const dawn = (game.reputation?.aurelion || 0) + (game.relationships?.seraphine || 0);
	if (flags.crown_destroyed) {
		if (dawn >= 8) {
			return {
				id: "rekindled",
				title: "The Dawn Rekindled",
				text: "The shard goes cold in your pack and Aurelion does not learn for a year. When it does, the Cathedral opens its doors to everyone who helped, and the Dawn Covenant becomes something it has never been: a promise kept in daylight."
			};
		}
		if ((game.relationships?.aldric || 0) >= 5) {
			return {
				id: "quiet",
				title: "The Quiet Crown",
				text: "No bell rings. No herald rises. The Radiant Guard quietly rewrites its oaths to leave the Crown out, and Aldric signs the order without reading it twice. Some victories are only ever recorded in a ledger."
			};
		}
		return {
			id: "shattered_peace",
			title: "A Shattered Peace",
			text: "The Herald comes apart and the pieces are buried separately, by people who do not trust each other. Eldoria is free of the Crown and no closer to being whole. You walk out of the gate alone, which is how you walked in."
		};
	}
	if ((game.reputation?.aurelion || 0) >= 6) {
		return {
			id: "gilded",
			title: "The Gilded Silence",
			text: "You are celebrated in Aurelion and asked, politely, to stop asking about the Crown. The city is safe. The question is not answered. Somewhere under the harbour, something finishes putting itself together without you."
		};
	}
	return {
		id: "long_dusk",
		title: "The Long Dusk",
		text: "The tale is not finished. The shards are still out there, the bell still remembers, and the road out of Aurelion is longer than it was when you arrived."
	};
}

