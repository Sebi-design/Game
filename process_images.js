const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

function floodFillTransparent(rawPixels, width, height, isBird = false) {
  // rawPixels is RGBA Buffer
  // We will find background pixels connected to edges
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBg(r, g, b) {
    if (isBird) {
      // Outer background is nearly pure white
      return r > 238 && g > 238 && b > 238;
    } else {
      // Food items background is pure white
      return r > 240 && g > 240 && b > 240;
    }
  }

  // Push all border pixels that are bg
  for (let x = 0; x < width; x++) {
    // top
    let idx0 = (0 * width + x) * 4;
    if (isBg(rawPixels[idx0], rawPixels[idx0 + 1], rawPixels[idx0 + 2])) {
      visited[x] = 1;
      queue.push(x, 0);
    }
    // bottom
    let idxB = ((height - 1) * width + x) * 4;
    if (isBg(rawPixels[idxB], rawPixels[idxB + 1], rawPixels[idxB + 2])) {
      visited[(height - 1) * width + x] = 1;
      queue.push(x, height - 1);
    }
  }

  for (let y = 0; y < height; y++) {
    // left
    let idxL = (y * width + 0) * 4;
    if (!visited[y * width] && isBg(rawPixels[idxL], rawPixels[idxL + 1], rawPixels[idxL + 2])) {
      visited[y * width] = 1;
      queue.push(0, y);
    }
    // right
    let idxR = (y * width + (width - 1)) * 4;
    if (!visited[y * width + (width - 1)] && isBg(rawPixels[idxR], rawPixels[idxR + 1], rawPixels[idxR + 2])) {
      visited[y * width + (width - 1)] = 1;
      queue.push(width - 1, y);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIndex = ny * width + nx;
        if (!visited[nIndex]) {
          const pIdx = nIndex * 4;
          if (isBg(rawPixels[pIdx], rawPixels[pIdx + 1], rawPixels[pIdx + 2])) {
            visited[nIndex] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // Create PNG
  // Find bounding box of non-visited pixels
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (!visited[idx]) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels) {
    minX = 0; maxX = width - 1; minY = 0; maxY = height - 1;
  }

  // Add a small padding of 4 pixels
  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const croppedW = maxX - minX + 1;
  const croppedH = maxY - minY + 1;

  const png = new PNG({ width: croppedW, height: croppedH });

  for (let cy = 0; cy < croppedH; cy++) {
    for (let cx = 0; cx < croppedW; cx++) {
      const srcX = minX + cx;
      const srcY = minY + cy;
      const srcIdx = (srcY * width + srcX);
      const srcP = srcIdx * 4;
      const destP = (cy * croppedW + cx) * 4;

      if (visited[srcIdx]) {
        png.data[destP] = 0;
        png.data[destP + 1] = 0;
        png.data[destP + 2] = 0;
        png.data[destP + 3] = 0; // transparent
      } else {
        png.data[destP] = rawPixels[srcP];
        png.data[destP + 1] = rawPixels[srcP + 1];
        png.data[destP + 2] = rawPixels[srcP + 2];
        png.data[destP + 3] = 255;
      }
    }
  }

  // Smooth edge pixels (1-pixel anti-aliasing)
  for (let cy = 1; cy < croppedH - 1; cy++) {
    for (let cx = 1; cx < croppedW - 1; cx++) {
      const destP = (cy * croppedW + cx) * 4;
      if (png.data[destP + 3] === 255) {
        // Check if any neighbor is transparent
        let transNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const np = ((cy + dy) * croppedW + (cx + dx)) * 4;
            if (png.data[np + 3] === 0) transNeighbors++;
          }
        }
        if (transNeighbors >= 3) {
          // If the pixel itself is close to white (fringe), soften alpha
          const r = png.data[destP];
          const g = png.data[destP + 1];
          const b = png.data[destP + 2];
          if (r > 220 && g > 220 && b > 220 && !isBird) {
            png.data[destP + 3] = Math.max(0, 255 - transNeighbors * 35);
          }
        }
      }
    }
  }

  return png;
}

const files = [
  { in: 'bird.png', out: 'bird_clean.png', isBird: true },
  { in: 'Doner Kebab curcan - mediu.png', out: 'doner_clean.png', isBird: false },
  { in: 'Roll Kebab curcan - mediu.png', out: 'roll_clean.png', isBird: false },
  { in: 'royalcheese-curcan copy.png', out: 'royal_clean.png', isBird: false }
];

files.forEach(f => {
  if (fs.existsSync(f.in)) {
    console.log(`Processing ${f.in}...`);
    const jpegData = fs.readFileSync(f.in);
    const rawData = jpeg.decode(jpegData, { useTArray: true });
    console.log(`Decoded ${f.in}: ${rawData.width}x${rawData.height}`);
    const png = floodFillTransparent(rawData.data, rawData.width, rawData.height, f.isBird);
    const buffer = PNG.sync.write(png);
    fs.writeFileSync(f.out, buffer);
    console.log(`Saved ${f.out}: ${png.width}x${png.height}`);
  }
});
