// Queries
const music = document.querySelector('#music');
const snakeGameboard = document.querySelector('#snakeGame');
const ctx = snakeGameboard.getContext('2d');
const boardBg = document.getElementById('gameboard-bg');
const wall = document.getElementById('wall');
const playButton = document.querySelector('#play-button');
const dialogue = document.querySelector('#dialogue');
const menu = document.querySelector('#menu');
const gameDisplay = document.querySelector('#game');
const nextButton = document.querySelector('#next');
const previousButton = document.querySelector('#previous');
const skipButton = document.querySelector('#skip');
const poisonScreen = document.querySelector('#poison-screen');
const deathScreen = document.querySelector('#death-screen');
const playAgainButton = document.querySelector('#play-again');
const ui = document.querySelector('#ui');
const bossDisplay = document.querySelector('#boss');
const introText = document.querySelector('#intro-text');
const hpDisplay = document.querySelector('#hp');
const scoreDisplay = document.querySelector('#score');
const skillbar = document.querySelector('#skill-bar');

// Variables
let isPlaying = false;
let dx = 25;
let dy = 0;
let introPages = [
  'Welcome to the future, player...',
  `Your objective is simple,<br> gain score and BEAT THE GAME.`,
  '<span id="green">GREEN</span> chips heal you and fix any <span id="yellow">malfunction</span>. Also give points obviously.',
  '<span id="red">RED</span> chips damage you and steal your score.',
  '<span id="blue">BLUE</span> chips appears at certain scores and unlock your abilities.',
  'You can select your abilities in the skillbar then use them by holding SPACEBAR, with <span id="red">SOME</span> cost...',
  'BEWARE of the <span id="yellow">YELLOW</span> chips. <br>They might confuse your brain a little...',
  'But, there is a catch.. They all become the<span id="white"> SAME</span> later, so you have to use your memory.',
  'Oh, i almost forgot.. <br><span id="blue">HE IS WAITING FOR YOU...</span>',
];
let player = {
  attack: { x: '', y: '' },
  hp: 100,
  score: 90,
  isAttackFinished: false,
};
let chips = {
  chip: { x: -25, y: -25 },
  badChip: { x: -25, y: -25 },
  poisonousChip: { x: -25, y: -25 },
  fastMoveChip: { x: -25, y: -25 },
  revealChipsChip: { x: -25, y: -25 },
};
let game = {
  gameSpeed: 70,
  swapSpeed: 500,
  isSwapFinished: false,
  isPoisoned: false,
  gameOver: false,
};
let boss = { isAttackFinished: false, hp: 100, walls: [], summoned: false };
let currentPage = 0;
let changingDirection;
let currentSkill = '';
let skills = {
  fastMove: { activated: false, damage: 0.1, unlocked: false },
  revealChips: { activated: false, damage: 2.5, unlocked: false },
};

let snake = [
  { x: 200, y: 200 },
  { x: 190, y: 200 },
  { x: 180, y: 200 },
  { x: 170, y: 200 },
  { x: 160, y: 200 },
];

// Event Listeners
document.addEventListener('keydown', (e) => {
  // Skill Switch
  if (e.code === 'Digit1') {
    document.getElementById('reveal-chips').style.border = '';
    document.getElementById('fast-move').style.border = '2px solid white';
    currentSkill = 'fastMove';
  } else if (e.code === 'Digit2') {
    document.getElementById('fast-move').style.border = '';
    document.getElementById('reveal-chips').style.border = '2px solid white';
    currentSkill = 'revealChips';
  }
  // Skill Cast
  else if (e.code === 'Space') {
    if (currentSkill === 'fastMove' && skills.fastMove.unlocked) {
      skills.fastMove.activated = true;
      game.gameSpeed = 20;
    }
    if (currentSkill === 'revealChips' && skills.revealChips.unlocked) {
      skills.revealChips.activated = true;
      drawChip();
    }
  }
});
document.addEventListener('keyup', (e) => {
  // Skill Cast
  if (e.code === 'Space') {
    if (currentSkill === 'fastMove' && skills.fastMove.unlocked) {
      skills.fastMove.activated = false;
      game.gameSpeed = 70;
    }
    if (currentSkill === 'revealChips' && skills.revealChips.unlocked) {
      skills.revealChips.activated = false;
    }
  }
});
skipButton.addEventListener('click', () => {
  menu.style.display = 'none';
  gameDisplay.style.display = 'block';
  dialogue.style.display = 'none';
  startGame();
});
playButton.addEventListener('click', () => {
  updateIntroText();
  previousButton.style.display = 'none';
  music.volume = 0.3;
  music.play();
  isPlaying = true;
  menu.style.visibility = 'hidden';
  menu.style.marginTop = '0px';
  dialogue.style.display = 'flex';
  document.addEventListener('keydown', changeDirection);
});

nextButton.addEventListener('click', () => {
  currentPage++;
  if (currentPage === 8) {
    nextButton.textContent = 'PLAY';
    updateIntroText();
    return;
  }
  if (currentPage === 9) {
    menu.style.display = 'none';
    gameDisplay.style.display = 'block';
    dialogue.style.display = 'none';
    startGame();

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
  resetGame();
  startGame();
});

// Main Functions
function startGame() {
  main();
  swapChips();
}
function main() {
  scoreDisplay.innerHTML = `Score: <span id="red">${player.score}</span>`;
  hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(
    player.hp
  )}</span>`;
  hasGameEnded();
  if (player.score >= 100) {
    bossFight();
  }
  if (player.hp <= 0) {
    game.gameOver = true;
  }
  if (game.gameOver) {
    skillbar.style.display = 'none';
    snakeGameboard.style.display = 'none';
    deathScreen.style.display = 'flex';
    bossDisplay.style.display = 'none';
    poisonScreen.style.display = 'none';
    hpDisplay.innerHTML = `Hp: <span id="red">0</span>`;
    scoreDisplay.innerHTML = `Score: <span id="red">${player.score}</span>`;
    return;
  }
  if (player.score >= 30) {
    chips.fastMoveChip.unlocked = true;
  }
  if (player.score >= 60) {
    chips.revealChipsChip.unlocked = true;
  }
  changingDirection = false;
  setTimeout(function onTick() {
    clearCanvas();
    if (game.isPoisoned) {
      ctx.shadowColor = '#f7ff93';
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = 'yellow';
      ctx.fillRect(0, 0, snakeGameboard.width - 25, snakeGameboard.height - 25);
    }
    if (skills.fastMove.activated) {
      player.hp -= skills.fastMove.damage;
      ctx.shadowBlur = 50;
      ctx.shadowColor = 'cyan';
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = 'cyan';
      ctx.fillRect(0, 0, snakeGameboard.width - 25, snakeGameboard.height - 25);
    }
    if (skills.revealChips.activated) {
      player.hp -= skills.revealChips.damage;
      ctx.shadowBlur = 50;
      ctx.shadowColor = 'white';
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, snakeGameboard.width - 25, snakeGameboard.height - 25);
    }
    ctx.globalAlpha = 1;
    drawWalls();
    drawChip();
    moveSnake();
    drawSnake();
    main();
  }, game.gameSpeed);
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
function resetGame() {
  game.gameOver = false;
  game.isSwapFinished = false;
  currentSkill = '';
  skills.fastMove.unlocked = false;
  skills.fastMove.unlocked = false;
  skills.revealChips.activated = false;
  skills.revealChips.activated = false;
  game.isPoisoned = false;
  player.score = 0;
  dx = 25;
  dy = 0;
  player.hp = 100;
  game.gameSpeed = 70;
  game.swapSpeed = 500;
  snake = [
    { x: 200, y: 200 },
    { x: 190, y: 200 },
    { x: 180, y: 200 },
    { x: 170, y: 200 },
    { x: 160, y: 200 },
  ];
  scoreDisplay.innerHTML = `Score: <span id="score-value">${player.score}</span>`;
  hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(
    player.hp
  )}</span>`;
}
function hasGameEnded() {
  const hitLeftWall = snake[0].x < 25;
  const hitRightWall = snake[0].x > snakeGameboard.width - 50;
  const hitTopWall = snake[0].y < 25;
  const hitBottomWall = snake[0].y > snakeGameboard.height - 50;

  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      game.gameOver = true;
      return;
    }
  }
  // Boss instant death walls

  // for (let i = 0; i < boss.walls.length; i++) {
  //   if (
  //     snake[0].x === boss.walls[i].newWallX &&
  //     snake[0].y === boss.walls[i].newWallY
  //   ) {
  //     gameOver = true;
  //     return;
  //   }
  // }
  if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
    game.gameOver = true;
    return;
  }
}
// function teleport() {
//   const hitLeftWall = snake[0].x < 0;
//   const hitRightWall = snake[0].x > snakeGameboard.width - 25;
//   const hitTopWall = snake[0].y < 0;
//   const hitBottomWall = snake[0].y > snakeGameboard.height - 25;
//   if (hitLeftWall) {
//     snake[0].x = snakeGameboard.width - 25;
//   }
//   if (hitRightWall) {
//     snake[0].x = 0;
//   }
//   if (hitBottomWall) {
//     snake[0].y = 0;
//   }
//   if (hitTopWall) {
//     snake[0].y = snakeGameboard.width - 25;
//   }
// }

// Boss

function bossFight() {
  let attackNumber = 30;
  boss.summoned = true;
  if (boss.hp > 0 && !boss.isAttackFinished) {
    bossDisplay.style.display = 'block';
    bossAttack();
    playerAttack();
    boss.isAttackFinished = true;
    player.isAttackFinished = true;
  }
  if (boss.isAttackFinished) {
    for (let i = 0; i < boss.walls.length; i++) {
      makeChip(
        'red',
        'red',
        boss.walls[i].newWallX,
        boss.walls[i].newWallY,
        25,
        25
      );
    }
  }
  if (player.isAttackFinished) {
    makeChip('#32ff40', 'green', player.attack.x, player.attack.y, 25, 25);
  } else if (boss.hp <= 0) {
    boss.style.display = 'none';
  }
  function bossAttack() {
    for (let i = 0; i < attackNumber; i++) {
      const newWallX = randomChip(0, snakeGameboard.width - 25);
      const newWallY = randomChip(0, snakeGameboard.height - 25);
      boss.walls.push({ newWallX, newWallY });
    }
  }
  function playerAttack() {
    player.attack.x = randomChip(0, snakeGameboard.width - 25);
    player.attack.y = randomChip(0, snakeGameboard.height - 25);
  }
}
// Skills

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
  const hasEatenChip =
    snake[0].x === chips.chip.x && snake[0].y === chips.chip.y;
  const hasEatenBadChip =
    snake[0].x === chips.badChip.x && snake[0].y === chips.badChip.y;
  const hasEatenPoisonousChip =
    snake[0].x === chips.poisonousChip.x &&
    snake[0].y === chips.poisonousChip.y;
  const hasEatenFastMoveChip =
    snake[0].x === chips.fastMoveChip.x && snake[0].y === chips.fastMoveChip.y;
  const hasEatenRevealChipsChip =
    snake[0].x === chips.revealChipsChip.x &&
    snake[0].y === chips.revealChipsChip.y;
  const hasEatenAttackChip =
    snake[0].x === player.attack.x && snake[0].y === player.attack.y;
  for (let i = 0; i < boss.walls.length; i++) {
    const hasEatenBossAttackChip =
      snake[0].x === boss.walls[i].newWallX &&
      snake[0].y === boss.walls[i].newWallY;
    if (hasEatenBossAttackChip) {
      player.hp -= 30;
      scoreDisplay.innerHTML = `Score: <span id="score-value">${player.score}</span>`;
      hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(
        player.hp
      )}</span>`;
      boss.isAttackFinished = false;
      boss.walls = [];
    }
  }
  if (hasEatenChip && game.isSwapFinished) {
    if (game.isPoisoned) {
      game.isPoisoned = false;
      poisonScreen.style.display = 'none';
    }
    game.isSwapFinished = false;
    player.score += 10;
    player.hp !== 100 ? (player.hp += 5) : player.hp;
    scoreDisplay.innerHTML = `Score: <span id="score-value">${player.score}</span>`;
    hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(
      player.hp
    )}</span>`;
    swapChips();
  } else if (hasEatenBadChip && game.isSwapFinished) {
    game.isSwapFinished = false;
    player.score -= 10;
    player.hp -= 10;
    scoreDisplay.innerHTML = `Score: <span id="score-value">${player.score}</span>`;
    hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(
      player.hp
    )}</span>`;
    swapChips();
  } else if (hasEatenPoisonousChip && game.isSwapFinished) {
    game.isSwapFinished = false;
    game.isPoisoned = true;
    player.score -= 5;
    player.hp -= 5;
    poisonScreen.style.display = 'flex';
    scoreDisplay.innerHTML = `Score: <span id="score-value">${player.score}</span>`;
    hpDisplay.innerHTML = `Hp: <span id="hp-value">${Math.trunc(
      player.hp
    )}</span>`;
    swapChips();
  } else if (hasEatenFastMoveChip && game.isSwapFinished) {
    game.isSwapFinished = false;
    skills.fastMove.unlocked = true;
    player.score += 10;
    scoreDisplay.innerHTML = `Score: <span id="score-value">${player.score}</span>`;
    swapChips();
  } else if (hasEatenRevealChipsChip && game.isSwapFinished) {
    game.isSwapFinished = false;
    skills.revealChips.unlocked = true;
    player.score += 10;
    scoreDisplay.innerHTML = `Score: <span id="score-value">${player.score}</span>`;
    swapChips();
  } else if (hasEatenAttackChip) {
    boss.hp -= 25;
    player.score += 50;
    player.hp += 20;
    scoreDisplay.innerHTML = `Score: <span id="score-value">${player.score}</span>`;
    player.isAttackFinished = true;
    boss.walls = [];
    // player.attack.x = -25;
    // player.attack.y = -25;
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
  if (game.isPoisoned) {
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

// Chip Functions
function randomChip(min, max) {
  let coordinates = Math.round((Math.random() * (max - min) + min) / 25) * 25;
  while (coordinates === 0 || coordinates >= 750) {
    coordinates = Math.round((Math.random() * (max - min) + min) / 25) * 25;
  }
  return coordinates;
}

function generateChip() {
  chips.chip.x = randomChip(0, snakeGameboard.width - 25);
  chips.chip.y = randomChip(0, snakeGameboard.height - 25);
  chips.badChip.x = randomChip(0, snakeGameboard.width - 25);
  chips.badChip.y = randomChip(0, snakeGameboard.height - 25);
  if (!game.isPoisoned) {
    chips.poisonousChip.x = randomChip(0, snakeGameboard.width - 25);
    chips.poisonousChip.y = randomChip(0, snakeGameboard.height - 25);
  }
  if (chips.fastMoveChip.unlocked) {
    chips.fastMoveChip.x = randomChip(0, snakeGameboard.height - 25);
    chips.fastMoveChip.y = randomChip(0, snakeGameboard.height - 25);
  }
  if (chips.revealChipsChip.unlocked) {
    chips.revealChipsChip.x = randomChip(0, snakeGameboard.height - 25);
    chips.revealChipsChip.y = randomChip(0, snakeGameboard.height - 25);
  }
  snake.forEach((part) => {
    const hasEaten = part.x === chips.chip.x && part.y === chips.chip.y;
    if (hasEaten) generateChip();
  });
  snake.forEach((part) => {
    const hasEaten = part.x === chips.badChip.x && part.y === chips.badChip.y;
    if (hasEaten) generateChip();
  });
  snake.forEach((part) => {
    const hasEaten =
      part.x === chips.poisonousChip.x && part.y === chips.poisonousChip.y;
    if (hasEaten) generateChip();
  });
  snake.forEach((part) => {
    const hasEaten =
      part.x === chips.fastMoveChip.x && part.y === chips.fastMoveChip.y;
    if (hasEaten) generateChip();
  });
  snake.forEach((part) => {
    const hasEaten =
      part.x === chips.revealChipsChip.x && part.y === chips.revealChipsChip.y;
    if (hasEaten) generateChip();
  });
}

function drawChip() {
  if (game.isSwapFinished === true && !skills.revealChips.activated) {
    makeChipsSame();
  } else if (!boss.summoned) {
    // Chip
    makeChip('#32ff40', 'green', chips.chip.x, chips.chip.y);
    // Bad Chip
    makeChip('red', 'red', chips.badChip.x, chips.badChip.y);
    // Poisonous Chip
    if (game.isPoisoned === false) {
      makeChip(
        '#eeff00',
        'yellow',
        chips.poisonousChip.x,
        chips.poisonousChip.y
      );
    }
    if (player.score >= 30 && !skills.fastMove.unlocked) {
      makeChip(
        '#ff00e1',
        '#ff00e1',
        chips.fastMoveChip.x,
        chips.fastMoveChip.y
      );
    }
    if (player.score >= 60 && !skills.revealChips.unlocked) {
      makeChip(
        '#ff00e1',
        '#ff00e1',
        chips.revealChipsChip.x,
        chips.revealChipsChip.y
      );
    }
  }
}
function makeChip(fill, shadow, x, y) {
  ctx.fillStyle = fill;
  ctx.shadowBlur = 20;
  ctx.shadowColor = shadow;
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x, y, 25, 25);
  ctx.fillRect(x, y, 25, 25);
}
function swapChips() {
  if (!boss.summoned && player.score !== 100) {
    let repeatTime = 0;
    let delay = setInterval(() => {
      if (game.gameOver) {
        clearInterval(delay);
      }
      if (repeatTime === 5) {
        clearInterval(delay);
        game.isSwapFinished = true;
        return;
      }
      generateChip();
      drawChip();
      game.swapSpeed -= 3;
      repeatTime++;
    }, game.swapSpeed);
  }
}

function makeChipsSame() {
  if (!skills.revealChips.activated) {
    ctx.lineWidth = 4;
    if (game.isPoisoned === false) {
      makeChip('white', 'white', chips.poisonousChip.x, chips.poisonousChip.y);
    }
    if (player.score >= 30 && !skills.fastMove.unlocked) {
      makeChip('white', 'white', chips.fastMoveChip.x, chips.fastMoveChip.y);
    }
    if (player.score >= 60 && !skills.revealChips.unlocked) {
      makeChip(
        'white',
        'white',
        chips.revealChipsChip.x,
        chips.revealChipsChip.y
      );
    }
    makeChip('white', 'white', chips.chip.x, chips.chip.y);
    makeChip('white', 'white', chips.badChip.x, chips.badChip.y);
  }
}
