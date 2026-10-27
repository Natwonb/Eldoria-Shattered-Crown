import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Shield, Heart, Crown } from 'lucide-react';
import { useGame } from '@/context/GameProvider';
import { CITIES, LOCATIONS } from '@/data/world';
import { getNpc } from '@/data/npcs';
import NpcPortrait from '@/components/ui-kit/NpcPortrait';
import Panel from '@/components/ui-kit/Panel';

const CITY_LABEL = { aurelion: 'Aurelion', thornveil: 'Thornveil', stormhaven: 'Stormhaven' };

function bondLabel(value) {
  if (value >= 7) return 'Bonded';
  if (value >= 4) return 'Trusted';
  if (value >= 1) return 'Warm';
  if (value === 0) return 'Stranger';
  if (value >= -3) return 'Wary';
  return 'Hostile';
}

export default function WorldEvents() {
  const { game, ending } = useGame();
  const events = [...(game.worldEvents || [])].reverse();
  const bonds = Object.entries(game.relationships || {})
    .map(([npcId, value]) => ({ npc: getNpc(npcId), value }))
    .filter((entry) => entry.npc)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="animate-fade">
      <div>
        <p className="eyebrow text-primary/70">World Chronicle</p>
        <h1 className="mt-1 font-heading text-2xl text-foreground sm:text-3xl">What your choices changed</h1>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          {events.length === 0 ? (
            <Panel className="p-6 text-center">
              <Sun size={20} className="mx-auto text-primary/50" />
              <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
                Nothing has changed yet. Complete a quest and the city will remember it here — for good or otherwise.
              </p>
              <Link to="/city/aurelion" className="btn-stone mt-4 inline-block rounded-sm px-4 py-2">
                Walk into Aurelion
              </Link>
            </Panel>
          ) : (
            events.map((event, index) => (
              <Panel key={event.id} className="relative overflow-hidden p-4">
                <span
                  className="absolute left-0 top-0 h-full w-0.5"
                  style={{ background: 'linear-gradient(180deg, hsl(41 58% 55% / 0.6), transparent)' }}
                />
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-[14.5px] text-foreground">{event.title}</h2>
                  <span className="shrink-0 rounded-sm border border-border/60 px-1.5 py-0.5 font-heading text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">
                    {CITY_LABEL[event.cityId] || 'Eldoria'}
                  </span>
                </div>
                <p className="story-text mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{event.text}</p>
                <p className="mt-2 text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/60">
                  {index === 0 ? 'Most recent' : new Date(event.at).toLocaleDateString()}
                </p>
              </Panel>
            ))
          )}

          {game.flags?.crown_destroyed && (
            <Panel className="p-4" glow>
              <p className="eyebrow flex items-center gap-1.5 text-primary">
                <Crown size={12} /> Your ending
              </p>
              <h2 className="mt-1 font-heading text-xl text-foreground">{ending?.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground/75">{ending?.text}</p>
            </Panel>
          )}
        </div>

        <div className="space-y-3">
          <Panel className="p-4">
            <p className="eyebrow flex items-center gap-1.5 text-muted-foreground">
              <Shield size={11} className="text-primary/70" /> Faction standing
            </p>
            <div className="mt-2 space-y-2.5">
              {CITIES.map((city) => {
                const value = game.reputation?.[city.id] ?? 0;
                const pct = Math.max(4, Math.min(100, ((value + 10) / 40) * 100));
                return (
                  <div key={city.id}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11.5px] text-foreground/85">{city.faction?.name}</span>
                      <span className="font-mono text-[10px] text-primary/80">{value}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/60">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: city.color, boxShadow: `0 0 10px ${city.color}66` }}
                      />
                    </div>
                    <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
                      {city.name} {city.playable ? '' : '· sealed'}
                    </p>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-4">
            <p className="eyebrow flex items-center gap-1.5 text-muted-foreground">
              <Heart size={11} className="text-primary/70" /> Bonds
            </p>
            {bonds.length === 0 ? (
              <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
                You have not yet left an impression on anyone worth remembering.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {bonds.map(({ npc, value }) => (
                  <div key={npc.id} className="flex items-center gap-2.5">
                    <NpcPortrait npc={npc} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-[11.5px] text-foreground/90">{npc.name}</p>
                      <p className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                        {bondLabel(value)}
                      </p>
                    </div>
                    <span className={`font-mono text-[10px] ${value >= 0 ? 'text-emerald-300/80' : 'text-red-300/80'}`}>
                      {value > 0 ? `+${value}` : value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="p-4">
            <p className="eyebrow text-muted-foreground">Where you have been</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(game.visited || []).length === 0 && (
                <p className="text-[12px] text-muted-foreground">No ground walked yet.</p>
              )}
              {(game.visited || []).map((id) => (
                <span
                  key={id}
                  className="rounded-sm border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-foreground/75"
                >
                  {LOCATIONS[id]?.name || id}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
              {game.defeated || 0} battles won · {Object.keys(game.quests || {}).length} quests in your journal
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}