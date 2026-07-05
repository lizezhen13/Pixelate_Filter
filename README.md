# 🎨 Pixelate Filter / 图片像素化工具

<div align="right">
  🌐 <a href="#zh-CN">中文</a> | <a href="#en">English</a>
</div>

---

<a id="zh-CN"></a>

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

## 📄 许可证

MIT License

---

<a id="en"></a>

## 📖 Introduction

Pixelate Filter is a Canvas-based online image pixelation tool. It supports color palettes, custom colors, camera capture, history records, and multi-format export — ideal for quickly generating pixel-style images or creative image processing.

## ✨ Features

- 🎨 **Image Pixelation**: Pixelate uploaded images based on a specified block size.
- 🖌️ **Color Palette Support**: Built-in palettes for quickly switching pixel color styles.
- 🧩 **Custom Colors**: Support custom pixel colors for personalized needs.
- 📷 **Camera Capture**: Use the camera directly to capture and pixelate in real time.
- 📝 **History**: Save operation history with undo/redo support.
- 💾 **Multi-format Export**: Export to common formats such as PNG and JPEG.
- 📱 **Responsive UI**: Built with Vue 3 + Vite, featuring a clean interface and smooth interaction.

## 🛠️ Tech Stack

- ⚡ Vue 3
- 📘 TypeScript
- 🚀 Vite
- 🎨 Canvas API
- 💎 lucide-vue-next

## 🚀 Quick Start

### 📋 Requirements

- Node.js >= 18.0.0

### 📦 Install Dependencies

```bash
npm install
```

### ▶️ Start the Development Server

```bash
npm run dev
```

The development server runs at `http://localhost:1212` by default.

### 🏗️ Build for Production

```bash
npm run build
```

### 👀 Preview Production Build

```bash
npm run preview
```

## 📜 Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run build test |

## 📂 Project Structure

```
Pixelate_Filter/
├── docker/           # Docker configuration files
├── docker-compose.yml
├── Dockerfile
├── document/         # Project documents
├── index.html
├── package.json
├── src/              # Source code
│   ├── lib/          # Utility libraries
│   ├── App.vue       # Root component
│   ├── main.ts       # Entry file
│   ├── styles.css    # Global styles
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts
```

## 🌐 Deployment

The project includes a `vercel.json` configuration for one-click deployment on Vercel. It also provides a Dockerfile and docker-compose.yml for containerized deployment.

## 📄 License

MIT License
