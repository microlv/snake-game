const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const restartBtn = document.getElementById('restart');

const gridSize = 20;
const tile = canvas.width / gridSize;
const speedMs = 110;

let snake;
let dir;
let nextDir;
let food;
let score;
let timer;
let paused = false;
let best = Number(localStorage.getItem('snake-best') || 0);
bestEl.textContent = best;

function reset() {
  snake = [{ x: 10, y: 10 }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  paused = false;
  scoreEl.textContent = score;
  placeFood();
  clearInterval(timer);
  timer = setInterval(tick, speedMs);
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
      localStorage.setItem('snake-best', String(best));
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
