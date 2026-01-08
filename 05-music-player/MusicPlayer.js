/**
 * Music Player
 * 
 * Play background music with looping, fading, and crossfading
 */

export class MusicPlayer {
  constructor(audioContext) {
    this.context = audioContext;
    this.currentSource = null;
    this.currentGain = null;
    this.isPlaying = false;
    this.currentBuffer = null;
    
    // Master gain for music
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.setValueAtTime(0.5, this.context.currentTime);
  }

  /**
   * Play a music track with fade in
   * 
   * @param {AudioBuffer} buffer - The audio buffer to play
   * @param {number} volume - Volume from 0.0 to 1.0
   * @param {number} fadeTime - Fade in duration in seconds
   */
  play(buffer, volume = 0.5, fadeTime = 1.0) {
    if (this.isPlaying) {
      this.stop(fadeTime);
    }
    
    this.currentBuffer = buffer;
    this.currentSource = this.context.createBufferSource();
    this.currentGain = this.context.createGain();
    
    this.currentSource.buffer = buffer;
    this.currentSource.loop = true;
    this.currentSource.loopStart = 0;
    this.currentSource.loopEnd = buffer.duration;
    
    // Fade in
    this.currentGain.gain.setValueAtTime(0, this.context.currentTime);
    this.currentGain.gain.linearRampToValueAtTime(
      volume,
      this.context.currentTime + fadeTime
    );
    
    this.currentSource.connect(this.currentGain);
    this.currentGain.connect(this.masterGain);
    
    this.currentSource.start(this.context.currentTime);
    this.isPlaying = true;
  }

  /**
   * Stop the current track with fade out
   * 
   * @param {number} fadeTime - Fade out duration in seconds
   */
  stop(fadeTime = 1.0) {
    if (!this.currentSource || !this.isPlaying) return;
    
    const currentTime = this.context.currentTime;
    
    this.currentGain.gain.linearRampToValueAtTime(
      0,
      currentTime + fadeTime
    );
    
    this.currentSource.stop(currentTime + fadeTime);
    
    // Clean up references after fade completes
    setTimeout(() => {
      this.currentSource = null;
      this.currentGain = null;
    }, fadeTime * 1000 + 100);
    
    this.isPlaying = false;
  }

  /**
   * Crossfade to a new track
   * 
   * @param {AudioBuffer} buffer - New audio buffer
   * @param {number} volume - Target volume
   * @param {number} crossfadeTime - Crossfade duration
   */
  crossfadeTo(buffer, volume = 0.5, crossfadeTime = 2.0) {
    if (!this.isPlaying) {
      this.play(buffer, volume, crossfadeTime);
      return;
    }
    
    // Fade out current track
    const oldSource = this.currentSource;
    const oldGain = this.currentGain;
    const currentTime = this.context.currentTime;
    
    if (oldGain) {
      oldGain.gain.linearRampToValueAtTime(0, currentTime + crossfadeTime);
    }
    
    if (oldSource) {
      oldSource.stop(currentTime + crossfadeTime);
    }
    
    // Fade in new track
    this.currentBuffer = buffer;
    this.currentSource = this.context.createBufferSource();
    this.currentGain = this.context.createGain();
    
    this.currentSource.buffer = buffer;
    this.currentSource.loop = true;
    
    this.currentGain.gain.setValueAtTime(0, currentTime);
    this.currentGain.gain.linearRampToValueAtTime(volume, currentTime + crossfadeTime);
    
    this.currentSource.connect(this.currentGain);
    this.currentGain.connect(this.masterGain);
    
    this.currentSource.start(currentTime);
  }

  /**
   * Pause the music (can be resumed)
   */
  pause() {
    if (this.isPlaying && this.context.state === 'running') {
      this.context.suspend();
    }
  }

  /**
   * Resume paused music
   */
  resume() {
    if (this.isPlaying && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  /**
   * Set volume with smooth transition
   * 
   * @param {number} volume - Target volume (0.0 - 1.0)
   * @param {number} rampTime - Transition time in seconds
   */
  setVolume(volume, rampTime = 0.1) {
    if (!this.currentGain) return;
    
    this.currentGain.gain.linearRampToValueAtTime(
      volume,
      this.context.currentTime + rampTime
    );
  }

  /**
   * Set master volume for all music
   */
  setMasterVolume(volume, rampTime = 0.1) {
    this.masterGain.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(1, volume)),
      this.context.currentTime + rampTime
    );
  }

  /**
   * Duck music volume (useful when playing sound effects)
   * 
   * @param {number} duckAmount - Amount to reduce (0.0 - 1.0)
   * @param {number} duckTime - How long to duck for
   */
  async duck(duckAmount = 0.3, duckTime = 0.5) {
    if (!this.currentGain) return;
    
    const currentVolume = this.currentGain.gain.value;
    const duckedVolume = currentVolume * (1 - duckAmount);
    const currentTime = this.context.currentTime;
    
    // Duck down
    this.currentGain.gain.linearRampToValueAtTime(duckedVolume, currentTime + 0.05);
    
    // Wait
    await new Promise(resolve => setTimeout(resolve, duckTime * 1000));
    
    // Restore
    this.currentGain.gain.linearRampToValueAtTime(
      currentVolume,
      this.context.currentTime + 0.2
    );
  }

  /**
   * Get current playback state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      hasTrack: this.currentBuffer !== null,
      contextState: this.context.state
    };
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stop(0);
    this.masterGain.disconnect();
  }
}
