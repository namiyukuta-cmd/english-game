const COLS = 16;
const ROWS = 11;

const field = document.getElementById('field');
const status = document.getElementById('status');
const count = document.getElementById('count');

let currentTool = 'block';
let blockCount = 0;
const cells = [];

function createGrid() {
  for (let row = 0; row < ROWS; row++) {
    for (let x = 0; x < COLS; x++) {
      const y = ROWS - 1 - row;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      cell.setAttribute('aria-label', `X ${x} Y ${y}`);
      field.appendChild(cell);
      cells.push(cell);
    }
  }
}

function updateCount() {
  count.textContent = `${blockCount} 個`;
}

function selectCell(cell) {
  cells.forEach(c => c.classList.remove('target'));
  cell.classList.add('target');
  status.textContent = `選択 X:${cell.dataset.x} / Y:${cell.dataset.y}`;
}

function act(cell) {
  selectCell(cell);

  if (currentTool === 'block') {
    if (!cell.classList.contains('block')) {
      cell.classList.add('block');
      blockCount++;
    }
  } else if (currentTool === 'delete') {
    if (cell.classList.contains('block')) {
      cell.classList.remove('block');
      blockCount--;
    }
  }

  updateCount();
}

function bindGridEvents() {
  cells.forEach(cell => {
    cell.addEventListener('pointerdown', () => selectCell(cell));
    cell.addEventListener('click', () => act(cell));
  });
}

function bindTools() {
  document.querySelectorAll('.tool').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = btn.dataset.tool;
      status.textContent = currentTool === 'block'
        ? '置くマスをタップ'
        : '消すブロックをタップ';
    });
  });
}

function bindNavigation() {
  document.getElementById('back').addEventListener('click', () => {
    location.href = './housebuilding_選択.html';
  });
}

createGrid();
bindGridEvents();
bindTools();
bindNavigation();
updateCount();
