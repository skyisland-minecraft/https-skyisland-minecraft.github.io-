const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 600;
const HEIGHT = 436;

// Load images
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

const playerImgs = [1, 2, 3, 4].map(i => loadImage(`player_${i}.png`));
const obstacleImg = loadImage('obstacle.png');
const coinImg = loadImage('coin.png');
const backgroundImgs = [1, 2, 3].map(i => loadImage(`background_${i}.png`));
const powerupImgs = {
    'invincibility': loadImage('powerup_invincibility.png'),
    'magnet': loadImage('powerup_magnet.png'),
    'double_jump': loadImage('powerup_double_jump.png')
};

// Player class
class Player {
    constructor() {
        this.images = playerImgs;
        this.index = 0;
        this.image = this.images[this.index];
        this.width = 50;
        this.height = 50;
        this.x = WIDTH / 2 - this.width / 2;
        this.y = HEIGHT - this.height - 10;
        this.speed = 5;
        this.jumpSpeed = 10;
        this.isJumping = false;
        this.gravity = 1;
        this.dy = 0;
        this.coinsCollected = 0;
        this.poweredUp = null;
        this.powerupTime = 0;
        this.lives = 3;
        this.scoreMultiplier = 1;
        this.achievements = new Set();
        this.canDoubleJump = false;
        this.doubleJumpUsed = false;
    }

    move(dx) {
        this.x += dx;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > WIDTH) this.x = WIDTH - this.width;
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.dy = -15;
        } else if (this.canDoubleJump && !this.doubleJumpUsed) {
            this.doubleJumpUsed = true;
            this.dy = -15;
        }
    }

    applyGravity() {
        if (this.isJumping) {
            this.y += this.dy;
            this.dy += this.gravity;
            if (this.y + this.height >= HEIGHT - 10) {
                this.y = HEIGHT - this.height - 10;
                this.isJumping = false;
                this.doubleJumpUsed = false;
                this.dy = 0;
            }
        }
    }

    update() {
        this.index = (this.index + 1) % this.images.length;
        this.image = this.images[this.index];
        if (this.poweredUp && Date.now() > this.powerupTime) {
            this.poweredUp = null;
            this.canDoubleJump = false;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Obstacle class
class Obstacle {
    constructor() {
        this.image = obstacleImg;
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (WIDTH - this.width);
        this.y = -this.height;
        this.speed = Math.random() * 4 + 4;
    }

    move() {
        this.y += this.speed;
        if (this.y > HEIGHT) {
            this.y = -this.height;
            this.x = Math.random() * (WIDTH - this.width);
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Coin class
class Coin {
    constructor() {
        this.image = coinImg;
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (WIDTH - this.width);
        this.y = -this.height;
        this.speed = Math.random() * 4 + 4;
    }

    move() {
        this.y += this.speed;
        if (this.y > HEIGHT) {
            this.y = -this.height;
            this.x = Math.random() * (WIDTH - this.width);
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// PowerUp class
class PowerUp {
    constructor(type) {
        this.type = type;
        this.image = powerupImgs[type];
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (WIDTH - this.width);
        this.y = -this.height;
        this.speed = Math.random() * 4 + 4;
    }

    move() {
        this.y += this.speed;
        if (this.y > HEIGHT) {
            this.y = -this.height;
            this.x = Math.random() * (WIDTH - this.width);
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Game class
class Game {
    constructor() {
        this.player = new Player();
        this.obstacles = [];
        this.coins = [];
        this.powerups = [];
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.level = 1;
        this.backgroundIndex = 0;
        this.paused = false;
        this.running = true;

        for (let i = 0; i < 5; i++) {
            this.obstacles.push(new Obstacle());
        }

        for (let i = 0; i < 3; i++) {
            this.coins.push(new Coin());
        }

        this.powerups.push(new PowerUp('invincibility'));
        this.update();
    }

    loadHighScore() {
        return localStorage.getItem('highScore') || 0;
    }

    saveHighScore() {
        localStorage.setItem('highScore', this.highScore);
    }

    togglePause() {
        this.paused = !this.paused;
    }

    checkCollisions() {
        this.obstacles.forEach(obstacle => {
            if (this.player.x < obstacle.x + obstacle.width &&
                this.player.x + this.player.width > obstacle.x &&
                this.player.y < obstacle.y + obstacle.height &&
                this.player.y + this.player.height > obstacle.y) {
                this.player.lives -= 1;
                if (this.player.lives <= 0) {
                    this.running = false;
                }
            }
        });

        this.coins.forEach((coin, index) => {
            if (this.player.x < coin.x + coin.width &&
                this.player.x + this.player.width > coin.x &&
                this.player.y < coin.y + coin.height &&
                this.player.y + this.player.height > coin.y) {
                this.player.coinsCollected += 1;
                this.coins.splice(index, 1);
                this.coins.push(new Coin());
            }
        });

        this.powerups.forEach((powerup, index) => {
            if (this.player.x < powerup.x + powerup.width &&
                this.player.x + this.player.width > powerup.x &&
                this.player.y < powerup.y + powerup.height &&
                this.player.y + this.player.height > powerup.y) {
                this.player.poweredUp = powerup.type;
                this.player.powerupTime = Date.now() + 5000;
                if (powerup.type === 'double_jump') {
                    this.player.canDoubleJump = true;
                }
                this.powerups.splice(index, 1);
                this.powerups.push(new PowerUp('double_jump'));
            }
        });
    }

    update() {
        if (this.running && !this.paused) {
            this.player.applyGravity();
            this.player.update();
            this.obstacles.forEach(obstacle => obstacle.move());
            this.coins.forEach(coin => coin.move());
            this.powerups.forEach(powerup => powerup.move());
            this.checkCollisions();

            if (this.player.coinsCollected % 10 === 0 && this.player.coinsCollected > 0) {
                this.level += 1;
                this.player.coinsCollected = 0;
                this.obstacles.push(new Obstacle());
            }

            this.score += 1;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.saveHighScore();
            }
        }

        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    draw() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.drawImage(backgroundImgs[this.backgroundIndex], 0, 0, WIDTH, HEIGHT);

        this.player.draw();
        this.obstacles.forEach(obstacle => obstacle.draw());
        this.coins.forEach(coin => coin.draw());
        this.powerups.forEach(powerup => powerup.draw());

        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${this.score}`, 10, 20);
        ctx.fillText(`High Score: ${this.highScore}`, 10, 50);
        ctx.fillText(`Level: ${this.level}`, 10, 80);
        ctx.fillText(`Lives: ${this.player.lives}`, 10, 110);
    }
}

const game = new Game();

document.addEventListener('keydown', e => {
    switch (e.code) {
        case 'ArrowLeft':
            game.player.move(-game.player.speed);
            break;
        case 'ArrowRight':
            game.player.move(game.player.speed);
            break;
        case 'Space':
            game.player.jump();
            break;
        case 'KeyP':
            game.togglePause();
            break;
    }
});
