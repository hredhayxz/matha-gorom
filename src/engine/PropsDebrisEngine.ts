import * as THREE from 'three';
import * as CANNON from 'cannon-es';

interface ActiveDebris {
  mesh: THREE.Mesh | THREE.Group;
  body: CANNON.Body;
  life: number;
}

export class PropsDebrisEngine {
  private scene: THREE.Scene;
  private physicsWorld: CANNON.World;
  private activeDebris: ActiveDebris[] = [];

  constructor(scene: THREE.Scene, physicsWorld: CANNON.World) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
  }

  // 1. Shattered Flying Keyboard & Keys (For Credit-Stealer Colleague)
  public spawnKeyboardSmash(origin: THREE.Vector3): void {
    const keyMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
    const keyGeo = new THREE.BoxGeometry(0.08, 0.04, 0.08);

    // Spawn 15 scattered keys
    for (let i = 0; i < 15; i++) {
      const keyMesh = new THREE.Mesh(keyGeo, keyMat);
      keyMesh.position.copy(origin);
      keyMesh.castShadow = true;
      this.scene.add(keyMesh);

      const body = new CANNON.Body({
        mass: 0.1,
        shape: new CANNON.Box(new CANNON.Vec3(0.04, 0.02, 0.04)),
        position: new CANNON.Vec3(
          origin.x + (Math.random() - 0.5) * 0.4,
          origin.y + (Math.random() - 0.5) * 0.4,
          origin.z
        ),
      });

      // Scatter outward
      body.velocity.set(
        (Math.random() - 0.5) * 12,
        4 + Math.random() * 8,
        (Math.random() - 0.5) * 12
      );
      body.angularVelocity.set(
        Math.random() * 20,
        Math.random() * 20,
        Math.random() * 20
      );

      this.physicsWorld.addBody(body);
      this.activeDebris.push({ mesh: keyMesh, body, life: 3.0 });
    }
  }

  // 2. Flying Sweet Box and Rasgullas (For Gossip Neighbor)
  public spawnSweetBoxExplosion(origin: THREE.Vector3): void {
    const rasgullaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const geo = new THREE.SphereGeometry(0.09, 8, 8);

    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(geo, rasgullaMat);
      mesh.position.copy(origin);
      this.scene.add(mesh);

      const body = new CANNON.Body({
        mass: 0.2,
        shape: new CANNON.Sphere(0.09),
        position: new CANNON.Vec3(origin.x, origin.y, origin.z),
      });
      body.velocity.set(
        (Math.random() - 0.5) * 10,
        6 + Math.random() * 6,
        (Math.random() - 0.5) * 10
      );
      this.physicsWorld.addBody(body);
      this.activeDebris.push({ mesh, body, life: 3.0 });
    }
  }

  // 3. Flying Onions & Stamp Papers (For Hoarder / Land Uncle)
  public spawnFlyingOnions(origin: THREE.Vector3): void {
    const onionMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.6 });
    const geo = new THREE.SphereGeometry(0.12, 8, 8);

    for (let i = 0; i < 10; i++) {
      const mesh = new THREE.Mesh(geo, onionMat);
      mesh.position.copy(origin);
      this.scene.add(mesh);

      const body = new CANNON.Body({
        mass: 0.3,
        shape: new CANNON.Sphere(0.12),
        position: new CANNON.Vec3(origin.x, origin.y, origin.z),
      });
      body.velocity.set(
        (Math.random() - 0.5) * 14,
        5 + Math.random() * 7,
        (Math.random() - 0.5) * 14
      );
      this.physicsWorld.addBody(body);
      this.activeDebris.push({ mesh, body, life: 3.5 });
    }
  }

  public update(deltaTime: number): void {
    for (let i = this.activeDebris.length - 1; i >= 0; i--) {
      const item = this.activeDebris[i];
      item.life -= deltaTime;

      if (item.life <= 0) {
        this.scene.remove(item.mesh);
        this.physicsWorld.removeBody(item.body);
        this.activeDebris.splice(i, 1);
      } else {
        item.mesh.position.copy(item.body.position as unknown as THREE.Vector3);
        item.mesh.quaternion.copy(item.body.quaternion as unknown as THREE.Quaternion);
      }
    }
  }
}

