<div align="center">
  <h1>🖼️ Pixelate Filter / Image Pixelation Tool</h1>
</div>

<div align="center">
  🌐 <a href="./README.md">中文</a> | English
</div>

---

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

