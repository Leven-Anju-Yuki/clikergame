(() => {
    if (!document.documentElement.classList.contains("local-admin")) return;
    const drafts = document.getElementById("legalDrafts");
    if (drafts) drafts.replaceWith(drafts.content.cloneNode(true));
    const dialog = document.getElementById('legalDialog');
    const trigger = document.getElementById('legalTrigger');
    if (!dialog || !trigger) return; // Les brouillons sont dans un template inactif.
    const menu = document.getElementById('legalMenu');
    const preview = document.getElementById('legalPreview');
    const frame = document.getElementById('legalFrame');
    const external = document.getElementById('legalDocumentLink');
    function showMenu() { menu.hidden = false; preview.hidden = true; frame.removeAttribute('src'); }
    trigger.addEventListener('click', () => { showMenu(); dialog.showModal(); });
    document.getElementById('legalClose').addEventListener('click', () => dialog.close());
    document.getElementById('legalBack').addEventListener('click', () => {
        showMenu(); menu.querySelector('a').focus();
    });
    dialog.addEventListener('close', () => { frame.removeAttribute('src'); trigger.focus(); });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        frame.title = link.querySelector('strong').textContent;
        frame.src = link.href;
        external.href = link.href;
        menu.hidden = true; preview.hidden = false;
        document.getElementById('legalBack').focus();
    }));
})();
