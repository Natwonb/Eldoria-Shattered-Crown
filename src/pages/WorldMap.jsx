import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, MapPin, ChevronRight, Users, Play, X } from 'lucide-react';
import { CITIES, LOCATIONS } from '@/data/world';
import { ART } from '@/data/art';
import { useGame } from '@/context/GameProvider';
import { QUESTS_BY_CITY } from '@/data/quests';
import { NPCS } from '@/data/npcs';
import Panel from '@/components/ui-kit/Panel';
import Sigil from '@/components/ui-kit/Sigil';
import CharacterCreation from '@/pages/CharacterCreation';

const CITY_SIGIL = { aurelion: 'sun', thornveil: 'root', stormhaven: 'anchor' };

export default function WorldMap() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { game, character } = useGame();
  const [creating, setCreating] = useState(false);
  const landing = pathname === '/';
  const reputation = game?.reputation || {};
  const completed = Object.values(game?.quests || {}).filter((q) => q.status === 'completed');

  const map = (
    <div className="animate-fade">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-primary/70">Chapters One &amp; Two</p>
          <h1 className="mt-1 font-heading text-2xl text-foreground sm:text-3xl">The World of Eldoria</h1>
        </div>
        <p className="max-w-sm text-[12.5px] leading-snug text-muted-foreground">
          Three cities survived the Shattering. Aurelion and Thornveil answer your knock. Stormhaven does not.
        </p>
      </div>

      <Panel className="relative mt-4 overflow-hidden" glow>
        <div
          className="relative aspect-[16/10] w-full bg-cover bg-center sm:aspect-[16/8]"
          style={{ backgroundImage: `url(${ART.worldMap})` }}
        >
          <div className="absolute inset-0 bg-[#0b0907]/25" />
          {CITIES.map((city) => {
            const locked = !city.playable;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => (locked ? null : navigate(`/city/${city.id}`))}
                className={`group absolute -translate-x-1/2 -translate-y-1/2 ${locked ? 'cursor-not-allowed' : ''}`}
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
                aria-label={city.name}
              >
                <span
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 sm:h-14 sm:w-14 ${
                    locked ? 'opacity-60' : 'group-hover:scale-110'
                  }`}
                  style={{
                    borderColor: `${city.color}aa`,
                    background: 'radial-gradient(circle at 35% 30%, rgba(20,16,11,0.95), rgba(8,7,5,0.98))',
                    boxShadow: `0 0 0 4px ${city.color}14, 0 0 26px -4px ${city.color}99`,
                  }}
                >
                  {locked ? (
                    <Lock size={16} className="text-foreground/50" />
                  ) : (
                    <Sigil name={CITY_SIGIL[city.id]} size={20} className="text-primary" />
                  )}
                </span>
                <span className="mt-1.5 block whitespace-nowrap rounded-sm bg-[#0b0907]/85 px-2 py-0.5 font-heading text-[10px] uppercase tracking-[0.18em] text-foreground/90 ring-1 ring-white/10">
                  {city.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <MapPin size={11} /> Aurelion is open
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {completed.length} quests completed
          </p>
        </div>
      </Panel>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {CITIES.map((city) => {
          const cityLocations = (city.locations || []).map((id) => LOCATIONS[id]);
          const cityNpcs = NPCS.filter((npc) => npc.cityId === city.id);
          const cityQuests = QUESTS_BY_CITY(city.id);
          return (
            <Panel key={city.id} className={`overflow-hidden ${city.playable ? 'hover-lift cursor-pointer' : 'opacity-80'}`}>
              <button
                type="button"
                disabled={!city.playable}
                onClick={() => navigate(`/city/${city.id}`)}
                className="block w-full text-left disabled:cursor-not-allowed"
              >
                <div className="relative h-24 overflow-hidden">
                  {city.art ? (
                    <img src={city.art} alt={city.name} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{ background: `radial-gradient(circle at 50% 40%, ${city.color}30, rgba(10,8,6,1) 75%)` }}
                    >
                      <Sigil name={CITY_SIGIL[city.id]} size={34} className="text-foreground/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0907] via-transparent to-transparent" />
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-sm bg-black/70 px-1.5 py-0.5 font-heading text-[8.5px] uppercase tracking-[0.16em] text-foreground/75">
                    {city.playable ? 'Open' : <><Lock size={9} /> Sealed</>}
                  </span>
                </div>
                <div className="p-3.5">
                  <h2 className="font-heading text-[15px] text-foreground">{city.name}</h2>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary/70">{city.subtitle}</p>
                  <p className="mt-2 line-clamp-3 text-[12px] leading-snug text-muted-foreground">{city.description}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <span>{cityLocations.length} locations</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {cityNpcs.length}</span>
                    <span>{cityQuests.length} quests</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Standing {reputation[city.id] ?? 0}
                    </span>
                    {city.playable && (
                      <span className="flex items-center gap-1 font-heading text-[10px] uppercase tracking-[0.16em] text-primary/85">
                        Enter <ChevronRight size={11} />
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </Panel>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        Stormhaven is sealed in this chapter. Its people, faction and quests exist in the records, and will open once
        Aurelion and Thornveil have answered for what they are holding.
      </p>
    </div>
  );

  if (!landing) return map;

  return (
    <div className="relative min-h-screen">
      <button
        type="button"
        onClick={() => (character ? navigate('/map') : setCreating(true))}
        className="btn-gold fixed left-4 top-4 z-30 flex items-center gap-2 rounded-sm px-5 py-3 shadow-[0_16px_40px_-18px_#000]"
      >
        <Play size={14} /> {character ? 'Continue' : 'Start the Game'}
      </button>

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-20 sm:px-6">{map}</div>

      {creating && !character && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-background/98 px-4 py-8 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="fixed right-4 top-4 z-50 flex items-center gap-1.5 rounded-sm border border-border bg-black/60 px-3 py-2 font-heading text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground"
          >
            <X size={13} /> Close
          </button>
          <div className="mx-auto max-w-5xl">
            <CharacterCreation />
          </div>
        </div>
      )}
    </div>
  );
}