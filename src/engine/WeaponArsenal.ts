import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { SceneManager } from './SceneManager';

export type WeaponType = 'hand' | 'chappal' | 'broom' | 'sweet_pot';

export interface WeaponDef {
  id: WeaponType;
  name: string;
  icon: string;
  soundType: 'slap' | 'chappal' | 'broom' | 'pot';
  forceMultiplier: number;
}

export const WEAPON_LIST: WeaponDef[] = [
  { id: 'hand', name: 'কষে চড়', icon: '👋', soundType: 'slap', forceMultiplier: 1.0 },
  { id: 'chappal', name: 'উড়ন্ত স্যান্ডেল', icon: '👡', soundType: 'chappal', forceMultiplier: 1.35 },
  { id: 'broom', name: 'ঝাড়ু পেটা', icon: '🧹', soundType: 'broom', forceMultiplier: 1.2 },
  { id: 'sweet_pot', name: 'মিষ্টির হাড়ি', icon: '🍯', soundType: 'pot', forceMultiplier: 1.5 },
];

export class WeaponArsenal {
  private sceneManager: SceneManager;
  private physicsWorld: CANNON.World;
  public activeWeapon: WeaponType = 'hand';
  private flyingWeapons: { mesh: THREE.Object3D; body: CANNON.Body; life: number }[] = [];

  constructor(sceneManager: SceneManager, physicsWorld: CANNON.World) {
    this.sceneManager = sceneManager;
    this.physicsWorld = physicsWorld;
  }

  public setWeapon(type: WeaponType): void {
    this.activeWeapon = type;
  }

  // Spawns a physical weapon projectile flying towards the enemy
  public launchWeapon(targetPos: THREE.Vector3): void {
    if (this.activeWeapon === 'hand') return; // Hand uses direct touch slap

    let mesh: THREE.Object3D;
    let shape: CANNON.Shape;

    if (this.activeWeapon === 'chappal') {
      mesh = this.createChappalMesh();
      shape = new CANNON.Box(new CANNON.Vec3(0.15, 0.04, 0.28));
    } else if (this.activeWeapon === 'broom') {
      mesh = this.createBroomMesh();
      shape = new CANNON.Cylinder(0.06, 0.08, 0.9, 8);
    } else {
      // Sweet Pot
      mesh = this.createPotMesh();
      shape = new CANNON.Sphere(0.22);
    }

    const startPos = this.sceneManager.camera.position.clone();
    startPos.y -= 0.3;
    startPos.z -= 0.5;

    mesh.position.copy(startPos);
    this.sceneManager.scene.add(mesh);

    const body = new CANNON.Body({
      mass: 1.5,
      shape: shape,
      position: new CANNON.Vec3(startPos.x, startPos.y, startPos.z),
    });

    // Calculate trajectory toward enemy target
    const dir = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
    const speed = 28;
    body.velocity.set(dir.x * speed, dir.y * speed + 3, dir.z * speed);
    body.angularVelocity.set(
      (Math.random() - 0.5) * 35,
      (Math.random() - 0.5) * 35,
      (Math.random() - 0.5) * 35
    );

    this.physicsWorld.addBody(body);
    this.flyingWeapons.push({ mesh, body, life: 2.5 });
  }

  private createChappalMesh(): THREE.Group {
    const group = new THREE.Group();
    // Blue / yellow sponge rubber Bata sandal
    const soleMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.8 });
    const strapMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.5), soleMat);
    sole.castShadow = true;
    group.add(sole);

    // V-shaped strap
    const strapLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.22), strapMat);
    strapLeft.position.set(-0.06, 0.06, 0.06);
    strapLeft.rotation.y = 0.4;
    group.add(strapLeft);

    const strapRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.22), strapMat);
    strapRight.position.set(0.06, 0.06, 0.06);
    strapRight.rotation.y = -0.4;
    group.add(strapRight);

    return group;
  }

  private createBroomMesh(): THREE.Group {
    const group = new THREE.Group();
    // Bamboo handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), handleMat);
    handle.castShadow = true;
    group.add(handle);

    // Straw bristles
    const bristleMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.95 });
    const bristles = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 8), bristleMat);
    bristles.position.set(0, -0.45, 0);
    bristles.rotation.x = Math.PI;
    group.add(bristles);

    return group;
  }

  private createPotMesh(): THREE.Mesh {
    // Terracotta clay pot (মাটির মিষ্টির হাড়ি)
    const clayMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.9 });
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), clayMat);
    pot.scale.set(1.1, 0.85, 1.1);
    pot.castShadow = true;
    return pot;
  }

  public update(deltaTime: number): void {
    for (let i = this.flyingWeapons.length - 1; i >= 0; i--) {
      const item = this.flyingWeapons[i];
      item.life -= deltaTime;

      if (item.life <= 0) {
        this.sceneManager.scene.remove(item.mesh);
        this.physicsWorld.removeBody(item.body);
        this.flyingWeapons.splice(i, 1);
      } else {
        item.mesh.position.copy(item.body.position as unknown as THREE.Vector3);
        item.mesh.quaternion.copy(item.body.quaternion as unknown as THREE.Quaternion);
      }
    }
  }
}

