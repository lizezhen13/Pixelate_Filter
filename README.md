# 🎨 Pixelate_Filter

 Pixelate_Filter 是一个基于 Vue 3、Vite、TypeScript 和 Canvas API 的图片像素化工具。它支持本地图片上传、拖拽导入、摄像头采集、实时像素化预览、调色板映射、自定义颜色、历史记录和多格式导出。

## 🛠️ 技术栈

| 类型 | 方案 |
| --- | --- |
| 🧩 前端框架 | Vue 3 + Composition API |
| ⚡ 构建工具 | Vite |
| 📝 类型系统 | TypeScript |
| 🖼️ 图像处理 | Canvas API |
| 🎯 图标 | lucide-vue-next |
| 💾 本地存储 | LocalStorage |

## ✨ 功能特性

- 📤 **图片导入**：支持点击上传和拖拽导入，支持 JPG、PNG、WebP、BMP 格式，限制 20MB。
- 📸 **摄像头拍摄**：调用摄像头拍摄图片，支持前后摄像头切换，直接进入像素化流程。
- 🎮 **像素化处理**：
  - 🔲 像素块大小可调（2-64）
  - 🌈 色彩深度可调（2-64 通道阶数）
  - 👁️ 实时预览处理结果
- 🎨 **调色板**：
  - 🖼️ 原图色彩：保留原图颜色，仅降低色彩深度并像素化
  - 🕹️ GameBoy：经典掌机的绿色四阶灰度
  - 🕹️ Arcade：高对比的街机综合色盘
  - 🎨 经典 16 色：复古像素画常用 16 色
  - ✨ Cyberpunk：霓虹粉、蓝紫和高亮青色
  - 🖌️ 自定义：用户可添加最多 16 个自定义颜色
- 👀 **对比预览**：原图与处理后结果上下对比预览。
- 💾 **导出**：支持 PNG、JPG、WebP 格式导出，支持 1x、2x、4x 倍率。
- 📜 **历史记录**：自动保存最近 20 条处理参数历史记录，可一键恢复参数。
- 📘 **引导页**：首次使用显示引导页，介绍产品功能。

## 📖 使用指南

1. 🚀 打开应用后，点击「开始使用」进入工作区。
2. 📁 在左侧面板中，点击上传区域或拖拽图片到上传区域，也可以点击「拍摄图片」使用摄像头。
3. 🎚️ 图片加载后，使用滑块调整「像素块大小」和「色彩深度」。
4. 🎨 在「调色板」区域选择喜欢的色彩风格，或添加自定义颜色。
5. 👁️ 预览区域会实时显示原图和像素化结果的对比。
6. 💾 点击「导出图片」选择格式和倍率，保存处理结果。
7. 📜 点击「历史记录」可以查看和恢复之前的处理参数。

## 💻 开发

```bash
npm install
npm run dev
```

开发服务器地址为 `http://localhost:1212`。如果 Windows PowerShell 拦截 `npm.ps1`，请使用 `npm.cmd`：

```bash
npm.cmd install
npm.cmd run dev
```

## 📦 构建

```bash
npm run build
```

构建流程会先执行 TypeScript/Vue 类型检查，再执行 Vite 生产构建。构建产物输出到 `dist/`。

## 👀 预览

构建后可以使用以下命令预览生产版本：

```bash
npm run preview
```

预览服务器地址为 `http://localhost:1212`。

## 🚀 部署

### ▲ Vercel 部署

项目已配置 `vercel.json`，可以直接部署到 Vercel：

1. 在 Vercel 控制台导入项目
2. Vercel 会自动识别配置并部署
3. 构建命令：`npm run build`
4. 输出目录：`dist`

### 🐳 Docker 部署

项目包含完整的 Docker 配置，支持容器化部署：

#### 使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

应用将通过 `http://localhost:1212` 访问。

#### 使用 Docker 命令

```bash
# 构建镜像
docker build -t pixelate-filter .

# 运行容器
docker run -d -p 1212:1212 --name pixelate-filter-app pixelate-filter

# 查看日志
docker logs -f pixelate-filter-app

# 停止容器
docker stop pixelate-filter-app
```

### 🌐 生产环境启动

如果不使用 Docker，也可以直接启动生产服务器：

```bash
npm run start
```

服务器将通过 `http://localhost:1212` 提供服务。

## 🧪 测试与验证

当前项目没有独立的单元测试框架，`npm test` 作为基础质量门禁，会执行完整类型检查和生产构建：

```bash
npm test
```

建议后续如果继续扩展功能，可以加入 Vitest 覆盖 `src/lib/pixelate.ts`、`src/lib/palettes.ts` 等纯逻辑模块，再加入 Playwright/Cypress 覆盖上传、导出和历史记录这类浏览器流程。

## 📁 项目结构

```text
Pixelate_Filter/
├─ 📄 index.html
├─ 📦 package.json
├─ ⚙️ vite.config.ts
├─ 📝 tsconfig.json
├─ 📂 src/
│  ├─ 🧩 App.vue
│  ├─ 🚀 main.ts
│  ├─ 🎨 styles.css
│  └─ 📂 lib/
│     ├─ 📷 camera.ts
│     ├─ 📜 history.ts
│     ├─ 🎨 palettes.ts
│     └─ 🖼️ pixelate.ts
└─ 📂 document/
   └─ 📘 Pixelate_Filter-PRD.md
```
