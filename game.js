const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const restartBtn = document.getElementById('restart');
const speedInput = document.getElementById('speed');
const speedValueEl = document.getElementById('speedValue');
const gridSelect = document.getElementById('grid');
const difficultySelect = document.getElementById('difficulty');

const SETTINGS_KEY = 'snake-settings';
const BEST_KEY = 'snake-best';

const DIFFICULTY_PRESETS = {
  easy: { speedMs: 160, gridSize: 16 },
  normal: { speedMs: 110, gridSize: 20 },
  hard: { speedMs: 80, gridSize: 24 },
};

const defaultSettings = {
  ...DIFFICULTY_PRESETS.normal,
  difficulty: 'normal',
};

let settings = loadSettings();

const fixedCanvasSize = canvas.width;
let gridSize = settings.gridSize;
let tile = fixedCanvasSize / gridSize;

let snake;
let dir;
let nextDir;
let food;
let score;
let timer;
let paused = false;
let best = Number(localStorage.getItem(BEST_KEY) || 0);
bestEl.textContent = best;

syncSettingsUI();

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const speedMs = Number(saved.speedMs) || defaultSettings.speedMs;
    const gridSize = Number(saved.gridSize) || defaultSettings.gridSize;

    const matchedDifficulty = getDifficultyByValues(speedMs, gridSize);

    return {
      speedMs,
      gridSize,
      difficulty: saved.difficulty || matchedDifficulty || 'custom',
    };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function syncSettingsUI() {
  speedInput.value = String(settings.speedMs);
  speedValueEl.textContent = `${settings.speedMs}ms`;
  gridSelect.value = String(settings.gridSize);
  difficultySelect.value = settings.difficulty;
}

function getDifficultyByValues(speedMs, gridSize) {
  for (const [difficulty, preset] of Object.entries(DIFFICULTY_PRESETS)) {
    if (preset.speedMs === speedMs && preset.gridSize === gridSize) {
      return difficulty;
    }
  }
  return null;
}

function updateDifficultyByCurrentValues() {
  settings.difficulty = getDifficultyByValues(settings.speedMs, settings.gridSize) || 'custom';
  difficultySelect.value = settings.difficulty;
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(tick, settings.speedMs);
}

function reset() {
  gridSize = settings.gridSize;
  tile = fixedCanvasSize / gridSize;

  snake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  paused = false;
  scoreEl.textContent = score;

  placeFood();
  startTimer();
  draw();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some(p => p.x === food.x && p.y === food.y));
}

function tick() {
  if (paused) return;

  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (
    head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize ||
    snake.some((p, i) => i !== snake.length - 1 && p.x === head.x && p.y === head.y)
  ) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
      bestEl.textContent = best;
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  clearInterval(timer);
  draw();
  ctx.fillStyle = 'rgba(0,0,0,.56)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f9fafb';
  ctx.textAlign = 'center';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 4);
  ctx.font = '18px sans-serif';
  ctx.fillText('点击“重新开始”再来一局', canvas.width / 2, canvas.height / 2 + 30);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#0b1220' : '#0f172a';
      ctx.fillRect(x * tile, y * tile, tile, tile);
    }
  }

  ctx.fillStyle = '#ef4444';
  roundRect(food.x * tile + 2, food.y * tile + 2, tile - 4, tile - 4, 6);

  snake.forEach((part, i) => {
    ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a';
    roundRect(part.x * tile + 1, part.y * tile + 1, tile - 2, tile - 2, 5);
  });
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function setDirection(x, y) {
  if (x === -dir.x && y === -dir.y) return;
  nextDir = { x, y };
}

speedInput.addEventListener('input', (e) => {
  const speedMs = Number(e.target.value);
  settings.speedMs = speedMs;
  speedValueEl.textContent = `${speedMs}ms`;
  updateDifficultyByCurrentValues();
  saveSettings();
  startTimer();
});

gridSelect.addEventListener('change', (e) => {
  settings.gridSize = Number(e.target.value);
  updateDifficultyByCurrentValues();
  saveSettings();
  reset();
});

difficultySelect.addEventListener('change', (e) => {
  const difficulty = e.target.value;
  settings.difficulty = difficulty;

  if (difficulty !== 'custom') {
    const preset = DIFFICULTY_PRESETS[difficulty];
    settings.speedMs = preset.speedMs;
    settings.gridSize = preset.gridSize;
    syncSettingsUI();
    saveSettings();
    reset();
    return;
  }

  saveSettings();
});

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'arrowup' || key === 'w') setDirection(0, -1);
  if (key === 'arrowdown' || key === 's') setDirection(0, 1);
  if (key === 'arrowleft' || key === 'a') setDirection(-1, 0);
  if (key === 'arrowright' || key === 'd') setDirection(1, 0);
  if (key === ' ') paused = !paused;
});

restartBtn.addEventListener('click', reset);

reset();
