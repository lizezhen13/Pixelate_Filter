export class CameraController {
  private stream: MediaStream | null = null;
  private facingMode: VideoFacingModeEnum = 'environment';

  async start(video: HTMLVideoElement): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) return false;

    const constraints = this.createConstraints();

    try {
      await this.attachStream(video, await navigator.mediaDevices.getUserMedia(constraints));
      return true;
    } catch {
      if (this.facingMode !== 'environment') return false;

      this.facingMode = 'user';

      try {
        await this.attachStream(video, await navigator.mediaDevices.getUserMedia(this.createConstraints()));
        return true;
      } catch {
        return false;
      }
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  async switchCamera(video: HTMLVideoElement): Promise<boolean> {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    this.stop();
    return this.start(video);
  }

  capture(video: HTMLVideoElement): HTMLCanvasElement | null {
    if (!video.videoWidth || !video.videoHeight) return null;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  private createConstraints(): MediaStreamConstraints {
    return {
      video: {
        facingMode: this.facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    };
  }

  private async attachStream(video: HTMLVideoElement, stream: MediaStream): Promise<void> {
    this.stop();
    this.stream = stream;
    video.srcObject = stream;

    try {
      await video.play();
    } catch {
      // Some browsers require a user gesture; the stream is still attached.
    }
  }
}
