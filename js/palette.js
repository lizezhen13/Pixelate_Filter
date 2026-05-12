/* palette.js - 调色板数据与方法（已移除自定义调色板选项） */

const Palette = (() => {
  // 调色板数据：[R, G, B]
  const palettes = {
    original: {
      name: '原风格',
      description: '保持原图色彩，只做像素化',
      colors: [], // 空数组表示使用原图颜色
    },
    gameboy: {
      name: 'GameBoy 风',
      description: '4级绿色灰度，复古掌机风格',
      colors: [
        [15, 56, 15],
        [48, 98, 48],
        [139, 172, 15],
        [155, 188, 15],
      ],
    },
    arcade: {
      name: '复古街机风',
      description: '高饱和红/蓝/黄/绿',
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
    classic: {
      name: '经典像素游戏风',
      description: '16色万能调色板',
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
    cyberpunk: {
      name: '赛博朋克风',
      description: '霓虹粉/蓝/紫 + 深色背景',
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
  };

  // 当前选中的调色板 key（默认：原风格）
  let activeKey = 'original';

  /**
   * 获取所有调色板
   */
  function getAll() {
    return { ...palettes };
  }

  /**
   * 获取指定调色板
   */
  function get(key) {
    return palettes[key] || palettes['original'];
  }

  /**
   * 获取当前激活的调色板颜色数组
   * 如果是 "original"，返回空数组（表示使用原图颜色）
   */
  function getActiveColors() {
    if (activeKey === 'original') {
      return []; // 空数组表示保持原图色彩
    }
    return palettes[activeKey].colors;
  }

  /**
   * 设置激活的调色板
   */
  function setActive(key) {
    activeKey = key;
  }

  /**
   * 获取当前激活 key
   */
  function getActiveKey() {
    return activeKey;
  }

  /**
   * 是否为"原风格"模式
   */
  function isOriginalMode() {
    return activeKey === 'original';
  }

  /**
   * 生成调色板预览用的 HTML（色块行）
   */
  function getPreviewColors(key) {
    return palettes[key] ? palettes[key].colors : [];
  }

  return {
    getAll,
    get,
    getActiveColors,
    setActive,
    getActiveKey,
    isOriginalMode,
    getPreviewColors,
  };
})();
