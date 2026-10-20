import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('public');
const outJpg = path.join(outputDir, 'og-image.jpg');

async function makeOgImage() {
  const width = 1200;
  const height = 630;

  // SVG graphic with ivory-to-sage gradient, ornamental gold borders, stars, and typography
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBF7F0" />
        <stop offset="50%" stop-color="#F6E6E4" />
        <stop offset="100%" stop-color="#DDE7DA" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C8A96A" />
        <stop offset="100%" stop-color="#8A6F3A" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)" />

    <!-- Ornamental Double Frame -->
    <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="16" fill="none" stroke="#C8A96A" stroke-width="1.5" stroke-opacity="0.6" />
    <rect x="52" y="52" width="${width - 104}" height="${height - 104}" rx="12" fill="none" stroke="#C8A96A" stroke-width="0.8" stroke-opacity="0.4" />

    <!-- Corner Accents -->
    <circle cx="52" cy="52" r="3" fill="#C8A96A" />
    <circle cx="${width - 52}" cy="52" r="3" fill="#C8A96A" />
    <circle cx="52" cy="${height - 52}" r="3" fill="#C8A96A" />
    <circle cx="${width - 52}" cy="${height - 52}" r="3" fill="#C8A96A" />

    <!-- Content -->
    <g text-anchor="middle" font-family="Georgia, serif">
      <!-- Bismillah -->
      <text x="${width / 2}" y="130" font-size="28" fill="#3F4A3C" letter-spacing="2">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</text>

      <!-- Label -->
      <text x="${width / 2}" y="190" font-size="15" font-family="system-ui, sans-serif" font-weight="600" fill="#8A6F3A" letter-spacing="5">WALIMA INVITATION</text>

      <!-- Divider line with star -->
      <line x1="${width / 2 - 120}" y1="215" x2="${width / 2 - 25}" y2="215" stroke="#C8A96A" stroke-width="1" stroke-opacity="0.7" />
      <text x="${width / 2}" y="220" font-size="16" fill="#C8A96A">✦</text>
      <line x1="${width / 2 + 25}" y1="215" x2="${width / 2 + 120}" y2="215" stroke="#C8A96A" stroke-width="1" stroke-opacity="0.7" />

      <!-- Groom Name -->
      <text x="${width / 2}" y="295" font-size="52" font-style="italic" fill="#2C3529">Ashick</text>
      
      <!-- Ampersand -->
      <text x="${width / 2}" y="360" font-size="34" font-style="italic" fill="#8A6F3A">&amp;</text>
      
      <!-- Bride Name -->
      <text x="${width / 2}" y="425" font-size="52" font-style="italic" fill="#2C3529">Rukshana Parveen</text>

      <!-- Date & Venue -->
      <text x="${width / 2}" y="495" font-size="17" font-family="system-ui, sans-serif" font-weight="600" fill="#8A6F3A" letter-spacing="3">WEDNESDAY, 30 DECEMBER 2026</text>
      <text x="${width / 2}" y="535" font-size="20" fill="#3F4A3C">Vasantha Mahal · Namakkal</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 88 })
    .toFile(outJpg);

  const stats = fs.statSync(outJpg);
  console.log(`OG image generated: ${outJpg} (${(stats.size / 1024).toFixed(1)} KB)`);
}

makeOgImage().catch(console.error);
