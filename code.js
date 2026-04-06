
// board:
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

// dino:
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let dinoImg;

let dino = {
  x : dinoX,
  y : dinoY,
  width : dinoWidth,
  height : dinoHeight
}

// cactus:
let cactusArray = [];

let cactus1Width = 34;
let cactus2Width = 69;
let cactus3Width = 102;

let cactusHeight = 70;
let cactusX = 700;
let cactusY = boardHeight - cactusHeight;

let cactus1Img;
let cactus2Img;
let cactus3Img;

// physics:
let velocityX = -8; // cactus moving left speed
let velocityY = 0;
let gravity = .4;

// restart:
let restartImg = new Image();
restartImg.src = "./img/reset.png"; // make sure this file exists
let GameOverImg = new Image();
GameOverImg.src = "./img/game-over.png";

// gameplay:
let highScore = 0;
let hiBlink = false;
let hiBlinkTimer = 0;

let score = 0;

let GameOver = false;
let blink = false;
let blinkTimer = 0;
let lastMilestone = 0;


window.onload = function() {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;

  context = board.getContext("2d"); // used for drawing on the board

  // draw initial dinosoar
  // context.fillStyle="green";
  // context.fillRect(dino.x, dino.y, dino.width, dino.height);

  dinoImg = new Image();
  dinoImg.src = "./img/dino.png";
  dinoImg.onload = function() {
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
  }

  cactus1Img = new Image();
  cactus1Img.src = "./img/cactus1.png";
  
  cactus2Img = new Image();
  cactus2Img.src = "./img/cactus2.png";

  cactus3Img = new Image();
  cactus3Img.src = "./img/cactus3.png";

  highScore = localStorage.getItem("highScore") || 0;


  requestAnimationFrame(update);
  setInterval(placeCactus, 1200); // 1000 miliseconds = 1 second
  document.addEventListener("keydown", function() {
    if ((e.code == "Space" || e.code == "ArrowUp") && dino.y >= dinoY - 1) {
      jump()
    }
  })
  document.addEventListener("click", restartGame);
  document.addEventListener("keydown", function() {
    if (e.code == "Space") {
      restartGame()
    }
  })
  document.addEventListener("touchstart", jump)

}

function update() {
  requestAnimationFrame(update);
  
  context.clearRect(0, 0, board.width, board.height);
  
  
  // ===== UPDATE (only if game running) =====
  if (!GameOver) {
    if ((Math.trunc(velocityY) % 10) <= 5) {
      dinoImg.src = "./img/dino-run1.png";
    } else {
      dinoImg.src = "./img/dino-run2.png";
    }
    if (velocityY < 0) {
      dinoImg.src = "./img/dino-jump.png"
    }
    
    // dino physics
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY);

    // move cactus + collision
    for (let i = 0; i < cactusArray.length; i++) {
      let cactus = cactusArray[i];
      cactus.x += velocityX;

      if (detecktColision(dino, cactus)) {
        GameOver = true;

        let finalScore = Math.floor(score);

        if (finalScore > highScore) {
          highScore = finalScore;
          localStorage.setItem("highScore", highScore);
          hiBlink = true;
          hiBlinkTimer = 120;
        }

        dinoImg.src = "./img/dino-dead.png";
        score = finalScore;
      }
    }

    // score update
    score += Math.abs(velocityX) * 0.03;

    let currentScore = Math.floor(score);

    if (
      currentScore % 100 === 0 &&
      currentScore !== 0 &&
      currentScore !== lastMilestone
    ) {
      blink = true;
      blinkTimer = 150;
      lastMilestone = currentScore;
      velocityX -= 0.5;
    }
  }

  // ===== BLINK TIMERS (always run) =====
  if (blink) {
    blinkTimer--;
    if (blinkTimer <= 0) blink = false;
  }

  if (hiBlink) {
    hiBlinkTimer--;
    if (hiBlinkTimer <= 0) hiBlink = false;
  }

  // ===== PREPARE SCORE TEXT =====
  let displayHigh = Math.floor(highScore).toString().padStart(5, "0");

  let baseScore = Math.floor(score);
  let shownScore = (!blink)
    ? baseScore
    : baseScore - (baseScore % 100);

  let displayScore = shownScore.toString().padStart(5, "0");

  // ===== DRAW =====

  // dino
  context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

  // cactus
  for (let i = 0; i < cactusArray.length; i++) {
    let cactus = cactusArray[i];
    context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);
  }

  // score text
  context.fillStyle = "black";
  context.font = "20px monospace";

  // HI score (blink when beaten)
  if (!hiBlink || Math.floor(hiBlinkTimer / 5) % 2 === 0) {
    context.fillText("HI " + displayHigh, boardWidth - 160, 25);
  }

  // current score (blink at 100s)
  if (!blink || blinkTimer % 24 < 12) {
    context.fillText(displayScore, boardWidth - 60, 25);
  }

  // ===== GAME OVER UI =====
  if (GameOver) {
    context.drawImage(restartImg, boardWidth/2 - 50, boardHeight/2 - 5, 76, 60);
    context.drawImage(GameOverImg, boardWidth/2 - 200, boardHeight/2 - 50, 386, 40);
  }
}

function jump(e) {
  if (GameOver) {
    return;
  }

  if (dino.y >= dinoY - 1) {
    velocityY = -10;
  }
}

function placeCactus() {
  if (GameOver) {
    return;
  }

  // place cactus
  let cactus = {
    img : null,
    x : cactusX,
    y : cactusY,
    width : null,
    height : cactusHeight
  }

  whichCactus = Math.random(); // 0 - 0.999999999......

  if (whichCactus > .90) { // 10% you get cactus3
    cactus.img = cactus3Img;
    cactus.width = cactus3Width;
    cactusArray.push(cactus);
  } else if (whichCactus > .70) { // 20% you get cactus2
    cactus.img = cactus2Img;
    cactus.width = cactus2Width;
    cactusArray.push(cactus);
  } else if (whichCactus > .40) { // 30% you get cactus1
    cactus.img = cactus1Img;
    cactus.width = cactus1Width;
    cactusArray.push(cactus);
  }
  if (cactusArray.length > 5) {
    cactusArray.shift(); // remove the first element from the array so that the array doesn't constently grow
  }
}

function restartGame(e) {
  if (!GameOver) return;
  // reset game state
  GameOver = false;
  cactusArray = [];
  velocityY = 0;
  dino.y = dinoY;
  score = 0;
  blink = false;
  blinkTimer = 0;
  velocityX = -8;
  hiBlink = false;
  hiBlinkTimer = 0;

  // reset dino image
  dinoImg.src = "./img/dino.png";
}

function detecktColision(a, b) {
  return a.x < b.x + b.width &&  // a's top left corner doesn't reach b's top right corner
         a.x + a.width > b.x &&  // a's top right corner passes b's top left corner
         a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
         a.y + a.height > b.y;   // a's bottom left corner passes b's top left corner
}