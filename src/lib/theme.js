// Design tokens — single source of truth for all Lingo Roots styling.
// No hex values, border radii, or font sizes should appear inline in components.

export const colors = {
  // Primary — brand guide v3
  brand:      '#393893',
  brandLight: '#6B5FBD',  // hover states, active borders
  brandFaint: '#EEEDF8',  // card backgrounds, subtle fills

  // Secondary palette
  orange: '#F97316',  // streaks
  green:  '#22C55E',  // awards
  blue:   '#4A90C4',  // Lingo Tech sub-brand
  yellow: '#F5C518',  // highlights
  coral:  '#F87171',  // premium banner, errors

  // Neutrals
  grey:       '#555555',
  greyLight:  '#9CA3AF',
  greyFaint:  '#F9FAFB',
  border:     '#E5E7EB',
  white:      '#FFFFFF',
  black:      '#1A1A1A',
  text:       '#1A1A2E',
  textMuted:  '#6B7280',

  // Pastel tints — tag fills, badge backgrounds
  orangeLight: '#FFF0E6',
  greenLight:  '#E8F8EF',
  blueLight:   '#E8F1FA',
  yellowLight: '#FEFBE8',
  coralLight:  '#FEF2F2',
}

export const fonts = {
  kids:  "'Paytone One', sans-serif",  // all children-facing screens
  body:  "'Inter', sans-serif",        // parent-facing, admin, onboarding
}

export const fontWeights = {
  regular: 400,
  medium:  500,
  semibold: 600,
  bold:    700,
  black:   800,
}

export const fontSizes = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  '2xl': 30,
  '3xl': 38,
}

// Touch targets: min 48×48px per PRD §8.1
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  base: 16,
  lg:  20,
  xl:  24,
  '2xl': 32,
  '3xl': 48,
}

export const radii = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  full: 9999,
}

// Gamification badge dimensions
export const badges = {
  sm:  { width: 28, height: 28, fontSize: 11 },
  md:  { width: 36, height: 36, fontSize: 13 },
  lg:  { width: 48, height: 48, fontSize: 16 },
}

// Lesson card dimensions (Look & Listen grid)
export const cards = {
  sm:  { width: 140, height: 140 },  // 2-col on small phones
  md:  { width: 160, height: 160 },  // 2-col standard
}

// Companion characters
export const characters = {
  ziki: { name: 'Ziki',  emoji: '🐒', personality: 'curious, energetic' },
  nia:  { name: 'Nia',   emoji: '🐘', personality: 'steady, great memory' },
  asha: { name: 'Asha',  emoji: '🦅', personality: 'focused, pattern-spotter' },
  kofi: { name: 'Kofi',  emoji: '🦁', personality: 'brave, persistent' },
}

// Animation durations (ms) — PRD §8.4: rewards < 100ms
export const durations = {
  tap:       80,   // drum ripple start — must feel instant
  reward:    100,  // max delay before reward animation fires
  ripple:    300,  // drum ripple fade
  transition: 200, // screen transitions
  character: 2000, // idle breathing loop
}

// Easing curves
export const easings = {
  spring:  { type: 'spring', stiffness: 500, damping: 30 },
  bounce:  { type: 'spring', stiffness: 400, damping: 10 },  // celebration jump
  smooth:  [0.4, 0, 0.2, 1],
}
