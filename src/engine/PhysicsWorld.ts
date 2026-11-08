import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  public world: CANNON.World;
  public defaultMaterial: CANNON.Material;
  public groundMaterial: CANNON.Material;
  public enemyMaterial: CANNON.Material;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -18.0, 0), // Snappy cartoon gravity
    });
    this.world.broadphase = new CANNON.NaiveBroadphase();
    (this.world.solver as CANNON.GSSolver).iterations = 10;

    this.defaultMaterial = new CANNON.Material('default');
    this.groundMaterial = new CANNON.Material('ground');
    this.enemyMaterial = new CANNON.Material('enemy');

    // Bouncy cartoon physical contact
    const enemyGroundContact = new CANNON.ContactMaterial(
      this.enemyMaterial,
      this.groundMaterial,
      {
        friction: 0.5,
        restitution: 0.35, // Comical bounce on ground
      }
    );
    this.world.addContactMaterial(enemyGroundContact);

    // Add static ground plane
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: this.groundMaterial,
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(groundBody);
  }

  public step(deltaTime: number): void {
    // Fixed time step for 60 FPS deterministic physics
    const fixedTimeStep = 1.0 / 60.0;
    this.world.step(fixedTimeStep, deltaTime, 3);
  }
}

