(() => {
  const $ = id => document.getElementById(id);
  const shuffle = list => [...list].sort(() => Math.random() - 0.5);
  const normalize = value => String(value).trim().toLowerCase();
  const params = new URLSearchParams(location.search);

  const enemyName = params.get('enemy') || 'スライム';
  const enemyId = params.get('id') || '';
  const requestedReturnPage = params.get('return') || 'rpg.html';
  const allowedReturnPages = new Set([
    'rpg.html',
    'rpg_field.html',
    'rpg_forest.html',
    'rpg_deep_forest.html',
    'rpg_lake.html'
  ]);
  const returnPage = allowedReturnPages.has(requestedReturnPage)
    ? requestedReturnPage
    : 'rpg.html';

  const isBlackBoss =
    enemyId === 'boss_black_slime_01' ||
    enemyName.includes('黒スライム');

  const mapSentenceLevel = {
    'rpg_forest.html': 3,
    'rpg_deep_forest.html': 4,
    'rpg_lake.html': 5
  };
  const sentenceLevel = isBlackBoss ? 2 : (mapSentenceLevel[returnPage] || 0);
  const sentenceMode = isBlackBoss || sentenceLevel >= 3;
  const reward = isBlackBoss ? 50 : sentenceMode ? 18 + sentenceLevel * 6 : 12;

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
    if (enemyName.includes('青')) return enemyImages.blue;
    if (enemyName.includes('緑')) return enemyImages.green;
    if (enemyName.includes('ツノ') || enemyName.includes('紫')) return enemyImages.purple;
    return enemyImages.red;
  }

  const studyPool = WordData.getCurrentStudyWords(GameStore.state.studyProgress);
  const unlocked = studyPool.filter(word => GameStore.state.unlockedWordIds.includes(word.id));
  const allSentences = Array.isArray(window.SENTENCES) ? window.SENTENCES : [];

  function getSentencePool() {
    if (!sentenceMode) return [];
    if (isBlackBoss) return allSentences.filter(sentence => sentence.level <= 2);

    const exactLevel = allSentences.filter(sentence => sentence.level === sentenceLevel);
    if (exactLevel.length >= 4) return exactLevel;
    return allSentences.filter(sentence => sentence.level <= sentenceLevel && sentence.level >= Math.max(2, sentenceLevel - 1));
  }

  const sentencePool = getSentencePool();
  const sentenceRoundCount = isBlackBoss ? 5 : sentenceLevel >= 4 ? 4 : 3;
  const sentenceRounds = sentenceMode
    ? shuffle(sentencePool).slice(0, sentenceRoundCount)
    : [];
  const maxHp = sentenceMode ? Math.max(1, sentenceRounds.length) : 6;

  let firstPick = null;
  let sentenceRound = 0;
  let sentencePicked = [];
  let locked = false;
  let hp = maxHp;
  let victory = false;
  let wrongEffectTimer = 0;

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

  if (sentenceMode) {
    document.querySelector('.battle-shell').classList.add('boss-sentence-mode');
    $('bossSentenceBattle').classList.remove('hidden');
    board.classList.add('sentence-board');
    renderSentenceRound();
  } else {
    renderWordPairBattle();
  }

  function renderWordPairBattle() {
    const source = unlocked.length >= 6 ? unlocked : WordData.all;
    const words = shuffle(source).slice(0, 6);
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
    signalWrongAnswer();
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
    const candidates = [
      ...(Array.isArray(window.WORDS) ? window.WORDS.map(word => word.en) : []),
      ...allSentences.flatMap(item => item.answer)
    ].filter(word => !answerWords.has(normalize(word)));
    return [...new Set(shuffle(candidates))].slice(0, count);
  }

  function renderSentenceRound() {
    if (victory) return;
    const sentence = sentenceRounds[sentenceRound];
    if (!sentence) return;

    locked = false;
    sentencePicked = [];
    board.innerHTML = '';

    const levelLabel = isBlackBoss ? 'BOSS' : `LEVEL ${sentenceLevel}`;
    $('bossSentencePrompt').textContent =
      `${levelLabel}　第${sentenceRound + 1}問 / ${sentenceRounds.length}　「${sentence.jp}」`;
    renderSentenceAnswer();
    $('battleMessage').textContent = '正しい英文になるように単語を選ぼう';

    const distractorCount = sentenceLevel >= 5 ? 4 : sentenceLevel >= 4 ? 3 : 2;
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

    const sentence = sentenceRounds[sentenceRound];
    const expectedWord = sentence.answer[sentencePicked.length];
    if (normalize(word) !== normalize(expectedWord)) {
      const answerWords = sentence.answer.map(normalize);
      const isWrongOrder = answerWords.includes(normalize(word));
      locked = true;
      button.classList.add('wrong');
      signalWrongAnswer();
      $('battleMessage').textContent = isWrongOrder
        ? '順番が違います。次に入る単語を選ぼう'
        : 'その単語は使いません。別の単語を選ぼう';

      setTimeout(() => {
        button.classList.remove('wrong');
        locked = false;
      }, 440);
      return;
    }

    sentencePicked.push({ button, word, index });
    button.classList.add('matched');
    renderSentenceAnswer();

    if (sentencePicked.length === sentence.answer.length) {
      locked = true;
      setTimeout(checkSentence, 180);
    }
  }

  function renderSentenceAnswer() {
    $('bossSentenceAnswer').textContent = sentencePicked.length
      ? sentencePicked.map(item => item.word).join(' ')
      : 'ここに英文ができます';
  }

  function resetSentenceSelection() {
    if (victory) return;
    sentencePicked.forEach(item => item.button.classList.remove('matched', 'wrong'));
    sentencePicked = [];
    locked = false;
    renderSentenceAnswer();
  }

  function checkSentence() {
    const sentence = sentenceRounds[sentenceRound];
    const answer = sentencePicked.map(item => normalize(item.word));
    const correct = answer.every((word, index) => word === normalize(sentence.answer[index]));

    if (!correct) {
      signalWrongAnswer();
      $('battleMessage').textContent = '語順が違います。選びなおそう';
      sentencePicked.forEach(item => item.button.classList.add('wrong'));
      setTimeout(resetSentenceSelection, 650);
      return;
    }

    if (typeof GameStore.seeSentence === 'function') GameStore.seeSentence(sentence.id);
    const completedSentence = sentence.answer.join(' ');
    sentenceRound += 1;
    attackEnemy(completedSentence);
  }

  $('bossSentenceReset').addEventListener('click', resetSentenceSelection);

  function signalWrongAnswer() {
    const layer = $('wrongEffect');
    if (!layer) return;

    clearTimeout(wrongEffectTimer);
    const particleData = [
      [-128,-72,18,-32,0],[-96,-20,11,24,10],[-76,58,16,-18,20],
      [-42,-92,10,42,0],[-24,34,20,-35,25],[-8,-48,13,16,15],
      [18,72,12,38,10],[36,-78,19,-22,20],[58,22,10,30,0],
      [78,-36,15,-40,25],[98,66,18,18,15],[126,-8,12,-28,5]
    ];
    const particles = particleData.map(([x,y,size,rotate,delay]) => {
      const particle = document.createElement('span');
      particle.style.setProperty('--x', `${x}px`);
      particle.style.setProperty('--y', `${y}px`);
      particle.style.setProperty('--size', `${size}px`);
      particle.style.setProperty('--rotate', `${rotate}deg`);
      particle.style.setProperty('--delay', `${delay}ms`);
      return particle;
    });

    layer.replaceChildren(...particles);
    layer.classList.remove('show');
    void layer.offsetWidth;
    layer.classList.add('show');
    wrongEffectTimer = setTimeout(() => {
      layer.classList.remove('show');
      layer.replaceChildren();
    }, 520);
  }

  function attackEnemy(completedSentence = '') {
    hp -= 1;
    const segments = [...hpBox.children];
    if (segments[hp]) segments[hp].classList.remove('active');

    const sprite = $('enemySprite');
    sprite.classList.remove('hit');
    void sprite.offsetWidth;
    sprite.classList.add('hit');

    if (hp > 0) {
      if (sentenceMode) {
        $('battleMessage').textContent = `正解！ ${completedSentence}.　${enemyName}に攻撃！`;
        setTimeout(() => {
          if (!victory) renderSentenceRound();
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
