(() => {
  const map = window.RPG_MAP;
  const state = { touch: { left:false, right:false, up:false, down:false }, encounterLock:false };

  const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: map.width,
    height: map.height,
    backgroundColor: '#78b86b',
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: { create, update }
  };

  new Phaser.Game(config);

  let player;
  let cursors;
  let wasd;
  let message;

  function create() {
    const g = this.add.graphics();

    g.fillStyle(0x78b86b, 1).fillRect(0, 0, map.width, map.height);

    g.fillStyle(0xd8c08a, 1);
    map.roads.forEach(r => g.fillRect(r.x, r.y, r.width, r.height));

    g.fillStyle(0x70b8df, 1);
    map.water.forEach(r => g.fillRoundedRect(r.x, r.y, r.width, r.height, 16));

    map.houses.forEach(h => {
      g.fillStyle(0xe8d0aa, 1).fillRect(h.x, h.y + 28, h.width, h.height - 28);
      g.fillStyle(0x9d5549, 1).fillTriangle(h.x - 8, h.y + 30, h.x + h.width / 2, h.y - 10, h.x + h.width + 8, h.y + 30);
      g.fillStyle(0x6e4634, 1).fillRect(h.x + h.width / 2 - 14, h.y + h.height - 32, 28, 32);
    });

    map.trees.forEach(t => {
      g.fillStyle(0x6b4934, 1).fillRect(t.x - 5, t.y + 10, 10, 22);
      g.fillStyle(0x2e7d4e, 1).fillCircle(t.x, t.y, 20);
    });

    const obstacles = this.physics.add.staticGroup();
    map.houses.forEach(h => {
      const block = this.add.rectangle(h.x + h.width / 2, h.y + h.height / 2 + 12, h.width, h.height - 24, 0x000000, 0);
      this.physics.add.existing(block, true);
      obstacles.add(block);
    });
    map.water.forEach(r => {
      const block = this.add.rectangle(r.x + r.width / 2, r.y + r.height / 2, r.width, r.height, 0x000000, 0);
      this.physics.add.existing(block, true);
      obstacles.add(block);
    });
    map.trees.forEach(t => {
      const block = this.add.circle(t.x, t.y + 9, 14, 0x000000, 0);
      this.physics.add.existing(block, true);
      obstacles.add(block);
    });

    player = this.add.rectangle(map.playerStart.x, map.playerStart.y, 26, 32, 0xf8f6ef);
    player.setStrokeStyle(3, 0x5b4050);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    this.physics.add.collider(player, obstacles);

    const npcs = this.physics.add.staticGroup();
    map.npcs.forEach(n => {
      const npc = this.add.rectangle(n.x, n.y, 28, 32, 0xffd36f);
      npc.setStrokeStyle(3, 0x6b4a57);
      npc.name = n.name;
      this.physics.add.existing(npc, true);
      npcs.add(npc);
    });

    const enemies = this.physics.add.staticGroup();
    map.enemies.forEach(e => {
      const enemy = this.add.circle(e.x, e.y, 18, 0xe86b79);
      enemy.setStrokeStyle(3, 0x7a3441);
      enemy.name = e.name;
      this.physics.add.existing(enemy, true);
      enemies.add(enemy);
    });

    this.physics.add.overlap(player, npcs, (_p, npc) => {
      showMessage(`${npc.name}「こんにちは」`);
    });

    this.physics.add.overlap(player, enemies, (_p, enemy) => {
      if (state.encounterLock) return;
      state.encounterLock = true;
      showMessage(`${enemy.name}に遭遇！　ここから英語戦闘画面へ`);
      this.time.delayedCall(1200, () => { state.encounterLock = false; });
    });

    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys('W,A,S,D');

    message = this.add.text(400, 552, '歩いてみよう', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#4b3440',
      backgroundColor: '#fffaf0',
      padding: { x: 14, y: 9 }
    }).setOrigin(0.5).setDepth(10);

    this.add.text(14, 12, 'RPG TEST MAP', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#ffffff',
      backgroundColor: '#493642aa', padding: { x: 8, y: 5 }
    }).setDepth(10);

    bindTouchControls();
  }

  function update() {
    const speed = 165;
    let x = 0;
    let y = 0;

    if (cursors.left.isDown || wasd.A.isDown || state.touch.left) x -= 1;
    if (cursors.right.isDown || wasd.D.isDown || state.touch.right) x += 1;
    if (cursors.up.isDown || wasd.W.isDown || state.touch.up) y -= 1;
    if (cursors.down.isDown || wasd.S.isDown || state.touch.down) y += 1;

    if (x && y) {
      x *= 0.7071;
      y *= 0.7071;
    }

    player.body.setVelocity(x * speed, y * speed);
  }

  function showMessage(text) {
    if (message) message.setText(text);
  }

  function bindTouchControls() {
    document.querySelectorAll('[data-dir]').forEach(button => {
      const dir = button.dataset.dir;
      const on = event => { event.preventDefault(); state.touch[dir] = true; };
      const off = event => { event.preventDefault(); state.touch[dir] = false; };
      button.addEventListener('pointerdown', on);
      button.addEventListener('pointerup', off);
      button.addEventListener('pointercancel', off);
      button.addEventListener('pointerleave', off);
    });
  }
})();
