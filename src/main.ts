import { SceneManager } from './engine/SceneManager';
import { PhysicsWorld } from './engine/PhysicsWorld';
import { Environment } from './engine/Environment';
import { Ragdoll } from './engine/Ragdoll';
import { CombatEngine } from './engine/CombatEngine';
import { CharacterFactory, CHARACTER_CATALOG, CharacterDef } from './engine/CharacterFactory';
import { PropsDebrisEngine } from './engine/PropsDebrisEngine';
import { SoundEngine } from './engine/SoundEngine';
import { FaceSwap } from './engine/FaceSwap';
import { WeaponArsenal, WeaponType } from './engine/WeaponArsenal';
import { MemeSharer } from './engine/MemeSharer';
import { RagdollDragEngine } from './engine/RagdollDragEngine';
import { DizzyEffect } from './engine/DizzyEffect';
import { TrafficSystem, LiveCrimeEvent } from './engine/TrafficSystem';

export class GameApp {
  public sceneManager: SceneManager;
  public physicsWorld: PhysicsWorld;
  public environment: Environment;
  public trafficSystem: TrafficSystem;
  public characterFactory: CharacterFactory;
  public propsDebrisEngine: PropsDebrisEngine;
  public soundEngine: SoundEngine;
  public faceSwap: FaceSwap;
  public weaponArsenal: WeaponArsenal;
  public memeSharer: MemeSharer;
  public dragEngine: RagdollDragEngine;
  public dizzyEffect: DizzyEffect;
  public ragdoll: Ragdoll;
  public combatEngine: CombatEngine;
  public currentCharacter: CharacterDef = CHARACTER_CATALOG[0];
  public lastSpokenLine: string = '';
  private lastTime: number = performance.now();

  constructor() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Game canvas not found');

    this.sceneManager = new SceneManager(canvas);
    this.physicsWorld = new PhysicsWorld();
    this.environment = new Environment(this.sceneManager.scene, this.physicsWorld.world);
    this.trafficSystem = new TrafficSystem(this.sceneManager.scene);
    this.characterFactory = new CharacterFactory(this.sceneManager.scene, this.physicsWorld.world);
    this.propsDebrisEngine = new PropsDebrisEngine(this.sceneManager.scene, this.physicsWorld.world);
    this.soundEngine = new SoundEngine();
    this.weaponArsenal = new WeaponArsenal(this.sceneManager, this.physicsWorld.world);
    this.memeSharer = new MemeSharer(canvas);
    this.dizzyEffect = new DizzyEffect(this.sceneManager.scene);

    // Initial character
    this.ragdoll = this.characterFactory.createCharacter(this.currentCharacter);
    this.combatEngine = new CombatEngine(this.sceneManager);
    this.combatEngine.setRagdoll(this.ragdoll);
    this.combatEngine.onCrowdCheer = () => {
      this.soundEngine.playCrowdCheer();
    };
    this.dizzyEffect.setRagdoll(this.ragdoll);

    // Interactive Drag & Fling Engine
    this.dragEngine = new RagdollDragEngine(this.sceneManager);
    this.dragEngine.setRagdoll(this.ragdoll);
    this.dragEngine.setOnTossed((speed) => {
      this.soundEngine.playWhistleLaunch();
      this.sceneManager.triggerCameraShake(Math.min(speed * 0.04, 0.7));
      this.dizzyEffect.setVisible(true);
      const tossLines = ['উড়া ধুরা!', 'আমারে কই নিয়া যান?!', 'ড্রেনে ফালাইয়েন না!'];
      const text = tossLines[Math.floor(Math.random() * tossLines.length)];
      this.showSpeech(text);
      this.soundEngine.speakBengaliVoice(text, this.currentCharacter.gender);
    });

    // Face Swap Engine
    this.faceSwap = new FaceSwap();
    this.faceSwap.setOnFaceApplied((texture) => {
      this.ragdoll.setFaceTexture(texture);
      const reactText = 'হায় হায়! আমার মুখে কার ছবি বসাইলেন?!';
      this.showSpeech(reactText);
      this.soundEngine.speakBengaliVoice(reactText, this.currentCharacter.gender);
    });

    // Traffic System Audio & Crime Alerts
    this.trafficSystem.onHonkTriggered = (type) => {
      if (type === 'bus') {
        this.soundEngine.playBusAirHorn();
      } else {
        this.soundEngine.playRickshawBell();
      }
    };

    this.trafficSystem.onCrimeTriggered = (crime) => {
      this.displayCrimeAlert(crime);
    };

    this.initUI();
    this.initSoundboardUI();
    this.showSpeech(this.currentCharacter.defaultDialogue);

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  private displayCrimeAlert(crime: LiveCrimeEvent): void {
    const banner = document.getElementById('live-crime-banner');
    const title = document.getElementById('crime-title');
    const desc = document.getElementById('crime-desc');
    if (!banner || !title || !desc) return;

    title.innerText = crime.title;
    desc.innerText = `${crime.crimeDescription} (${crime.locationName})`;
    banner.style.display = 'flex';

    banner.onclick = () => {
      const match = CHARACTER_CATALOG.find((c) => c.id === crime.characterId);
      if (match) {
        this.switchCharacter(match);
        this.sceneManager.triggerCameraShake(0.4);
        banner.style.display = 'none';

        document.querySelectorAll('#character-scroller .char-card').forEach((c) => {
          if (c.getAttribute('data-id') === match.id) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });
      }
    };

    setTimeout(() => {
      if (banner.style.display === 'flex') {
        banner.style.display = 'none';
      }
    }, 9000);
  }

  private initUI(): void {
    const slapBtn = document.getElementById('slap-btn');
    const kickBtn = document.getElementById('kick-btn');
    const superBtn = document.getElementById('super-btn');
    const resetBtn = document.getElementById('reset-btn');
    const soundBtn = document.getElementById('sound-btn');
    const memeBtn = document.getElementById('share-meme-btn');
    const timeBtn = document.getElementById('time-btn');

    timeBtn?.addEventListener('click', () => {
      const times: ('day' | 'dusk' | 'night')[] = ['day', 'dusk', 'night'];
      const icons = { day: '☀️', dusk: '🌇', night: '🌙' };
      const currentIdx = times.indexOf(this.sceneManager.currentTimeOfDay);
      const nextTime = times[(currentIdx + 1) % times.length];
      this.sceneManager.setTimeOfDay(nextTime);
      if (timeBtn) timeBtn.innerText = icons[nextTime];
      this.triggerHaptic(20);
    });

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
      this.dizzyEffect.setVisible(false);
      this.sceneManager.triggerCameraShake(0.1);
      this.showSpeech(this.currentCharacter.defaultDialogue);
    });

    soundBtn?.addEventListener('click', () => {
      const isMuted = this.soundEngine.toggleMute();
      if (soundBtn) {
        soundBtn.innerText = isMuted ? '🔇' : '🔊';
      }
    });

    memeBtn?.addEventListener('click', () => {
      this.memeSharer.captureAndShare(
        this.currentCharacter.bengaliName,
        this.lastSpokenLine || this.currentCharacter.defaultDialogue
      );
    });

    // Weapon Arsenal selector
    const weaponCards = document.querySelectorAll('#weapon-scroller .char-card');
    weaponCards.forEach((card) => {
      card.addEventListener('click', () => {
        weaponCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        const weaponId = card.getAttribute('data-weapon') as WeaponType;
        if (weaponId) {
          this.weaponArsenal.setWeapon(weaponId);
          this.sceneManager.triggerCameraShake(0.1);
        }
      });
    });

    // Populate character scroller
    const scroller = document.getElementById('character-scroller');
    if (scroller) {
      scroller.innerHTML = '';
      CHARACTER_CATALOG.forEach((char) => {
        const card = document.createElement('div');
        card.className = `char-card ${char.id === this.currentCharacter.id ? 'active' : ''}`;
        card.setAttribute('data-id', char.id);
        
        let icon = '👔';
        if (char.category === 'family') icon = char.gender === 'female' ? '🧕' : '📜';
        if (char.category === 'street') icon = '🛺';
        if (char.id === 'manager') icon = '💻';
        if (char.id === 'boss') icon = '💼';
        if (char.id === 'neighbor') icon = '🍬';
        if (char.id === 'syndicate') icon = '🧅';

        card.innerHTML = `<span>${icon}</span> <span>${char.bengaliName}</span>`;
        card.addEventListener('click', () => {
          this.switchCharacter(char);
          document.querySelectorAll('#character-scroller .char-card').forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
        });
        scroller.appendChild(card);
      });
    }
  }

  // --- Dialogue Soundboard Drawer ---
  private initSoundboardUI(): void {
    const dialogueBtn = document.getElementById('dialogue-btn');
    const dialogueModal = document.getElementById('dialogue-modal');
    const closeBtn = document.getElementById('close-dialogue-btn');

    dialogueBtn?.addEventListener('click', () => {
      this.populateSoundboardGrid();
      dialogueModal?.classList.add('active');
    });

    closeBtn?.addEventListener('click', () => {
      dialogueModal?.classList.remove('active');
    });

    dialogueModal?.addEventListener('click', (e) => {
      if (e.target === dialogueModal) {
        dialogueModal.classList.remove('active');
      }
    });

    this.populateSoundboardGrid();
  }

  private populateSoundboardGrid(): void {
    const grid = document.getElementById('soundboard-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const dialogues = [
      this.currentCharacter.defaultDialogue,
      ...this.currentCharacter.hitDialogues,
      'আমারে ছাইড়া দেন ওস্তাদ!',
      'ট্যাকা ফেরত দিতাছি!',
      'টিমওয়ার্ক ভাই!',
      'জাস্ট ৫ মিনিটের একটা কল ভাই!',
      'দলিল তো আমার নামে!',
      'কোম্পানির খারাপ অবস্থা!',
    ];

    const uniqueDialogues = Array.from(new Set(dialogues));

    uniqueDialogues.forEach((line) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.textAlign = 'left';
      btn.style.fontSize = '0.8rem';
      btn.style.padding = '8px 10px';
      btn.style.justifyContent = 'flex-start';
      btn.innerHTML = `📢 "${line}"`;

      btn.addEventListener('click', () => {
        this.showSpeech(line);
        this.soundEngine.speakBengaliVoice(line, this.currentCharacter.gender);
        this.sceneManager.triggerCameraShake(0.12);
        document.getElementById('dialogue-modal')?.classList.remove('active');
      });

      grid.appendChild(btn);
    });
  }

  private switchCharacter(char: CharacterDef): void {
    this.currentCharacter = char;
    this.ragdoll.destroy();
    this.ragdoll = this.characterFactory.createCharacter(char);
    this.combatEngine.setRagdoll(this.ragdoll);
    this.dragEngine.setRagdoll(this.ragdoll);
    this.dizzyEffect.setRagdoll(this.ragdoll);
    this.dizzyEffect.setVisible(false);
    this.faceSwap.applyToRagdoll(this.ragdoll);
    this.showSpeech(char.defaultDialogue);
    this.soundEngine.speakBengaliVoice(char.defaultDialogue, char.gender);
    this.sceneManager.triggerCameraShake(0.2);
    this.populateSoundboardGrid();
  }

  private triggerHaptic(duration: number = 30): void {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // Ignored if user hasn't interacted or unsupported
      }
    }
  }

  private handleHit(type: 'slap' | 'kick' | 'super'): void {
    const headPos = this.ragdoll.parts['head'].mesh.position;
    this.dizzyEffect.setVisible(true);
    this.triggerHaptic(type === 'super' ? 80 : 35);

    if (this.weaponArsenal.activeWeapon !== 'hand') {
      this.weaponArsenal.launchWeapon(headPos);
      if (this.weaponArsenal.activeWeapon === 'chappal') {
        this.soundEngine.playChappal();
      } else if (this.weaponArsenal.activeWeapon === 'broom') {
        this.soundEngine.playBroom();
      } else if (this.weaponArsenal.activeWeapon === 'sweet_pot') {
        this.soundEngine.playPotShatter();
      }
    }

    if (this.currentCharacter.id === 'colleague') {
      this.propsDebrisEngine.spawnKeyboardSmash(headPos);
      this.soundEngine.playKeyboardSmash();
    } else if (this.currentCharacter.id === 'neighbor') {
      this.propsDebrisEngine.spawnSweetBoxExplosion(headPos);
    } else if (this.currentCharacter.id === 'syndicate') {
      this.propsDebrisEngine.spawnFlyingOnions(headPos);
    } else if (this.currentCharacter.id === 'boss') {
      if (this.characterFactory.chairBody) {
        this.characterFactory.chairBody.angularVelocity.set(0, 45, 0);
        this.characterFactory.chairBody.velocity.set(6, 8, 4);
        this.soundEngine.playWhistleLaunch();
      }
    } else if (this.currentCharacter.id === 'extortionist' || this.currentCharacter.id === 'manager') {
      this.soundEngine.playMetallicClatter();
    }

    if (type === 'slap') {
      this.combatEngine.triggerSlap();
      if (this.weaponArsenal.activeWeapon === 'hand') this.soundEngine.playSlap();
    } else if (type === 'kick') {
      this.combatEngine.triggerDropkick();
      this.soundEngine.playDropkick();
    } else if (type === 'super') {
      this.combatEngine.triggerSuperFinisher();
      this.soundEngine.playSuperFinisher();
    }

    const lines = this.currentCharacter.hitDialogues;
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    this.showSpeech(randomLine);
    this.soundEngine.speakBengaliVoice(randomLine, this.currentCharacter.gender);
  }

  private showSpeech(text: string): void {
    this.lastSpokenLine = text;
    const container = document.getElementById('speech-bubble-container');
    if (!container) return;

    container.innerHTML = `
      <div style="
        background: rgba(15, 23, 42, 0.94);
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

  private hasSplashedDrain: boolean = false;

  private animate(currentTime: number): void {
    requestAnimationFrame(this.animate);
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.combatEngine.isFrozen) {
      this.physicsWorld.step(deltaTime);
      this.ragdoll.update(deltaTime);
      this.characterFactory.updateChairPhysics();
      this.propsDebrisEngine.update(deltaTime);
      this.weaponArsenal.update(deltaTime);
      this.trafficSystem.update(deltaTime);
      this.dizzyEffect.update(deltaTime);

      // Check Roadside Drain Water Splash
      const torsoPos = this.ragdoll.parts['torso'].mesh.position;
      if (torsoPos.x > 4.6 && torsoPos.x < 7.2 && torsoPos.y < 0.4) {
        if (!this.hasSplashedDrain) {
          this.hasSplashedDrain = true;
          this.sceneManager.spawnDrainWaterSplash(torsoPos);
          this.soundEngine.playWaterSplash();
          this.sceneManager.triggerCameraShake(0.5);
          this.showSpeech('হায় হায়! ড্রেনের ময়লা পানিতে পড়লাম রে!');
          this.soundEngine.speakBengaliVoice('হায় হায়! ড্রেনের পানিতে পড়লাম!', this.currentCharacter.gender);
          this.triggerHaptic(60);
        }
      } else if (torsoPos.y > 0.8) {
        this.hasSplashedDrain = false;
      }
    }

    this.combatEngine.update(deltaTime);
    this.sceneManager.update();
    this.sceneManager.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();

  // Register PWA Service Worker
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.log('MathaGorom PWA Service Worker active:', reg.scope);
    }).catch((err) => {
      console.warn('PWA registration failed:', err);
    });
  }
});
