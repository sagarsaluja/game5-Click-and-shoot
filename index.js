/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCanvasContext = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

context.font = "50px impact";
let ravens = [],
  explosions = [],
  timeToNextEvent = 0,
  lastTime = 0,
  eventThreshold = 500;
canvasPosition = canvas.getBoundingClientRect();
collisionCanvasPosition = collisionCanvas.getBoundingClientRect();
SCORE = 0;
class Raven {
  constructor() {
    this.image = new Image();
    this.image.src = "Assets/raven.png";
    this.frameWidth = this.image.width / 6;
    this.frameHeight = this.image.height;
    this.speedModifier = Math.random() * 0.6 + 0.4;
    this.width = this.frameWidth * this.speedModifier;
    this.height = this.image.height * this.speedModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.speedX = Math.random() * 1 + 0;
    this.speedY = Math.random() * 5 - 2.5;
    this.currentFrame = 0;
    this.isMarkedForDeletion = false;
    this.timeSinceLastFlapAccumulator = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
  }
  update(deltaTime) {
    collisionCanvasContext.clearRect(
      0,
      0,
      collisionCanvas.width,
      collisionCanvas.height
    );
    this.x -= this.speedX;
    this.y -= this.speedY;
    if (this.y + this.height > canvas.height || this.y < 0) {
      this.speedY *= -1;
    }
    if (this.x + this.frameWidth < 0) {
      this.isMarkedForDeletion = true;
    }
    this.timeSinceLastFlapAccumulator += deltaTime;
    if (this.timeSinceLastFlapAccumulator > this.flapInterval) {
      this.currentFrame++;
      this.timeSinceLastFlapAccumulator = 0;
    }
    if (this.currentFrame > 5) this.currentFrame = 0;
  }
  draw() {
    collisionCanvasContext.fillStyle = this.color;
    collisionCanvasContext.fillRect(this.x, this.y, this.width, this.height);
    context.drawImage(
      this.image,
      this.currentFrame * this.frameWidth,
      0,
      this.frameWidth,
      this.frameHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
class Explosion {
  constructor(x, y) {
    this.image = new Image();
    this.image.src = "Assets/boom.png";
    this.width = this.image.width / 5;
    this.height = this.image.height;
    this.currentFrame = 0;
    this.isMarkedForDeletion = false;
    this.timeSinceLastExplosion = 0;
    this.interval = 100;
    this.audio = new Audio();
    this.audio.src = "Assets/Ice Attack.wav";
    this.x = x - this.width * 0.5 - collisionCanvasPosition.left;
    this.y = y - this.height * 0.5 - collisionCanvasPosition.top;
  }
  update(deltaTime) {
    if (this.currentFrame === 0) this.audio.play();
    if (this.currentFrame > 4) this.isMarkedForDeletion = true;
    this.timeSinceLastExplosion += deltaTime;
    if (this.timeSinceLastExplosion > this.interval) {
      this.currentFrame++;
      this.timeSinceLastExplosion = 0;
    }
    if (this.currentFrame > 5) this.currentFrame = 0;
  }
  draw() {
    context.drawImage(
      this.image,
      this.currentFrame * this.width,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
const drawScore = (score) => {
  context.fillStyle = "black";
  context.fillText("Score :" + score, 50, 75);
  context.fillStyle = "white";
  context.fillText("Score :" + score, 55, 80);
};
canvas.addEventListener("click", (e) => {
  const detectPixelColor = collisionCanvasContext.getImageData(e.x, e.y, 1, 1);
  const pixelColor = detectPixelColor.data;
  ravens.forEach((raven) => {
    if (
      raven.randomColors[0] === pixelColor[0] &&
      raven.randomColors[1] === pixelColor[1] &&
      raven.randomColors[2] === pixelColor[2]
    ) {
      explosions.push(new Explosion(e.x, e.y));
      raven.isMarkedForDeletion = true;
      SCORE++;
    }
  });
});
const animationLogic = (timestamp) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextEvent += deltaTime;
  if (timeToNextEvent > eventThreshold) {
    ravens.push(new Raven());
    timeToNextEvent = 0;
  }
  drawScore(SCORE);
  [...ravens, ...explosions].forEach((object) => object.update(deltaTime));
  [...ravens, ...explosions].forEach((object) => object.draw());
  ravens = ravens.filter((obj) => !obj.isMarkedForDeletion);
  explosions = explosions.filter((obj) => !obj.isMarkedForDeletion);
};
const animate = (timestamp) => {
  animationLogic(timestamp);
  requestAnimationFrame(animate);
};
animate(0);
