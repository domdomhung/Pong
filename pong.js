// Retro Pong Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const levelSelect = document.getElementById('level');

// Game settings
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 70;
const BALL_SIZE = 10;
const PLAYER_SPEED = 5;
const WIN_SCORE = 5;

// Bot difficulty settings
const BOT_LEVELS = [
    { reaction: 0.12, speed: 3 },    // Easy
    { reaction: 0.08, speed: 4 },    // Medium
    { reaction: 0.04, speed: 5 },    // Hard
    { reaction: 0.01, speed: 7 }     // Impossible
];

let gameState = 'menu';
let level = 0;
let playerScore = 0;
let botScore = 0;
let upPressed = false;
let downPressed = false;

let player, bot, ball;

function resetGame() {
    playerScore = 0;
    botScore = 0;
    resetPositions();
}

function resetPositions() {
    player = {
        x: 10,
        y: canvas.height / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: PLAYER_SPEED
    };
    bot = {
        x: canvas.width - 10 - PADDLE_WIDTH,
        y: canvas.height / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: BOT_LEVELS[level].speed,
        reaction: BOT_LEVELS[level].reaction,
        targetY: canvas.height / 2 - PADDLE_HEIGHT / 2
    };
    ball = {
        x: canvas.width / 2 - BALL_SIZE / 2,
        y: canvas.height / 2 - BALL_SIZE / 2,
        size: BALL_SIZE,
        speedX: Math.random() > 0.5 ? 4 : -4,
        speedY: (Math.random() - 0.5) * 6
    };
}

function drawRect(x, y, w, h, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 20) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, '#888');
    }
}

function drawText(text, x, y, size = 32, color = '#fff') {
    ctx.fillStyle = color;
    ctx.font = `${size}px Courier New`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(player.x, player.y, player.width, player.height);
    drawRect(bot.x, bot.y, bot.width, bot.height);
    drawRect(ball.x, ball.y, ball.size, ball.size);
    drawText(playerScore, canvas.width / 4, 40, 32);
    drawText(botScore, 3 * canvas.width / 4, 40, 32);
    if (gameState === 'over') {
        drawText('Game Over', canvas.width / 2, canvas.height / 2 - 20, 36, '#ff0');
        drawText(playerScore > botScore ? 'You Win!' : 'Bot Wins!', canvas.width / 2, canvas.height / 2 + 20, 28, '#0ff');
        drawText('Press Start to Play Again', canvas.width / 2, canvas.height / 2 + 60, 20, '#fff');
    }
}

function update() {
    if (gameState !== 'playing') return;
    // Player movement
    if (upPressed) player.y -= player.speed;
    if (downPressed) player.y += player.speed;
    // Clamp player paddle
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

    // Bot AI
    if (Math.abs(ball.y - (bot.y + bot.height / 2)) > bot.reaction * canvas.height) {
        if (ball.y < bot.y + bot.height / 2) {
            bot.y -= bot.speed;
        } else if (ball.y > bot.y + bot.height / 2) {
            bot.y += bot.speed;
        }
    }
    // Clamp bot paddle
    bot.y = Math.max(0, Math.min(canvas.height - bot.height, bot.y));

    // Ball movement
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Top/bottom collision
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
        ball.speedY *= -1;
    }

    // Paddle collision
    if (ball.x <= player.x + player.width &&
        ball.y + ball.size >= player.y &&
        ball.y <= player.y + player.height &&
        ball.x > player.x) {
        ball.speedX *= -1;
        // Add some spin
        let collidePoint = (ball.y + ball.size / 2) - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        ball.speedY = collidePoint * 5;
    }
    if (ball.x + ball.size >= bot.x &&
        ball.y + ball.size >= bot.y &&
        ball.y <= bot.y + bot.height &&
        ball.x < bot.x + bot.width) {
        ball.speedX *= -1;
        let collidePoint = (ball.y + ball.size / 2) - (bot.y + bot.height / 2);
        collidePoint = collidePoint / (bot.height / 2);
        ball.speedY = collidePoint * 5;
    }

    // Score
    if (ball.x < 0) {
        botScore++;
        if (botScore >= WIN_SCORE) {
            gameState = 'over';
        } else {
            resetPositions();
        }
    }
    if (ball.x > canvas.width) {
        playerScore++;
        if (playerScore >= WIN_SCORE) {
            gameState = 'over';
        } else {
            resetPositions();
        }
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') upPressed = true;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') downPressed = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') upPressed = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') downPressed = false;
});

startBtn.addEventListener('click', () => {
    level = parseInt(levelSelect.value);
    resetGame();
    gameState = 'playing';
});

// Initial draw
resetGame();
draw();
requestAnimationFrame(gameLoop); 