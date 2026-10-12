/* Limite la copie directe des illustrations ; ne constitue pas une protection anti-capture. */
(() => {
  /** Désactive seulement les actions natives sur les images, pas les liens ni les champs. */
  function blockImageAction(event) {
    if (event.target instanceof HTMLImageElement) event.preventDefault();
  }
  document.addEventListener('contextmenu', blockImageAction);
  document.addEventListener('dragstart', blockImageAction);
})();
