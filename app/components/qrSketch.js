"use client";

import React, { useRef, useEffect } from "react";
import p5 from "p5";
import qrcode from "qrcode-generator";

const QRSketch = ({ width, height, url }) => {
  const sketchRef = useRef();

  useEffect(() => {
    if (!url || !width || !height) return;

    const qr = qrcode(0, "H");
    qr.addData(url);
    qr.make();
    const moduleCount = qr.getModuleCount();
    const matrix = [];
    for (let r = 0; r < moduleCount; r++) {
      const row = [];
      for (let c = 0; c < moduleCount; c++) {
        row.push(qr.isDark(r, c));
      }
      matrix.push(row);
    }

    const sketch = (p) => {
      const bg = [22, 18, 50];

      const ROW_H = 11;
      const STEP = 3;
      const X_FREQ = 0.0011;
      const Y_FREQ = 0.04;
      const BREATH_SPEED = 0.002;

      const THICK_X_FREQ = 0.0035;
      const THICK_Y_FREQ = 0.12;
      const THICK_SPEED = 0.009;
      const THICK_MIN = 0.75;
      const THICK_RANGE = 2.9;

      const THRESHOLDS = [0.42, 0.55, 0.65, 0.74, 0.83];

      let palette = [];
      let cellSize, qrSize, qrX, qrY, padding;
      let rows, cols;
      let perlinG;

      p.setup = () => {
        p.createCanvas(width, height);

        p.colorMode(p.HSB, 360, 100, 100);
        const baseHue = Math.random() * 360;
        const offsets = [0, 100, 120, 245, 300];
        for (let i = offsets.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
        }
        palette = offsets.map((off) => {
          const h = (baseHue + off + (Math.random() - 0.5) * 24) % 360;
          const s = 78 + (Math.random() - 0.5) * 16;
          const v = 78 + (Math.random() - 0.5) * 18;
          return p.color(h, s, v);
        });
        p.colorMode(p.RGB);

        p.noiseSeed(Math.floor(Math.random() * 100000));
        p.noiseDetail(4.5, 0.55);

        const minDim = Math.min(width, height);
        const targetSize = minDim * 0.55;
        cellSize = Math.max(2, Math.floor(targetSize / moduleCount));
        qrSize = cellSize * moduleCount;
        qrX = Math.round((width - qrSize) / 2);
        qrY = Math.round((height - qrSize) / 2);
        padding = cellSize * 2;

        rows = Math.ceil(height / ROW_H) + 1;
        cols = Math.ceil(width / STEP) + 1;

        perlinG = p.createGraphics(width, height);
        perlinG.noStroke();
        perlinG.rectMode(perlinG.CORNER);

        p.background(bg[0], bg[1], bg[2]);
        p.rectMode(p.CORNER);
      };

      p.draw = () => {
        renderPerlinWaves(perlinG);

        p.background(bg[0], bg[1], bg[2]);
        p.image(perlinG, 0, 0);

        p.noStroke();
        p.fill(255);
        p.rect(
          qrX - padding,
          qrY - padding,
          qrSize + 2 * padding,
          qrSize + 2 * padding,
          cellSize,
        );

        const ctx = p.drawingContext;

        ctx.save();
        ctx.beginPath();
        addCellsToClipPath(ctx);
        ctx.clip();
        p.image(perlinG, 0, 0);
        ctx.restore();

        drawFinder(ctx, qrX, qrY);
        drawFinder(ctx, qrX + (moduleCount - 7) * cellSize, qrY);
        drawFinder(ctx, qrX, qrY + (moduleCount - 7) * cellSize);
      };

      function bandFromNoise(n) {
        if (n < THRESHOLDS[0]) return -1;
        for (let i = 1; i < THRESHOLDS.length; i++) {
          if (n < THRESHOLDS[i]) return i - 1;
        }
        return THRESHOLDS.length - 1;
      }

      function renderPerlinWaves(g) {
        const t = p.frameCount * BREATH_SPEED;
        const tk = p.frameCount * THICK_SPEED;
        g.background(bg[0], bg[1], bg[2]);
        g.noStroke();

        for (let r = 0; r < rows; r++) {
          const y = r * ROW_H + ROW_H / 2;

          let prevX = 0;
          let prevN = p.noise(prevX * X_FREQ, r * Y_FREQ, t);
          let runColor = bandFromNoise(prevN);
          let runStart = 0;

          for (let c = 1; c <= cols; c++) {
            const x = c * STEP;
            let n, newColor;
            if (c === cols) {
              newColor = -2;
              n = -1;
            } else {
              n = p.noise(x * X_FREQ, r * Y_FREQ, t);
              newColor = bandFromNoise(n);
            }

            if (newColor !== runColor) {
              let boundaryX = x;
              if (c < cols) {
                const ascending = newColor > runColor;
                const thresholdIdx = ascending
                  ? Math.max(runColor + 1, 0)
                  : Math.max(runColor, 0);
                const threshold = THRESHOLDS[thresholdIdx];
                if (threshold !== undefined && n !== prevN) {
                  const frac = (threshold - prevN) / (n - prevN);
                  if (frac >= 0 && frac <= 1) {
                    boundaryX = prevX + frac * (x - prevX);
                  }
                }
              }

              if (runColor >= 0) {
                drawPill(g, runStart, boundaryX, r, y, palette[runColor], tk);
              }
              runColor = newColor;
              runStart = boundaryX;
            }

            prevX = x;
            prevN = n;
          }
        }
      }

      function drawPill(g, x0, x1, r, y, col, tk) {
        const cx = (x0 + x1) / 2;
        const tkN = p.noise(cx * THICK_X_FREQ, r * THICK_Y_FREQ, tk + 1000);
        const thickness = Math.max(3, ROW_H * (THICK_MIN + tkN * THICK_RANGE));
        const radius = thickness / 2;
        const ex0 = x0 - radius;
        const ex1 = x1 + radius;
        const w = ex1 - ex0;
        if (w < thickness * 0.5) return;
        g.fill(col);
        g.rect(ex0, y - radius, w, thickness, radius);
      }

      function isFinderArea(r, c) {
        const n = moduleCount;
        return (
          (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
        );
      }

      function addCellsToClipPath(ctx) {
        for (let r = 0; r < moduleCount; r++) {
          for (let c = 0; c < moduleCount; c++) {
            if (!matrix[r][c] || isFinderArea(r, c)) continue;
            const cx = qrX + c * cellSize + cellSize / 2;
            const cy = qrY + r * cellSize + cellSize / 2;

            ctx.moveTo(cx + cellSize / 2, cy);
            ctx.arc(cx, cy, cellSize / 2, 0, Math.PI * 2);

            if (
              c + 1 < moduleCount &&
              matrix[r][c + 1] &&
              !isFinderArea(r, c + 1)
            ) {
              ctx.rect(cx, cy - cellSize / 2, cellSize, cellSize);
            }
            if (
              r + 1 < moduleCount &&
              matrix[r + 1][c] &&
              !isFinderArea(r + 1, c)
            ) {
              ctx.rect(cx - cellSize / 2, cy, cellSize, cellSize);
            }
          }
        }
      }

      function roundedRectPath(ctx, x, y, w, h, radius) {
        const r = Math.min(radius, w / 2, h / 2);
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
      }

      function drawFinder(ctx, x, y) {
        ctx.save();
        ctx.beginPath();
        roundedRectPath(ctx, x, y, 7 * cellSize, 7 * cellSize, cellSize * 1.6);
        ctx.clip();
        p.image(perlinG, 0, 0);
        ctx.restore();

        p.noStroke();
        p.fill(255);
        p.rect(
          x + cellSize,
          y + cellSize,
          5 * cellSize,
          5 * cellSize,
          cellSize * 1.2,
        );

        ctx.save();
        ctx.beginPath();
        roundedRectPath(
          ctx,
          x + 2 * cellSize,
          y + 2 * cellSize,
          3 * cellSize,
          3 * cellSize,
          cellSize * 0.8,
        );
        ctx.clip();
        p.image(perlinG, 0, 0);
        ctx.restore();
      }
    };

    const p5Instance = new p5(sketch, sketchRef.current);

    return () => {
      p5Instance.remove();
    };
  }, [height, width, url]);

  return <div ref={sketchRef} />;
};

export default QRSketch;
