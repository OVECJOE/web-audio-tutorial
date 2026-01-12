class BreakoutAudioEngine {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.masterVolume = 0.7;
    }

    init() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled) return;

        this.init();

        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        try {
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

            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
            };
        } catch (e) {
            console.warn('Audio playback failed:', e.message);
        }
    }

    paddleHit() {
        const variation = (Math.random() - 0.5) * 20;
        this.playTone(220 + variation, 0.08, 'sine', 0.4);
        setTimeout(() => this.playTone(330 + variation, 0.05, 'sine', 0.3), 50);
    }

    wallBounce() {
        this.playTone(440, 0.06, 'triangle', 0.25);
    }

    brickHit(row) {
        const basePitch = 330 + (row * 50);
        this.playTone(basePitch, 0.12, 'square', 0.35);
        setTimeout(() => this.playTone(basePitch - 100, 0.08, 'square', 0.25), 60);
    }

    ballLost() {
        [330, 277, 247, 196].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sawtooth', 0.3), i * 100);
        });
    }

    levelComplete() {
        const melody = [262, 330, 392, 523];
        melody.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.4), i * 120);
        });
    }

    gameOver() {
        const scale = [523, 494, 392, 349, 330, 294, 262];
        scale.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'triangle', 0.35), i * 150);
        });
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled && this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

class BreakoutGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audio = new BreakoutAudioEngine();

        this.ball = { x: 300, y: 352, dx: 3, dy: -3, radius: 8 };
        this.paddle = { x: 250, y: 360, width: 100, height: 12, speed: 8 };
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
        const brickHeight = 20;
        const padding = 2;
        const offsetX = 10;
        const offsetY = 60;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const totalPadding = (cols - 1) * padding + offsetX * 2;
                const brickWidth = (this.canvas.width - totalPadding) / cols;
                bricks.push({
                    x: offsetX + col * (brickWidth + padding),
                    y: offsetY + row * (brickHeight + padding),
                    width: brickWidth,
                    height: brickHeight,
                    row,
                    alive: true
                });
            }
        }
        return bricks;
    }

    setupControls() {
        this.keys = {};
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                if (!this.gameActive && this.lives > 0) {
                    this.start();
                } else if (this.lives <= 0) {
                    this.lives = 3;
                    this.score = 0;
                    this.resetLevel();
                    this.start();
                }
            }
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            let newX = e.clientX - rect.left - this.paddle.width / 2;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, newX));
        });
    }

    start() {
        this.gameActive = true;
        if (this.audio.context && this.audio.context.state === 'suspended') {
            this.audio.context.resume();
        }
    }

    update() {
        if (this.keys['ArrowLeft'] && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['ArrowRight'] && this.paddle.x < this.canvas.width - this.paddle.width) {
            this.paddle.x += this.paddle.speed;
        }

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
            this.audio.wallBounce();
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = Math.abs(this.ball.dy);
            this.audio.wallBounce();
        }

        if (
            this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width
        ) {
            this.ball.y = this.paddle.y - this.ball.radius;

            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI / 3;
            const speed = Math.sqrt(this.ball.dx ** 2 + this.ball.dy ** 2);

            this.ball.dx = speed * Math.sin(angle);
            this.ball.dy = -speed * Math.cos(angle);
            this.audio.paddleHit();
        }

        this.bricks.some(brick => {
            if (!brick.alive) return false;

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

                if (this.bricks.every(b => !b.alive)) {
                    this.audio.levelComplete();
                    setTimeout(() => this.resetLevel(), 2000);
                }
                return true;
            }
            return false;
        });

        if (this.ball.y - this.ball.radius > this.canvas.height) {
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
        this.ball.x = this.canvas.width / 2;
        this.ball.y = 352;
        this.ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = -3;
        this.gameActive = false;
    }

    resetLevel() {
        this.bricks = this.createBricks();
        this.resetBall();
    }

    draw() {
        this.ctx.fillStyle = "#0a0e27";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.bricks.forEach(brick => {
            if (!brick.alive) return;
            const hue = 60 - brick.row * 10;
            this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        });

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
            
            const message = this.lives <= 0 ? 'GAME OVER' : 'Press SPACE to Start';
            this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
            
            if (this.lives <= 0) {
                this.ctx.font = '16px monospace';
                this.ctx.fillText('Press SPACE to Restart', this.canvas.width / 2, this.canvas.height / 2 + 30);
            }
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

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new BreakoutGame(canvas);

    document.getElementById('toggleAudio').addEventListener('click', (e) => {
        const newState = !game.audio.enabled;
        game.audio.setEnabled(newState);
        e.target.textContent = newState ? '🔊 Sound On' : '🔇 Sound Off';
    });

    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        game.audio.setVolume(e.target.value / 100);
    });

    game.gameLoop();
});
