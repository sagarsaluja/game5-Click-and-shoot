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
  particles = [],
  timeToNextEvent = 0,
  lastTime = 0,
  eventThreshold = 500,
  gameOver = false;
canvasPosition = canvas.getBoundingClientRect();
collisionCanvasPosition = collisionCanvas.getBoundingClientRect();
SCORE = 0;
class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size;
    this.y = y + this.size * 0.1;
    this.color = color;
    this.isMarkedForDeletion = false;
    this.speedX = Math.random() + 0.5;
    this.radius = Math.random() * this.size * 0.1; //radius of particle depends on size of raven
    this.maxRadius = Math.random() * 20 + 30; //radius will grow over time
    this.timeSinceLastRadiusChange = 0;
    this.interval = Math.random() * 50 + 50;
  }
  update() {
    this.x += this.speedX;
    this.radius += 0.6;
    if (this.radius > this.maxRadius - 5) {
      this.isMarkedForDeletion = true;
    }
  }
  draw() {
    context.save();
    context.globalAlpha = 1 - this.radius / this.maxRadius;
    context.beginPath(); //find out what this is
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2); //for drawing an arc
    context.fill();
    context.restore();
  }
}
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
    if (this.x + this.frameWidth < 0) {
      this.isMarkedForDeletion = true;
      gameOver = true;
      return;
    }
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
    this.timeSinceLastFlapAccumulator += deltaTime;
    if (this.timeSinceLastFlapAccumulator > this.flapInterval) {
      this.currentFrame++;
      this.timeSinceLastFlapAccumulator = 0;

      [1, 2, 3].forEach(() => {
        particles.push(new Particle(this.x, this.y, this.width, this.color));
      });
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
const drawGameOver = () => {
  context.fillStyle = "black";
  context.textAlign = "center";
  context.fillText(" GAME OVER", canvas.width / 2, canvas.height / 2);
  context.fillText(
    " Score: " + SCORE,
    canvas.width / 2,
    canvas.height / 2 + 50
  );
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
  collisionCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextEvent += deltaTime;
  if (timeToNextEvent > eventThreshold) {
    ravens.push(new Raven());
    timeToNextEvent = 0;
  }
  drawScore(SCORE);
  [...particles, ...ravens, ...explosions].forEach((object) =>
    object.update(deltaTime)
  );
  [...particles, ...ravens, ...explosions].forEach((object) => object.draw());
  ravens = ravens.filter((obj) => !obj.isMarkedForDeletion);
  explosions = explosions.filter((obj) => !obj.isMarkedForDeletion);
  particles = particles.filter((obj) => !obj.isMarkedForDeletion);
};
const animate = (timestamp) => {
  animationLogic(timestamp);
  if (!gameOver) {
    requestAnimationFrame(animate);
  } else {
    context.clearRect(0, 0, canvas.width, canvas.height);
    ravens = [];
    explosions = [];
    drawGameOver();
  }
};
animate(0);
