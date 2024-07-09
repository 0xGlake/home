'use client';

import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const P5Sketch = ({ width, height }) => {
  const sketchRef = useRef();

  useEffect(() => {
    const sketch = (p) => {
      let particles = [];
      let colors = [];
      let parNum = 1000;
      let bgColor;

      p.setup = () => {
        p.createCanvas(width, height);
        p.colorMode(p.HSB, 360, 100, 100, 100);

        for (let i = 0; i < 10; i++) {
          colors.push(p.color(p.random(360), 90, 90, p.random(25, 50)));
        }

        for (let i = 0; i < parNum; i++) {
          particles.push(new Particle(p.random(p.width), p.random(p.height)));
        }

        bgColor = p.color(0, 0, 5, 100);
        p.background(bgColor);
      };

      p.draw = () => {
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
          particles.push(new Particle(p.random(p.width), p.random(p.height)));
        }
      };

      function Particle(x, y) {
        this.x = x;
        this.y = y;
        this.pos = p.createVector(this.x, this.y);
        this.prevPos = this.pos.copy();
        this.life = p.random(1);
        this.c = p.random(colors);
        this.ff = 0;

        this.update = function () {
          this.ff = p.noise(this.pos.x / 100, this.pos.y / 100) * p.TWO_PI;
          let mainP = 1200;
          let changeDir = p.TWO_PI / mainP;
          let roundff = p.round((this.ff / p.TWO_PI) * mainP);
          this.ff = changeDir * roundff;

          if (this.c === colors[0] || this.c === colors[colors.length - 1]) {
            let dx = p.constrain(p.tan(this.ff), -20, 20) * p.random(0.1, 1);
            let dy = p.constrain(p.tan(this.ff), -20, 20) * p.random(0.1, 1);
            this.pos.add(dx, dy);
          } else {
            this.pos.sub(p.sin(this.ff) * p.random(0.1, 1), p.cos(this.ff));
          }
        };

        this.show = function () {
          p.noFill();
          p.strokeWeight(p.random(1.25));
          let px = p.constrain(this.pos.x, p.width);
          let py = p.constrain(this.pos.y, p.height);
          p.stroke(this.c);
          p.point(px, py);
        };

        this.trail = function () {
          p.stroke(this.c);
          p.strokeWeight(1);
          p.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
          this.prevPos = this.pos.copy();
        };

        this.finished = function () {
          this.life -= p.random() / 10;
          this.life = p.constrain(this.life, 0, 1);
          return this.life === 0;
        };
      }
    };

    const p5Instance = new p5(sketch, sketchRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div ref={sketchRef} />;
};

export default P5Sketch;
