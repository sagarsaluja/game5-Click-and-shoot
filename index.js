/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
context.font = "50px impact";
let ravens = [],
  timeToNextEvent = 0,
  lastTime = 0,
  eventThreshold = 500;
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
    this.speedX = Math.random() * 5 + 3;
    this.speedY = Math.random() * 5 - 2.5;
    this.currentFrame = 0;
    this.isMarkedForDeletion = false;
    this.timeSinceLastFlapAccumulator = 0;
    this.flapInterval = Math.random() * 50 + 50;
  }
  update(deltaTime) {
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
const drawScore = (score) => {
  context.fillStyle = "black";
  context.fillText("Score :" + score, 50, 75);
  context.fillStyle = "white";
  context.fillText("Score :" + score, 55, 80);
};

const animationLogic = (timestamp) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextEvent += deltaTime;
  if (timeToNextEvent > eventThreshold) {
    ravens.push(new Raven());
    timeToNextEvent = 0;
  }
  drawScore(20);
  [...ravens].forEach((object) => object.update(deltaTime));
  [...ravens].forEach((object) => object.draw());
  ravens = ravens.filter((obj) => !obj.isMarkedForDeletion);
};
const animate = (timestamp) => {
  animationLogic(timestamp);
  requestAnimationFrame(animate);
};
animate(0);
