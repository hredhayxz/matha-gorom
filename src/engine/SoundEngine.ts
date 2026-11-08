export class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private hasInitialized: boolean = false;

  constructor() {
    // AudioContext will be created on first touch/click
  }

  private initContext(): void {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.hasInitialized = true;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // --- 1. Cartoon Slap Thud ---
  public playSlap(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // A. Punchy Sine Pitch-drop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    oscGain.gain.setValueAtTime(1.0, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);

    // B. Noise Snap (sharp hand slap transient)
    this.playNoiseBurst(0.06, 0.7, 2400);
  }

  // --- 2. Heavy Dropkick Boom ---
  public playDropkick(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.28);

    gain.gain.setValueAtTime(1.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);

    this.playNoiseBurst(0.15, 0.9, 1200);
  }

  // --- 3. Cartoon Whistle Launch ---
  public playWhistleLaunch(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(2200, t + 0.45);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.46);
  }

  // --- 4. Metallic Trashcan Clatter ---
  public playMetallicClatter(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(840, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.25);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);

    this.playNoiseBurst(0.2, 0.6, 3200);
  }

  // --- 5. Keyboard Plastic Snap ---
  public playKeyboardSmash(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playNoiseBurst(0.03, 0.4, 4500 + Math.random() * 1500);
      }, i * 35);
    }
  }

  // --- 6. Super Finisher Explosion ---
  public playSuperFinisher(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Power riser
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.6);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.62);

    setTimeout(() => {
      this.playDropkick();
      this.playWhistleLaunch();
    }, 600);
  }

  // Helper: Synthesized Noise Burst
  private playNoiseBurst(duration: number, volume: number, filterFreq: number): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // --- 7. Bengali Voice Quips (SpeechSynthesis API with Cartoon Pitch) ---
  public speakBengaliVoice(text: string): void {
    if (this.isMuted) return;

    // Cartoon gibberish synth blip fallback
    this.playCartoonBabble();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.25; // Energetic cartoon pace
      utterance.pitch = 1.35; // Comical animated cartoon pitch

      // Try finding Bengali voice
      const voices = window.speechSynthesis.getVoices();
      const bengaliVoice = voices.find(
        (v) => v.lang.startsWith('bn') || v.lang.includes('Bengali') || v.name.includes('Bangla')
      );
      if (bengaliVoice) {
        utterance.voice = bengaliVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }

  // --- 8. Weapon Sound FX: Chappal, Broom, Sweet Pot ---
  public playChappal(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Loud rubber snap
    this.playSlap();
    this.playNoiseBurst(0.08, 0.9, 3600);
  }

  public playBroom(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Swoosh brush
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.18);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);

    this.playNoiseBurst(0.18, 0.5, 1800);
  }

  public playPotShatter(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.playDropkick();
    this.playNoiseBurst(0.25, 0.8, 4800);
  }

  private playCartoonBabble(): void {
    if (!this.hasInitialized) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [320, 480, 640];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.12, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.05 + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.05);
    });
  }
}

