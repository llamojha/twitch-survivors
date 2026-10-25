import assert from 'node:assert/strict';
import test from 'node:test';
import { RunLifecycle } from '../src/audience/RunLifecycle';
import { initSaveSystem, setRunSimulation, addCoins, getCoins, unlockPokedexEntry,
  isPokedexUnlocked, unlockStarter, isStarterUnlocked, accumulateRunStats,
  getLifetimeStats, getSaveData } from '../src/systems/SaveSystem';

test('terminal guard accepts victory or defeat only once; simulation is irreversible per run', () => {
  const run = new RunLifecycle();
  assert.equal(run.canPersist(), true);
  assert.equal(run.finish(), true);
  assert.equal(run.finish(), false);
  run.markSimulation();
  assert.equal(run.canPersist(), false);
  assert.equal(new RunLifecycle().isFinished(), false);
});

test('victories and defeats persist as distinct outcomes and older saves migrate', () => {
  const values = new Map<string, string>();
  values.set('twitch-survivors-save', JSON.stringify({ version: 2, coins: 0, powerUps: {}, pokedex: {},
    records: { bestTime: 0, bestKills: 0, bestLevel: 0 }, settings: { muted: false, quality: 'normal', vfxIntensity: 100 },
    unlockedStarters: { charmander: true }, lastRun: { starterKey: 'charmander', formName: 'Charmander',
      level: 1, kills: 0, time: 2, coinsEarned: 0, difficulty: 'hard', date: 1 },
    stats: { totalRuns: 2, totalDeaths: 2, totalKills: 0,
      bossesKilled: 0, totalDamageDealt: 0, totalCoinsEarned: 0, totalCoinsSpent: 0, totalTimePlayed: 0,
      distanceTraveled: 0, berriesCollected: 0, xpCollected: 0, bestCombo: 0, starterRuns: {},
      favoriteAttack: { name: '', damage: 0 }, highestEvolution: '' } }));
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } });
  const run = (outcome: 'defeat' | 'victory') => accumulateRunStats({ outcome, kills: 0, bossesDefeated: 0,
    damageDealt: 0, coinsEarned: 0, timePlayed: 0, distance: 0, berries: 0, xp: 0, combo: 0,
    starterKey: 'charmander', formName: 'Charmander', damageByAttack: {} });
  try {
    initSaveSystem();
    assert.equal(getSaveData().version, 3);
    assert.equal(getSaveData().lastRun?.outcome, 'defeat');
    assert.equal(getLifetimeStats().totalVictories, 0);
    run('victory');
    run('defeat');
    assert.deepEqual({ runs: getLifetimeStats().totalRuns, deaths: getLifetimeStats().totalDeaths,
      victories: getLifetimeStats().totalVictories }, { runs: 4, deaths: 3, victories: 1 });
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('test runs cannot persist coins, pokedex or unlocks; normal progression survives reload', () => {
  const values = new Map<string, string>();
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } });
  try {
    initSaveSystem();
    addCoins(25);
    const before = new Map(values);
    setRunSimulation(true);
    addCoins(100);
    unlockPokedexEntry('test-only', 'Test only', 'normal');
    unlockStarter('test-only');
    assert.deepEqual(values, before);
    setRunSimulation(false);
    assert.equal(getCoins(), 25);
    assert.equal(isPokedexUnlocked('test-only'), false);
    assert.equal(isStarterUnlocked('test-only'), false);
    addCoins(5);
    initSaveSystem();
    assert.equal(getCoins(), 30);
  } finally {
    setRunSimulation(false);
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
