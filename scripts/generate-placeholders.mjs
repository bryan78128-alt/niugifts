#!/usr/bin/env node
/**
 * Generate placeholder SVG images for products and cases.
 * Replace these with actual product photos.
 *
 * Usage: node scripts/generate-placeholders.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public/images');
const PRODUCT_DIR = path.join(PUBLIC_DIR, 'products');
const CASES_DIR = path.join(PUBLIC_DIR, 'cases');

const placeholders = {
  // Product images
  'night-light-01': { label: '3D Acrylic Night Light', color: '#F5A623', bg: '#1a1520' },
  'night-light-02': { label: 'Cultural Creative Night Light', color: '#7B68EE', bg: '#151020' },
  'night-light-03': { label: 'Custom Shape Night Light', color: '#FF6B6B', bg: '#201015' },
  'flip-book-01': { label: 'Flip Book', color: '#4ECDC4', bg: '#102020' },
  'nixie-clock-01': { label: 'Nixie Tube Clock', color: '#FF9FF3', bg: '#201020' },
  'neon-sign-01': { label: 'Neon Sign', color: '#00D2D3', bg: '#101520' },
  'ambient-light-01': { label: 'Ambient Light', color: '#FFA502', bg: '#1a1510' },
};

// Case images
const caseImages = {
  'buaa': { label: 'BUAA Computer Science', color: '#4A90D9', bg: '#101820' },
  'corp': { label: 'Corporate Anniversary', color: '#50C878', bg: '#102015' },
};

function svg(label, color, bg, index = 1) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#base)"/>
  <rect width="800" height="800" fill="url(#glow)"/>
  <circle cx="400" cy="350" r="120" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3"/>
  <circle cx="400" cy="350" r="80" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.2"/>
  <circle cx="400" cy="350" r="40" fill="${color}" opacity="0.1"/>
  <line x1="400" y1="350" x2="320" y2="450" stroke="${color}" stroke-width="1" opacity="0.2"/>
  <line x1="400" y1="350" x2="480" y2="450" stroke="${color}" stroke-width="1" opacity="0.2"/>
  <line x1="400" y1="350" x2="350" y2="280" stroke="${color}" stroke-width="1" opacity="0.15"/>
  <line x1="400" y1="350" x2="450" y2="280" stroke="${color}" stroke-width="1" opacity="0.15"/>
  <rect x="280" y="460" width="240" height="3" rx="1.5" fill="${color}" opacity="0.15"/>
  <text x="400" y="500" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="${color}" opacity="0.4">${label}</text>
  <text x="400" y="530" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="${color}" opacity="0.2">📸 Place product photo here</text>
  </svg>`;
}

// Generate product images
for (const [key, cfg] of Object.entries(placeholders)) {
  for (let i = 1; i <= 4; i++) {
    const filePath = path.join(PRODUCT_DIR, `${key}-${i}.jpg`);
    if (!fs.existsSync(filePath)) {
      // Write as .svg since we can't generate real jpg
      const svgPath = filePath.replace('.jpg', '.svg');
      fs.writeFileSync(svgPath, svg(cfg.label, cfg.color, cfg.bg, i), 'utf-8');
      console.log(`Created: ${path.relative(ROOT, svgPath)}`);
    }
  }
}

// Generate case images
for (const [key, cfg] of Object.entries(caseImages)) {
  for (let i = 1; i <= 3; i++) {
    const filePath = path.join(CASES_DIR, `${key}-${i}.jpg`);
    if (!fs.existsSync(filePath)) {
      const svgPath = filePath.replace('.jpg', '.svg');
      fs.writeFileSync(svgPath, svg(cfg.label, cfg.color, cfg.bg, i), 'utf-8');
      console.log(`Created: ${path.relative(ROOT, svgPath)}`);
    }
  }
}

console.log('\nPlaceholder images generated. Replace .svg files with actual product photos.');
