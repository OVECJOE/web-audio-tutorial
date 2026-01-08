# Web Audio Tutorial - Complete Code Examples

This repository contains all the code examples from the comprehensive Web Audio API tutorial "Mastering Web Audio: From Theory to Production-Ready Sound".

## 📁 Repository Structure

```
web-audio-tutorial/
├── 01-basic-sound-manager/     # SoundManager class from the chess game
├── 02-breakout-game/            # Complete Breakout game with audio
├── 03-advanced-techniques/      # Advanced audio examples
├── 04-audio-file-manager/       # Loading and playing audio files
├── 05-music-player/             # Background music with looping
├── 06-utilities/                # Utility classes and helpers
└── README.md                    # This file
```

## 🚀 Quick Start

### 1. Basic Sound Manager

The simplest way to get started with Web Audio:

```bash
cd 01-basic-sound-manager
# Open index.html in your browser
```

### 2. Breakout Game (Recommended Starting Point)

A complete, production-ready game with comprehensive audio:

```bash
cd 02-breakout-game
# Open index.html in your browser
```

### 3. Advanced Techniques

Explore oscillator detuning, filters, and sound design:

```bash
cd 03-advanced-techniques
# Open index.html in your browser
```

## 📚 What You'll Learn

- **Audio Physics**: Sample rates, waveforms, frequency, and amplitude
- **Web Audio API Architecture**: AudioContext, nodes, and audio graphs
- **Sound Synthesis**: Oscillators, envelopes, filters, and effects
- **Game Audio**: Spatial audio, pitch variation, musical motifs
- **Performance**: Memory management, autoplay policies, optimization
- **Production Best Practices**: Error handling, accessibility, UX

## 🎮 Featured Projects

### Breakout Game with Audio

A fully functional Breakout/Arkanoid game featuring:
- ✨ Pitch variation for realistic sounds
- 🎵 Spatial audio mapping (pitch varies by position)
- 🎼 Musical motifs for game states
- 🔊 Master volume and mute controls
- 🎯 Production-ready code structure

### Chess Sound System

The sound effects system from the article's case study:
- Move sounds with harmonic intervals
- Capture sounds with square wave aggression
- Check warnings with high-frequency alerts
- Victory/defeat melodies using music psychology

## 🛠️ Technical Requirements

- Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required
- Works offline after initial load
- Mobile-friendly (responsive design)

## 📖 Usage Examples

### Basic Sound Generation

```javascript
import { SoundManager } from './01-basic-sound-manager/SoundManager.js';

const audio = new SoundManager();

// Play a simple tone
audio.playTone(440, 0.5, 'sine', 0.3);

// Play chess game sounds
audio.playMove();
audio.playCapture();
audio.playCheck();
```

### Breakout Game

```javascript
import { BreakoutGame } from './02-breakout-game/BreakoutGame.js';

const canvas = document.getElementById('gameCanvas');
const game = new BreakoutGame(canvas);
game.gameLoop();
```

### Advanced Techniques

```javascript
import { AdvancedAudio } from './03-advanced-techniques/AdvancedAudio.js';

const audio = new AdvancedAudio();

// Detuned oscillators for rich sound
audio.playThickTone(440, 1.0);

// Filter sweep effect
audio.playFilteredSound(220, 2.0);
```

## 🎯 Key Concepts Demonstrated

### 1. Audio Graph Architecture
Learn how to connect nodes to create complex audio processing chains.

### 2. Lazy Initialization
Respect browser autoplay policies by creating AudioContext on user interaction.

### 3. ADSR Envelopes
Implement Attack, Decay, Sustain, Release for natural-sounding audio.

### 4. Spatial Audio
Use pitch mapping to convey spatial information through sound.

### 5. Music Psychology
Apply music theory to create emotionally resonant sound effects.

## 🔧 Advanced Features

### Audio File Loading
```javascript
import { AudioFileManager } from './04-audio-file-manager/AudioFileManager.js';

const manager = new AudioFileManager();
await manager.preloadSounds({
  explosion: '/sounds/explosion.mp3',
  powerup: '/sounds/powerup.mp3'
});

manager.playSound('explosion', 0.7);
```

### Background Music
```javascript
import { MusicPlayer } from './05-music-player/MusicPlayer.js';

const player = new MusicPlayer(audioContext);
player.play(musicBuffer, 0.5); // Volume: 0.5
player.stop(); // Fades out gracefully
```

### Sound Throttling
```javascript
import { ThrottledSound } from './06-utilities/ThrottledSound.js';

const throttledExplosion = new ThrottledSound(
  () => audio.playExplosion(),
  100 // Max 10 per second
);

throttledExplosion.play(); // Won't spam
```

## 📊 Performance Notes

- ✅ Single AudioContext per application
- ✅ Proper node cleanup and disposal
- ✅ Audio buffer memory < 50MB total
- ✅ Throttling for rapid-fire sounds
- ✅ Lazy initialization for faster startup
- ✅ Error handling for all audio operations

## ♿ Accessibility Features

- Visual alternatives for audio cues
- Mute/unmute toggle
- Persistent audio preferences (localStorage)
- Keyboard shortcuts (M for mute)
- Reasonable default volumes

## 🐛 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 34+     | ✅ Full |
| Firefox | 25+     | ✅ Full |
| Safari  | 14.1+   | ✅ Full |
| Edge    | 79+     | ✅ Full |

## 📝 License

MIT License - Feel free to use in personal and commercial projects.

## 🤝 Contributing

This repository is designed as a learning resource. Feel free to:
- Fork and experiment
- Submit improvements via pull requests
- Report issues or bugs
- Share your own audio projects

## 🔗 Additional Resources

- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Spec](https://www.w3.org/TR/webaudio/)
- [Tone.js Framework](https://tonejs.github.io/)
- [Freesound.org](https://freesound.org/) - Free sound effects

## 💬 Support

For questions or discussions about the tutorial:
- Read the full article: [Mastering Web Audio](https://wordarch.com/blog/mastering-web-audio)
- Open an issue in this repository
- Check the code comments for detailed explanations

---

**Happy Coding!** 🎵 May your applications sound as good as they look.
