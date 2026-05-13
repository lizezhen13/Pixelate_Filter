import type { RgbColor } from './palettes';

type ImageSource = HTMLImageElement | HTMLCanvasElement;

function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('当前浏览器不支持 Canvas 2D 上下文。');
  }
  return context;
}

function getSourceSize(source: ImageSource): { width: number; height: number } {
  if ('naturalWidth' in source && source.naturalWidth > 0 && source.naturalHeight > 0) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }

  return { width: source.width, height: source.height };
}

function normalizeColorDepth(depth: number): number {
  if (!Number.isFinite(depth)) return 16;
  return Math.max(2, Math.min(64, Math.round(depth)));
}

function quantizeChannel(value: number, depth: number): number {
  const step = 255 / (depth - 1);
  const quantized = Math.round(value / step) * step;
  return Math.max(0, Math.min(255, Math.round(quantized)));
}

function quantizeRgb(r: number, g: number, b: number, depth: number): RgbColor {
  return [
    quantizeChannel(r, depth),
    quantizeChannel(g, depth),
    quantizeChannel(b, depth),
  ];
}

function quantizePalette(palette: readonly RgbColor[], depth: number): RgbColor[] {
  return palette.map(([r, g, b]) => quantizeRgb(r, g, b, depth));
}

function findNearestColor(r: number, g: number, b: number, palette: readonly RgbColor[]): RgbColor {
  let minDistance = Number.POSITIVE_INFINITY;
  let best = palette[0] ?? [0, 0, 0];

  for (const color of palette) {
    const [pr, pg, pb] = color;
    const dr = r - pr;
    const dg = g - pg;
    const db = b - pb;
    const distance = dr * dr + dg * dg + db * db;

    if (distance < minDistance) {
      minDistance = distance;
      best = color;
    }
  }

  return best;
}

export interface PixelateOptions {
  blockSize: number;
  colorDepth: number;
  paletteColors: readonly RgbColor[] | null;
}

export function pixelateImage(source: ImageSource, options: PixelateOptions): HTMLCanvasElement {
  const { width, height } = getSourceSize(source);
  const blockSize = Math.max(2, Math.min(64, Math.round(options.blockSize)));
  const depth = normalizeColorDepth(options.colorDepth);
  const palette = options.paletteColors === null ? null : quantizePalette(options.paletteColors, depth);

  if (palette !== null && palette.length === 0) {
    throw new Error('请先选择或添加至少一个调色板颜色。');
  }

  const sourceCanvas = document.createElement('canvas');
  const sourceContext = get2dContext(sourceCanvas);
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  sourceContext.drawImage(source, 0, 0, width, height);

  const smallWidth = Math.max(1, Math.ceil(width / blockSize));
  const smallHeight = Math.max(1, Math.ceil(height / blockSize));
  const smallCanvas = document.createElement('canvas');
  const smallContext = get2dContext(smallCanvas);
  smallCanvas.width = smallWidth;
  smallCanvas.height = smallHeight;
  smallContext.imageSmoothingEnabled = false;
  smallContext.drawImage(sourceCanvas, 0, 0, smallWidth, smallHeight);

  const imageData = smallContext.getImageData(0, 0, smallWidth, smallHeight);
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const r = data[index] ?? 0;
    const g = data[index + 1] ?? 0;
    const b = data[index + 2] ?? 0;
    const [nr, ng, nb] = palette === null
      ? quantizeRgb(r, g, b, depth)
      : findNearestColor(r, g, b, palette);

    data[index] = nr;
    data[index + 1] = ng;
    data[index + 2] = nb;
  }

  smallContext.putImageData(imageData, 0, 0);

  const outputCanvas = document.createElement('canvas');
  const outputContext = get2dContext(outputCanvas);
  outputCanvas.width = width;
  outputCanvas.height = height;
  outputContext.imageSmoothingEnabled = false;
  outputContext.drawImage(smallCanvas, 0, 0, width, height);

  return outputCanvas;
}

export function scaleCanvas(source: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  if (scale <= 1) return source;

  const outputCanvas = document.createElement('canvas');
  const outputContext = get2dContext(outputCanvas);
  outputCanvas.width = source.width * scale;
  outputCanvas.height = source.height * scale;
  outputContext.imageSmoothingEnabled = false;
  outputContext.drawImage(source, 0, 0, outputCanvas.width, outputCanvas.height);

  return outputCanvas;
}

export function canvasToThumbnail(canvas: HTMLCanvasElement, maxSize = 80): string {
  const thumbnailCanvas = document.createElement('canvas');
  const thumbnailContext = get2dContext(thumbnailCanvas);
  const ratio = Math.min(maxSize / canvas.width, maxSize / canvas.height, 1);
  thumbnailCanvas.width = Math.max(1, Math.round(canvas.width * ratio));
  thumbnailCanvas.height = Math.max(1, Math.round(canvas.height * ratio));
  thumbnailContext.imageSmoothingEnabled = false;
  thumbnailContext.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

  return thumbnailCanvas.toDataURL('image/jpeg', 0.65);
}

export function recommendBlockSize(width: number, height: number): number {
  const averageSize = (width + height) / 2;
  return Math.max(2, Math.min(64, Math.round(averageSize / 48)));
}
