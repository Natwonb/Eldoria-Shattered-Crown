import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Swords, Search, Users, MapPin, Compass, ClipboardList } from 'lucide-react';
import { CITIES, ENCOUNTERS, LOCATIONS } from '@/data/world';
import { getNpc } from '@/data/npcs';
import { getItem } from '@/data/items';
import { ENEMIES } from '@/data/enemies';
import { useGame } from '@/context/GameProvider';
import Panel from '@/components/ui-kit/Panel';
import NpcPortrait from '@/components/ui-kit/NpcPortrait';
import Sigil from '@/components/ui-kit/Sigil';
import SigilBackdrop from '@/components/ui-kit/SigilBackdrop';

const TYPE_CLASS = {
  Town: 'type-badge type-badge-town',
  Wilds: 'type-badge type-badge-wilds',
  Dungeon: 'type-badge type-badge-dungeon',
};

export default function LocationView() {
  const { cityId, locationId } = useParams();
  const navigate = useNavigate();
  const { game, explore, grantItem, applyFlag } = useGame();
  const location = LOCATIONS[locationId];
  const city = CITIES.find((c) => c.id === cityId);
  const entered = useRef(false);
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    if (!location || entered.current) return;
    entered.current = true;
    explore(location.id);
  }, [location, explore]);

  if (!location || !city) return <Navigate to="/map" replace />;

  const npcs = (location.npcs || []).map(getNpc).filter(Boolean);
  const encounters = (location.encounters || [])
    .map((id) => ENCOUNTERS[id])
    .filter((encounter) => encounter && (!encounter.requires || game.flags?.[encounter.requires]));
  const searchFlag = `searched_${location.id}`;
  const alreadySearched = !!game.flags?.[searchFlag];
  const placeType = location.type || (encounters.length ? 'Wilds' : 'Town');
  const isSafe = placeType === 'Town';
  const travel = (location.travel || []).filter((link) => LOCATIONS[link.to]);

  const search = () => {
    if (!location.search || alreadySearched) return;
    grantItem(location.search.item, 1);
    applyFlag(searchFlag);
    setSearchResult(location.search.text);
  };

  return (
    <div className="animate-fade">
      <div className="flex items-center justify-between gap-3">
        <Link
          to={`/city/${city.id}`}
          className="flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={13} /> {city.name}
        </Link>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <MapPin size={11} /> {city.faction?.name}
        </span>
      </div>

      <Panel className="relative mt-3 overflow-hidden" glow>
        <div className="relative aspect-[16/9] sm:aspect-[21/8]">
          {location.art ? (
            <img src={location.art} alt={location.name} className="h-full w-full object-cover" />
          ) : (
            <SigilBackdrop sigil={location.sigil} color={city.color} size={66} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E2A24]/85 via-[#2E2A24]/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={TYPE_CLASS[placeType] || TYPE_CLASS.Town}>{placeType}</span>
              {isSafe ? (
                <span className="rounded-sm border border-emerald-700/30 bg-emerald-50/90 px-1.5 py-0.5 font-heading text-[9px] uppercase tracking-[0.16em] text-emerald-900">
                  Safe hub
                </span>
              ) : (
                <span className="rounded-sm border border-amber-700/30 bg-amber-50/90 px-1.5 py-0.5 font-heading text-[9px] uppercase tracking-[0.16em] text-amber-900">
                  Hostile ground
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl text-white ink-shadow sm:text-3xl">{location.name}</h1>
            <p className="mt-1 max-w-xl text-[13px] leading-snug text-white/85">{location.description}</p>
          </div>
        </div>
        <p className="border-t border-border/60 px-4 py-3 text-[13px] leading-relaxed text-foreground/70">
          {location.detail}
        </p>
      </Panel>

      {isSafe && (
        <Link
          to={`/city/${city.id}/${location.id}/board`}
          className="stone-panel hover-lift mt-4 flex items-center gap-3 rounded-sm p-4"
        >
          <ClipboardList size={20} className="shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[14px] text-foreground">Quest Board</p>
            <p className="text-[12px] leading-snug text-muted-foreground">
              Regional postings for {location.short || location.name} — accept work here, track it in your journal.
            </p>
          </div>
          <span className="shrink-0 font-heading text-[10px] uppercase tracking-[0.16em] text-primary/80">Open →</span>
        </Link>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {npcs.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 font-heading text-[13px] uppercase tracking-[0.18em] text-foreground/90">
                <Users size={13} className="text-primary/80" /> Present
              </h2>
              <div className="space-y-2">
                {npcs.map((npc) => (
                  <button
                    key={npc.id}
                    type="button"
                    onClick={() => navigate(`/dialogue/${npc.id}`)}
                    className="stone-panel hover-lift flex w-full items-center gap-3 rounded-sm p-3 text-left"
                  >
                    <NpcPortrait npc={npc} size={54} />
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-[14px] text-foreground">{npc.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-primary/70">{npc.title}</p>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground">{npc.personality}</p>
                    </div>
                    <span className="shrink-0 font-heading text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                      Speak →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSafe && npcs.length === 0 && (
            <Panel className="p-3">
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                A quiet corner of {city.name}. No one of note stands here now — shops and roads lead elsewhere.
              </p>
            </Panel>
          )}
        </div>

        <div className="space-y-3">
          {encounters.length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 font-heading text-[13px] uppercase tracking-[0.18em] text-foreground/90">
                <Swords size={13} className="text-primary/80" /> Danger
              </h2>
              <div className="space-y-2">
                {encounters.map((encounter) => (
                  <Panel key={encounter.id} className="p-3">
                    <h3 className="font-heading text-[13px] text-foreground">{encounter.name}</h3>
                    <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{encounter.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {encounter.enemies.map((enemyId, index) => (
                        <span
                          key={`${enemyId}-${index}`}
                          className="flex items-center gap-1 rounded-sm border border-border/60 px-1.5 py-0.5 text-[10px] text-foreground/70"
                        >
                          <Sigil name={ENEMIES[enemyId]?.sigil} size={10} /> {ENEMIES[enemyId]?.name}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/combat/${encounter.id}`)}
                      className="btn-gold mt-3 w-full rounded-sm px-3 py-2"
                    >
                      Draw steel
                    </button>
                  </Panel>
                ))}
              </div>
            </div>
          )}

          {isSafe && encounters.length === 0 && (
            <Panel className="p-3">
              <p className="eyebrow text-primary/80">Sanctuary</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Hostile encounters do not happen inside this {placeType.toLowerCase()}. Travel the roads, wilds, or
                crypts beyond if you seek a fight.
              </p>
            </Panel>
          )}

          {location.search && (
            <Panel className="p-3">
              <h2 className="flex items-center gap-2 font-heading text-[13px] uppercase tracking-[0.18em] text-foreground/90">
                <Search size={13} className="text-primary/80" /> The ground here
              </h2>
              <button
                type="button"
                onClick={search}
                disabled={alreadySearched}
                className={`mt-2 w-full rounded-sm border px-3 py-2 text-left text-[12px] transition ${
                  alreadySearched
                    ? 'border-border/40 text-muted-foreground'
                    : 'border-border/70 text-foreground/85 hover:border-primary/40'
                }`}
              >
                {alreadySearched ? 'Already searched' : location.search.label}
              </button>
              {(searchResult || alreadySearched) && (
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {searchResult || location.search.text}
                </p>
              )}
              {searchResult && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-primary/80">
                  <Sigil name={getItem(location.search.item)?.icon} size={11} /> {getItem(location.search.item)?.name} added
                </p>
              )}
            </Panel>
          )}

          <Panel className="p-3">
            <p className="eyebrow flex items-center gap-1.5 text-muted-foreground">
              <Compass size={11} /> Travel
            </p>
            <div className="mt-2 space-y-1.5">
              {travel.map((link) => {
                const dest = LOCATIONS[link.to];
                return (
                  <Link
                    key={link.to}
                    to={`/city/${city.id}/${link.to}`}
                    className="flex items-center justify-between gap-2 rounded-sm border border-border/60 px-3 py-2 text-[12px] text-foreground/80 transition hover:border-primary/40"
                  >
                    <span className="min-w-0">
                      <span className="block">{link.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {dest?.type || 'Place'} · {dest?.name}
                      </span>
                    </span>
                    <span>→</span>
                  </Link>
                );
              })}
              <Link
                to={`/city/${city.id}`}
                className="flex items-center justify-between rounded-sm border border-border/60 px-3 py-2 text-[12px] text-foreground/80 transition hover:border-primary/40"
              >
                Back to the streets of {city.name} <span>→</span>
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
