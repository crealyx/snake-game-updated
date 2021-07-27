const music = document.querySelector('#music');

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
const nextButton = document.querySelector('#next');
const previousButton = document.querySelector('#previous');
const skipButton = document.querySelector('#skip');
const poisonScreen = document.querySelector('#poison-screen');
const deathScreen = document.querySelector('#death-screen');
const playAgainButton = document.querySelector('#play-again');
const ui = document.querySelector('#ui');
const boss = document.querySelector('#boss');
const introText = document.querySelector('#intro-text');
const hpDisplay = document.querySelector('#hp');
const scoreDisplay = document.querySelector('#score');
const skillbar = document.querySelector('#skill-bar');

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
let introPages = [
  'Welcome to the future, player...',
  `Your objective is simple,<br> gain score and BEAT THE GAME.`,
  '<span id="green">GREEN</span> chips heal you and fix any <span id="yellow">malfunction</span>. Also give points obviously.',
  '<span id="red">RED</span> chips damage you and steal your score.',
  'BEWARE of the <span id="yellow">YELLOW</span> chips. <br>They might confuse your brain a little...',
  'But, there is a catch.. They all become the<span id="white"> SAME</span> later, so you have to use your memory.',
  'You can also use your selected ABILITIES with SPACEBAR, with <span id="red">SOME</span> cost...',
  'Oh, i almost forgot.. <br><span id="cyan">HE IS WAITING FOR YOU...</span>',
];
let gameOver = false;
let currentPage = 0;
let changingDirection;
let gameSpeed = 70;
let swapSpeed = 500;
let isSwapFinished = false;
let isPoisoned = false;
let currentSkill = '';
let skills = {
  fastMove: { activated: false, damage: 0.1 },
  revealChips: { activated: false, damage: 2.5 },
};
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
  isIntroFinished = false;
  menu.style.display = 'none';
  game.style.display = 'block';
  dialogue.style.display = 'none';
  main();
  swapFoods();
  switchSkill();
  castSkill();
});
playButton.addEventListener('click', () => {
  music.volume = 0.3;
  music.play();
  isPlaying = true;
  menu.style.visibility = 'hidden';
  menu.style.marginTop = '0px';
  dialogue.style.display = 'flex';
  document.addEventListener('keydown', changeDirection);
  if (isIntroFinished) {
    main();
    swapFoods();
    switchSkill();
    castSkill();
  }
});

if (currentPage === 0) {
  previousButton.style.display = 'none';
}
updateIntroText();
nextButton.addEventListener('click', () => {
  currentPage++;
  if (currentPage === 7) {
    nextButton.textContent = 'PLAY';
    updateIntroText();
    return;
  }
  if (currentPage === 8) {
    isIntroFinished = false;
    menu.style.display = 'none';
    game.style.display = 'block';
    dialogue.style.display = 'none';
    main();
    swapFoods();
    switchSkill();
    castSkill();
    return;
  }
  previousButton.style.display = 'block';
  updateIntroText();
});
previousButton.addEventListener('click', () => {
  currentPage--;
  nextButton.textContent = 'Next->';
  if (currentPage <= 0) {
    previousButton.style.display = 'none';
    updateIntroText();
  }
  updateIntroText();
});
playAgainButton.addEventListener('click', () => {
  skillbar.style.display = 'flex';
  snakeGameboard.style.display = 'block';
  deathScreen.style.display = 'none';
  restartGame();
  main();
  swapFoods();
  switchSkill();
  castSkill();
});

// Main Functions
function main() {
  hasGameEnded();
  if (hp <= 0) {
    gameOver = true;
  }
  if (gameOver) {
    skillbar.style.display = 'none';
    snakeGameboard.style.display = 'none';
    deathScreen.style.display = 'flex';
    boss.style.display = 'none';
    poisonScreen.style.display = 'none';
    return;
  }
  changingDirection = false;
  setTimeout(function onTick() {
    clearCanvas();
    if (isPoisoned) {
      // ctx.shadowBlur = 20;
      ctx.shadowColor = '#f7ff93';
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = 'yellow';
      ctx.fillRect(0, 0, snakeGameboard.width - 25, snakeGameboard.height - 25);
    }
    if (skills.fastMove.activated) {
      hp -= skills.fastMove.damage;
      ctx.shadowBlur = 50;
      ctx.shadowColor = 'cyan';
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = 'cyan';
      ctx.fillRect(0, 0, snakeGameboard.width - 25, snakeGameboard.height - 25);
    }
    if (skills.revealChips.activated) {
      hp -= skills.revealChips.damage;
    }
    hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(hp)}</span>`;
    ctx.globalAlpha = 1;
    drawWalls();
    drawFood();
    moveSnake();
    drawSnake();
    main();
  }, gameSpeed);
}
function updateIntroText() {
  introText.innerHTML = introPages[currentPage];
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
function restartGame() {
  currentSkill = '';
  skills.fastMove.activated = false;
  isSwapFinished = false;
  isPoisoned = false;
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
  scoreDisplay.innerHTML = `Score: <span id="score-value">${score}</span>`;
  hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(hp)}</span>`;
}
function hasGameEnded() {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      gameOver = true;
      return;
    }
  }
  const hitLeftWall = snake[0].x < 25;
  const hitRightWall = snake[0].x > snakeGameboard.width - 50;
  const hitTopWall = snake[0].y < 25;
  const hitBottomWall = snake[0].y > snakeGameboard.height - 50;
  if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
    gameOver = true;
    return;
  }
}

// Features
function switchSkill() {
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Digit1') {
      currentSkill = 'fastMove';
    } else if (e.code === 'Digit2') {
      currentSkill = 'revealChips';
    }
  });
}
function castSkill() {
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      if (currentSkill === 'fastMove') {
        skills.fastMove.activated = false;
        gameSpeed = 70;
      }
      if (currentSkill === 'revealChips') {
        skills.revealChips.activated = false;
      }
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      if (currentSkill === 'fastMove') {
        skills.fastMove.activated = true;
        gameSpeed = 20;
      }
      if (currentSkill === 'revealChips' && !skills.revealChips.activated) {
        skills.revealChips.activated = true;
        drawFood();
      }
    }
  });
}

// Snake Functions
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
      poisonScreen.style.display = 'none';
    }
    score += 10;
    hp !== 100 ? (hp += 5) : hp;
    scoreDisplay.innerHTML = `Score: <span id="score-value">${score}</span>`;
    hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(hp)}</span>`;
    isSwapFinished = false;
    swapFoods();
  } else if (hasEatenBadFood && isSwapFinished === true) {
    score -= 10;
    hp -= 10;
    scoreDisplay.innerHTML = `Score: <span id="score-value">${score}</span>`;
    hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(hp)}</span>`;
    isSwapFinished = false;
    swapFoods();
  } else if (hasEatenPoisonousFood && isSwapFinished === true) {
    isPoisoned = true;
    score -= 5;
    hp -= 5;
    poisonScreen.style.display = 'flex';
    scoreDisplay.innerHTML = `Score: <span id="score-value">${score}</span>`;
    hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(hp)}</span>`;
    isSwapFinished = false;
    swapFoods();
  } else {
    // Remove the last part of snake body
    snake.pop();
  }
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

// Food Functions
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
  if (isSwapFinished === true && !skills.revealChips.activated) {
    makeFoodsSame();
  } else {
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
  if (!skills.revealChips.activated) {
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
}
