(() => {
  const QUEST_KEY = 'rpgQuestSaveV1';
  const DEFEATED_KEY = 'rpgDefeatedEnemyIdsV1';
  const quest = window.RPG_QUESTS.tavernSlime01;
  const text = document.getElementById('tavarnText');
  const requestButton = document.getElementById('requestButton');
  const talkButton = document.getElementById('talkButton');
  const coinCount = document.getElementById('coinCount');
  let showingDetails = false;

  function loadQuestState() {
    try {
      const saved = JSON.parse(localStorage.getItem(QUEST_KEY) || '{}');
      if (saved.id === quest.id) {
        return {
          id: quest.id,
          status: saved.status || 'available',
          progress: Math.max(0, Number(saved.progress) || 0)
        };
      }
    } catch (_error) {}
    return { id: quest.id, status: 'available', progress: 0 };
  }

  function saveQuestState(state) {
    localStorage.setItem(QUEST_KEY, JSON.stringify(state));
  }

  function respawnQuestEnemy() {
    try {
      const defeated = JSON.parse(localStorage.getItem(DEFEATED_KEY) || '[]');
      const ids = Array.isArray(defeated) ? defeated.filter(Boolean) : [];
      localStorage.setItem(
        DEFEATED_KEY,
        JSON.stringify(ids.filter(id => id !== quest.respawnEnemyId))
      );
    } catch (_error) {
      localStorage.setItem(DEFEATED_KEY, '[]');
    }
  }

  function updateCoins() {
    coinCount.textContent = GameStore.state.coins;
  }

  function showDetails() {
    text.textContent = `${quest.requester}からの依頼\n「${quest.description}」\n報酬：${quest.rewardCoins}コイン`;
    requestButton.textContent = 'この依頼を受ける';
  }

  function render() {
    const state = loadQuestState();
    requestButton.disabled = false;

    if (state.status === 'active') {
      text.textContent = `受注中：${quest.title}\nスライム退治 ${state.progress}/${quest.required}`;
      requestButton.textContent = `討伐中 ${state.progress}/${quest.required}`;
      requestButton.disabled = true;
      return;
    }

    if (state.status === 'ready') {
      text.textContent = `依頼達成：${quest.title}\n酒場の主人に報告できます。`;
      requestButton.textContent = `報酬 ${quest.rewardCoins}コインを受け取る`;
      return;
    }

    if (state.status === 'claimed') {
      text.textContent = `達成済み：${quest.title}\n報酬を受け取りました。`;
      requestButton.textContent = '依頼達成済み';
      requestButton.disabled = true;
      return;
    }

    if (showingDetails) {
      showDetails();
      return;
    }

    text.textContent = '依頼掲示板に新しい依頼がある。';
    requestButton.textContent = '依頼を見る';
  }

  requestButton.addEventListener('click', () => {
    const state = loadQuestState();

    if (state.status === 'ready') {
      GameStore.addCoins(quest.rewardCoins);
      saveQuestState({ id: quest.id, status: 'claimed', progress: quest.required });
      updateCoins();
      render();
      return;
    }

    if (state.status !== 'available') return;

    if (!showingDetails) {
      showingDetails = true;
      render();
      return;
    }

    respawnQuestEnemy();
    saveQuestState({ id: quest.id, status: 'active', progress: 0 });
    showingDetails = false;
    render();
  });

  talkButton.addEventListener('click', () => {
    const state = loadQuestState();
    if (state.status === 'ready') {
      text.textContent = '酒場の主人「おお、倒してくれたか。依頼の報酬を受け取ってくれ」';
    } else if (state.status === 'active') {
      text.textContent = '酒場の主人「酒場の外にいるスライムを1匹頼む」';
    } else {
      text.textContent = '酒場の主人「依頼なら、そこの掲示板を見てくれ」';
    }
  });

  updateCoins();
  render();
})();
