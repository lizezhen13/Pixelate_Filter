/* pixelate.js - 像素化核心算法 */

const Pixelate = (() => {
  /**
   * 主像素化函数
   * @param {HTMLImageElement|HTMLCanvasElement} source - 输入图片或 Canvas
   * @param {number} blockSize - 像素块大小（2~64）
   * @param {Array} [paletteColors] - 调色板颜色数组 [[r,g,b], ...]，可选
   * @param {number} [colorDepth] - 色彩深度（≤ 调色板颜色数，用于缩减颜色）
   * @param {boolean} [isOriginalMode] - 是否为原风格模式（不做颜色量化）
   * @returns {HTMLCanvasElement} 处理后的 Canvas
   */
  function pixelate(source, blockSize, paletteColors, colorDepth, isOriginalMode) {
    if (!source) {
      throw new Error('无效的输入参数');
    }

    // 原风格模式：保持原图颜色，只做像素化
    if (isOriginalMode) {
      return pixelateOnly(source, blockSize);
    }

    if (!paletteColors || paletteColors.length === 0) {
      throw new Error('请选择调色板');
    }

    // 根据色彩深度缩减调色板颜色数
    let usedColors = paletteColors;
    if (colorDepth && colorDepth < paletteColors.length) {
      usedColors = reducePalette(paletteColors, colorDepth);
    }

    // 1. 创建离屏 Canvas，绘制原图
    const srcCanvas = document.createElement('canvas');
    const srcCtx = srcCanvas.getContext('2d');
    srcCanvas.width = source.naturalWidth || source.width;
    srcCanvas.height = source.naturalHeight || source.height;
    srcCtx.drawImage(source, 0, 0);

    const origW = srcCanvas.width;
    const origH = srcCanvas.height;

    // 2. 缩小至 原尺寸 / 像素块大小
    const smallW = Math.max(1, Math.ceil(origW / blockSize));
    const smallH = Math.max(1, Math.ceil(origH / blockSize));

    const smallCanvas = document.createElement('canvas');
    const smallCtx = smallCanvas.getContext('2d');
    smallCanvas.width = smallW;
    smallCanvas.height = smallH;
    smallCtx.imageSmoothingEnabled = false;
    smallCtx.drawImage(srcCanvas, 0, 0, smallW, smallH);

    // 3. 获取缩小后的像素数据
    const smallData = smallCtx.getImageData(0, 0, smallW, smallH);
    const pixels = smallData.data;

    // 4. 按调色板量化颜色（使用缩减后的调色板）
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      // 找到最近颜色
      const [nr, ng, nb] = findNearestColor(r, g, b, usedColors);
      pixels[i] = nr;
      pixels[i + 1] = ng;
      pixels[i + 2] = nb;
      // alpha 保持不变
    }

    smallCtx.putImageData(smallData, 0, 0);

    // 5. 使用最近邻插值放大回原尺寸
    const outCanvas = document.createElement('canvas');
    const outCtx = outCanvas.getContext('2d');
    outCanvas.width = origW;
    outCanvas.height = origH;
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(smallCanvas, 0, 0, origW, origH);

    return outCanvas;
  }

  /**
   * 纯像素化（不量化颜色，保持原图色彩）
   * @param {HTMLImageElement|HTMLCanvasElement} source
   * @param {number} blockSize
   * @returns {HTMLCanvasElement}
   */
  function pixelateOnly(source, blockSize) {
    const srcCanvas = document.createElement('canvas');
    const srcCtx = srcCanvas.getContext('2d');
    srcCanvas.width = source.naturalWidth || source.width;
    srcCanvas.height = source.naturalHeight || source.height;
    srcCtx.drawImage(source, 0, 0);

    const origW = srcCanvas.width;
    const origH = srcCanvas.height;

    const smallW = Math.max(1, Math.ceil(origW / blockSize));
    const smallH = Math.max(1, Math.ceil(origH / blockSize));

    const smallCanvas = document.createElement('canvas');
    const smallCtx = smallCanvas.getContext('2d');
    smallCanvas.width = smallW;
    smallCanvas.height = smallH;
    smallCtx.imageSmoothingEnabled = false;
    smallCtx.drawImage(srcCanvas, 0, 0, smallW, smallH);

    const outCanvas = document.createElement('canvas');
    const outCtx = outCanvas.getContext('2d');
    outCanvas.width = origW;
    outCanvas.height = origH;
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(smallCanvas, 0, 0, origW, origH);

    return outCanvas;
  }

  /**
   * 根据色彩深度缩减调色板颜色数（均匀采样）
   * @param {Array} palette - 原始调色板 [[r,g,b], ...]
   * @param {number} depth - 目标颜色数
   * @returns {Array} 缩减后的调色板
   */
  function reducePalette(palette, depth) {
    if (depth >= palette.length) return palette;
    const step = palette.length / depth;
    const reduced = [];
    for (let i = 0; i < depth; i++) {
      reduced.push(palette[Math.floor(i * step)]);
    }
    return reduced;
  }

  /**
   * 放大 Canvas（像素风放大，保持锯齿感）
   * @param {HTMLCanvasElement} canvas - 输入 Canvas
   * @param {number} scale - 放大倍数（2 或 4）
   * @returns {HTMLCanvasElement}
   */
  function scaleCanvas(canvas, scale) {
    if (scale <= 1) return canvas;
    const out = document.createElement('canvas');
    out.width = canvas.width * scale;
    out.height = canvas.height * scale;
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, out.width, out.height);
    return out;
  }

  /**
   * 查找最近颜色（欧几里得距离）
   * @param {number} r - 目标 R
   * @param {number} g - 目标 G
   * @param {number} b - 目标 B
   * @param {Array} palette - 调色板 [[r,g,b], ...]
   * @returns {Array} [r, g, b]
   */
  function findNearestColor(r, g, b, palette) {
    let minDist = Infinity;
    let best = palette[0];
    for (let i = 0; i < palette.length; i++) {
      const [pr, pg, pb] = palette[i];
      const dr = r - pr;
      const dg = g - pg;
      const db = b - pb;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) {
        minDist = dist;
        best = palette[i];
      }
    }
    return best;
  }

  /**
   * 自动推荐像素块大小
   * @param {number} width
   * @param {number} height
   * @returns {number}
   */
  function recommendBlockSize(width, height) {
    const avg = (width + height) / 2;
    // 让缩小后的尺寸在 32~64 之间，效果较好
    const recommended = Math.max(2, Math.round(avg / 48));
    return Math.min(64, Math.max(2, recommended));
  }

  return {
    pixelate,
    scaleCanvas,
    recommendBlockSize,
  };
})();
