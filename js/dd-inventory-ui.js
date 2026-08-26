window.DDInventoryUI = (() => {
  'use strict';

  let contentRoot = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function formatNumber(value) {
    const number = Number(value || 0);
    if (Number.isInteger(number)) return String(number);
    return number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }

  function slotLabel(slot) {
    return ({
      mainHand: '主武器',
      offHand: '副手',
      armor: '防具',
      other: 'その他'
    })[slot] || slot || '装備';
  }

  function typeLabel(type) {
    return ({
      weapon: '武器',
      armor: '防具',
      ammo: '矢弾',
      consumable: '消耗品',
      gear: '冒険用具',
      pack: 'パック',
      tool: '道具',
      book: '書物',
      clothing: '衣類'
    })[type] || 'アイテム';
  }

  function priceText(price, priceQuantity = 1) {
    if (!price || typeof price !== 'object') return '';
    const parts = ['gp', 'sp', 'cp']
      .filter(key => Number(price[key]) > 0)
      .map(key => `${formatNumber(price[key])} ${key.toUpperCase()}`);
    const amount = parts.join(' / ');
    if (!amount) return '';
    const quantity = Number(priceQuantity);
    return Number.isFinite(quantity) && quantity > 1
      ? `${formatNumber(quantity)}個あたり ${amount}`
      : amount;
  }

  function inventoryRow(owned, data, extraClass = '', rightText = '') {
    const quantity = owned.quantity || 1;
    return `
      <button
        class="inventory-row ${extraClass}"
        data-item-uid="${escapeHtml(owned.uid)}"
        aria-label="${escapeHtml(`${data.name} ${data.ja || ''} 所持数 ${quantity}`)}"
        type="button"
      >
        <span class="inventory-name">
          <strong>${escapeHtml(data.name)}</strong>
          <small>${escapeHtml(data.ja || '')}</small>
        </span>
        <span class="inventory-row-side">
          ${rightText ? `<small class="inventory-row-meta">${escapeHtml(rightText)}</small>` : ''}
          <span class="inventory-quantity">×${escapeHtml(quantity)}</span>
        </span>
      </button>`;
  }

  function bindRows() {
    contentRoot.querySelectorAll('.inventory-row').forEach(button => {
      button.addEventListener('click', () => openItemDetail(button.dataset.itemUid));
    });
  }

  function renderInventoryWindow(root = contentRoot) {
    if (root) contentRoot = root;
    if (!contentRoot || !window.DDInventory) return;

    const game = DDInventory.getGame();
    const inventory = Array.isArray(game.inventory) ? game.inventory : [];
    const equipment = Array.isArray(game.equipment) ? game.equipment : [];
    const currency = game.currency || { gp: 0, sp: 0, cp: 0 };
    const weight = DDInventory.totalWeight(game);
    const equippedUids = new Set(equipment.map(item => item.uid));
    const carried = inventory.filter(item => !equippedUids.has(item.uid));

    let html = `
      <div class="inventory-money">
        <span>GP <strong>${escapeHtml(currency.gp || 0)}</strong></span>
        <span>SP <strong>${escapeHtml(currency.sp || 0)}</strong></span>
        <span>CP <strong>${escapeHtml(currency.cp || 0)}</strong></span>
      </div>
      <div class="inventory-weight">重量 <strong>${weight.toFixed(1)} lb</strong></div>
      <h3 class="inventory-title">装備</h3>`;

    if (!equipment.length) {
      html += '<p class="inventory-empty">装備中のアイテムはありません。</p>';
    }
    for (const equipped of equipment) {
      const owned = inventory.find(item => item.uid === equipped.uid);
      const data = DDInventory.itemData(equipped.itemId);
      if (!owned || !data) continue;
      html += inventoryRow(owned, data, 'equipped', slotLabel(equipped.slot));
    }

    html += '<h3 class="inventory-title">所持品</h3>';
    if (!carried.length) {
      html += '<p class="inventory-empty">所持品はありません。</p>';
    }
    for (const owned of carried) {
      const data = DDInventory.itemData(owned.itemId);
      if (!data) continue;
      html += inventoryRow(owned, data);
    }

    contentRoot.innerHTML = `<div class="inventory-screen">${html}</div>`;
    bindRows();
  }

  function itemStat(label, value) {
    return `<div class="item-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  }

  function itemTextSection(title, value, extraClass = '') {
    const text = String(value ?? '').trim();
    if (!text) return '';
    return `
      <section class="item-text-section ${extraClass}">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(text)}</p>
      </section>`;
  }

  function itemProperties(properties) {
    if (!Array.isArray(properties) || !properties.length) return '';
    return `
      <section class="item-list-section item-properties">
        <h3>特性</h3>
        <ul>
          ${properties.map(property => `<li>${escapeHtml(property)}</li>`).join('')}
        </ul>
      </section>`;
  }

  function packContents(contents) {
    if (!Array.isArray(contents) || !contents.length) return '';
    return `
      <section class="item-list-section item-pack-contents">
        <h3>パックの中身</h3>
        <ul>
          ${contents.map(content => {
            const linked = content.itemId ? DDInventory.itemData(content.itemId) : null;
            const name = linked?.name || content.name || content.itemId || 'Unknown Item';
            const ja = linked?.ja || '';
            const quantity = Number(content.quantity) > 0 ? Number(content.quantity) : 1;
            return `
              <li>
                <span class="item-pack-name">
                  <strong>${escapeHtml(name)}</strong>
                  ${ja ? `<small>${escapeHtml(ja)}</small>` : ''}
                </span>
                <span class="item-pack-quantity">×${escapeHtml(formatNumber(quantity))}</span>
              </li>`;
          }).join('')}
        </ul>
      </section>`;
  }

  function openItemDetail(uid) {
    if (!contentRoot || !window.DDInventory) return;
    const game = DDInventory.getGame();
    const owned = game.inventory.find(item => item.uid === uid);
    if (!owned) {
      renderInventoryWindow();
      return;
    }
    const data = DDInventory.itemData(owned.itemId);
    if (!data) return;
    const equippedEntry = (game.equipment || []).find(item => item.uid === uid);
    const canEquip = !['ammo', 'consumable', 'pack', 'book'].includes(data.type);
    const description = data.descriptionJa || data.description || '';
    const usage = data.usageJa || data.usage || '';
    let details = itemStat('種類', typeLabel(data.type));
    if (data.damage) details += itemStat('Damage', data.damage);
    if (data.ac != null) details += itemStat('AC', data.ac);
    if (data.acBonus != null) details += itemStat('AC Bonus', `+${data.acBonus}`);
    if (data.weight != null) details += itemStat('重量', `${formatNumber(data.weight)} lb`);
    if (priceText(data.price, data.priceQuantity)) {
      details += itemStat('価格', priceText(data.price, data.priceQuantity));
    }

    contentRoot.innerHTML = `
      <button id="itemBackButton" class="item-back" type="button">← 所持品</button>
      <section class="item-detail">
        <h2>${escapeHtml(data.name)}</h2>
        <p class="item-ja">${escapeHtml(data.ja || '')}</p>
        <p class="item-owned-count">所持数 <strong>${owned.quantity || 1}</strong></p>
        ${equippedEntry ? `<p class="item-equipped-label">装備中：${escapeHtml(slotLabel(equippedEntry.slot))}</p>` : ''}
        ${itemTextSection('説明', description, 'item-description')}
        ${itemTextSection('用途・使い方', usage, 'item-usage')}
        <div class="item-stat-list">${details}</div>
        ${itemProperties(data.properties)}
        ${packContents(data.contents)}
        <div class="item-actions">
          ${canEquip ? (equippedEntry
            ? '<button id="unequipButton" type="button">装備を外す</button>'
            : '<button id="equipButton" type="button">装備する</button>') : ''}
          ${data.type === 'consumable' ? '<button id="useItemButton" type="button">使用する</button>' : ''}
        </div>
      </section>`;

    document.getElementById('itemBackButton')?.addEventListener('click', () => renderInventoryWindow());
    document.getElementById('equipButton')?.addEventListener('click', () => {
      DDInventory.equip(uid, DDInventory.equipmentSlot(data));
      openItemDetail(uid);
    });
    document.getElementById('unequipButton')?.addEventListener('click', () => {
      DDInventory.unequip(uid);
      openItemDetail(uid);
    });
    document.getElementById('useItemButton')?.addEventListener('click', () => {
      DDInventory.consume(owned.itemId, 1);
      renderInventoryWindow();
    });
  }

  return {
    render: renderInventoryWindow,
    openItemDetail
  };
})();
