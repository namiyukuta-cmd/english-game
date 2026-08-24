(() => {
  const $ = id => document.getElementById(id);
  const shuffle = list => [...list].sort(() => Math.random() - 0.5);
  const normalize = value => String(value).trim().toLowerCase();
  const params = new URLSearchParams(location.search);
  const enemyName = params.get('enemy') || 'スライム';
  const enemyId = params.get('id') || '';
  const allowedReturnPages = new Set(['rpg.html', 'rpg_field.html']);
  const requestedReturnPage = params.get('return') || 'rpg.html';
  const returnPage = allowedReturnPages.has(requestedReturnPage)
    ? requestedReturnPage
    : 'rpg.html';
  const isBlackBoss =
    enemyId === 'boss_black_slime_01' ||
    enemyName.includes('黒スライム');
  const reward = isBlackBoss ? 50 : 12;

  document.querySelectorAll('.back, .victory-card a').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      location.href = `${returnPage}?v=${Date.now()}`;
    });
  });

  const enemyImages = {
    red: 'assets/enemies/slime_red.png',
    blue: 'assets/enemies/slime_blue.png',
    green: 'assets/enemies/slime_green.png',
    purple: 'assets/enemies/slime_purple.png',
    black: 'assets/enemies/slime_black.png'
  };

  function getEnemyImage() {
    if (isBlackBoss) return enemyImages.black;
    if (enemyId.startsWith('blue_') || enemyName.includes('青')) return enemyImages.blue;
    if (enemyId.startsWith('green_') || enemyName.includes('緑')) return enemyImages.green;
    if (enemyId.startsWith('horn_') || enemyName.includes('ツノ') || enemyName.includes('紫')) return enemyImages.purple;
    return enemyImages.red;
  }

  const studyPool = WordData.getCurrentStudyWords(GameStore.state.studyProgress);
  const unlocked = studyPool.filter(word => GameStore.state.unlockedWordIds.includes(word.id));
  const sentencePool = Array.isArray(window.SENTENCES)
    ? window.SENTENCES.filter(sentence => sentence.level <= 2)
    : [];
  const bossSentenceRounds = isBlackBoss ? shuffle(sentencePool).slice(0, 5) : [];
  const maxHp = isBlackBoss ? bossSentenceRounds.length : 6;

  let firstPick = null;
  let sentenceRound = 0;
  let sentencePicked = [];
  let locked = false;
  let hp = maxHp;
  let victory = false;

  $('enemyName').textContent = enemyName;
  $('coinCount').textContent = GameStore.state.coins;

  const enemySprite = $('enemySprite');
  enemySprite.src = getEnemyImage();
  enemySprite.alt = enemyName;
  enemySprite.classList.toggle('black-boss', isBlackBoss);
  $('rewardAmount').textContent = reward;

  const hpBox = $('enemyHp');
  hpBox.style.gridTemplateColumns = `repeat(${maxHp},16px)`;
  for (let i = 0; i < maxHp; i++) {
    const seg = document.createElement('span');
    seg.className = 'hp-segment active';
    hpBox.appendChild(seg);
  }

  const board = $('wordBoard');

  if (isBlackBoss) {
    document.querySelector('.battle-shell').classList.add('boss-sentence-mode');
    $('bossSentenceBattle').classList.remove('hidden');
    board.classList.add('sentence-board');
    renderBossSentenceRound();
  } else {
    renderWordPairBattle();
  }

  function renderWordPairBattle() {
    const words = shuffle(unlocked).slice(0, 6);
    const tiles = shuffle(words.flatMap(word => [
      { key: word.id, type: 'en', text: word.en },
      { key: word.id, type: 'ja', text: word.ja }
    ]));

    board.innerHTML = '';
    tiles.forEach(tile => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'word-tile';
      button.textContent = tile.text;
      button.addEventListener('click', () => pickWordPair(button, tile));
      board.appendChild(button);
    });
  }

  function pickWordPair(button, tile) {
    if (locked || victory || button.classList.contains('matched')) return;

    if (!firstPick) {
      firstPick = { button, tile };
      button.classList.add('selected');
      return;
    }

    if (firstPick.button === button) {
      button.classList.remove('selected');
      firstPick = null;
      return;
    }

    const first = firstPick;
    const correct = first.tile.key === tile.key && first.tile.type !== tile.type;

    if (correct) {
      first.button.classList.remove('selected');
      first.button.classList.add('matched');
      button.classList.add('matched');
      firstPick = null;
      attackEnemy();
      return;
    }

    locked = true;
    first.button.classList.add('wrong');
    button.classList.add('wrong');
    $('battleMessage').textContent = '違う組み合わせ！';

    setTimeout(() => {
      first.button.classList.remove('selected', 'wrong');
      button.classList.remove('wrong');
      firstPick = null;
      locked = false;
      $('battleMessage').textContent = '英語と日本語のペアで攻撃！';
    }, 330);
  }

  function makeSentenceDistractors(sentence, count) {
    const answerWords = new Set(sentence.answer.map(normalize));
    const source = Array.isArray(window.WORDS) ? window.WORDS : unlocked;
    const candidates = source
      .map(word => word.en)
      .filter(word => !answerWords.has(normalize(word)));
    return [...new Set(shuffle(candidates))].slice(0, count);
  }

  function renderBossSentenceRound() {
    if (victory) return;
    const sentence = bossSentenceRounds[sentenceRound];
    if (!sentence) return;

    locked = false;
    sentencePicked = [];
    board.innerHTML = '';
    $('bossSentencePrompt').textContent =
      `第${sentenceRound + 1}問 / ${bossSentenceRounds.length}　「${sentence.jp}」`;
    renderSentenceAnswer();
    $('battleMessage').textContent = '正しい英文になるように単語を選ぼう';

    const distractorCount = sentenceRound < 2 ? 1 : 3;
    const tokens = shuffle([
      ...sentence.answer,
      ...makeSentenceDistractors(sentence, distractorCount)
    ]);

    tokens.forEach((word, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'word-tile sentence-token';
      button.textContent = word;
      button.addEventListener('click', () => pickSentenceWord(button, word, index));
      board.appendChild(button);
    });
  }

  function pickSentenceWord(button, word, index) {
    if (locked || victory || button.classList.contains('matched')) return;
    sentencePicked.push({ button, word, index });
    button.classList.add('matched');
    renderSentenceAnswer();

    const sentence = bossSentenceRounds[sentenceRound];
    if (sentencePicked.length === sentence.answer.length) {
      locked = true;
      setTimeout(checkBossSentence, 180);
    }
  }

  function renderSentenceAnswer() {
    $('bossSentenceAnswer').textContent = sentencePicked.length
      ? sentencePicked.map(item => item.word).join(' ')
      : 'ここに英文ができます';
  }

  function resetBossSentenceSelection() {
    if (victory) return;
    sentencePicked.forEach(item => item.button.classList.remove('matched', 'wrong'));
    sentencePicked = [];
    locked = false;
    renderSentenceAnswer();
  }

  function signalWrongBossAnswer() {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate([90, 55, 90]);
    }

    const shell = document.querySelector('.battle-shell');
    if (!shell) return;
    shell.classList.remove('wrong-vibration');
    void shell.offsetWidth;
    shell.classList.add('wrong-vibration');
    setTimeout(() => shell.classList.remove('wrong-vibration'), 320);
  }

  function checkBossSentence() {
    const sentence = bossSentenceRounds[sentenceRound];
    const answer = sentencePicked.map(item => normalize(item.word));
    const correct = answer.every((word, index) =>
      word === normalize(sentence.answer[index])
    );

    if (!correct) {
      signalWrongBossAnswer();
      $('battleMessage').textContent = '語順が違います。選びなおそう';
      sentencePicked.forEach(item => item.button.classList.add('wrong'));
      setTimeout(resetBossSentenceSelection, 650);
      return;
    }

    if (typeof GameStore.seeSentence === 'function') {
      GameStore.seeSentence(sentence.id);
    }
    const completedSentence = sentence.answer.join(' ');
    sentenceRound += 1;
    attackEnemy(completedSentence);
  }

  $('bossSentenceReset').addEventListener('click', resetBossSentenceSelection);

  function attackEnemy(completedSentence = '') {
    hp -= 1;
    const segments = [...hpBox.children];
    if (segments[hp]) segments[hp].classList.remove('active');

    const sprite = $('enemySprite');
    sprite.classList.remove('hit');
    void sprite.offsetWidth;
    sprite.classList.add('hit');

    if (hp > 0) {
      if (isBlackBoss) {
        $('battleMessage').textContent =
          `正解！ ${completedSentence}.　${enemyName}に攻撃！`;
        setTimeout(() => {
          if (!victory) renderBossSentenceRound();
        }, 850);
      } else {
        $('battleMessage').textContent = `${enemyName}に攻撃！ あと${hp}回`;
        setTimeout(() => {
          if (!victory) $('battleMessage').textContent = '英語と日本語のペアで攻撃！';
        }, 650);
      }
      return;
    }

    win();
  }

  function rememberDefeatedEnemy() {
    if (!enemyId) return;
    try {
      const saved = JSON.parse(localStorage.getItem('rpgDefeatedEnemyIdsV1') || '[]');
      const ids = Array.isArray(saved) ? saved.filter(Boolean) : [];
      if (!ids.includes(enemyId)) ids.push(enemyId);
      localStorage.setItem('rpgDefeatedEnemyIdsV1', JSON.stringify(ids));
    } catch (_error) {
      localStorage.setItem('rpgDefeatedEnemyIdsV1', JSON.stringify([enemyId]));
    }
  }

  function advanceQuestAfterVictory() {
    const quest = window.RPG_QUESTS && window.RPG_QUESTS.tavernSlime01;
    if (!quest || !enemyName.includes(quest.targetNameIncludes)) return false;

    try {
      const state = JSON.parse(localStorage.getItem('rpgQuestSaveV1') || '{}');
      if (state.id !== quest.id || state.status !== 'active') return false;

      state.progress = Math.min(quest.required, (Number(state.progress) || 0) + 1);
      if (state.progress >= quest.required) state.status = 'ready';
      localStorage.setItem('rpgQuestSaveV1', JSON.stringify(state));
      return state.status === 'ready';
    } catch (_error) {
      return false;
    }
  }

  function win() {
    victory = true;
    rememberDefeatedEnemy();
    const questCompleted = advanceQuestAfterVictory();
    GameStore.addCoins(reward);
    $('coinCount').textContent = GameStore.state.coins;
    $('battleMessage').textContent = questCompleted
      ? `${enemyName}を倒した！ 依頼達成！`
      : `${enemyName}を倒した！`;
    localStorage.setItem('rpgEncounterCooldownUntil', String(Date.now() + 2200));
    setTimeout(() => $('victoryPanel').classList.remove('hidden'), 500);
  }
})();
