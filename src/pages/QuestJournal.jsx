import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import { useGame } from '@/context/GameProvider';
import { QUESTS, getQuest } from '@/data/quests';
import { questLocked, questStatus } from '@/lib/gameEngine';
import QuestCard from '@/components/ui-kit/QuestCard';
import Panel from '@/components/ui-kit/Panel';

const TABS = [
  { id: 'available', label: 'Story offers', empty: 'No open story tasks from dialogue. Regional work lives on town Quest Boards.' },
  { id: 'active', label: 'Active', empty: 'Nothing sworn to. Visit a Quest Board in any safe hub, or speak with someone who has work.' },
  { id: 'completed', label: 'Completed', empty: 'Nothing finished yet. Everything is still ahead of you.' },
  { id: 'failed', label: 'Failed', empty: 'You have abandoned nothing. That is its own kind of record.' },
];

export default function QuestJournal() {
  const { game, acceptQuest, abandonQuest } = useGame();
  const [tab, setTab] = useState('active');
  const [city, setCity] = useState('all');

  const byStatus = useMemo(() => {
    const groups = { available: [], active: [], completed: [], failed: [] };
    QUESTS.forEach((quest) => {
      const status = questStatus(game, quest.id);
      if (status === 'available') {
        // Board postings are not listed as free-floating offers here
        if (quest.board) return;
        groups.available.push(quest);
      } else {
        groups[status].push(quest);
      }
    });
    return groups;
  }, [game]);

  const list = byStatus[tab].filter((quest) => city === 'all' || quest.cityId === city);
  const active = TABS.find((entry) => entry.id === tab);

  const lockedLabel = (quest) => {
    if (tab !== 'available' || !questLocked(game, quest)) return undefined;
    const parts = [];
    if (quest.requires?.level && (game.character?.level || 1) < quest.requires.level) {
      parts.push(`Level ${quest.requires.level}`);
    }
    const titles = (quest.requires?.quests || []).map((id) => getQuest(id)?.title).filter(Boolean);
    if (titles.length) parts.push(`Requires ${titles.join(', ')}`);
    return parts.join(' · ') || 'Locked';
  };

  return (
    <div className="animate-fade">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-primary/70">Quest Journal</p>
          <h1 className="mt-1 font-heading text-2xl text-foreground sm:text-3xl">What you have promised</h1>
        </div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {byStatus.completed.length} of {QUESTS.length} complete
        </p>
      </div>

      <Panel className="mt-3 p-3">
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Regional jobs are posted on each town&apos;s <strong className="text-foreground/85">Quest Board</strong>, not in the street.
          Accept them there; they appear under Active once sworn.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to="/city/aurelion" className="btn-stone rounded-sm px-3 py-1.5 text-[10px]">Aurelion boards</Link>
          <Link to="/city/thornveil" className="btn-stone rounded-sm px-3 py-1.5 text-[10px]">Thornveil boards</Link>
        </div>
      </Panel>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {TABS.map((entry) => {
          const count = byStatus[entry.id].length;
          const selected = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 font-heading text-[10px] uppercase tracking-[0.16em] transition ${
                selected ? 'border-primary/55 bg-primary/12 text-primary' : 'border-border/60 text-muted-foreground hover:text-foreground/85'
              }`}
            >
              {entry.label}
              <span className="font-mono text-[9px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {[
          { id: 'all', label: 'All cities' },
          { id: 'aurelion', label: 'Aurelion' },
          { id: 'thornveil', label: 'Thornveil' },
          { id: 'stormhaven', label: 'Stormhaven' },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setCity(option.id)}
            className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] transition ${
              city === option.id ? 'border-primary/50 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground/80'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Panel className="mt-4 p-6 text-center">
          <ScrollText size={20} className="mx-auto text-primary/50" />
          <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">{active.empty}</p>
          {tab === 'available' && (
            <Link to="/city/aurelion/cathedral/board" className="btn-stone mt-4 inline-block rounded-sm px-4 py-2">
              Open a Quest Board
            </Link>
          )}
        </Panel>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {list.map((quest) => (
            <QuestCard
              key={quest.id}
              game={game}
              quest={quest}
              locked={lockedLabel(quest)}
              onAccept={tab === 'available' ? (id) => acceptQuest(id, true) : undefined}
              onAbandon={tab === 'active' ? abandonQuest : undefined}
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
        Quests in Stormhaven are recorded but sealed until that city opens.
      </p>
    </div>
  );
}
