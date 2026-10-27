import React from 'react';

const CATEGORY_LABEL = {
  weapon: 'Weapon',
  armor: 'Armour',
  trinket: 'Trinket',
  potion: 'Draught',
  quest: 'Relic',
};

export default function AbilityCard({ ability, locked = false, active = false, disabled = false, onClick, footer }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`group w-full rounded-sm border p-3 text-left transition-all duration-300 ${
        active
          ? 'border-primary/60 bg-primary/10'
          : 'border-border/70 bg-black/25 hover:border-primary/40 hover:bg-black/40'
      } ${disabled ? 'opacity-45' : ''} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-heading text-sm text-foreground/95">{ability.name}</h4>
        <div className="flex shrink-0 items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {ability.cost !== undefined && <span className="text-primary/80">{ability.cost}</span>}
          {ability.cooldown ? <span>CD {ability.cooldown}</span> : null}
        </div>
      </div>
      {locked && (
        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Unlocks at level {ability.level}</p>
      )}
      <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{ability.description}</p>
      {footer}
    </button>
  );
}

export { CATEGORY_LABEL };