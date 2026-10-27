import React, { useState } from 'react';
import { Award, Sparkles, Sword } from 'lucide-react';
import { useGame } from '@/context/GameProvider';
import { ATTR_LABELS, ATTR_DESCRIPTIONS, getDerived, knownAbilities, lockedAbilities, xpPercent, xpToNext } from '@/lib/gameState';
import { getRace } from '@/data/races';
import { getClass } from '@/data/classes';
import { ACHIEVEMENTS } from '@/lib/gameEngine';
import { getItem } from '@/data/items';
import Panel from '@/components/ui-kit/Panel';
import StatBar from '@/components/ui-kit/StatBar';
import AbilityCard from '@/components/ui-kit/AbilityCard';
import ItemGlyph from '@/components/ui-kit/ItemGlyph';
import { initialsOf } from '@/components/ui-kit/NpcPortrait';

export default function CharacterProfile() {
  const { game, character } = useGame();
  const derived = getDerived(character);
  const race = getRace(character.raceId);
  const cls = getClass(character.classId);
  const known = knownAbilities(character);
  const locked = lockedAbilities(character);
  const [tab, setTab] = useState('known');
  const earned = game.achievements || [];

  return (
    <div className="animate-fade">
      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-3">
          <Panel className="relative overflow-hidden p-4" glow>
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rune-circle" />
            <div className="flex items-start gap-3">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: `${race.color}88`,
                  background: `radial-gradient(circle at 32% 24%, ${race.color}30, rgba(12,10,8,1) 72%)`,
                }}
              >
                <span className="font-heading text-lg" style={{ color: `${race.color}dd` }}>
                  {initialsOf(character.name)}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-xl leading-tight text-foreground">{character.name}</h1>
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary/75">
                  Level {character.level} · {race.name} {cls.name}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {race.epithet}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <StatBar
                label={`Experience · ${character.xp} / ${xpToNext(character.level)}`}
                value={xpPercent(character)}
                max={100}
                color="hsl(41 58% 55%)"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <StatBar label="Health" value={character.hp} max={derived.maxHp} color="hsl(4 62% 48%)" compact />
              </div>
              <div>
                <StatBar label={derived.resourceName} value={derived.maxResource} max={derived.maxResource} color={derived.resourceColor} compact />
              </div>
            </div>

            <div className="gold-rule my-3" />
            <p className="eyebrow text-muted-foreground">Likeness</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              {[character.appearance?.build, character.appearance?.hair && `${character.appearance.hair} hair`, character.appearance?.eyes && `${character.appearance.eyes} eyes`, character.appearance?.mark !== 'None' ? character.appearance?.mark : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <p className="eyebrow mt-3 text-muted-foreground">Biography</p>
            <p className="story-text mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-foreground/75">
              {character.biography || 'No story given. Aurelion is writing one for you.'}
            </p>
          </Panel>

          <Panel className="p-3">
            <p className="eyebrow mb-2 flex items-center gap-1.5 text-muted-foreground">
              <Sword size={11} className="text-primary/70" /> Kit
            </p>
            <div className="space-y-1.5">
              {['weapon', 'armor', 'trinket'].map((slot) => {
                const item = character.equipment?.[slot] ? getItem(character.equipment[slot]) : null;
                return (
                  <div key={slot} className="flex items-center gap-2.5">
                    {item ? <ItemGlyph item={item} size="sm" equipped /> : (
                      <div className="h-10 w-10 rounded-sm border border-dashed border-border/50" />
                    )}
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{slot}</p>
                      <p className="font-heading text-[12px] text-foreground/85">{item?.name || 'Empty'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="gold-rule my-2.5" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-heading text-[15px] text-primary">{derived.attack}</p>
                <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Attack</p>
              </div>
              <div>
                <p className="font-heading text-[15px] text-primary">{derived.defense}</p>
                <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Defense</p>
              </div>
              <div>
                <p className="font-heading text-[15px] text-primary">{Math.round(derived.crit * 100)}%</p>
                <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Critical</p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel className="p-4">
            <p className="eyebrow text-muted-foreground">Attributes</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(character.attributes).map(([key, value]) => (
                <div key={key} className="rounded-sm border border-border/60 bg-black/25 p-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">{ATTR_LABELS[key]}</p>
                    <p className="font-heading text-base text-primary">{value}</p>
                  </div>
                  <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground/80">{ATTR_DESCRIPTIONS[key]}</p>
                </div>
              ))}
            </div>
            <div className="gold-rule my-3" />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-sm border border-border/60 bg-black/25 p-2.5">
                <p className="eyebrow text-muted-foreground">Racial passive</p>
                <p className="mt-1 font-heading text-[12px] text-foreground">{race.passive.name}</p>
                <p className="text-[11px] leading-snug text-muted-foreground">{race.passive.description}</p>
              </div>
              <div className="rounded-sm border border-border/60 bg-black/25 p-2.5">
                <p className="eyebrow text-muted-foreground">Racial ability</p>
                <p className="mt-1 font-heading text-[12px] text-foreground">{race.ability.name}</p>
                <p className="text-[11px] leading-snug text-muted-foreground">{race.ability.description}</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="flex items-center justify-between">
              <p className="eyebrow flex items-center gap-1.5 text-muted-foreground">
                <Sparkles size={11} className="text-primary/70" /> Abilities · {cls.name}
              </p>
              <div className="flex gap-1">
                {[
                  { id: 'known', label: `Known ${known.length}` },
                  { id: 'locked', label: `Locked ${locked.length}` },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTab(option.id)}
                    className={`rounded-sm border px-2 py-0.5 font-heading text-[9px] uppercase tracking-[0.14em] transition ${
                      tab === option.id ? 'border-primary/50 text-primary' : 'border-border/50 text-muted-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {(tab === 'known' ? known : locked).map((ability) => (
                <AbilityCard key={ability.id} ability={ability} locked={tab === 'locked'} />
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <p className="eyebrow flex items-center gap-1.5 text-muted-foreground">
              <Award size={11} className="text-primary/70" /> Achievements · {earned.length}/{ACHIEVEMENTS.length}
            </p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = earned.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`rounded-sm border p-2 ${
                      unlocked ? 'border-primary/40 bg-primary/[0.07]' : 'border-border/40 bg-black/20 opacity-60'
                    }`}
                  >
                    <p className={`font-heading text-[11.5px] ${unlocked ? 'text-primary' : 'text-foreground/70'}`}>
                      {achievement.name}
                    </p>
                    <p className="text-[10.5px] leading-snug text-muted-foreground">{achievement.description}</p>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}