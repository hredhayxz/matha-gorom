export class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private hasInitialized: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
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

  // --- 1. Realistic Bengali Voice Speech Engine (Male vs Female) ---
  public speakBengaliVoice(text: string, gender: 'male' | 'female' = 'male'): void {
    if (this.isMuted) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop overlap

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      // Find authentic Bengali voices
      const bengaliVoices = voices.filter(
        (v) => v.lang.startsWith('bn') || v.lang.includes('Bengali') || v.name.toLowerCase().includes('bangla')
      );

      if (gender === 'female') {
        // Realistic Female Voice
        utterance.pitch = 1.15; // Natural realistic female pitch
        utterance.rate = 1.05;  // Authentic gossipy conversational cadence
        
        // Match female voice if available in system
        const femaleVoice = bengaliVoices.find(
          (v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.includes('Aditi')
        ) || bengaliVoices[0];

        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        // Realistic Male Voice
        utterance.pitch = 0.88; // Deep resonant natural adult male chest pitch
        utterance.rate = 1.0;   // Confident/panicked human cadence
        
        // Match male voice if available
        const maleVoice = bengaliVoices.find(
          (v) => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man') || v.name.includes('Kunal')
        ) || bengaliVoices[0];

        if (maleVoice) utterance.voice = maleVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      // Natural human formant synthesis fallback
      this.playHumanVocalFormant(gender);
    }
  }

  // Procedural Human Vocal Formant Synthesis (Glottal Pulse + F1/F2 Resonances)
  private playHumanVocalFormant(gender: 'male' | 'female'): void {
    if (!this.hasInitialized) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = gender === 'female' ? 220 : 120; // Authentic male/female fundamental frequency F0

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth'; // Rich vocal tract harmonics
    osc.frequency.setValueAtTime(baseFreq, t);

    // Vocal Tract Formant Filter (Ah / Oh vowel formant simulation)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(gender === 'female' ? 950 : 700, t);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // --- 2. Authentic Dhaka Vehicle Horns ---
  // A. Classic Dhaka Bus Dual-Tone Air Horn ("প্যাঁ-প্যাঁ-পোঁ!")
  public playBusAirHorn(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const tone1 = this.ctx.createOscillator();
    const tone2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    tone1.type = 'sawtooth';
    tone2.type = 'sawtooth';
    tone1.frequency.setValueAtTime(370, t); // High horn harmonic
    tone2.frequency.setValueAtTime(440, t); // Concordant horn blast

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    tone1.connect(gain);
    tone2.connect(gain);
    gain.connect(this.ctx.destination);

    tone1.start(t);
    tone2.start(t);
    tone1.stop(t + 0.36);
    tone2.stop(t + 0.36);
  }

  // B. Authentic Cycle-Rickshaw Double Bell ("টুং-টাং!")
  public playRickshawBell(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const bellFrequencies = [1760, 2093]; // A6 & C7 clear brass bell tones
    bellFrequencies.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  // --- 3. Combat Sound FX ---
  public playSlap(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
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

    this.playNoiseBurst(0.06, 0.7, 2400);
  }

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

  public playSuperFinisher(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
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

  public playChappal(): void {
    if (this.isMuted) return;
    this.playSlap();
    this.playNoiseBurst(0.08, 0.9, 3600);
  }

  public playBroom(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

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
    this.playDropkick();
    this.playNoiseBurst(0.25, 0.8, 4800);
  }

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
}
