const snakeGameboard = document.querySelector('#snakeGame');
const ctx = snakeGameboard.getContext('2d');
const snakeHead = document.getElementById('snake-head');
const snakeBody = document.getElementById('snake-body');
const snakeSprite = document.getElementById('snake-sprite');
const boardBg = document.getElementById('gameboard-bg');
const shroom = document.getElementById('shroom');
const apple = document.getElementById('apple');
const burger = document.getElementById('burger');
const sphere = document.getElementById('sphere');
const wall = document.getElementById('wall');
const playButton = document.querySelector('#play-button');
const dialogue = document.querySelector('#dialogue');
const menu = document.querySelector('#menu');
const game = document.querySelector('#game');
const skipButton = document.querySelector('#skip');
const deathScreen = document.querySelector('#death-screen');
const playAgainButton = document.querySelector('#play-again');

let foodX;
let foodY;
let badFoodX;
let badFoodY;
let poisonousFoodX;
let poisonousFoodY;

let isPlaying = false;
let isIntroFinished = false;
let score = 0;
let dx = 25;
let dy = 0;
let hp = 100;
let gameOver = false;
let changingDirection;
let gameSpeed = 100;
let swapSpeed = 500;
let isSwapFinished = false;
let isPoisoned = false;
const boardBorder = 'red';
const snakeColor = 'cyan';
const snakeBorder = 'black';
let foodColor = 'lightgreen';
let foodBorderColor = 'black';
let badFoodColor = 'red';
let badFoodBorderColor = 'black';
let poisonousFoodColor = 'yellow';
let poisonousFoodBorderColor = 'black';
let snake = [
  { x: 200, y: 200 },
  { x: 190, y: 200 },
  { x: 180, y: 200 },
  { x: 170, y: 200 },
  { x: 160, y: 200 },
];
// Game
skipButton.addEventListener('click', () => {
  isIntroFinished = true;
  menu.style.display = 'none';
  game.style.display = 'block';
  dialogue.style.display = 'none';
  main();
  swapFoods();
  fastMoveSkill();
});
playButton.addEventListener('click', () => {
  isPlaying = true;
  menu.style.visibility = 'hidden';
  menu.style.marginTop = '0px';
  dialogue.style.display = 'flex';
  document.addEventListener('keydown', changeDirection);
  if (isIntroFinished) {
    main();
    swapFoods();
    fastMoveSkill();
  }
});
playAgainButton.addEventListener('click', () => {
  gameOver = false;
  snakeGameboard.style.display = 'block';
  deathScreen.style.display = 'none';
  restartGame();
  main();
  swapFoods();
  fastMoveSkill();
});
// Logic
function main() {
  hasGameEnded();
  if (gameOver) {
    snakeGameboard.style.display = 'none';
    deathScreen.style.display = 'flex';
    return;
  }
  changingDirection = false;
  setTimeout(function onTick() {
    clearCanvas();
    if (isPoisoned) {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = 'green';
      ctx.fillRect(0, 0, snakeGameboard.width - 25, snakeGameboard.height - 25);
    }
    ctx.globalAlpha = 1;
    drawWalls();
    drawFood();
    moveSnake();
    drawSnake();
    main();
  }, gameSpeed);
}
function restartGame() {
  score = 0;
  dx = 25;
  dy = 0;
  hp = 100;
  gameOver = false;
  gameSpeed = 100;
  swapSpeed = 500;
  snake = [
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 },
    { x: 170, y: 200 },
    { x: 160, y: 200 },
  ];
  document.getElementById('score').innerHTML = `Score: ${score}`;
  document.getElementById('hp').innerHTML = `Hp: ${hp}`;
}
function hasGameEnded() {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  const hitLeftWall = snake[0].x < 25;
  const hitRightWall = snake[0].x > snakeGameboard.width - 50;
  const hitTopWall = snake[0].y < 25;
  const hitBottomWall = snake[0].y > snakeGameboard.height - 50;
  if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
    gameOver = true;
  }
}

function drawSnake() {
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00bbff';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  const gradient = ctx.createLinearGradient(
    snake[0].x,
    snake[0].y,
    snake[snake.length - 1].x,
    snake[snake.length - 1].y
  );
  gradient.addColorStop(0, '#00fff6');
  gradient.addColorStop(1, '#009dff');
  ctx.fillStyle = gradient;
  for (let i = 0; i < snake.length; i++) {
    ctx.fillRect(snake[i].x, snake[i].y, 25, 25);
    ctx.strokeRect(snake[i].x, snake[i].y, 25, 25);
  }
}

function moveSnake() {
  // Create the new Snake's head
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  // Add the new head to the beginning of snake body
  snake.unshift(head);
  const hasEatenFood = snake[0].x === foodX && snake[0].y === foodY;
  const hasEatenBadFood = snake[0].x === badFoodX && snake[0].y === badFoodY;
  const hasEatenPoisonousFood =
    snake[0].x === poisonousFoodX && snake[0].y === poisonousFoodY;
  if (hasEatenFood && isSwapFinished === true) {
    if (isPoisoned) {
      isPoisoned = false;
      document.getElementById('poison-screen').style.display = 'none';
    }
    score += 10;
    hp !== 100 ? (hp += 5) : hp;
    document.getElementById('score').innerHTML = `Score: ${score}`;
    document.getElementById('hp').innerHTML = `Hp: ${hp}`;
    isSwapFinished = false;
    swapFoods();
  } else if (hasEatenBadFood && isSwapFinished === true) {
    score -= 10;
    hp -= 10;
    document.getElementById('score').innerHTML = `Score: ${score}`;
    document.getElementById('hp').innerHTML = `Hp: ${hp}`;
    isSwapFinished = false;
    swapFoods();
  } else if (hasEatenPoisonousFood && isSwapFinished === true) {
    isPoisoned = true;
    score -= 5;
    hp -= 5;
    document.getElementById('poison-screen').style.display = 'none';
    document.getElementById('score').innerHTML = `Score: ${score}`;
    document.getElementById('hp').innerHTML = `Hp: ${hp}`;
    isSwapFinished = false;
    swapFoods();
  } else {
    // Remove the last part of snake body
    snake.pop();
  }
}

function clearCanvas() {
  ctx.shadowColor = '#ee00ff';
  ctx.drawImage(
    boardBg,
    0,
    0,
    snakeGameboard.width - 25,
    snakeGameboard.height - 25
  );
}

function changeDirection(event) {
  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const UP_KEY = 38;
  const DOWN_KEY = 40;
  const A_KEY = 65;
  const D_KEY = 68;
  const W_KEY = 87;
  const S_KEY = 83;
  if (changingDirection) return;
  changingDirection = true;
  const keyPressed = event.keyCode;
  const goingUp = dy === -25;
  const goingDown = dy === 25;
  const goingRight = dx === 25;
  const goingLeft = dx === -25;
  if (isPoisoned) {
    if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingRight) {
      dx = -25;
      dy = 0;
    }
    if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingDown) {
      dx = 0;
      dy = -25;
    }
    if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingLeft) {
      dx = 25;
      dy = 0;
    }
    if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingUp) {
      dx = 0;
      dy = 25;
    }
  } else {
    if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
      dx = -25;
      dy = 0;
    }
    if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
      dx = 0;
      dy = -25;
    }
    if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
      dx = 25;
      dy = 0;
    }
    if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
      dx = 0;
      dy = 25;
    }
  }
}

function randomFood(min, max) {
  let coordinates = Math.round((Math.random() * (max - min) + min) / 25) * 25;
  while (coordinates === 0 || coordinates >= 750) {
    coordinates = Math.round((Math.random() * (max - min) + min) / 25) * 25;
  }
  return coordinates;
}

function generateFood() {
  foodX = randomFood(0, snakeGameboard.width - 25);
  foodY = randomFood(0, snakeGameboard.height - 25);
  badFoodX = randomFood(0, snakeGameboard.width - 25);
  badFoodY = randomFood(0, snakeGameboard.height - 25);
  poisonousFoodX = randomFood(0, snakeGameboard.width - 25);
  poisonousFoodY = randomFood(0, snakeGameboard.height - 25);
  snake.forEach((part) => {
    const hasEaten = part.x == foodX && part.y == foodY;
    if (hasEaten) generateFood();
  });
  snake.forEach((part) => {
    const hasEaten = part.x == badFoodX && part.y == badFoodY;
    if (hasEaten) generateFood();
  });
}

function drawFood() {
  if (isSwapFinished === true) {
    makeFoodsSame();
    return;
  }
  // Food
  ctx.fillStyle = '#32ff40';
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'green';
  ctx.strokeStyle = 'black';
  ctx.strokeRect(foodX, foodY, 25, 25);
  ctx.fillRect(foodX, foodY, 25, 25);
  // Bad Food
  ctx.fillStyle = 'red';
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'red';
  ctx.strokeStyle = 'black';
  ctx.strokeRect(badFoodX, badFoodY, 25, 25);
  ctx.fillRect(badFoodX, badFoodY, 25, 25);
  // Poisonous Food
  if (isPoisoned === false) {
    ctx.fillStyle = '#eeff00';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'yellow';
    ctx.strokeStyle = 'black';
    ctx.strokeRect(poisonousFoodX, poisonousFoodY, 25, 25);
    ctx.fillRect(poisonousFoodX, poisonousFoodY, 25, 25);
  }
}

function swapFoods() {
  let repeatTime = 0;
  let delay = setInterval(() => {
    if (repeatTime === 5) {
      clearInterval(delay);
      isSwapFinished = true;
      return;
    }
    generateFood();
    drawFood();
    swapSpeed -= 3;
    repeatTime++;
  }, swapSpeed);
}

function makeFoodsSame() {
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  if (isPoisoned === false) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.fillRect(poisonousFoodX, poisonousFoodY, 25, 25);
    ctx.strokeRect(poisonousFoodX, poisonousFoodY, 25, 25);
  }
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.fillRect(foodX, foodY, 25, 25);
  ctx.strokeRect(foodX, foodY, 25, 25);
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.fillRect(badFoodX, badFoodY, 25, 25);
  ctx.strokeRect(badFoodX, badFoodY, 25, 25);
}

function fastMoveSkill() {
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      gameSpeed = 100;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      gameSpeed = 20;
    }
  });
}

function drawWalls() {
  ctx.fillStyle = 'lightgray';
  ctx.strokeStyle = 'black';

  // Draw horizontal walls
  for (let i = 0; i < snakeGameboard.width; i += 25) {
    ctx.drawImage(wall, i, 0, 25, 25);
    ctx.drawImage(wall, i, 775, 25, 25);
  }
  // Draw vertical walls
  for (let i = 0; i < snakeGameboard.height; i += 25) {
    ctx.drawImage(wall, 0, i, 25, 25);
    ctx.drawImage(wall, 775, i, 25, 25);
  }
}
