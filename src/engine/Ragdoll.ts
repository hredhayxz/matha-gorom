import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface RagdollPart {
  mesh: THREE.Mesh;
  body: CANNON.Body;
  initialOffset: THREE.Vector3;
}

export class Ragdoll {
  public group: THREE.Group;
  public parts: { [key: string]: RagdollPart } = {};
  public headMesh!: THREE.Mesh;
  public headMaterial!: THREE.MeshStandardMaterial;
  public isRagdoll: boolean = false;
  private scene: THREE.Scene;
  private physicsWorld: CANNON.World;
  private idleTime: number = 0;
  public rootPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Character style colors
  public shirtColor: number = 0x2563eb;
  public pantsColor: number = 0x1e293b;
  public skinColor: number = 0xf5d0b0;

  constructor(
    scene: THREE.Scene,
    physicsWorld: CANNON.World,
    options?: { shirtColor?: number; pantsColor?: number; skinColor?: number }
  ) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    if (options?.shirtColor) this.shirtColor = options.shirtColor;
    if (options?.pantsColor) this.pantsColor = options.pantsColor;
    if (options?.skinColor) this.skinColor = options.skinColor;

    this.buildRagdoll();
  }

  private buildRagdoll(): void {
    const shirtMat = new THREE.MeshStandardMaterial({
      color: this.shirtColor,
      roughness: 0.7,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: this.pantsColor,
      roughness: 0.8,
    });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    torsoMesh.castShadow = true;
    const torsoBody = new CANNON.Body({
      mass: 8,
      shape: new CANNON.Box(new CANNON.Vec3(0.35, 0.45, 0.225)),
      linearDamping: 0.3,
      angularDamping: 0.4,
    });
    torsoBody.position.set(0, 1.45, 0);
    this.parts['torso'] = { mesh: torsoMesh, body: torsoBody, initialOffset: new THREE.Vector3(0, 1.45, 0) };

    // 2. Head (Spherical cartoon head with face texture target)
    const headGeo = new THREE.SphereGeometry(0.32, 24, 24);
    this.headMaterial = new THREE.MeshStandardMaterial({
      color: this.skinColor,
      roughness: 0.5,
    });
    this.headMesh = new THREE.Mesh(headGeo, this.headMaterial);
    this.headMesh.castShadow = true;

    // Cartoon hair / cap
    const hairGeo = new THREE.SphereGeometry(0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.05, 0);
    this.headMesh.add(hair);

    // Cartoon sunglasses/mustache for dhakai flair
    const glassesGeo = new THREE.BoxGeometry(0.38, 0.08, 0.08);
    const glassesMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const glasses = new THREE.Mesh(glassesGeo, glassesMat);
    glasses.position.set(0, 0.05, 0.3);
    this.headMesh.add(glasses);

    const headBody = new CANNON.Body({
      mass: 3,
      shape: new CANNON.Sphere(0.32),
      linearDamping: 0.2,
      angularDamping: 0.3,
    });
    headBody.position.set(0, 2.15, 0);
    this.parts['head'] = { mesh: this.headMesh, body: headBody, initialOffset: new THREE.Vector3(0, 2.15, 0) };

    // 3. Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
    // Left Arm
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.castShadow = true;
    const leftArmBody = new CANNON.Body({
      mass: 2,
      shape: new CANNON.Box(new CANNON.Vec3(0.1, 0.325, 0.1)),
    });
    leftArmBody.position.set(-0.52, 1.4, 0);
    this.parts['leftArm'] = { mesh: leftArmMesh, body: leftArmBody, initialOffset: new THREE.Vector3(-0.52, 1.4, 0) };

    // Right Arm
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.castShadow = true;
    const rightArmBody = new CANNON.Body({
      mass: 2,
      shape: new CANNON.Box(new CANNON.Vec3(0.1, 0.325, 0.1)),
    });
    rightArmBody.position.set(0.52, 1.4, 0);
    this.parts['rightArm'] = { mesh: rightArmMesh, body: rightArmBody, initialOffset: new THREE.Vector3(0.52, 1.4, 0) };

    // 4. Legs
    const legGeo = new THREE.BoxGeometry(0.26, 0.85, 0.26);
    // Left Leg
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.castShadow = true;
    const leftLegBody = new CANNON.Body({
      mass: 3,
      shape: new CANNON.Box(new CANNON.Vec3(0.13, 0.425, 0.13)),
    });
    leftLegBody.position.set(-0.22, 0.55, 0);
    this.parts['leftLeg'] = { mesh: leftLegMesh, body: leftLegBody, initialOffset: new THREE.Vector3(-0.22, 0.55, 0) };

    // Right Leg
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.castShadow = true;
    const rightLegBody = new CANNON.Body({
      mass: 3,
      shape: new CANNON.Box(new CANNON.Vec3(0.13, 0.425, 0.13)),
    });
    rightLegBody.position.set(0.22, 0.55, 0);
    this.parts['rightLeg'] = { mesh: rightLegMesh, body: rightLegBody, initialOffset: new THREE.Vector3(0.22, 0.55, 0) };

    // Add meshes to group and bodies to Cannon world
    Object.keys(this.parts).forEach((key) => {
      const part = this.parts[key];
      this.group.add(part.mesh);
      this.physicsWorld.addBody(part.body);
    });

    // Add Ragdoll Constraints (ConeTwist & PointToPoint joints between limbs and torso)
    this.createJoint(torsoBody, headBody, new CANNON.Vec3(0, 0.5, 0), new CANNON.Vec3(0, -0.32, 0));
    this.createJoint(torsoBody, leftArmBody, new CANNON.Vec3(-0.45, 0.35, 0), new CANNON.Vec3(0, 0.3, 0));
    this.createJoint(torsoBody, rightArmBody, new CANNON.Vec3(0.45, 0.35, 0), new CANNON.Vec3(0, 0.3, 0));
    this.createJoint(torsoBody, leftLegBody, new CANNON.Vec3(-0.22, -0.45, 0), new CANNON.Vec3(0, 0.4, 0));
    this.createJoint(torsoBody, rightLegBody, new CANNON.Vec3(0.22, -0.45, 0), new CANNON.Vec3(0, 0.4, 0));

    // Initially start standing
    this.resetToStanding();
  }

  private createJoint(
    bodyA: CANNON.Body,
    bodyB: CANNON.Body,
    pivotA: CANNON.Vec3,
    pivotB: CANNON.Vec3
  ): void {
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

    // Direct impulse to head and torso
    head.applyImpulse(impulse, point);
    torso.applyImpulse(
      new CANNON.Vec3(impulse.x * 0.7, impulse.y * 0.8, impulse.z * 0.7),
      torso.position
    );

    // Comical violent spin
    head.angularVelocity.vadd(angularSpin, head.angularVelocity);
    torso.angularVelocity.vadd(angularSpin.scale(0.8), torso.angularVelocity);
  }

  public update(deltaTime: number): void {
    if (!this.isRagdoll) {
      // Idle animation: breathing and smug taunting bobbing
      this.idleTime += deltaTime * 3.5;
      const bob = Math.sin(this.idleTime) * 0.04;
      const sway = Math.cos(this.idleTime * 0.5) * 0.03;

      const torso = this.parts['torso'];
      torso.body.position.set(
        this.rootPosition.x + sway,
        torso.initialOffset.y + bob,
        this.rootPosition.z
      );
      torso.body.velocity.set(0, 0, 0);

      const head = this.parts['head'];
      head.body.position.set(
        this.rootPosition.x + sway * 1.2,
        head.initialOffset.y + bob,
        this.rootPosition.z
      );
      head.body.velocity.set(0, 0, 0);

      // Keep legs rooted
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
    this.headMaterial.map = texture;
    this.headMaterial.needsUpdate = true;
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
