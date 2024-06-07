const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const darkModeToggle = document.getElementById('darkModeToggle');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let darkMode = localStorage.getItem('darkMode') === 'enabled';

if (darkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
    enableDarkMode();
}

darkModeToggle.addEventListener('change', () => {
    darkMode = !darkMode;
    if (darkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
});

function enableDarkMode() {
    document.body.style.backgroundColor = 'black';
    document.body.style.color = 'white';
}

function disableDarkMode() {
    document.body.style.backgroundColor = 'white';
    document.body.style.color = 'black';
}

let cube = {
    x: 50,
    y: canvas.height / 2,
    width: 50,
    height: 50,
    dy: 0,
    gravity: 0.5,
    jumpPower: -10,
    tilt: 0,
    color: darkMode ? 'white' : 'blue'
};

let obstacles = [];
let frameCount = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameStarted = false;

function drawCube() {
    ctx.save();
    ctx.translate(cube.x + cube.width / 2, cube.y + cube.height / 2);
    ctx.rotate(cube.tilt * Math.PI / 180);
    ctx.fillStyle = cube.color;
    ctx.fillRect(-cube.width / 2, -cube.height / 2, cube.width, cube.height);
    ctx.restore();
}

function updateCube() {
    cube.dy += cube.gravity;
    cube.y += cube.dy;

    if (cube.dy > 0) {
        cube.tilt = Math.min(cube.dy * 2, 20); // Tilt downwards
    } else {
        cube.tilt = Math.max(cube.dy * 2, -20); // Tilt upwards
    }

    if (cube.y + cube.height > canvas.height) {
        cube.y = canvas.height - cube.height;
        cube.dy = 0;
    }
    if (cube.y < 0) {
        cube.y = 0;
        cube.dy = 0;
    }
}

function generateObstacles() {
    if (frameCount % 90 === 0) {
        let obstacleHeight = Math.random() * (canvas.height - 200) + 50;
        obstacles.push({
            x: canvas.width,
            y: 0,
            width: 50,
            height: obstacleHeight,
            color: darkMode ? 'white' : 'red'
        });

        let gap = 200;
        obstacles.push({
            x: canvas.width,
            y: obstacleHeight + gap,
            width: 50,
            height: canvas.height - obstacleHeight - gap,
            color: darkMode ? 'white' : 'red'
        });
    }

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= 5;

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
        }
    }
}

function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        ctx.fillStyle = obstacles[i].color;
        ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
    }
}

function detectCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        if (cube.x < obstacles[i].x + obstacles[i].width &&
            cube.x + cube.width > obstacles[i].x &&
            cube.y < obstacles[i].y + obstacles[i].height &&
            cube.y + cube.height > obstacles[i].y) {
            return true;
        }
    }
    return false;
}

function drawScore() {
    ctx.fillStyle = darkMode ? 'white' : 'black';
    ctx.font = '24px Arial';
    ctx.fillText(score, 10, canvas.height - 60);
    ctx.fillText('HI: ' + highScore, 10, canvas.height - 30);
}

function drawStartScreen() {
    ctx.fillStyle = darkMode ? 'white' : 'black';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press Space to Start', canvas.width / 2, canvas.height / 2);
}

function startGame() {
    gameStarted = true;
    frameCount = 0;
    score = 0;
    cube.y = canvas.height / 2;
    cube.dy = 0;
    obstacles = [];
    updateGame();
}

function updateGame() {
    if (!gameStarted) {
        drawStartScreen();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCube();
    updateCube();
    generateObstacles();
    drawObstacles();
    drawScore();

    if (detectCollision()) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        alert('Game Over! Your score: ' + score);
        document.location.reload();
    }

    frameCount++;
    requestAnimationFrame(updateGame);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted) {
            startGame();
        } else {
            cube.dy = cube.jumpPower;
        }
    }
});

updateGame();
