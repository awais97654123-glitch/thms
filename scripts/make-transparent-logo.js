const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processLogo() {
  const inputPath = 'C:\\Users\\abuba\\.gemini\\antigravity-ide\\brain\\7bcb757e-3e1c-4dc7-ab4f-628eae822cbb\\.user_uploaded\\media_1788116171137.jpg';
  const outputPath = path.join(__dirname, '../public/logo-transparent.png');
  const cleanLogoPath = path.join(__dirname, '../public/logo.png');
  const schoolLogoPath = path.join(__dirname, '../public/school-logo.png');

  const image = sharp(inputPath);
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Processing high-res 3D logo: ${width}x${height}, channels: ${channels}`);

  // Loop through pixels and remove grid / white background
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const brightness = (r + g + b) / 3;
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

    // Remove white and grey grid pattern pixels
    if (brightness > 235 && maxDiff < 20) {
      data[i + 3] = 0;
    } else if (brightness > 215 && maxDiff < 25) {
      // Smooth anti-aliased edge feathering
      const alphaFactor = (235 - brightness) / 20;
      data[i + 3] = Math.max(0, Math.min(255, Math.floor(255 * alphaFactor)));
    }
  }

  // Save the transparent version trimmed
  await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .trim()
    .png({ quality: 100 })
    .toFile(outputPath);

  fs.copyFileSync(outputPath, cleanLogoPath);
  fs.copyFileSync(outputPath, schoolLogoPath);

  console.log('✅ Transparent 3D metallic & gold graduation cap logo successfully saved to public/logo.png, public/logo-transparent.png, and public/school-logo.png');
}

processLogo().catch(console.error);
