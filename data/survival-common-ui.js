// 雪山サバイバル 共通UI
// 各サバイバル画面の「ゲームTOPへ戻る」確認を共通管理する。

(function () {
  'use strict';

  const TOP_URL = 'survival%20game_TOP.html';
  const BACK_SELECTOR = '[data-survival-top-back]';

  function ensureStyle() {
    if (document.getElementById('survivalCommonBackConfirmStyle')) return;

    const style = document.createElement('style');
    style.id = 'survivalCommonBackConfirmStyle';
    style.textContent = `
      .survival-common-confirm-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(0,0,0,.42);
      }

      .survival-common-confirm-box {
        width: min(100%, 360px);
        padding: 20px 18px 16px;
        border: 1px solid #8f8f8f;
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 10px 28px rgba(0,0,0,.28);
        text-align: center;
      }

      .survival-common-confirm-text {
        margin: 0 0 18px;
        font-size: 18px;
        line-height: 1.5;
        font-weight: 800;
      }

      .survival-common-confirm-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .survival-common-confirm-button {
        min-height: 48px;
        border: 1px solid #888;
        border-radius: 10px;
        background: #f6f6f6;
        font-size: 17px;
        font-weight: 900;
      }

      .survival-common-confirm-button.yes {
        background: #efe5d2;
        border-color: #8c6b3e;
      }
    `;
    document.head.appendChild(style);
  }

  function closeConfirm() {
    const overlay = document.getElementById('survivalCommonBackConfirmOverlay');
    if (overlay) overlay.remove();
  }

  function showConfirm() {
    if (document.getElementById('survivalCommonBackConfirmOverlay')) return;

    ensureStyle();

    const overlay = document.createElement('div');
    overlay.id = 'survivalCommonBackConfirmOverlay';
    overlay.className = 'survival-common-confirm-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'ゲームの最初の画面に戻る確認');

    const box = document.createElement('div');
    box.className = 'survival-common-confirm-box';

    const text = document.createElement('p');
    text.className = 'survival-common-confirm-text';
    text.textContent = 'ゲームの最初の画面に戻りますか？';

    const actions = document.createElement('div');
    actions.className = 'survival-common-confirm-actions';

    const yesButton = document.createElement('button');
    yesButton.type = 'button';
    yesButton.className = 'survival-common-confirm-button yes';
    yesButton.textContent = 'はい';
    yesButton.addEventListener('click', function () {
      location.href = TOP_URL;
    });

    const noButton = document.createElement('button');
    noButton.type = 'button';
    noButton.className = 'survival-common-confirm-button';
    noButton.textContent = 'いいえ';
    noButton.addEventListener('click', closeConfirm);

    actions.append(yesButton, noButton);
    box.append(text, actions);
    overlay.appendChild(box);

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeConfirm();
    });

    document.body.appendChild(overlay);
    noButton.focus();
  }

  function bindBackButtons() {
    document.querySelectorAll(BACK_SELECTOR).forEach(function (button) {
      if (button.dataset.survivalTopBackBound === '1') return;
      button.dataset.survivalTopBackBound = '1';
      button.addEventListener('click', function (event) {
        event.preventDefault();
        showConfirm();
      });
    });
  }

  window.SURVIVAL_COMMON_UI = Object.freeze({
    bindBackButtons,
    showTopBackConfirm: showConfirm,
    closeTopBackConfirm: closeConfirm
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindBackButtons, { once: true });
  } else {
    bindBackButtons();
  }
})();
