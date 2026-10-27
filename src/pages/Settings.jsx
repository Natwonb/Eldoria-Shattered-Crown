import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShieldAlert, UserX, X, Cloud, CloudUpload, CloudDownload, LogIn, Sun, Moon } from 'lucide-react';
import { useGame } from '@/context/GameProvider';
import { useAuth } from '@/lib/AuthContext';
import { DIFFICULTY } from '@/lib/combat';
import Panel from '@/components/ui-kit/Panel';

const THEME_KEY = 'eldoria.theme';

function formatWhen(value) {
  if (!value) return 'never';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function initTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved === 'dark' ? 'dark' : 'light');
  } catch {
    applyTheme('light');
  }
}

export default function Settings() {
  const navigate = useNavigate();
  const {
    game,
    hasGame,
    resetGame,
    setDifficulty,
    cloudBusy,
    cloudMeta,
    cloudError,
    conflict,
    saveToCloud,
    loadFromCloud,
    resolveConflict,
    clearCloudError,
  } = useGame();
  const { user, isAuthenticated, logout, navigateToLogin } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const difficulty = game?.settings?.difficulty || 'normal';

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const remove = () => {
    resetGame();
    navigate('/');
  };

  const deleteAccount = () => {
    resetGame();
    logout();
  };

  return (
    <div className="animate-fade">
      <Link to="/" className="flex items-center gap-2 font-heading text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground">
        <ArrowLeft size={13} /> Title screen
      </Link>

      <h1 className="mt-3 font-heading text-2xl text-foreground sm:text-3xl">Settings</h1>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <Panel className="p-4" glow>
            <p className="eyebrow text-muted-foreground">Combat difficulty</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Applies from your next battle onward.</p>
            <div className="mt-3 space-y-2">
              {Object.entries(DIFFICULTY).map(([id, config]) => {
                const selected = difficulty === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDifficulty(id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-sm border px-3 py-2.5 text-left transition ${
                      selected ? 'border-primary/55 bg-primary/[0.08]' : 'border-border/60 bg-secondary/40 hover:border-primary/30'
                    }`}
                  >
                    <div>
                      <p className={`font-heading text-[12.5px] ${selected ? 'text-primary' : 'text-foreground/85'}`}>
                        {config.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{config.note}</p>
                    </div>
                    <span
                      className={`h-2.5 w-2.5 rounded-full border ${selected ? 'border-primary bg-primary' : 'border-border'}`}
                    />
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-4" glow>
            <p className="eyebrow text-muted-foreground">Appearance</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Light parchment is the default. Dark ink halls remain optional.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 rounded-sm border px-3 py-2.5 font-heading text-[10px] uppercase tracking-[0.16em] transition ${
                  theme === 'light' ? 'border-primary/55 bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground hover:border-primary/30'
                }`}
              >
                <Sun size={13} /> Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 rounded-sm border px-3 py-2.5 font-heading text-[10px] uppercase tracking-[0.16em] transition ${
                  theme === 'dark' ? 'border-primary/55 bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground hover:border-primary/30'
                }`}
              >
                <Moon size={13} /> Dark
              </button>
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel className="p-4">
            <p className="eyebrow text-muted-foreground">Chronicle</p>
            {hasGame ? (
              <div className="mt-2 space-y-1 text-[12.5px] text-foreground/80">
                <p className="font-heading text-[13px] text-foreground">{game.character.name}</p>
                <p className="text-muted-foreground">
                  Level {game.character.level} · started {new Date(game.createdAt).toLocaleDateString()}
                </p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-primary/75">
                  Progress saves on this device after every action
                </p>
              </div>
            ) : (
              <p className="mt-2 text-[12.5px] text-muted-foreground">No chronicle in progress.</p>
            )}
          </Panel>

          <Panel className="p-4" glow>
            <p className="eyebrow flex items-center gap-1.5 text-muted-foreground">
              <Cloud size={11} /> Cloud chronicle
            </p>
            {!isAuthenticated ? (
              <div className="mt-2 space-y-2">
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                  Playing as a guest — progress stays on this device only. Sign in to sync across browsers.
                </p>
                <button
                  type="button"
                  onClick={navigateToLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-sm border border-primary/45 bg-primary/10 px-3 py-2 font-heading text-[10px] uppercase tracking-[0.16em] text-primary transition hover:bg-primary/20"
                >
                  <LogIn size={12} /> Sign in to enable cloud saves
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="truncate text-[12px] text-muted-foreground">
                  Signed in as {user?.email || 'your account'}
                </p>
                <p className="text-[12px] text-foreground/80">
                  Cloud: {cloudMeta
                    ? `${cloudMeta.character_name || 'Chronicle'} · Lv ${cloudMeta.character_level || '?'} · ${formatWhen(cloudMeta.saved_at)}`
                    : 'no cloud save yet'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Local last write: {formatWhen(game?.savedAt)}
                </p>
                {cloudError ? (
                  <p className="rounded-sm border border-destructive/35 bg-destructive/10 px-2.5 py-1.5 text-[11.5px] text-destructive">
                    {cloudError}{' '}
                    <button type="button" className="underline" onClick={clearCloudError}>
                      dismiss
                    </button>
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={cloudBusy || !hasGame}
                    onClick={() => saveToCloud()}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-sm border px-3 py-2 font-heading text-[10px] uppercase tracking-[0.16em] transition ${
                      hasGame && !cloudBusy
                        ? 'border-primary/45 text-primary hover:bg-primary/10'
                        : 'cursor-not-allowed border-border/40 text-muted-foreground/50'
                    }`}
                  >
                    <CloudUpload size={12} /> {cloudBusy ? 'Working…' : 'Save to cloud'}
                  </button>
                  <button
                    type="button"
                    disabled={cloudBusy}
                    onClick={() => loadFromCloud()}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-sm border px-3 py-2 font-heading text-[10px] uppercase tracking-[0.16em] transition ${
                      !cloudBusy
                        ? 'border-border/60 text-foreground/85 hover:border-primary/35'
                        : 'cursor-not-allowed border-border/40 text-muted-foreground/50'
                    }`}
                  >
                    <CloudDownload size={12} /> Load from cloud
                  </button>
                </div>
              </div>
            )}
          </Panel>

          <Panel className="border-destructive/30 p-4">
            <p className="eyebrow flex items-center gap-1.5 text-destructive/90">
              <ShieldAlert size={11} /> Danger
            </p>
            {!confirming ? (
              <button
                type="button"
                disabled={!hasGame}
                onClick={() => setConfirming(true)}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-sm border border-destructive/40 px-3 py-2 font-heading text-[10px] uppercase tracking-[0.16em] transition ${
                  hasGame ? 'text-destructive/90 hover:bg-destructive/10' : 'cursor-not-allowed border-border/40 text-muted-foreground/50'
                }`}
              >
                <Trash2 size={12} /> Delete chronicle
              </button>
            ) : (
              <div className="mt-2">
                <p className="text-[12px] leading-snug text-foreground/80">
                  This erases your character, quests and all world changes on this device. It cannot be undone.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={remove}
                    className="flex-1 rounded-sm border border-destructive/60 bg-destructive/15 px-3 py-2 font-heading text-[10px] uppercase tracking-[0.16em] text-destructive"
                  >
                    Erase
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="flex-1 rounded-sm border border-border/60 px-3 py-2 font-heading text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    Keep
                  </button>
                </div>
              </div>
            )}
          </Panel>

          {isAuthenticated ? (
            <Panel className="border-destructive/30 p-4">
              <p className="eyebrow flex items-center gap-1.5 text-destructive/90">
                <UserX size={11} /> Account
              </p>
              <p className="mt-1 truncate text-[12px] text-muted-foreground">
                Signed in as {user?.email || 'your account'}
              </p>
              <button
                type="button"
                onClick={() => setDeleting(true)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm border border-destructive/40 px-3 py-2 font-heading text-[10px] uppercase tracking-[0.16em] text-destructive/90 transition hover:bg-destructive/10"
              >
                <UserX size={12} /> Delete account
              </button>
            </Panel>
          ) : null}

          <Panel className="p-4">
            <p className="eyebrow text-muted-foreground">About</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Eldoria: The Shattered Crown — Chapter One. Towns are safe hubs; wilds and dungeons hold the fights.
              Local saves stay on this device; sign in for optional cloud sync.
            </p>
          </Panel>
        </div>
      </div>

      {conflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-8 backdrop-blur-sm">
          <Panel className="w-full max-w-md p-5" glow>
            <p className="eyebrow text-primary/85">Save conflict</p>
            <h2 className="mt-1.5 font-heading text-lg text-foreground">Which chronicle should win?</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/85">
              This device and your cloud account both have a save. Choose the newer story you want to keep.
            </p>
            <div className="mt-3 space-y-2 text-[12px]">
              <div className="rounded-sm border border-border/60 bg-secondary/40 px-3 py-2">
                <p className="font-heading text-[12px] text-foreground">Local</p>
                <p className="text-muted-foreground">
                  {conflict.local?.character?.name} · Lv {conflict.local?.character?.level} · {formatWhen(conflict.localAt)}
                </p>
              </div>
              <div className="rounded-sm border border-border/60 bg-secondary/40 px-3 py-2">
                <p className="font-heading text-[12px] text-foreground">Cloud</p>
                <p className="text-muted-foreground">
                  {conflict.cloud?.character?.name} · Lv {conflict.cloud?.character?.level} · {formatWhen(conflict.cloudAt)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={cloudBusy}
                onClick={() => resolveConflict('local')}
                className="flex-1 rounded-sm border border-primary/50 bg-primary/10 px-3 py-3 font-heading text-[10px] uppercase tracking-[0.16em] text-primary"
              >
                Keep local
              </button>
              <button
                type="button"
                disabled={cloudBusy}
                onClick={() => resolveConflict('cloud')}
                className="btn-stone flex-1 rounded-sm px-3 py-3"
              >
                Keep cloud
              </button>
            </div>
          </Panel>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-8 backdrop-blur-sm">
          <Panel className="w-full max-w-md p-5" glow>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow flex items-center gap-1.5 text-destructive/90">
                  <ShieldAlert size={11} /> Danger
                </p>
                <h2 className="mt-1.5 font-heading text-lg text-foreground">Delete this account?</h2>
              </div>
              <button
                type="button"
                onClick={() => setDeleting(false)}
                aria-label="Close"
                className="rounded-sm border border-border/60 p-1.5 text-muted-foreground transition hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>

            <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/85">
              Your sign-in and every chronicle tied to it — {hasGame ? `${game.character.name}, ` : ''}quests and world
              changes — are erased for good. This cannot be undone.
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              Confirming removes you from the game right away. Permanently deleting the account itself is finished
              outside the game, by whoever owns this app.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={deleteAccount}
                className="flex-1 rounded-sm border border-destructive/60 bg-destructive/15 px-3 py-3 font-heading text-[10px] uppercase tracking-[0.16em] text-destructive transition hover:bg-destructive/25"
              >
                Delete my account
              </button>
              <button
                type="button"
                onClick={() => setDeleting(false)}
                className="btn-stone flex-1 rounded-sm px-3 py-3"
              >
                Keep my account
              </button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
