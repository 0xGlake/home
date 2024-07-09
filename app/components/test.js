let particles = [];
let colors = [];
let parNum = 1000;
let mySize;
let bgColor;

function setup() {
  mySize = min(windowWidth, windowHeight);
  createCanvas(mySize, mySize);
  colorMode(HSB, 360, 100, 100, 100);

  // Define a range of colors
  for (let i = 0; i < 10; i++) {
    colors.push(color(random(360), 90, 90, random(25, 50)));
  }

  for (let i = 0; i < parNum; i++) {
    particles.push(new Particle(random(width), random(height)));
  }

  bgColor = color(0, 0, 5, 100); // Define a background color
  background(bgColor);
}

function draw() {
  // Draw trails
  for (let i = 0; i < particles.length; i++) {
    particles[i].trail();
  }

  for (let j = particles.length - 1; j >= 0; j--) {
    particles[j].update();
    particles[j].show();
    if (particles[j].finished()) {
      particles.splice(j, 1);
    }
  }

  while (particles.length < parNum) {
    particles.push(new Particle(random(width), random(height)));
  }
}

function Particle(x, y) {
  this.x = x;
  this.y = y;
  this.pos = createVector(this.x, this.y);
  this.prevPos = this.pos.copy(); // Store the previous position
  this.life = random(1);
  this.c = random(colors);
  this.ff = 0;

  this.update = function () {
    this.ff = noise(this.pos.x / 100, this.pos.y / 100) * TWO_PI;
    let mainP = 1200;
    let changeDir = TWO_PI / mainP;
    let roundff = round((this.ff / TWO_PI) * mainP);
    this.ff = changeDir * roundff;

    // Modify particle movement based on color
    if (this.c === colors[0] || this.c === colors[colors.length - 1]) {
      let dx = constrain(tan(this.ff), -20, 20) * random(0.1, 1);
      let dy = constrain(tan(this.ff), -20, 20) * random(0.1, 1);
      this.pos.add(dx, dy);
    } else {
      this.pos.sub(sin(this.ff) * random(0.1, 1), cos(this.ff));
    }
  };

  this.show = function () {
    noFill();
    strokeWeight(random(1.25));
    let px = constrain(this.pos.x, width);
    let py = constrain(this.pos.y, height);
    stroke(this.c);
    point(px, py);
  };

  this.trail = function () {
    stroke(this.c);
    strokeWeight(1);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.prevPos = this.pos.copy(); // Update the previous position
  };

  this.finished = function () {
    this.life -= (random()) / 10;
    this.life = constrain(this.life, 0, 1);
    return this.life === 0;
  };
}
