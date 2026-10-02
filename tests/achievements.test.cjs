const test = require('node:test');
const assert = require('node:assert/strict');
require('../assets/js/achievements.js');
const api = globalThis.LapinousAchievements;
const beforeMidnight = new Date(2026, 9, 2, 23, 59);
const nextDay = new Date(2026, 9, 3, 0, 1);
const fresh = () => ({ carrots: 10, records: {}, ownedSpecies: ['azur'], progress: {} });

test('daily rewards reset by local date, retain unclaimed rewards and reject duplicate claims', () => {
    const game = fresh();
    api.record(game, 'gamesWon', 1, beforeMidnight);
    assert.equal(api.claim(game, 'visit', '2026-10-02', beforeMidnight), 3);
    assert.equal(api.claim(game, 'visit', '2026-10-02', beforeMidnight), 0);
    const next = api.list(game, nextDay);
    assert.equal(next.today.find(x => x.id === 'play').value, 0);
    assert.equal(next.pending.find(x => x.id === 'play').day, '2026-10-02');
    assert.equal(api.claim(game, 'play', '2026-10-02', nextDay), 5);
    assert.equal(api.claim(game, 'play', '2026-10-03', nextDay), 0);
    assert.equal(api.claim(game, 'visit', '2026-10-03', nextDay), 3);
    assert.equal(game.carrots, 21);
    assert.equal(Object.keys(game.achievements.days).length, 2);
});

test('old records survive migration and permanent rewards survive export/import', () => {
    const game = fresh();
    game.records = { bossesDefeated: 50, puzzlesCompleted: 8, customRecord: 42 };
    game.progress.azur = { currentLevel: 25, minigames: { lapidoku: { completed: 2 } } };
    api.ensure(game, beforeMidnight);
    assert.equal(game.records.gamesWon, 10);
    assert.equal(api.claim(game, 'games-10', null, beforeMidnight), 15);
    const restored = JSON.parse(JSON.stringify(game));
    assert.equal(api.claim(restored, 'games-10', null, nextDay), 0);
    assert.equal(restored.records.customRecord, 42);
    assert.equal(api.claim(restored, 'boss-50', null, nextDay), 70);
    assert.equal(api.claim(restored, 'boss-100', null, nextDay), 0);
    restored.progress.azur.currentLevel = 1;
    assert.equal(api.claim(restored, 'level-25', null, nextDay), 40);
});

test('batch openings count all eggs; short runs do not earn the daily reward', () => {
    const game = fresh();
    api.record(game, 'eggsOpened', 10, beforeMidnight);
    assert.equal(game.records.eggsOpened, 10);
    assert.equal(api.claim(game, 'egg', '2026-10-02', beforeMidnight), 5);
    api.record(game, 'agilityPlayed', 1, beforeMidnight, 0);
    assert.equal(api.claim(game, 'run', '2026-10-02', beforeMidnight), 0);
    api.record(game, 'agilityPlayed', 1, beforeMidnight, 1);
    assert.equal(api.claim(game, 'run', '2026-10-02', beforeMidnight), 4);
    assert.equal(game.records.agilityPlayed, 2);
    assert.equal(api.claim(game, 'unknown', null, beforeMidnight), 0);
});

test('garden activity counts in game goals and only the current milestone is shown', () => {
    const game = fresh();
    game.records.agilityPlayed = 9;
    api.record(game, 'agilityPlayed', 1, beforeMidnight, 1);
    assert.equal(api.claim(game, 'play', '2026-10-02', beforeMidnight), 5);
    let rows = api.list(game, beforeMidnight).permanent;
    assert.equal(rows.length, 5);
    assert.equal(rows.find(r => r.metric === 'gamesFinished').id, 'games-10');
    assert.equal(api.claim(game, 'games-10', null, beforeMidnight), 15);
    rows = api.list(game, beforeMidnight).permanent;
    assert.equal(rows.find(r => r.metric === 'gamesFinished').id, 'games-50');
    assert.equal(rows.find(r => r.metric === 'gamesFinished').value, 10);
    api.record(game, 'gamesWon', 90, beforeMidnight);
    api.claim(game, 'games-50', null, beforeMidnight);
    api.claim(game, 'games-100', null, beforeMidnight);
    const final = api.list(game, beforeMidnight).permanent.find(r => r.metric === 'gamesFinished');
    assert.equal(final.id, 'games-100');
    assert.equal(final.claimed, true);
    assert.equal(Object.keys(game.achievements.claimed).length, 3);
});
