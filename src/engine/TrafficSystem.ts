import * as THREE from 'three';

interface MovingVehicle {
  mesh: THREE.Group;
  speed: number;
  laneX: number;
  dirZ: number; // 1 or -1
  type: 'bus' | 'rickshaw' | 'cng';
}

interface Pedestrian {
  mesh: THREE.Group;
  speed: number;
  sideX: number;
  dirZ: number;
  animTime: number;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
}

export interface LiveCrimeEvent {
  characterId: string;
  title: string;
  crimeDescription: string;
  locationName: string;
}

export class TrafficSystem {
  private scene: THREE.Scene;
  private vehicles: MovingVehicle[] = [];
  private pedestrians: Pedestrian[] = [];
  private trafficGroup: THREE.Group;
  private lastHonkTime: number = 0;
  public onHonkTriggered: ((type: 'bus' | 'rickshaw') => void) | null = null;
  public onCrimeTriggered: ((crime: LiveCrimeEvent) => void) | null = null;

  // Live Crime Events pool
  private liveCrimePool: LiveCrimeEvent[] = [
    {
      characterId: 'rickshaw',
      title: '🚨 হাইওয়েতে উল্টো লেইনে অটো!',
      crimeDescription: 'মহাসড়কে উল্টো লেইন দিয়ে তীব্র গতিতে ঢুকে জ্যাম লাগাচ্ছে!',
      locationName: 'মেইন রোড ডিভাইডার',
    },
    {
      characterId: 'extortionist',
      title: '🚨 টং দোকানে চাঁদা দাবি!',
      crimeDescription: 'মামার চায়ের দোকানে এসে হুমকি দিয়ে চাঁদা দাবি করছে!',
      locationName: 'মামার টং দোকান',
    },
    {
      characterId: 'manager',
      title: '🚨 শুক্রবার রাতে উইকেন্ড মিটিং!',
      crimeDescription: 'শুক্রবার রাত ১১টায় সবার ছুটি বাতিল করে ৫ মিনিটের মিটিং ডাকছে!',
      locationName: 'প্রেস ক্লাবের মোড়',
    },
    {
      characterId: 'colleague',
      title: '🚨 কোড ক্রেডিট চুরি!',
      crimeDescription: 'আপনার সারা রাতের করা ফিচার নিজের নামে প্রেজেন্টেশন দিচ্ছে!',
      locationName: 'বাস স্টপ',
    },
    {
      characterId: 'syndicate',
      title: '🚨 পেঁয়াজ-ডিমের সিন্ডিকেট মজুত!',
      crimeDescription: 'গুদামে হাজার বস্তা পেঁয়াজ লুকিয়ে বাজারে কৃত্রিম সংকট তৈরি করেছে!',
      locationName: 'আড়তের মোড়',
    },
    {
      characterId: 'boss',
      title: '🚨 বাৎসরিক ইনক্রিমেন্ট আটকানো!',
      crimeDescription: 'কোম্পানি প্রফিটে থাকলেও কর্মচারীদের বোনাস ও ইনক্রিমেন্ট বাতিল করেছে!',
      locationName: 'ফ্লাইওভারের নিচে',
    },
  ];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.trafficGroup = new THREE.Group();
    this.scene.add(this.trafficGroup);

    this.spawnVehicles();
    this.spawnPedestrians();
    this.startCrimeLoop();
  }

  // --- 1. Moving Vehicles (Buses, Auto-Rickshaws, CNGs) ---
  private spawnVehicles(): void {
    // Left Lane (Going Forward, dirZ = 1)
    const bus1 = this.createLocalBus(0x0284c7);
    bus1.position.set(-2.4, 0, -28);
    this.trafficGroup.add(bus1);
    this.vehicles.push({ mesh: bus1, speed: 7.5, laneX: -2.4, dirZ: 1, type: 'bus' });

    const cng1 = this.createCNG();
    cng1.position.set(-2.4, 0, 10);
    this.trafficGroup.add(cng1);
    this.vehicles.push({ mesh: cng1, speed: 6.0, laneX: -2.4, dirZ: 1, type: 'cng' });

    // Right Lane (Going Backward, dirZ = -1)
    const rickshaw1 = this.createAutoRickshaw();
    rickshaw1.position.set(2.4, 0, 25);
    rickshaw1.rotation.y = Math.PI;
    this.trafficGroup.add(rickshaw1);
    this.vehicles.push({ mesh: rickshaw1, speed: 5.5, laneX: 2.4, dirZ: -1, type: 'rickshaw' });

    const bus2 = this.createLocalBus(0x16a34a);
    bus2.position.set(2.4, 0, -5);
    bus2.rotation.y = Math.PI;
    this.trafficGroup.add(bus2);
    this.vehicles.push({ mesh: bus2, speed: 7.0, laneX: 2.4, dirZ: -1, type: 'bus' });
  }

  // --- 2. Moving Sidewalk Pedestrians ---
  private spawnPedestrians(): void {
    const pedestrianColors = [0xef4444, 0x3b82f6, 0x10b981, 0x8b5cf6, 0xf59e0b];
    for (let i = 0; i < 6; i++) {
      const isLeftSide = i % 2 === 0;
      const x = isLeftSide ? -7.5 + (Math.random() - 0.5) * 0.8 : 7.5 + (Math.random() - 0.5) * 0.8;
      const dirZ = isLeftSide ? 1 : -1;
      const startZ = -25 + (i * 10) + Math.random() * 4;

      const { group, leftLeg, rightLeg } = this.createPedestrianMesh(pedestrianColors[i % pedestrianColors.length]);
      group.position.set(x, 0, startZ);
      if (dirZ === -1) group.rotation.y = Math.PI;

      this.trafficGroup.add(group);
      this.pedestrians.push({
        mesh: group,
        speed: 1.4 + Math.random() * 0.8,
        sideX: x,
        dirZ,
        animTime: Math.random() * 10,
        leftLeg,
        rightLeg,
      });
    }
  }

  // --- 3. Live Crime Event System ---
  private startCrimeLoop(): void {
    setInterval(() => {
      // Pick random crime from pool
      const crime = this.liveCrimePool[Math.floor(Math.random() * this.liveCrimePool.length)];
      if (this.onCrimeTriggered) {
        this.onCrimeTriggered(crime);
      }
    }, 14000); // Crime alert every 14 seconds
  }

  // --- Update Loop for 60 FPS Traffic ---
  public update(deltaTime: number): void {
    // 1. Move vehicles
    this.vehicles.forEach((v) => {
      v.mesh.position.z += v.dirZ * v.speed * deltaTime;

      // Wrap around road bounds
      if (v.dirZ === 1 && v.mesh.position.z > 35) {
        v.mesh.position.z = -35;
      } else if (v.dirZ === -1 && v.mesh.position.z < -35) {
        v.mesh.position.z = 35;
      }
    });

    // 2. Animate and move pedestrians
    this.pedestrians.forEach((p) => {
      p.mesh.position.z += p.dirZ * p.speed * deltaTime;
      p.animTime += deltaTime * 6.0;

      // Natural leg walk swing
      p.leftLeg.rotation.x = Math.sin(p.animTime) * 0.45;
      p.rightLeg.rotation.x = -Math.sin(p.animTime) * 0.45;

      // Wrap around
      if (p.dirZ === 1 && p.mesh.position.z > 32) {
        p.mesh.position.z = -32;
      } else if (p.dirZ === -1 && p.mesh.position.z < -32) {
        p.mesh.position.z = 32;
      }
    });

    // 3. Periodic realistic vehicle honk
    const now = performance.now();
    if (now - this.lastHonkTime > 5000 + Math.random() * 6000) {
      this.lastHonkTime = now;
      if (this.onHonkTriggered) {
        const type = Math.random() > 0.4 ? 'bus' : 'rickshaw';
        this.onHonkTriggered(type);
      }
    }
  }

  // Helpers: Procedural Vehicle & Pedestrian Meshes
  private createLocalBus(mainColor: number): THREE.Group {
    const bus = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.6 });
    const busMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 5.5), bodyMat);
    busMesh.position.set(0, 1.4, 0);
    busMesh.castShadow = true;
    bus.add(busMesh);

    // Yellow side stripe
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.25, 5.52), stripeMat);
    stripe.position.set(0, 1.4, 0);
    bus.add(stripe);

    // Front headlights
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const leftLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), lightMat);
    leftLight.position.set(-0.8, 0.8, 2.76);
    bus.add(leftLight);

    const rightLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), lightMat);
    rightLight.position.set(0.8, 0.8, 2.76);
    bus.add(rightLight);

    // Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12);
    [[-1.05, 0.42, 1.6], [1.05, 0.42, 1.6], [-1.05, 0.42, -1.6], [1.05, 0.42, -1.6]].forEach(([x, y, z]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, y, z);
      bus.add(w);
    });

    return bus;
  }

  private createAutoRickshaw(): THREE.Group {
    const rickshaw = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.2, 1.7), bodyMat);
    cabin.position.set(0, 1.0, 0);
    cabin.castShadow = true;
    rickshaw.add(cabin);

    const yellowRoof = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 2.0), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
    yellowRoof.position.set(0, 1.65, 0);
    rickshaw.add(yellowRoof);

    return rickshaw;
  }

  private createCNG(): THREE.Group {
    const cng = new THREE.Group();
    // Green baby-taxi CNG auto-rickshaw
    const cngMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 1.8), cngMat);
    body.position.set(0, 0.95, 0);
    body.castShadow = true;
    cng.add(body);

    // Front slant windshield
    const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.1), winMat);
    win.position.set(0, 1.2, 0.8);
    win.rotation.x = -0.3;
    cng.add(win);

    return cng;
  }

  private createPedestrianMesh(shirtColor: number): {
    group: THREE.Group;
    leftLeg: THREE.Mesh;
    rightLeg: THREE.Mesh;
  } {
    const group = new THREE.Group();
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5d0b0 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.22), shirtMat);
    torso.position.set(0, 0.85, 0);
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), skinMat);
    head.position.set(0, 1.25, 0);
    group.add(head);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.1, 0.3, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.1, 0.3, 0);
    group.add(rightLeg);

    return { group, leftLeg, rightLeg };
  }
}
