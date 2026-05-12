/* utils.js - 工具函数 */

/**
 * 显示/隐藏 DOM 元素
 */
function showEl(el) {
  el.classList.add('active');
}

function hideEl(el) {
  el.classList.remove('active');
}

/**
 * 切换显示
 */
function toggleEl(el) {
  el.classList.toggle('active');
}

/**
 * 节流函数
 */
function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * 防抖函数
 */
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 将图片压缩至最大边不超过 maxSize
 */
function compressImage(img, maxSize) {
  let { width, height } = img;
  if (width <= maxSize && height <= maxSize) {
    return { width, height, img };
  }
  const ratio = Math.min(maxSize / width, maxSize / height);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);
  return { width, height };
}

/**
 * 加载图片为 HTMLImageElement
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    img.src = url;
  });
}

/**
 * 读取文件为 DataURL（用于历史记录的缩略图）
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 将 Canvas 转为 Blob
 */
function canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      type,
      type === 'image/png' ? undefined : quality
    );
  });
}

/**
 * 下载 Blob
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 生成唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * 格式化时间戳
 */
function formatTime(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 计算两个 RGB 颜色的欧氏距离（简化版，不使用平方根）
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

/**
 * 查找最近颜色索引
 */
function findNearestColor(r, g, b, palette) {
  let minDist = Infinity;
  let bestIdx = 0;
  for (let i = 0; i < palette.length; i++) {
    const [pr, pg, pb] = palette[i];
    const dist = colorDistance(r, g, b, pr, pg, pb);
    if (dist < minDist) {
      minDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}
