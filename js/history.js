/* history.js - 历史记录管理（LocalStorage） */

const History = (() => {
  const STORAGE_KEY = 'pixelate_filter_history';
  const MAX_RECORDS = 20;

  /**
   * 生成唯一 ID
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * 获取所有历史记录
   * @returns {Array}
   */
  function getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * 保存一条历史记录
   * @param {Object} record - { id, thumbnail, params, resultDataURL, timestamp }
   */
  function add(record) {
    const list = getAll();
    // 新记录插入到最前面
    list.unshift(record);
    // 超过上限则截断
    if (list.length > MAX_RECORDS) {
      list.length = MAX_RECORDS;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // LocalStorage 满时，移除最旧的一条再试
      if (list.length > 1) {
        list.pop();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch {
          // 静默失败
        }
      }
    }
  }

  /**
   * 删除一条历史记录
   * @param {string} id
   */
  function remove(id) {
    const list = getAll().filter((r) => r.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // 静默失败
    }
  }

  /**
   * 清空所有历史记录
   */
  function clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 静默失败
    }
  }

  /**
   * 获取记录数量
   */
  function count() {
    return getAll().length;
  }

  /**
   * 构建一条记录对象
   * @param {string} thumbnail - 缩略图 DataURL (建议 80x80 以下)
   * @param {Object} params - { blockSize, colorDepth, paletteKey, customColors }
   * @param {string} resultDataURL - 结果图 DataURL（可选，较大，建议只存缩略图）
   * @returns {Object}
   */
  function createRecord(thumbnail, params, resultDataURL) {
    return {
      id: generateId(),
      thumbnail,
      params,
      resultDataURL: resultDataURL || '',
      timestamp: Date.now(),
    };
  }

  /**
   * 将 Canvas 转为缩略图 DataURL（用于历史记录）
   * @param {HTMLCanvasElement} canvas
   * @param {number} [maxSize=80]
   * @returns {string} DataURL
   */
  function canvasToThumbnail(canvas, maxSize = 80) {
    const thumbCanvas = document.createElement('canvas');
    const ratio = Math.min(maxSize / canvas.width, maxSize / canvas.height, 1);
    thumbCanvas.width = Math.round(canvas.width * ratio);
    thumbCanvas.height = Math.round(canvas.height * ratio);
    const ctx = thumbCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    return thumbCanvas.toDataURL('image/jpeg', 0.6);
  }

  return {
    getAll,
    add,
    remove,
    clearAll,
    count,
    createRecord,
    canvasToThumbnail,
  };
})();
