import type { CodeTemplates } from '../types';

export const codeTemplates: CodeTemplates = {
  myspace: {
    html: `<div class="myspace-profile">
  <div class="profile-header">
    <h1 class="profile-name">MySpace Profile</h1>
    <div class="mood">Current Mood: <span id="mood">😎</span></div>
  </div>
  <div class="profile-content">
    <div class="about-me">
      <h2>About Me:</h2>
      <p>Hi! I'm a cool person from the internet! 🎵</p>
      <p>I love music, friends, and having fun!</p>
    </div>
    <div class="friends">
      <h3>My Friends:</h3>
      <div class="friend-list">
        <span class="friend">Tom</span>
        <span class="friend">Sarah</span>
        <span class="friend">Mike</span>
        <span class="friend">+ 127 more</span>
      </div>
    </div>
  </div>
</div>`,
    css: `.myspace-profile {
  background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00);
  background-size: 400% 400%;
  animation: gradientShift 3s ease infinite;
  padding: 20px;
  border: 5px solid #000;
  font-family: 'Comic Sans MS', cursive;
  color: #fff;
  text-shadow: 2px 2px 0px #000;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.profile-header {
  text-align: center;
  margin-bottom: 20px;
}

.profile-name {
  font-size: 2.5em;
  margin: 0;
  text-decoration: underline;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.mood {
  font-size: 1.2em;
  margin-top: 10px;
}

.profile-content {
  background: rgba(0,0,0,0.3);
  padding: 15px;
  border: 2px solid #fff;
}

.about-me h2, .friends h3 {
  color: #ffff00;
  text-decoration: underline;
}

.friend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.friend {
  background: #ff00ff;
  color: #fff;
  padding: 5px 10px;
  border: 2px solid #000;
  border-radius: 15px;
  font-weight: bold;
}`,
    js: `const moods = ['😎', '😊', '🎵', '💖', '🌟', '🎉', '🔥', '💯'];
let currentMoodIndex = 0;

function changeMood() {
  currentMoodIndex = (currentMoodIndex + 1) % moods.length;
  document.getElementById('mood').textContent = moods[currentMoodIndex];
}

setInterval(changeMood, 3000);
document.getElementById('mood').addEventListener('click', changeMood);`
  },
  geocities: {
    html: `<div class="geocities-page">
  <h1 class="blink">WELCOME TO MY HOMEPAGE!</h1>
  <div class="visitor-counter">
    <p>You are visitor number: <span id="counter">0000001</span></p>
  </div>
  <div class="content">
    <p class="blink">This page is under construction!</p>
    <p>Please come back soon for updates!</p>
    <div class="spinning-star">⭐</div>
  </div>
  <div class="links">
    <a href="#" class="link">My Favorite Links</a>
    <a href="#" class="link">Guestbook</a>
    <a href="#" class="link">Email Me</a>
  </div>
</div>`,
    css: `.geocities-page {
  background: #000080;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 20px;
  border: 3px solid #00ff00;
  text-align: center;
}

.blink {
  animation: blink 1s infinite;
  color: #ffff00;
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.visitor-counter {
  background: #000;
  border: 2px solid #00ff00;
  padding: 10px;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
}

#counter {
  color: #ff0000;
  font-weight: bold;
  font-size: 1.5em;
}

.spinning-star {
  font-size: 3em;
  animation: spin 2s linear infinite;
  margin: 20px 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.links {
  margin-top: 30px;
}

.link {
  color: #00ffff;
  text-decoration: underline;
  margin: 0 10px;
  font-weight: bold;
}

.link:hover {
  color: #ffff00;
  text-decoration: none;
}`,
    js: `let visitorCount = 1;

function updateCounter() {
  const counter = document.getElementById('counter');
  counter.textContent = visitorCount.toString().padStart(7, '0');
  visitorCount++;
}

setInterval(updateCounter, 2000);`
  },
  marquee: {
    html: `<div class="marquee-container">
  <marquee behavior="scroll" direction="left" scrollamount="10">
    <span class="marquee-text">🌟 WELCOME TO MY AWESOME WEBSITE! 🌟</span>
  </marquee>
  <marquee behavior="scroll" direction="right" scrollamount="8">
    <span class="marquee-text">🎵 BEST SITE EVER! 🎵</span>
  </marquee>
  <div class="content">
    <h1>My Cool Page</h1>
    <p>This is the most amazing website you've ever seen!</p>
    <marquee behavior="alternate" direction="up" height="100">
      <div class="vertical-text">SCROLLING TEXT IS SO COOL!</div>
    </marquee>
  </div>
</div>`,
    css: `.marquee-container {
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  padding: 20px;
  font-family: 'Arial', sans-serif;
  color: #fff;
  text-shadow: 2px 2px 0px #000;
}

.marquee-text {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0 20px;
}

.content {
  background: rgba(0,0,0,0.5);
  padding: 20px;
  margin: 20px 0;
  border: 3px solid #fff;
}

.content h1 {
  color: #ffff00;
  text-align: center;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.vertical-text {
  font-size: 1.2em;
  font-weight: bold;
  color: #00ff00;
  text-align: center;
  padding: 20px;
}`,
    js: `function addMoreText() {
  const marquees = document.querySelectorAll('marquee');
  marquees.forEach(marquee => {
    const text = marquee.querySelector('.marquee-text');
    if (text) {
      text.textContent += ' 🎉 AWESOME! 🎉';
    }
  });
}

setInterval(addMoreText, 5000);`
  },
  guestbook: {
    html: `<div class="guestbook">
  <h1 class="title">GUESTBOOK</h1>
  <div class="entries">
    <div class="entry">
      <strong>Tom:</strong> <span class="date">12/25/1999</span><br>
      Cool site! Keep up the good work! 😎
    </div>
    <div class="entry">
      <strong>Sarah:</strong> <span class="date">12/24/1999</span><br>
      Merry Christmas! Your page rocks! 🎄
    </div>
    <div class="entry">
      <strong>Mike:</strong> <span class="date">12/23/1999</span><br>
      Awesome graphics! How did you do that? 🤯
    </div>
  </div>
  <div class="sign-form">
    <h3>Sign My Guestbook!</h3>
    <input type="text" id="name" placeholder="Your Name" class="input">
    <br><br>
    <textarea id="message" placeholder="Your Message" class="textarea"></textarea>
    <br><br>
    <button id="sign-btn" class="sign-btn">Sign Guestbook</button>
  </div>
</div>`,
    css: `.guestbook {
  background: #000080;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 20px;
  border: 3px solid #00ff00;
}

.title {
  text-align: center;
  color: #ffff00;
  font-size: 2em;
  animation: blink 1s infinite;
  text-decoration: underline;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.entries {
  background: #000;
  border: 2px solid #00ff00;
  padding: 15px;
  margin: 20px 0;
}

.entry {
  border-bottom: 1px solid #00ff00;
  padding: 10px 0;
  margin-bottom: 10px;
}

.date {
  color: #00ffff;
  font-size: 0.9em;
}

.sign-form {
  background: #000;
  border: 2px solid #00ff00;
  padding: 15px;
  margin-top: 20px;
}

.sign-form h3 {
  color: #ffff00;
  text-align: center;
}

.input, .textarea {
  background: #000;
  color: #00ff00;
  border: 2px solid #00ff00;
  padding: 5px;
  font-family: 'Courier New', monospace;
  width: 100%;
}

.sign-btn {
  background: #ff0000;
  color: #fff;
  border: 2px solid #fff;
  padding: 10px 20px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  cursor: pointer;
}

.sign-btn:hover {
  background: #ffff00;
  color: #000;
}`,
    js: `document.getElementById('sign-btn').addEventListener('click', function() {
  const name = document.getElementById('name').value;
  const message = document.getElementById('message').value;
  
  if (name && message) {
    const entries = document.querySelector('.entries');
    const newEntry = document.createElement('div');
    newEntry.className = 'entry';
    
    const today = new Date();
    const dateStr = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
    
    newEntry.innerHTML = '<strong>' + name + ':</strong> <span class="date">' + dateStr + '</span><br>' + message;
    entries.insertBefore(newEntry, entries.firstChild);
    
    document.getElementById('name').value = '';
    document.getElementById('message').value = '';
    newEntry.style.animation = 'blink 0.5s 3';
  }
});`
  },
  hitcounter: {
    html: `<div class="hitcounter">
  <div class="counter-display">
    <div class="digits">
      <span class="digit">0</span>
      <span class="digit">0</span>
      <span class="digit">0</span>
      <span class="digit">0</span>
      <span class="digit">0</span>
      <span class="digit">0</span>
      <span class="digit">1</span>
    </div>
  </div>
  <div class="counter-label">HITS</div>
  <div class="spinning-gear">⚙️</div>
</div>`,
    css: `.hitcounter {
  background: linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff);
  background-size: 400% 400%;
  animation: rainbow 2s ease infinite;
  padding: 20px;
  text-align: center;
  border: 5px solid #000;
  font-family: 'Arial', sans-serif;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.counter-display {
  background: #000;
  border: 3px solid #fff;
  padding: 10px;
  margin: 10px 0;
  display: inline-block;
}

.digits {
  display: flex;
  gap: 2px;
}

.digit {
  background: #000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 2em;
  font-weight: bold;
  padding: 5px 10px;
  border: 1px solid #00ff00;
  min-width: 30px;
  text-align: center;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.counter-label {
  color: #fff;
  font-size: 1.5em;
  font-weight: bold;
  text-shadow: 2px 2px 0px #000;
  margin: 10px 0;
}

.spinning-gear {
  font-size: 2em;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
    js: `let hitCount = 1;

function updateHitCounter() {
  const digits = document.querySelectorAll('.digit');
  const countStr = hitCount.toString().padStart(7, '0');
  
  for (let i = 0; i < digits.length; i++) {
    digits[i].textContent = countStr[i];
  }
  
  hitCount++;
  
  if (hitCount % 100 === 0) {
    document.querySelector('.hitcounter').style.animation = 'rainbow 0.5s ease 5';
  }
}

setInterval(updateHitCounter, 2000);`
  },
  underconstruction: {
    html: `<div class="construction">
  <div class="construction-sign">
    <h1>🚧 UNDER CONSTRUCTION 🚧</h1>
    <div class="worker">👷‍♂️</div>
    <p>This page is currently being built!</p>
    <p>Please check back soon!</p>
    <div class="progress-bar">
      <div class="progress" id="progress"></div>
    </div>
    <p>Progress: <span id="percentage">0%</span></p>
  </div>
  <div class="tools">
    🔨 ⚒️ 🛠️ 🔧 ⚙️
  </div>
</div>`,
    css: `.construction {
  background: #ffa500;
  color: #000;
  font-family: 'Arial', sans-serif;
  padding: 30px;
  text-align: center;
  border: 5px solid #000;
  position: relative;
}

.construction-sign {
  background: #ffff00;
  border: 3px solid #000;
  padding: 20px;
  margin: 20px 0;
}

.construction-sign h1 {
  font-size: 2em;
  margin: 0 0 20px 0;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.worker {
  font-size: 3em;
  animation: bounce 1s infinite;
  margin: 20px 0;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.progress-bar {
  background: #000;
  height: 30px;
  border: 2px solid #000;
  margin: 20px 0;
  position: relative;
}

.progress {
  background: #00ff00;
  height: 100%;
  width: 0%;
  transition: width 0.5s ease;
}

.tools {
  font-size: 2em;
  animation: spin 3s linear infinite;
  margin-top: 20px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
    js: `let progress = 0;

function updateProgress() {
  progress += Math.random() * 10;
  if (progress > 100) progress = 100;
  
  document.getElementById('progress').style.width = progress + '%';
  document.getElementById('percentage').textContent = Math.round(progress) + '%';
  
  if (progress >= 100) {
    document.querySelector('.construction-sign h1').textContent = '🎉 CONSTRUCTION COMPLETE! 🎉';
    document.querySelector('.worker').textContent = '🎊';
  }
}

setInterval(updateProgress, 1000);`
  },
  rainbow: {
    html: `<div class="rainbow-container">
  <h1 class="rainbow-text">RAINBOW TEXT IS AWESOME!</h1>
  <p class="rainbow-text">This is so cool and colorful!</p>
  <div class="rainbow-box">
    <p>Look at all these colors!</p>
  </div>
  <div class="sparkles">✨ ⭐ ✨ ⭐ ✨ ⭐ ✨</div>
</div>`,
    css: `.rainbow-container {
  background: #000;
  color: #fff;
  font-family: 'Arial', sans-serif;
  padding: 30px;
  text-align: center;
  border: 5px solid #fff;
}

.rainbow-text {
  font-size: 2em;
  font-weight: bold;
  background: linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow 2s ease infinite;
  text-shadow: 2px 2px 0px #000;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.rainbow-box {
  background: linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080);
  background-size: 400% 400%;
  animation: rainbow 2s ease infinite;
  padding: 20px;
  margin: 20px 0;
  border: 3px solid #fff;
  color: #000;
  font-weight: bold;
}

.sparkles {
  font-size: 2em;
  animation: sparkle 1s ease infinite;
  margin-top: 20px;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}`,
    js: `function addSparkles() {
  const sparkles = document.querySelector('.sparkles');
  sparkles.textContent += ' ✨';
  
  if (sparkles.textContent.length > 50) {
    sparkles.textContent = '✨ ⭐ ✨ ⭐ ✨ ⭐ ✨';
  }
}

setInterval(addSparkles, 3000);`
  },
  matrix: {
    html: `<div class="matrix-container">
  <canvas id="matrix-canvas"></canvas>
  <div class="matrix-text">
    <h1>WELCOME TO THE MATRIX</h1>
    <p>You are the chosen one!</p>
  </div>
</div>`,
    css: `.matrix-container {
  background: #000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 20px;
  position: relative;
  border: 2px solid #00ff00;
  overflow: hidden;
}

#matrix-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.matrix-text {
  position: relative;
  z-index: 2;
  text-align: center;
  background: rgba(0,0,0,0.8);
  padding: 20px;
  border: 1px solid #00ff00;
}

.matrix-text h1 {
  font-size: 2em;
  animation: blink 1s infinite;
  text-shadow: 0 0 10px #00ff00;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.matrix-text p {
  font-size: 1.2em;
  margin-top: 20px;
}`,
    js: `const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
const charArray = chars.split('');

const fontSize = 14;
const columns = canvas.width / fontSize;

const drops = [];
for (let i = 0; i < columns; i++) {
  drops[i] = 1;
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#00ff00';
  ctx.font = fontSize + 'px monospace';
  
  for (let i = 0; i < drops.length; i++) {
    const text = charArray[Math.floor(Math.random() * charArray.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

setInterval(drawMatrix, 50);`
  }
};

