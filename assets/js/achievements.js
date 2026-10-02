/* Succès conservés dans la partie, y compris l'historique quotidien. */
(function (root) {
    const daily = [
        { id: 'visit', title: 'Bonjour les lapins !', metric: 'visit', target: 1, reward: 3, text: 'Revenir jouer aujourd’hui' },
        { id: 'play', title: 'Un esprit joueur', metric: 'gamesFinished', target: 1, reward: 5, text: 'Réussir un jeu du Salon ou parcourir 20 m en agilité au Jardin' },
        { id: 'boss', title: 'Le jardin est à nous', metric: 'bossesDefeated', target: 1, reward: 8, text: 'Vaincre un boss' },
        { id: 'run', title: 'On se dégourdit les pattes', metric: 'agilityPlayed', target: 1, reward: 4, text: 'Terminer un parcours d’agilité d’au moins 20 m' },
        { id: 'egg', title: 'Une nouvelle surprise', metric: 'eggsOpened', target: 1, reward: 5, text: 'Ouvrir un œuf' },
    ];
    const milestones = [
        ...[3, 10, 20, 30].map((n,i) => ({id:`collection-${n}`, title:`Une famille de ${n} lapins`, metric:'collection', target:n, reward:[15,40,90,150][i]})),
        ...[10, 25, 50, 100].map((n,i) => ({id:`level-${n}`, title:`Un compagnon au niveau ${n}`, metric:'level', target:n, reward:[15,40,90,200][i]})),
        ...[10, 50, 100].map((n,i) => ({id:`boss-${n}`, title:`${n} boss vaincus`, metric:'bossesDefeated', target:n, reward:[20,70,150][i]})),
        ...[10, 50, 100].map((n,i) => ({id:`games-${n}`, title:`${n} jeux terminés`, metric:'gamesFinished', target:n, reward:[15,50,100][i]})),
        ...[10, 50, 100].map((n,i) => ({id:`eggs-${n}`, title:`${n} œufs ouverts`, metric:'eggsOpened', target:n, reward:[15,50,100][i]})),
    ];
    function dayKey(date = new Date()) {
        return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    }
    function ensure(game, date = new Date()) {
        game.records ||= {};
        // Les anciens compteurs sont conservés ; seuls les résultats connus sont repris.
        if (game.records.gamesWon == null) {
            const lapidoku = Object.values(game.progress || {}).reduce((n,p) => n + (Number(p.minigames?.lapidoku?.completed) || 0), 0);
            game.records.gamesWon = (Number(game.records.puzzlesCompleted) || 0) + lapidoku;
        }
        const state = game.achievements ||= { days: {}, claimed: {}, peaks: {}, earnedCarrots: 0 };
        state.days ||= {}; state.claimed ||= {}; state.peaks ||= {};
        state.earnedCarrots ||= 0;
        const key = dayKey(date);
        state.days[key] ||= { counts: { visit: 1 }, claimed: {} };
        for (const entry of Object.values(state.days)) {
            entry.counts.gamesFinished = (entry.counts.gamesWon || 0) + (entry.counts.agilityPlayed || 0);
        }
        const values = { ...game.records, collection: (game.ownedSpecies || []).length,
            gamesFinished: (Number(game.records.gamesWon) || 0) + (Number(game.records.agilityPlayed) || 0),
            level: Math.max(1, ...Object.values(game.progress || {}).map(p => Number(p.currentLevel) || 1)) };
        for (const [metric,value] of Object.entries(values)) state.peaks[metric] = Math.max(Number(state.peaks[metric]) || 0, Number(value) || 0);
        return state;
    }
    function record(game, metric, amount = 1, date = new Date(), dailyAmount = amount) {
        const state = ensure(game, date);
        game.records[metric] = (Number(game.records[metric]) || 0) + amount;
        const counts = state.days[dayKey(date)].counts;
        counts[metric] = (counts[metric] || 0) + dailyAmount;
        ensure(game, date);
    }
    function list(game, date = new Date()) {
        const state = ensure(game, date), today = dayKey(date);
        const row = (def, counts, claimed, day) => ({...def, day, value: Math.min(def.target, counts[def.metric] || 0), claimed: !!claimed[def.id]});
        const todayRows = daily.map(d => row(d, state.days[today].counts, state.days[today].claimed, today));
        const pending = Object.entries(state.days).filter(([key]) => key !== today).flatMap(([key, entry]) =>
            daily.map(d => row(d, entry.counts, entry.claimed, key)).filter(r => !r.claimed && r.value >= r.target));
        // Un seul palier par famille, sans masquer une récompense encore à récupérer.
        const families = [...new Set(milestones.map(d => d.metric))];
        const permanent = families.map(metric => {
            const steps = milestones.filter(d => d.metric === metric);
            const current = steps.find(d => !state.claimed[d.id]) || steps[steps.length - 1];
            return { ...row(current, state.peaks, state.claimed, null), step: steps.indexOf(current) + 1, steps: steps.length };
        });
        return { today: todayRows, pending, permanent };
    }
    function claim(game, id, day = null, date = new Date()) {
        const state = ensure(game, date);
        const def = (day === null ? milestones : daily).find(d => d.id === id);
        const entry = day === null ? { counts: state.peaks, claimed: state.claimed } : state.days[day];
        if (!def || !entry || entry.claimed[id] || (entry.counts[def.metric] || 0) < def.target) return 0;
        entry.claimed[id] = date.toISOString();
        game.carrots = (Number(game.carrots) || 0) + def.reward;
        state.earnedCarrots += def.reward;
        return def.reward;
    }
    root.LapinousAchievements = { ensure, record, list, claim, dayKey };
})(typeof window === 'undefined' ? globalThis : window);
