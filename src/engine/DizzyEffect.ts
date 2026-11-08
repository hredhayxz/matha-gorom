import * as THREE from 'three';
import { Ragdoll } from './Ragdoll';

export class DizzyEffect {
  private group: THREE.Group;
  private stars: THREE.Mesh[] = [];
  private currentRagdoll: Ragdoll | null = null;
  private angle: number = 0;
  public isVisible: boolean = false;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    scene.add(this.group);

    const starMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.OctahedronGeometry(0.08);
      const star = new THREE.Mesh(geo, starMat);
      this.stars.push(star);
      this.group.add(star);
    }
    this.group.visible = false;
  }

  public setRagdoll(ragdoll: Ragdoll): void {
    this.currentRagdoll = ragdoll;
  }

  public setVisible(val: boolean): void {
    this.isVisible = val;
    this.group.visible = val;
  }

  public update(deltaTime: number): void {
    if (!this.isVisible || !this.currentRagdoll) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;
    const headPos = this.currentRagdoll.parts['head'].mesh.position;
    this.group.position.set(headPos.x, headPos.y + 0.45, headPos.z);

    this.angle += deltaTime * 5.0;
    const radius = 0.38;

    this.stars.forEach((star, idx) => {
      const offset = (idx / this.stars.length) * Math.PI * 2;
      const currentA = this.angle + offset;
      star.position.set(
        Math.cos(currentA) * radius,
        Math.sin(currentA * 2) * 0.08,
        Math.sin(currentA) * radius
      );
      star.rotation.y += 0.1;
      star.rotation.x += 0.08;
    });
  }
}
