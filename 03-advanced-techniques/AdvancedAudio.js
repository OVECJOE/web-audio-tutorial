/**
 * Advanced Audio Techniques
 * 
 * Demonstrates:
 * - Oscillator detuning for rich timbres
 * - Biquad filters for tone shaping
 * - Filter sweeps for dynamic effects
 */

export class AdvancedAudio {
  constructor() {
    this.context = new AudioContext();
  }

  /**
   * Create a "thick" sound by stacking detuned oscillators
   * This creates a chorus/unison effect
   */
  playThickTone(frequency, duration) {
    const ctx = this.context;
    const masterGain = ctx.createGain();
    
    // Create three oscillators at slightly different frequencies
    const oscillators = [
      { freq: frequency, detune: -10, type: 'sine', volume: 0.3 },
      { freq: frequency, detune: 0, type: 'sine', volume: 0.4 },
      { freq: frequency, detune: 10, type: 'sine', volume: 0.3 }
    ];
    
    oscillators.forEach(config => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.setValueAtTime(config.freq, ctx.currentTime);
      osc.detune.setValueAtTime(config.detune, ctx.currentTime);
      osc.type = config.type;
      
      gain.gain.setValueAtTime(config.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    });
    
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.5, ctx.currentTime);
  }

  /**
   * Apply a lowpass filter with frequency sweep
   * Creates a "wow" or "closing" effect
   */
  playFilteredSound(frequency, duration) {
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    // Create a lowpass filter (removes high frequencies)
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.Q.setValueAtTime(5, ctx.currentTime); // Resonance
    
    // Sweep the filter frequency for a "wow" effect
    filter.frequency.exponentialRampToValueAtTime(
      100,
      ctx.currentTime + duration
    );
    
    // Audio graph: oscillator → filter → gain → destination
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /**
   * Create a resonant filter sweep (acid bass style)
   */
  playResonantSweep(frequency, duration) {
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(15, ctx.currentTime); // High resonance
    
    // Sweep up then down
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + duration / 2);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /**
   * Apply highpass filter (thin, telephone-like sound)
   */
  playHighpassSound(frequency, duration) {
    const ctx = this.context;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /**
   * Create a bell-like sound using multiple harmonics
   */
  playBell(frequency, duration) {
    const ctx = this.context;
    const masterGain = ctx.createGain();
    
    // Bell harmonics (not strictly harmonic - gives metallic quality)
    const partials = [
      { freq: frequency * 1, volume: 0.5, decay: duration },
      { freq: frequency * 2.4, volume: 0.3, decay: duration * 0.7 },
      { freq: frequency * 3.8, volume: 0.2, decay: duration * 0.5 },
      { freq: frequency * 5.2, volume: 0.15, decay: duration * 0.3 }
    ];
    
    partials.forEach(partial => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.setValueAtTime(partial.freq, ctx.currentTime);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(partial.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + partial.decay);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    });
    
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.6, ctx.currentTime);
  }

  /**
   * White noise burst (useful for percussion/explosions)
   */
  playNoiseBurst(duration) {
    const ctx = this.context;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill with random values (white noise)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    // Shape the noise with a bandpass filter
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    // Quick attack, exponential decay
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    source.start(ctx.currentTime);
  }
}
