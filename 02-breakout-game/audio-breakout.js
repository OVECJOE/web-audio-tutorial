// audio-breakout.js - Complete Breakout game with comprehensive audio

class BreakoutAudioEngine {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.masterVolume = 0.7;
  }

  init() {
    if (!this.context) {
      this.context = new AudioContext();
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return;
    
    try {
      this.init();
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.connect(gain);
      gain.connect(this.context.destination);
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.context.currentTime);
      
      const adjustedVolume = volume * this.masterVolume;
      gain.gain.setValueAtTime(adjustedVolume, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
      
      osc.start(this.context.currentTime);
      osc.stop(this.context.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e.message);
    }
  }

  // Paddle hits ball - satisfying "pock" sound
  paddleHit() {
    // Two-tone hit with slight pitch variation for realism
    const variation = (Math.random() - 0.5) * 20; // ±10 Hz variation
    this.playTone(220 + variation, 0.08, 'sine', 0.4);
    setTimeout(() => this.playTone(330 + variation, 0.05, 'sine', 0.3), 30);
  }

  // Ball hits wall - sharp bounce
  wallBounce() {
    this.playTone(440, 0.06, 'triangle', 0.25);
  }

  // Ball hits brick - destruction sound
  brickHit(row) {
    // Pitch varies by brick row - creates spatial audio cues
    // Higher rows = higher pitch
    const basePitch = 300 + (row * 50);
    this.playTone(basePitch, 0.12, 'square', 0.35);
    setTimeout(() => this.playTone(basePitch - 100, 0.08, 'square', 0.25), 60);
  }

  // Ball lost - descending "fail" sound
  ballLost() {
    [330, 277, 247, 196].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sawtooth', 0.3), i * 100);
    });
  }

  // Level complete - ascending fanfare
  levelComplete() {
    const melody = [262, 330, 392, 523]; // C, E, G, C (major chord)
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.4), i * 120);
    });
  }

  // Game over - dramatic descending scale
  gameOver() {
    const scale = [523, 494, 440, 392, 349, 330, 294, 262];
    scale.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'triangle', 0.35), i * 150);
    });
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}

// Game implementation
class BreakoutGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = new BreakoutAudioEngine();
    
    // Game state
    this.ball = { x: 300, y: 400, dx: 3, dy: -3, radius: 8 };
    this.paddle = { x: 250, y: 560, width: 100, height: 12, speed: 6 };
    this.bricks = this.createBricks();
    this.score = 0;
    this.lives = 3;
    this.gameActive = false;
    
    this.setupControls();
  }

  createBricks() {
    const bricks = [];
    const rows = 6;
    const cols = 10;
    const brickWidth = 58;
    const brickHeight = 20;
    const padding = 2;
    const offsetX = 15;
    const offsetY = 50;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        bricks.push({
          x: offsetX + col * (brickWidth + padding),
          y: offsetY + row * (brickHeight + padding),
          width: brickWidth,
          height: brickHeight,
          row: row,
          alive: true
        });
      }
    }
    return bricks;
  }

  setupControls() {
    // Keyboard controls
    this.keys = {};
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === ' ' && !this.gameActive) {
        this.start();
      }
    });
    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    
    // Mouse controls
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.paddle.x = e.clientX - rect.left - this.paddle.width / 2;
    });
  }

  start() {
    this.gameActive = true;
    this.gameLoop();
  }

  update() {
    // Paddle movement
    if (this.keys['ArrowLeft'] && this.paddle.x > 0) {
      this.paddle.x -= this.paddle.speed;
    }
    if (this.keys['ArrowRight'] && this.paddle.x < this.canvas.width - this.paddle.width) {
      this.paddle.x += this.paddle.speed;
    }

    // Ball movement
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Wall collisions
    if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
      this.ball.dx = -this.ball.dx;
      this.audio.wallBounce();
    }
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.dy = -this.ball.dy;
      this.audio.wallBounce();
    }

    // Paddle collision
    if (
      this.ball.y + this.ball.radius > this.paddle.y &&
      this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
      this.ball.x > this.paddle.x &&
      this.ball.x < this.paddle.x + this.paddle.width
    ) {
      // Calculate bounce angle based on where ball hits paddle
      const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
      const angle = (hitPos - 0.5) * Math.PI / 3; // -60° to +60°
      const speed = Math.sqrt(this.ball.dx ** 2 + this.ball.dy ** 2);
      
      this.ball.dx = speed * Math.sin(angle);
      this.ball.dy = -speed * Math.cos(angle);
      
      this.audio.paddleHit();
    }

    // Brick collisions
    this.bricks.forEach(brick => {
      if (!brick.alive) return;
      
      if (
        this.ball.x + this.ball.radius > brick.x &&
        this.ball.x - this.ball.radius < brick.x + brick.width &&
        this.ball.y + this.ball.radius > brick.y &&
        this.ball.y - this.ball.radius < brick.y + brick.height
      ) {
        this.ball.dy = -this.ball.dy;
        brick.alive = false;
        this.score += 10;
        this.audio.brickHit(brick.row);
        
        // Check for level complete
        if (this.bricks.every(b => !b.alive)) {
          this.audio.levelComplete();
          setTimeout(() => this.resetLevel(), 2000);
        }
      }
    });

    // Ball lost
    if (this.ball.y + this.ball.radius > this.canvas.height) {
      this.lives--;
      this.audio.ballLost();
      
      if (this.lives <= 0) {
        this.gameActive = false;
        this.audio.gameOver();
      } else {
        this.resetBall();
      }
    }
  }

  resetBall() {
    this.ball.x = 300;
    this.ball.y = 400;
    this.ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
    this.ball.dy = -3;
  }

  resetLevel() {
    this.bricks = this.createBricks();
    this.resetBall();
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0e27';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw paddle
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

    // Draw ball
    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw bricks
    this.bricks.forEach(brick => {
      if (!brick.alive) return;
      
      const hue = 60 - brick.row * 10; // Color gradient by row
      this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    });

    // Draw UI
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(`Score: ${this.score}`, 10, 25);
    this.ctx.fillText(`Lives: ${this.lives}`, 10, 45);

    if (!this.gameActive) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 24px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.lives <= 0 ? 'GAME OVER' : 'Press SPACE to start',
        this.canvas.width / 2,
        this.canvas.height / 2
      );
      this.ctx.textAlign = 'left';
    }
  }

  gameLoop() {
    if (this.gameActive) {
      this.update();
    }
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new BreakoutGame(canvas);
  
  // Audio controls
  document.getElementById('toggleAudio').addEventListener('click', (e) => {
    game.audio.enabled = !game.audio.enabled;
    e.target.textContent = game.audio.enabled ? '🔊 Sound On' : '🔇 Sound Off';
  });
  
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');
  
  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    game.audio.setVolume(volume);
    volumeValue.textContent = `${e.target.value}%`;
  });
  
  game.gameLoop();
});
