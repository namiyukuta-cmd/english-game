(() => {
  'use strict';
  const panels = [...document.querySelectorAll('.editor-sheet')];
  let active = null;
  function closePanels() { if (active?.open) active.close(); active = null; }
  function openPanel(id) {
    const panel = document.getElementById(id);
    if (!panel || !panels.includes(panel) || (active === panel && panel.open)) return;
    closePanels(); active = panel; panel.showModal();
    const body = panel.querySelector('.sheet-body'); body.scrollTop = 0;
  }
  document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel)));
  document.querySelectorAll('[data-close-panel]').forEach(button => button.addEventListener('click', closePanels));
  document.querySelectorAll('[data-return-canvas]').forEach(button => button.addEventListener('click', closePanels));
  for (const panel of panels) {
    panel.addEventListener('click', event => {
      const rect = panel.getBoundingClientRect();
      if (event.target === panel && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closePanels();
    });
    panel.addEventListener('close', () => { if (active === panel) active = null; });
  }
  document.getElementById('palette').addEventListener('click', event => { if (event.target.closest('.swatch')) closePanels(); });
  document.getElementById('useCustom').addEventListener('click', () => { if (/^#[0-9a-f]{6}$/i.test(document.getElementById('hexColor').value.trim())) closePanels(); });
  document.getElementById('applyImage').addEventListener('click', closePanels);
  document.getElementById('clearBtn').addEventListener('click', closePanels);
  window.addEventListener('pixel-cloud-settings-required', () => openPanel('savePanel'));
  function notify(text) { for (const panel of panels) panel.querySelector('.sheet-message').textContent = panel === active ? text : ''; }
  window.PixelEditorUI = {openPanel, closePanels, notify};
})();
