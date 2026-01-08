/**
 * SoundManager - Basic audio management for web applications
 * 
 * This class demonstrates the core concepts of Web Audio API:
 * - Lazy AudioContext initialization
 * - Oscillator-based sound synthesis
 * - Gain nodes for volume control
 * - ADSR envelope implementation
 * 
 * Based on the chess game sound system from the tutorial.
 */

export class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  /**
   * Get or create the AudioContext (lazy initialization)
   * This respects browser autoplay policies
   */
  getContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  /**
   * Enable or disable all sounds
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Play a simple tone with envelope
   * 
   * @param {number} frequency - Pitch in Hertz (440 = A4)
   * @param {number} duration - Length in seconds
   * @param {OscillatorType} type - Waveform: 'sine', 'square', 'sawtooth', 'triangle'
   * @param {number} volume - Amplitude from 0.0 to 1.0
   */
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Connect audio graph: oscillator → gain → destination (speakers)
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Set oscillator properties
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      // Create amplitude envelope (Attack=instant, Release=exponential)
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01, // Can't ramp to 0 exponentially
        ctx.currentTime + duration
      );
      
      // Schedule start and stop
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      // Audio not available - fail silently
      console.warn('Audio playback failed:', error.message);
    }
  }

  /**
   * Chess piece move - smooth, pleasant two-tone sequence
   */
  playMove() {
    this.playTone(440, 0.1, 'sine', 0.2);  // A4
    setTimeout(() => this.playTone(523, 0.08, 'sine', 0.15), 50);  // C5
  }

  /**
   * Chess piece capture - aggressive square wave
   */
  playCapture() {
    this.playTone(330, 0.15, 'square', 0.25);  // E4
    setTimeout(() => this.playTone(220, 0.1, 'square', 0.2), 80);  // A3
  }

  /**
   * Check warning - urgent high-pitched alert
   */
  playCheck() {
    this.playTone(880, 0.1, 'sawtooth', 0.2);  // A5
    setTimeout(() => this.playTone(880, 0.1, 'sawtooth', 0.15), 150);  // A5 (repeat)
  }

  /**
   * Game end - musical sequence based on outcome
   * 
   * @param {boolean} isVictory - True for victory melody, false for defeat
   */
  playGameEnd(isVictory) {
    if (isVictory) {
      // C major arpeggio - ascending, triumphant
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.25), i * 100);
      });
    } else {
      // Descending chromatic scale - falling, sad
      [392, 349, 330, 262].forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.2), i * 150);
      });
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
