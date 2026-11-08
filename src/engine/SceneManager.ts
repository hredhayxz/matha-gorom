import * as THREE from 'three';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public baseCameraPos = new THREE.Vector3(0, 2.5, 6);
  public cameraLookAt = new THREE.Vector3(0, 1.3, 0);
  
  // Shake effect
  private shakeIntensity = 0;
  private shakeDecay = 0.9;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Bright Dhaka afternoon sky
    this.scene.fog = new THREE.FogExp2(0xd6e2e8, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.copy(this.baseCameraPos);
    this.camera.lookAt(this.cameraLookAt);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.setupLighting();
    this.onResize();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private setupLighting(): void {
    // Warm tropical afternoon ambient light
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
    this.scene.add(ambientLight);

    // Dhaka tropical sunlight (casts crisp shadows)
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sunLight.position.set(10, 18, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Warm street bounce light
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x78350f, 0.5);
    this.scene.add(hemiLight);
  }

  public triggerCameraShake(intensity: number = 0.35): void {
    this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 0.8);
  }

  public update(): void {
    if (this.shakeIntensity > 0.001) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
      const offsetZ = (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.set(
        this.baseCameraPos.x + offsetX,
        this.baseCameraPos.y + offsetY,
        this.baseCameraPos.z + offsetZ
      );
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.camera.position.lerp(this.baseCameraPos, 0.1);
    }
    this.camera.lookAt(this.cameraLookAt);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;

    // Responsive FOV & camera distance: Mobile portrait needs slightly wider FOV or pulled back camera
    if (aspect < 1.0) {
      // Portrait mobile (e.g. phone screen)
      this.camera.fov = 55;
      this.baseCameraPos.set(0, 2.3, 7.8);
      this.cameraLookAt.set(0, 1.2, 0);
    } else if (aspect < 1.4) {
      // Tablet / square screen
      this.camera.fov = 48;
      this.baseCameraPos.set(0, 2.4, 6.8);
      this.cameraLookAt.set(0, 1.25, 0);
    } else {
      // Desktop / large widescreen monitor
      this.camera.fov = 42;
      this.baseCameraPos.set(0, 2.5, 6.0);
      this.cameraLookAt.set(0, 1.3, 0);
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
