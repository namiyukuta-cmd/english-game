(() => {
  'use strict';

  const DATA = window.DD_QUEST_DATA;
  const $ = id => document.getElementById(id);

  if (!DATA || !Array.isArray(DATA.quests)) {
    $('questList').innerHTML = '<div class="empty">依頼データを読み込めませんでした。</div>';
    return;
  }

  let game = readGame();
  let selectedQuest = null;

  const params = new URLSearchParams(location.search);
  const boardId = params.get('board') || 'tavern';

  function readGame() {
    try {
      const raw = localStorage.getItem('ddActiveGame');
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed) {
        location.replace('DD_top.html');
        return null;
      }
      parsed.character = parsed.character || {};
      parsed.quests = Array.isArray(parsed.quests) ? parsed.quests : [];
      parsed.log = Array.isArray(parsed.log) ? parsed.log : [];
      parsed.current = parsed.current || {};
      return parsed;
    } catch (_) {
      location.replace('DD_top.html');
      return null;
    }
  }

  function writeGame() {
    localStorage.setItem('ddActiveGame', JSON.stringify(game));
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[ch]));
  }

  function playerLevel() {
    return Number(game?.character?.level || 1);
  }

  function rewardText(reward = {}) {
    const parts = [];
    if (reward.gp) parts.push(`${reward.gp} GP`);
    if (reward.sp) parts.push(`${reward.sp} SP`);
    if (reward.cp) parts.push(`${reward.cp} CP`);
    if (Array.isArray(reward.items) && reward.items.length) parts.push(reward.items.join(' / '));
    return parts.join(' + ') || 'なし';
  }

  function levelText(level = {}) {
    const min = Number(level.min || 1);
    const max = Number(level.max || min);
    return min === max ? `Lv.${min}` : `Lv.${min}–${max}`;
  }

  function questStatus(id) {
    return game.quests.find(q => q?.id === id)?.status || '';
  }

  function hashString(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function stableShuffle(list, seedText) {
    const rand = mulberry32(hashString(seedText));
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function availableQuests() {
    const level = playerLevel();
    const eligible = DATA.quests.filter(q => {
      const boards = Array.isArray(q.boards) ? q.boards : [];
      const min = Number(q.level?.min || 1);
      const max = Number(q.level?.max || min);
      return boards.includes(boardId) && level >= min && level <= max;
    });

    const day = Number(game.time?.day || game.current?.day || 1);
    const charId = game.character?.id || game.id || 'character';
    const seed = `${charId}|${boardId}|${day}|${DATA.version || 1}`;
    return stableShuffle(eligible, seed).slice(0, Number(DATA.boardSize || 5));
  }

  function renderList() {
    selectedQuest = null;
    $('detailView').classList.remove('active');
    $('listView').classList.remove('hidden');
    $('levelText').textContent = `Lv.${playerLevel()}`;
    $('boardTitle').textContent = boardId === 'tavern' ? '酒場の依頼' : '依頼一覧';

    const quests = availableQuests();
    if (!quests.length) {
      $('questList').innerHTML = '<div class="empty">現在受けられる依頼はありません。</div>';
      return;
    }

    $('questList').innerHTML = quests.map(q => {
      const status = questStatus(q.id);
      return `
        <button class="quest-card" type="button" data-quest-id="${esc(q.id)}">
          <span>
            <strong>${esc(q.title)}</strong>
            <small>${esc(q.summary || '')}${status === 'active' ? '　【受注済み】' : status === 'completed' ? '　【完了】' : ''}</small>
          </span>
          <span class="quest-meta">
            <b>${esc(levelText(q.level))}</b>
            ${esc(rewardText(q.reward))}
          </span>
        </button>`;
    }).join('');

    document.querySelectorAll('[data-quest-id]').forEach(button => {
      button.addEventListener('click', () => {
        const quest = DATA.quests.find(q => q.id === button.dataset.questId);
        if (quest) showDetail(quest);
      });
    });
  }

  function firstStage(quest) {
    return Array.isArray(quest.stages) && quest.stages.length ? quest.stages[0] : null;
  }

  function showDetail(quest) {
    selectedQuest = quest;
    const status = questStatus(quest.id);
    const stage = firstStage(quest);

    $('listView').classList.add('hidden');
    $('detailView').classList.add('active');
    $('detailTitle').textContent = quest.title || '依頼';
    $('detailLevel').textContent = levelText(quest.level);
    $('detailReward').textContent = rewardText(quest.reward);
    $('detailGiver').textContent = quest.giver || '不明';
    $('detailContact').textContent = quest.contact || '—';
    $('detailDescription').textContent = quest.description || '';
    $('detailObjective').textContent = stage?.objective || '依頼内容を確認する。';

    const accepted = status === 'active';
    const completed = status === 'completed';
    $('acceptedBox').hidden = !(accepted || completed);
    if (completed) $('acceptedBox').textContent = 'この依頼は完了済みです。';
    else $('acceptedBox').textContent = 'この依頼は受注済みです。メイン画面の QUEST から進行状況を確認できます。';

    $('acceptButton').disabled = accepted || completed;
    $('acceptButton').textContent = completed ? '完了済み' : accepted ? '受注済み' : 'この依頼を受ける';
    $('status').textContent = '';
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function acceptQuest() {
    if (!selectedQuest) return;
    if (questStatus(selectedQuest.id)) return;

    const stage = firstStage(selectedQuest);
    const objective = stage?.objective || selectedQuest.summary || selectedQuest.title;

    const accepted = {
      id: selectedQuest.id,
      title: selectedQuest.title,
      status: 'active',
      source: 'request',
      boardId,
      giver: selectedQuest.giver || '',
      description: selectedQuest.description || '',
      reward: clone(selectedQuest.reward || {}),
      level: clone(selectedQuest.level || {}),
      stage: stage?.id || 'accepted',
      stageIndex: 0,
      currentObjective: objective,
      objectives: [
        { id: stage?.id || 'objective_1', text: objective, done: false }
      ],
      effects: clone(stage?.effects || {}),
      startedAt: new Date().toISOString(),
      questDataVersion: DATA.version || 1
    };

    game.quests.push(accepted);
    game.log.push({
      type: 'questAccepted',
      questId: accepted.id,
      text: `依頼「${accepted.title}」を受注した。`,
      location: game.location?.label || game.current?.location || '',
      time: game.time ? `第${game.time.day || 1}日 ${String(game.time.hour ?? 8).padStart(2,'0')}:${String(game.time.minute ?? 0).padStart(2,'0')}` : ''
    });

    writeGame();
    $('status').textContent = `「${accepted.title}」を受注しました。`;
    showDetail(selectedQuest);
  }

  function goBack() {
    writeGame();
    location.href = 'DD.html?v=20260825-6';
  }

  $('acceptButton').addEventListener('click', acceptQuest);
  $('backListButton').addEventListener('click', renderList);
  $('backButton').addEventListener('click', goBack);

  renderList();
})();