import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inputPath = path.resolve('originals/couple.jpg');
const outputDir = path.resolve('public/images/optimized');
const outJpg = path.join(outputDir, 'couple.jpg');
const outWebp = path.join(outputDir, 'couple.webp');

async function makePhoto() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found at ${inputPath}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const targetWidth = 900;
  const targetHeight = 1200; // 3:4 portrait

  const resized = sharp(inputPath).resize(targetWidth, targetHeight, {
    fit: 'cover',
    position: 'center'
  });

  // WebP (under 120KB)
  let q = 78;
  await resized.clone().webp({ quality: q, effort: 6 }).toFile(outWebp);
  while (fs.statSync(outWebp).size > 118 * 1024 && q > 40) {
    q -= 2;
    await resized.clone().webp({ quality: q, effort: 6 }).toFile(outWebp);
  }
  const webpStats = fs.statSync(outWebp);

  // Progressive JPG (quality 82, progressive)
  await resized.clone().jpeg({ quality: 82, progressive: true }).toFile(outJpg);
  const jpgStats = fs.statSync(outJpg);

  console.log(`Output:`);
  console.log(`- couple.webp: ${(webpStats.size / 1024).toFixed(1)} KB (Target: under 120KB)`);
  console.log(`- couple.jpg: ${(jpgStats.size / 1024).toFixed(1)} KB`);
}

makePhoto().catch((err) => {
  console.error('Error generating photo:', err);
  process.exit(1);
});
