import * as THREE from 'three';

export type TimeOfDay = 'day' | 'dusk' | 'night';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public baseCameraPos = new THREE.Vector3(0, 2.5, 6);
  public cameraLookAt = new THREE.Vector3(0, 1.3, 0);

  // Lighting references for Day/Dusk/Night
  public ambientLight!: THREE.AmbientLight;
  public sunLight!: THREE.DirectionalLight;
  public hemiLight!: THREE.HemisphereLight;
  public streetLights: THREE.SpotLight[] = [];
  public currentTimeOfDay: TimeOfDay = 'day';

  // Splash & Spark Particles
  private splashGroup: THREE.Group;
  private activeSplashes: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

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

    this.splashGroup = new THREE.Group();
    this.scene.add(this.splashGroup);

    this.setupLighting();
    this.onResize();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private setupLighting(): void {
    // Warm tropical afternoon ambient light
    this.ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
    this.scene.add(this.ambientLight);

    // Dhaka tropical sunlight (casts crisp shadows)
    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    this.sunLight.position.set(10, 18, 12);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 50;
    this.sunLight.shadow.camera.left = -15;
    this.sunLight.shadow.camera.right = 15;
    this.sunLight.shadow.camera.top = 15;
    this.sunLight.shadow.camera.bottom = -15;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Warm street bounce light
    this.hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x78350f, 0.5);
    this.scene.add(this.hemiLight);

    // Street light spotlights for night mode
    [-14, 14].forEach((z) => {
      const spot = new THREE.SpotLight(0xfef08a, 0, 25, Math.PI / 4, 0.5);
      spot.position.set(-5.6, 8, z);
      spot.target.position.set(0, 0, z);
      this.scene.add(spot);
      this.scene.add(spot.target);
      this.streetLights.push(spot);
    });
  }

  // --- Day / Dusk / Night Lighting Cycle ---
  public setTimeOfDay(time: TimeOfDay): void {
    this.currentTimeOfDay = time;
    if (time === 'day') {
      this.scene.background = new THREE.Color(0x87ceeb);
      if (this.scene.fog instanceof THREE.FogExp2) this.scene.fog.color.set(0xd6e2e8);
      this.ambientLight.color.set(0xfff7ed);
      this.ambientLight.intensity = 0.85;
      this.sunLight.color.set(0xfffbeb);
      this.sunLight.intensity = 1.4;
      this.sunLight.position.set(10, 18, 12);
      this.streetLights.forEach((s) => (s.intensity = 0));
    } else if (time === 'dusk') {
      this.scene.background = new THREE.Color(0xc2410c); // Dhaka crimson sunset
      if (this.scene.fog instanceof THREE.FogExp2) this.scene.fog.color.set(0x9a3412);
      this.ambientLight.color.set(0xfed7aa);
      this.ambientLight.intensity = 0.65;
      this.sunLight.color.set(0xf97316);
      this.sunLight.intensity = 1.1;
      this.sunLight.position.set(-18, 6, 8); // Low sunset angle
      this.streetLights.forEach((s) => (s.intensity = 1.5));
    } else {
      // Night mode (Dhaka Neon Night)
      this.scene.background = new THREE.Color(0x0a0a0f);
      if (this.scene.fog instanceof THREE.FogExp2) this.scene.fog.color.set(0x0f172a);
      this.ambientLight.color.set(0x38bdf8);
      this.ambientLight.intensity = 0.28;
      this.sunLight.color.set(0x1e3a8a);
      this.sunLight.intensity = 0.4;
      this.streetLights.forEach((s) => (s.intensity = 3.5)); // Bright street lamps
    }
  }

  // --- Roadside Drain Water Splash Particles ---
  public spawnDrainWaterSplash(pos: THREE.Vector3): void {
    const splashMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 16; i++) {
      const geo = new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.05);
      const mesh = new THREE.Mesh(geo, splashMat);
      mesh.position.set(pos.x, pos.y + 0.1, pos.z);
      this.splashGroup.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 4;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        4 + Math.random() * 4,
        Math.sin(angle) * speed
      );
      this.activeSplashes.push({ mesh, vel, life: 0.8 });
    }
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

    // Update splash particles
    const dt = 0.016;
    for (let i = this.activeSplashes.length - 1; i >= 0; i--) {
      const s = this.activeSplashes[i];
      s.life -= dt * 1.8;
      if (s.life <= 0) {
        this.splashGroup.remove(s.mesh);
        this.activeSplashes.splice(i, 1);
      } else {
        s.vel.y -= 9.8 * dt; // Gravity on water
        s.mesh.position.addScaledVector(s.vel, dt);
        s.mesh.scale.setScalar(s.life);
      }
    }
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;

    // Responsive FOV & camera distance
    if (aspect < 1.0) {
      this.camera.fov = 55;
      this.baseCameraPos.set(0, 2.3, 7.8);
      this.cameraLookAt.set(0, 1.2, 0);
    } else if (aspect < 1.4) {
      this.camera.fov = 48;
      this.baseCameraPos.set(0, 2.4, 6.8);
      this.cameraLookAt.set(0, 1.25, 0);
    } else {
      this.camera.fov = 42;
      this.baseCameraPos.set(0, 2.5, 6.0);
      this.cameraLookAt.set(0, 1.3, 0);
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
