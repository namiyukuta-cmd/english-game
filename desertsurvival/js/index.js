import {
  createNewGameState,
  getToken,
  setToken,
  clearToken,
  verifyConnection,
  listRemoteSaves,
  loadRemoteSave,
  setActiveGame
} from './save.js';

const FIELD_URL = './desertsurvival_field.html?v=20260910-hudsketch1';

const newGameBtn = document.getElementById('newGameBtn');
const continueBtn = document.getElementById('continueBtn');
const settingsBtn = document.getElementById('settingsBtn');
const continuePanel = document.getElementById('continuePanel');
const settingsPanel = document.getElementById('settingsPanel');
const saveList = document.getElementById('saveList');
const continueStatus = document.getElementById('continueStatus');
const githubToken = document.getElementById('githubToken');
const saveTokenBtn = document.getElementById('saveTokenBtn');
const clearTokenBtn = document.getElementById('clearTokenBtn');
const settingsStatus = document.getElementById('settingsStatus');

function openPanel(panel) {
  continuePanel.hidden = true;
  settingsPanel.hidden = true;
  panel.hidden = false;
}

function closePanels() {
  continuePanel.hidden = true;
  settingsPanel.hidden = true;
}

document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', closePanels);
});

newGameBtn.addEventListener('click', () => {
  const game = createNewGameState();
  setActiveGame(game);
  location.href = FIELD_URL;
});

continueBtn.addEventListener('click', async () => {
  openPanel(continuePanel);
  saveList.innerHTML = '';
  continueStatus.textContent = 'セーブデータを確認しています…';
  try {
    const saves = await listRemoteSaves();
    continueStatus.textContent = '';
    if (!saves.length) {
      saveList.innerHTML = '<div class="empty">Desert Survival のセーブデータはまだありません。</div>';
      return;
    }
    saves.forEach(file => {
      const card = document.createElement('article');
      card.className = 'save-card';
      const updated = file.download_url ? '' : '';
      card.innerHTML = '<div><strong></strong><span></span></div><button type="button">ロード</button>';
      card.querySelector('strong').textContent = file.name.replace(/\.json$/i, '');
      card.querySelector('span').textContent = updated;
      const loadButton = card.querySelector('button');
      loadButton.addEventListener('click', async () => {
        loadButton.disabled = true;
        continueStatus.textContent = `${file.name} を読み込んでいます…`;
        try {
          await loadRemoteSave(file.name);
          location.href = FIELD_URL;
        } catch (error) {
          continueStatus.textContent = error.message || 'ロードに失敗しました。';
          loadButton.disabled = false;
        }
      });
      saveList.appendChild(card);
    });
  } catch (error) {
    continueStatus.textContent = error.message || 'セーブ一覧を取得できませんでした。';
    if (!getToken()) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '設定を開く';
      button.addEventListener('click', () => openPanel(settingsPanel));
      saveList.appendChild(button);
    }
  }
});

settingsBtn.addEventListener('click', () => {
  openPanel(settingsPanel);
  githubToken.value = '';
  settingsStatus.textContent = getToken() ? 'GitHubトークン設定済み' : 'GitHubトークン未設定';
});

saveTokenBtn.addEventListener('click', async () => {
  saveTokenBtn.disabled = true;
  settingsStatus.textContent = '接続を確認しています…';
  try {
    setToken(githubToken.value);
    await verifyConnection();
    githubToken.value = '';
    settingsStatus.textContent = 'private-game-data に接続できました。';
  } catch (error) {
    clearToken();
    settingsStatus.textContent = error.message || '接続できませんでした。';
  } finally {
    saveTokenBtn.disabled = false;
  }
});

clearTokenBtn.addEventListener('click', () => {
  clearToken();
  githubToken.value = '';
  settingsStatus.textContent = 'GitHubトークンを削除しました。';
});
