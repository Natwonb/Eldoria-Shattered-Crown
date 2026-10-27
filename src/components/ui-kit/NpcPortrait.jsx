import React from 'react';
import { getRace } from '@/data/races';
import { getClass } from '@/data/classes';
import Sigil from './Sigil';

const CLASS_SIGIL = {
  warrior: 'sword',
  mage: 'staff',
  rogue: 'dagger',
  cleric: 'sun',
  ranger: 'bow',
  paladin: 'shield',
  warlock: 'flame',
};

export function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function NpcPortrait({ npc, size = 96, className = '' }) {
  if (!npc) return null;
  const cls = getClass(npc.classId);
  const race = getRace(npc.raceId);
  if (npc.portrait) {
    return (
      <img
        src={npc.portrait}
        alt={npc.name}
        width={size}
        height={size}
        className={`rounded-full border-2 object-cover ${className}`}
        style={{ borderColor: `${npc.color}88`, width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full border-2 ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: `${npc.color}77`,
        background: `radial-gradient(circle at 32% 24%, ${npc.color}33 0%, rgba(12,10,8,1) 72%)`,
        boxShadow: `inset 0 0 24px ${npc.color}22, 0 12px 30px -18px #000`,
      }}
      title={`${race.name} ${cls.name}`}
    >
      <span
        className="font-heading tracking-[0.12em]"
        style={{ fontSize: size * 0.32, color: `${npc.color}dd` }}
      >
        {initialsOf(npc.name)}
      </span>
      <span
        className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full border bg-[#0d0b08]"
        style={{
          width: size * 0.36,
          height: size * 0.36,
          borderColor: `${npc.color}66`,
        }}
      >
        <Sigil name={CLASS_SIGIL[npc.classId]} size={size * 0.17} className="text-primary/90" />
      </span>
    </div>
  );
}