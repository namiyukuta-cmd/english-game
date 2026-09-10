const root = document.getElementById('scene');
const errorBox = document.getElementById('error');

try {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js');

  const GRID_SIZE = 12;
  const HALF = GRID_SIZE / 2;
  const MAX_Y = 12;
  const blocks = new Map();

  let currentTool = 'block';
  let cameraAngle = Math.PI / 4;
  let cameraDistance = 24;
  let topHeight = 18;
  let viewMode = 'top';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdce5e8);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  root.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8d806c, 2.2));

  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(8, 13, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE),
    new THREE.MeshStandardMaterial({ color: 0xbbae92, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  ground.userData.isGround = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0x4d463c, 0x82786a);
  grid.position.y = 0.002;
  const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMaterials.forEach(material => {
    material.transparent = true;
    material.opacity = 0.82;
  });
  scene.add(grid);

  const blockGeometry = new THREE.BoxGeometry(0.94, 0.94, 0.94);
  const blockMaterial = new THREE.MeshStandardMaterial({ color: 0x9b7758, roughness: 0.82 });
  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
    depthWrite: false
  });
  const highlight = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.98, 0.98), highlightMaterial);
  highlight.visible = false;
  scene.add(highlight);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const activePointers = new Map();

  let gestureHadPinch = false;
  let pinchStartDistance = 0;
  let pinchStartZoom = 0;

  function keyFor(x, y, z) {
    return `${x},${y},${z}`;
  }

  function worldFromCell(x, y, z) {
    return {
      x: x - HALF + 0.5,
      y: y + 0.47,
      z: z - HALF + 0.5
    };
  }

  function groundCellFromPoint(point) {
    const x = Math.floor(point.x + HALF);
    const z = Math.floor(point.z + HALF);
    if (x < 0 || x >= GRID_SIZE || z < 0 || z >= GRID_SIZE) return null;
    return { x, y: 0, z };
  }

  function updateCamera() {
    if (viewMode === 'top') {
      camera.up.set(0, 0, -1);
      camera.position.set(0, topHeight, 0.001);
      camera.lookAt(0, 0, 0);
    } else {
      camera.up.set(0, 1, 0);
      const elevation = THREE.MathUtils.degToRad(34);
      const horizontal = Math.cos(elevation) * cameraDistance;
      const height = Math.sin(elevation) * cameraDistance;
      camera.position.set(
        Math.cos(cameraAngle) * horizontal,
        height,
        Math.sin(cameraAngle) * horizontal
      );
      camera.lookAt(0, 2, 0);
    }
    camera.updateProjectionMatrix();
  }

  function setViewMode(mode) {
    viewMode = mode;
    document.getElementById('viewTop').classList.toggle('view-active', mode === 'top');
    document.getElementById('view3d').classList.toggle('view-active', mode === '3d');
    document.getElementById('rotateLeft').disabled = mode === 'top';
    document.getElementById('rotateRight').disabled = mode === 'top';
    updateCamera();
  }

  function resize() {
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function updateCount() {
    document.getElementById('objectCount').textContent = `${blocks.size} 個`;
  }

  function showTarget(cell, label = '選択') {
    if (!cell) {
      highlight.visible = false;
      return;
    }
    const position = worldFromCell(cell.x, cell.y, cell.z);
    highlight.position.set(position.x, position.y, position.z);
    highlight.visible = true;
    document.getElementById('cellStatus').textContent =
      `${label} X:${cell.x} / Y:${cell.y} / Z:${cell.z}`;
  }

  function makeBlock(cell) {
    const position = worldFromCell(cell.x, cell.y, cell.z);
    const mesh = new THREE.Mesh(blockGeometry.clone(), blockMaterial.clone());
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      isBlock: true,
      cellX: cell.x,
      cellY: cell.y,
      cellZ: cell.z
    };
    return mesh;
  }

  function addBlock(cell) {
    if (cell.y < 0 || cell.y >= MAX_Y) return;
    const key = keyFor(cell.x, cell.y, cell.z);
    if (blocks.has(key)) return;

    const mesh = makeBlock(cell);
    blocks.set(key, mesh);
    scene.add(mesh);
    updateCount();
  }

  function removeBlock(mesh) {
    const { cellX: x, cellY: y, cellZ: z } = mesh.userData;
    const key = keyFor(x, y, z);
    if (!blocks.has(key)) return;

    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    blocks.delete(key);
    updateCount();
  }

  function raycast(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const blockHits = raycaster.intersectObjects([...blocks.values()], false);
    const groundHits = raycaster.intersectObject(ground, false);
    return [...blockHits, ...groundHits].sort((a, b) => a.distance - b.distance)[0] || null;
  }

  function targetFromHit(hit) {
    if (!hit) return null;
    if (hit.object.userData.isBlock) {
      const data = hit.object.userData;
      return { x: data.cellX, y: data.cellY + 1, z: data.cellZ };
    }
    return groundCellFromPoint(hit.point);
  }

  function previewAt(clientX, clientY) {
    const hit = raycast(clientX, clientY);
    if (!hit) {
      showTarget(null);
      return;
    }

    if (currentTool === 'delete') {
      if (hit.object.userData.isBlock) {
        const data = hit.object.userData;
        showTarget({ x: data.cellX, y: data.cellY, z: data.cellZ }, '削除');
      } else {
        showTarget(null);
      }
      return;
    }

    showTarget(targetFromHit(hit));
  }

  function actAt(clientX, clientY) {
    const hit = raycast(clientX, clientY);
    if (!hit) return;

    if (currentTool === 'delete') {
      if (hit.object.userData.isBlock) {
        removeBlock(hit.object);
        showTarget(null);
      }
      return;
    }

    const target = targetFromHit(hit);
    if (target) {
      addBlock(target);
      showTarget(target);
    }
  }

  function getPinchDistance() {
    const points = [...activePointers.values()];
    if (points.length < 2) return 0;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  function beginPinch() {
    if (activePointers.size < 2) return;
    gestureHadPinch = true;
    pinchStartDistance = getPinchDistance();
    pinchStartZoom = viewMode === 'top' ? topHeight : cameraDistance;
    highlight.visible = false;
  }

  function updatePinch() {
    if (activePointers.size < 2 || pinchStartDistance <= 0) return;
    const distance = getPinchDistance();
    if (distance <= 0) return;

    const ratio = distance / pinchStartDistance;
    if (viewMode === 'top') {
      topHeight = THREE.MathUtils.clamp(pinchStartZoom / ratio, 11, 28);
    } else {
      cameraDistance = THREE.MathUtils.clamp(pinchStartZoom / ratio, 13, 40);
    }
    updateCamera();
  }

  renderer.domElement.addEventListener('pointerdown', event => {
    renderer.domElement.setPointerCapture?.(event.pointerId);
    activePointers.set(event.pointerId, {
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY
    });

    if (activePointers.size === 1) {
      gestureHadPinch = false;
      previewAt(event.clientX, event.clientY);
    } else if (activePointers.size === 2) {
      beginPinch();
    }
  });

  renderer.domElement.addEventListener('pointermove', event => {
    const point = activePointers.get(event.pointerId);
    if (!point) return;
    point.x = event.clientX;
    point.y = event.clientY;

    if (activePointers.size >= 2) {
      updatePinch();
    }
  });

  renderer.domElement.addEventListener('pointerup', event => {
    const point = activePointers.get(event.pointerId);
    if (!point) return;

    point.x = event.clientX;
    point.y = event.clientY;
    const moved = Math.hypot(point.x - point.startX, point.y - point.startY);
    const wasSinglePointer = activePointers.size === 1;

    activePointers.delete(event.pointerId);
    renderer.domElement.releasePointerCapture?.(event.pointerId);

    if (wasSinglePointer && !gestureHadPinch && moved < 12) {
      actAt(event.clientX, event.clientY);
    }

    if (activePointers.size < 2) {
      pinchStartDistance = 0;
    }
    if (activePointers.size === 0) {
      gestureHadPinch = false;
    }
  });

  renderer.domElement.addEventListener('pointercancel', event => {
    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) pinchStartDistance = 0;
    if (activePointers.size === 0) gestureHadPinch = false;
  });

  document.querySelectorAll('.tool').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tool').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      currentTool = button.dataset.tool;
      highlight.visible = false;
      document.getElementById('cellStatus').textContent =
        currentTool === 'delete' ? '削除するブロックをタップ' : 'マスまたはブロックをタップ';
    });
  });

  document.getElementById('viewTop').addEventListener('click', () => setViewMode('top'));
  document.getElementById('view3d').addEventListener('click', () => setViewMode('3d'));
  document.getElementById('rotateLeft').addEventListener('click', () => {
    if (viewMode === '3d') {
      cameraAngle -= Math.PI / 8;
      updateCamera();
    }
  });
  document.getElementById('rotateRight').addEventListener('click', () => {
    if (viewMode === '3d') {
      cameraAngle += Math.PI / 8;
      updateCamera();
    }
  });
  document.getElementById('backBtn').addEventListener('click', () => {
    location.href = './housebuilding_index.html';
  });

  window.addEventListener('resize', resize);

  resize();
  updateCount();
  setViewMode('top');

  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
} catch (error) {
  console.error(error);
  errorBox.style.display = 'block';
}
