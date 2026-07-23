"use client";

import React, { useRef, useEffect } from "react";
import p5 from "p5";
import qrcode from "qrcode-generator";

// Curated, ordered gradient schemes — each sweeps analogous hues so adjacent
// noise bands blend instead of clashing, with a matching deep base tone.
const PALETTES = [
  { hue: [140, 300], sat: [55, 82], bri: [66, 94], bg: [9, 14, 26] }, // aurora: green→violet
  { hue: [330, 432], sat: [72, 92], bri: [78, 98], bg: [24, 10, 16] }, // sunset: magenta→gold
  { hue: [180, 320], sat: [58, 86], bri: [70, 95], bg: [8, 12, 24] }, // nebula: cyan→magenta
  { hue: [150, 268], sat: [58, 84], bri: [68, 94], bg: [6, 18, 22] }, // tide: green→blue
  { hue: [255, 378], sat: [56, 84], bri: [72, 96], bg: [18, 8, 24] }, // orchid: violet→red
  { hue: [28, 176], sat: [60, 86], bri: [72, 96], bg: [16, 14, 6] }, // meadow: amber→teal
];

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
      let bg = [22, 18, 50];

      const ROW_H = 8;
      const STEP = 6;
      const X_FREQ = 0.0015;
      const Y_FREQ = 0.045;
      // Perpetual flow — every time term below is monotonic, so the field
      // streams and morphs forever and never reverses direction.
      const FLOW_SPEED = 0.45; // px/frame horizontal advection (cloud drift)
      const MORPH_SPEED = 0.0011; // slow z-evolution of the noise field
      const VDRIFT = 0.0016; // vertical current through noise space
      const PARALLAX = 1.15; // nearer rows drift faster -> layered depth

      // A cheap sinusoidal curl waves each band vertically as it flows — the
      // organic swirl of the old domain warp without a second noise lookup.
      const CURL_FREQ = 0.008;
      const CURL_AMP = 0.18;
      const CURL_ROWPHASE = 0.35;

      const THICK_X_FREQ = 0.0035;
      const THICK_Y_FREQ = 0.12;
      const THICK_SPEED = 0.004;
      const THICK_MIN = 0.85;
      const THICK_RANGE = 2.4;

      // Multiply tint applied only inside code/finder modules so bright palette
      // bands stay well below white luminance and always scan.
      const MODULE_MULT = "rgb(70, 76, 96)";

      // The code modules bloom: a ripple expands from the center and GROWS each
      // module outward. It only ever adds area on top of the static base, so the
      // code stays fully scannable while visibly pulsing.
      const RIPPLE_SPEED = 0.055;
      const RIPPLE_FREQ = 0.5;
      const RIPPLE_GROW = 0.2;

      const THRESHOLDS = [0.36, 0.44, 0.52, 0.59, 0.66, 0.73, 0.8, 0.87];

      let palette = [];
      let cellSize, qrSize, qrX, qrY, padding;
      let rows, cols;
      let perlinG, vignetteG, RS, gw, gh;

      p.setup = () => {
        p.createCanvas(width, height);

        p.colorMode(p.HSB, 360, 100, 100);
        const scheme = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        bg = scheme.bg.slice();
        palette = [];
        const nbands = THRESHOLDS.length;
        for (let i = 0; i < nbands; i++) {
          const f = i / (nbands - 1);
          const h =
            (scheme.hue[0] +
              (scheme.hue[1] - scheme.hue[0]) * f +
              (Math.random() - 0.5) * 10 +
              360) %
            360;
          const s =
            scheme.sat[0] +
            (scheme.sat[1] - scheme.sat[0]) * f +
            (Math.random() - 0.5) * 6;
          const v =
            scheme.bri[0] +
            (scheme.bri[1] - scheme.bri[0]) * f +
            (Math.random() - 0.5) * 6;
          palette.push(p.color(h, s, v));
        }
        p.colorMode(p.RGB);

        p.noiseSeed(Math.floor(Math.random() * 100000));
        p.noiseDetail(3, 0.6);

        const minDim = Math.min(width, height);
        const targetSize = minDim * 0.55;
        cellSize = Math.max(2, Math.floor(targetSize / moduleCount));
        qrSize = cellSize * moduleCount;
        qrX = Math.round((width - qrSize) / 2);
        qrY = Math.round((height - qrSize) / 2);
        padding = cellSize * 3;

        // Render the soft wave field into a downscaled buffer (capped ~720px)
        // and composite it scaled up — invisible on clouds, but far cheaper.
        RS = Math.min(1, 720 / Math.max(width, height));
        gw = Math.max(2, Math.round(width * RS));
        gh = Math.max(2, Math.round(height * RS));
        rows = Math.ceil(gh / ROW_H) + 1;
        cols = Math.ceil(gw / STEP) + 1;

        perlinG = p.createGraphics(gw, gh);
        perlinG.noStroke();
        perlinG.rectMode(perlinG.CORNER);

        vignetteG = p.createGraphics(width, height);
        const vctx = vignetteG.drawingContext;
        const vcx = width / 2;
        const vcy = height / 2;
        const vr = Math.hypot(width, height) / 2;
        const grad = vctx.createRadialGradient(vcx, vcy, vr * 0.22, vcx, vcy, vr);
        grad.addColorStop(0, `rgba(${bg[0]}, ${bg[1]}, ${bg[2]}, 0)`);
        grad.addColorStop(
          1,
          `rgba(${Math.max(0, bg[0] - 5)}, ${Math.max(0, bg[1] - 5)}, ${Math.max(0, bg[2] - 5)}, 0.64)`,
        );
        vctx.fillStyle = grad;
        vctx.fillRect(0, 0, width, height);

        p.background(bg[0], bg[1], bg[2]);
        p.rectMode(p.CORNER);
      };

      p.draw = () => {
        renderPerlinWaves(perlinG);

        p.background(bg[0], bg[1], bg[2]);
        p.image(perlinG, 0, 0, width, height);
        p.image(vignetteG, 0, 0);

        const ctx = p.drawingContext;

        // Floating quiet-zone card with a soft drop shadow for depth.
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
        ctx.shadowBlur = cellSize * 4.5;
        ctx.shadowOffsetY = cellSize * 1.4;
        p.noStroke();
        p.fill(255);
        p.rect(
          qrX - padding,
          qrY - padding,
          qrSize + 2 * padding,
          qrSize + 2 * padding,
          cellSize * 2.2,
        );
        ctx.restore();

        // Reveal the un-dimmed wave field only through the code modules so the
        // QR stays vivid against the receded background.
        ctx.save();
        ctx.beginPath();
        addAnimatedCells(ctx, p.frameCount * RIPPLE_SPEED);
        ctx.clip();
        fillCodeWaves(ctx);
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
        const flow = p.frameCount * FLOW_SPEED;
        const morph = p.frameCount * MORPH_SPEED;
        const vshift = p.frameCount * VDRIFT;
        const tk = p.frameCount * THICK_SPEED;
        // Sample in screen space so cloud detail stays fine regardless of the
        // downscaled buffer resolution.
        const xf = X_FREQ / RS;
        const yf = Y_FREQ / RS;
        const cf = CURL_FREQ / RS;
        g.background(bg[0], bg[1], bg[2]);
        g.noStroke();

        for (let r = 0; r < rows; r++) {
          const y = r * ROW_H + ROW_H / 2;
          const depth = rows > 1 ? r / (rows - 1) : 0;
          const rowDrift = flow * (0.45 + depth * PARALLAX);
          const rowY = r * yf + vshift;
          const curlPhase = r * CURL_ROWPHASE;

          let prevX = 0;
          let sy =
            rowY + Math.sin((prevX + rowDrift) * cf + curlPhase) * CURL_AMP;
          let prevN = p.noise((prevX + rowDrift) * xf, sy, morph);
          let runColor = bandFromNoise(prevN);
          let runStart = 0;

          for (let c = 1; c <= cols; c++) {
            const x = c * STEP;
            let n, newColor;
            if (c === cols) {
              newColor = -2;
              n = -1;
            } else {
              sy =
                rowY + Math.sin((x + rowDrift) * cf + curlPhase) * CURL_AMP;
              n = p.noise((x + rowDrift) * xf, sy, morph);
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
                drawPill(
                  g,
                  runStart,
                  boundaryX,
                  r,
                  y,
                  palette[runColor],
                  tk,
                  rowDrift,
                );
              }
              runColor = newColor;
              runStart = boundaryX;
            }

            prevX = x;
            prevN = n;
          }
        }
      }

      function drawPill(g, x0, x1, r, y, col, tk, rowDrift) {
        const cx = (x0 + x1) / 2;
        const tkN = p.noise(
          (cx + rowDrift) * THICK_X_FREQ,
          r * THICK_Y_FREQ,
          tk + 1000,
        );
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

      function addAnimatedCells(ctx, t2) {
        // Base coverage = the proven-scannable static blob (circles + bridges).
        // The ripple only ADDS area on top (modules bloom outward, never shrink),
        // so decoding stays exactly as reliable as the static code.
        addCellsToClipPath(ctx);
        const cr = (moduleCount - 1) / 2;
        const cc = (moduleCount - 1) / 2;
        for (let r = 0; r < moduleCount; r++) {
          for (let c = 0; c < moduleCount; c++) {
            if (!matrix[r][c] || isFinderArea(r, c)) continue;
            const dist = Math.hypot(r - cr, c - cc);
            const wv = 0.5 + 0.5 * Math.sin(t2 - dist * RIPPLE_FREQ);
            const size = cellSize * (1 + RIPPLE_GROW * wv);
            const cx = qrX + c * cellSize + cellSize / 2;
            const cy = qrY + r * cellSize + cellSize / 2;
            roundedRectPath(
              ctx,
              cx - size / 2,
              cy - size / 2,
              size,
              size,
              size * 0.42,
            );
          }
        }
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
        fillCodeWaves(ctx);
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
        fillCodeWaves(ctx);
        ctx.restore();
      }

      // Paint the live wave field into the current clip, then deepen it so the
      // code keeps strong contrast on the white card regardless of palette.
      function fillCodeWaves(ctx) {
        // Only the card region can contain modules, so restrict the (costly)
        // image blit + multiply blend to that box instead of the full screen.
        const bx = qrX - padding;
        const by = qrY - padding;
        const bs = qrSize + 2 * padding;
        p.image(perlinG, bx, by, bs, bs, bx * RS, by * RS, bs * RS, bs * RS);
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = MODULE_MULT;
        ctx.fillRect(bx, by, bs, bs);
        ctx.globalCompositeOperation = "source-over";
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
