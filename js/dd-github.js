(() => {
  'use strict';

  const CONFIG = Object.freeze({
    owner: 'namiyukuta-cmd',
    repo: 'english-game',
    branch: 'main',
    saveDir: 'dd-saves',
    tokenKey: 'ddGithubToken'
  });

  function getToken() {
    return localStorage.getItem(CONFIG.tokenKey) || '';
  }

  function setToken(token) {
    const value = String(token || '').trim();
    if (!value) throw new Error('GitHubトークンを入力してください。');
    localStorage.setItem(CONFIG.tokenKey, value);
  }

  function clearToken() {
    localStorage.removeItem(CONFIG.tokenKey);
  }

  function apiHeaders() {
    const token = getToken();
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...apiHeaders(),
        ...(options.headers || {})
      }
    });

    if (response.status === 401) throw new Error('GitHubトークンを確認してください。');
    if (response.status === 403) throw new Error('GitHubへのアクセス権限がありません。トークンのContents権限を確認してください。');
    return response;
  }

  function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function base64ToUtf8(base64) {
    const binary = atob(String(base64 || '').replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function safeId(value) {
    return String(value || 'character')
      .normalize('NFKC')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'character';
  }

  function encodePath(path = '') {
    return String(path)
      .split('/')
      .filter(Boolean)
      .map(part => encodeURIComponent(part))
      .join('/');
  }

  function repoContentsUrl(path = '') {
    const base = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents`;
    const encoded = encodePath(path);
    return encoded ? `${base}/${encoded}` : base;
  }

  async function verifyConnection() {
    if (!getToken()) throw new Error('GitHubトークンが未設定です。');
    const response = await apiFetch(`https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}`);
    if (!response.ok) throw new Error(`GitHub接続に失敗しました (${response.status})。`);
    return true;
  }

  async function listPath(path) {
    const response = await apiFetch(`${repoContentsUrl(path)}?ref=${encodeURIComponent(CONFIG.branch)}`);
    if (response.status === 404) return [];
    if (!response.ok) throw new Error(`GitHubの一覧を取得できませんでした (${response.status})。`);
    const value = await response.json();
    return Array.isArray(value) ? value : [];
  }

  async function readJsonPath(path) {
    const response = await apiFetch(`${repoContentsUrl(path)}?ref=${encodeURIComponent(CONFIG.branch)}`);
    if (!response.ok) throw new Error(`データを読み込めませんでした (${response.status})。`);
    const file = await response.json();
    const text = base64ToUtf8(file.content);
    return {
      data: JSON.parse(text),
      sha: file.sha || null,
      name: file.name || String(path).split('/').pop(),
      path: file.path || path
    };
  }

  async function writeJsonPath(path, data, message = 'Update DD data') {
    if (!getToken()) throw new Error('GitHubへ保存するにはトークンが必要です。');

    const lookup = await apiFetch(`${repoContentsUrl(path)}?ref=${encodeURIComponent(CONFIG.branch)}`);
    let sha = null;
    if (lookup.ok) {
      const current = await lookup.json();
      sha = current.sha || null;
    } else if (lookup.status !== 404) {
      throw new Error(`既存データを確認できませんでした (${lookup.status})。`);
    }

    const body = {
      message,
      content: utf8ToBase64(JSON.stringify(data, null, 2)),
      branch: CONFIG.branch
    };
    if (sha) body.sha = sha;

    const response = await apiFetch(repoContentsUrl(path), {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      let detail = '';
      try {
        const result = await response.json();
        detail = result.message ? ` ${result.message}` : '';
      } catch (_) {}
      throw new Error(`GitHubへの保存に失敗しました (${response.status})。${detail}`);
    }
    const result = await response.json();
    return {
      path,
      sha: result.content?.sha || null,
      commitSha: result.commit?.sha || null
    };
  }

  async function deletePath(path, message = 'Delete DD data') {
    if (!getToken()) throw new Error('GitHubから削除するにはトークンが必要です。');
    const lookup = await apiFetch(`${repoContentsUrl(path)}?ref=${encodeURIComponent(CONFIG.branch)}`);
    if (lookup.status === 404) return false;
    if (!lookup.ok) throw new Error(`削除するデータを確認できませんでした (${lookup.status})。`);
    const current = await lookup.json();
    const response = await apiFetch(repoContentsUrl(path), {
      method: 'DELETE',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({message, sha: current.sha, branch: CONFIG.branch})
    });
    if (!response.ok) throw new Error(`セーブデータを削除できませんでした (${response.status})。`);
    return true;
  }

  // 旧・単一セーブ形式の読み込み互換用。
  function saveFilename(game) {
    const id = game?.character?.id || game?.id || `character-${Date.now()}`;
    return `${safeId(id)}.json`;
  }

  function legacyPath(filename = '') {
    return filename ? `${CONFIG.saveDir}/${filename}` : CONFIG.saveDir;
  }

  async function listSaves() {
    const items = await listPath(CONFIG.saveDir);
    return items
      .filter(item => item.type === 'file' && item.name.endsWith('.json'))
      .sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  }

  async function loadSave(filename) {
    const file = await readJsonPath(legacyPath(filename));
    const game = file.data;
    game.__github = {filename: file.name, sha: file.sha};
    return game;
  }

  let managerPromise = null;
  function ensureSaveManager() {
    if (window.DDSave) return Promise.resolve(window.DDSave);
    if (managerPromise) return managerPromise;
    managerPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'js/dd-save.js?v=20260825-1';
      script.onload = () => window.DDSave ? resolve(window.DDSave) : reject(new Error('セーブ機能を読み込めませんでした。'));
      script.onerror = () => reject(new Error('セーブ機能を読み込めませんでした。'));
      document.head.appendChild(script);
    });
    return managerPromise;
  }

  // DD.html の既存呼び出しを維持しつつ、新しい複数セーブ画面へ渡す。
  async function saveGame(game) {
    if (!getToken()) throw new Error('GitHubトークンが未設定です。');
    const manager = await ensureSaveManager();
    return manager.openSaveDialog(game);
  }

  window.DDGithub = {
    CONFIG,
    getToken,
    setToken,
    clearToken,
    verifyConnection,
    safeId,
    listPath,
    readJsonPath,
    writeJsonPath,
    deletePath,
    ensureSaveManager,
    listSaves,
    loadSave,
    saveGame,
    saveFilename
  };
})();