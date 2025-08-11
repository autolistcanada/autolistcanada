// Simple script to generate icon files
// In a real implementation, you would use a graphics library to generate these

const fs = require('fs');

// Create a simple gradient square as icon
function createIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B00" />
      <stop offset="50%" stop-color="#00C2A8" />
      <stop offset="100%" stop-color="#A5FF00" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="8" fill="url(#gradient)" />
</svg>`;
}

// Generate icons for different sizes
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const icon = createIcon(size);
  fs.writeFileSync(`assets/icon${size}.png.svg`, icon);
  console.log(`Created icon${size}.png.svg`);
});

console.log('Icon generation complete. Please convert SVG files to PNG format using a graphics tool.');
