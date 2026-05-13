export type RgbColor = readonly [number, number, number];

export type PaletteKey = 'original' | 'custom' | 'gameboy' | 'arcade' | 'classic' | 'cyberpunk';

export interface PaletteDefinition {
  key: PaletteKey;
  name: string;
  description: string;
  colors: RgbColor[];
}

export const basePalettes: ReadonlyArray<PaletteDefinition> = [
  {
    key: 'original',
    name: '原图色彩',
    description: '保留原图颜色，仅降低色彩深度并像素化。',
    colors: [],
  },
  {
    key: 'gameboy',
    name: 'GameBoy',
    description: '经典掌机的绿色四阶灰度。',
    colors: [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
  },
  {
    key: 'arcade',
    name: 'Arcade',
    description: '高对比的街机综合色盘。',
    colors: [
      [217, 87, 99],
      [233, 159, 46],
      [243, 213, 91],
      [81, 180, 99],
      [55, 120, 201],
      [165, 81, 189],
      [242, 116, 68],
      [162, 209, 73],
      [91, 110, 145],
      [243, 239, 125],
      [255, 255, 255],
      [20, 20, 30],
    ],
  },
  {
    key: 'classic',
    name: '经典 16 色',
    description: '复古像素画常用 16 色。',
    colors: [
      [20, 12, 28],
      [68, 36, 52],
      [48, 52, 109],
      [78, 74, 78],
      [133, 76, 48],
      [52, 101, 36],
      [208, 70, 72],
      [117, 113, 97],
      [89, 125, 206],
      [184, 111, 80],
      [112, 162, 89],
      [241, 136, 97],
      [237, 188, 97],
      [206, 205, 205],
      [237, 237, 237],
      [247, 238, 193],
    ],
  },
  {
    key: 'cyberpunk',
    name: 'Cyberpunk',
    description: '霓虹粉、蓝紫和高亮青色。',
    colors: [
      [10, 10, 20],
      [20, 15, 45],
      [45, 10, 80],
      [90, 10, 140],
      [140, 20, 200],
      [200, 30, 100],
      [255, 40, 120],
      [255, 100, 150],
      [0, 180, 255],
      [0, 220, 220],
      [100, 255, 255],
      [180, 100, 255],
      [255, 180, 50],
      [50, 255, 180],
      [255, 255, 255],
      [160, 160, 180],
    ],
  },
];

export function createCustomPalette(colors: RgbColor[]): PaletteDefinition {
  return {
    key: 'custom',
    name: '自定义',
    description: '使用你添加的颜色进行映射。',
    colors,
  };
}

export function normalizeChannel(value: unknown): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(255, Math.round(numericValue)));
}

export function normalizeColor(color: unknown): RgbColor | null {
  if (!Array.isArray(color) || color.length < 3) return null;

  return [
    normalizeChannel(color[0]),
    normalizeChannel(color[1]),
    normalizeChannel(color[2]),
  ];
}

export function hexToRgb(hex: string): RgbColor {
  const normalizedHex = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#e94560';
  return [
    parseInt(normalizedHex.slice(1, 3), 16),
    parseInt(normalizedHex.slice(3, 5), 16),
    parseInt(normalizedHex.slice(5, 7), 16),
  ];
}

export function rgbToCss(color: RgbColor): string {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}
