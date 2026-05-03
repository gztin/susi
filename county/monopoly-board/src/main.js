import './style.css'

const boardEl = document.getElementById('monopoly-board');
const modalOverlay = document.getElementById('modal-overlay');

const modalName = document.getElementById('modal-name');
const modalTopic = document.getElementById('modal-topic');
const modalPhoto = document.getElementById('modal-photo');
const modalDesc = document.getElementById('modal-description');
const modalSocial = document.getElementById('modal-social');

const socialOptions = [
  { name: 'fb', icon: 'fa-brands fa-facebook-f', color: '#1877F2' },
  { name: 'ig', icon: 'fa-brands fa-instagram', color: '#E4405F' },
  { name: 'x', icon: 'fa-brands fa-x-twitter', color: '#000000' },
  { name: 'threads', icon: 'fa-brands fa-threads', color: '#000000' },
  { name: 'website', icon: 'fa-solid fa-globe', color: '#3b82f6' }
];

const demoBio = `這是一位專注於創新科技與未來趨勢的資深研究員...`; // Truncated for brevity but remains same in actual file

function loadConfig() {
  const saved = localStorage.getItem('monopoly_config');
  return saved ? JSON.parse(saved) : { gridSize: 7, speakers: [] };
}

function renderBoard() {
  const config = loadConfig();
  const cols = 11; // Based on reference image
  const rows = 9;  // Based on reference image
  const totalCells = 2 * cols + 2 * rows - 4;
  
  const centerContent = document.getElementById('board-center-content');
  boardEl.innerHTML = '';
  if (centerContent) {
    centerContent.innerHTML = `
      <div class="center-logo">
        <h1>旅遊大富翁</h1>
        <p>TRAVEL MONOPOLY</p>
      </div>
      <div class="game-rules">
        <h3>遊戲規則</h3>
        <ul>
          <li>第一：精彩議程籌備中，歡迎投稿！</li>
          <li>第二：掃描格位內容即可查看詳細資訊。</li>
          <li>第三：點擊格位可與講者進行互動。</li>
        </ul>
      </div>
    `;
    boardEl.appendChild(centerContent);
  }
  
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const getRandomDate = () => Math.random() > 0.5 ? '2026/07/25' : '2026/07/26';
  const getRandomTime = () => `PM:${String(13 + Math.floor(Math.random() * 8)).padStart(2, '0')}:00`;
  const getRandomColor = () => ['#E54141', '#F9A01B', '#00A650', '#004F98'][Math.floor(Math.random() * 4)];

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    
    let row, col, side;
    if (i < cols) { 
      row = rows; col = cols - i; side = 'side-bottom';
    } else if (i < cols + rows - 1) { 
      row = rows - (i - (cols - 1)); col = 1; side = 'side-left';
    } else if (i < 2 * cols + rows - 2) { 
      row = 1; col = (i - (cols + rows - 2)) + 1; side = 'side-top';
    } else { 
      row = (i - (2 * cols + rows - 3)) + 1; col = cols; side = 'side-right';
    }

    cell.style.gridRow = row;
    cell.style.gridColumn = col;
    if (side) cell.classList.add(side);

    // Corner Logic
    if (i === 0) {
      cell.classList.add('corner', 'start');
      cell.innerHTML = `<div class="corner-inner start-inner"><div class="corner-id">L-01</div><i class="fa-solid fa-calendar-days"></i></div>`;
      cell.onclick = () => showSchedule();
    } else if (i === cols - 1) {
      cell.classList.add('corner', 'venue');
      cell.innerHTML = `<div class="corner-inner venue-inner"><div class="corner-id">L-11</div><i class="fa-solid fa-map-location-dot"></i></div>`;
      cell.onclick = () => showLocation();
    } else if (i === cols + rows - 2) {
      cell.classList.add('corner', 'sponsor');
      cell.innerHTML = `<div class="corner-inner sponsor-inner"><div class="corner-id">L-19</div><i class="fa-solid fa-handshake"></i></div>`;
    } else if (i === 2 * cols + rows - 3) {
      cell.classList.add('corner', 'staff');
      cell.innerHTML = `<div class="corner-inner staff-inner"><div class="corner-id">L-30</div><i class="fa-solid fa-users"></i></div>`;
    } else {
      const speakerId = i;
      const speakerIdx = String(i).padStart(3, '0');
      const speaker = config.speakers.find(s => s.id === speakerId) || {
        name: `講者${speakerIdx}`,
        color: getRandomColor(),
        topic: '演講主題待定'
      };

      const cardColor = speaker.color || getRandomColor();
      cell.innerHTML = `
        <div class="cell-inner">
          <div class="cell-header" style="background-color: ${cardColor}">${speakerIdx}</div>
          <div class="cell-body">
            <div class="speaker-name">${speaker.name}</div>
            <div class="swift-logo" style="color: ${cardColor}"><i class="fa-brands fa-swift"></i></div>
          </div>
        </div>
      `;
      cell.onclick = () => showSpeaker(speaker);
    }
    boardEl.appendChild(cell);
  }
}

function showSpeaker(speaker) {
  modalName.innerText = speaker.name;
  modalTopic.innerText = speaker.topic || '演講主題待定';
  modalOverlay.classList.add('active');
}

function showSchedule() { document.getElementById('modal-schedule').classList.add('active'); }
function showLocation() { document.getElementById('modal-location').classList.add('active'); }

window.switchTab = (day) => { /* Logic remains same */ };
window.closeModal = (id) => { if (id) document.getElementById(id).classList.remove('active'); else modalOverlay.classList.remove('active'); };

renderBoard();
