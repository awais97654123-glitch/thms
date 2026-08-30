const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processLogo() {
  const inputPath = path.join(__dirname, '../public/logo.png');
  const outputPath = path.join(__dirname, '../public/logo-transparent.png');
  const cleanLogoPath = path.join(__dirname, '../public/logo.png');

  const image = sharp(inputPath);
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Image info: ${width}x${height}, channels: ${channels}`);

  // Loop through pixels and make white / off-white grid background transparent
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is near-white or grid line (high brightness, low saturation)
    const brightness = (r + g + b) / 3;
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

    if (brightness > 240 && maxDiff < 15) {
      // Pure white/light grey background -> full transparent
      data[i + 3] = 0;
    } else if (brightness > 225 && maxDiff < 20) {
      // Soft transition edge feathering
      const alphaFactor = (245 - brightness) / 20;
      data[i + 3] = Math.max(0, Math.min(255, Math.floor(255 * alphaFactor)));
    }
  }

  // Save the transparent version
  await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .trim() // Trim transparent borders
    .png({ quality: 100 })
    .toFile(outputPath);

  // Also update public/logo.png with the transparent trim
  fs.copyFileSync(outputPath, cleanLogoPath);

  console.log('✅ Crystal-clear transparent logo saved to public/logo.png & public/logo-transparent.png');
}

processLogo().catch(console.error);
