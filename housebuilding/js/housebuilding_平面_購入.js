(() => {
  const state = window.HOUSEBUILDING_PURCHASE_STATE || { money: 1000 };
  window.HOUSEBUILDING_PURCHASE_STATE = state;

  let currentItem = null;
  let quantity = 1;
  let onPurchased = null;

  function getElements() {
    return {
      panel: document.getElementById('purchasePanel'),
      close: document.getElementById('purchaseClose'),
      icon: document.getElementById('purchaseIcon'),
      name: document.getElementById('purchaseName'),
      owned: document.getElementById('purchaseOwned'),
      price: document.getElementById('purchasePrice'),
      money: document.getElementById('purchaseMoney'),
      qty: document.getElementById('purchaseQty'),
      minus: document.getElementById('purchaseMinus'),
      plus: document.getElementById('purchasePlus'),
      total: document.getElementById('purchaseTotal'),
      buy: document.getElementById('purchaseBuy'),
      message: document.getElementById('purchaseMessage')
    };
  }

  function render() {
    const el = getElements();
    if (!currentItem || !el.panel) return;

    const price = Number(currentItem.price || 0);
    el.icon.textContent = currentItem.icon || '';
    el.name.textContent = currentItem.name || '';
    el.owned.textContent = `所持 ${Number(currentItem.owned || 0)}個`;
    el.price.textContent = `1個 ${price}G`;
    el.money.textContent = `所持金 ${state.money}G`;
    el.qty.textContent = String(quantity);
    el.total.textContent = `合計 ${price * quantity}G`;
    el.message.textContent = '';
    el.buy.disabled = !currentItem.purchasable || !currentItem.unlocked;
  }

  function close() {
    const { panel } = getElements();
    if (panel) panel.hidden = true;
    currentItem = null;
    onPurchased = null;
    quantity = 1;
  }

  function open(item, callback) {
    const { panel } = getElements();
    if (!panel || !item) return;

    currentItem = item;
    onPurchased = typeof callback === 'function' ? callback : null;
    quantity = 1;
    panel.hidden = false;
    render();
  }

  function bind() {
    const el = getElements();
    if (!el.panel) return;

    el.close?.addEventListener('click', close);

    el.panel.addEventListener('click', event => {
      if (event.target === el.panel) close();
    });

    el.minus?.addEventListener('click', () => {
      quantity = Math.max(1, quantity - 1);
      render();
    });

    el.plus?.addEventListener('click', () => {
      quantity = Math.min(99, quantity + 1);
      render();
    });

    el.buy?.addEventListener('click', () => {
      if (!currentItem) return;
      const price = Number(currentItem.price || 0);
      const total = price * quantity;

      if (state.money < total) {
        el.message.textContent = 'お金が足りません';
        return;
      }

      state.money -= total;
      currentItem.owned = Number(currentItem.owned || 0) + quantity;

      const purchasedItem = currentItem;
      const callback = onPurchased;
      close();
      callback?.(purchasedItem);
    });
  }

  window.HOUSEBUILDING_PURCHASE = { open, close, state };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
