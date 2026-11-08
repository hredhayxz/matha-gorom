import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CharacterTextures } from './CharacterTextures';

export interface RagdollPart {
  mesh: THREE.Mesh | THREE.Group;
  body: CANNON.Body;
  initialOffset: THREE.Vector3;
}

export class Ragdoll {
  public group: THREE.Group;
  public parts: { [key: string]: RagdollPart } = {};
  public headMesh!: THREE.Group;
  public faceMesh!: THREE.Mesh;
  public faceMaterial!: THREE.MeshStandardMaterial;
  public leftEye!: THREE.Mesh;
  public rightEye!: THREE.Mesh;
  public mouthMesh!: THREE.Mesh;
  public isRagdoll: boolean = false;
  public gender: 'male' | 'female' = 'male';
  public characterId: string = 'colleague';

  private scene: THREE.Scene;
  private physicsWorld: CANNON.World;
  private idleTime: number = 0;
  public rootPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Clothing & Skin Colors
  public shirtColor: number = 0x2563eb;
  public pantsColor: number = 0x1e293b;
  public skinColor: number = 0xf5d0b0;
  public hairColor: number = 0x1c1917;

  constructor(
    scene: THREE.Scene,
    physicsWorld: CANNON.World,
    options?: {
      characterId?: string;
      shirtColor?: number;
      pantsColor?: number;
      skinColor?: number;
      hairColor?: number;
      gender?: 'male' | 'female';
    }
  ) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    if (options?.characterId) this.characterId = options.characterId;
    if (options?.shirtColor) this.shirtColor = options.shirtColor;
    if (options?.pantsColor) this.pantsColor = options.pantsColor;
    if (options?.skinColor) this.skinColor = options.skinColor;
    if (options?.hairColor) this.hairColor = options.hairColor;
    if (options?.gender) this.gender = options.gender;

    this.buildFullHumanGraphics();
  }

  // --- Full Human Graphics & Movement (Baper Rasta / Caricature Art Style) ---
  private buildFullHumanGraphics(): void {
    const skinHex = '#' + this.skinColor.toString(16).padStart(6, '0');
    const faceTexture = CharacterTextures.getFaceTexture(this.characterId, skinHex);

    let fabricTexture: THREE.CanvasTexture | null = null;
    if (this.characterId === 'rickshaw') {
      fabricTexture = CharacterTextures.getFabricTexture('lungi');
    } else if (this.characterId === 'neighbor') {
      fabricTexture = CharacterTextures.getFabricTexture('saree');
    } else if (this.characterId === 'boss') {
      fabricTexture = CharacterTextures.getFabricTexture('suit');
    } else if (this.characterId === 'chacha') {
      fabricTexture = CharacterTextures.getFabricTexture('panjabi');
    }

    const skinMat = new THREE.MeshStandardMaterial({
      color: this.skinColor,
      roughness: 0.5,
      metalness: 0.05,
    });
    const clothesMat = new THREE.MeshStandardMaterial({
      color: this.shirtColor,
      map: fabricTexture || null,
      roughness: 0.7,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: this.pantsColor,
      map: (this.characterId === 'rickshaw' ? fabricTexture : null) || null,
      roughness: 0.8,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: this.hairColor,
      roughness: 0.9,
    });

    // 1. Organic Human Torso (Curved Chest, Collar, Tapered Waist)
    const torsoGroup = new THREE.Group();

    // Chest
    const chestGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.55, 16);
    const chest = new THREE.Mesh(chestGeo, clothesMat);
    chest.position.set(0, 0.25, 0);
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Collar
    const collarGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16);
    const collar = new THREE.Mesh(collarGeo, clothesMat);
    collar.position.set(0, 0.52, 0);
    collar.rotation.x = Math.PI / 2;
    torsoGroup.add(collar);

    // Abdomen / Potbelly for Boss / Uncle
    const bellyRadius = (this.characterId === 'boss' || this.characterId === 'chacha') ? 0.38 : 0.32;
    const bellyGeo = new THREE.CylinderGeometry(bellyRadius, 0.34, 0.45, 16);
    const belly = new THREE.Mesh(bellyGeo, clothesMat);
    belly.position.set(0, -0.2, (this.characterId === 'boss' ? 0.06 : 0));
    belly.castShadow = true;
    torsoGroup.add(belly);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.22, 12);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 0.6, 0);
    torsoGroup.add(neck);

    const torsoBody = new CANNON.Body({
      mass: 8,
      shape: new CANNON.Box(new CANNON.Vec3(0.36, 0.5, 0.24)),
      linearDamping: 0.3,
      angularDamping: 0.4,
    });
    torsoBody.position.set(0, 1.45, 0);
    this.parts['torso'] = { mesh: torsoGroup, body: torsoBody, initialOffset: new THREE.Vector3(0, 1.45, 0) };

    // 2. Full Caricature Head with Painted Face Texture
    this.headMesh = new THREE.Group();

    // Head Sphere with dynamic Face Texture map
    const craniumGeo = new THREE.SphereGeometry(0.35, 24, 24);
    this.faceMaterial = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.45,
    });
    this.faceMesh = new THREE.Mesh(craniumGeo, this.faceMaterial);
    this.faceMesh.rotation.y = -Math.PI / 2; // Center face frontwards
    this.faceMesh.castShadow = true;
    this.headMesh.add(this.faceMesh);

    // 3D Sculpted Ears
    const earGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.scale.set(0.6, 1.2, 0.8);
    leftEar.position.set(-0.35, 0, 0);
    this.headMesh.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.scale.set(0.6, 1.2, 0.8);
    rightEar.position.set(0.35, 0, 0);
    this.headMesh.add(rightEar);

    // 3D Sculpted Nose
    const noseGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.scale.set(0.9, 1.1, 1.3);
    nose.position.set(0, -0.02, 0.35);
    this.headMesh.add(nose);

    // Hair Model (Male vs Female)
    if (this.gender === 'female') {
      const hairCapGeo = new THREE.SphereGeometry(0.37, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
      hairCap.position.set(0, 0.06, 0);
      this.headMesh.add(hairCap);

      const bunGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const bun = new THREE.Mesh(bunGeo, hairMat);
      bun.position.set(0, 0.1, -0.36);
      this.headMesh.add(bun);
    } else {
      const hairCapGeo = new THREE.SphereGeometry(0.37, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
      hairCap.position.set(0, 0.08, 0);
      this.headMesh.add(hairCap);

      const swooshGeo = new THREE.BoxGeometry(0.34, 0.08, 0.12);
      const swoosh = new THREE.Mesh(swooshGeo, hairMat);
      swoosh.position.set(0, 0.26, 0.26);
      swoosh.rotation.z = -0.1;
      this.headMesh.add(swoosh);
    }

    const headBody = new CANNON.Body({
      mass: 3,
      shape: new CANNON.Sphere(0.35),
      linearDamping: 0.2,
      angularDamping: 0.3,
    });
    headBody.position.set(0, 2.22, 0);
    this.parts['head'] = { mesh: this.headMesh, body: headBody, initialOffset: new THREE.Vector3(0, 2.22, 0) };

    // 3. Rounded Human Arms with Elbows & Hands
    const leftArmGroup = this.createArm(clothesMat, skinMat);
    const leftArmBody = new CANNON.Body({
      mass: 2,
      shape: new CANNON.Box(new CANNON.Vec3(0.12, 0.36, 0.12)),
    });
    leftArmBody.position.set(-0.55, 1.4, 0);
    this.parts['leftArm'] = { mesh: leftArmGroup, body: leftArmBody, initialOffset: new THREE.Vector3(-0.55, 1.4, 0) };

    const rightArmGroup = this.createArm(clothesMat, skinMat);
    const rightArmBody = new CANNON.Body({
      mass: 2,
      shape: new CANNON.Box(new CANNON.Vec3(0.12, 0.36, 0.12)),
    });
    rightArmBody.position.set(0.55, 1.4, 0);
    this.parts['rightArm'] = { mesh: rightArmGroup, body: rightArmBody, initialOffset: new THREE.Vector3(0.55, 1.4, 0) };

    // 4. Rounded Human Legs with Knee Joints & Footwear
    const leftLegGroup = this.createLeg(pantsMat);
    const leftLegBody = new CANNON.Body({
      mass: 3.5,
      shape: new CANNON.Box(new CANNON.Vec3(0.14, 0.45, 0.14)),
    });
    leftLegBody.position.set(-0.24, 0.52, 0);
    this.parts['leftLeg'] = { mesh: leftLegGroup, body: leftLegBody, initialOffset: new THREE.Vector3(-0.24, 0.52, 0) };

    const rightLegGroup = this.createLeg(pantsMat);
    const rightLegBody = new CANNON.Body({
      mass: 3.5,
      shape: new CANNON.Box(new CANNON.Vec3(0.14, 0.45, 0.14)),
    });
    rightLegBody.position.set(0.24, 0.52, 0);
    this.parts['rightLeg'] = { mesh: rightLegGroup, body: rightLegBody, initialOffset: new THREE.Vector3(0.24, 0.52, 0) };

    // Add meshes & bodies
    Object.keys(this.parts).forEach((key) => {
      const part = this.parts[key];
      this.group.add(part.mesh);
      this.physicsWorld.addBody(part.body);
    });

    // Cannon-es Joints with spring-loaded physical damping
    this.createJoint(torsoBody, headBody, new CANNON.Vec3(0, 0.6, 0), new CANNON.Vec3(0, -0.34, 0));
    this.createJoint(torsoBody, leftArmBody, new CANNON.Vec3(-0.48, 0.38, 0), new CANNON.Vec3(0, 0.34, 0));
    this.createJoint(torsoBody, rightArmBody, new CANNON.Vec3(0.48, 0.38, 0), new CANNON.Vec3(0, 0.34, 0));
    this.createJoint(torsoBody, leftLegBody, new CANNON.Vec3(-0.24, -0.48, 0), new CANNON.Vec3(0, 0.45, 0));
    this.createJoint(torsoBody, rightLegBody, new CANNON.Vec3(0.24, -0.48, 0), new CANNON.Vec3(0, 0.45, 0));

    this.resetToStanding();
  }

  private createArm(clothesMat: THREE.Material, skinMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    // Sleeve / Upper Arm
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.45, 12), clothesMat);
    sleeve.position.set(0, 0.08, 0);
    sleeve.castShadow = true;
    group.add(sleeve);

    // Elbow Joint Sphere
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), skinMat);
    elbow.position.set(0, -0.14, 0);
    group.add(elbow);

    // Forearm & Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), skinMat);
    hand.scale.set(0.9, 1.2, 0.7);
    hand.position.set(0, -0.28, 0);
    hand.castShadow = true;
    group.add(hand);

    return group;
  }

  private createLeg(pantsMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    // Thigh & Calf
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.68, 12), pantsMat);
    leg.position.set(0, 0.1, 0);
    leg.castShadow = true;
    group.add(leg);

    // Knee
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), pantsMat);
    knee.position.set(0, 0.02, 0.04);
    group.add(knee);

    // Shoe / Sandal
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.34), shoeMat);
    shoe.position.set(0, -0.32, 0.06);
    shoe.castShadow = true;
    group.add(shoe);

    return group;
  }

  private createJoint(bodyA: CANNON.Body, bodyB: CANNON.Body, pivotA: CANNON.Vec3, pivotB: CANNON.Vec3): void {
    const constraint = new CANNON.PointToPointConstraint(bodyA, pivotA, bodyB, pivotB, 1e6);
    this.physicsWorld.addConstraint(constraint);
  }

  public resetToStanding(x: number = 0, z: number = 0): void {
    this.isRagdoll = false;
    this.rootPosition.set(x, 0, z);

    Object.keys(this.parts).forEach((key) => {
      const part = this.parts[key];
      part.body.velocity.set(0, 0, 0);
      part.body.angularVelocity.set(0, 0, 0);
      part.body.quaternion.set(0, 0, 0, 1);
      part.body.position.set(
        part.initialOffset.x + x,
        part.initialOffset.y,
        part.initialOffset.z + z
      );
    });
  }

  public applyHitImpulse(
    impulse: CANNON.Vec3,
    point: CANNON.Vec3,
    angularSpin: CANNON.Vec3 = new CANNON.Vec3(10, 5, 0)
  ): void {
    this.isRagdoll = true;
    const torso = this.parts['torso'].body;
    const head = this.parts['head'].body;

    head.applyImpulse(impulse, point);
    torso.applyImpulse(
      new CANNON.Vec3(impulse.x * 0.75, impulse.y * 0.85, impulse.z * 0.75),
      torso.position
    );

    head.angularVelocity.vadd(angularSpin, head.angularVelocity);
    torso.angularVelocity.vadd(angularSpin.scale(0.8), torso.angularVelocity);
  }

  // --- Living Human Animation: Breathing, Head Tracking & Idle Gestures ---
  public update(deltaTime: number): void {
    if (!this.isRagdoll) {
      this.idleTime += deltaTime * 3.5;
      const breathing = Math.sin(this.idleTime) * 0.038;
      const sway = Math.cos(this.idleTime * 0.5) * 0.028;

      const torso = this.parts['torso'];
      torso.body.position.set(
        this.rootPosition.x + sway,
        torso.initialOffset.y + breathing,
        this.rootPosition.z
      );
      torso.body.velocity.set(0, 0, 0);

      // Living Head Motion with slight expressive tilt
      const head = this.parts['head'];
      head.body.position.set(
        this.rootPosition.x + sway * 1.3,
        head.initialOffset.y + breathing * 1.25,
        this.rootPosition.z
      );
      head.body.velocity.set(0, 0, 0);

      // Dynamic Arm Talking Gestures
      const leftArm = this.parts['leftArm'];
      const armSway = Math.sin(this.idleTime * 0.8) * 0.05;
      leftArm.body.position.set(
        this.rootPosition.x + leftArm.initialOffset.x + sway * 0.8,
        leftArm.initialOffset.y + breathing + armSway,
        this.rootPosition.z
      );

      const rightArm = this.parts['rightArm'];
      rightArm.body.position.set(
        this.rootPosition.x + rightArm.initialOffset.x + sway * 0.8,
        rightArm.initialOffset.y + breathing - armSway,
        this.rootPosition.z
      );

      // Feet planted with natural weight shifting
      const leftLeg = this.parts['leftLeg'];
      leftLeg.body.position.set(
        this.rootPosition.x + leftLeg.initialOffset.x,
        leftLeg.initialOffset.y,
        this.rootPosition.z
      );
      const rightLeg = this.parts['rightLeg'];
      rightLeg.body.position.set(
        this.rootPosition.x + rightLeg.initialOffset.x,
        rightLeg.initialOffset.y,
        this.rootPosition.z
      );
    }

    // Synchronize Three.js visual meshes with Cannon-es physics bodies
    Object.keys(this.parts).forEach((key) => {
      const part = this.parts[key];
      part.mesh.position.copy(part.body.position as unknown as THREE.Vector3);
      part.mesh.quaternion.copy(part.body.quaternion as unknown as THREE.Quaternion);
    });
  }

  public setFaceTexture(texture: THREE.CanvasTexture): void {
    this.faceMaterial.map = texture;
    this.faceMaterial.needsUpdate = true;
  }

  public destroy(): void {
    Object.keys(this.parts).forEach((key) => {
      const part = this.parts[key];
      this.group.remove(part.mesh);
      this.physicsWorld.removeBody(part.body);
    });
    this.scene.remove(this.group);
  }
}
