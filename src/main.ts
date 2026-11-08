import { SceneManager } from './engine/SceneManager';
import { PhysicsWorld } from './engine/PhysicsWorld';
import { Environment } from './engine/Environment';
import { Ragdoll } from './engine/Ragdoll';
import { CombatEngine } from './engine/CombatEngine';
import { CharacterFactory, CHARACTER_CATALOG, CharacterDef } from './engine/CharacterFactory';
import { PropsDebrisEngine } from './engine/PropsDebrisEngine';

export class GameApp {
  public sceneManager: SceneManager;
  public physicsWorld: PhysicsWorld;
  public environment: Environment;
  public characterFactory: CharacterFactory;
  public propsDebrisEngine: PropsDebrisEngine;
  public ragdoll: Ragdoll;
  public combatEngine: CombatEngine;
  public currentCharacter: CharacterDef = CHARACTER_CATALOG[0];
  private lastTime: number = performance.now();

  constructor() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Game canvas not found');

    this.sceneManager = new SceneManager(canvas);
    this.physicsWorld = new PhysicsWorld();
    this.environment = new Environment(this.sceneManager.scene, this.physicsWorld.world);
    this.characterFactory = new CharacterFactory(this.sceneManager.scene, this.physicsWorld.world);
    this.propsDebrisEngine = new PropsDebrisEngine(this.sceneManager.scene, this.physicsWorld.world);

    // Initial character
    this.ragdoll = this.characterFactory.createCharacter(this.currentCharacter);
    this.combatEngine = new CombatEngine(this.sceneManager);
    this.combatEngine.setRagdoll(this.ragdoll);

    this.initUI();
    this.showSpeech(this.currentCharacter.defaultDialogue);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  private initUI(): void {
    const slapBtn = document.getElementById('slap-btn');
    const kickBtn = document.getElementById('kick-btn');
    const superBtn = document.getElementById('super-btn');
    const resetBtn = document.getElementById('reset-btn');

    slapBtn?.addEventListener('click', () => {
      this.handleHit('slap');
    });

    kickBtn?.addEventListener('click', () => {
      this.handleHit('kick');
    });

    superBtn?.addEventListener('click', () => {
      this.handleHit('super');
    });

    resetBtn?.addEventListener('click', () => {
      this.ragdoll.resetToStanding(0, 0);
      this.sceneManager.triggerCameraShake(0.1);
      this.showSpeech(this.currentCharacter.defaultDialogue);
    });

    // Populate character scroller
    const scroller = document.getElementById('character-scroller');
    if (scroller) {
      scroller.innerHTML = '';
      CHARACTER_CATALOG.forEach((char) => {
        const card = document.createElement('div');
        card.className = `char-card ${char.id === this.currentCharacter.id ? 'active' : ''}`;
        
        let icon = '👔';
        if (char.category === 'family') icon = '📜';
        if (char.category === 'street') icon = '🛺';
        if (char.id === 'manager') icon = '💻';
        if (char.id === 'boss') icon = '💼';
        if (char.id === 'neighbor') icon = '🍬';
        if (char.id === 'syndicate') icon = '🧅';

        card.innerHTML = `<span>${icon}</span> <span>${char.bengaliName}</span>`;
        card.addEventListener('click', () => {
          this.switchCharacter(char);
          document.querySelectorAll('.char-card').forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
        });
        scroller.appendChild(card);
      });
    }
  }

  private switchCharacter(char: CharacterDef): void {
    this.currentCharacter = char;
    this.ragdoll.destroy();
    this.ragdoll = this.characterFactory.createCharacter(char);
    this.combatEngine.setRagdoll(this.ragdoll);
    this.showSpeech(char.defaultDialogue);
    this.sceneManager.triggerCameraShake(0.2);
  }

  private handleHit(type: 'slap' | 'kick' | 'super'): void {
    const headPos = this.ragdoll.parts['head'].mesh.position;

    // Trigger character-specific slapstick debris
    if (this.currentCharacter.id === 'colleague') {
      this.propsDebrisEngine.spawnKeyboardSmash(headPos);
    } else if (this.currentCharacter.id === 'neighbor') {
      this.propsDebrisEngine.spawnSweetBoxExplosion(headPos);
    } else if (this.currentCharacter.id === 'syndicate') {
      this.propsDebrisEngine.spawnFlyingOnions(headPos);
    } else if (this.currentCharacter.id === 'boss') {
      if (this.characterFactory.chairBody) {
        this.characterFactory.chairBody.angularVelocity.set(0, 45, 0);
        this.characterFactory.chairBody.velocity.set(6, 8, 4); // Launch towards roadside drain
      }
    }

    if (type === 'slap') {
      this.combatEngine.triggerSlap();
    } else if (type === 'kick') {
      this.combatEngine.triggerDropkick();
    } else if (type === 'super') {
      this.combatEngine.triggerSuperFinisher();
    }

    // Pick random Bengali hit reaction dialogue
    const lines = this.currentCharacter.hitDialogues;
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    this.showSpeech(randomLine);
  }

  private showSpeech(text: string): void {
    const container = document.getElementById('speech-bubble-container');
    if (!container) return;

    container.innerHTML = `
      <div style="
        background: rgba(15, 23, 42, 0.92);
        color: #fef08a;
        padding: 10px 18px;
        border-radius: 20px;
        font-weight: 800;
        font-size: clamp(0.9rem, 3.5vw, 1.15rem);
        border: 2px solid #eab308;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        max-width: 90vw;
        text-align: center;
        animation: popBubble 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      ">
        "${text}"
      </div>
      <style>
        @keyframes popBubble {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `;
  }

  private animate(currentTime: number): void {
    requestAnimationFrame(this.animate);
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.combatEngine.isFrozen) {
      this.physicsWorld.step(deltaTime);
      this.ragdoll.update(deltaTime);
      this.characterFactory.updateChairPhysics();
      this.propsDebrisEngine.update(deltaTime);
    }

    this.combatEngine.update(deltaTime);
    this.sceneManager.update();
    this.sceneManager.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
