import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CharacterTextures } from './CharacterTextures';

export interface RagdollPart {
  mesh: THREE.Group | THREE.Mesh;
  body: CANNON.Body;
  initialOffset: THREE.Vector3;
}

export type HumanAnimState = 'idle' | 'walk' | 'taunt' | 'stagger' | 'ragdoll';

export class Ragdoll {
  public group: THREE.Group;
  public parts: { [key: string]: RagdollPart } = {};
  public headMesh!: THREE.Group;
  public faceMesh!: THREE.Mesh;
  public faceMaterial!: THREE.MeshStandardMaterial;
  public isRagdoll: boolean = false;
  public gender: 'male' | 'female' = 'male';
  public characterId: string = 'colleague';

  // Movement & Animation State
  public animState: HumanAnimState = 'idle';
  private animTime: number = 0;
  private walkDir: number = 1;
  private walkTargetX: number = 0;
  private staggerTimer: number = 0;

  // Limb references for smooth organic movement
  private leftArmGroup!: THREE.Group;
  private rightArmGroup!: THREE.Group;
  private leftLegGroup!: THREE.Group;
  private rightLegGroup!: THREE.Group;
  private torsoMeshGroup!: THREE.Group;

  private scene: THREE.Scene;
  private physicsWorld: CANNON.World;
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

    this.buildBaperRastaStyleHuman();
  }

  // --- Baper Rasta Style Organic Cartoon Human Character ---
  private buildBaperRastaStyleHuman(): void {
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
      roughness: 0.65,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: this.pantsColor,
      map: (this.characterId === 'rickshaw' ? fabricTexture : null) || null,
      roughness: 0.75,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: this.hairColor,
      roughness: 0.9,
    });

    // 1. Organic Torso with Seamless Shoulders & Pelvis
    this.torsoMeshGroup = new THREE.Group();

    // Chest & Upper Body (Organic curved cylinder)
    const chestGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.55, 20);
    const chest = new THREE.Mesh(chestGeo, clothesMat);
    chest.position.set(0, 0.22, 0);
    chest.castShadow = true;
    this.torsoMeshGroup.add(chest);
    this.addOutline(chest, 0.02);

    // Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.045, 10, 20), clothesMat);
    collar.position.set(0, 0.5, 0);
    collar.rotation.x = Math.PI / 2;
    this.torsoMeshGroup.add(collar);

    // Belly & Waist (Potbelly for boss/uncle, tapered for youth, saree blouse for auntie)
    const bellyRadius = (this.characterId === 'boss' || this.characterId === 'chacha') ? 0.42 : 0.33;
    const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.32, bellyRadius, 0.42, 20), clothesMat);
    belly.position.set(0, -0.2, this.characterId === 'boss' ? 0.08 : 0);
    belly.castShadow = true;
    this.torsoMeshGroup.add(belly);
    this.addOutline(belly, 0.02);

    // Pelvis / Hips (Connects seamlessly to legs)
    const pelvisGeo = new THREE.SphereGeometry(0.34, 16, 16);
    const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvis.position.set(0, -0.42, 0);
    pelvis.scale.set(1.1, 0.7, 0.85);
    pelvis.castShadow = true;
    this.torsoMeshGroup.add(pelvis);
    this.addOutline(pelvis, 0.02);

    // Smooth Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.24, 16), skinMat);
    neck.position.set(0, 0.58, 0);
    this.torsoMeshGroup.add(neck);

    const torsoBody = new CANNON.Body({
      mass: 8,
      shape: new CANNON.Box(new CANNON.Vec3(0.38, 0.52, 0.26)),
      linearDamping: 0.3,
      angularDamping: 0.4,
    });
    torsoBody.position.set(0, 1.45, 0);
    this.parts['torso'] = { mesh: this.torsoMeshGroup, body: torsoBody, initialOffset: new THREE.Vector3(0, 1.45, 0) };

    // 2. Sculpted Expressive Caricature Head with Rickshaw Art Face
    this.headMesh = new THREE.Group();

    // Head Sphere with dynamic Face Texture map
    const craniumGeo = new THREE.SphereGeometry(0.36, 32, 32);
    this.faceMaterial = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.4,
    });
    this.faceMesh = new THREE.Mesh(craniumGeo, this.faceMaterial);
    this.faceMesh.rotation.y = -Math.PI / 2;
    this.faceMesh.castShadow = true;
    this.headMesh.add(this.faceMesh);
    this.addOutline(this.faceMesh, 0.022);

    // 3D Sculpted Ears with Earlobes
    const earGeo = new THREE.SphereGeometry(0.085, 16, 16);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.scale.set(0.55, 1.25, 0.85);
    leftEar.position.set(-0.36, 0, 0);
    this.headMesh.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.scale.set(0.55, 1.25, 0.85);
    rightEar.position.set(0.36, 0, 0);
    this.headMesh.add(rightEar);

    // 3D Sculpted Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), skinMat);
    nose.scale.set(0.9, 1.15, 1.35);
    nose.position.set(0, -0.02, 0.36);
    this.headMesh.add(nose);

    // Hair Styling (Male vs Female)
    if (this.gender === 'female') {
      const hairCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairMat
      );
      hairCap.position.set(0, 0.06, 0);
      this.headMesh.add(hairCap);

      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), hairMat);
      bun.position.set(0, 0.1, -0.36);
      this.headMesh.add(bun);
    } else {
      const hairCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.52),
        hairMat
      );
      hairCap.position.set(0, 0.08, 0);
      this.headMesh.add(hairCap);

      const swoosh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.09, 0.14), hairMat);
      swoosh.position.set(0, 0.28, 0.26);
      swoosh.rotation.z = -0.1;
      this.headMesh.add(swoosh);
    }

    const headBody = new CANNON.Body({
      mass: 3,
      shape: new CANNON.Sphere(0.36),
      linearDamping: 0.2,
      angularDamping: 0.3,
    });
    headBody.position.set(0, 2.24, 0);
    this.parts['head'] = { mesh: this.headMesh, body: headBody, initialOffset: new THREE.Vector3(0, 2.24, 0) };

    // 3. Seamless Rounded Arms with Shoulders, Elbows & Hands
    this.leftArmGroup = this.createSeamlessArm(clothesMat, skinMat, -1);
    const leftArmBody = new CANNON.Body({
      mass: 2,
      shape: new CANNON.Box(new CANNON.Vec3(0.13, 0.38, 0.13)),
    });
    leftArmBody.position.set(-0.56, 1.4, 0);
    this.parts['leftArm'] = { mesh: this.leftArmGroup, body: leftArmBody, initialOffset: new THREE.Vector3(-0.56, 1.4, 0) };

    this.rightArmGroup = this.createSeamlessArm(clothesMat, skinMat, 1);
    const rightArmBody = new CANNON.Body({
      mass: 2,
      shape: new CANNON.Box(new CANNON.Vec3(0.13, 0.38, 0.13)),
    });
    rightArmBody.position.set(0.56, 1.4, 0);
    this.parts['rightArm'] = { mesh: this.rightArmGroup, body: rightArmBody, initialOffset: new THREE.Vector3(0.56, 1.4, 0) };

    // 4. Seamless Rounded Legs with Thighs, Knees & Footwear
    this.leftLegGroup = this.createSeamlessLeg(pantsMat);
    const leftLegBody = new CANNON.Body({
      mass: 3.5,
      shape: new CANNON.Box(new CANNON.Vec3(0.15, 0.46, 0.15)),
    });
    leftLegBody.position.set(-0.24, 0.52, 0);
    this.parts['leftLeg'] = { mesh: this.leftLegGroup, body: leftLegBody, initialOffset: new THREE.Vector3(-0.24, 0.52, 0) };

    this.rightLegGroup = this.createSeamlessLeg(pantsMat);
    const rightLegBody = new CANNON.Body({
      mass: 3.5,
      shape: new CANNON.Box(new CANNON.Vec3(0.15, 0.46, 0.15)),
    });
    rightLegBody.position.set(0.24, 0.52, 0);
    this.parts['rightLeg'] = { mesh: this.rightLegGroup, body: rightLegBody, initialOffset: new THREE.Vector3(0.24, 0.52, 0) };

    // Register all parts
    Object.keys(this.parts).forEach((key) => {
      const part = this.parts[key];
      this.group.add(part.mesh);
      this.physicsWorld.addBody(part.body);
    });

    // Cannon-es Joints with spring-loaded physical damping
    this.createJoint(torsoBody, headBody, new CANNON.Vec3(0, 0.62, 0), new CANNON.Vec3(0, -0.36, 0));
    this.createJoint(torsoBody, leftArmBody, new CANNON.Vec3(-0.5, 0.4, 0), new CANNON.Vec3(0, 0.36, 0));
    this.createJoint(torsoBody, rightArmBody, new CANNON.Vec3(0.5, 0.4, 0), new CANNON.Vec3(0, 0.36, 0));
    this.createJoint(torsoBody, leftLegBody, new CANNON.Vec3(-0.24, -0.48, 0), new CANNON.Vec3(0, 0.45, 0));
    this.createJoint(torsoBody, rightLegBody, new CANNON.Vec3(0.24, -0.48, 0), new CANNON.Vec3(0, 0.45, 0));

    this.resetToStanding();
  }

  // --- Cartoon Ink Outline Mesh (Comic / Baper Rasta Cell Shading Aesthetic) ---
  private addOutline(targetMesh: THREE.Mesh, thickness: number = 0.02): THREE.Mesh {
    const outlineGeo = targetMesh.geometry.clone();
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x09090b,
      side: THREE.BackSide,
    });
    const outline = new THREE.Mesh(outlineGeo, outlineMat);
    outline.scale.multiplyScalar(1 + thickness * 2);
    targetMesh.add(outline);
    return outline;
  }

  // Helper: Seamless Rounded Arm with Shoulder Cap, Elbow & Hand
  private createSeamlessArm(clothesMat: THREE.Material, skinMat: THREE.Material, _side: number): THREE.Group {
    const group = new THREE.Group();

    // Shoulder sphere
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), clothesMat);
    shoulder.position.set(0, 0.32, 0);
    group.add(shoulder);

    // Upper arm sleeve
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.45, 16), clothesMat);
    sleeve.position.set(0, 0.1, 0);
    sleeve.castShadow = true;
    group.add(sleeve);
    this.addOutline(sleeve, 0.02);

    // Elbow joint sphere
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), skinMat);
    elbow.position.set(0, -0.14, 0);
    group.add(elbow);

    // Forearm
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.35, 16), skinMat);
    forearm.position.set(0, -0.28, 0);
    forearm.castShadow = true;
    group.add(forearm);

    // Hand with palm & cartoon thumb
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), skinMat);
    hand.scale.set(0.9, 1.25, 0.7);
    hand.position.set(0, -0.46, 0);
    hand.castShadow = true;
    group.add(hand);

    return group;
  }

  // Helper: Seamless Rounded Leg with Thigh, Knee Cap & Footwear
  private createSeamlessLeg(pantsMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();

    // Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.45, 16), pantsMat);
    thigh.position.set(0, 0.22, 0);
    thigh.castShadow = true;
    group.add(thigh);
    this.addOutline(thigh, 0.02);

    // Knee cap
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), pantsMat);
    knee.position.set(0, 0.02, 0.03);
    group.add(knee);

    // Calf
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.42, 16), pantsMat);
    calf.position.set(0, -0.18, 0);
    calf.castShadow = true;
    group.add(calf);

    // Shoe / Bata Sandal
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.36), shoeMat);
    shoe.position.set(0, -0.42, 0.08);
    shoe.castShadow = true;
    group.add(shoe);
    this.addOutline(shoe, 0.02);

    return group;
  }

  private createJoint(bodyA: CANNON.Body, bodyB: CANNON.Body, pivotA: CANNON.Vec3, pivotB: CANNON.Vec3): void {
    const constraint = new CANNON.PointToPointConstraint(bodyA, pivotA, bodyB, pivotB, 1e6);
    this.physicsWorld.addConstraint(constraint);
  }

  public resetToStanding(x: number = 0, z: number = 0): void {
    this.isRagdoll = false;
    this.animState = 'idle';
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
    this.animState = 'ragdoll';
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

  // --- Living Human Movement & Locomotion Animation ---
  public update(deltaTime: number): void {
    if (!this.isRagdoll) {
      this.animTime += deltaTime * 3.8;

      if (this.animState === 'stagger') {
        this.staggerTimer -= deltaTime;
        if (this.staggerTimer <= 0) {
          this.animState = 'idle';
        }
      }

      // 1. Natural Breathing & Spine Expansion
      const breathing = Math.sin(this.animTime) * 0.04;
      const sway = Math.cos(this.animTime * 0.6) * 0.035;

      // 2. Street Pacing Locomotion (Pacing back and forth on the sidewalk)
      this.walkTargetX += this.walkDir * deltaTime * 0.4;
      if (this.walkTargetX > 0.8) this.walkDir = -1;
      if (this.walkTargetX < -0.8) this.walkDir = 1;

      const currentX = this.rootPosition.x + this.walkTargetX * 0.35 + sway;

      const torso = this.parts['torso'];
      torso.body.position.set(
        currentX,
        torso.initialOffset.y + breathing,
        this.rootPosition.z
      );
      torso.body.velocity.set(0, 0, 0);

      // Living Head Motion with slight expressive tilt
      const head = this.parts['head'];
      head.body.position.set(
        currentX + sway * 0.5,
        head.initialOffset.y + breathing * 1.3,
        this.rootPosition.z
      );
      head.body.velocity.set(0, 0, 0);

      // 3. Dynamic Human Arm Talking Gestures
      const leftArm = this.parts['leftArm'];
      const armSway = Math.sin(this.animTime * 1.2) * 0.08;
      leftArm.body.position.set(
        currentX + leftArm.initialOffset.x,
        leftArm.initialOffset.y + breathing + armSway,
        this.rootPosition.z
      );

      const rightArm = this.parts['rightArm'];
      rightArm.body.position.set(
        currentX + rightArm.initialOffset.x,
        rightArm.initialOffset.y + breathing - armSway,
        this.rootPosition.z
      );

      // 4. Weight Shifting on Feet
      const legStep = Math.sin(this.animTime * 1.5) * 0.03;
      const leftLeg = this.parts['leftLeg'];
      leftLeg.body.position.set(
        currentX + leftLeg.initialOffset.x,
        leftLeg.initialOffset.y + legStep,
        this.rootPosition.z
      );
      const rightLeg = this.parts['rightLeg'];
      rightLeg.body.position.set(
        currentX + rightLeg.initialOffset.x,
        rightLeg.initialOffset.y - legStep,
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
