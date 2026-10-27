import React, { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Lock, MapPin } from 'lucide-react';
import { CITIES, LOCATIONS } from '@/data/world';
import { getNpc } from '@/data/npcs';
import { QUESTS_FOR_BOARD, getQuest } from '@/data/quests';
import { useGame } from '@/context/GameProvider';
import { questLocked, questStatus } from '@/lib/gameEngine';
import Panel from '@/components/ui-kit/Panel';

const HUB_BLURB = {
  cathedral: 'Notices pinned in beeswax under the Dawn sigil. Sisters do not gossip — they post.',
  market: 'Guild parchment, cheap ink, and a nail that has held worse bargains.',
  spire: 'A slate on the fourth landing. Scholars write small; trouble does not.',
  barracks: 'The duty board. Names, distances, and what must be held by dawn.',
  heartwood: 'Bark-carved posts in the Court circle. The forest keeps its own roster.',
  waystone: "Kaelen's rope-board. If it is posted here, the road already knows.",
  forge: 'Chalk on iron. Bran writes short. Pay is honest.',
  hollow: "Nyx's hanging slips. Read twice. Take once.",
};

function lockedReason(game, quest) {
  if (!questLocked(game, quest)) return null;
  const parts = [];
  const need = quest.requires || {};
  if (need.level && (game.character?.level || 1) < need.level) {
    parts.push(`Level ${need.level}`);
  }
  if (need.quests?.length) {
    const titles = need.quests.map((id) => getQuest(id)?.title || id).filter(Boolean);
    if (titles.length) parts.push(`Requires ${titles.join(', ')}`);
  }
  return parts.join(' · ') || 'Locked';
}

export default function QuestBoard() {
  const { cityId, locationId } = useParams();
  const { game, acceptQuest } = useGame();
  const city = CITIES.find((c) => c.id === cityId);
  const location = LOCATIONS[locationId];

  if (!city?.playable || !location || location.type !== 'Town') {
    return <Navigate to={city ? `/city/${city.id}` : '/map'} replace />;
  }

  const posted = useMemo(() => QUESTS_FOR_BOARD(location.id), [location.id]);

  const rows = useMemo(() => {
    return posted
      .map((quest) => {
        const status = questStatus(game, quest.id);
        return { quest, status, locked: lockedReason(game, quest) };
      })
      .filter((row) => row.status === 'available' || row.status === 'active')
      .sort((a, b) => {
        const la = a.quest.requires?.level || 1;
        const lb = b.quest.requires?.level || 1;
        return la - lb || a.quest.title.localeCompare(b.quest.title);
      });
  }, [posted, game]);

  return (
    <div className="animate-fade">
      <Link
        to={`/city/${city.id}/${location.id}`}
        className="flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={13} /> Back to {location.name}
      </Link>

      <Panel className="mt-3 p-5" glow>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-primary/80">Quest Board</p>
            <h1 className="mt-1 font-heading text-2xl text-foreground sm:text-3xl">{location.name}</h1>
            <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">{city.name}</p>
          </div>
          <ClipboardList className="text-primary/60" size={28} />
        </div>
        <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
          {HUB_BLURB[location.id] || 'Regional work, posted here — not shouted in the street.'}
        </p>
      </Panel>

      {rows.length === 0 ? (
        <Panel className="mt-4 p-6 text-center">
          <p className="text-[13.5px] text-muted-foreground">No open postings. Check another hub, or your journal for sworn work.</p>
          <Link to="/journal" className="btn-stone mt-4 inline-block rounded-sm px-4 py-2">Open journal</Link>
        </Panel>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map(({ quest, status, locked }) => {
            const giver = getNpc(quest.giver);
            const area = LOCATIONS[quest.locationId];
            const level = quest.requires?.level || 1;
            return (
              <article key={quest.id} className="stone-panel rounded-sm p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-heading text-[9px] uppercase tracking-[0.18em] text-primary">
                        {quest.classification}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        <MapPin size={10} /> {area?.name || quest.locationId}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">Lv {level}</span>
                      {status === 'active' && (
                        <span className="font-heading text-[9px] uppercase tracking-[0.16em] text-emerald-700/80">Accepted</span>
                      )}
                    </div>
                    <h3 className="font-heading text-[15px] text-foreground">{quest.title}</h3>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Giver · {giver?.name || quest.giver}
                    </p>
                  </div>
                  <div className="text-right font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <div>{quest.rewards?.xp || 0} xp</div>
                    <div className="text-primary/80">{quest.rewards?.gold || 0} gold</div>
                  </div>
                </div>
                <p className="mt-2 text-[13px] leading-snug text-muted-foreground">{quest.summary}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                  <Link
                    to="/journal"
                    className="font-heading text-[10px] uppercase tracking-[0.16em] text-primary/80 hover:text-primary"
                  >
                    Journal →
                  </Link>
                  {status === 'active' ? (
                    <span className="font-heading text-[10px] uppercase tracking-[0.16em] text-muted-foreground">In journal</span>
                  ) : locked ? (
                    <span className="flex items-center gap-1.5 font-heading text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                      <Lock size={11} /> {locked}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => acceptQuest(quest.id, true)}
                      className="btn-gold rounded-sm px-3 py-1.5"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
        Story quests may still be offered in conversation. Board work lives here — accepted tasks move to your journal.
      </p>
    </div>
  );
}
