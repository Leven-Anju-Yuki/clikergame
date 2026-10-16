(() => {
    'use strict';
    const screen = document.getElementById('startupScreen');
    const artwork = document.getElementById('startupArtwork');
    const progress = document.getElementById('startupProgress');
    const percent = document.getElementById('startupPercent');
    const status = document.getElementById('startupStatus');
    const sources = ['./assets/img/Ouverture_du_jeu/fonds_4K/05_chargement_3840x2160.jpg'];
    let completed = 0;
    let failures = 0;
    const decorations = ['./assets/img/Ouverture_du_jeu/logo/Warrenfall_logo_transparent.png', './assets/img/Ouverture_du_jeu/animations/azazel_course.gif', './assets/img/Ouverture_du_jeu/animations/carotte_course.gif'];
    const openingCount = sources.length + decorations.length;
    let total = openingCount;
    let sceneStage = false;
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    const update = value => {
        progress.value = value;
        progress.textContent = percent.textContent = value + ' %';
    };
    function load(source) {
        return new Promise(resolve => {
            const image = new Image();
            let settled = false;
            const finish = ok => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                if (!ok) failures++;
                completed++;
                update(sceneStage ? 40 + Math.round((completed - openingCount) / Math.max(1, total - openingCount) * 55) : Math.round(completed / total * 40));
                resolve(ok);
            };
            const timer = setTimeout(() => finish(false), 12000);
            image.onload = () => finish(true);
            image.onerror = () => finish(false);
            image.src = window.LapinousImages?.url(source) || source;
        });
    }
    const opening = sources.map(load);
    const decorationLoads = decorations.map(load);
    window.LapinousStartupReady = (async () => {
        await Promise.all(opening);
        await Promise.all(decorationLoads);
        status.textContent = 'Préparation de ta partie…';
    })();
    window.LapinousStartupFinish = async () => {
        await window.LapinousStartupReady;
        // The application has now rendered adoption or restored the saved room.
        // Keep the opening visible while those actual images become available.
        const images = [...document.images].filter(img => !screen.contains(img) && img.getBoundingClientRect().width && img.src);
        const backgrounds = new Set();
        document.querySelectorAll('body,#gameRoot,#gameArea,#gameArea *').forEach(node => {
            if (!node.getBoundingClientRect().width) return;
            for (const match of getComputedStyle(node).backgroundImage.matchAll(/url\(["']?(.*?)["']?\)/g)) backgrounds.add(match[1]);
        });
        const resources = [...new Set([...images.map(img => img.currentSrc || img.src), ...backgrounds])];
        sceneStage = true;
        total += resources.length;
        await Promise.all(resources.map(load));
        update(100);
        status.textContent = failures ? 'Partie prête — certaines images seront réessayées en jeu.' : 'Ton terrier est prêt !';
        await pause(350);
        screen.setAttribute('aria-busy', 'false');
        screen.hidden = true;
        window.dispatchEvent(new Event('lapinous:startup-complete'));
    };
})();
