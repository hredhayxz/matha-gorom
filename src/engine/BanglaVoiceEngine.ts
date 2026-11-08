export class BanglaVoiceEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bengaliVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const allVoices = window.speechSynthesis.getVoices();
      this.bengaliVoices = allVoices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith('bn') ||
          v.lang.toLowerCase().includes('bengali') ||
          v.name.toLowerCase().includes('bangla')
      );
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  // Speak with authentic male or female human tone
  public speak(text: string, gender: 'male' | 'female' = 'male'): void {
    if (this.isMuted) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop overlap

      const utterance = new SpeechSynthesisUtterance(text);

      if (gender === 'female') {
        utterance.pitch = 1.18; // Natural female human voice pitch
        utterance.rate = 1.02;  // Natural human conversation speed

        // Look for Bengali female voice
        const femaleVoice = this.bengaliVoices.find(
          (v) =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('woman') ||
            v.name.toLowerCase().includes('aditi') ||
            v.name.toLowerCase().includes('bangla')
        ) || this.bengaliVoices[0];

        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        utterance.pitch = 0.88; // Deep resonant adult male human chest pitch
        utterance.rate = 1.0;   // Confident/panicked human cadence

        // Look for Bengali male voice
        const maleVoice = this.bengaliVoices.find(
          (v) =>
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('man') ||
            v.name.toLowerCase().includes('kunal') ||
            v.name.toLowerCase().includes('bangla')
        ) || this.bengaliVoices[0];

        if (maleVoice) utterance.voice = maleVoice;
      }

      window.speechSynthesis.speak(utterance);
    }

    // Also play realistic emotional human voice exclamation
    this.playHumanReactionExclamation(gender);
  }

  // Realistic human emotional reaction (Gasp / Scream / Groan)
  private playHumanReactionExclamation(gender: 'male' | 'female'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Human Vocal Cord Harmonic Modeling
    osc.type = 'sawtooth';
    const fundamental = gender === 'female' ? 240 : 130; // Real female vs male fundamental frequency F0

    osc.frequency.setValueAtTime(fundamental, t);
    osc.frequency.exponentialRampToValueAtTime(fundamental * 0.75, t + 0.22); // Panic pitch inflection

    // Human Throat & Mouth Formant Filter
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(gender === 'female' ? 1100 : 750, t); // Authentic vowel formant resonance
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.23);
  }
}
