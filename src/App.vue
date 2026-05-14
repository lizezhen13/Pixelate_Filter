<script setup lang="ts">
import {
  Camera,
  Check,
  Download,
  Github,
  History,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-vue-next';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { CameraController } from './lib/camera';
import {
  addHistoryRecord,
  clearHistory,
  createHistoryRecord,
  formatHistoryTime,
  readHistory,
  type HistoryRecord,
} from './lib/history';
import {
  basePalettes,
  createCustomPalette,
  hexToRgb,
  normalizeColor,
  rgbToCss,
  type PaletteDefinition,
  type PaletteKey,
  type RgbColor,
} from './lib/palettes';
import { canvasToThumbnail, pixelateImage, recommendBlockSize, scaleCanvas } from './lib/pixelate';

type DownloadFormat = 'png' | 'jpg' | 'webp';
type NoticeType = 'info' | 'error';

const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
const maxFileSize = 20 * 1024 * 1024;
const cameraController = new CameraController();

const uploadInput = ref<HTMLInputElement | null>(null);
const originalCanvas = ref<HTMLCanvasElement | null>(null);
const resultCanvas = ref<HTMLCanvasElement | null>(null);
const cameraVideo = ref<HTMLVideoElement | null>(null);

const currentImage = ref<HTMLImageElement | null>(null);
const resultDataUrl = ref('');
const blockSize = ref(8);
const colorDepth = ref(16);
const activePaletteKey = ref<PaletteKey>('original');
const customColors = ref<RgbColor[]>([]);
const historyRecords = ref<HistoryRecord[]>(readHistory());
const isDragging = ref(false);
const isLoading = ref(false);
const showDownloadModal = ref(false);
const showResetConfirm = ref(false);
const showColorPicker = ref(false);
const showHistoryDrawer = ref(false);
const showCameraModal = ref(false);
const selectedDownloadFormat = ref<DownloadFormat>('png');
const selectedScale = ref(1);
const colorPickerValue = ref('#e94560');
const notice = ref<{ type: NoticeType; text: string } | null>(null);
const cameraSwitching = ref(false);
const showOnboarding = ref(window.localStorage.getItem('pixelate_filter_onboarded') !== 'true');
const isAppReady = ref(false);
const isEnteringWorkspace = ref(false);

let previewTimer: number | undefined;
let saveHistoryTimer: number | undefined;
let noticeTimer: number | undefined;
let savedCurrentImage = false;

const palettes = computed<PaletteDefinition[]>(() => [
  ...basePalettes,
  createCustomPalette(customColors.value),
]);

const builtInPalettes = computed<PaletteDefinition[]>(() => [...basePalettes]);

const activePalette = computed(() => {
  return palettes.value.find((palette) => palette.key === activePaletteKey.value) ?? palettes.value[0];
});

const hasImage = computed(() => currentImage.value !== null);
const hasResult = computed(() => resultDataUrl.value.length > 0);

const loadingPixels = Array.from({ length: 48 }, (_, index) => index);

watch([blockSize, colorDepth, activePaletteKey, customColors], () => {
  schedulePreview();
});

onMounted(() => {
  window.setTimeout(() => {
    isAppReady.value = true;
  }, 80);
});

function enterWorkspace(): void {
  isEnteringWorkspace.value = true;
  window.localStorage.setItem('pixelate_filter_onboarded', 'true');

  window.setTimeout(() => {
    showOnboarding.value = false;
    isEnteringWorkspace.value = false;
  }, 520);
}

function returnToOnboarding(): void {
  window.localStorage.removeItem('pixelate_filter_onboarded');
  showHistoryDrawer.value = false;
  showDownloadModal.value = false;
  showResetConfirm.value = false;
  showColorPicker.value = false;
  closeCameraModal();
  isAppReady.value = false;
  showOnboarding.value = true;

  window.setTimeout(() => {
    isAppReady.value = true;
  }, 80);
}

function setNotice(type: NoticeType, text: string): void {
  notice.value = { type, text };
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => {
    notice.value = null;
  }, 2600);
}

function clampBlockSize(value: number): number {
  return Math.max(2, Math.min(64, Math.round(Number.isFinite(value) ? value : 8)));
}

function clampColorDepth(value: number): number {
  return Math.max(2, Math.min(64, Math.round(Number.isFinite(value) ? value : 16)));
}

function updateBlockSize(value: number | string): void {
  blockSize.value = clampBlockSize(Number(value));
}

function updateColorDepth(value: number | string): void {
  colorDepth.value = clampColorDepth(Number(value));
}

function triggerUpload(): void {
  uploadInput.value?.click();
}

function handleUploadChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (file) {
    void handleImageFile(file);
  }

  input.value = '';
}

function handleDrop(event: DragEvent): void {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];

  if (file) {
    void handleImageFile(file);
  }
}

async function handleImageFile(file: File): Promise<void> {
  if (!supportedMimeTypes.includes(file.type)) {
    setNotice('error', '仅支持 JPG、PNG、WebP、BMP 图片。');
    return;
  }

  if (file.size > maxFileSize) {
    setNotice('error', '图片大小不能超过 20MB。');
    return;
  }

  try {
    const image = await loadImage(file);
    currentImage.value = image;
    savedCurrentImage = false;
    resultDataUrl.value = '';
    blockSize.value = recommendBlockSize(image.naturalWidth, image.naturalHeight);

    await waitForPreviewCanvases();
    drawOriginalImage(image);
    runPixelate(false);
  } catch (error) {
    setNotice('error', error instanceof Error ? error.message : '图片读取失败。');
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('图片读取失败。'));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('图片加载失败。'));
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function waitForPreviewCanvases(): Promise<void> {
  await nextTick();

  for (let index = 0; index < 60; index += 1) {
    const original = originalCanvas.value;
    const result = resultCanvas.value;

    if (
      original?.isConnected &&
      result?.isConnected &&
      original.clientWidth > 0 &&
      result.clientWidth > 0
    ) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      return;
    }

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
}

function drawOriginalImage(image: HTMLImageElement): void {
  const canvas = originalCanvas.value;
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
}

function selectPalette(key: PaletteKey): void {
  if (key === 'custom' && customColors.value.length === 0) {
    openColorPicker();
    return;
  }

  activePaletteKey.value = key;
}

function palettePreviewColors(palette: PaletteDefinition): RgbColor[] {
  if (palette.key === 'original') {
    return [
      [217, 87, 99],
      [233, 159, 46],
      [243, 213, 91],
      [81, 180, 99],
      [55, 120, 201],
      [165, 81, 189],
    ];
  }

  const step = Math.max(1, Math.floor(palette.colors.length / 8));
  return palette.colors.filter((_, index) => index % step === 0).slice(0, 8);
}

function openColorPicker(): void {
  colorPickerValue.value = '#e94560';
  showColorPicker.value = true;
}

function addCustomColor(): void {
  if (customColors.value.length >= 16) {
    setNotice('error', '自定义颜色最多 16 个。');
    return;
  }

  customColors.value = [...customColors.value, hexToRgb(colorPickerValue.value)];
  activePaletteKey.value = 'custom';
  showColorPicker.value = false;
}

function removeCustomColor(index: number): void {
  const nextColors = [...customColors.value];
  nextColors.splice(index, 1);
  customColors.value = nextColors;

  if (activePaletteKey.value === 'custom' && nextColors.length === 0) {
    activePaletteKey.value = 'original';
  }
}

function schedulePreview(): void {
  if (!currentImage.value) return;

  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(() => {
    runPixelate(true);
  }, 80);
}

function runPixelate(silent: boolean): void {
  if (!currentImage.value) return;

  if (!silent) {
    isLoading.value = true;
  }

  window.setTimeout(
    () => {
      try {
        const paletteColors = activePaletteKey.value === 'original' ? null : activePalette.value.colors;
        const output = pixelateImage(currentImage.value as HTMLImageElement, {
          blockSize: blockSize.value,
          colorDepth: colorDepth.value,
          paletteColors,
        });

        const canvas = resultCanvas.value;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        canvas.width = output.width;
        canvas.height = output.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = false;
        context.drawImage(output, 0, 0);
        if (currentImage.value) {
          drawOriginalImage(currentImage.value);
        }
        resultDataUrl.value = output.toDataURL('image/png');

        scheduleHistorySave();
      } catch (error) {
        setNotice('error', error instanceof Error ? error.message : '像素化处理失败。');
      } finally {
        isLoading.value = false;
      }
    },
    silent ? 0 : 80,
  );
}

function scheduleHistorySave(): void {
  if (!resultCanvas.value || savedCurrentImage) return;

  window.clearTimeout(saveHistoryTimer);
  saveHistoryTimer = window.setTimeout(() => {
    if (!resultCanvas.value || savedCurrentImage) return;

    const thumbnail = canvasToThumbnail(resultCanvas.value);
    const record = createHistoryRecord(thumbnail, {
      blockSize: blockSize.value,
      colorDepth: colorDepth.value,
      paletteKey: activePaletteKey.value,
      customColors: [...customColors.value],
    });

    historyRecords.value = addHistoryRecord(record);
    savedCurrentImage = true;
  }, 1500);
}

function openDownloadModal(): void {
  if (!hasResult.value) return;

  selectedDownloadFormat.value = 'png';
  selectedScale.value = 1;
  showDownloadModal.value = true;
}

async function downloadResult(): Promise<void> {
  const sourceCanvas = resultCanvas.value;
  if (!sourceCanvas || !hasResult.value) return;

  const exportCanvas = selectedScale.value > 1 ? scaleCanvas(sourceCanvas, selectedScale.value) : sourceCanvas;
  const mimeTypeMap: Record<DownloadFormat, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    webp: 'image/webp',
  };
  const mimeType = mimeTypeMap[selectedDownloadFormat.value];
  const blob = await new Promise<Blob | null>((resolve) => {
    exportCanvas.toBlob(resolve, mimeType, selectedDownloadFormat.value === 'png' ? undefined : 0.92);
  });

  if (!blob) {
    setNotice('error', '导出失败，请换一种格式重试。');
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `pixelate_filter_${Date.now()}.${selectedDownloadFormat.value}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 3000);
  showDownloadModal.value = false;
}

function resetAll(): void {
  currentImage.value = null;
  resultDataUrl.value = '';
  blockSize.value = 8;
  colorDepth.value = 16;
  activePaletteKey.value = 'original';
  savedCurrentImage = false;
  showResetConfirm.value = false;
  cameraController.stop();
  showCameraModal.value = false;
}

function clearHistoryRecords(): void {
  clearHistory();
  historyRecords.value = [];
}

function loadHistoryRecord(record: HistoryRecord): void {
  blockSize.value = clampBlockSize(record.params.blockSize);
  colorDepth.value = clampColorDepth(record.params.colorDepth);
  customColors.value = record.params.customColors
    .map((color) => normalizeColor(color))
    .filter((color): color is RgbColor => color !== null)
    .slice(0, 16);
  activePaletteKey.value = record.params.paletteKey;
  showHistoryDrawer.value = false;

  if (!currentImage.value) {
    setNotice('info', '历史参数已恢复，请上传图片后应用。');
  }
}

async function openCameraModal(): Promise<void> {
  showCameraModal.value = true;
  await nextTick();

  if (!cameraVideo.value) return;

  const started = await cameraController.start(cameraVideo.value);
  if (!started) {
    showCameraModal.value = false;
    setNotice('error', '无法访问摄像头，请检查浏览器权限。');
  }
}

function closeCameraModal(): void {
  cameraController.stop();
  showCameraModal.value = false;
}

async function switchCamera(): Promise<void> {
  if (!cameraVideo.value) return;

  cameraSwitching.value = true;
  await cameraController.switchCamera(cameraVideo.value);
  cameraSwitching.value = false;
}

async function captureFromCamera(): Promise<void> {
  if (!cameraVideo.value) return;

  const capturedCanvas = cameraController.capture(cameraVideo.value);
  if (!capturedCanvas) {
    setNotice('error', '摄像头画面尚未准备好。');
    return;
  }

  const image = new Image();
  image.onload = async () => {
    currentImage.value = image;
    savedCurrentImage = false;
    resultDataUrl.value = '';
    blockSize.value = recommendBlockSize(image.naturalWidth, image.naturalHeight);
    closeCameraModal();
    await waitForPreviewCanvases();
    drawOriginalImage(image);
    runPixelate(false);
  };
  image.src = capturedCanvas.toDataURL('image/png');
}

onBeforeUnmount(() => {
  window.clearTimeout(previewTimer);
  window.clearTimeout(saveHistoryTimer);
  window.clearTimeout(noticeTimer);
  cameraController.stop();
});
</script>

<template>
  <section
    v-if="showOnboarding"
    class="onboarding-page"
    :class="{ 'app-ready': isAppReady, 'is-leaving': isEnteringWorkspace }"
    aria-label="Pixelate_Filter 首次引导"
  >
    <div class="onboarding-bg-ring" aria-hidden="true" />
    <div class="onboarding-pixel f1" aria-hidden="true" />
    <div class="onboarding-pixel f2" aria-hidden="true" />
    <div class="onboarding-pixel f3" aria-hidden="true" />
    <div class="onboarding-pixel f4" aria-hidden="true" />
    <div class="onboarding-pixel f5" aria-hidden="true" />
    <div class="onboarding-pixel f6" aria-hidden="true" />
    <div class="onboarding-pixel f7" aria-hidden="true" />
    <div class="onboarding-pixel f8" aria-hidden="true" />
    <div class="onboarding-pixel f9" aria-hidden="true" />
    <div class="onboarding-pixel f10" aria-hidden="true" />
    <div class="onboarding-pixel f11" aria-hidden="true" />
    <div class="onboarding-pixel f12" aria-hidden="true" />
    <div class="onboarding-pixel f13" aria-hidden="true" />
    <div class="onboarding-pixel f14" aria-hidden="true" />
    <div class="onboarding-pixel f15" aria-hidden="true" />
    <div class="onboarding-pixel f16" aria-hidden="true" />
    <div class="onboarding-chip chip-1">CANVAS LIVE</div>
    <div class="onboarding-chip chip-2">RETRO PALETTE</div>

    <div class="onboarding-hero-copy stagger-item">
      <div class="onboarding-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <h1>把任意图片炸成复古像素画</h1>
      <p>
        上传图片/随手拍摄即解锁像素魔法！Pixelate_Filter 基于 Canvas
        实时演算，智能压缩色彩、重塑大块像素格，自带 GameBoy 经典复古、Arcade 街机潮酷、Cyberpunk
        未来霓虹等多类滤镜调色，一秒解锁复古像素氛围感。
      </p>
      <button class="onboarding-start" type="button" @click="enterWorkspace">开始使用</button>
    </div>

    <div class="onboarding-preview-card stagger-item" aria-hidden="true">
      <strong>LIVE CANVAS → PIXEL ART</strong>
      <div class="onboarding-pixel-art">
        <span v-for="pixel in 63" :key="pixel" :class="`tile-${pixel % 7}`" />
      </div>
    </div>
  </section>

  <div v-else class="app-shell" :class="{ 'app-ready': isAppReady }">
    <header class="app-header">
      <button class="brand brand-button" type="button" title="返回引导页" @click="returnToOnboarding">
        <div class="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <h1>Pixelate_Filter</h1>
          <p>Canvas 图片像素化工作台</p>
        </div>
      </button>

      <nav class="header-actions" aria-label="全局操作">
        <button class="icon-text-button" type="button" title="打开历史记录" @click="showHistoryDrawer = true">
          <History :size="18" aria-hidden="true" />
          <span>历史记录</span>
        </button>
        <a
          class="icon-button"
          href="https://github.com/lizezhen13/Pixelate_Filter.git"
          target="_blank"
          rel="noopener"
          title="GitHub"
        >
          <Github :size="20" aria-hidden="true" />
          <span class="sr-only">GitHub</span>
        </a>
      </nav>
    </header>

    <main class="workspace">
      <aside class="control-panel" aria-label="图片处理控制面板">
        <section class="panel-section">
          <h2>导入图片</h2>
          <button
            class="upload-zone"
            :class="{ 'is-dragging': isDragging }"
            type="button"
            @click="triggerUpload"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <Upload :size="34" aria-hidden="true" />
            <strong>点击或拖拽图片到这里</strong>
            <span>JPG / PNG / WebP / BMP，最大 20MB</span>
          </button>
          <input
            ref="uploadInput"
            class="hidden-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/bmp"
            @change="handleUploadChange"
          />
        </section>

        <section class="panel-section">
          <h2>摄像头</h2>
          <button class="button secondary full-width" type="button" @click="openCameraModal">
            <Camera :size="18" aria-hidden="true" />
            <span>拍摄图片</span>
          </button>
        </section>

        <section class="panel-section">
          <h2>像素块大小</h2>
          <div class="range-row">
            <label for="block-size">块大小</label>
            <output>{{ blockSize }}</output>
          </div>
          <input
            id="block-size"
            class="range-input"
            type="range"
            min="2"
            max="64"
            :value="blockSize"
            @input="updateBlockSize(($event.target as HTMLInputElement).value)"
          />
          <div class="number-row">
            <span>精确值</span>
            <input
              type="number"
              min="2"
              max="64"
              :value="blockSize"
              @change="updateBlockSize(($event.target as HTMLInputElement).value)"
            />
          </div>
        </section>

        <section class="panel-section">
          <h2>色彩深度</h2>
          <div class="range-row">
            <label for="color-depth">通道阶数</label>
            <output>{{ colorDepth }}</output>
          </div>
          <input
            id="color-depth"
            class="range-input"
            type="range"
            min="2"
            max="64"
            :value="colorDepth"
            @input="updateColorDepth(($event.target as HTMLInputElement).value)"
          />
          <div class="number-row">
            <span>精确值</span>
            <input
              type="number"
              min="2"
              max="64"
              :value="colorDepth"
              @change="updateColorDepth(($event.target as HTMLInputElement).value)"
            />
          </div>
        </section>

        <section class="panel-section">
          <h2>调色板</h2>
          <div class="palette-grid" role="radiogroup" aria-label="调色板">
            <button
              v-for="palette in builtInPalettes"
              :key="palette.key"
              class="palette-card"
              :class="{ active: activePaletteKey === palette.key }"
              type="button"
              role="radio"
              :aria-checked="activePaletteKey === palette.key"
              :title="palette.description"
              @click="selectPalette(palette.key)"
            >
              <span class="palette-preview" aria-hidden="true">
                <span
                  v-for="(color, index) in palettePreviewColors(palette)"
                  :key="`${palette.key}-${index}`"
                  :style="{ backgroundColor: rgbToCss(color) }"
                />
              </span>
              <span>{{ palette.name }}</span>
            </button>
          </div>

          <h3 class="custom-color-title">自定义颜色</h3>
          <div class="custom-color-row">
            <button class="add-color" type="button" title="添加自定义颜色" @click="openColorPicker">
              <Plus :size="18" aria-hidden="true" />
              <span class="sr-only">添加自定义颜色</span>
            </button>
            <span v-if="customColors.length === 0" class="empty-copy">最多添加 16 个颜色</span>
            <button
              v-for="(color, index) in customColors"
              :key="`${color.join('-')}-${index}`"
              class="color-swatch"
              type="button"
              :style="{ backgroundColor: rgbToCss(color) }"
              title="删除颜色"
              @click="removeCustomColor(index)"
            >
              <X :size="13" aria-hidden="true" />
              <span class="sr-only">删除颜色</span>
            </button>
          </div>
        </section>
      </aside>

      <section class="preview-panel" aria-label="图片预览">
        <div class="preview-stage">
          <Transition name="soft-pop" mode="out-in">
            <div v-if="!hasImage" class="preview-placeholder">
              <ImageIcon :size="64" aria-hidden="true" />
              <p>上传图片后开始像素化处理</p>
            </div>

            <div v-else class="preview-stack">
              <div class="canvas-section">
                <div class="canvas-label">原图</div>
                <div class="canvas-frame">
                  <canvas ref="originalCanvas" />
                </div>
              </div>

              <div class="preview-divider">像素化结果</div>

              <div class="canvas-section">
                <div class="canvas-label">处理后</div>
                <div class="canvas-frame">
                  <canvas ref="resultCanvas" />
                </div>
              </div>
            </div>
          </Transition>

          <Transition name="loading-fade">
            <div v-if="isLoading" class="loading-overlay">
              <div class="loading-grid" aria-hidden="true">
                <span v-for="pixel in loadingPixels" :key="pixel" />
              </div>
              <strong>PIXELATING...</strong>
            </div>
          </Transition>
        </div>

        <div class="action-bar">
          <button class="button success" type="button" :disabled="!hasResult" @click="openDownloadModal">
            <Download :size="18" aria-hidden="true" />
            <span>导出图片</span>
          </button>
          <button class="button warning" type="button" :disabled="!hasImage && !hasResult" @click="showResetConfirm = true">
            <RotateCcw :size="18" aria-hidden="true" />
            <span>重置</span>
          </button>
        </div>
      </section>
    </main>

    <Transition name="fade">
      <div v-if="notice" class="notice" :class="notice.type" role="status">
        {{ notice.text }}
      </div>
    </Transition>

    <Teleport to="body">
      <Transition name="drawer-slide">
        <div v-if="showHistoryDrawer" class="drawer-overlay" @click.self="showHistoryDrawer = false">
          <aside class="drawer-panel" aria-label="历史记录">
            <header class="drawer-header">
              <h2>历史记录</h2>
              <button class="icon-button" type="button" title="关闭历史记录" @click="showHistoryDrawer = false">
                <X :size="20" aria-hidden="true" />
                <span class="sr-only">关闭历史记录</span>
              </button>
            </header>

            <div class="drawer-body">
              <div v-if="historyRecords.length === 0" class="history-empty">暂无历史记录</div>
              <button
                v-for="record in historyRecords"
                v-else
                :key="record.id"
                class="history-item"
                type="button"
                @click="loadHistoryRecord(record)"
              >
                <img :src="record.thumbnail" alt="" />
                <span>
                  <strong>{{ record.params.paletteKey === 'custom' ? '自定义' : record.params.paletteKey }}</strong>
                  <small>块 {{ record.params.blockSize }} / 色深 {{ record.params.colorDepth }}</small>
                  <small>{{ formatHistoryTime(record.timestamp) }}</small>
                </span>
              </button>
            </div>

            <footer class="drawer-footer">
              <button class="button danger full-width" type="button" @click="clearHistoryRecords">
                <Trash2 :size="17" aria-hidden="true" />
                <span>清空历史</span>
              </button>
            </footer>
          </aside>
        </div>
      </Transition>

      <Transition name="modal-pop">
        <div v-if="showCameraModal" class="modal-overlay dark" @click.self="closeCameraModal">
          <section class="camera-modal" aria-label="摄像头拍摄">
            <header class="modal-header">
              <h2>摄像头拍摄</h2>
              <button class="icon-button" type="button" title="关闭摄像头" @click="closeCameraModal">
                <X :size="20" aria-hidden="true" />
                <span class="sr-only">关闭摄像头</span>
              </button>
            </header>
            <div class="camera-preview">
              <video ref="cameraVideo" autoplay playsinline muted />
            </div>
            <div class="modal-actions">
              <button class="button success" type="button" @click="captureFromCamera">
                <Check :size="18" aria-hidden="true" />
                <span>使用画面</span>
              </button>
              <button class="button secondary" type="button" :disabled="cameraSwitching" @click="switchCamera">
                <RotateCcw :size="18" aria-hidden="true" />
                <span>切换镜头</span>
              </button>
            </div>
          </section>
        </div>
      </Transition>

      <Transition name="modal-pop">
        <div v-if="showDownloadModal" class="modal-overlay" @click.self="showDownloadModal = false">
          <section class="modal" aria-label="导出图片">
            <h2>导出图片</h2>
            <div class="option-group">
              <span>格式</span>
              <div class="segmented">
                <button
                  v-for="format in ['png', 'jpg', 'webp']"
                  :key="format"
                  :class="{ active: selectedDownloadFormat === format }"
                  type="button"
                  @click="selectedDownloadFormat = format as DownloadFormat"
                >
                  {{ format.toUpperCase() }}
                </button>
              </div>
            </div>
            <div class="option-group">
              <span>倍率</span>
              <div class="segmented">
                <button
                  v-for="scale in [1, 2, 4]"
                  :key="scale"
                  :class="{ active: selectedScale === scale }"
                  type="button"
                  @click="selectedScale = scale"
                >
                  {{ scale }}x
                </button>
              </div>
            </div>
            <div class="modal-actions">
              <button class="button success" type="button" @click="downloadResult">
                <Download :size="18" aria-hidden="true" />
                <span>确认导出</span>
              </button>
              <button class="button secondary" type="button" @click="showDownloadModal = false">取消</button>
            </div>
          </section>
        </div>
      </Transition>

      <Transition name="modal-pop">
        <div v-if="showResetConfirm" class="modal-overlay" @click.self="showResetConfirm = false">
          <section class="modal confirm" aria-label="确认重置">
            <h2>确认重置</h2>
            <p>当前图片和处理结果会被清空，历史记录不会删除。</p>
            <div class="modal-actions">
              <button class="button danger" type="button" @click="resetAll">确认重置</button>
              <button class="button secondary" type="button" @click="showResetConfirm = false">取消</button>
            </div>
          </section>
        </div>
      </Transition>

      <Transition name="modal-pop">
        <div v-if="showColorPicker" class="modal-overlay" @click.self="showColorPicker = false">
          <section class="modal color-picker" aria-label="添加自定义颜色">
            <h2>添加自定义颜色</h2>
            <input v-model="colorPickerValue" type="color" />
            <div class="modal-actions">
              <button class="button success" type="button" @click="addCustomColor">
                <Plus :size="18" aria-hidden="true" />
                <span>添加</span>
              </button>
              <button class="button secondary" type="button" @click="showColorPicker = false">取消</button>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
