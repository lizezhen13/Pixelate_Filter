# Pixelate_Filter 🎮

Pixelate_Filter 是一款轻量级纯前端像素风图片转化工具。无需登录、无需服务器，所有处理在浏览器端完成，保护您的隐私。

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 📁 图片上传 | 支持 JPG / PNG / WebP / BMP，拖拽或点击上传 |
| 📷 摄像头拍摄 | 调用摄像头实时拍摄，支持前后镜头切换 |
| 🔲 像素块调节 | 滑块 + 精确输入，范围 2~64 |
| 🎨 调色板风格 | GameBoy / 复古街机 / 经典像素 / 赛博朋克 / 自定义 |
| ⚡ 一键像素化 | 实时预览处理效果 |
| 🔲 原图对比 | 可拖拽分割线对比原图与结果 |
| 💾 多格式下载 | 支持 PNG / JPG / WebP，可选 1x/2x/4x 分辨率 |
| 📜 历史记录 | 浏览器 LocalStorage 保存最近 20 条记录 |
| 🔄 重置 | 二次确认防止误操作 |

## 🚀 快速开始

无需安装任何依赖，直接打开 `index.html` 即可运行：

```bash
# 克隆仓库
git clone https://github.com/yourusername/Pixelate_Filter.git
cd Pixelate_Filter

# 直接打开 index.html（任选一种方式）
open index.html              # macOS
start index.html             # Windows
xdg-open index.html          # Linux

# 或使用本地服务器（推荐）
npx serve .
# 然后访问 http://localhost:3000
```

## 📁 项目结构

```
Pixelate_Filter/
├── index.html          # 主页面
├── css/
│   ├── reset.css       # 样式重置
│   ├── main.css        # 主样式（像素风 UI）
│   └── responsive.css  # 响应式适配
├── js/
│   ├── app.js          # 主逻辑入口
│   ├── pixelate.js     # 像素化核心算法
│   ├── palette.js      # 调色板数据与方法
│   ├── camera.js       # 摄像头功能模块
│   ├── history.js      # 历史记录管理
│   └── utils.js        # 工具函数
├── assets/
│   └── icons/          # 像素风图标
└── README.md
```

## 🛠️ 技术栈

| 层级 | 技术选型 |
|------|----------|
| 核心语言 | HTML5 + CSS3 + JavaScript (ES6+) |
| 像素处理 | Canvas API（`getImageData` / `putImageData`） |
| UI | 原生实现 + CSS 像素风动画 |
| 响应式 | CSS Grid + Flexbox + 媒体查询 |
| 本地存储 | LocalStorage |
| 摄像头 | `getUserMedia` API |

## 🎯 核心算法

```
1. 将原图绘制到离屏 Canvas，缩小至 (原宽/像素块大小) × (原高/像素块大小)
2. 遍历缩小后的每个像素，将其颜色映射至当前调色板的最近颜色（欧氏距离）
3. 使用最近邻插值（imageSmoothingEnabled = false）放大回原尺寸
4. 输出像素化结果
```

## 📱 兼容性

| 平台 | 要求 |
|------|------|
| 桌面端 | Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+ |
| 移动端 | iOS Safari 14+ / Android Chrome 90+ |
| 响应式 | 支持 320px ~ 1920px 宽度 |

## 🔒 隐私安全

- ✅ 纯前端处理，图片**不会**上传至任何服务器
- ✅ 所有历史记录仅保存在您的浏览器 LocalStorage 中
- ✅ 清除浏览器数据后历史记录同步消失

## 📝 License

MIT License © 2026 Pixelate_Filter

---

*Made with ❤️ and pixel art*
