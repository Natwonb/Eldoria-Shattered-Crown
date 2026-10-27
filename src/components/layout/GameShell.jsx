import React from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Compass, ScrollText, Backpack, User, Sun, Settings as SettingsIcon, Coins } from 'lucide-react';
import { useGame } from '@/context/GameProvider';
import { getDerived, xpPercent } from '@/lib/gameState';
import { getRace } from '@/data/races';
import { getClass } from '@/data/classes';
import { ART } from '@/data/art';
import StatBar from '@/components/ui-kit/StatBar';
import NoticeBanner from '@/components/ui-kit/NoticeBanner';
import { initialsOf } from '@/components/ui-kit/NpcPortrait';

const NAV = [
  { to: '/map', label: 'World', Icon: Compass },
  { to: '/journal', label: 'Journal', Icon: ScrollText },
  { to: '/inventory', label: 'Pack', Icon: Backpack },
  { to: '/character', label: 'Hero', Icon: User },
  { to: '/events', label: 'Chronicle', Icon: Sun },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
];

export default function GameShell() {
  const { game, character, notice, dismissNotice } = useGame();
  const location = useLocation();

  if (!game || !character) return <Navigate to="/" replace />;

  const derived = getDerived(character);
  const race = getRace(character.raceId);
  const cls = getClass(character.classId);

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-[0.13]"
        style={{ backgroundImage: `url(${ART.title})` }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      <NoticeBanner notice={notice} onDismiss={dismissNotice} />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-[#0b0907]/88 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-5 sm:px-6">
          <Link to="/map" className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40"
              style={{ background: 'radial-gradient(circle at 32% 24%, hsl(41 60% 55% / 0.25), rgba(12,10,8,1) 72%)' }}
            >
              <span className="font-heading text-[11px] text-primary/90">{initialsOf(character.name)}</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-[13px] leading-tight text-foreground/95">{character.name}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Lv {character.level} · {race.name} {cls.name}
              </p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
            <div className="w-28 shrink-0">
              <StatBar value={character.hp} max={derived.maxHp} color="hsl(4 62% 48%)" compact label="HP" />
            </div>
            <div className="w-28 shrink-0">
              <StatBar
                value={derived.maxResource}
                max={derived.maxResource}
                color={derived.resourceColor}
                compact
                label={derived.resourceName}
              />
            </div>
            <div className="w-24 shrink-0">
              <StatBar value={xpPercent(character)} max={100} color="hsl(41 58% 55%)" compact label="XP" />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5 text-primary">
            <Coins size={14} />
            <span className="font-mono text-xs">{character.gold ?? 0}</span>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-6xl items-center gap-1 px-4 pb-2 sm:px-6 md:flex">
          {NAV.map(({ to, label, Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-sm px-3 py-1.5 font-heading text-[11px] uppercase tracking-[0.18em] transition ${
                  active ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground/90'
                }`}
              >
                <Icon size={13} strokeWidth={1.6} />
                {label}
              </NavLink>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-14">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-[#0b0907]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="flex items-stretch justify-between px-1">
          {NAV.map(({ to, label, Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 font-heading text-[9px] uppercase tracking-[0.12em] transition ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon size={17} strokeWidth={1.6} />
                {label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}