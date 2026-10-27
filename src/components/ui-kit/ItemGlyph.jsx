import React from 'react';
import { RARITY } from '@/data/items';
import Sigil from './Sigil';

export default function ItemGlyph({ item, size = 'md', equipped = false }) {
  if (!item) return null;
  const rarity = RARITY[item.rarity] || RARITY.common;
  const box = size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 26 : 20;
  return (
    <div
      className={`relative flex ${box} shrink-0 items-center justify-center rounded-sm border`}
      style={{
        borderColor: `${rarity.color}66`,
        background: `radial-gradient(circle at 35% 25%, ${rarity.color}26, rgba(10,8,6,0.9) 70%)`,
        boxShadow: equipped ? `inset 0 0 0 1px ${rarity.color}88, 0 0 18px -6px ${rarity.color}88` : 'none',
      }}
    >
      <Sigil name={item.icon} size={iconSize} className="text-foreground/85" />
    </div>
  );
}