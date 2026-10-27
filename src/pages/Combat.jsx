import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Coins, Sparkles } from 'lucide-react';
import { ENCOUNTERS, LOCATIONS } from '@/data/world';
import { getItem } from '@/data/items';
import { getRace } from '@/data/races';
import { useGame } from '@/context/GameProvider';
import { abilityReady, DIFFICULTY, fleeCombat, resolveAbility, startCombat } from '@/lib/combat';
import { getDerived, knownAbilities } from '@/lib/gameState';
import Panel from '@/components/ui-kit/Panel';
import StatBar from '@/components/ui-kit/StatBar';
import Sigil from '@/components/ui-kit/Sigil';

const LOG_STYLES = {
  player: 'text-primary/90',
  enemy: 'text-foreground/60',
  damage: 'text-orange-300/90',
  hurt: 'text-red-300/90',
  heal: 'text-emerald-300/90',
  buff: 'text-sky-300/85',
  debuff: 'text-violet-300/85',
  crit: 'text-amber-300',
  fall: 'text-foreground/45',
  victory: 'text-primary',
  defeat: 'text-red-400',
  info: 'text-muted-foreground',
};

function StatusPips({ statuses }) {
  if (!statuses?.length) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {statuses.map((status, index) => (
        <span
          key={`${status.type}-${index}`}
          className="rounded-sm border border-border/60 bg-black/40 px-1 py-0.5 font-mono text-[8.5px] uppercase tracking-wider text-foreground/60"
        >
          {status.type} {status.duration}
        </span>
      ))}
    </div>
  );
}

export default function Combat() {
  const { encounterId } = useParams();
  const navigate = useNavigate();
  const { character, game, awardVictory, sufferDefeat } = useGame();
  const encounter = ENCOUNTERS[encounterId];
  const [combat, setCombat] = useState(null);
  const [target, setTarget] = useState(0);
  const claimed = useRef(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (!encounter || !character) return;
    setCombat(startCombat(character, encounter, game?.settings?.difficulty || 'normal'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterId]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [combat?.log?.length]);

  useEffect(() => {
    if (!combat) return;
    if (combat.phase === 'victory' && !claimed.current) {
      claimed.current = true;
      awardVictory({
        xp: combat.rewards.xp,
        gold: combat.rewards.gold,
        items: combat.rewards.items,
        encounterId: combat.encounterId,
      });
    }
    if (combat.phase === 'defeat' && !claimed.current) {
      claimed.current = true;
      sufferDefeat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat?.phase]);

  const derived = useMemo(() => (character ? getDerived(character) : null), [character]);
  const abilities = useMemo(() => (character ? knownAbilities(character) : []), [character]);
  const race = character ? getRace(character.raceId) : null;

  if (!encounter) return <Navigate to="/map" replace />;
  if (!character || !derived) return <Navigate to="/" replace />;
  if (!combat) {
    return <div className="py-16 text-center text-[12px] uppercase tracking-[0.2em] text-muted-foreground">Steel is drawn…</div>;
  }

  const location = encounter.locationId ? LOCATIONS[encounter.locationId] : null;
  const backTo = location ? `/city/${location.cityId}/${location.id}` : '/map';

  const act = (ability, options = {}) => {
    if (combat.phase !== 'player') return;
    setCombat((prev) => resolveAbility(prev, character, ability, target, options));
  };

  const living = combat.enemies.filter((enemy) => enemy.hp > 0);
  const resolved = ['victory', 'defeat', 'fled'].includes(combat.phase);
  const loot = Object.entries(
    combat.rewards.items.reduce((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {})
  );

  return (
    <div className="animate-fade">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={13} /> Flee the field
        </button>
        <span className="font-heading text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Turn {combat.turn} · {DIFFICULTY[combat.difficulty]?.label || 'Balanced'}
        </span>
      </div>

      <h1 className="mt-2 font-heading text-xl text-foreground sm:text-2xl">{combat.encounterName}</h1>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-3">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {combat.enemies.map((enemy, index) => {
              const dead = enemy.hp <= 0;
              const selected = index === target && !dead;
              return (
                <button
                  key={enemy.uid}
                  type="button"
                  disabled={dead}
                  onClick={() => setTarget(index)}
                  className={`relative overflow-hidden rounded-sm border p-3 text-left transition ${
                    dead
                      ? 'border-border/30 bg-black/40 opacity-40'
                      : selected
                        ? 'border-primary/60 bg-primary/[0.07] shadow-[0_0_0_1px_hsl(41_58%_55%/0.25)]'
                        : 'border-border/70 bg-black/25 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-heading text-[13.5px] text-foreground">{enemy.name}</p>
                      <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                        atk {enemy.attack} · def {enemy.armor}
                      </p>
                    </div>
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                      style={{ borderColor: `${enemy.color}66`, background: `${enemy.color}18` }}
                    >
                      <Sigil name={enemy.sigil} size={16} className={dead ? 'text-foreground/30' : 'text-foreground/80'} />
                    </div>
                  </div>
                  <StatBar
                    className="mt-2"
                    value={enemy.hp}
                    max={enemy.maxHp}
                    color={dead ? 'hsl(0 0% 30%)' : 'hsl(4 58% 46%)'}
                    compact
                  />
                  <StatusPips statuses={enemy.statuses} />
                  {selected && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 font-heading text-[8px] uppercase tracking-[0.2em] text-primary/60">
                      target
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Panel className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow text-muted-foreground">Battle log</p>
              <p className="font-heading text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70">
                {living.length} standing
              </p>
            </div>
            <div ref={logRef} className="no-overscroll story-text h-40 space-y-1 overflow-y-auto pr-1 sm:h-48">
              {combat.log.map((entry) => (
                <p key={entry.id} className={`text-[12px] leading-snug ${LOG_STYLES[entry.kind] || LOG_STYLES.info}`}>
                  {entry.text}
                </p>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel className="p-3" glow>
            <div className="flex items-baseline justify-between">
              <p className="font-heading text-[13px] text-foreground">{character.name}</p>
              <p className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                Lv {character.level} {derived.class.name}
              </p>
            </div>
            <div className="mt-2 space-y-2">
              <StatBar label="Health" value={combat.playerHp} max={combat.playerMaxHp} color="hsl(4 62% 48%)" />
              <StatBar
                label={derived.resourceName}
                value={combat.playerResource}
                max={combat.playerMaxResource}
                color={derived.resourceColor}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {combat.playerShield > 0 && (
                <span className="flex items-center gap-1 rounded-sm border border-sky-400/40 bg-sky-400/10 px-1.5 py-0.5 text-[10px] text-sky-200/90">
                  <Shield size={10} /> {combat.playerShield}
                </span>
              )}
              {combat.buffs.map((buff, index) => (
                <span
                  key={`${buff.label}-${index}`}
                  className="rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-primary/85"
                >
                  {buff.label} {buff.duration}
                </span>
              ))}
              <StatusPips statuses={combat.playerStatuses} />
            </div>
          </Panel>

          <div className="space-y-1.5">
            {abilities.map((ability) => {
              const ready = abilityReady(combat, ability);
              const cooldown = combat.cooldowns[ability.id] || 0;
              return (
                <button
                  key={ability.id}
                  type="button"
                  disabled={!ready}
                  onClick={() => act(ability)}
                  className={`w-full rounded-sm border px-3 py-2.5 text-left transition ${
                    ready
                      ? 'border-border/70 bg-black/30 hover:border-primary/45 hover:bg-primary/[0.06]'
                      : 'cursor-not-allowed border-border/30 bg-black/20 opacity-45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading text-[12.5px] text-foreground/95">{ability.name}</span>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-primary/75">
                      {cooldown > 0 ? `CD ${cooldown}` : `${ability.cost} ${derived.resourceName.toLowerCase()}`}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{ability.description}</p>
                </button>
              );
            })}

            <button
              type="button"
              disabled={!abilityReady(combat, null, true)}
              onClick={() => act(race.ability, { racial: true })}
              className={`w-full rounded-sm border px-3 py-2.5 text-left transition ${
                combat.racialUsed
                  ? 'cursor-not-allowed border-border/30 bg-black/20 opacity-45'
                  : 'border-primary/40 bg-primary/[0.07] hover:bg-primary/[0.12]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-heading text-[12.5px] text-primary">
                  <Sparkles size={12} /> {race.ability.name}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-primary/60">racial · once</span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{race.ability.description}</p>
            </button>

            <button
              type="button"
              onClick={() => setCombat((prev) => fleeCombat(prev))}
              className="w-full rounded-sm border border-border/50 px-3 py-2 font-heading text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-red-500/40 hover:text-red-300"
            >
              Retreat — no rewards
            </button>
          </div>
        </div>
      </div>

      {resolved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <Panel className="w-full max-w-md p-5 animate-rise" glow>
            {combat.phase === 'victory' && (
              <>
                <p className="eyebrow text-primary">Victory</p>
                <h2 className="mt-1 font-heading text-2xl text-foreground">The field is yours</h2>
                <div className="gold-rule my-3" />
                <ul className="space-y-1.5 text-[13px]">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-mono text-primary">+{combat.rewards.xp}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gold</span>
                    <span className="flex items-center gap-1 font-mono text-primary">
                      <Coins size={12} /> +{combat.rewards.gold}
                    </span>
                  </li>
                  {loot.length > 0 && (
                    <li className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Recovered</span>
                      <span className="text-right text-[12px] text-foreground/85">
                        {loot.map(([id, qty]) => `${getItem(id)?.name || id}${qty > 1 ? ` ×${qty}` : ''}`).join(', ')}
                      </span>
                    </li>
                  )}
                </ul>
                <button
                  type="button"
                  onClick={() => navigate(backTo)}
                  className="btn-gold mt-5 w-full rounded-sm px-4 py-3"
                >
                  Return
                </button>
              </>
            )}

            {combat.phase === 'defeat' && (
              <>
                <p className="eyebrow text-red-400/80">Defeat</p>
                <h2 className="mt-1 font-heading text-2xl text-foreground">You fall</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  You wake on the Cathedral steps with a split lip and a lighter purse. The Dawn does not comment.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/city/aurelion/cathedral')}
                  className="btn-gold mt-5 w-full rounded-sm px-4 py-3"
                >
                  Awaken
                </button>
              </>
            )}

            {combat.phase === 'fled' && (
              <>
                <p className="eyebrow text-muted-foreground">Retreat</p>
                <h2 className="mt-1 font-heading text-2xl text-foreground">You take the road back</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  Nothing gained, nothing broken. The thing you left behind is still there.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(backTo)}
                  className="btn-stone mt-5 w-full rounded-sm px-4 py-3"
                >
                  Withdraw
                </button>
              </>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}