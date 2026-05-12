(function () {
  'use strict';
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const uploadArea = $('#uploadArea');
  const uploadInput = $('#uploadInput');
  const cameraToggleBtn = $('#cameraToggleBtn');
  const cameraModalOverlay = $('#cameraModalOverlay');
  const cameraVideo = $('#cameraVideo');
  const cameraCaptureBtn = $('#cameraCaptureBtn');
  const cameraSwitchBtn = $('#cameraSwitchBtn');
  const cameraStopBtn = $('#cameraStopBtn');
  const cameraModalCloseBtn = $('#cameraModalCloseBtn');
  const cameraHiddenCanvas = $('#cameraHiddenCanvas');
  const blockSizeSlider = $('#blockSizeSlider');
  const blockSizeInput = $('#blockSizeInput');
  const blockSizeValue = $('#blockSizeValue');
  const colorDepthSlider = $('#colorDepthSlider');
  const colorDepthInput = $('#colorDepthInput');
  const colorDepthValue = $('#colorDepthValue');
  const paletteGrid = $('#paletteGrid');
  const customColorsContainer = $('#customColors');
  const addColorBtn = $('#addColorBtn');
  const resetBtn = $('#resetBtn');
  const downloadBtn = $('#downloadBtn');
  const previewPlaceholder = $('#previewPlaceholder');
  const previewStack = $('#previewStack');
  const originalCanvas = $('#originalCanvas');
  const resultCanvas = $('#resultCanvas');
  const loadingOverlay = $('#loadingOverlay');
  const downloadModal = $('#downloadModal');
  const downloadFormatBtns = $$('.download-format-btn');
  const downloadScaleBtns = $$('.download-scale-btn');
  const downloadConfirmBtn = $('#downloadConfirmBtn');
  const downloadCancelBtn = $('#downloadCancelBtn');
  const confirmModal = $('#confirmModal');
  const confirmOkBtn = $('#confirmOkBtn');
  const confirmCancelBtn = $('#confirmCancelBtn');
  const colorPickerModal = $('#colorPickerModal');
  const colorPickerPreview = $('#colorPickerPreview');
  const colorPickerInput = $('#colorPickerInput');
  const colorPickerConfirmBtn = $('#colorPickerConfirmBtn');
  const colorPickerCancelBtn = $('#colorPickerCancelBtn');
  const historyToggleBtn = $('#historyToggleBtn');
  const historyDrawerOverlay = $('#historyDrawerOverlay');
  const historyList = $('#historyList');
  const historyEmpty = $('#historyEmpty');
  const historyClearBtn = $('#historyClearBtn');
  const historyDrawerCloseBtn = $('#historyDrawerCloseBtn');

  let currentImage = null;
  let resultImageDataURL = null;
  let selectedFormat = 'png';
  let selectedScale = 1;
  let realtimeTimer = null;
  let hasSavedCurrentSession = false;
  let saveHistoryTimer = null;

  function init() {
    renderPaletteCards();
    bindEvents();
    updateUI();
  }

  function showEl(el) { if (el) el.classList.add('active'); }
  function hideEl(el) { if (el) el.classList.remove('active'); }

  function formatTime(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function renderPaletteCards() {
    const all = Palette.getAll();
    paletteGrid.innerHTML = '';
    const skipKeys = ['custom'];
    Object.entries(all).forEach(([key, pal]) => {
      if (skipKeys.includes(key)) return;
      const card = document.createElement('div');
      card.className = 'palette-card' + (Palette.getActiveKey() === key ? ' active' : '');
      card.dataset.key = key;
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', Palette.getActiveKey() === key ? 'true' : 'false');
      card.setAttribute('tabindex', '0');
      const preview = document.createElement('div');
      preview.className = 'palette-preview';
      const colors = pal.colors;
      if (colors.length > 0) {
        const step = Math.max(1, Math.floor(colors.length / 8));
        for (let i = 0; i < colors.length; i += step) {
          const c = document.createElement('div');
          c.className = 'palette-preview-color';
          c.style.background = 'rgb(' + colors[i][0] + ',' + colors[i][1] + ',' + colors[i][2] + ')';
          preview.appendChild(c);
        }
      } else if (key === 'original') {
        const rainbow = ['#ff0000','#ff8800','#ffff00','#00ff00','#0088ff','#8800ff'];
        rainbow.forEach((c) => {
          const d = document.createElement('div');
          d.className = 'palette-preview-color';
          d.style.background = c;
          preview.appendChild(d);
        });
      }
      const name = document.createElement('div');
      name.className = 'palette-card-name';
      name.textContent = pal.name;
      card.appendChild(preview);
      card.appendChild(name);
      card.addEventListener('click', () => selectPalette(key));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPalette(key); }
      });
      paletteGrid.appendChild(card);
    });
  }

  function selectPalette(key) {
    Palette.setActive(key);
    $$('.palette-card').forEach((c) => {
      const isActive = c.dataset.key === key;
      c.classList.toggle('active', isActive);
      c.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
    scheduleRealtimePreview();
  }

  function renderCustomColors() {
    customColorsContainer.innerHTML = '';
    const colors = Palette.getPreviewColors('custom');
    if (colors.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'custom-palette-empty';
      empty.textContent = '点击 + 添加颜色（最多16个）';
      customColorsContainer.appendChild(empty);
    } else {
      colors.forEach((rgb, idx) => {
        const swatch = document.createElement('div');
        swatch.className = 'custom-color-swatch';
        swatch.style.background = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
        const remove = document.createElement('span');
        remove.className = 'remove-color';
        remove.textContent = '×';
        remove.addEventListener('click', (e) => {
          e.stopPropagation();
          Palette.removeCustomColor(idx);
          renderCustomColors();
          scheduleRealtimePreview();
        });
        swatch.appendChild(remove);
        customColorsContainer.appendChild(swatch);
      });
    }
    if (colors.length < 16) {
      customColorsContainer.appendChild(addColorBtn);
      addColorBtn.style.display = '';
    } else {
      addColorBtn.style.display = 'none';
    }
  }

  function bindEvents() {
    uploadArea.addEventListener('click', () => uploadInput.click());
    uploadArea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); uploadInput.click(); }
    });
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleImageFile(file);
    });
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleImageFile(file);
      uploadInput.value = '';
    });

    cameraToggleBtn.addEventListener('click', openCameraModal);
    cameraCaptureBtn.addEventListener('click', captureFromCamera);
    cameraSwitchBtn.addEventListener('click', switchCamera);
    cameraStopBtn.addEventListener('click', closeCameraModal);
    cameraModalCloseBtn.addEventListener('click', closeCameraModal);
    cameraModalOverlay.addEventListener('click', (e) => {
      if (e.target === cameraModalOverlay) closeCameraModal();
    });

    blockSizeSlider.addEventListener('input', (e) => {
      const v = parseInt(e.target.value, 10);
      blockSizeInput.value = v;
      blockSizeValue.textContent = v;
      scheduleRealtimePreview();
    });
    blockSizeInput.addEventListener('change', () => {
      let v = parseInt(blockSizeInput.value, 10);
      v = Math.max(2, Math.min(64, isNaN(v) ? 8 : v));
      blockSizeInput.value = v;
      blockSizeSlider.value = v;
      blockSizeValue.textContent = v;
      scheduleRealtimePreview();
    });

    colorDepthSlider.addEventListener('input', (e) => {
      const v = parseInt(e.target.value, 10);
      colorDepthInput.value = v;
      colorDepthValue.textContent = v;
      scheduleRealtimePreview();
    });
    colorDepthInput.addEventListener('change', () => {
      let v = parseInt(colorDepthInput.value, 10);
      v = Math.max(2, Math.min(256, isNaN(v) ? 16 : v));
      colorDepthInput.value = v;
      colorDepthSlider.value = v;
      colorDepthValue.textContent = v;
      scheduleRealtimePreview();
    });

    addColorBtn.addEventListener('click', () => openColorPickerModal());
    colorPickerConfirmBtn.addEventListener('click', () => {
      const hex = colorPickerInput.value;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      if (Palette.addCustomColor(r, g, b)) {
        renderCustomColors();
        closeColorPickerModal();
        scheduleRealtimePreview();
      }
    });
    colorPickerCancelBtn.addEventListener('click', closeColorPickerModal);
    colorPickerInput.addEventListener('input', () => {
      colorPickerPreview.style.background = colorPickerInput.value;
    });

    resetBtn.addEventListener('click', () => showEl(confirmModal));
    confirmOkBtn.addEventListener('click', () => { hideEl(confirmModal); resetAll(); });
    confirmCancelBtn.addEventListener('click', () => hideEl(confirmModal));

    downloadBtn.addEventListener('click', () => {
      if (!resultImageDataURL) return;
      downloadFormatBtns.forEach((b) => b.classList.remove('active'));
      downloadScaleBtns.forEach((b) => b.classList.remove('active'));
      if (downloadFormatBtns[0]) downloadFormatBtns[0].classList.add('active');
      if (downloadScaleBtns[0]) downloadScaleBtns[0].classList.add('active');
      selectedFormat = 'png';
      selectedScale = 1;
      showEl(downloadModal);
    });
    downloadFormatBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        downloadFormatBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFormat = btn.dataset.format;
      });
    });
    downloadScaleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        downloadScaleBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedScale = parseInt(btn.dataset.scale, 10);
      });
    });
    downloadConfirmBtn.addEventListener('click', doDownload);
    downloadCancelBtn.addEventListener('click', () => hideEl(downloadModal));

    historyToggleBtn.addEventListener('click', openHistoryDrawer);
    historyDrawerCloseBtn.addEventListener('click', closeHistoryDrawer);
    historyDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === historyDrawerOverlay) closeHistoryDrawer();
    });
    historyClearBtn.addEventListener('click', () => { History.clearAll(); renderHistory(); });

    downloadModal.addEventListener('click', (e) => { if (e.target === downloadModal) hideEl(downloadModal); });
    confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) hideEl(confirmModal); });
    colorPickerModal.addEventListener('click', (e) => { if (e.target === colorPickerModal) closeColorPickerModal(); });
  }

  function scheduleRealtimePreview() {
    if (!currentImage) return;
    clearTimeout(realtimeTimer);
    realtimeTimer = setTimeout(() => doPixelate(true), 80);
  }

  function scheduleSaveHistory() {
    if (!resultImageDataURL || hasSavedCurrentSession) return;
    clearTimeout(saveHistoryTimer);
    saveHistoryTimer = setTimeout(() => {
      saveHistory();
      hasSavedCurrentSession = true;
    }, 1500);
  }

  function handleImageFile(file) {
    const supported = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    if (!supported.includes(file.type)) {
      alert('不支持的文件格式，请上传 JPG、PNG、WebP 或 BMP 图片。');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('文件大小超过 20MB 限制，请压缩后重试。');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        showOriginalImage(img);
        autoRecommendBlockSize(img.naturalWidth, img.naturalHeight);
        closeCameraModal();
        hasSavedCurrentSession = false;
        scheduleRealtimePreview();
        updateUI();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function showOriginalImage(img) {
    previewPlaceholder.classList.add('hidden');
    showEl(previewStack);
    originalCanvas.width = img.naturalWidth;
    originalCanvas.height = img.naturalHeight;
    const ctx = originalCanvas.getContext('2d');
    ctx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    ctx.drawImage(img, 0, 0);
    limitCanvasDisplaySize(originalCanvas);
    limitCanvasDisplaySize(resultCanvas);
  }

  function limitCanvasDisplaySize(canvas) {
    const maxH = Math.min(canvas.height, window.innerHeight * 0.7);
    const maxW = Math.min(canvas.width, (previewStack ? previewStack.clientWidth : window.innerWidth) - 40);
    const ratioH = maxH / canvas.height;
    const ratioW = maxW / canvas.width;
    const ratio = Math.min(ratioH, ratioW, 1);
    canvas.style.width = Math.round(canvas.width * ratio) + 'px';
    canvas.style.height = Math.round(canvas.height * ratio) + 'px';
  }

  function autoRecommendBlockSize(w, h) {
    const avg = (w + h) / 2;
    const recommended = Math.max(2, Math.min(64, Math.round(avg / 48)));
    blockSizeSlider.value = recommended;
    blockSizeInput.value = recommended;
    blockSizeValue.textContent = recommended;
  }

  async function openCameraModal() {
    showEl(cameraModalOverlay);
    const ok = await Camera.start(cameraVideo, cameraHiddenCanvas);
    if (!ok) {
      alert('无法访问摄像头，请检查权限设置。');
      closeCameraModal();
    }
  }

  function closeCameraModal() {
    Camera.stop();
    hideEl(cameraModalOverlay);
  }

  async function captureFromCamera() {
    const canvas = Camera.capture();
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      showOriginalImage(img);
      autoRecommendBlockSize(img.naturalWidth, img.naturalHeight);
      closeCameraModal();
      hasSavedCurrentSession = false;
      scheduleRealtimePreview();
      updateUI();
    };
    img.src = canvas.toDataURL('image/png');
  }

  async function switchCamera() {
    cameraSwitchBtn.disabled = true;
    await Camera.switchCamera(cameraVideo, cameraHiddenCanvas);
    cameraSwitchBtn.disabled = false;
  }

  function doPixelate(silent) {
    if (!currentImage) return;
    if (!silent) showEl(loadingOverlay);
    setTimeout(() => {
      try {
        const blockSize = parseInt(blockSizeSlider.value, 10);
        const colorDepth = parseInt(colorDepthSlider.value, 10);
        const isOriginalMode = Palette.isOriginalMode();
        const paletteColors = isOriginalMode ? null : Palette.getActiveColors();
        const result = Pixelate.pixelate(currentImage, blockSize, paletteColors, colorDepth, isOriginalMode);
        const ctx = resultCanvas.getContext('2d');
        resultCanvas.width = result.width;
        resultCanvas.height = result.height;
        ctx.clearRect(0, 0, result.width, result.height);
        ctx.drawImage(result, 0, 0);
        resultImageDataURL = result.toDataURL('image/png');
        limitCanvasDisplaySize(resultCanvas);
        if (!silent) {
          saveHistory();
          hasSavedCurrentSession = true;
        } else {
          scheduleSaveHistory();
        }
        previewPlaceholder.classList.add('hidden');
        showEl(previewStack);
      } catch (e) {
        if (!silent) alert('像素化处理失败：' + e.message);
      } finally {
        if (!silent) hideEl(loadingOverlay);
        updateUI();
      }
    }, silent ? 10 : 50);
  }

  function doDownload() {
    if (!resultImageDataURL) return;
    const resultImg = new Image();
    resultImg.onload = () => {
      let canvas;
      if (selectedScale > 1) {
        canvas = Pixelate.scaleCanvas(resultImg, selectedScale);
      } else {
        canvas = document.createElement('canvas');
        canvas.width = resultImg.naturalWidth || resultImg.width;
        canvas.height = resultImg.naturalHeight || resultImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(resultImg, 0, 0);
      }
      let mimeType = 'image/png';
      let quality;
      let ext = 'png';
      if (selectedFormat === 'jpg') { mimeType = 'image/jpeg'; quality = 0.92; ext = 'jpg'; }
      else if (selectedFormat === 'webp') { mimeType = 'image/webp'; quality = 0.92; ext = 'webp'; }
      canvas.toBlob((blob) => {
        const filename = 'pixelate_filter_' + Date.now() + '.' + ext;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        hideEl(downloadModal);
      }, mimeType, quality);
    };
    resultImg.src = resultImageDataURL;
  }

  function resetAll() {
    currentImage = null;
    resultImageDataURL = null;
    hasSavedCurrentSession = false;
    blockSizeSlider.value = 8;
    blockSizeInput.value = 8;
    blockSizeValue.textContent = '8';
    colorDepthSlider.value = 16;
    colorDepthInput.value = 16;
    colorDepthValue.textContent = '16';
    selectPalette('original');
    previewPlaceholder.classList.remove('hidden');
    hideEl(previewStack);
    closeCameraModal();
    updateUI();
  }

  function openHistoryDrawer() { renderHistory(); showEl(historyDrawerOverlay); }
  function closeHistoryDrawer() { hideEl(historyDrawerOverlay); }

  function saveHistory() {
    if (!resultImageDataURL || !resultCanvas.width || !resultCanvas.height) return;
    try {
      const thumb = History.canvasToThumbnail(resultCanvas);
      const params = {
        blockSize: parseInt(blockSizeSlider.value, 10),
        colorDepth: parseInt(colorDepthSlider.value, 10),
        paletteKey: Palette.getActiveKey(),
        customColors: Palette.getPreviewColors('custom'),
      };
      const record = History.createRecord(thumb, params, '');
      History.add(record);
    } catch (e) {}
  }

  function renderHistory() {
    const records = History.getAll();
    historyList.innerHTML = '';
    if (records.length === 0) {
      historyEmpty.style.display = '';
      historyList.style.display = 'none';
      return;
    }
    historyEmpty.style.display = 'none';
    historyList.style.display = '';
    records.forEach((record) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.tabIndex = 0;
      const thumb = document.createElement('img');
      thumb.className = 'history-thumb';
      thumb.src = record.thumbnail;
      thumb.alt = '缩略图';
      const info = document.createElement('div');
      info.className = 'history-info';
      const title = document.createElement('div');
      title.className = 'history-info-title';
      const pal = Palette.get(record.params.paletteKey);
      title.textContent = pal ? pal.name : record.params.paletteKey;
      const meta = document.createElement('div');
      meta.className = 'history-info-meta';
      meta.textContent = '块:' + record.params.blockSize + ' 色:' + record.params.colorDepth + ' | ' + formatTime(record.timestamp);
      info.appendChild(title);
      info.appendChild(meta);
      item.appendChild(thumb);
      item.appendChild(info);
      item.addEventListener('click', () => loadHistory(record));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadHistory(record); }
      });
      historyList.appendChild(item);
    });
  }

  function loadHistory(record) {
    blockSizeSlider.value = record.params.blockSize;
    blockSizeInput.value = record.params.blockSize;
    blockSizeValue.textContent = String(record.params.blockSize);
    colorDepthSlider.value = record.params.colorDepth;
    colorDepthInput.value = record.params.colorDepth;
    colorDepthValue.textContent = String(record.params.colorDepth);
    selectPalette(record.params.paletteKey);
    if (record.params.customColors) {
      Palette.setCustomColors(record.params.customColors);
      renderCustomColors();
    }
    closeHistoryDrawer();
    alert('历史参数已恢复，请重新上传原图后系统将自动生成结果。');
  }

  function openColorPickerModal() {
    colorPickerInput.value = '#e94560';
    colorPickerPreview.style.background = '#e94560';
    showEl(colorPickerModal);
  }
  function closeColorPickerModal() { hideEl(colorPickerModal); }

  function updateUI() {
    const hasImage = !!currentImage;
    const hasResult = !!resultImageDataURL;
    downloadBtn.disabled = !hasResult;
    resetBtn.disabled = !hasImage && !hasResult;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
