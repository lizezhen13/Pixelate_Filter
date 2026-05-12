const Camera = (() => {
  let stream = null;
  let videoEl = null;
  let canvasEl = null;
  let facingMode = 'environment';
  let isActive = false;

  function start(video, canvas) {
    videoEl = video;
    canvasEl = canvas;
    return new Promise((resolve) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        isActive = false;
        resolve(false);
        return;
      }
      const constraints = {
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };
      navigator.mediaDevices.getUserMedia(constraints)
        .then((s) => {
          attachStream(s);
          resolve(true);
        })
        .catch(() => {
          if (facingMode === 'environment') {
            facingMode = 'user';
            constraints.video.facingMode = 'user';
            navigator.mediaDevices.getUserMedia(constraints)
              .then((s) => {
                attachStream(s);
                resolve(true);
              })
              .catch(() => { isActive = false; resolve(false); });
          } else { isActive = false; resolve(false); }
        });
    });
  }

  function attachStream(s) {
    stream = s;
    videoEl.srcObject = stream;
    isActive = true;
    if (videoEl.play) {
      const playPromise = videoEl.play();
      if (playPromise && playPromise.catch) playPromise.catch(() => {});
    }
  }

  function stop() {
    if (stream) { stream.getTracks().forEach((track) => track.stop()); stream = null; }
    if (videoEl) { videoEl.srcObject = null; }
    isActive = false;
  }

  function switchCamera(video, canvas) {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    stop();
    return video ? start(video, canvas) : Promise.resolve(false);
  }

  function capture() {
    if (!isActive || !videoEl) return null;
    if (!canvasEl) {
      canvasEl = document.createElement('canvas');
    }
    if (!videoEl.videoWidth || !videoEl.videoHeight) return null;
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    const ctx = canvasEl.getContext('2d');
    ctx.drawImage(videoEl, 0, 0);
    return canvasEl;
  }

  function getIsActive() { return isActive; }

  return { start, stop, switchCamera, capture, getIsActive };
})();
