import {
  getActiveGame,
  getToken,
  listRemoteSaves,
  loadRemoteSave,
  writeRemoteSave
} from './save.js';
import { getAmbientTemperature } from './temperature.js';

const $ = id => document.getElementById(id);

const dayEl = $('topDay');
const foodEl = $('topFood');
const waterEl = $('topWater');
const sleepEl = $('topSleep');
const timeEl = $('fieldTime');
const weatherEl = $('fieldWeather');
const tempFillEl = $('fieldTempFill');
const tempBulbEl = $('fieldTempBulb');
const menuBtn = $('quickMenuBtn');
const menuBar = $('quickMenuBar');
const topBtn = $('quickTopBtn');
const logBtn = $('quickLogBtn');
const loadBtn = $('quickLoadBtn');
const saveBtn = $('quickSaveBtn');
const systemOverlay = $('fieldSystemOverlay');
const systemTitle = $('fieldSystemTitle');
const systemContent = $('fieldSystemContent');
const systemClose = $('fieldSystemClose');

function clamp100(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

function weatherLabel(type) {
  if (type === 'sandstorm') return '🌪 砂嵐';
  return '☀ 晴れ';
}

function temperatureStyle(temp) {
  if (temp >= 48 || temp <= 0) return { color: '#151515', fill: 92 };
  if (temp >= 35) return { color: '#df5547', fill: 78 };
  if (temp >= 18) return { color: '#e7c84f', fill: 56 };
  if (temp >= 8) return { color: '#80d7e7', fill: 34 };
  return { color: '#3f78d7', fill: 18 };
}

function renderFieldHud() {
  const game = getActiveGame();
  if (!game) return;

  const player = game.player || {};
  const time = game.time || {};
  const weather = game.weather || {};
  const day = Math.max(1, Number(time.day || 1));
  const hour = Math.max(0, Number(time.hour || 0));
  const minute = Math.max(0, Number(time.minute || 0));

  dayEl.textContent = `DAY ${day}`;
  foodEl.textContent = `${clamp100(player.food)}/100`;
  waterEl.textContent = `${clamp100(player.water)}/100`;
  sleepEl.textContent = `${clamp100(player.sleep)}/100`;
  timeEl.textContent = `🕐 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  weatherEl.textContent = weatherLabel(weather.type);

  const ambient = getAmbientTemperature(time, weather.type);
  const tempStyle = temperatureStyle(ambient);
  tempFillEl.style.height = `${tempStyle.fill}%`;
  tempFillEl.style.background = tempStyle.color;
  tempBulbEl.style.background = tempStyle.color;
  tempFillEl.parentElement.setAttribute('aria-label', `外気温 ${ambient.toFixed(1)}度`);
}

function closeQuickMenu() {
  menuBar.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
}

menuBtn.addEventListener('click', event => {
  event.stopPropagation();
  menuBar.hidden = !menuBar.hidden;
  menuBtn.setAttribute('aria-expanded', String(!menuBar.hidden));
});

menuBar.addEventListener('click', event => event.stopPropagation());
document.addEventListener('click', closeQuickMenu);

function openSystem(title) {
  closeQuickMenu();
  systemTitle.textContent = title;
  systemContent.innerHTML = '';
  systemOverlay.hidden = false;
}

function closeSystem() {
  systemOverlay.hidden = true;
}

systemClose.addEventListener('click', closeSystem);
systemOverlay.addEventListener('click', event => {
  if (event.target === systemOverlay) closeSystem();
});

topBtn.addEventListener('click', () => {
  location.href = './desertsurvival_index.html';
});

logBtn.addEventListener('click', () => {
  openSystem('LOG');
  const game = getActiveGame();
  const logs = Array.isArray(game?.log) ? game.log : [];
  if (!logs.length) {
    systemContent.innerHTML = '<p class="field-system-empty">ログはまだありません。</p>';
    return;
  }
  const list = document.createElement('div');
  list.className = 'field-log-list';
  for (const entry of logs.slice().reverse()) {
    const row = document.createElement('div');
    row.className = 'field-log-row';
    row.textContent = typeof entry === 'string' ? entry : (entry?.text || JSON.stringify(entry));
    list.appendChild(row);
  }
  systemContent.appendChild(list);
});

function saveDisplayName(name) {
  return String(name || '').replace(/\.json$/i, '');
}

function nextSaveFilename(files) {
  let max = 0;
  for (const file of files) {
    const match = String(file.name || '').match(/^save-(\d+)\.json$/i);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `save-${String(max + 1).padStart(3, '0')}.json`;
}

async function showLoadList() {
  openSystem('LOAD');
  if (!getToken()) {
    systemContent.innerHTML = '<p class="field-system-empty">GitHubトークンが未設定です。TOP → 設定から登録してください。</p>';
    return;
  }
  systemContent.innerHTML = '<p class="field-system-empty">セーブデータを確認しています…</p>';
  try {
    const files = await listRemoteSaves();
    systemContent.innerHTML = '';
    if (!files.length) {
      systemContent.innerHTML = '<p class="field-system-empty">セーブデータはまだありません。</p>';
      return;
    }
    const list = document.createElement('div');
    list.className = 'field-save-list';
    for (const file of files) {
      const row = document.createElement('div');
      row.className = 'field-save-row';
      const name = document.createElement('span');
      name.textContent = saveDisplayName(file.name);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'ロード';
      button.addEventListener('click', async () => {
        button.disabled = true;
        button.textContent = '読込中';
        try {
          await loadRemoteSave(file.name);
          location.href = './desertsurvival_field.html?v=20260910-topui1';
        } catch (error) {
          button.disabled = false;
          button.textContent = 'ロード';
          alert(error.message || 'ロードに失敗しました。');
        }
      });
      row.append(name, button);
      list.appendChild(row);
    }
    systemContent.appendChild(list);
  } catch (error) {
    systemContent.innerHTML = `<p class="field-system-empty">${error.message || 'セーブ一覧を取得できませんでした。'}</p>`;
  }
}

async function showSaveList() {
  openSystem('SAVE');
  if (!getToken()) {
    systemContent.innerHTML = '<p class="field-system-empty">GitHubトークンが未設定です。TOP → 設定から登録してください。</p>';
    return;
  }
  systemContent.innerHTML = '<p class="field-system-empty">セーブデータを確認しています…</p>';
  try {
    const files = await listRemoteSaves();
    systemContent.innerHTML = '';

    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.className = 'field-new-save';
    newButton.textContent = '新しいセーブを作る';
    newButton.addEventListener('click', async () => {
      const game = getActiveGame();
      if (!game) return;
      const filename = nextSaveFilename(files);
      newButton.disabled = true;
      newButton.textContent = '保存中…';
      try {
        await writeRemoteSave(filename, game);
        await showSaveList();
      } catch (error) {
        newButton.disabled = false;
        newButton.textContent = '新しいセーブを作る';
        alert(error.message || 'セーブに失敗しました。');
      }
    });
    systemContent.appendChild(newButton);

    const list = document.createElement('div');
    list.className = 'field-save-list';
    for (const file of files) {
      const row = document.createElement('div');
      row.className = 'field-save-row';
      const name = document.createElement('span');
      name.textContent = saveDisplayName(file.name);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '上書き';
      button.addEventListener('click', async () => {
        const game = getActiveGame();
        if (!game) return;
        button.disabled = true;
        button.textContent = '保存中';
        try {
          await writeRemoteSave(file.name, game);
          button.textContent = '保存済';
          setTimeout(() => {
            button.disabled = false;
            button.textContent = '上書き';
          }, 900);
        } catch (error) {
          button.disabled = false;
          button.textContent = '上書き';
          alert(error.message || 'セーブに失敗しました。');
        }
      });
      row.append(name, button);
      list.appendChild(row);
    }
    systemContent.appendChild(list);
  } catch (error) {
    systemContent.innerHTML = `<p class="field-system-empty">${error.message || 'セーブ一覧を取得できませんでした。'}</p>`;
  }
}

loadBtn.addEventListener('click', showLoadList);
saveBtn.addEventListener('click', showSaveList);

renderFieldHud();
setInterval(renderFieldHud, 500);
