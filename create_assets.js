const fs = require('fs');
const { PNG } = require('pngjs');

function resizePNG(srcPng, maxDim) {
  const scale = Math.min(1, maxDim / Math.max(srcPng.width, srcPng.height));
  const newW = Math.round(srcPng.width * scale);
  const newH = Math.round(srcPng.height * scale);

  const dest = new PNG({ width: newW, height: newH });

  for (let dy = 0; dy < newH; dy++) {
    for (let dx = 0; dx < newW; dx++) {
      const sx = (dx / newW) * srcPng.width;
      const sy = (dy / newH) * srcPng.height;

      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = Math.min(srcPng.width - 1, x0 + 1);
      const y1 = Math.min(srcPng.height - 1, y0 + 1);

      const fx = sx - x0;
      const fy = sy - y0;

      const destIdx = (dy * newW + dx) * 4;

      for (let c = 0; c < 4; c++) {
        const p00 = srcPng.data[(y0 * srcPng.width + x0) * 4 + c];
        const p10 = srcPng.data[(y0 * srcPng.width + x1) * 4 + c];
        const p01 = srcPng.data[(y1 * srcPng.width + x0) * 4 + c];
        const p11 = srcPng.data[(y1 * srcPng.width + x1) * 4 + c];

        const top = p00 * (1 - fx) + p10 * fx;
        const bottom = p01 * (1 - fx) + p11 * fx;
        dest.data[destIdx + c] = Math.round(top * (1 - fy) + bottom * fy);
      }
    }
  }
  return dest;
}

const list = [
  { name: 'bird', file: 'bird_clean.png', max: 512 },
  { name: 'doner', file: 'doner_clean.png', max: 512 },
  { name: 'roll', file: 'roll_clean.png', max: 512 },
  { name: 'royal', file: 'royal_clean.png', max: 512 }
];

const assets = {};

list.forEach(item => {
  const data = fs.readFileSync(item.file);
  const png = PNG.sync.read(data);
  const resized = resizePNG(png, item.max);
  const outBuf = PNG.sync.write(resized);
  assets[item.name] = 'data:image/png;base64,' + outBuf.toString('base64');
  console.log(`Generated optimized ${item.name}: ${resized.width}x${resized.height}, size: ${outBuf.length} bytes`);
});

const jsContent = `// Meso Fly - Embedded 3D & 2D Game Assets
const GAME_ASSETS = ${JSON.stringify(assets, null, 2)};
`;

fs.writeFileSync('assets.js', jsContent);
console.log('assets.js written successfully!');
