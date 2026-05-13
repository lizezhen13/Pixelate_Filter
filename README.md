# Pixelate_Filter

Pixelate_Filter 是一个基于 Vue 3、Vite、TypeScript 和 Canvas API 的图片像素化工具。它支持本地图片上传、拖拽导入、摄像头采集、实时像素化预览、调色板映射、自定义颜色、历史记录和多格式导出。

## 技术栈

| 类型 | 方案 |
| --- | --- |
| 前端框架 | Vue 3 + Composition API |
| 构建工具 | Vite |
| 类型系统 | TypeScript |
| 图像处理 | Canvas API |
| 图标 | lucide-vue-next |
| 本地存储 | LocalStorage |

## 功能

- 图片上传与拖拽导入，支持 JPG、PNG、WebP、BMP，限制 20MB。
- 摄像头拍摄并直接进入像素化流程。
- 像素块大小和色彩深度实时调整。
- 原图色彩、GameBoy、Arcade、经典 16 色、Cyberpunk 和自定义调色板。
- 原图与处理后结果上下对比预览。
- PNG、JPG、WebP 导出，支持 1x、2x、4x 倍率。
- 最近 20 条处理参数历史记录。

## 开发

```bash
npm install
npm run dev
```

开发服务器地址为 `http://localhost:1212`。如果 Windows PowerShell 拦截 `npm.ps1`，请使用 `npm.cmd`：

```bash
npm.cmd install
npm.cmd run dev
```

## 构建

```bash
npm run build
```

构建流程会先执行 TypeScript/Vue 类型检查，再执行 Vite 生产构建。构建产物输出到 `dist/`。

## 预览

构建后可以使用以下命令预览生产版本：

```bash
npm run preview
```

预览服务器地址为 `http://localhost:1212`。

## 部署

### Vercel 部署

项目已配置 `vercel.json`，可以直接部署到 Vercel：

1. 在 Vercel 控制台导入项目
2. Vercel 会自动识别配置并部署
3. 构建命令：`npm run build`
4. 输出目录：`dist`

### Docker 部署

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

### 生产环境启动

如果不使用 Docker，也可以直接启动生产服务器：

```bash
npm run start
```

服务器将通过 `http://localhost:1212` 提供服。

## 测试与验证

当前项目没有独立的单元测试框架，`npm test` 作为基础质量门禁，会执行完整类型检查和生产构建：

```bash
npm test
```

本次重构后的验证结果：

- `npm.cmd ls --depth=0`：依赖解析正常。
- `npm.cmd run build`：`vue-tsc --noEmit` 与 Vite 构建通过。
- 浏览器冒烟验证通过：首屏渲染、自定义颜色添加、图片上传、原图/结果 Canvas 输出、像素块参数调整、JPG 2x 导出、历史记录保存、控制台无错误。

建议后续如果继续扩展功能，可以加入 Vitest 覆盖 `src/lib/pixelate.ts`、`src/lib/palettes.ts` 等纯逻辑模块，再加入 Playwright/Cypress 覆盖上传、导出和历史记录这类浏览器流程。

## 项目结构

```text
Pixelate_Filter/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ src/
│  ├─ App.vue
│  ├─ main.ts
│  ├─ styles.css
│  └─ lib/
│     ├─ camera.ts
│     ├─ history.ts
│     ├─ palettes.ts
│     └─ pixelate.ts
└─ document/
   └─ Pixelate_Filter-PRD.md
```
