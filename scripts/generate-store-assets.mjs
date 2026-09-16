#!/usr/bin/env node
/**
 * scripts/generate-store-assets.mjs
 * 
 * Generates verified, valid PNG assets for Apple App Store and Google Play Store:
 * 1. icon.png (1024x1024, 24-bit RGB, no alpha per Apple App Store requirements)
 * 2. adaptive-icon.png (512x512, 32-bit RGBA, foreground)
 * 3. icon-background.png (512x512, 24-bit RGB, background #04070D)
 * 4. splash.png (1242x2436, 24-bit RGB, portrait splash)
 * 5. feature-graphic.png (1024x500, 24-bit RGB, Google Play header)
 * 6. favicon.png (48x48, 32-bit RGBA)
 *
 * Uses built-in Node.js zlib and crc32 calculation with zero external dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'apps/mobile/assets');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// CRC32 Table & Computation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crcTarget = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcTarget);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

/**
 * Creates a valid PNG buffer from a pixel generator function.
 * @param {number} width 
 * @param {number} height 
 * @param {boolean} hasAlpha 
 * @param {Function} pixelFn (x, y) => [r, g, b, a?]
 */
function createPng(width, height, hasAlpha, pixelFn) {
  const bytesPerPixel = hasAlpha ? 4 : 3;
  const scanlineLength = 1 + width * bytesPerPixel;
  const rawData = Buffer.alloc(height * scanlineLength);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const color = pixelFn(x, y);
      rawData[offset++] = color[0];
      rawData[offset++] = color[1];
      rawData[offset++] = color[2];
      if (hasAlpha) {
        rawData[offset++] = color[3] !== undefined ? color[3] : 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 6 });

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = hasAlpha ? 6 : 2; // Color type: 6 (RGBA) or 2 (RGB)
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter: Adaptive
  ihdrData[12] = 0; // Interlace: None

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

console.log('==> Generating App Store & Google Play Store Visual Assets...');

// 1. App Store Icon: 1024x1024 RGB (No alpha channel, Apple requirement)
// Deep Obsidian background (#04070D), emerald stadium field glow, luminous cricket ball and bat motif
const icon1024 = createPng(1024, 1024, false, (x, y) => {
  const dx = x - 512;
  const dy = y - 512;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background gradient: Deep obsidian with stadium center glow
  const centerGlow = Math.max(0, 1 - dist / 500);
  let r = Math.floor(4 + 10 * centerGlow);
  let g = Math.floor(7 + 35 * centerGlow);
  let b = Math.floor(13 + 40 * centerGlow);

  // Rounded icon border outline (subtle emerald frame)
  if (dist > 440 && dist < 450) {
    r = 0; g = 229; b = 153;
  }

  // Cricket ball (circle at center: radius 180)
  const ballDist = Math.sqrt((dx) * (dx) + (dy) * (dy));
  if (ballDist < 180) {
    // Ball body with spherical 3D shading
    const light = Math.max(0, 1 - Math.sqrt((dx + 50) ** 2 + (dy + 50) ** 2) / 240);
    r = Math.floor(0 * light);
    g = Math.floor(180 + 75 * light); // Emerald green core
    b = Math.floor(120 + 70 * light);

    // Ball seam (diagonal curve)
    const seam = Math.abs(dx - dy);
    if (seam < 14) {
      r = 248; g = 250; b = 252; // White seam stitching
    }
  }

  return [r, g, b];
});
fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), icon1024);
console.log('✓ Created: apps/mobile/assets/icon.png (1024x1024, 24-bit RGB)');

// 2. Google Play Adaptive Icon Foreground: 512x512 RGBA
const adaptiveIcon = createPng(512, 512, true, (x, y) => {
  const dx = x - 256;
  const dy = y - 256;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 120) {
    const light = Math.max(0, 1 - Math.sqrt((dx + 30) ** 2 + (dy + 30) ** 2) / 160);
    const seam = Math.abs(dx - dy);
    if (seam < 8) {
      return [248, 250, 252, 255];
    }
    return [0, Math.floor(180 + 75 * light), Math.floor(120 + 70 * light), 255];
  }

  // Cyan halo ring
  if (dist >= 125 && dist <= 135) {
    return [0, 210, 255, 220];
  }

  return [0, 0, 0, 0]; // Transparent outside
});
fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.png'), adaptiveIcon);
console.log('✓ Created: apps/mobile/assets/adaptive-icon.png (512x512, 32-bit RGBA)');

// 3. Adaptive Icon Background: 512x512 RGB
const iconBg = createPng(512, 512, false, (x, y) => {
  const dx = x - 256;
  const dy = y - 256;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const glow = Math.max(0, 1 - dist / 300);
  return [
    Math.floor(4 + 8 * glow),
    Math.floor(7 + 25 * glow),
    Math.floor(13 + 30 * glow)
  ];
});
fs.writeFileSync(path.join(ASSETS_DIR, 'icon-background.png'), iconBg);
console.log('✓ Created: apps/mobile/assets/icon-background.png (512x512, 24-bit RGB)');

// 4. Mobile Splash Screen: 1242x2436 RGB
const splash = createPng(1242, 2436, false, (x, y) => {
  const dx = x - 621;
  const dy = y - 1218;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background dark stadium atmosphere
  const bgGlow = Math.max(0, 1 - dist / 800);
  let r = Math.floor(4 + 12 * bgGlow);
  let g = Math.floor(7 + 30 * bgGlow);
  let b = Math.floor(13 + 35 * bgGlow);

  // Center emblem
  if (dist < 140) {
    const light = Math.max(0, 1 - Math.sqrt((dx + 30) ** 2 + (dy + 30) ** 2) / 180);
    const seam = Math.abs(dx - dy);
    if (seam < 10) {
      r = 248; g = 250; b = 252;
    } else {
      r = 0;
      g = Math.floor(180 + 75 * light);
      b = Math.floor(120 + 70 * light);
    }
  }

  // Cyan outer ring
  if (dist >= 148 && dist <= 156) {
    r = 0; g = 210; b = 255;
  }

  return [r, g, b];
});
fs.writeFileSync(path.join(ASSETS_DIR, 'splash.png'), splash);
console.log('✓ Created: apps/mobile/assets/splash.png (1242x2436, 24-bit RGB)');

// 5. Google Play Feature Graphic: 1024x500 RGB
const featureGraphic = createPng(1024, 500, false, (x, y) => {
  const dx = x - 512;
  const dy = y - 250;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Stadium banner horizontal gradient with pitch glow
  const stadiumLight = Math.max(0, 1 - Math.abs(dy) / 250);
  let r = Math.floor(4 + 15 * stadiumLight);
  let g = Math.floor(7 + 45 * stadiumLight);
  let b = Math.floor(13 + 55 * stadiumLight);

  // Center cricket ball badge
  const ballDist = Math.sqrt((x - 280) ** 2 + (y - 250) ** 2);
  if (ballDist < 90) {
    const seam = Math.abs((x - 280) - (y - 250));
    if (seam < 6) {
      r = 248; g = 250; b = 252;
    } else {
      r = 0; g = 229; b = 153;
    }
  }

  // Accent lines (turf and cyan strokes)
  if (y > 470) {
    r = 0; g = 229; b = 153;
  } else if (y > 465) {
    r = 0; g = 210; b = 255;
  }

  return [r, g, b];
});
fs.writeFileSync(path.join(ASSETS_DIR, 'feature-graphic.png'), featureGraphic);
console.log('✓ Created: apps/mobile/assets/feature-graphic.png (1024x500, 24-bit RGB)');

// 6. Favicon: 48x48 RGBA
const favicon = createPng(48, 48, true, (x, y) => {
  const dx = x - 24;
  const dy = y - 24;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 20) {
    const seam = Math.abs(dx - dy);
    if (seam < 3) return [248, 250, 252, 255];
    return [0, 229, 153, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.png'), favicon);
console.log('✓ Created: apps/mobile/assets/favicon.png (48x48, 32-bit RGBA)');

console.log('✅ All store visual assets generated successfully in apps/mobile/assets/');
