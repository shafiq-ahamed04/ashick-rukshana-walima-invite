import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inputPath = path.resolve('originals/couple.jpg');
const outputDir = path.resolve('public/images/optimized');
const outJpg = path.join(outputDir, 'couple.jpg');
const outWebp = path.join(outputDir, 'couple.webp');

async function optimizeCouple() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found at ${inputPath}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const meta = await sharp(inputPath).metadata();
  console.log(`Source couple photo: ${meta.width}x${meta.height}, format: ${meta.format}`);

  let targetWidth = meta.width;
  let targetHeight = meta.height;
  if (targetWidth > 1400) {
    targetHeight = Math.round((meta.height * 1400) / meta.width);
    targetWidth = 1400;
  }

  // Base sharp pipeline (no stretching)
  const base = sharp(inputPath).resize(targetWidth, targetHeight, { fit: 'inside' });

  // WebP
  await base.clone().webp({ quality: 80, effort: 5 }).toFile(outWebp);

  // Progressive JPG
  await base.clone().jpeg({ quality: 80, progressive: true }).toFile(outJpg);

  const webpStats = fs.statSync(outWebp);
  const jpgStats = fs.statSync(outJpg);

  console.log(`Couple WebP: ${outWebp} (${(webpStats.size / 1024).toFixed(1)} KB)`);
  console.log(`Couple JPG: ${outJpg} (${(jpgStats.size / 1024).toFixed(1)} KB)`);

  if (webpStats.size > 250 * 1024 || jpgStats.size > 250 * 1024) {
    throw new Error('Assertion failed: Each file must be under 250KB');
  }

  console.log('Couple photo optimization successful. Both files under 250KB.');
}

optimizeCouple().catch((err) => {
  console.error('Error optimizing couple photo:', err);
  process.exit(1);
});
