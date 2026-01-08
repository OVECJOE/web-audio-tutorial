# Web Audio Tutorial Examples

This folder contains all code examples from the tutorial article "Mastering Web Audio: From Theory to Production-Ready Sound".

## 📂 Folders

### 01-basic-sound-manager/
The fundamental `SoundManager` class from the chess game.
- Demonstrates oscillator synthesis
- ADSR envelopes
- Lazy AudioContext initialization
- **Open `index.html` to try the interactive demo**

### 02-breakout-game/
Complete Breakout game with comprehensive audio system.
- Spatial audio mapping (pitch by position)
- Pitch variation for realism
- Musical motifs for game states
- Master volume controls
- **Open `index.html` to play the game**

### 03-advanced-techniques/
Advanced synthesis and filtering techniques.
- Oscillator detuning (chorus effect)
- Lowpass/highpass/bandpass filters
- Filter sweeps and resonance
- Bell synthesis with inharmonic partials
- White noise generation
- **Open `index.html` for interactive demos**

### 04-audio-file-manager/
Load and play audio files (MP3, OGG, WAV).
- Async file loading with progress
- Buffer caching
- Playback rate and pitch control
- Loop management with crossfading
- **See `AudioFileManager.js` for the class**

### 05-music-player/
Background music system with advanced controls.
- Looping with seamless transitions
- Fade in/fade out
- Crossfading between tracks
- Music ducking (for SFX)
- Pause/resume support
- **See `MusicPlayer.js` for the class**

### 06-utilities/
Utility classes for production apps.
- `ThrottledSound` - Prevent audio spam
- `AudioUnlocker` - Handle autoplay policies
- `AudioPreferences` - Save/load settings
- `AudioPool` - Node pooling for performance
- **See `AudioUtilities.js` for all utilities**

## 🚀 Quick Start

1. Clone or download this repository
2. Open any `index.html` file in a modern browser
3. No build tools or npm install required!
4. Works offline after initial load

## 📚 Learning Path

**Beginner:** Start with `01-basic-sound-manager/`
- Understand AudioContext and nodes
- Learn about oscillators and envelopes
- Play with the interactive tone generator

**Intermediate:** Move to `02-breakout-game/`
- See a complete game with audio
- Study spatial audio techniques
- Observe pitch variation and musical motifs

**Advanced:** Explore `03-advanced-techniques/`
- Master filters and synthesis
- Learn about detuning and resonance
- Create complex timbres

**Production:** Use `04-`, `05-`, and `06-`
- Load external audio files
- Implement background music
- Add production utilities

## 💡 Key Concepts

Each example demonstrates specific Web Audio concepts:

| Concept | Where to Find |
|---------|---------------|
| Basic oscillators | 01-basic-sound-manager |
| ADSR envelopes | 01-basic-sound-manager |
| Spatial audio | 02-breakout-game |
| Pitch variation | 02-breakout-game |
| Musical psychology | 02-breakout-game |
| Filter types | 03-advanced-techniques |
| Oscillator detuning | 03-advanced-techniques |
| Bell synthesis | 03-advanced-techniques |
| Audio file loading | 04-audio-file-manager |
| Music looping | 05-music-player |
| Crossfading | 05-music-player |
| Sound throttling | 06-utilities |
| Autoplay handling | 06-utilities |

## 🔧 Browser Compatibility

All examples work in:
- ✅ Chrome 34+
- ✅ Firefox 25+
- ✅ Safari 14.1+
- ✅ Edge 79+

## 📝 Code Style

All examples follow these principles:
- Clear, commented code
- ES6+ modern JavaScript
- No external dependencies
- Production-ready patterns
- Error handling included

## 🤝 Usage

Feel free to:
- Use in personal or commercial projects
- Modify and extend the code
- Learn and experiment
- Share with others

## 📖 Tutorial Reference

Each code example is explained in detail in the full tutorial article. The article covers:
- Physics of digital sound
- Web Audio API architecture
- Line-by-line code breakdowns
- Music theory and psychology
- Performance optimization
- Production best practices

## 💬 Questions?

If you're stuck or have questions:
1. Read the code comments (they're detailed!)
2. Check the browser console for errors
3. Refer back to the tutorial article
4. Experiment with the parameters

---

**Happy coding!** 🎵 Build something amazing with Web Audio.
