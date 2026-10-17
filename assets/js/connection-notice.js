(() => {
    const notice = document.createElement('dialog');
    notice.id = 'connectionNotice';
    notice.setAttribute('aria-label', 'Connexion Internet interrompue');
    notice.innerHTML = '<img src="./assets/icons/error-offline.png" alt="Pas de connexion Internet. Le lien avec le terrier est interrompu."><div class="connection-actions"><button type="button" data-retry>Réessayer</button><button type="button" data-continue>Continuer hors connexion</button><p role="status"></p></div>';
    document.body.append(notice);
    notice.querySelector('[data-continue]').onclick = () => notice.close();
    notice.querySelector('[data-retry]').onclick = () => {
        if (navigator.onLine) location.reload();
        else notice.querySelector('[role=status]').textContent = 'La connexion est toujours indisponible. Tu peux continuer avec les ressources déjà chargées.';
    };
    addEventListener('offline', () => { if (!notice.open) notice.showModal(); });
    addEventListener('online', () => notice.close());
    if (!navigator.onLine) notice.showModal();
})();
