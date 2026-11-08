import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { SceneManager } from './SceneManager';
import { Ragdoll } from './Ragdoll';

export class CombatEngine {
  private sceneManager: SceneManager;
  private currentRagdoll: Ragdoll | null = null;
  private particleGroup: THREE.Group;
  private activeParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  
  // Hit-Stop Freeze Frame state
  public isFrozen: boolean = false;
  private freezeEndTime: number = 0;

  // Rage Meter ("মাথা গরম মিটার")
  public rage: number = 0; // 0 to 100
  public consecutiveHits: number = 0;

  // Bengali comic hit words
  private comicHitWords = [
    'ঠাস!', 'ধমাশ!', 'ডিসুম!', 'পটাশ!', 'কড়মড়!', 'হুম্বা!', 'বুম!', 'চটাশ!'
  ];

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
    this.particleGroup = new THREE.Group();
    this.sceneManager.scene.add(this.particleGroup);

    this.setupRaycasting();
  }

  public setRagdoll(ragdoll: Ragdoll): void {
    this.currentRagdoll = ragdoll;
  }

  private setupRaycasting(): void {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        return;
      }

      // Check if clicked on UI
      const target = event.target as HTMLElement;
      if (target && target.closest('.interactive')) return;

      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.sceneManager.camera);
      if (!this.currentRagdoll) return;

      const meshes = Object.values(this.currentRagdoll.parts).map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0];
        this.triggerSlap(hit.point, clientX, clientY);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('touchstart', onPointerDown, { passive: true });
  }

  public triggerSlap(
    hitPoint?: THREE.Vector3,
    screenX: number = window.innerWidth / 2,
    screenY: number = window.innerHeight / 2
  ): void {
    if (!this.currentRagdoll) return;

    // 1. Calculate impact point & directional impulse
    const point = hitPoint || this.currentRagdoll.parts['head'].mesh.position.clone();
    const impulseStrength = 55 + Math.random() * 25;
    
    // Slap force launches backwards & sideways with comical lift
    const dirX = (Math.random() - 0.5) * 40;
    const dirY = 30 + Math.random() * 20;
    const dirZ = -impulseStrength;

    const impulse = new CANNON.Vec3(dirX, dirY, dirZ);
    const cannonPoint = new CANNON.Vec3(point.x, point.y, point.z);
    const angularSpin = new CANNON.Vec3(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 30
    );

    this.currentRagdoll.applyHitImpulse(impulse, cannonPoint, angularSpin);

    // 2. 60ms 1-Frame Hit-Stop freeze
    this.triggerHitStop(60);

    // 3. Camera Shake
    this.sceneManager.triggerCameraShake(0.45);

    // 4. Star Particles in 3D
    this.spawnHitStars(point);

    // 5. Bengali Floating Comic Hit Bubble
    this.showComicHitBubble(screenX, screenY);

    // 6. Increase Rage Meter
    this.increaseRage(12);
  }

  public triggerDropkick(): void {
    if (!this.currentRagdoll) return;

    const point = this.currentRagdoll.parts['torso'].mesh.position.clone();
    // Huge launching dropkick impulse
    const impulse = new CANNON.Vec3(
      (Math.random() - 0.5) * 30,
      45,
      -95
    );
    const cannonPoint = new CANNON.Vec3(point.x, point.y, point.z);
    const angularSpin = new CANNON.Vec3(60, 0, (Math.random() - 0.5) * 30);

    this.currentRagdoll.applyHitImpulse(impulse, cannonPoint, angularSpin);

    this.triggerHitStop(90);
    this.sceneManager.triggerCameraShake(0.75);
    this.spawnHitStars(point, 18);
    this.showComicHitBubble(window.innerWidth / 2, window.innerHeight * 0.45, 'ধমাশ!');
    this.increaseRage(20);
  }

  public triggerSuperFinisher(): void {
    if (!this.currentRagdoll) return;
    this.rage = 0;
    this.updateRageUI();

    const point = this.currentRagdoll.parts['head'].mesh.position.clone();
    
    // Slow-motion multi-slap barrage
    let hits = 0;
    const interval = setInterval(() => {
      hits++;
      this.sceneManager.triggerCameraShake(0.5);
      this.spawnHitStars(point, 8);
      this.showComicHitBubble(
        window.innerWidth / 2 + (Math.random() - 0.5) * 160,
        window.innerHeight / 2 + (Math.random() - 0.5) * 160,
        hits === 5 ? 'মহা ধুলাই!' : 'ঠাস!'
      );

      if (hits >= 5) {
        clearInterval(interval);
        // Cataclysmic launch into the stratosphere
        const finalImpulse = new CANNON.Vec3(
          (Math.random() - 0.5) * 80,
          140, // High sky launch!
          -120
        );
        this.currentRagdoll?.applyHitImpulse(
          finalImpulse,
          new CANNON.Vec3(point.x, point.y, point.z),
          new CANNON.Vec3(90, 80, 50)
        );
        this.sceneManager.triggerCameraShake(1.0);
        this.spawnHitStars(point, 30);
      }
    }, 120);
  }

  private triggerHitStop(durationMs: number): void {
    this.isFrozen = true;
    this.freezeEndTime = performance.now() + durationMs;
  }

  private increaseRage(amount: number): void {
    this.rage = Math.min(this.rage + amount, 100);
    this.consecutiveHits++;
    this.updateRageUI();
  }

  private updateRageUI(): void {
    const rageBar = document.getElementById('rage-bar');
    const ragePercent = document.getElementById('rage-percent');
    const superBtn = document.getElementById('super-btn');

    if (rageBar) rageBar.style.width = `${this.rage}%`;
    if (ragePercent) ragePercent.innerText = `${Math.round(this.rage)}%`;

    if (superBtn) {
      if (this.rage >= 100) {
        superBtn.style.display = 'inline-block';
      } else {
        superBtn.style.display = 'none';
      }
    }
  }

  private spawnHitStars(center: THREE.Vector3, count: number = 12): void {
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    for (let i = 0; i < count; i++) {
      // 5-point comic star or diamond
      const geo = new THREE.OctahedronGeometry(0.12 + Math.random() * 0.08);
      const mesh = new THREE.Mesh(geo, starMat);
      mesh.position.copy(center);

      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        (Math.random() - 0.2) * speed,
        Math.sin(angle) * speed
      );

      this.particleGroup.add(mesh);
      this.activeParticles.push({ mesh, vel, life: 1.0 });
    }
  }

  private showComicHitBubble(x: number, y: number, customText?: string): void {
    const bubble = document.createElement('div');
    bubble.className = 'hit-bubble';
    bubble.innerText = customText || this.comicHitWords[Math.floor(Math.random() * this.comicHitWords.length)];
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 700);
  }

  public update(deltaTime: number): void {
    // Hit stop freeze check
    if (this.isFrozen) {
      if (performance.now() >= this.freezeEndTime) {
        this.isFrozen = false;
      }
      return;
    }

    // Update particles
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life -= deltaTime * 2.5;
      if (p.life <= 0) {
        this.particleGroup.remove(p.mesh);
        this.activeParticles.splice(i, 1);
      } else {
        p.mesh.position.addScaledVector(p.vel, deltaTime);
        p.mesh.scale.setScalar(p.life);
        p.mesh.rotation.x += 0.2;
        p.mesh.rotation.y += 0.2;
      }
    }
  }
}

