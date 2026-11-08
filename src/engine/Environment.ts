import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Environment {
  public group: THREE.Group;
  private scene: THREE.Scene;
  private physicsWorld: CANNON.World;

  constructor(scene: THREE.Scene, physicsWorld: CANNON.World) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.buildRoadAndSidewalk();
    this.buildDrain();
    this.buildFlyover();
    this.buildElectricWires();
    this.buildBengaliSignboards();
    this.buildTeaStall();
    this.buildWasteBins();
    this.buildMurirTinBus();
    this.buildAutoRickshaw();
    this.buildRoadsideBarriers();
  }

  // --- 1. Road, Curbs & Zebra Crossing ---
  private buildRoadAndSidewalk(): void {
    // Road surface
    const roadGeo = new THREE.PlaneGeometry(16, 60);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x242426,
      roughness: 0.9,
      metalness: 0.1,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, 0);
    road.receiveShadow = true;
    this.group.add(road);

    // Zebra crossing
    for (let i = -6; i <= 6; i += 1.5) {
      const stripeGeo = new THREE.PlaneGeometry(0.8, 4);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(i, 0.01, 1);
      this.group.add(stripe);
    }

    // Yellow center dashed lane
    for (let z = -28; z <= 28; z += 4) {
      const dashGeo = new THREE.PlaneGeometry(0.25, 2.2);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.01, z);
      this.group.add(dash);
    }

    // Yellow-Black Dhaka curb dividers on both sides
    const curbTexture = this.generateCurbTexture();
    const curbGeo = new THREE.BoxGeometry(0.4, 0.35, 60);
    const curbMat = new THREE.MeshStandardMaterial({
      map: curbTexture,
      roughness: 0.8,
    });

    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-5, 0.175, 0);
    leftCurb.receiveShadow = true;
    leftCurb.castShadow = true;
    this.group.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, curbMat);
    rightCurb.position.set(5, 0.175, 0);
    rightCurb.receiveShadow = true;
    rightCurb.castShadow = true;
    this.group.add(rightCurb);

    // Left Sidewalk
    const sideWalkGeo = new THREE.BoxGeometry(6, 0.3, 60);
    const sideWalkMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.95,
    });
    const leftSidewalk = new THREE.Mesh(sideWalkGeo, sideWalkMat);
    leftSidewalk.position.set(-8.2, 0.15, 0);
    leftSidewalk.receiveShadow = true;
    this.group.add(leftSidewalk);

    // Right Sidewalk
    const rightSidewalk = new THREE.Mesh(sideWalkGeo, sideWalkMat);
    rightSidewalk.position.set(8.2, 0.15, 0);
    rightSidewalk.receiveShadow = true;
    this.group.add(rightSidewalk);
  }

  // --- 2. Open Roadside Drain (ড্রেন) ---
  private buildDrain(): void {
    // Open concrete ditch on right side (x: 4.5 to 5.5)
    const drainWidth = 1.2;
    const drainDepth = 0.6;
    const drainLength = 30;

    // Drain concrete cavity
    const drainWallMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      roughness: 0.9,
    });
    
    // Sloped concrete drain bed
    const drainBedGeo = new THREE.BoxGeometry(drainWidth, 0.1, drainLength);
    const drainBed = new THREE.Mesh(drainBedGeo, drainWallMat);
    drainBed.position.set(5.8, -drainDepth, 0);
    drainBed.receiveShadow = true;
    this.group.add(drainBed);

    // Dark drain water
    const waterGeo = new THREE.PlaneGeometry(drainWidth * 0.9, drainLength);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.1,
      metalness: 0.8,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(5.8, -drainDepth + 0.15, 0);
    this.group.add(water);

    // Broken / shifted drain slab covers (classic Dhaka open roadside hazard)
    for (let z = -12; z <= 12; z += 3.5) {
      if (Math.abs(z) === 3.5) continue; // Leave an open gap to fall into!
      const slabGeo = new THREE.BoxGeometry(drainWidth * 1.1, 0.12, 1.8);
      const slab = new THREE.Mesh(slabGeo, drainWallMat);
      slab.position.set(5.8, 0.2, z);
      slab.rotation.y = (Math.random() - 0.5) * 0.15;
      slab.castShadow = true;
      slab.receiveShadow = true;
      this.group.add(slab);

      // Add static cannon box for solid slabs
      const slabBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(drainWidth * 0.55, 0.06, 0.9)),
      });
      slabBody.position.set(5.8, 0.2, z);
      this.physicsWorld.addBody(slabBody);
    }
  }

  // --- 3. Mayor Hanif Flyover Concrete Pillars & Overhead Ramp ---
  private buildFlyover(): void {
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.95,
      metalness: 0.05,
    });

    // Massive concrete pillars
    const pillarPositions = [-18, 0, 18];
    pillarPositions.forEach((z) => {
      // Hexagonal pillar
      const pillarGeo = new THREE.CylinderGeometry(1.4, 1.6, 11, 8);
      const pillar = new THREE.Mesh(pillarGeo, concreteMat);
      pillar.position.set(0, 5.5, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.group.add(pillar);

      // Pillar head cap (T-shape bridge support beam)
      const capGeo = new THREE.BoxGeometry(14, 1.5, 3.5);
      const cap = new THREE.Mesh(capGeo, concreteMat);
      cap.position.set(0, 10.7, z);
      cap.castShadow = true;
      this.group.add(cap);

      // Physics collision for central pillar
      const pillarBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Cylinder(1.4, 1.6, 11, 8),
      });
      pillarBody.position.set(0, 5.5, z);
      this.physicsWorld.addBody(pillarBody);
    });

    // Elevated flyover deck spanning across z
    const deckGeo = new THREE.BoxGeometry(13.5, 1.4, 60);
    const deck = new THREE.Mesh(deckGeo, concreteMat);
    deck.position.set(0, 12, 0);
    deck.castShadow = true;
    this.group.add(deck);

    // Flyover safety guard rails (blue/white)
    const railMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const leftRailGeo = new THREE.BoxGeometry(0.3, 1.2, 60);
    const leftRail = new THREE.Mesh(leftRailGeo, railMat);
    leftRail.position.set(-6.6, 13.3, 0);
    this.group.add(leftRail);

    const rightRail = new THREE.Mesh(leftRailGeo, railMat);
    rightRail.position.set(6.6, 13.3, 0);
    this.group.add(rightRail);
  }

  // --- 4. Dangling Electric Wire Nests (Dhaka Street Wire Chaos) ---
  private buildElectricWires(): void {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0x111827, linewidth: 2 });

    // Street light / electric poles
    const poleZ = [-14, 14];
    poleZ.forEach((z) => {
      const poleGeo = new THREE.CylinderGeometry(0.18, 0.22, 9, 8);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(-5.6, 4.5, z);
      pole.castShadow = true;
      this.group.add(pole);

      // Transformer box on pole
      const boxGeo = new THREE.BoxGeometry(0.9, 1.3, 0.8);
      const box = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0x64748b }));
      box.position.set(-5.6, 6.5, z);
      this.group.add(box);
    });

    // Dangling wires with catenary sagging curves
    for (let i = 0; i < 7; i++) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-5.6, 8 + Math.sin(i) * 0.4, -14),
        new THREE.Vector3(-5.2 + (i % 3) * 0.4, 5.5 - (i * 0.2), 0),
        new THREE.Vector3(-5.6, 8 + Math.cos(i) * 0.4, 14)
      );
      const points = curve.getPoints(24);
      const wireGeo = new THREE.BufferGeometry().setFromPoints(points);
      const wireLine = new THREE.Line(wireGeo, wireMat);
      this.group.add(wireLine);
    }
  }

  // --- 5. Bengali Signboards ("বিরিয়ানি হাউস", "টং দোকান", "প্রেস ক্লাব", "নো পার্কিং") ---
  private buildBengaliSignboards(): void {
    // 1. হাজী বিরিয়ানি হাউস
    const biryaniTex = this.generateBengaliTextTexture(
      'হাজী বিরিয়ানি হাউস',
      'খাসির কাচ্চি ও স্পেশাল বোরহানি',
      '#991b1b',
      '#fef08a'
    );
    const biryaniBoard = this.createBoardMesh(biryaniTex, 3.2, 1.2);
    biryaniBoard.position.set(-7.5, 3.2, -4);
    biryaniBoard.rotation.y = Math.PI / 2;
    this.group.add(biryaniBoard);

    // 2. মামার টং দোকান
    const tongTex = this.generateBengaliTextTexture(
      'মামার স্পেশাল টং দোকান',
      'গরম চা, টোস্ট ও বিস্কুট',
      '#065f46',
      '#ffffff'
    );
    const tongBoard = this.createBoardMesh(tongTex, 2.6, 1.0);
    tongBoard.position.set(-7.5, 2.8, 4);
    tongBoard.rotation.y = Math.PI / 2;
    this.group.add(tongBoard);

    // 3. ঢাকা প্রেস ক্লাব
    const pressTex = this.generateBengaliTextTexture(
      'ঢাকা প্রেস ক্লাব',
      'গণমাধ্যম ও সাংবাদিক ভবন',
      '#1e3a8a',
      '#ffffff'
    );
    const pressBoard = this.createBoardMesh(pressTex, 3.0, 1.1);
    pressBoard.position.set(7.5, 3.5, -6);
    pressBoard.rotation.y = -Math.PI / 2;
    this.group.add(pressBoard);

    // 4. নো পার্কিং Sign
    const noParkingTex = this.generateNoParkingTexture();
    const noParkingGeo = new THREE.CircleGeometry(0.5, 32);
    const noParkingMat = new THREE.MeshBasicMaterial({ map: noParkingTex, side: THREE.DoubleSide });
    const noParkingMesh = new THREE.Mesh(noParkingGeo, noParkingMat);
    noParkingMesh.position.set(5.2, 2.2, 3);
    noParkingMesh.rotation.y = -Math.PI / 2;
    this.group.add(noParkingMesh);

    // Signpost
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(5.2, 1.1, 3);
    this.group.add(post);
  }

  // --- 6. Wooden Tea Stall (টং দোকান) with Aluminum Kettle ---
  private buildTeaStall(): void {
    const stallGroup = new THREE.Group();
    stallGroup.position.set(-7.2, 0.3, 4);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
    
    // Low table counter
    const counterGeo = new THREE.BoxGeometry(2.0, 0.9, 0.9);
    const counter = new THREE.Mesh(counterGeo, woodMat);
    counter.position.set(0, 0.45, 0);
    counter.castShadow = true;
    stallGroup.add(counter);

    // Wooden tea stall bench
    const benchGeo = new THREE.BoxGeometry(2.2, 0.45, 0.4);
    const bench = new THREE.Mesh(benchGeo, woodMat);
    bench.position.set(0, 0.22, 1.1);
    bench.castShadow = true;
    stallGroup.add(bench);

    // Dhaka Aluminum Kettle (কেটলি)
    const alumMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.25,
    });
    const kettleBodyGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.35, 16);
    const kettle = new THREE.Mesh(kettleBodyGeo, alumMat);
    kettle.position.set(-0.5, 1.08, 0);
    kettle.castShadow = true;
    stallGroup.add(kettle);

    // Kettle spout
    const spoutGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.22, 8);
    const spout = new THREE.Mesh(spoutGeo, alumMat);
    spout.position.set(-0.32, 1.14, 0);
    spout.rotation.z = -Math.PI / 4;
    stallGroup.add(spout);

    // Tea glasses
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.8,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
    });
    for (let i = 0; i < 3; i++) {
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.1, 8), glassMat);
      glass.position.set(0.1 + i * 0.12, 0.95, 0.1);
      stallGroup.add(glass);
    }

    this.group.add(stallGroup);

    // Physics collider for stall counter
    const counterBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(1.0, 0.45, 0.45)),
    });
    counterBody.position.set(-7.2, 0.75, 4);
    this.physicsWorld.addBody(counterBody);
  }

  // --- 7. Roadside Green Waste Bins (Dhaka City Corporation Dustbin) ---
  private buildWasteBins(): void {
    const binGroup = new THREE.Group();
    binGroup.position.set(-5.6, 0.3, -2);

    const binMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Green Dhaka municipality bin
      roughness: 0.7,
      metalness: 0.2,
    });

    const binGeo = new THREE.BoxGeometry(0.9, 1.1, 0.8);
    const bin = new THREE.Mesh(binGeo, binMat);
    bin.position.set(0, 0.55, 0);
    bin.castShadow = true;
    binGroup.add(bin);

    // Lid
    const lidGeo = new THREE.BoxGeometry(0.95, 0.1, 0.85);
    const lid = new THREE.Mesh(lidGeo, new THREE.MeshStandardMaterial({ color: 0x166534 }));
    lid.position.set(0, 1.15, 0);
    lid.rotation.x = 0.2;
    binGroup.add(lid);

    this.group.add(binGroup);

    // Physics body for waste bin
    const binBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(0.45, 0.55, 0.4)),
    });
    binBody.position.set(-5.6, 0.85, -2);
    this.physicsWorld.addBody(binBody);
  }

  // --- 8. Low-Poly "মুড়ির টিন" Dhaka Local Bus ---
  private buildMurirTinBus(): void {
    const busGroup = new THREE.Group();
    busGroup.position.set(-2.5, 0, -10);

    // Vintage battered body
    const busBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant blue with yellow highlights
      roughness: 0.6,
    });
    const busBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 6.2), busBodyMat);
    busBody.position.set(0, 1.5, 0);
    busBody.castShadow = true;
    busGroup.add(busBody);

    // Yellow stripe along bus side
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.3, 6.21), stripeMat);
    stripe1.position.set(0, 1.5, 0);
    busGroup.add(stripe1);

    // Roof Luggage Carrier with sacks
    const roofRackMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.3, 4.5), roofRackMat);
    rack.position.set(0, 2.7, -0.3);
    busGroup.add(rack);

    // Sacks on roof (burlap bags)
    const sackMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    for (let s = -1; s <= 1; s += 0.9) {
      const sack = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), sackMat);
      sack.scale.set(1.1, 0.6, 1.4);
      sack.position.set(s * 0.5, 3.0, s);
      busGroup.add(sack);
    }

    // Bus Windows
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
    });
    for (let w = -2.0; w <= 2.0; w += 0.9) {
      const leftWin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.6), winMat);
      leftWin.position.set(-1.21, 1.8, w);
      busGroup.add(leftWin);

      const rightWin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.6), winMat);
      rightWin.position.set(1.21, 1.8, w);
      busGroup.add(rightWin);
    }

    // Front windshield
    const frontWindshield = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.05), winMat);
    frontWindshield.position.set(0, 1.8, 3.11);
    busGroup.add(frontWindshield);

    // Wheels (4 wheels)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 16);
    const wheelPositions = [
      [-1.15, 0.48, 1.8],
      [1.15, 0.48, 1.8],
      [-1.15, 0.48, -1.8],
      [1.15, 0.48, -1.8],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      busGroup.add(wheel);
    });

    this.group.add(busGroup);

    // Physics bounds for parked bus
    const busBodyPhysics = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(1.2, 1.1, 3.1)),
    });
    busBodyPhysics.position.set(-2.5, 1.5, -10);
    this.physicsWorld.addBody(busBodyPhysics);
  }

  // --- 9. Battery Auto-Rickshaw (ইজিবাইক / টমটম) ---
  private buildAutoRickshaw(): void {
    const rickshawGroup = new THREE.Group();
    rickshawGroup.position.set(2.6, 0, 8);
    rickshawGroup.rotation.y = Math.PI * 0.95;

    // Green tin cabin
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 1.8), cabinMat);
    cabin.position.set(0, 1.1, -0.2);
    cabin.castShadow = true;
    rickshawGroup.add(cabin);

    // Yellow roof canopy
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 2.2), roofMat);
    roof.position.set(0, 1.8, 0);
    rickshawGroup.add(roof);

    // Front fork & handlebar
    const forkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1), forkMat);
    fork.position.set(0, 0.7, 0.9);
    fork.rotation.x = 0.25;
    rickshawGroup.add(fork);

    // Wheels (3 wheels)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 16);

    // Front wheel
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.3, 1.1);
    rickshawGroup.add(frontWheel);

    // Rear wheels
    const rearLeft = new THREE.Mesh(wheelGeo, wheelMat);
    rearLeft.rotation.z = Math.PI / 2;
    rearLeft.position.set(-0.72, 0.3, -0.6);
    rickshawGroup.add(rearLeft);

    const rearRight = new THREE.Mesh(wheelGeo, wheelMat);
    rearRight.rotation.z = Math.PI / 2;
    rearRight.position.set(0.72, 0.3, -0.6);
    rickshawGroup.add(rearRight);

    this.group.add(rickshawGroup);

    // Physics
    const rickshawBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(0.7, 0.8, 1.1)),
    });
    rickshawBody.position.set(2.6, 0.8, 8);
    this.physicsWorld.addBody(rickshawBody);
  }

  // --- 10. Roadside Red & White Barriers ---
  private buildRoadsideBarriers(): void {
    const barrierTex = this.generateCurbTexture();
    const barrierGeo = new THREE.BoxGeometry(2.5, 0.7, 0.35);
    const barrierMat = new THREE.MeshStandardMaterial({ map: barrierTex });

    const barrier1 = new THREE.Mesh(barrierGeo, barrierMat);
    barrier1.position.set(-3.5, 0.35, 12);
    barrier1.castShadow = true;
    this.group.add(barrier1);

    const barrierBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Box(new CANNON.Vec3(1.25, 0.35, 0.175)),
    });
    barrierBody.position.set(-3.5, 0.35, 12);
    this.physicsWorld.addBody(barrierBody);
  }

  // --- Helpers for Procedural Textures ---
  private generateCurbTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    const stripeWidth = 32;
    for (let x = 0; x < canvas.width; x += stripeWidth) {
      ctx.fillStyle = (x / stripeWidth) % 2 === 0 ? '#facc15' : '#18181b';
      ctx.fillRect(x, 0, stripeWidth, canvas.height);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 1);
    return texture;
  }

  private generateBengaliTextTexture(
    title: string,
    subtitle: string,
    bgColor: string,
    textColor: string
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    const ctx = canvas.getContext('2d')!;

    // Board background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Title
    ctx.fillStyle = textColor;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, canvas.width / 2, 70);

    // Subtitle
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(subtitle, canvas.width / 2, 130);

    return new THREE.CanvasTexture(canvas);
  }

  private generateNoParkingTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // White circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    // Red outer ring
    ctx.lineWidth = 26;
    ctx.strokeStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.stroke();

    // Blue inner circle
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.arc(128, 128, 97, 0, Math.PI * 2);
    ctx.fill();

    // Red diagonal slash
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(56, 56);
    ctx.lineTo(200, 200);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  private createBoardMesh(texture: THREE.CanvasTexture, width: number, height: number): THREE.Mesh {
    const geo = new THREE.BoxGeometry(width, height, 0.1);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }
}
