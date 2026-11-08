import { SceneManager } from './engine/SceneManager';
import { PhysicsWorld } from './engine/PhysicsWorld';
import { Environment } from './engine/Environment';
import { Ragdoll } from './engine/Ragdoll';
import { CombatEngine } from './engine/CombatEngine';

export class GameApp {
  public sceneManager: SceneManager;
  public physicsWorld: PhysicsWorld;
  public environment: Environment;
  public ragdoll: Ragdoll;
  public combatEngine: CombatEngine;
  private lastTime: number = performance.now();

  constructor() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Game canvas not found');

    this.sceneManager = new SceneManager(canvas);
    this.physicsWorld = new PhysicsWorld();
    this.environment = new Environment(this.sceneManager.scene, this.physicsWorld.world);

    // Initial character ragdoll
    this.ragdoll = new Ragdoll(this.sceneManager.scene, this.physicsWorld.world, {
      shirtColor: 0x2563eb,
      pantsColor: 0x1e293b,
      skinColor: 0xf5d0b0,
    });

    this.combatEngine = new CombatEngine(this.sceneManager);
    this.combatEngine.setRagdoll(this.ragdoll);

    this.initUI();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  private initUI(): void {
    const slapBtn = document.getElementById('slap-btn');
    const kickBtn = document.getElementById('kick-btn');
    const superBtn = document.getElementById('super-btn');
    const resetBtn = document.getElementById('reset-btn');

    slapBtn?.addEventListener('click', () => {
      this.combatEngine.triggerSlap();
    });

    kickBtn?.addEventListener('click', () => {
      this.combatEngine.triggerDropkick();
    });

    superBtn?.addEventListener('click', () => {
      this.combatEngine.triggerSuperFinisher();
    });

    resetBtn?.addEventListener('click', () => {
      this.ragdoll.resetToStanding(0, 0);
      this.sceneManager.triggerCameraShake(0.1);
    });
  }

  private animate(currentTime: number): void {
    requestAnimationFrame(this.animate);
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Check hit-stop freeze frame
    if (!this.combatEngine.isFrozen) {
      this.physicsWorld.step(deltaTime);
      this.ragdoll.update(deltaTime);
    }

    this.combatEngine.update(deltaTime);
    this.sceneManager.update();
    this.sceneManager.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
