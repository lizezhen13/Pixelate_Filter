<div align="center">
  <h1>🖼️ Pixelate Filter / 图片像素化工具</h1>
</div>

<div align="center">
  🌐 中文 | <a href="./README_EN.md">English</a>
</div>

---

## 📖 简介

Pixelate Filter 是一款基于 Canvas 的在线图片像素化工具，支持调色板、自定义颜色、摄像头采集、历史记录与多格式导出，适合快速生成像素风格图片或进行创意图片处理。

## ✨ 功能特性

- 🎨 **图片像素化**：将上传的图片按指定块大小进行像素化处理。
- 🖌️ **调色板支持**：内置多种调色板，可快速替换像素颜色风格。
- 🧩 **自定义颜色**：支持自定义像素颜色，满足个性化需求。
- 📷 **摄像头采集**：可直接调用摄像头拍摄并实时像素化。
- 📝 **历史记录**：保存操作历史，支持撤销/重做。
- 💾 **多格式导出**：支持 PNG、JPEG 等常见格式下载。
- 📱 **响应式界面**：基于 Vue 3 + Vite 构建，界面简洁、交互流畅。

## 🛠️ 技术栈

- ⚡ Vue 3
- 📘 TypeScript
- 🚀 Vite
- 🎨 Canvas API
- 💎 lucide-vue-next

## 🚀 快速开始

### 📋 环境要求

- Node.js >= 18.0.0

### 📦 安装依赖

```bash
npm install
```

### ▶️ 启动开发服务器

```bash
npm run dev
```

开发服务器默认运行在 `http://localhost:1212`。

### 🏗️ 构建生产版本

```bash
npm run build
```

### 👀 预览生产版本

```bash
npm run preview
```

## 📜 项目脚本

| 脚本 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 类型检查并构建生产包 |
| `npm run preview` | 预览生产构建 |
| `npm run typecheck` | 运行 TypeScript 类型检查 |
| `npm test` | 执行构建测试 |

## 📂 目录结构

```
Pixelate_Filter/
├── docker/           # Docker 配置文件
├── docker-compose.yml
├── Dockerfile
├── document/         # 项目文档
├── index.html
├── package.json
├── src/              # 源代码
│   ├── lib/          # 工具库
│   ├── App.vue       # 根组件
│   ├── main.ts       # 入口文件
│   ├── styles.css    # 全局样式
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

## 🌐 部署

项目已配置 Vercel 部署（`vercel.json`），可直接导入 Vercel 平台进行一键部署。同时提供 Dockerfile 与 docker-compose.yml，便于容器化部署。
