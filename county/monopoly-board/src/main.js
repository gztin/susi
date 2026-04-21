import './style.css'

const boardEl = document.getElementById('monopoly-board');
const modalOverlay = document.getElementById('modal-overlay');
const closeBtn = document.getElementById('close-btn');

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

// Initial demo data
const DEFAULT_CONFIG = {
  gridSize: 7, // 7x7
  speakers: []
};

// Generate demo descriptions
const demoBio = `這是一位專注於創新科技與未來趨勢的資深研究員。在過去的十年中，他在人工智慧領域取得了卓越的成就，並多次在國際會議上發表關鍵性演說。他的演講風格生動有趣，擅長將複雜的技術原理轉化為通俗易懂的故事。此次演講他將分享關於大數據如何改變城市生活的最新洞見。

除了技術研究，他還熱衷於推廣科技教育，幫助更多年輕人理解科技的力量。他相信透過跨領域的合作，我們能夠創造一個更美好、更智慧的未來環境。他曾參與多個全球性開源專案，並獲得過多項國際設計大獎。

今天的專題講演將從實務操作的角度出發，深入探討產業轉型的痛點與機遇。讀者將在接下來的三百字中了解到，演講內容不僅包含理論架構，更有大量的實戰案例分享。這是一場不容錯過的思維盛宴，旨在啟發每一位現場聽眾的創造力。這段文字旨在展示排版效果，內容豐富且結構完整，足以填補展示空間並呈現最專業的視覺呈現方式。`;

function loadConfig() {
  const saved = localStorage.getItem('monopoly_config');
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
}

function renderBoard() {
  const config = loadConfig();
  const cols = 12; 
  const rows = 5; 
  const totalCells = 2 * cols + 2 * rows - 4;
  
  // Clean up board except for center content
  const centerContent = document.getElementById('board-center-content');
  boardEl.innerHTML = '';
  if (centerContent) boardEl.appendChild(centerContent);
  
  // Set CSS Grid Template - wider side columns for landscape side cards
  boardEl.style.gridTemplateColumns = `2fr repeat(${cols - 2}, 1fr) 2fr`;
  boardEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  // Random Data Helpers
  const getRandomDate = () => Math.random() > 0.5 ? '2026/07/25' : '2026/07/26';
  const getRandomTime = () => {
    const hours = Math.floor(Math.random() * 8) + 1; // 1 to 8 PM
    return `PM:${String(12+hours).padStart(2, '0')}:00`;
  };
  const getRandomColor = () => {
    const colors = ['#E54141', '#F9A01B', '#00A650', '#004F98']; // Red, Yellow, Green, Blue
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Logic to place cells in clockwise order starting from Bottom-Right
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    
    let row, col, side;
    
    if (i < cols) { 
      // Bottom row (Right to Left)
      row = rows;
      col = cols - i;
      side = 'side-bottom';
    } else if (i < cols + rows - 1) { 
      // Left column (Bottom to Top)
      row = rows - (i - (cols - 1));
      col = 1;
      side = 'side-left';
    } else if (i < 2 * cols + rows - 2) { 
      // Top row (Left to Right)
      row = 1;
      col = (i - (cols + rows - 2)) + 1;
      side = 'side-top';
    } else { 
      // Right column (Top to Bottom)
      row = (i - (2 * cols + rows - 3)) + 1;
      col = cols;
      side = 'side-right';
    }

    cell.style.gridRow = row;
    cell.style.gridColumn = col;
    if (side) cell.classList.add(side);

    if (i === 0) {
      cell.classList.add('corner', 'start');
      cell.innerHTML = `
        <div class="corner-inner start-inner">
          <div class="corner-icon"><i class="fa-solid fa-calendar-days"></i></div>
          <div>活動內容</div>
        </div>
      `;
      cell.onclick = () => showSchedule();
    } else if (i === cols - 1) {
      cell.classList.add('corner', 'venue');
      cell.innerHTML = `
        <div class="corner-inner venue-inner">
          <div class="corner-icon"><i class="fa-solid fa-map-location-dot"></i></div>
          <div>活動地點</div>
        </div>
      `;
      cell.onclick = () => showLocation();
    } else if (i === cols + rows - 2) {
      cell.classList.add('corner', 'sponsor');
      cell.innerHTML = `
        <div class="corner-inner sponsor-inner">
          <div class="corner-icon"><i class="fa-solid fa-handshake"></i></div>
          <div>贊助廠商</div>
        </div>
      `;
    } else if (i === 2 * cols + rows - 3) {
      cell.classList.add('corner', 'staff');
      cell.innerHTML = `
        <div class="corner-inner staff-inner">
          <div class="corner-icon"><i class="fa-solid fa-users"></i></div>
          <div>工作人員</div>
        </div>
      `;
    } else {
      const speakerId = i;
      const speakerIdx = String(i).padStart(3, '0');
      const speaker = config.speakers.find(s => s.id === speakerId) || {
        name: `講者${speakerIdx}`,
        topic: '演講主題待定',
        photo: `https://picsum.photos/seed/${i}/200`,
        bio: demoBio,
        date: getRandomDate(),
        time: getRandomTime(),
        color: getRandomColor()
      };

      const cardColor = speaker.color || getRandomColor();
      cell.innerHTML = `
        <div class="cell-inner" style="color: ${cardColor}">
          <div class="cell-header" style="background-color: ${cardColor}">${speakerIdx}</div>
          <div class="cell-body">
            <div class="swift-logo" style="color: ${cardColor}"><i class="fa-brands fa-swift"></i></div>
            <div class="session-info">
              <div class="date">${speaker.date || getRandomDate()}</div>
              <div class="time">${speaker.time || getRandomTime()}</div>
            </div>
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
  modalTopic.innerText = speaker.topic;
  modalPhoto.src = speaker.photo;
  modalDesc.innerText = speaker.bio;
  
  // Randomly select 3 social icons
  const shuffled = [...socialOptions].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  
  modalSocial.innerHTML = selected.map(s => `
    <div class="social-icon" style="background-color: ${s.color}">
      <i class="${s.icon}"></i>
    </div>
  `).join('');

  modalOverlay.classList.add('active');
}

function showSchedule() {
  document.getElementById('modal-schedule').classList.add('active');
  switchTab(1); // Reset to Day 1
}

function showLocation() {
  document.getElementById('modal-location').classList.add('active');
}

// Global functions for modal interactions (needed for inline onclick)
window.switchTab = (day) => {
  const content = document.getElementById('schedule-content');
  const btns = document.querySelectorAll('.schedule-tabs .tab-btn');
  
  btns.forEach(b => b.classList.remove('active'));
  if (day === 1) {
    btns[0].classList.add('active');
    content.innerHTML = `
      <div class="cfp-announcement">
        <h2>徵稿正式開跑！</h2>
        <p>第一天：精彩議程籌備中。如果你有吸睛的主題，歡迎加入我們！</p>
        <a href="https://forms.gle/rocYKo7zQuKiGvTx9" target="_blank" class="cta-link modal-cta">立即投稿</a>
      </div>
    `;
  } else {
    btns[1].classList.add('active');
    content.innerHTML = `
      <div class="cfp-announcement">
        <h2>第二天活動</h2>
        <p>第二天：更多精彩內容敬請期待。</p>
        <a href="https://forms.gle/rocYKo7zQuKiGvTx9" target="_blank" class="cta-link modal-cta">立即投稿</a>
      </div>
    `;
  }
};

window.closeModal = (id) => {
  if (id) {
    document.getElementById(id).classList.remove('active');
  } else {
    modalOverlay.classList.remove('active');
  }
};

// Close modal when clicking outside content
window.onclick = (event) => {
  if (event.target.classList.contains('modal-overlay')) {
    event.target.classList.remove('active');
  }
};

renderBoard();
