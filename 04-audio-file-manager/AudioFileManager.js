/**
 * Audio File Manager
 * 
 * Load, cache, and play audio files (MP3, OGG, WAV, etc.)
 * Demonstrates proper preloading and buffer management
 */

export class AudioFileManager {
  constructor() {
    this.context = new AudioContext();
    this.buffers = new Map();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
  }

  /**
   * Load a single audio file
   * 
   * @param {string} name - Identifier for this sound
   * @param {string} url - Path to audio file
   * @returns {Promise<boolean>} - Success status
   */
  async loadSound(name, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      
      this.buffers.set(name, audioBuffer);
      console.log(`✓ Loaded: ${name} (${audioBuffer.duration.toFixed(2)}s)`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to load ${name}:`, error.message);
      return false;
    }
  }

  /**
   * Preload multiple sounds at once
   * 
   * @param {Object} soundMap - Object mapping names to URLs
   * @returns {Promise<Object>} - Results object with success/failure counts
   */
  async preloadSounds(soundMap) {
    const entries = Object.entries(soundMap);
    const results = await Promise.allSettled(
      entries.map(([name, url]) => this.loadSound(name, url))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - successful;
    
    console.log(`Preload complete: ${successful} loaded, ${failed} failed`);
    
    return {
      total: results.length,
      successful,
      failed
    };
  }

  /**
   * Play a loaded sound
   * 
   * @param {string} name - Name of the sound to play
   * @param {number} volume - Volume from 0.0 to 1.0
   * @param {number} playbackRate - Speed (1.0 = normal, 2.0 = double speed)
   * @param {number} detune - Pitch shift in cents (100 = 1 semitone)
   * @returns {AudioBufferSourceNode|null} - The source node (for stopping early)
   */
  playSound(name, volume = 1.0, playbackRate = 1.0, detune = 0) {
    const buffer = this.buffers.get(name);
    if (!buffer) {
      console.warn(`Sound "${name}" not loaded`);
      return null;
    }
    
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, this.context.currentTime);
    source.detune.setValueAtTime(detune, this.context.currentTime);
    
    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    source.start(this.context.currentTime);
    
    return source;
  }

  /**
   * Play a sound with fade in
   */
  playSoundWithFadeIn(name, volume = 1.0, fadeTime = 0.3) {
    const buffer = this.buffers.get(name);
    if (!buffer) return null;
    
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + fadeTime);
    
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    source.start(this.context.currentTime);
    
    return source;
  }

  /**
   * Play a looping sound (useful for background music)
   */
  playLoop(name, volume = 1.0) {
    const buffer = this.buffers.get(name);
    if (!buffer) return null;
    
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = buffer.duration;
    
    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    source.start(this.context.currentTime);
    
    return { source, gainNode };
  }

  /**
   * Stop a looping sound with fade out
   */
  stopLoop(loopData, fadeTime = 1.0) {
    if (!loopData) return;
    
    const { source, gainNode } = loopData;
    const currentTime = this.context.currentTime;
    
    gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeTime);
    source.stop(currentTime + fadeTime);
  }

  /**
   * Set master volume for all sounds
   */
  setMasterVolume(volume) {
    this.masterGain.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      this.context.currentTime
    );
  }

  /**
   * Check if a sound is loaded
   */
  isLoaded(name) {
    return this.buffers.has(name);
  }

  /**
   * Get list of all loaded sounds
   */
  getLoadedSounds() {
    return Array.from(this.buffers.keys());
  }

  /**
   * Unload a specific sound to free memory
   */
  unloadSound(name) {
    return this.buffers.delete(name);
  }

  /**
   * Clear all loaded sounds
   */
  clearAll() {
    this.buffers.clear();
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.clearAll();
    this.context.close();
  }
}
