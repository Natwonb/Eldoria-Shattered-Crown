import React, { useState } from 'react';
import { Coins, Shield, Sword, Sparkles } from 'lucide-react';
import { useGame } from '@/context/GameProvider';
import { getDerived, ATTR_LABELS } from '@/lib/gameState';
import { getItem, RARITY } from '@/data/items';
import Panel from '@/components/ui-kit/Panel';
import ItemGlyph from '@/components/ui-kit/ItemGlyph';
import StatBar from '@/components/ui-kit/StatBar';

const SLOTS = [
  { key: 'weapon', label: 'Weapon', Icon: Sword },
  { key: 'armor', label: 'Armour', Icon: Shield },
  { key: 'trinket', label: 'Trinket', Icon: Sparkles },
];

const GROUP_ORDER = [
  { id: 'weapon', label: 'Weapons' },
  { id: 'armor', label: 'Armour' },
  { id: 'trinket', label: 'Trinkets' },
  { id: 'potion', label: 'Draughts' },
  { id: 'quest', label: 'Relics & quest items' },
];

function statLine(item) {
  const parts = [];
  if (item.attack) parts.push(`+${item.attack} attack`);
  if (item.defense) parts.push(`+${item.defense} defense`);
  if (item.hp) parts.push(`+${item.hp} health`);
  if (item.resource) parts.push(`+${item.resource} resource`);
  if (item.heal) parts.push(`restores ${Math.round(item.heal * 100)}% health`);
  return parts.join(' · ');
}

export default function Inventory() {
  const { character, equip, drink } = useGame();
  const derived = getDerived(character);
  const [filter, setFilter] = useState('all');
  const inventory = character.inventory || [];
  const equipped = character.equipment || {};

  const entries = inventory
    .map((entry) => ({ ...entry, item: getItem(entry.id) }))
    .filter((entry) => entry.item)
    .filter((entry) => filter === 'all' || entry.item.category === filter);

  return (
    <div className="animate-fade">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-primary/70">Inventory</p>
          <h1 className="mt-1 font-heading text-2xl text-foreground sm:text-3xl">What you carry</h1>
        </div>
        <div className="flex items-center gap-1.5 text-primary">
          <Coins size={14} />
          <span className="font-mono text-sm">{character.gold ?? 0}</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">gold</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <Panel className="p-4" glow>
            <p className="eyebrow text-muted-foreground">Equipped</p>
            <div className="mt-2 space-y-2">
              {SLOTS.map(({ key, label, Icon }) => {
                const item = equipped[key] ? getItem(equipped[key]) : null;
                return (
                  <div key={key} className="flex items-center gap-3 rounded-sm border border-border/60 bg-black/25 p-2.5">
                    {item ? <ItemGlyph item={item} size="sm" equipped /> : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-dashed border-border/60">
                        <Icon size={14} className="text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                      <p className="truncate font-heading text-[12.5px] text-foreground/90">{item?.name || 'Empty'}</p>
                      {item && <p className="text-[10.5px] text-primary/70">{statLine(item)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="gold-rule my-3" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Attack</p>
                <p className="font-heading text-lg text-primary">{derived.attack}</p>
              </div>
              <div>
                <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Defense</p>
                <p className="font-heading text-lg text-primary">{derived.defense}</p>
              </div>
              <div>
                <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Critical</p>
                <p className="font-heading text-lg text-primary">{Math.round(derived.crit * 100)}%</p>
              </div>
              <div>
                <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">{derived.resourceName}</p>
                <p className="font-heading text-lg text-primary">{derived.maxResource}</p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <StatBar label="Health" value={character.hp} max={derived.maxHp} color="hsl(4 62% 48%)" />
              <p className="text-[11px] leading-snug text-muted-foreground">
                Attributes: {Object.entries(character.attributes).map(([key, value]) => `${ATTR_LABELS[key]} ${value}`).join(' · ')}
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'all', label: 'All' }, ...GROUP_ORDER.map((g) => ({ id: g.id, label: g.label }))].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] transition ${
                  filter === option.id ? 'border-primary/50 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground/80'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {entries.length === 0 ? (
            <Panel className="p-6 text-center text-[13px] text-muted-foreground">
              Nothing in this satchel. Search locations, win fights, or finish quests.
            </Panel>
          ) : (
            <div className="space-y-2">
              {entries.map(({ item, qty }) => {
                const rarity = RARITY[item.rarity] || RARITY.common;
                const isEquipped = item.slot && equipped[item.slot] === item.id;
                return (
                  <Panel key={item.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <ItemGlyph item={item} equipped={isEquipped} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-heading text-[13px] text-foreground">{item.name}</p>
                            <p className="text-[9.5px] uppercase tracking-[0.16em]" style={{ color: rarity.color }}>
                              {rarity.label} · {item.category}
                              {qty > 1 ? ` · ×${qty}` : ''}
                            </p>
                          </div>
                          {isEquipped && (
                            <span className="shrink-0 rounded-sm border border-primary/40 px-1.5 py-0.5 font-heading text-[8.5px] uppercase tracking-[0.16em] text-primary">
                              worn
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{item.description}</p>
                        {statLine(item) && <p className="mt-0.5 font-mono text-[10px] text-primary/70">{statLine(item)}</p>}
                        <div className="mt-2 flex gap-2">
                          {item.slot && (
                            <button
                              type="button"
                              disabled={isEquipped}
                              onClick={() => equip(item.id)}
                              className={`rounded-sm border px-2.5 py-1 font-heading text-[9.5px] uppercase tracking-[0.14em] transition ${
                                isEquipped
                                  ? 'cursor-not-allowed border-border/40 text-muted-foreground/60'
                                  : 'border-primary/40 text-primary hover:bg-primary/10'
                              }`}
                            >
                              {isEquipped ? 'Equipped' : 'Equip'}
                            </button>
                          )}
                          {item.heal && (
                            <button
                              type="button"
                              onClick={() => drink(item.id)}
                              disabled={character.hp >= derived.maxHp}
                              className={`rounded-sm border px-2.5 py-1 font-heading text-[9.5px] uppercase tracking-[0.14em] transition ${
                                character.hp >= derived.maxHp
                                  ? 'cursor-not-allowed border-border/40 text-muted-foreground/60'
                                  : 'border-emerald-400/40 text-emerald-300/90 hover:bg-emerald-400/10'
                              }`}
                            >
                              Drink
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Panel>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}