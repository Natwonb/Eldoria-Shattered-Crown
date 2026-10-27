import React from 'react';
import { Check, Circle, ChevronRight, Lock, MapPin } from 'lucide-react';
import { getNpc } from '@/data/npcs';
import { CITIES, LOCATIONS } from '@/data/world';
import { objectiveState, questStatus } from '@/lib/gameEngine';

const CITY_LABEL = {
  aurelion: 'Aurelion',
  thornveil: 'Thornveil',
  stormhaven: 'Stormhaven',
};

export default function QuestCard({ game, quest, onAccept, onAbandon, onOpen, locked }) {
  const giver = getNpc(quest.giver);
  const status = questStatus(game, quest.id);
  const objectives = objectiveState(game, quest);
  const city = CITIES.find((c) => c.id === quest.cityId);
  const area = quest.locationId ? LOCATIONS[quest.locationId] : null;
  const level = quest.requires?.level;

  return (
    <article className="stone-panel rounded-sm p-4 transition-colors hover:border-primary/30">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-heading text-[9px] uppercase tracking-[0.18em] text-primary">
              {quest.classification}
            </span>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <MapPin size={10} /> {area?.short || CITY_LABEL[quest.cityId]}
              {!city?.playable && <span className="text-primary/60">· sealed</span>}
            </span>
            {level ? (
              <span className="font-mono text-[10px] text-muted-foreground">Lv {level}</span>
            ) : null}
            {status === 'completed' && (
              <span className="font-heading text-[9px] uppercase tracking-[0.18em] text-emerald-400/80">Complete</span>
            )}
            {status === 'failed' && (
              <span className="font-heading text-[9px] uppercase tracking-[0.18em] text-red-400/70">Failed</span>
            )}
          </div>
          <h3 className="font-heading text-[15px] text-foreground">{quest.title}</h3>
        </div>
        {giver && (
          <span className="shrink-0 text-right text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {giver.name}
          </span>
        )}
      </div>

      <p className="mt-2 text-[13.5px] leading-snug text-muted-foreground">{quest.summary}</p>

      <ul className="mt-3 space-y-1.5">
        {objectives.map((objective) => (
          <li key={objective.index} className="flex items-start gap-2 text-[12.5px]">
            {objective.done ? (
              <Check size={13} className="mt-0.5 shrink-0 text-primary" />
            ) : (
              <Circle size={13} className="mt-0.5 shrink-0 text-muted-foreground/50" />
            )}
            <span className={objective.done ? 'text-foreground/60 line-through' : 'text-foreground/85'}>
              {objective.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>{quest.rewards?.xp || 0} xp</span>
          <span className="text-primary/80">{quest.rewards?.gold || 0} gold</span>
          {(quest.rewards?.items || []).length > 0 && <span>{quest.rewards.items.length} item</span>}
        </div>

        {onAccept && status === 'available' && (
          locked ? (
            <span className="flex items-center gap-1.5 font-heading text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
              <Lock size={11} /> {locked}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onAccept(quest.id)}
              className="btn-gold rounded-sm px-3 py-1.5"
            >
              Accept
            </button>
          )
        )}
        {onAbandon && status === 'active' && (
          <button
            type="button"
            onClick={() => onAbandon(quest.id)}
            className="rounded-sm border border-border px-3 py-1.5 font-heading text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition hover:border-red-500/40 hover:text-red-300"
          >
            Abandon
          </button>
        )}
        {onOpen && (
          <button
            type="button"
            onClick={() => onOpen(quest.id)}
            className="flex items-center gap-1 font-heading text-[10px] uppercase tracking-[0.16em] text-primary/80 transition hover:text-primary"
          >
            Details <ChevronRight size={12} />
          </button>
        )}
      </div>
    </article>
  );
}
