import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { RACES } from '@/data/races';
import { CLASSES } from '@/data/classes';
import { ART } from '@/data/art';
import { useGame } from '@/context/GameProvider';
import { APPEARANCE_OPTIONS, ATTR_LABELS } from '@/lib/gameState';
import Panel from '@/components/ui-kit/Panel';
import AbilityCard from '@/components/ui-kit/AbilityCard';
import Sigil from '@/components/ui-kit/Sigil';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const STEPS = ['Blood', 'Calling', 'Name & Likeness', 'Oath'];

export default function CharacterCreation() {
  const navigate = useNavigate();
  const { newGame, hasGame } = useGame();
  const [step, setStep] = useState(0);
  const [raceId, setRaceId] = useState('human');
  const [classId, setClassId] = useState('warrior');
  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');
  const [appearance, setAppearance] = useState({
    build: APPEARANCE_OPTIONS.build[0],
    hair: APPEARANCE_OPTIONS.hair[0],
    eyes: APPEARANCE_OPTIONS.eyes[0],
    mark: APPEARANCE_OPTIONS.mark[0],
  });

  const race = useMemo(() => RACES.find((r) => r.id === raceId), [raceId]);
  const cls = useMemo(() => CLASSES.find((c) => c.id === classId), [classId]);
  const canFinish = name.trim().length >= 2;

  const begin = () => {
    if (!canFinish) return;
    newGame({ name, raceId, classId, appearance, biography });
    navigate('/city/aurelion/cathedral');
  };

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={14} /> Title
          </button>
          <p className="eyebrow text-primary/70">Character Creation</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(index)}
                className={`flex items-center gap-2 rounded-sm border px-2.5 py-1.5 font-heading text-[9.5px] uppercase tracking-[0.16em] transition ${
                  index === step
                    ? 'border-primary/50 bg-primary/12 text-primary'
                    : index < step
                      ? 'border-border/60 text-foreground/70 hover:border-primary/30'
                      : 'border-border/40 text-muted-foreground/60 hover:border-primary/20'
                }`}
              >
                {index < step ? <Check size={11} /> : <span className="font-mono">{index + 1}</span>}
                {label}
              </button>
              {index < STEPS.length - 1 && <span className="h-px w-3 bg-border/60" />}
            </div>
          ))}
        </div>

        {hasGame && (
          <p className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-foreground/70">
            Beginning a new chronicle will overwrite your current save.
          </p>
        )}

        {step === 0 && (
          <div className="mt-6 animate-fade">
            <h1 className="font-heading text-2xl text-foreground">Choose your blood</h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Every people carries a gift and a grudge. Both will matter.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {RACES.map((option) => {
                const selected = option.id === raceId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRaceId(option.id)}
                    className={`hover-lift rounded-sm border p-4 text-left ${
                      selected
                        ? 'border-primary/60 bg-primary/[0.07] shadow-[0_0_0_1px_hsl(41_58%_55%/0.25)]'
                        : 'border-border/70 bg-black/25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-[15px] text-foreground">{option.name}</h3>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: option.color, boxShadow: `0 0 10px ${option.color}` }}
                      />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-primary/70">{option.epithet}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(option.bonuses).map(([attr, value]) => (
                        <span
                          key={attr}
                          className="rounded-sm border border-border/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
                        >
                          +{value} {ATTR_LABELS[attr]}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-[12px] leading-snug text-foreground/75">
                      <span className="text-primary/80">{option.passive.name}.</span> {option.passive.description}
                    </p>
                    <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                      <span className="font-heading uppercase tracking-[0.14em] text-muted-foreground/80">
                        {option.ability.name}
                      </span>{' '}
                      — {option.ability.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 animate-fade">
            <h1 className="font-heading text-2xl text-foreground">Choose your calling</h1>
            <p className="mt-1 text-[14px] text-muted-foreground">Seven paths, seven abilities each. You learn them as you rise.</p>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                {CLASSES.map((option) => {
                  const selected = option.id === classId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setClassId(option.id)}
                      className={`flex items-center gap-3 rounded-sm border px-3.5 py-3 text-left transition ${
                        selected ? 'border-primary/60 bg-primary/[0.07]' : 'border-border/70 bg-black/25 hover:border-primary/30'
                      }`}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                        style={{ borderColor: `${option.color}66`, background: `${option.color}18` }}
                      >
                        <Sigil name={option.id === 'ranger' ? 'bow' : option.id === 'rogue' ? 'dagger' : option.id === 'mage' ? 'staff' : option.id === 'cleric' ? 'sun' : option.id === 'paladin' ? 'shield' : option.id === 'warlock' ? 'flame' : 'sword'} size={15} className="text-foreground/85" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading text-[13px] text-foreground">{option.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {option.role} · {option.resource.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Panel className="p-4" glow>
                <div className="flex items-baseline justify-between">
                  <h2 className="font-heading text-lg text-foreground">{cls.name}</h2>
                  <span className="font-heading text-[10px] uppercase tracking-[0.18em] text-primary/80">
                    {cls.role}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{cls.description}</p>
                <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
                  {Object.entries(cls.base).map(([attr, value]) => (
                    <div key={attr} className="rounded-sm border border-border/60 bg-black/30 py-1.5">
                      <p className="font-heading text-[13px] text-primary">{value + (race.bonuses[attr] || 0)}</p>
                      <p className="text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">{ATTR_LABELS[attr]}</p>
                    </div>
                  ))}
                </div>
                <div className="gold-rule my-3" />
                <p className="eyebrow mb-2 text-muted-foreground">Seven abilities</p>
                <div className="no-overscroll max-h-72 space-y-1.5 overflow-y-auto pr-1">
                  {cls.abilities.map((ability) => (
                    <AbilityCard key={ability.id} ability={ability} />
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 animate-fade">
            <h1 className="font-heading text-2xl text-foreground">Your name and likeness</h1>
            <p className="mt-1 text-[14px] text-muted-foreground">Eldoria will use both against you, eventually.</p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Panel className="p-4">
                <Label htmlFor="char-name" className="eyebrow text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="char-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Warden of nothing in particular"
                  maxLength={32}
                  className="mt-2 border-border/70 bg-black/40 font-heading tracking-wide"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {canFinish ? 'A name worth remembering.' : 'At least two letters. The Dawn is strict about records.'}
                </p>

                <div className="gold-rule my-4" />

                {Object.entries(APPEARANCE_OPTIONS).map(([key, options]) => (
                  <div key={key} className="mb-3">
                    <p className="eyebrow mb-1.5 text-muted-foreground">{key}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setAppearance((prev) => ({ ...prev, [key]: option }))}
                          className={`rounded-sm border px-2.5 py-1 text-[11.5px] transition ${
                            appearance[key] === option
                              ? 'border-primary/60 bg-primary/12 text-primary'
                              : 'border-border/60 text-foreground/75 hover:border-primary/30'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </Panel>

              <Panel className="p-4">
                <Label htmlFor="char-bio" className="eyebrow text-muted-foreground">
                  Biography
                </Label>
                <Textarea
                  id="char-bio"
                  value={biography}
                  onChange={(event) => setBiography(event.target.value)}
                  rows={9}
                  maxLength={600}
                  placeholder="Where were you when the bell first rang? What did it cost you?"
                  className="mt-2 resize-none border-border/70 bg-black/40 text-[14px] leading-relaxed"
                />
                <p className="mt-1.5 text-right font-mono text-[10px] text-muted-foreground">{biography.length}/600</p>
                <div className="rounded-sm border border-border/50 bg-black/25 p-3">
                  <p className="eyebrow mb-1 text-primary/70">Preview</p>
                  <p className="text-[12.5px] leading-relaxed text-foreground/75">
                    {name.trim() || 'A wanderer'} — {race.name} {cls.name}.{' '}
                    {appearance.build} of build, {appearance.hair.toLowerCase()} hair, {appearance.eyes.toLowerCase()} eyes.{' '}
                    {appearance.mark !== 'None' ? `${appearance.mark}.` : ''}
                  </p>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 animate-fade">
            <h1 className="font-heading text-2xl text-foreground">The oath</h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Aurelion is nine nights into a bell it cannot explain. You arrive at the Cathedral steps.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <Panel className="overflow-hidden" glow>
                <div className="relative h-40">
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${ART.cathedral})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0907] via-[#0b0907]/40 to-transparent" />
                </div>
                <div className="p-4">
                  <p className="eyebrow text-primary/80">{race.epithet}</p>
                  <h2 className="mt-1 font-heading text-2xl text-foreground">{name.trim() || 'Nameless Wanderer'}</h2>
                  <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                    Level 1 · {race.name} {cls.name}
                  </p>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/75">
                    {biography.trim() || `${appearance.build} of build, ${appearance.hair.toLowerCase()} hair, ${appearance.eyes.toLowerCase()} eyes. No story given — the city will write one for you.`}
                  </p>
                  <div className="gold-rule my-3" />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-sm border border-border/60 bg-black/25 p-2.5">
                      <p className="eyebrow text-muted-foreground">Passive</p>
                      <p className="mt-1 font-heading text-[12px] text-foreground">{race.passive.name}</p>
                      <p className="text-[11px] leading-snug text-muted-foreground">{race.passive.description}</p>
                    </div>
                    <div className="rounded-sm border border-border/60 bg-black/25 p-2.5">
                      <p className="eyebrow text-muted-foreground">Racial ability</p>
                      <p className="mt-1 font-heading text-[12px] text-foreground">{race.ability.name}</p>
                      <p className="text-[11px] leading-snug text-muted-foreground">{race.ability.description}</p>
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel className="p-4">
                <p className="eyebrow text-primary/80">You begin with</p>
                <ul className="mt-2 space-y-1.5 text-[13px] text-foreground/80">
                  <li className="flex justify-between border-b border-border/40 pb-1.5">
                    <span>Health</span>
                    <span className="font-mono text-primary">45 + vitality</span>
                  </li>
                  <li className="flex justify-between border-b border-border/40 pb-1.5">
                    <span>{cls.resource.name}</span>
                    <span className="font-mono text-primary">{cls.resource.regen} / turn</span>
                  </li>
                  <li className="flex justify-between border-b border-border/40 pb-1.5">
                    <span>Gold</span>
                    <span className="font-mono text-primary">35</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Abilities known</span>
                    <span className="font-mono text-primary">
                      {cls.abilities.filter((a) => a.level === 1).length} of 7
                    </span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={begin}
                  disabled={!canFinish}
                  className={`btn-gold mt-5 flex w-full items-center justify-center gap-2 rounded-sm px-4 py-3.5 ${
                    canFinish ? '' : 'cursor-not-allowed opacity-40'
                  }`}
                >
                  <Sparkles size={14} /> Enter Aurelion
                </button>
                <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Progress saves automatically
                </p>
              </Panel>
            </div>
          </div>
        )}

        <div className="mt-7 flex items-center justify-between border-t border-border/50 pt-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`btn-stone flex items-center gap-2 rounded-sm px-4 py-2.5 ${step === 0 ? 'cursor-not-allowed opacity-30' : ''}`}
          >
            <ArrowLeft size={13} /> Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              className="btn-gold flex items-center gap-2 rounded-sm px-5 py-2.5"
            >
              Continue <ArrowRight size={13} />
            </button>
          ) : (
            <span className="font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {race.name} · {cls.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}