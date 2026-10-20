import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inputPath = path.resolve('originals/logo_ar.jpg');
const outputDir = path.resolve('public/images/optimized');
const outPng = path.join(outputDir, 'logo_ar.png');
const outWebp = path.join(outputDir, 'logo_ar.webp');

async function processLogo() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found at ${inputPath}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const meta = await sharp(inputPath).metadata();
  console.log(`Source dimensions: ${meta.width}x${meta.height}, format: ${meta.format}`);

  let targetWidth = meta.width;
  let targetHeight = meta.height;
  if (targetWidth > 800) {
    targetHeight = Math.round((meta.height * 800) / meta.width);
    targetWidth = 800;
  }

  const { data, info } = await sharp(inputPath)
    .resize(targetWidth, targetHeight, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const numPixels = width * height;
  const rgbaBuffer = Buffer.alloc(numPixels * 4);

  // Background color reference from corners [254, 251, 242]
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  for (let i = 0; i < numPixels; i++) {
    const srcIdx = i * channels;
    const destIdx = i * 4;

    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

    let a = 0;
    if (dist <= 7) {
      a = 0;
    } else if (dist >= 26) {
      a = 255;
    } else {
      a = Math.round(((dist - 7) / (26 - 7)) * 255);
    }

    if (a === 0) {
      rgbaBuffer[destIdx] = 0;
      rgbaBuffer[destIdx + 1] = 0;
      rgbaBuffer[destIdx + 2] = 0;
      rgbaBuffer[destIdx + 3] = 0;
    } else if (a === 255) {
      rgbaBuffer[destIdx] = r;
      rgbaBuffer[destIdx + 1] = g;
      rgbaBuffer[destIdx + 2] = b;
      rgbaBuffer[destIdx + 3] = 255;
    } else {
      const alphaNorm = a / 255;
      const invAlpha = 1 - alphaNorm;
      rgbaBuffer[destIdx] = clamp(Math.round((r - bgR * invAlpha) / alphaNorm), 0, 255);
      rgbaBuffer[destIdx + 1] = clamp(Math.round((g - bgG * invAlpha) / alphaNorm), 0, 255);
      rgbaBuffer[destIdx + 2] = clamp(Math.round((b - bgB * invAlpha) / alphaNorm), 0, 255);
      rgbaBuffer[destIdx + 3] = a;
    }
  }

  const image = sharp(rgbaBuffer, {
    raw: {
      width,
      height,
      channels: 4,
    },
  });

  await image.clone().png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 }).toFile(outPng);
  await image.clone().webp({ quality: 80, effort: 6 }).toFile(outWebp);

  const { data: processedData } = await sharp(outPng).raw().toBuffer({ resolveWithObject: true });

  const getAlpha = (x, y) => {
    const idx = (y * width + x) * 4;
    return processedData[idx + 3];
  };

  const corners = {
    topLeft: getAlpha(0, 0),
    topRight: getAlpha(width - 1, 0),
    bottomLeft: getAlpha(0, height - 1),
    bottomRight: getAlpha(width - 1, height - 1),
  };

  console.log('Corner pixel alphas:');
  console.log(`  Top-Left (0, 0): ${corners.topLeft}`);
  console.log(`  Top-Right (${width - 1}, 0): ${corners.topRight}`);
  console.log(`  Bottom-Left (0, ${height - 1}): ${corners.bottomLeft}`);
  console.log(`  Bottom-Right (${width - 1}, ${height - 1}): ${corners.bottomRight}`);

  if (
    corners.topLeft !== 0 ||
    corners.topRight !== 0 ||
    corners.bottomLeft !== 0 ||
    corners.bottomRight !== 0
  ) {
    throw new Error('Assertion failed: All 4 corner pixels must have alpha = 0');
  }

  const pngStats = fs.statSync(outPng);
  const webpStats = fs.statSync(outWebp);

  console.log(`PNG output: ${outPng} (${(pngStats.size / 1024).toFixed(1)} KB)`);
  console.log(`WebP output: ${outWebp} (${(webpStats.size / 1024).toFixed(1)} KB)`);
  console.log('New logo processing successful. All assertions passed.');
}

processLogo().catch((err) => {
  console.error('Error in make-logo:', err);
  process.exit(1);
});
