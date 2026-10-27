import React from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Swords, ClipboardList } from 'lucide-react';
import { CITIES, LOCATIONS } from '@/data/world';
import { NPCS } from '@/data/npcs';
import { QUESTS_BY_CITY } from '@/data/quests';
import { useGame } from '@/context/GameProvider';
import Panel from '@/components/ui-kit/Panel';
import SigilBackdrop from '@/components/ui-kit/SigilBackdrop';

const TYPE_CLASS = {
  Town: 'type-badge type-badge-town',
  Wilds: 'type-badge type-badge-wilds',
  Dungeon: 'type-badge type-badge-dungeon',
};

export default function CityView() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const { game } = useGame();
  const city = CITIES.find((c) => c.id === cityId);

  if (!city) return <Navigate to="/map" replace />;

  const locations = (city.locations || []).map((id) => LOCATIONS[id]).filter(Boolean);
  const hubs = locations.filter((loc) => loc.type === 'Town');
  const dangers = locations.filter((loc) => loc.type !== 'Town');
  const cityNpcs = NPCS.filter((npc) => npc.cityId === city.id);
  const quests = QUESTS_BY_CITY(city.id);

  if (!city.playable) {
    return (
      <div className="animate-fade">
        <Link to="/map" className="flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <ArrowLeft size={13} /> World Map
        </Link>
        <Panel className="mt-4 p-6 text-center" glow>
          <h1 className="font-heading text-2xl text-foreground">{city.name}</h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-primary/70">{city.subtitle}</p>
          <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-muted-foreground">{city.description}</p>
          <p className="mt-5 font-heading text-[11px] uppercase tracking-[0.2em] text-primary/80">
            Sealed until Chapter Two
          </p>
        </Panel>
      </div>
    );
  }

  const renderCard = (location) => {
    const npcCount = (location.npcs || []).length;
    const placeType = location.type || 'Town';
    return (
      <Link
        key={location.id}
        to={`/city/${city.id}/${location.id}`}
        className="stone-panel hover-lift group overflow-hidden rounded-sm"
      >
        <div className="relative h-28 overflow-hidden">
          {location.art ? (
            <img
              src={location.art}
              alt={location.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <SigilBackdrop
              sigil={location.sigil}
              color={city.color}
              size={34}
              className="transition duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E2A24]/90 via-[#2E2A24]/25 to-transparent" />
          <span className={`absolute left-2 top-2 ${TYPE_CLASS[placeType] || TYPE_CLASS.Town}`}>{placeType}</span>
          <h3 className="absolute inset-x-0 bottom-0 p-2.5 font-heading text-[13px] text-white ink-shadow">
            {location.name}
          </h3>
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-[12px] leading-snug text-muted-foreground">{location.description}</p>
          <div className="mt-2 flex items-center gap-3 text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground/80">
            {npcCount > 0 && (
              <span className="flex items-center gap-1"><Users size={10} /> {npcCount}</span>
            )}
            {(location.encounters || []).length > 0 && (
              <span className="flex items-center gap-1"><Swords size={10} /> danger</span>
            )}
            <span className="ml-auto flex items-center gap-1 text-primary/70">
              <MapPin size={10} /> enter
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="animate-fade">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/map"
          className="flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={13} /> World Map
        </Link>
        <span className="font-heading text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Standing with {city.faction.name}: {game.reputation?.[city.id] ?? 0}
        </span>
      </div>

      <Panel className="relative mt-3 overflow-hidden" glow>
        <div className="relative aspect-[16/9] w-full sm:aspect-[16/7]">
          {city.art ? (
            <img src={city.art} alt={city.name} className="h-full w-full object-cover" />
          ) : (
            <SigilBackdrop sigil={city.sigil} color={city.color} size={72} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E2A24]/85 via-[#2E2A24]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <p className="eyebrow text-primary/85">{city.faction.name}</p>
            <h1 className="mt-1 font-heading text-3xl text-white ink-shadow sm:text-4xl">{city.name}</h1>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/75">{city.subtitle}</p>
          </div>

          {locations.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => navigate(`/city/${city.id}/${location.id}`)}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              aria-label={location.name}
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-primary/80 bg-[#F7F1E3] shadow-[0_0_0_4px_rgba(46,90,58,0.18)] transition group-hover:scale-125">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <span className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-sm bg-[#F7F1E3]/95 px-2 py-0.5 font-heading text-[9px] uppercase tracking-[0.16em] text-foreground/90 opacity-0 ring-1 ring-border transition group-hover:opacity-100">
                {location.short}
              </span>
            </button>
          ))}
        </div>
        <p className="border-t border-border/60 px-4 py-3 text-[13.5px] leading-relaxed text-foreground/75">
          {city.description}
        </p>
      </Panel>

      <div className="mt-5 flex items-baseline justify-between">
        <h2 className="font-heading text-lg text-foreground">Quest Boards</h2>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Posted in safe hubs only</span>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {hubs.map((hub) => (
          <Link
            key={hub.id}
            to={`/city/${city.id}/${hub.id}/board`}
            className="stone-panel hover-lift flex items-center gap-3 rounded-sm p-3"
          >
            <ClipboardList size={16} className="shrink-0 text-primary/80" />
            <div className="min-w-0">
              <p className="font-heading text-[13px] text-foreground">{hub.name}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Open board</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-7 flex items-baseline justify-between">
        <h2 className="font-heading text-lg text-foreground">Safe hubs</h2>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Towns — NPCs &amp; boards</span>
      </div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hubs.map(renderCard)}
      </div>

      <div className="mt-7 flex items-baseline justify-between">
        <h2 className="font-heading text-lg text-foreground">Wilds &amp; dungeons</h2>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Hostile ground</span>
      </div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dangers.map(renderCard)}
      </div>

      <p className="mt-6 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {cityNpcs.length} souls of note · {hubs.length} hubs · {dangers.length} wild sites · {quests.length} quests on record
      </p>
    </div>
  );
}
