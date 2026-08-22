(() => {
  const $ = id => document.getElementById(id);
  const shuffle = list => [...list].sort(() => Math.random() - 0.5);
  const params = new URLSearchParams(location.search);
  const enemyName = params.get('enemy') || 'スライム';
  const reward = 12;

  let firstPick = null;
  let locked = false;
  let hp = 6;
  let victory = false;

  $('enemyName').textContent = enemyName;
  $('coinCount').textContent = GameStore.state.coins;

  const hpBox = $('enemyHp');
  for (let i = 0; i < 6; i++) {
    const seg = document.createElement('span');
    seg.className = 'hp-segment active';
    hpBox.appendChild(seg);
  }

  const unlocked = WORDS.filter(word => GameStore.state.unlockedWordIds.includes(word.id));
  const words = shuffle(unlocked).slice(0, 6);
  const tiles = shuffle(words.flatMap(word => [
    { key: word.id, type: 'en', text: word.en },
    { key: word.id, type: 'ja', text: word.ja }
  ]));

  const board = $('wordBoard');
  tiles.forEach(tile => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'word-tile';
    button.textContent = tile.text;
    button.addEventListener('click', () => pick(button, tile));
    board.appendChild(button);
  });

  function pick(button, tile) {
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

  function attackEnemy() {
    hp -= 1;
    const segments = [...hpBox.children];
    if (segments[hp]) segments[hp].classList.remove('active');

    const sprite = $('enemySprite');
    sprite.classList.remove('hit');
    void sprite.offsetWidth;
    sprite.classList.add('hit');

    if (hp > 0) {
      $('battleMessage').textContent = `${enemyName}に攻撃！ あと${hp}回`;
      setTimeout(() => {
        if (!victory) $('battleMessage').textContent = '英語と日本語のペアで攻撃！';
      }, 650);
      return;
    }

    win();
  }

  function win() {
    victory = true;
    GameStore.addCoins(reward);
    $('coinCount').textContent = GameStore.state.coins;
    $('battleMessage').textContent = `${enemyName}を倒した！`;
    localStorage.setItem('rpgEncounterCooldownUntil', String(Date.now() + 2200));
    setTimeout(() => $('victoryPanel').classList.remove('hidden'), 500);
  }
})();
