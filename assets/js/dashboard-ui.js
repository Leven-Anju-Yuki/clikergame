2/* Recherche et sélection d’images du Dashboard, sans modifier le manifeste à la main. */
(() => {
  const normalized = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  /** Recherche dans les cartes, tableaux ou champs de l’accordéon, en conservant le filtre événement. */
  function filter(section) {
    const query = normalized(section.querySelector(':scope > .dashboard-section-search input')?.value || '');
    let units = [...section.querySelectorAll('.puzzle-admin-card, .companion-group')];
    if (!units.length) units = [...section.querySelectorAll('tbody > tr')];
    if (!units.length) units = [...section.querySelectorAll('label:not(.dashboard-section-search), .chart-container')];
    const event = section.querySelector('#puzzleEventFilter')?.value;
    for (const unit of units) {
      const text = unit.textContent + ' ' + [...unit.querySelectorAll('input:not([type=file]),select')].map(input => input.value).join(' ');
      const events = [...unit.querySelectorAll('[data-puzzle-event]:checked')].map(input => input.value);
      const eventMatches = !unit.hasAttribute('data-puzzle-index') || !event || (event === 'none' ? !events.length : events.includes(event));
      unit.hidden = !normalized(text).includes(query) || !eventMatches;
      if (unit.classList.contains('companion-group')) {
        for (const row of unit.querySelectorAll('tbody > tr')) row.hidden = query && !normalized(row.textContent + ' ' + [...row.querySelectorAll('input')].map(input => input.value).join(' ')).includes(query) && !normalized(unit.querySelector('summary').textContent).includes(query);
        if (query && !unit.hidden) unit.open = true;
      }
    }
  }

  /** Le clic sur une vignette coche son entrée native ; la case reste accessible au clavier. */
  function enhanceSpecies(picker) {
    if (picker.dataset.searchReady || !picker.querySelector('.puzzle-species-menu')) return;
    picker.dataset.searchReady = 'true';
    const search = document.createElement('input'); search.type = 'search'; search.placeholder = 'Rechercher un lapin par nom'; search.className = 'puzzle-species-search'; search.setAttribute('aria-label', search.placeholder);
    picker.querySelector('.puzzle-species-menu').prepend(search);
    search.addEventListener('input', () => picker.querySelectorAll('.puzzle-species-option').forEach(option => { option.hidden = !normalized(option.textContent).includes(normalized(search.value)); }));
  }

  /** Le navigateur masque les chemins absolus : on choisit le fichier puis son dossier assets. */
  function enhanceImage(input) {
    if (input.dataset.imagePickerReady) return;
    input.dataset.imagePickerReady = 'true';
    const wrapper = document.createElement('div'); wrapper.className = 'dashboard-image-picker';
    input.replaceWith(wrapper); wrapper.append(input);
    const browse = document.createElement('button'); browse.type = 'button'; browse.textContent = 'Parcourir';
    const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.hidden = true;
    const folder = document.createElement('select'); folder.className = 'dashboard-image-folder'; folder.setAttribute('aria-label', 'Dossier de l’image dans assets'); folder.hidden = true;
    const defaults = input.hasAttribute('data-puzzle-field') ? 'assets/img/puzzle/de_base' : input.hasAttribute('data-item-field') ? 'assets/img/magasin/aliments' : input.closest('#bossTable') ? 'assets/img/boss' : 'assets/img/lapins_jouables/sans_evenements';
    const current = input.value.replace(/^\.\//, '').split('/').slice(0, -1).join('/');
    const folders = [...new Set([defaults, current, ...Object.keys(window.LapinousImageManifest || {}).map(key => key.split('/').slice(0, -1).join('/'))])].filter(value => value.startsWith('assets/img/')).sort();
    folders.forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; folder.append(option); }); folder.value = current || defaults;
    const hint = document.createElement('small'); hint.textContent = 'Choisis le dossier où tu as placé le fichier dans assets/img.'; hint.hidden = true;
    wrapper.append(browse, file, folder, hint);
    browse.addEventListener('click', () => file.click());
    const update = () => {
      if (!file.files[0]) return;
      input.value = folder.value + '/' + file.files[0].name;
      input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
      const preview = input.closest('.puzzle-admin-card')?.querySelector('.catalog-card-summary img') || input.closest('td')?.querySelector('img'); if (preview) preview.src = input.value;
    };
    file.addEventListener('change', () => {
      if (!file.files[0]) return;
      const matches = Object.keys(window.LapinousImageManifest || {}).filter(key => key.split('/').pop() === file.files[0].name);
      if (matches.length === 1) folder.value = matches[0].split('/').slice(0, -1).join('/');
      folder.hidden = false; hint.hidden = false; update();
    });
    folder.addEventListener('change', update);
  }

  /** Prépare les contrôles après les rendus asynchrones sans recréer leurs gestionnaires. */
  function enhance() {
    document.querySelectorAll('.dashboard-accordion > .dash-section').forEach(section => {
      if (!section.dataset.searchReady) {
        section.dataset.searchReady = 'true';
        const label = document.createElement('label'); label.className = 'dashboard-section-search'; label.textContent = 'Rechercher dans cette section';
        const input = document.createElement('input'); input.type = 'search'; input.placeholder = 'Nom, identifiant, propriété…'; label.append(input); section.prepend(label);
        input.addEventListener('input', () => filter(section)); section.addEventListener('change', () => filter(section));
      }
      filter(section);
    });
    document.querySelectorAll('.puzzle-species-dropdown').forEach(enhanceSpecies);
    document.querySelectorAll('[data-puzzle-field="image"],[data-item-field="image"],[data-recipe-field="image"],[data-field="faceImg"],[data-field="coteImg"],input[data-role]:not([type=checkbox])').forEach(input => {
      if (input.hasAttribute('data-role') && !/\.(png|gif|webp|jpe?g|svg)$/i.test(input.value)) return;
      enhanceImage(input);
    });
  }
  let queued = false;
  function schedule() { if (queued) return; queued = true; queueMicrotask(() => { queued = false; enhance(); }); }
  document.addEventListener('DOMContentLoaded', () => { enhance(); new MutationObserver(schedule).observe(document.querySelector('main'), { childList: true, subtree: true }); });
})();
