import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Sparkles, Target } from 'lucide-react';
import { getNpc } from '@/data/npcs';
import { getClass } from '@/data/classes';
import { getRace } from '@/data/races';
import { QUESTS } from '@/data/quests';
import { useGame } from '@/context/GameProvider';
import Panel from '@/components/ui-kit/Panel';
import NpcPortrait from '@/components/ui-kit/NpcPortrait';
import AbilityCard from '@/components/ui-kit/AbilityCard';
import { questStatus } from '@/lib/gameEngine';

function bondLabel(value) {
  if (value >= 7) return 'Bonded';
  if (value >= 4) return 'Trusted';
  if (value >= 1) return 'Warm';
  if (value === 0) return 'Stranger';
  if (value >= -3) return 'Wary';
  return 'Hostile';
}

/** Context gates for dialogue choices. All listed conditions must pass. */
function choiceVisible(choice, game, npc) {
  if (!choice) return false;
  const character = game?.character || {};
  const flags = game?.flags || {};
  const relationships = game?.relationships || {};
  const bond = relationships[npc.id] || 0;

  if (choice.requiresFlag && !flags[choice.requiresFlag]) return false;
  if (choice.requiresNoFlag && flags[choice.requiresNoFlag]) return false;
  if (choice.ifRace && character.raceId !== choice.ifRace) return false;
  if (choice.ifClass && character.classId !== choice.ifClass) return false;
  if (choice.ifNotRace && character.raceId === choice.ifNotRace) return false;
  if (choice.ifNotClass && character.classId === choice.ifNotClass) return false;
  if (typeof choice.minRelationship === 'number' && bond < choice.minRelationship) return false;
  if (typeof choice.maxRelationship === 'number' && bond > choice.maxRelationship) return false;

  if (choice.requiresQuest) {
    const status = questStatus(game, choice.requiresQuest);
    const want = choice.questStatus || 'active';
    if (status !== want) return false;
  }
  if (choice.hideIfQuest) {
    const status = questStatus(game, choice.hideIfQuest);
    if (status === 'active' || status === 'completed') return false;
  }
  if (choice.onlyIfQuestAvailable) {
    if (questStatus(game, choice.onlyIfQuestAvailable) !== 'available') return false;
  }
  if (choice.onlyIfQuestActive) {
    if (questStatus(game, choice.onlyIfQuestActive) !== 'active') return false;
  }
  if (choice.onlyIfQuestCompleted) {
    if (questStatus(game, choice.onlyIfQuestCompleted) !== 'completed') return false;
  }
  return true;
}

export default function Dialogue() {
  const { npcId } = useParams();
  const navigate = useNavigate();
  const { game, talkTo, changeRelationship, applyFlag, grantItem, acceptQuest } = useGame();
  const npc = getNpc(npcId);
  const [nodeId, setNodeId] = useState(npc?.dialogue?.start);
  const greeted = useRef(false);

  useEffect(() => {
    if (!npc || greeted.current) return;
    greeted.current = true;
    talkTo(npc.id);
  }, [npc, talkTo]);

  if (!npc) return <Navigate to="/map" replace />;

  const cls = getClass(npc.classId);
  const race = getRace(npc.raceId);
  const node = npc.dialogue.nodes[nodeId] || npc.dialogue.nodes[npc.dialogue.start];
  const relationship = game.relationships?.[npc.id] || 0;
  const memories = (npc.remembers || []).filter((memory) => game.flags?.[memory.flag]);
  const offeredQuests = QUESTS.filter((quest) => quest.giver === npc.id);

  const visibleChoices = useMemo(
    () => (node?.choices || []).filter((choice) => choiceVisible(choice, game, npc)),
    [node, game, npc]
  );

  const leave = () => {
    if (npc.locationId) navigate(`/city/${npc.cityId}/${npc.locationId}`);
    else navigate('/map');
  };

  const choose = (choice) => {
    if (choice.relationship) changeRelationship(npc.id, choice.relationship);
    if (choice.flag) applyFlag(choice.flag);
    if (choice.item) grantItem(choice.item, 1);
    if (choice.quest) acceptQuest(choice.quest, true);
    if (choice.next === '__end') {
      leave();
      return;
    }
    setNodeId(choice.next);
  };

  return (
    <div className="animate-fade">
      <button
        type="button"
        onClick={leave}
        className="flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={13} /> Leave the conversation
      </button>

      <div className="mt-3 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-3">
          <Panel className="p-4" glow>
            <div className="flex items-start gap-3">
              <NpcPortrait npc={npc} size={76} />
              <div className="min-w-0">
                <h1 className="font-heading text-xl leading-tight text-foreground">{npc.name}</h1>
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary/75">{npc.title}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {race.name} · {cls.name}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 rounded-sm border border-border/60 bg-secondary/50 px-2.5 py-1.5">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <Heart size={11} className="text-primary/80" /> Bond
              </span>
              <span className="font-heading text-[11px] uppercase tracking-[0.16em] text-primary">
                {bondLabel(relationship)} · {relationship > 0 ? `+${relationship}` : relationship}
              </span>
            </div>

            <p className="story-text mt-3 text-[12.5px] leading-relaxed text-foreground/75">{npc.bio}</p>

            <div className="gold-rule my-3" />
            <p className="eyebrow text-muted-foreground">Bearing</p>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{npc.personality}</p>
            <p className="eyebrow mt-3 text-muted-foreground">What they want</p>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{npc.goal}</p>

            {memories.length > 0 && (
              <>
                <div className="gold-rule my-3" />
                <p className="eyebrow text-primary/80">They remember</p>
                <ul className="mt-1.5 space-y-1">
                  {memories.map((memory) => (
                    <li key={memory.flag} className="flex gap-2 text-[12px] leading-snug text-foreground/75">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                      {memory.text}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>

          <Panel className="p-3">
            <p className="eyebrow mb-2 flex items-center gap-1.5 text-muted-foreground">
              <Sparkles size={11} className="text-primary/70" /> Their arts · {cls.resource.name}
            </p>
            <div className="no-overscroll max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {cls.abilities.slice(0, 5).map((ability) => (
                <AbilityCard key={ability.id} ability={ability} locked={false} />
              ))}
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Known ties: {(npc.relations || []).map((relation) => relation.name).join(' · ')}
            </p>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel className="relative overflow-hidden p-5" glow>
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rune-circle" />
            <p className="eyebrow text-primary/70">{npc.name} speaks</p>
            <p className="mt-3 font-body text-[17px] leading-relaxed text-foreground/90">
              &ldquo;{node.text}&rdquo;
            </p>

            <div className="mt-5 space-y-2">
              {visibleChoices.length === 0 && (
                <button
                  type="button"
                  onClick={leave}
                  className="group flex w-full items-start gap-3 rounded-sm border border-border/70 bg-secondary/40 px-3.5 py-2.5 text-left transition hover:border-primary/45"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 border border-primary/60 bg-primary/20" />
                  <span className="text-[13.5px] leading-snug text-foreground/90">I should go.</span>
                </button>
              )}
              {visibleChoices.map((choice, index) => {
                const quest = choice.quest ? QUESTS.find((q) => q.id === choice.quest) : null;
                const alreadyHave = quest ? questStatus(game, quest.id) !== 'available' : false;
                return (
                  <button
                    key={`${nodeId}-${index}`}
                    type="button"
                    onClick={() => choose(choice)}
                    className="group flex w-full items-start gap-3 rounded-sm border border-border/70 bg-secondary/40 px-3.5 py-2.5 text-left transition hover:border-primary/45 hover:bg-primary/[0.06]"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 border border-primary/60 bg-primary/20 transition group-hover:bg-primary/60" />
                    <span className="min-w-0">
                      <span className="block text-[13.5px] leading-snug text-foreground/90">{choice.text}</span>
                      {quest && (
                        <span className={`mt-0.5 block text-[10px] uppercase tracking-[0.16em] ${alreadyHave ? 'text-muted-foreground' : 'text-primary/80'}`}>
                          {alreadyHave ? 'Quest already in your journal' : `Quest · ${quest.title}`}
                        </span>
                      )}
                      {choice.relationship > 0 && (
                        <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-emerald-700/80">
                          regard rises
                        </span>
                      )}
                      {choice.relationship < 0 && (
                        <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-red-700/80">
                          regard falls
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {offeredQuests.length > 0 && (
            <Panel className="p-3">
              <p className="eyebrow flex items-center gap-1.5 text-muted-foreground">
                <Target size={11} className="text-primary/70" /> What they are asking
              </p>
              <ul className="mt-2 space-y-1.5">
                {offeredQuests.map((quest) => {
                  const status = questStatus(game, quest.id);
                  return (
                    <li key={quest.id} className="flex items-start justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0">
                      <div>
                        <p className="text-[12.5px] text-foreground/85">{quest.title}</p>
                        <p className="text-[11px] leading-snug text-muted-foreground">{quest.summary}</p>
                      </div>
                      <span className="shrink-0 font-heading text-[9px] uppercase tracking-[0.16em] text-primary/70">
                        {status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}

          {(npc.relations || []).length > 0 && (
            <Panel className="p-3">
              <p className="eyebrow text-muted-foreground">Who they know</p>
              <ul className="mt-2 space-y-1.5">
                {npc.relations.map((relation) => (
                  <li key={relation.name} className="text-[12px] leading-snug text-muted-foreground">
                    <span className="font-heading text-[11.5px] uppercase tracking-[0.12em] text-foreground/80">
                      {relation.name}.
                    </span>{' '}
                    {relation.text}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
