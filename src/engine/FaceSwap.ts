import * as THREE from 'three';
import { Ragdoll } from './Ragdoll';

export class FaceSwap {
  private cropCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private modal: HTMLElement | null;
  private currentTexture: THREE.CanvasTexture | null = null;
  private db: IDBDatabase | null = null;
  private videoStream: MediaStream | null = null;
  private onFaceAppliedCallback: ((texture: THREE.CanvasTexture) => void) | null = null;

  constructor() {
    this.cropCanvas = document.getElementById('cropCanvas') as HTMLCanvasElement;
    this.ctx = this.cropCanvas.getContext('2d')!;
    this.modal = document.getElementById('face-modal');

    this.initIndexedDB();
    this.initUI();
    this.drawPlaceholder();
  }

  public setOnFaceApplied(cb: (texture: THREE.CanvasTexture) => void): void {
    this.onFaceAppliedCallback = cb;
  }

  // --- 1. Local Browser IndexedDB (100% Offline, Zero Server Risk) ---
  private initIndexedDB(): void {
    const request = indexedDB.open('MathaGoromDB', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('custom_faces')) {
        db.createObjectStore('custom_faces', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.loadSavedFace();
    };

    request.onerror = (e) => {
      console.warn('IndexedDB failed to open:', e);
    };
  }

  private saveFaceToDB(dataUrl: string): void {
    if (!this.db) return;
    const tx = this.db.transaction('custom_faces', 'readwrite');
    const store = tx.objectStore('custom_faces');
    store.put({ id: 'active_face', dataUrl, updatedAt: Date.now() });
  }

  private loadSavedFace(): void {
    if (!this.db) return;
    const tx = this.db.transaction('custom_faces', 'readonly');
    const store = tx.objectStore('custom_faces');
    const request = store.get('active_face');

    request.onsuccess = () => {
      if (request.result && request.result.dataUrl) {
        this.renderImageFromUrl(request.result.dataUrl, true);
      }
    };
  }

  private clearFaceFromDB(): void {
    if (!this.db) return;
    const tx = this.db.transaction('custom_faces', 'readwrite');
    const store = tx.objectStore('custom_faces');
    store.delete('active_face');
  }

  // --- 2. UI Event Wiring ---
  private initUI(): void {
    const faceBtn = document.getElementById('face-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const fileInput = document.getElementById('face-file-input') as HTMLInputElement;
    const webcamBtn = document.getElementById('webcam-btn');
    const clearBtn = document.getElementById('clear-face-btn');
    const applyBtn = document.getElementById('apply-face-btn');

    faceBtn?.addEventListener('click', () => {
      this.openModal();
    });

    closeBtn?.addEventListener('click', () => {
      this.closeModal();
    });

    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    fileInput?.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        this.stopWebcam();
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            this.renderImageFromUrl(event.target.result as string, false);
          }
        };
        reader.readAsDataURL(files[0]);
      }
    });

    webcamBtn?.addEventListener('click', () => {
      this.toggleWebcam();
    });

    clearBtn?.addEventListener('click', () => {
      this.stopWebcam();
      this.clearFaceFromDB();
      this.drawPlaceholder();
      this.currentTexture = null;
    });

    applyBtn?.addEventListener('click', () => {
      this.applyFace();
      this.closeModal();
    });
  }

  private openModal(): void {
    this.modal?.classList.add('active');
  }

  private closeModal(): void {
    this.stopWebcam();
    this.modal?.classList.remove('active');
  }

  private drawPlaceholder(): void {
    const size = this.cropCanvas.width;
    this.ctx.clearRect(0, 0, size, size);

    // Warm caricature base
    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Default funny cartoon eyes & smirk
    this.ctx.fillStyle = '#09090b';
    this.ctx.beginPath();
    this.ctx.arc(size * 0.35, size * 0.42, 14, 0, Math.PI * 2);
    this.ctx.arc(size * 0.65, size * 0.42, 14, 0, Math.PI * 2);
    this.ctx.fill();

    // Eye highlights
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(size * 0.38, size * 0.40, 5, 0, Math.PI * 2);
    this.ctx.arc(size * 0.68, size * 0.40, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // Smug grin
    this.ctx.lineWidth = 6;
    this.ctx.strokeStyle = '#dc2626';
    this.ctx.beginPath();
    this.ctx.arc(size / 2, size * 0.58, 48, 0.2, Math.PI - 0.2);
    this.ctx.stroke();
  }

  private renderImageFromUrl(url: string, autoApply: boolean = false): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = this.cropCanvas.width;
      this.ctx.clearRect(0, 0, size, size);

      // Circular clip path
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      this.ctx.clip();

      // Cover scaling
      const aspect = img.width / img.height;
      let drawW = size;
      let drawH = size;
      let offX = 0;
      let offY = 0;

      if (aspect > 1) {
        drawW = size * aspect;
        offX = (size - drawW) / 2;
      } else {
        drawH = size / aspect;
        offY = (size - drawH) / 2;
      }

      this.ctx.drawImage(img, offX, offY, drawW, drawH);
      this.ctx.restore();

      if (autoApply) {
        this.applyFace();
      }
    };
    img.src = url;
  }

  // --- 3. Webcam Live Capture ---
  private async toggleWebcam(): Promise<void> {
    if (this.videoStream) {
      this.stopWebcam();
      return;
    }

    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 },
      });

      const video = document.createElement('video');
      video.srcObject = this.videoStream;
      video.play();

      const renderVideoFrame = () => {
        if (!this.videoStream) return;
        const size = this.cropCanvas.width;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        this.ctx.clip();

        // Mirrored selfie view
        this.ctx.translate(size, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(video, 0, 0, size, size);
        this.ctx.restore();

        requestAnimationFrame(renderVideoFrame);
      };
      video.onloadedmetadata = () => {
        renderVideoFrame();
      };
    } catch (err) {
      alert('ক্যামেরা চালু করা যায়নি: অনুমতি দিন বা ফাইল আপলোড করুন।');
      console.warn('Webcam error:', err);
    }
  }

  private stopWebcam(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }
  }

  // --- 4. Apply to Three.js Texture & Character Head Mesh ---
  public applyFace(): void {
    this.stopWebcam();
    const dataUrl = this.cropCanvas.toDataURL('image/png');
    this.saveFaceToDB(dataUrl);

    // Create Three.js CanvasTexture
    const texture = new THREE.CanvasTexture(this.cropCanvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.needsUpdate = true;
    this.currentTexture = texture;

    if (this.onFaceAppliedCallback) {
      this.onFaceAppliedCallback(texture);
    }
  }

  public applyToRagdoll(ragdoll: Ragdoll): void {
    if (this.currentTexture) {
      ragdoll.setFaceTexture(this.currentTexture);
    }
  }
}

