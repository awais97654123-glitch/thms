const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ICONS_DIR = path.join(__dirname, '..', 'src-tauri', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Function to generate uncompressed RGBA PNG
function createPngBuffer(width, height, r, g, b, a = 255) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw Image Data (Filter byte 0 + RGBA per pixel per row)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // School Badge Crest Gradient calculation
      const cx = width / 2;
      const cy = height / 2;
      const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const maxRadius = width * 0.45;

      if (distFromCenter <= maxRadius) {
        // Inner Emblem (Emerald to Royal Blue)
        const t = (x + y) / (width + height);
        rawData[pixelOffset] = Math.round(16 + (37 - 16) * t); // R
        rawData[pixelOffset + 1] = Math.round(185 + (99 - 185) * t); // G
        rawData[pixelOffset + 2] = Math.round(129 + (235 - 129) * t); // B
        rawData[pixelOffset + 3] = 255;
      } else if (distFromCenter <= maxRadius + 2) {
        // Gold / Yellow Ring
        rawData[pixelOffset] = 234;
        rawData[pixelOffset + 1] = 179;
        rawData[pixelOffset + 2] = 8;
        rawData[pixelOffset + 3] = 255;
      } else {
        // Navy Background Shield (#0f172a)
        rawData[pixelOffset] = 15;
        rawData[pixelOffset + 1] = 23;
        rawData[pixelOffset + 2] = 42;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([length, body, crcBuf]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate ICO file wrapping PNG
function createIcoBuffer(pngBuffers) {
  const numImages = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(numImages, 4);

  const directoryEntries = [];
  let currentOffset = 6 + numImages * 16;

  for (const img of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image data size
    entry.writeUInt32LE(currentOffset, 12); // Offset
    directoryEntries.push(entry);
    currentOffset += img.buffer.length;
  }

  return Buffer.concat([
    header,
    ...directoryEntries,
    ...pngBuffers.map((b) => b.buffer),
  ]);
}

// Generate all standard Tauri / Windows icon sizes
const sizes = [32, 128, 256, 512];
const generatedPngs = {};

sizes.forEach((s) => {
  const png = createPngBuffer(s, s);
  generatedPngs[s] = png;
  fs.writeFileSync(path.join(ICONS_DIR, `${s}x${s}.png`), png);
  if (s === 128) {
    fs.writeFileSync(path.join(ICONS_DIR, '128x128@2x.png'), createPngBuffer(256, 256));
  }
});

// Standard icon.png
fs.writeFileSync(path.join(ICONS_DIR, 'icon.png'), generatedPngs[512]);

// Windows Store & UWP logo sizes
const uwpSizes = [
  'Square30x30Logo.png',
  'Square44x44Logo.png',
  'Square71x71Logo.png',
  'Square89x89Logo.png',
  'Square107x107Logo.png',
  'Square142x142Logo.png',
  'Square150x150Logo.png',
  'Square284x284Logo.png',
  'Square310x310Logo.png',
  'StoreLogo.png',
];

uwpSizes.forEach((name) => {
  fs.writeFileSync(path.join(ICONS_DIR, name), generatedPngs[128]);
});

// Windows icon.ico
const icoBuffer = createIcoBuffer([
  { width: 32, height: 32, buffer: generatedPngs[32] },
  { width: 128, height: 128, buffer: generatedPngs[128] },
  { width: 256, height: 256, buffer: generatedPngs[256] },
]);
fs.writeFileSync(path.join(ICONS_DIR, 'icon.ico'), icoBuffer);

console.log('✅ All Windows / Tauri application icons generated successfully in src-tauri/icons/');
