/**
 * scripts/check-contrast.mjs
 * Validates WCAG AA contrast ratios (>= 4.5:1 for normal text)
 * for all defined design token pairs in both light and dark themes.
 */

function calculateLuminance(r, g, b) {
  const [lr, lg, lb] = [r, g, b].map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function getContrastRatio(rgb1, rgb2) {
  const l1 = calculateLuminance(...rgb1);
  const l2 = calculateLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Token pairs in [R, G, B] format
const tokenPairs = [
  // --- Light Theme ---
  { theme: 'light', name: 'background / foreground', bg: [255, 255, 255], fg: [15, 23, 42] },
  { theme: 'light', name: 'card / card-foreground', bg: [255, 255, 255], fg: [15, 23, 42] },
  { theme: 'light', name: 'popover / popover-foreground', bg: [255, 255, 255], fg: [15, 23, 42] },
  { theme: 'light', name: 'primary / primary-foreground', bg: [11, 122, 163], fg: [255, 255, 255] },
  { theme: 'light', name: 'secondary / secondary-foreground', bg: [241, 245, 249], fg: [15, 23, 42] },
  { theme: 'light', name: 'muted / muted-foreground', bg: [241, 245, 249], fg: [71, 85, 105] },
  { theme: 'light', name: 'accent / accent-foreground', bg: [242, 151, 31], fg: [15, 23, 42] },
  { theme: 'light', name: 'destructive / destructive-foreground', bg: [220, 38, 38], fg: [255, 255, 255] },

  // --- Dark Theme ---
  { theme: 'dark', name: 'background / foreground', bg: [11, 20, 32], fg: [248, 250, 252] },
  { theme: 'dark', name: 'card / card-foreground', bg: [18, 31, 48], fg: [248, 250, 252] },
  { theme: 'dark', name: 'popover / popover-foreground', bg: [22, 38, 58], fg: [248, 250, 252] },
  { theme: 'dark', name: 'primary / primary-foreground', bg: [21, 169, 227], fg: [11, 20, 32] },
  { theme: 'dark', name: 'secondary / secondary-foreground', bg: [26, 44, 68], fg: [248, 250, 252] },
  { theme: 'dark', name: 'muted / muted-foreground', bg: [24, 40, 62], fg: [148, 163, 184] },
  { theme: 'dark', name: 'accent / accent-foreground', bg: [242, 151, 31], fg: [11, 20, 32] },
  { theme: 'dark', name: 'destructive / destructive-foreground', bg: [220, 38, 38], fg: [255, 255, 255] },
];

const TARGET_RATIO = 4.5;
let failed = 0;

console.log('--- Checking WCAG AA Contrast Ratios (Minimum 4.5:1) ---');

for (const pair of tokenPairs) {
  const ratio = getContrastRatio(pair.bg, pair.fg);
  const rounded = ratio.toFixed(2);
  const status = ratio >= TARGET_RATIO ? 'PASS' : 'FAIL';

  if (ratio >= TARGET_RATIO) {
    console.log(`[PASS] (${pair.theme.padEnd(5)}) ${pair.name.padEnd(36)} -> ${rounded}:1`);
  } else {
    console.error(`[FAIL] (${pair.theme.padEnd(5)}) ${pair.name.padEnd(36)} -> ${rounded}:1 (expected >= ${TARGET_RATIO}:1)`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\nContrast check failed with ${failed} violations.`);
  process.exit(1);
} else {
  console.log(`\nAll ${tokenPairs.length} token pairs pass WCAG AA standards successfully!`);
  process.exit(0);
}
