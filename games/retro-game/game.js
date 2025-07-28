
const gameArea  = document.getElementById('gameArea');
const scoreEl   = document.getElementById('score');
const livesEl   = document.getElementById('lives');
const levelEl   = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const muteBtn = document.getElementById('muteBtn');
const overlay = document.getElementById('overlay');
const overlayMessage = document.getElementById('overlayMessage');
const textInput = document.getElementById('textInput');

let gameStarted = false;
let score = 0;
let lives = 3;
let level = 1;
let highScore = parseInt(localStorage.getItem('spellHighScore')) || 0;
let muted = false;
highScoreEl.textContent = highScore;
const LEVEL_UP_SCORE = 400; // points needed to level up

// A small set of words. 
const wordList = [
  'mickle', 'caliginous', 'bookcraft', 'brainish',
  'unfriend', 'hagride', 'slugabed', 'brabble', 'betwixt', 'elflock', 'banana',
  'Pismire', 'kuku', 'Groak', 'Twattle',
  'crapulous', 'jollux', 'Callipygian', 'Zenzizenzizenzic',
  'fire', 'wind', 'water', 'earth', 'light', 'dark', 'storm',
  'magic', 'spell', 'potion', 'dragon', 'wizard', 'ghost',
  'flame', 'curse', 'frost', 'shock', 'quake', 'flash', 'bolt',
  'inferno', 'tornado', 'whirlwind', 'tsunami', 'illusion', 'eruption',
  'avalanche', 'lightning', 'phantom', 'thunder', 'blizzard',
  'cataclysm', 'dimension', 'apocalypse', 'transmute',
   'Houppelande'
];

const monsters = [];            // Active monsters on screen
let lastSpawn = 0;               // Timestamp of last spawn
let spawnInterval = 2000;        // Time between spawns (ms)
let speed = 60;                  // Horizontal speed (pixels/sec)
let baseSpeed = 60;              // starting speed for wave
let speedWaveTime = 0;           // time accumulator for wave

// Floating aliens logic
const floatingAliensContainer = document.getElementById('floatingAliens');
let floatingAliens = [];
const FLOATING_ALIEN_EMOJIS = ['👾', '🛸', '👽'];
const FLOATING_ALIEN_BONUS = 100;
const MAX_FLOATING_ALIENS = 20;

// ──────────────────────────────
// Helper functions
// ──────────────────────────────
function getRandomWord() {
  return wordList[Math.floor(Math.random() * wordList.length)];
}

function createMonster() {
  const elem = document.createElement('div');
  elem.classList.add('monster');
  const word = getRandomWord();
  // Randomly choose obstacle type
  const types = ['block', 'ghost', 'alien'];
  const type = types[Math.floor(Math.random()*types.length)];
  if (type === 'ghost') {
    elem.classList.add('ghost');
  } else if (type === 'alien') {
    elem.classList.add('alien');
  }
  if(type==='block' || type==='ghost'){
    elem.style.background = `hsl(${Math.random()*360}, 70%, 60%)`;
    elem.textContent = word;
  } else if(type==='alien') {
    elem.textContent = `👾 ${word}`;
  }

  // Position starting off-screen on the right with random vertical position
  elem.style.left = gameArea.clientWidth + 'px';
  elem.style.top  = Math.random() * (gameArea.clientHeight - 40) + 'px';
  gameArea.appendChild(elem);
  playSound('spawn');
  return {
    elem,
    x: gameArea.clientWidth,    // current x-position
    word: word.toLowerCase()
  };
}

function destroyMonster(index) {
  const m = monsters[index];
  m.elem.classList.add('hit');
  setTimeout(() => gameArea.removeChild(m.elem), 300); // wait for fade-out
  monsters.splice(index, 1);
}

function playSound(type) {
  if (muted) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = 0.15;
  osc.type = 'sine';
  if (type === 'success')      osc.frequency.value = 700;
  else if (type === 'error')   osc.frequency.value = 180;
  else if (type === 'spawn')   osc.frequency.value = 400;
  else                         osc.frequency.value = 120;
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

function spawnFloatingAlien() {
  if (!gameStarted || floatingAliens.length >= MAX_FLOATING_ALIENS) return;
  const alien = document.createElement('div');
  alien.className = 'floating-alien';
  alien.setAttribute('tabindex', '0');
  alien.setAttribute('role', 'button');
  alien.setAttribute('aria-label', 'Bonus alien! Click or press Enter for points');
  alien.innerText = FLOATING_ALIEN_EMOJIS[Math.floor(Math.random()*FLOATING_ALIEN_EMOJIS.length)];
  // Random position around the floatingAliens container
  const containerW = floatingAliensContainer.clientWidth;
  const containerH = floatingAliensContainer.clientHeight;
  const x = Math.random() * (containerW - 48);
  const y = Math.random() * (containerH - 48);
  alien.style.left = x + 'px';
  alien.style.top = y + 'px';
  // Random animation duration for variety
  alien.style.animationDuration = (4 + Math.random()*3) + 's';

  function collectAlien(e) {
    e.stopPropagation();
    score += FLOATING_ALIEN_BONUS;
    scoreEl.textContent = score;
    playSound('success');
    alien.removeEventListener('click', collectAlien);
    alien.removeEventListener('keydown', keyCollect);
    floatingAliensContainer.removeChild(alien);
    floatingAliens = floatingAliens.filter(a => a !== alien);
  }
  function keyCollect(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      collectAlien(e);
    }
  }
  alien.addEventListener('click', collectAlien);
  alien.addEventListener('keydown', keyCollect);
  floatingAliensContainer.appendChild(alien);
  floatingAliens.push(alien);
  // Remove after a while if not collected
  setTimeout(() => {
    if (floatingAliens.includes(alien)) {
      floatingAliensContainer.removeChild(alien);
      floatingAliens = floatingAliens.filter(a => a !== alien);
    }
  }, 7000 + Math.random()*3000);
}

// Periodically spawn floating aliens
setInterval(() => {
  if (gameStarted && lives > 0) {
    if (Math.random() < 0.5) spawnFloatingAlien();
  }
}, 2500);

// Set instructions overlay before game starts
overlayMessage.innerHTML = `
  <strong>HOW TO PLAY</strong><br><br>
  Type the word on each monster<br>
  and press Enter or Space to destroy it.<br><br>
  If a monster reaches the left edge,<br>
  you lose a life.<br><br>
  Click floating aliens for bonus points!<br><br>
  <span style="color: #ffd700;">PRESS ENTER TO START</span>
`;

// Global keydown to start or restart
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (!gameStarted) {
      startGame();
    } else if (lives === 0) {
      // after game over reload
      window.location.reload();
    }
  }
});

function startGame() {
  gameStarted = true;
  overlay.classList.add('hide');
  setTimeout(() => {
    overlay.style.display = 'none';
    textInput.focus();
  }, 600);
  lastTime = null; // reset timer for smooth loop
}

// ──────────────────────────────
// Main game loop (runs ~60fps)
// ──────────────────────────────
let lastTime = null;
function gameLoop(timestamp) {
  if (!gameStarted) {
    requestAnimationFrame(gameLoop);
    return;
  }
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000; // seconds since last frame
  lastTime = timestamp;

  // Modulate speed in a wave pattern for entertainment
  speedWaveTime += dt;
  const wave = Math.sin(speedWaveTime * 0.7);
  speed = baseSpeed + 40 * wave;

  // Spawn logic
  if (timestamp - lastSpawn > spawnInterval) {
    monsters.push(createMonster());
    lastSpawn = timestamp;
    // Increase difficulty gradually
    if (spawnInterval > 600) spawnInterval -= 50;
    // speed += 1; // This line is removed as per the edit hint
  }

  // Move monsters
  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    m.x -= speed * dt;
    m.elem.style.left = m.x + 'px';

    // Check if monster exited left boundary
    if (m.x + m.elem.clientWidth < 0) {
      lives--;
      livesEl.textContent = lives;
      playSound('error');
      gameArea.removeChild(m.elem);
      monsters.splice(i, 1);
      if (lives === 0) {
        endGame();
        return; // Stop loop after game over
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

// ──────────────────────────────
// Typing input
// ──────────────────────────────
function handleInput(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const typed = textInput.value.trim().toLowerCase();
  if (!typed) return;

  // Find a monster whose word matches the typed spell
  const index = monsters.findIndex(m => m.word.toLowerCase() === typed);
  if (index !== -1) {
    score += typed.length * 10;   // simple scoring formula
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      localStorage.setItem('spellHighScore', highScore);
    }
    destroyMonster(index);
    playSound('success');
    if (score >= level * LEVEL_UP_SCORE) levelUp();
  }

  textInput.value = ''; // reset input field
}

// ──────────────────────────────
// Game over handling
// ──────────────────────────────
function endGame() {
  playSound('game-over');
  overlayMessage.innerHTML = `GAME OVER<br>Score: ${score}<br>Press Enter`;
  overlay.style.display = 'flex';
  overlay.classList.remove('hide');
  lives = 0; // ensure restart condition
  gameStarted = false;
}

function levelUp() {
  level++;
  levelEl.textContent = level;
  if (spawnInterval > 400) spawnInterval -= 100; // faster spawns
  // speed += 20; // This line is removed as per the edit hint
}

// ──────────────────────────────
// Start the game
// ──────────────────────────────
textInput.addEventListener('keydown', handleInput);
requestAnimationFrame(gameLoop);

muteBtn.addEventListener('click', () => {
  muted = !muted;
  muteBtn.textContent = muted ? 'Unmute Sound' : 'Mute Sound';
}); 
