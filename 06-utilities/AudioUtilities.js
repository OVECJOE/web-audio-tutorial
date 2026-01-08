/**
 * Throttled Sound
 * 
 * Prevents audio spam by limiting how frequently a sound can play
 * Essential for rapid-fire game events (bullets, collisions, etc.)
 */

export class ThrottledSound {
  /**
   * @param {Function} playFunction - The function that plays the sound
   * @param {number} minInterval - Minimum milliseconds between plays
   */
  constructor(playFunction, minInterval = 50) {
    this.playFunction = playFunction;
    this.minInterval = minInterval;
    this.lastPlayed = 0;
  }

  /**
   * Attempt to play the sound (will skip if too soon)
   * @returns {boolean} - Whether the sound actually played
   */
  play() {
    const now = Date.now();
    if (now - this.lastPlayed < this.minInterval) {
      return false; // Too soon, skip
    }
    
    this.lastPlayed = now;
    this.playFunction();
    return true;
  }

  /**
   * Reset the throttle timer
   */
  reset() {
    this.lastPlayed = 0;
  }

  /**
   * Change the throttle interval
   */
  setInterval(interval) {
    this.minInterval = Math.max(0, interval);
  }
}

/**
 * Audio Autoplay Unlocker
 * 
 * Handles browser autoplay policies gracefully
 */

export class AudioUnlocker {
  constructor(audioContext) {
    this.context = audioContext;
    this.unlocked = false;
    this.listeners = [];
  }

  /**
   * Attempt to unlock audio playback
   * Call this on first user interaction
   */
  async unlock() {
    if (this.unlocked) return true;
    
    try {
      // Resume if suspended
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      
      // Play silent sound to fully unlock
      const buffer = this.context.createBuffer(1, 1, 22050);
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.context.destination);
      source.start(0);
      
      this.unlocked = true;
      console.log('🔓 Audio unlocked');
      
      // Notify listeners
      this.listeners.forEach(callback => callback());
      
      return true;
    } catch (error) {
      console.error('Failed to unlock audio:', error);
      return false;
    }
  }

  /**
   * Register a callback for when audio is unlocked
   */
  onUnlock(callback) {
    if (this.unlocked) {
      callback();
    } else {
      this.listeners.push(callback);
    }
  }

  /**
   * Set up automatic unlock on user interaction
   */
  setupAutoUnlock() {
    const unlockHandler = () => {
      this.unlock();
      // Remove listeners after first unlock
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, unlockHandler);
      });
    };

    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, unlockHandler, { once: true });
    });
  }
}

/**
 * Audio Preferences Manager
 * 
 * Save/load user audio preferences to localStorage
 */

export class AudioPreferences {
  constructor(storageKey = 'audioPreferences') {
    this.storageKey = storageKey;
    this.preferences = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaults();
    } catch {
      return this.getDefaults();
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
      return true;
    } catch {
      return false;
    }
  }

  getDefaults() {
    return {
      enabled: true,
      masterVolume: 0.7,
      sfxVolume: 1.0,
      musicVolume: 0.5
    };
  }

  get(key) {
    return this.preferences[key];
  }

  set(key, value) {
    this.preferences[key] = value;
    this.save();
  }

  setEnabled(enabled) {
    this.set('enabled', enabled);
  }

  setMasterVolume(volume) {
    this.set('masterVolume', Math.max(0, Math.min(1, volume)));
  }

  setSfxVolume(volume) {
    this.set('sfxVolume', Math.max(0, Math.min(1, volume)));
  }

  setMusicVolume(volume) {
    this.set('musicVolume', Math.max(0, Math.min(1, volume)));
  }

  reset() {
    this.preferences = this.getDefaults();
    this.save();
  }
}

/**
 * Simple Audio Pool
 * 
 * Reuse audio nodes for frequently played sounds
 * Reduces garbage collection pressure
 */

export class AudioPool {
  constructor(audioContext, maxSize = 10) {
    this.context = audioContext;
    this.maxSize = maxSize;
    this.pool = [];
  }

  /**
   * Get or create a gain node
   */
  getGainNode() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.context.createGain();
  }

  /**
   * Return a gain node to the pool
   */
  releaseGainNode(node) {
    if (this.pool.length < this.maxSize) {
      node.disconnect();
      node.gain.setValueAtTime(1, this.context.currentTime);
      this.pool.push(node);
    }
  }

  /**
   * Clear the pool
   */
  clear() {
    this.pool.forEach(node => node.disconnect());
    this.pool = [];
  }
}
