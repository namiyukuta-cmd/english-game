(() => {
  const map = window.RPG_MAP;
  const returnKey = map.returnKey || 'rpgReturnPositionV1';
  const state = {
    touch: { left:false, right:false, up:false, down:false },
    encounterLock:false,
    enteringBuilding:false,
    changingMap:false
  };

  const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: map.width,
    height: map.height,
    backgroundColor: map.backgroundColor || '#78b86b',
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: { preload, create, update }
  };

  new Phaser.Game(config);

  let player;
  let cursors;
  let wasd;
  let message;

  function preload() {
    this.load.image('enemy-black-boss', 'assets/enemies/slime_black.png');
  }

  function create() {
    const g = this.add.graphics();

    g.fillStyle(map.groundColor || 0x78b86b, 1).fillRect(0, 0, map.width, map.height);

    g.fillStyle(map.roadColor || 0xd8c08a, 1);
    map.roads.forEach(r => g.fillRect(r.x, r.y, r.width, r.height));

    g.fillStyle(0x70b8df, 1);
    map.water.forEach(r => g.fillRoundedRect(r.x, r.y, r.width, r.height, 16));

    map.houses.forEach(h => {
      g.fillStyle(0xe8d0aa, 1).fillRect(h.x, h.y + 28, h.width, h.height - 28);
      g.fillStyle(0x9d5549, 1).fillTriangle(h.x - 8, h.y + 30, h.x + h.width / 2, h.y - 10, h.x + h.width + 8, h.y + 30);
      g.fillStyle(0x6e4634, 1).fillRect(h.x + h.width / 2 - 14, h.y + h.height - 32, 28, 32);
      if (h.name) {
        this.add.text(h.x + h.width / 2, h.y + 40, h.name, {
          fontFamily: 'sans-serif',
          fontSize: '18px',
          fontStyle: 'bold',
          color: '#4b2f22',
          backgroundColor: '#fff3d6dd',
          padding: { x: 7, y: 3 }
        }).setOrigin(0.5).setDepth(12);
      }
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

    const returnPos = readReturnPosition();
    const start = returnPos || map.playerStart;
    player = this.add.rectangle(start.x, start.y, 26, 32, 0xf8f6ef);
    player.setStrokeStyle(3, 0x5b4050);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);
    this.physics.add.collider(player, obstacles);

    const cooldownUntil = Number(localStorage.getItem('rpgEncounterCooldownUntil') || 0);
    if (Date.now() < cooldownUntil) {
      state.encounterLock = true;
      this.time.delayedCall(Math.max(200, cooldownUntil - Date.now()), () => {
        state.encounterLock = false;
      });
    }

    const exits = this.physics.add.staticGroup();
    (map.exits || []).forEach(exitData => {
      const exit = this.add.rectangle(
        exitData.x,
        exitData.y,
        exitData.width,
        exitData.height,
        0xffef9a,
        0.12
      );
      exit.destination = exitData.destination;
      exit.destinationReturnKey = exitData.destinationReturnKey;
      exit.destinationPosition = exitData.destinationPosition;
      exit.exitName = exitData.name || '次の場所';
      exit.requiredDefeatedEnemyId = exitData.requiredDefeatedEnemyId || '';
      exit.blockedMessage = exitData.blockedMessage || '道が塞がれている。';
      this.physics.add.existing(exit, true);
      exits.add(exit);

      if (exitData.label) {
        const labelPos = exitData.labelPosition || { x:exitData.x, y:exitData.y };
        this.add.text(labelPos.x, labelPos.y, exitData.label, {
          fontFamily: 'sans-serif',
          fontSize: '17px',
          fontStyle: 'bold',
          color: '#4b3440',
          backgroundColor: '#fffaf0dd',
          padding: { x:8, y:4 }
        }).setOrigin(0.5).setDepth(15);
      }
    });

    this.physics.add.overlap(player, exits, (_p, exit) => {
      if (state.changingMap) return;
      if (
        exit.requiredDefeatedEnemyId &&
        !readDefeatedEnemyIds().has(exit.requiredDefeatedEnemyId)
      ) {
        player.body.setVelocity(0);
        showMessage(exit.blockedMessage);
        return;
      }
      state.changingMap = true;
      player.body.setVelocity(0);
      const nextPosition = exit.destinationPosition || map.playerStart;
      savePosition(
        exit.destinationReturnKey || 'rpgReturnPositionV1',
        nextPosition.x,
        nextPosition.y
      );
      showMessage(`${exit.exitName}へ移動`);
      this.time.delayedCall(250, () => {
        location.href = `${exit.destination}?v=20260824-6`;
      });
    });

    const entrances = this.physics.add.staticGroup();
    map.houses
      .filter(h => h.href && h.entrance)
      .forEach(h => {
        const door = this.add.rectangle(
          h.entrance.x,
          h.entrance.y,
          h.entrance.width,
          h.entrance.height,
          0xf5d58a,
          0.18
        );
        door.destination = h.href;
        door.buildingName = h.name || '建物';
        door.returnPosition = h.returnPosition;
        this.physics.add.existing(door, true);
        entrances.add(door);
      });

    this.physics.add.overlap(player, entrances, (_p, door) => {
      if (state.enteringBuilding) return;
      state.enteringBuilding = true;
      player.body.setVelocity(0);
      const returnPosition = door.returnPosition || { x: player.x, y: player.y + 40 };
      saveReturnPosition(returnPosition.x, returnPosition.y);
      showMessage(`${door.buildingName}に入る`);
      this.time.delayedCall(250, () => {
        location.href = `${door.destination}?v=20260824-6`;
      });
    });

    const npcs = this.physics.add.staticGroup();
    map.npcs.forEach(n => {
      const npc = this.add.rectangle(n.x, n.y, 28, 32, 0xffd36f);
      npc.setStrokeStyle(3, 0x6b4a57);
      npc.name = n.name;
      this.physics.add.existing(npc, true);
      npcs.add(npc);
    });

    const enemies = this.physics.add.staticGroup();
    const defeatedEnemyIds = readDefeatedEnemyIds();
    map.enemies
      .filter(e => !defeatedEnemyIds.has(e.id))
      .forEach(e => {
        const enemy = createEnemySprite(this, e);
        this.physics.add.existing(enemy, true);
        enemies.add(enemy);
      });

    this.physics.add.overlap(player, npcs, (_p, npc) => {
      showMessage(`${npc.name}「こんにちは」`);
    });

    this.physics.add.overlap(player, enemies, (_p, enemy) => {
      if (state.encounterLock) return;
      state.encounterLock = true;
      player.body.setVelocity(0);
      saveReturnPosition(player.x, player.y);
      showMessage(`${enemy.name}に遭遇！`);
      this.time.delayedCall(450, () => {
        const returnPage = map.page || 'rpg.html';
        location.href = `battle.html?enemy=${encodeURIComponent(enemy.name)}&id=${encodeURIComponent(enemy.enemyId || '')}&return=${encodeURIComponent(returnPage)}&v=20260824-6`;
      });
    });

    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys('W,A,S,D');

    message = this.add.text(map.width / 2, map.height - 48, '歩いてみよう', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#4b3440',
      backgroundColor: '#fffaf0',
      padding: { x: 14, y: 9 }
    }).setOrigin(0.5).setDepth(20);

    this.add.text(12, 12, map.title || 'RPG MAP', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#493642aa',
      padding: { x: 8, y: 5 }
    }).setDepth(20);

    bindTouchControls();
  }

  function createEnemySprite(scene, e) {
    if (e.boss && e.kind === 'black') {
      const enemy = scene.add.image(e.x, e.y, 'enemy-black-boss');
      enemy.setDisplaySize(92, 92);
      enemy.setDepth(8);
      enemy.name = e.name;
      enemy.enemyId = e.id;

      scene.add.text(e.x, e.y - 56, 'BOSS', {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#17141add',
        padding: { x:6, y:2 }
      }).setOrigin(0.5).setDepth(10);

      return enemy;
    }

    const colors = {
      pink: { fill: 0xe86b79, stroke: 0x7a3441 },
      blue: { fill: 0x65aee8, stroke: 0x315b83 },
      green: { fill: 0x65bf72, stroke: 0x326b3b },
      red: { fill: 0xe25555, stroke: 0x7f2929 },
      black: { fill: 0x17141a, stroke: 0x050405 },
      'horn-purple': { fill: 0x9a62d4, stroke: 0x4e2d73 }
    };

    const palette = colors[e.kind] || colors.pink;
    const radius = e.boss ? 32 : 19;
    const enemy = scene.add.circle(e.x, e.y, radius, palette.fill);
    enemy.setStrokeStyle(e.boss ? 5 : 3, palette.stroke);
    enemy.name = e.name;
    enemy.enemyId = e.id;
    enemy.setDepth(8);

    const eyeOffset = e.boss ? 11 : 7;
    const eyeY = e.y - (e.boss ? 5 : 3);
    const eyeRadius = e.boss ? 3.5 : 2.5;
    const eyeColor = e.kind === 'black' ? 0xffdc55 : 0x2b1d2c;
    scene.add.circle(e.x - eyeOffset, eyeY, eyeRadius, eyeColor).setDepth(9);
    scene.add.circle(e.x + eyeOffset, eyeY, eyeRadius, eyeColor).setDepth(9);

    if (e.boss) {
      scene.add.text(e.x, e.y - radius - 17, 'BOSS', {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#17141add',
        padding: { x:6, y:2 }
      }).setOrigin(0.5).setDepth(10);
    }

    if (e.kind === 'horn-purple') {
      scene.add.triangle(e.x - 11, e.y - 24, -6, 7, 0, -9, 6, 7, 0xf2dfbd)
        .setStrokeStyle(2, 0x6d5438)
        .setDepth(9);
      scene.add.triangle(e.x + 11, e.y - 24, -6, 7, 0, -9, 6, 7, 0xf2dfbd)
        .setStrokeStyle(2, 0x6d5438)
        .setDepth(9);
    }

    return enemy;
  }

  function update() {
    const touchMoving = Object.values(state.touch).some(Boolean);
    const speed = touchMoving ? 105 : 165;
    let x = 0;
    let y = 0;

    if (state.enteringBuilding || state.changingMap) {
      player.body.setVelocity(0);
      return;
    }

    if (state.encounterLock && Number(localStorage.getItem('rpgEncounterCooldownUntil') || 0) <= Date.now()) {
      player.body.setVelocity(0);
      return;
    }

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

  function savePosition(key, x, y) {
    localStorage.setItem(key, JSON.stringify({ x, y }));
  }

  function saveReturnPosition(x, y) {
    savePosition(returnKey, x, y);
  }

  function readReturnPosition() {
    try {
      const raw = localStorage.getItem(returnKey);
      if (!raw) return null;
      localStorage.removeItem(returnKey);
      const pos = JSON.parse(raw);
      if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return null;
      return { x: pos.x, y: pos.y };
    } catch (_error) {
      localStorage.removeItem(returnKey);
      return null;
    }
  }

  function readDefeatedEnemyIds() {
    try {
      const ids = JSON.parse(localStorage.getItem('rpgDefeatedEnemyIdsV1') || '[]');
      return new Set(Array.isArray(ids) ? ids.filter(Boolean) : []);
    } catch (_error) {
      return new Set();
    }
  }

  function bindTouchControls() {
    const dpad = document.querySelector('.dpad');
    const blockBrowserGesture = event => event.preventDefault();

    if (dpad) {
      dpad.addEventListener('contextmenu', blockBrowserGesture, { capture:true });
      dpad.addEventListener('selectstart', blockBrowserGesture, { capture:true });
      dpad.addEventListener('dragstart', blockBrowserGesture, { capture:true });
      dpad.addEventListener('touchstart', blockBrowserGesture, { passive:false, capture:true });
      dpad.addEventListener('touchmove', blockBrowserGesture, { passive:false, capture:true });
    }

    document.querySelectorAll('[data-dir]').forEach(button => {
      const dir = button.dataset.dir;
      const on = event => {
        event.preventDefault();
        if (event.pointerId !== undefined && button.setPointerCapture) {
          button.setPointerCapture(event.pointerId);
        }
        state.touch[dir] = true;
      };
      const off = event => {
        event.preventDefault();
        state.touch[dir] = false;
      };

      button.draggable = false;
      button.addEventListener('pointerdown', on);
      button.addEventListener('pointerup', off);
      button.addEventListener('pointercancel', off);
      button.addEventListener('pointerleave', off);
      button.addEventListener('touchstart', on, { passive:false });
      button.addEventListener('touchend', off, { passive:false });
      button.addEventListener('touchcancel', off, { passive:false });
    });
  }
})();
