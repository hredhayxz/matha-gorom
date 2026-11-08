import { SceneManager } from './engine/SceneManager';
import { PhysicsWorld } from './engine/PhysicsWorld';

class GameApp {
  private sceneManager: SceneManager;
  private physicsWorld: PhysicsWorld;
  private lastTime: number = performance.now();

  constructor() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Game canvas not found');

    this.sceneManager = new SceneManager(canvas);
    this.physicsWorld = new PhysicsWorld();

    this.initUI();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  private initUI(): void {
    const slapBtn = document.getElementById('slap-btn');
    const kickBtn = document.getElementById('kick-btn');
    const resetBtn = document.getElementById('reset-btn');

    slapBtn?.addEventListener('click', () => {
      this.sceneManager.triggerCameraShake(0.25);
    });

    kickBtn?.addEventListener('click', () => {
      this.sceneManager.triggerCameraShake(0.5);
    });

    resetBtn?.addEventListener('click', () => {
      this.sceneManager.triggerCameraShake(0.1);
    });
  }

  private animate(currentTime: number): void {
    requestAnimationFrame(this.animate);
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.physicsWorld.step(deltaTime);
    this.sceneManager.update();
    this.sceneManager.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
