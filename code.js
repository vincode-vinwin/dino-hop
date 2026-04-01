
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

let GameOver = false;
let score = 0;

// restart:
let restartImg = new Image();
restartImg.src = "./img/reset.png"; // make sure this file exists
let GameOverImg = new Image();
GameOverImg.src = "./img/game-over.png";


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


  requestAnimationFrame(update);
  setInterval(placeCactus, 1000); // 1000 miliseconds = 1 second
  document.addEventListener("keydown", moveDino)
  document.addEventListener("click", restartGame_onclick);
  document.addEventListener("keydown", restartGame_withSpace);

}

function update() {
  requestAnimationFrame(update);
  
  if (GameOver) {
    context.drawImage(restartImg, boardWidth/2 - 50, boardHeight/2 - 5, 76, 60);
    context.drawImage(GameOverImg, boardWidth/2 - 200, boardHeight/2 - 50, 386, 40);
    return;
  }
  
  context.clearRect(0, 0, board.width, board.height);
  
  // dino:
  velocityY += gravity;
  dino.y = Math.min(dino.y + velocityY, dinoY); // aply gravity to current dino.y, making sure it doesn't exceed the ground
  context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

  // cactus:
  for (let i = 0; i < cactusArray.length; i++) {
    let cactus = cactusArray[i];
    cactus.x += velocityX;
    context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

    if (detecktColision(dino, cactus)) {
      GameOver = true;
      dinoImg.src = "./img/dino-dead.png";
      context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height)
    }
  }

  // score:
  context.fillStyle="Black";
  context.font="20px arial black";
  score++;
  context.fillText(score, 5, 20);
}

function moveDino(e) {
  if (GameOver) {
    return;
  }

  if ((e.code == "Space" || e.code == "ArrowUp") && dino.y == dinoY) {
    // jump:
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

function restartGame_onclick(e) {
  if (!GameOver) return;
  // reset game state
  GameOver = false;
  cactusArray = [];
  velocityY = 0;
  dino.y = dinoY;
  score = 0;

  // reset dino image
  dinoImg.src = "./img/dino.png";
}


function restartGame_withSpace(e) {
  if (!GameOver) return;
  if (e.code == "Space") {
    // reset game state
    GameOver = false;
    cactusArray = [];
    velocityY = 0;
    dino.y = dinoY;
    score = 0;

    // reset dino image
    dinoImg.src = "./img/dino.png";
  }
}

function detecktColision(a, b) {
  return a.x < b.x + b.width &&  // a's top left corner doesn't reach b's top right corner
         a.x + a.width > b.x &&  // a's top right corner passes b's top left corner
         a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
         a.y + a.height > b.y;    // a's bottom left corner passes b's top left corner
}