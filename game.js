const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const imagePaths = {
    player: 'player.png',
    obstacle: 'obstacle.png',
    coin: 'coin.png',
    background: 'background.png'
};

const images = {};

function loadImages(paths, callback) {
    let loadedImages = 0;
    const totalImages = Object.keys(paths).length;

    Object.keys(paths).forEach(key => {
        const img = new Image();
        img.src = paths[key];
        img.onload = () => {
            images[key] = img;
            loadedImages++;
            if (loadedImages === totalImages) {
                callback();
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${paths[key]}`);
        };
    });
}

class Player {
    constructor() {
        this.x = WIDTH / 2 - 25;
        this.y = HEIGHT - 100;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
        this.lives = 3;
    }

    draw() {
        ctx.drawImage(images.player, this.x, this.y, this.width, this.height);
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

class Obstacle {
    constructor() {
        this.x = Math.random() * (WIDTH - 50);
        this.y = 0;
        this.width = 50;
        this.height = 50;
        this.speed = 3;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.drawImage(images.obstacle, this.x, this.y, this.width, this.height);
    }
}

class Game {
    constructor() {
        this.player = new Player();
        this.obstacles = [];
        this.score = 0;
        this.highScore = 0;
        this.level = 1;
        this.paused = false;
    }

    start() {
        this.update();
    }

    update() {
        if (this.paused) return;

        this.obstacles.forEach(obstacle => obstacle.update());

        if (Math.random() < 0.02) {
            this.obstacles.push(new Obstacle());
        }

        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    draw() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.drawImage(images.background, 0, 0, WIDTH, HEIGHT);

        this.player.draw();
        this.obstacles.forEach(obstacle => obstacle.draw());

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
            game.paused = !game.paused;
            break;
    }
});

loadImages(imagePaths, () => {
    console.log('All images loaded, starting game...');
    game.start();
});
