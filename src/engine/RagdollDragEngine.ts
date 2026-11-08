import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { SceneManager } from './SceneManager';
import { Ragdoll } from './Ragdoll';

export class RagdollDragEngine {
  private sceneManager: SceneManager;
  private currentRagdoll: Ragdoll | null = null;

  private isDragging: boolean = false;
  private draggedBody: CANNON.Body | null = null;
  private dragPlane: THREE.Plane = new THREE.Plane();
  private planeIntersect: THREE.Vector3 = new THREE.Vector3();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();

  // Mouse velocity tracking for toss impulse
  private lastDragPos: THREE.Vector3 = new THREE.Vector3();
  private dragVelocity: THREE.Vector3 = new THREE.Vector3();
  private lastDragTime: number = 0;

  // Visual drag tether indicator
  private dragLine: THREE.Line;
  private onTossedCallback: ((speed: number) => void) | null = null;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;

    // Visual drag line (laser/rubber string)
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
    this.dragLine = new THREE.Line(lineGeo, lineMat);
    this.dragLine.visible = false;
    this.sceneManager.scene.add(this.dragLine);

    this.bindEvents();
  }

  public setRagdoll(ragdoll: Ragdoll): void {
    this.currentRagdoll = ragdoll;
  }

  public setOnTossed(cb: (speed: number) => void): void {
    this.onTossedCallback = cb;
  }

  private bindEvents(): void {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const client = this.getClientPos(e);
      if (!client) return;

      const target = e.target as HTMLElement;
      if (target && target.closest('.interactive')) return;

      this.updateMouse(client.x, client.y);
      this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

      if (!this.currentRagdoll) return;
      const meshes = Object.values(this.currentRagdoll.parts).map((p) => p.mesh);
      const hits = this.raycaster.intersectObjects(meshes, true);

      if (hits.length > 0) {
        const hit = hits[0];
        // Find which ragdoll part was grabbed
        for (const key of Object.keys(this.currentRagdoll.parts)) {
          const part = this.currentRagdoll.parts[key];
          if (part.mesh === hit.object || part.mesh.children.includes(hit.object)) {
            this.startDrag(part.body, hit.point);
            break;
          }
        }
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging || !this.draggedBody) return;
      const client = this.getClientPos(e);
      if (!client) return;

      this.updateMouse(client.x, client.y);
      this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);

      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.planeIntersect)) {
        const now = performance.now();
        const dt = Math.max((now - this.lastDragTime) / 1000, 0.016);
        this.lastDragTime = now;

        // Calculate fling velocity
        this.dragVelocity.subVectors(this.planeIntersect, this.lastDragPos).divideScalar(dt);
        this.lastDragPos.copy(this.planeIntersect);

        // Pull dragged body towards pointer
        const targetCannon = new CANNON.Vec3(
          this.planeIntersect.x,
          this.planeIntersect.y,
          this.planeIntersect.z
        );
        const dist = targetCannon.vsub(this.draggedBody.position);
        this.draggedBody.velocity.set(dist.x * 12, dist.y * 12, dist.z * 12);

        // Update visual drag line
        const positions = this.dragLine.geometry.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, this.draggedBody.position.x, this.draggedBody.position.y, this.draggedBody.position.z);
        positions.setXYZ(1, this.planeIntersect.x, this.planeIntersect.y, this.planeIntersect.z);
        positions.needsUpdate = true;
      }
    };

    const onPointerUp = () => {
      if (!this.isDragging) return;
      this.endDrag();
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  private startDrag(body: CANNON.Body, hitPoint: THREE.Vector3): void {
    this.isDragging = true;
    this.draggedBody = body;
    if (this.currentRagdoll) {
      this.currentRagdoll.isRagdoll = true;
    }

    // Virtual plane facing camera at grabbed body depth
    const normal = this.sceneManager.camera.getWorldDirection(new THREE.Vector3()).negate();
    this.dragPlane.setFromNormalAndCoplanarPoint(normal, hitPoint);
    this.lastDragPos.copy(hitPoint);
    this.lastDragTime = performance.now();
    this.dragVelocity.set(0, 0, 0);

    this.dragLine.visible = true;
    this.sceneManager.triggerCameraShake(0.15);
  }

  private endDrag(): void {
    if (this.draggedBody) {
      // Apply fling impulse from fling velocity
      const tossImpulse = new CANNON.Vec3(
        this.dragVelocity.x * 2.5,
        this.dragVelocity.y * 2.5 + 4,
        this.dragVelocity.z * 2.5 - 10
      );
      this.draggedBody.applyImpulse(tossImpulse, this.draggedBody.position);

      const speed = this.dragVelocity.length();
      if (speed > 5 && this.onTossedCallback) {
        this.onTossedCallback(speed);
      }
    }

    this.isDragging = false;
    this.draggedBody = null;
    this.dragLine.visible = false;
  }

  private updateMouse(clientX: number, clientY: number): void {
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  }

  private getClientPos(e: MouseEvent | TouchEvent): { x: number; y: number } | null {
    if (e instanceof MouseEvent) {
      return { x: e.clientX, y: e.clientY };
    } else if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return null;
  }
}
