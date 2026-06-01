// Monastery data from the provided JSON
const monasteriesData = {
  "rumtek": {
    "id": "rumtek",
    "name": "Rumtek Monastery",
    "title": "The Dharmachakra Centre",
    "location": "Gangtok, East Sikkim",
    "founded": "1966",
    "significance": "Largest monastery in Sikkim, seat of the Karma Kagyu lineage",
    "duration": "25 minutes",
    "viewpoints": [
      {
        "id": "entrance",
        "name": "Main Entrance Gate",
        "description": "Traditional Tibetan gateway with colorful prayer flags",
        "audioScript": "Welcome to Rumtek Monastery, the largest Buddhist monastery in Sikkim. Built between 1961 and 1966, this monastery serves as the seat-in-exile of the Karma Kagyu lineage of Tibetan Buddhism. Notice the traditional Tibetan architecture with its distinctive red and gold colors, representing the sacred nature of this spiritual center."
      },
      {
        "id": "courtyard",
        "name": "Central Courtyard",
        "description": "Sacred courtyard for festivals and ceremonies",
        "audioScript": "This central courtyard is where monks gather for important ceremonies and the famous Cham dance festivals. The courtyard offers stunning views of the surrounding hills and serves as the heart of monastic life. During festivals, hundreds of devotees gather here to witness traditional Buddhist rituals."
      },
      {
        "id": "prayer-hall",
        "name": "Main Prayer Hall",
        "description": "Sacred hall with golden throne and religious artifacts",
        "audioScript": "Enter the magnificent prayer hall, adorned with intricate murals and housing the golden throne of the Karmapa. The hall contains precious relics brought from Tibet, including the Black Hat of the Karmapa, one of the most sacred objects in Tibetan Buddhism. The vibrant colors and detailed artwork represent various aspects of Buddhist cosmology."
      },
      {
        "id": "golden-stupa",
        "name": "Golden Stupa",
        "description": "Sacred reliquary of the 16th Karmapa",
        "audioScript": "This magnificent golden stupa contains the relics of the 16th Karmapa, Rangjung Rigpe Dorje, who established this monastery. Studded with turquoise and precious stones, this stupa is considered one of the most sacred sites in Sikkim. Devotees circumambulate this stupa while reciting mantras and prayers."
      }
    ],
    "audioIntro": "Embark on a spiritual journey through Rumtek Monastery, where ancient Tibetan Buddhist traditions continue to thrive in the heart of Sikkim.",
    "historicalContext": "Rumtek Monastery was built to replace the original Tsurphu Monastery in Tibet, destroyed during the Chinese Cultural Revolution. The 16th Karmapa chose this site for its auspicious attributes: seven streams flowing towards it, seven hills facing it, and a river spiraling downhill like a conch shell.",
    "culturalSignificance": "As the largest monastery in Sikkim, Rumtek serves as a center for Buddhist learning and practice, attracting thousands of pilgrims and visitors annually."
  },
  "tashiding": {
    "id": "tashiding",
    "name": "Tashiding Monastery",
    "title": "The Sacred Summit",
    "location": "West Sikkim",
    "founded": "1641",
    "significance": "Most sacred monastery in Sikkim, hilltop location",
    "duration": "20 minutes",
    "viewpoints": [
      {
        "id": "hilltop-approach",
        "name": "Sacred Hill Approach",
        "description": "Winding path to the most sacred monastery in Sikkim",
        "audioScript": "As you climb towards Tashiding Monastery, perched atop a sacred hill, you're following in the footsteps of countless pilgrims. Founded in 1641, Tashiding means 'the devoted central glory' and is considered the most sacred monastery in Sikkim. The challenging climb represents the spiritual journey towards enlightenment."
      },
      {
        "id": "mountain-view",
        "name": "Kanchenjunga Vista",
        "description": "Panoramic views of the world's third-highest peak",
        "audioScript": "From this vantage point, behold the majestic Kanchenjunga, the world's third-highest mountain and guardian deity of Sikkim. The local Lepcha people consider Kanchenjunga sacred, believing it to be the abode of their protective deity. This spectacular view has inspired generations of monks and pilgrims in their spiritual practice."
      },
      {
        "id": "main-temple",
        "name": "Main Temple Complex",
        "description": "Ancient temple with sacred Bhumchu ceremony site",
        "audioScript": "This ancient temple hosts the famous Bhumchu ceremony, where sacred water blessed by Guru Rinpoche is distributed to devotees. The water is believed to have miraculous healing properties and the ability to purify sins. The temple's architecture reflects the merger of Tibetan and local Sikkimese styles."
      },
      {
        "id": "chorten-field",
        "name": "Sacred Chorten Field",
        "description": "Field of Buddhist stupas and prayer flags",
        "audioScript": "This field of chortens (Buddhist stupas) creates a sacred mandala representing the Buddhist cosmos. Each chorten contains sacred relics and mantras, and walking among them is believed to accumulate merit and purify negative karma. The colorful prayer flags carry mantras and prayers on the mountain winds."
      }
    ],
    "audioIntro": "Experience Tashiding Monastery, the most sacred site in Sikkim, where earth meets sky in perfect spiritual harmony.",
    "historicalContext": "Founded by Ngadak Sempa Chempo Phunshok Rigzing, one of the three wise men who consecrated the first Chogyal of Sikkim, Tashiding has been a pilgrimage destination for over 380 years.",
    "culturalSignificance": "Tashiding is central to Sikkimese Buddhism, with local belief holding that a pilgrimage here can wash away the sins of a lifetime."
  },
  "pemayangtse": {
    "id": "pemayangtse",
    "name": "Pemayangtse Monastery",
    "title": "The Sublime Lotus",
    "location": "Pelling, West Sikkim",
    "founded": "1705",
    "significance": "Historic monastery with intricate three-story wooden sculpture",
    "duration": "30 minutes",
    "viewpoints": [
      {
        "id": "monastery-facade",
        "name": "Traditional Facade",
        "description": "Classic three-story Sikkimese monastery architecture",
        "audioScript": "Pemayangtse, meaning 'Sublime Lotus,' represents the pinnacle of Sikkimese monastic architecture. Built in 1705, this three-story monastery was constructed exclusively for 'Tasum' or pure monks. The facade showcases traditional Tibetan architectural elements adapted for Sikkim's unique climate and terrain."
      },
      {
        "id": "sculpture-hall",
        "name": "Sangthokpalri Hall",
        "description": "Seven-tiered wooden sculpture of Guru Rinpoche's celestial palace",
        "audioScript": "Behold the magnificent Sangthokpalri, a seven-tiered wooden sculpture representing Guru Rinpoche's heavenly abode on the Copper-Colored Mountain. This masterpiece, carved entirely from wood, depicts different levels of spiritual realms with intricate details of deities, celestial beings, and spiritual landscapes. It took master craftsman Dungzin Rinpoche years to complete this spiritual masterpiece."
      },
      {
        "id": "royal-connection",
        "name": "Royal Prayer Room",
        "description": "Chamber where Sikkim's royal family performed religious duties",
        "audioScript": "This sacred chamber served as the prayer room for Sikkim's royal family, the Namgyal dynasty. The monastery held special significance as the royal chapel, where state ceremonies and important religious functions were conducted. The ornate decorations and sacred objects reflect the monastery's elevated status in the Buddhist hierarchy of Sikkim."
      },
      {
        "id": "mountain-panorama",
        "name": "Himalayan Vista",
        "description": "Breathtaking views of the Himalayan range",
        "audioScript": "From this elevated position, witness the spectacular panorama of the Himalayan range, including the sacred peaks of Kanchenjunga. This view inspired the monastery's founders to choose this location, believing that the natural beauty would aid in spiritual contemplation and meditation. The changing light on the mountains throughout the day creates a constantly evolving spiritual experience."
      }
    ],
    "audioIntro": "Discover Pemayangtse Monastery, where royal patronage and spiritual devotion created one of Sikkim's most magnificent Buddhist monuments.",
    "historicalContext": "Founded by Lama Lhatsun Chempo, one of the three wise men who established Buddhism in Sikkim, Pemayangtse served as the head monastery for all monasteries in Sikkim.",
    "culturalSignificance": "As the royal monastery of Sikkim, Pemayangtse played a crucial role in the religious and political life of the kingdom, serving as the spiritual authority for the Buddhist state."
  },
  "enchey": {
    "id": "enchey",
    "name": "Enchey Monastery",
    "title": "The Solitary Temple",
    "location": "Gangtok, East Sikkim",
    "founded": "1909",
    "significance": "Founded by Padmasambhava, famous for Cham dance festivals",
    "duration": "18 minutes",
    "viewpoints": [
      {
        "id": "gangtok-overview",
        "name": "Gangtok City View",
        "description": "Panoramic view of Sikkim's capital city",
        "audioScript": "From Enchey Monastery, enjoy this spectacular overview of Gangtok, Sikkim's vibrant capital. Founded in 1909 by Lama Druptob Karpo, the monastery's name 'Enchey' means 'the solitary temple.' Despite being within the city, it maintains its serene spiritual atmosphere, offering a peaceful retreat from urban life."
      },
      {
        "id": "prayer-wheels",
        "name": "Sacred Prayer Wheels",
        "description": "Traditional Tibetan prayer wheels containing mantras",
        "audioScript": "These sacred prayer wheels contain thousands of printed mantras and prayers. According to Buddhist tradition, spinning these wheels is equivalent to reciting all the prayers contained within them. The rhythmic spinning, accompanied by the gentle sound of the wheels, creates a meditative atmosphere that has blessed this location for over a century."
      },
      {
        "id": "festival-ground",
        "name": "Cham Dance Arena",
        "description": "Sacred space for annual masked dance festivals",
        "audioScript": "This courtyard transforms into a vibrant festival arena during the annual Cham dance celebrations. Monks perform sacred masked dances that tell stories of good triumphing over evil, spiritual transformation, and the victory of wisdom over ignorance. The colorful costumes and rhythmic movements create a spectacular spiritual theater."
      },
      {
        "id": "main-shrine",
        "name": "Main Shrine Hall",
        "description": "Sacred hall with statues of Buddhist deities",
        "audioScript": "Enter the main shrine hall, where statues of Buddha, Guru Rinpoche, and other Buddhist deities preside over daily prayers and meditation sessions. The hall's intimate size creates a personal connection between devotees and the sacred images, fostering deep spiritual contemplation. The morning and evening prayers fill this space with the melodious chanting of resident monks."
      }
    ],
    "audioIntro": "Experience Enchey Monastery, where the sacred and urban blend in perfect harmony above Sikkim's bustling capital.",
    "historicalContext": "Built on a site blessed by the 8th-century saint Padmasambhava (Guru Rinpoche), Enchey Monastery represents the continuation of ancient spiritual blessings in modern times.",
    "culturalSignificance": "Enchey serves as Gangtok's primary monastery, hosting important religious festivals and serving the spiritual needs of the capital's Buddhist population."
  },
  "dubdi": {
    "id": "dubdi",
    "name": "Dubdi Monastery",
    "title": "The Retreat of the Summit",
    "location": "Yuksom, West Sikkim",
    "founded": "1647",
    "significance": "Oldest monastery in Sikkim, coronation site of first Chogyal",
    "duration": "22 minutes",
    "viewpoints": [
      {
        "id": "forest-approach",
        "name": "Sacred Forest Path",
        "description": "Ancient trail through pristine Himalayan forest",
        "audioScript": "Journey through this pristine Himalayan forest to reach Dubdi, Sikkim's oldest monastery founded in 1647. This sacred path has been walked by countless pilgrims, monks, and even the first Chogyal of Sikkim. The forest itself is considered sacred, home to medicinal plants and wildlife that coexist with the monastery's spiritual energy."
      },
      {
        "id": "historic-shrine",
        "name": "Original Shrine",
        "description": "Sikkim's first Buddhist temple, site of royal coronation",
        "audioScript": "Stand before Sikkim's first Buddhist shrine, built by Lhatsun Namkha Jigme, one of the three wise men who established Buddhism in Sikkim. This sacred site witnessed the coronation of Phuntsog Namgyal as the first Chogyal of Sikkim in 1642, marking the beginning of Sikkim's Buddhist kingdom. The simple yet powerful architecture reflects the monastery's foundational role in Sikkimese Buddhism."
      },
      {
        "id": "meditation-cave",
        "name": "Lhatsun's Meditation Cave",
        "description": "Sacred cave where the monastery's founder meditated",
        "audioScript": "This natural cave served as the meditation retreat for Lhatsun Namkha Jigme, the monastery's founder. According to tradition, he meditated here for three years, three months, and three days before establishing the monastery. The cave maintains a palpable spiritual energy, and many practitioners still come here for deep meditation and spiritual retreats."
      },
      {
        "id": "valley-view",
        "name": "Yuksom Valley Vista",
        "description": "Historic valley where Sikkim's destiny was determined",
        "audioScript": "From this vantage point, view the historic Yuksom valley where the destiny of Sikkim was determined. This valley witnessed the meeting of the three wise men from Tibet who chose Phuntsog Namgyal as Sikkim's first king. The name Yuksom means 'meeting place of three,' commemorating this pivotal moment in Sikkimese history. The peaceful valley continues to inspire spiritual seekers and historians alike."
      }
    ],
    "audioIntro": "Step into history at Dubdi Monastery, where Sikkim's spiritual and political journey began over 375 years ago.",
    "historicalContext": "Built by Lhatsun Namkha Jigme after the consecration of Sikkim's first Chogyal, Dubdi represents the foundation of Sikkim as a Buddhist kingdom and the beginning of organized Buddhism in the region.",
    "culturalSignificance": "As Sikkim's oldest monastery, Dubdi holds the deepest historical connections to the kingdom's founding and remains a pilgrimage site for those seeking to understand Sikkimese Buddhist roots."
  }
};

// Application state
let currentState = {
  currentMonastery: null,
  currentViewpoint: null,
  isPlaying: false,
  currentTime: 0,
  totalTime: 180, // 3 minutes default
  volume: 0.7,
  playbackSpeed: 1,
  language: 'english',
  panoramaRotation: { x: 0, y: 0 },
  panoramaZoom: 1,
  isDragging: false,
  lastMousePos: { x: 0, y: 0 }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Virtual Tours Application...');
  
  // Show loading screen and initialize
  showLoadingScreen();
  
  setTimeout(() => {
    initializeApplication();
  }, 1000);
});

// Loading Screen
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const progressBar = document.getElementById('loadingProgress');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          document.getElementById('mainApp').classList.remove('hidden');
          showTutorial();
        }, 300);
      }, 500);
    }
    progressBar.style.width = progress + '%';
  }, 200);
}

// Initialize Application
function initializeApplication() {
  console.log('Application initialized');
  
  // Setup event listeners
  setupEventListeners();
  
  // Render monastery selection
  renderMonasteryCards();
  
  // Initialize audio system
  initializeAudioSystem();
  
  // Setup panorama controls
  setupPanoramaControls();
}

// Setup Event Listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Navigation - Fixed event listener
  const backButton = document.getElementById('backToSelection');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Back button clicked');
      showMonasterySelection();
    });
  }
  
  // Tour controls
  document.getElementById('zoomIn').addEventListener('click', () => zoomPanorama(0.1));
  document.getElementById('zoomOut').addEventListener('click', () => zoomPanorama(-0.1));
  document.getElementById('resetView').addEventListener('click', resetPanoramaView);
  document.getElementById('toggleFullscreen').addEventListener('click', toggleFullscreen);
  document.getElementById('toggleVR').addEventListener('click', toggleVRMode);
  
  // Viewpoint selector
  document.getElementById('viewpointSelect').addEventListener('change', changeViewpoint);
  
  // Audio controls
  document.getElementById('playPauseBtn').addEventListener('click', toggleAudioPlayback);
  document.getElementById('audioScrubber').addEventListener('input', scrubAudio);
  document.getElementById('languageSelect').addEventListener('change', changeLanguage);
  document.getElementById('speedSelect').addEventListener('change', changePlaybackSpeed);
  document.getElementById('volumeSlider').addEventListener('input', changeVolume);
  
  // Modal controls
  document.getElementById('closeTutorial').addEventListener('click', closeTutorial);
  document.getElementById('startTour').addEventListener('click', closeTutorial);
  document.getElementById('closeModal').addEventListener('click', closeHotspotModal);
  
  // Modal backdrop clicks
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.add('hidden');
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  console.log('Event listeners setup complete');
}

// Show Tutorial
function showTutorial() {
  document.getElementById('tutorialModal').classList.remove('hidden');
}

function closeTutorial() {
  document.getElementById('tutorialModal').classList.add('hidden');
}

// Render Monastery Cards
function renderMonasteryCards() {
  const container = document.querySelector('.monastery-cards');
  
  const cardsHTML = Object.values(monasteriesData).map(monastery => `
    <div class="monastery-card" onclick="selectMonastery('${monastery.id}')">
      <div class="monastery-card__image">
        🏛️
      </div>
      <div class="monastery-card__content">
        <div class="monastery-card__header">
          <h3 class="monastery-card__name">${monastery.name}</h3>
          <p class="monastery-card__title">${monastery.title}</p>
        </div>
        
        <div class="monastery-card__meta">
          <div class="monastery-card__meta-item">
            <div class="monastery-card__meta-label">Founded</div>
            <div class="monastery-card__meta-value">${monastery.founded}</div>
          </div>
          <div class="monastery-card__meta-item">
            <div class="monastery-card__meta-label">Location</div>
            <div class="monastery-card__meta-value">${monastery.location}</div>
          </div>
        </div>
        
        <p class="monastery-card__significance">${monastery.significance}</p>
        
        <div class="monastery-card__duration">
          <span class="monastery-card__duration-text">Tour Duration: ${monastery.duration}</span>
          <span class="monastery-card__cta">Explore →</span>
        </div>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = cardsHTML;
}

// Select Monastery
function selectMonastery(monasteryId) {
  console.log('Selecting monastery:', monasteryId);
  
  currentState.currentMonastery = monasteriesData[monasteryId];
  currentState.currentViewpoint = currentState.currentMonastery.viewpoints[0];
  
  // Update UI
  document.getElementById('monasterySelection').classList.add('hidden');
  document.getElementById('tourViewer').classList.remove('hidden');
  document.getElementById('miniMap').classList.remove('hidden');
  document.getElementById('backToSelection').classList.remove('hidden');
  
  // Setup tour
  setupTour();
}

// Show Monastery Selection - Fixed function
function showMonasterySelection() {
  console.log('Returning to monastery selection');
  
  // Stop audio
  currentState.isPlaying = false;
  updatePlayPauseButton();
  
  // Reset state
  currentState.currentMonastery = null;
  currentState.currentViewpoint = null;
  resetPanoramaView();
  
  // Update UI - Fixed the class toggling
  document.getElementById('tourViewer').classList.add('hidden');
  document.getElementById('miniMap').classList.add('hidden');
  document.getElementById('backToSelection').classList.add('hidden');
  document.getElementById('monasterySelection').classList.remove('hidden');
}

// Setup Tour
function setupTour() {
  console.log('Setting up tour for:', currentState.currentMonastery.name);
  
  // Populate viewpoint selector
  const viewpointSelect = document.getElementById('viewpointSelect');
  viewpointSelect.innerHTML = '<option value="">Select Viewpoint</option>' +
    currentState.currentMonastery.viewpoints.map((vp, index) => 
      `<option value="${index}" ${index === 0 ? 'selected' : ''}>${vp.name}</option>`
    ).join('');
  
  // Update mini-map
  updateMiniMap();
  
  // Setup panorama
  setupPanorama();
  
  // Update audio info
  updateAudioInfo();
  
  // Create viewpoint dots
  createViewpointDots();
  
  // Auto-play introduction
  setTimeout(() => {
    startAudioPlayback();
  }, 1000);
}

// Setup Panorama
function setupPanorama() {
  const panoramaImage = document.getElementById('panoramaImage');
  
  // Clear existing hotspots
  panoramaImage.querySelectorAll('.hotspot').forEach(hotspot => hotspot.remove());
  
  // Create simulated 360° background based on viewpoint
  updatePanoramaBackground();
  
  // Add hotspots for current viewpoint
  addHotspots();
  
  // Reset view
  resetPanoramaView();
}

// Update Panorama Background
function updatePanoramaBackground() {
  const panoramaImage = document.getElementById('panoramaImage');
  const viewpoint = currentState.currentViewpoint;
  
  // Create different gradient patterns for different viewpoints
  const backgroundPatterns = {
    'entrance': 'linear-gradient(45deg, #1FB8CD 0%, #FFC185 30%, #B4413C 60%, #ECEBD5 100%)',
    'courtyard': 'linear-gradient(135deg, #5D878F 0%, #DB4545 40%, #D2BA4C 80%)',
    'prayer-hall': 'linear-gradient(90deg, #964325 0%, #944454 50%, #13343B 100%)',
    'golden-stupa': 'linear-gradient(180deg, #D2BA4C 0%, #FFC185 50%, #1FB8CD 100%)',
    'hilltop-approach': 'linear-gradient(225deg, #13343B 0%, #5D878F 60%, #ECEBD5 100%)',
    'mountain-view': 'linear-gradient(270deg, #1FB8CD 0%, #ECEBD5 40%, #5D878F 80%)',
    'main-temple': 'linear-gradient(315deg, #B4413C 0%, #964325 50%, #944454 100%)',
    'chorten-field': 'linear-gradient(360deg, #DB4545 0%, #D2BA4C 30%, #FFC185 70%)'
  };
  
  const pattern = backgroundPatterns[viewpoint.id] || backgroundPatterns['entrance'];
  panoramaImage.style.background = pattern;
  
  // Add some pseudo-3D elements
  panoramaImage.innerHTML = `
    <div style="position: absolute; top: 20%; left: 15%; width: 60px; height: 80px; background: rgba(180, 65, 60, 0.8); border-radius: 5px; transform: perspective(100px) rotateY(-10deg);"></div>
    <div style="position: absolute; top: 40%; right: 20%; width: 40px; height: 60px; background: rgba(91, 135, 143, 0.7); border-radius: 50%; transform: perspective(100px) rotateX(5deg);"></div>
    <div style="position: absolute; bottom: 30%; left: 30%; width: 80px; height: 30px; background: rgba(255, 193, 133, 0.6); border-radius: 15px;"></div>
    <div style="position: absolute; top: 60%; left: 60%; width: 50px; height: 70px; background: rgba(210, 186, 76, 0.8); transform: perspective(100px) rotateY(15deg);"></div>
  `;
}

// Add Hotspots
function addHotspots() {
  const panoramaImage = document.getElementById('panoramaImage');
  const hotspotPositions = [
    { x: 25, y: 35, title: 'Architectural Detail', description: 'Traditional Tibetan carved wooden elements showcase centuries-old craftsmanship techniques.' },
    { x: 60, y: 50, title: 'Sacred Symbol', description: 'Buddhist dharma wheel representing the path to enlightenment.' },
    { x: 80, y: 30, title: 'Prayer Flags', description: 'Colorful flags carrying mantras and prayers on mountain winds.' },
    { x: 40, y: 70, title: 'Stone Carving', description: 'Ancient inscriptions in Tibetan script containing sacred teachings.' }
  ];
  
  hotspotPositions.forEach((pos, index) => {
    const hotspot = document.createElement('div');
    hotspot.className = 'hotspot';
    hotspot.style.left = pos.x + '%';
    hotspot.style.top = pos.y + '%';
    hotspot.onclick = () => showHotspotInfo(pos.title, pos.description);
    panoramaImage.appendChild(hotspot);
  });
}

// Show Hotspot Info
function showHotspotInfo(title, description) {
  document.getElementById('hotspotTitle').textContent = title;
  document.getElementById('hotspotDescription').textContent = description;
  document.getElementById('hotspotDetails').innerHTML = `
    <p><strong>Cultural Significance:</strong> This element represents the deep spiritual traditions preserved in Sikkimese monasteries.</p>
    <p><strong>Historical Context:</strong> Crafted by traditional artisans using techniques passed down through generations of Buddhist craftsmen.</p>
  `;
  document.getElementById('hotspotModal').classList.remove('hidden');
}

// Close Hotspot Modal
function closeHotspotModal() {
  document.getElementById('hotspotModal').classList.add('hidden');
}

// Setup Panorama Controls - Fixed dragging implementation
function setupPanoramaControls() {
  const panoramaContainer = document.getElementById('panoramaContainer');
  
  console.log('Setting up panorama controls...');
  
  // Mouse controls - Fixed implementation
  panoramaContainer.addEventListener('mousedown', function(e) {
    e.preventDefault();
    startDragging(e);
  });
  
  document.addEventListener('mousemove', function(e) {
    handleDragging(e);
  });
  
  document.addEventListener('mouseup', function(e) {
    stopDragging(e);
  });
  
  // Touch controls - Fixed implementation
  panoramaContainer.addEventListener('touchstart', function(e) {
    e.preventDefault();
    startTouchDragging(e);
  }, { passive: false });
  
  panoramaContainer.addEventListener('touchmove', function(e) {
    e.preventDefault();
    handleTouchDragging(e);
  }, { passive: false });
  
  panoramaContainer.addEventListener('touchend', function(e) {
    stopDragging(e);
  });
  
  // Wheel zoom
  panoramaContainer.addEventListener('wheel', function(e) {
    e.preventDefault();
    handleWheelZoom(e);
  });
  
  console.log('Panorama controls setup complete');
}

// Dragging Functions - Fixed implementation
function startDragging(e) {
  console.log('Starting drag');
  currentState.isDragging = true;
  currentState.lastMousePos = { x: e.clientX, y: e.clientY };
  document.getElementById('panoramaContainer').classList.add('dragging');
}

function startTouchDragging(e) {
  console.log('Starting touch drag');
  const touch = e.touches[0];
  currentState.isDragging = true;
  currentState.lastMousePos = { x: touch.clientX, y: touch.clientY };
  document.getElementById('panoramaContainer').classList.add('dragging');
}

function handleDragging(e) {
  if (!currentState.isDragging) return;
  
  console.log('Dragging...');
  const deltaX = e.clientX - currentState.lastMousePos.x;
  const deltaY = e.clientY - currentState.lastMousePos.y;
  
  currentState.panoramaRotation.y += deltaX * 0.5;
  currentState.panoramaRotation.x -= deltaY * 0.5;
  
  // Clamp vertical rotation
  currentState.panoramaRotation.x = Math.max(-45, Math.min(45, currentState.panoramaRotation.x));
  
  updatePanoramaTransform();
  
  currentState.lastMousePos = { x: e.clientX, y: e.clientY };
}

function handleTouchDragging(e) {
  if (!currentState.isDragging) return;
  
  console.log('Touch dragging...');
  const touch = e.touches[0];
  const deltaX = touch.clientX - currentState.lastMousePos.x;
  const deltaY = touch.clientY - currentState.lastMousePos.y;
  
  currentState.panoramaRotation.y += deltaX * 0.5;
  currentState.panoramaRotation.x -= deltaY * 0.5;
  
  // Clamp vertical rotation
  currentState.panoramaRotation.x = Math.max(-45, Math.min(45, currentState.panoramaRotation.x));
  
  updatePanoramaTransform();
  
  currentState.lastMousePos = { x: touch.clientX, y: touch.clientY };
}

function stopDragging() {
  if (currentState.isDragging) {
    console.log('Stopping drag');
  }
  currentState.isDragging = false;
  document.getElementById('panoramaContainer').classList.remove('dragging');
}

function handleWheelZoom(e) {
  const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
  zoomPanorama(zoomDelta);
}

// Zoom Functions
function zoomPanorama(delta) {
  currentState.panoramaZoom += delta;
  currentState.panoramaZoom = Math.max(0.5, Math.min(3, currentState.panoramaZoom));
  updatePanoramaTransform();
}

function resetPanoramaView() {
  currentState.panoramaRotation = { x: 0, y: 0 };
  currentState.panoramaZoom = 1;
  updatePanoramaTransform();
}

function updatePanoramaTransform() {
  const panoramaImage = document.getElementById('panoramaImage');
  panoramaImage.style.transform = `
    rotateX(${currentState.panoramaRotation.x}deg)
    rotateY(${currentState.panoramaRotation.y}deg)
    scale(${currentState.panoramaZoom})
  `;
}

// Change Viewpoint
function changeViewpoint(e) {
  const index = parseInt(e.target.value);
  if (isNaN(index)) return;
  
  currentState.currentViewpoint = currentState.currentMonastery.viewpoints[index];
  
  // Update panorama
  setupPanorama();
  
  // Update audio info
  updateAudioInfo();
  
  // Update mini-map
  updateMiniMap();
  
  // Restart audio for new viewpoint
  if (currentState.isPlaying) {
    currentState.currentTime = 0;
    updateAudioProgress();
  }
}

// Audio System
function initializeAudioSystem() {
  // Simulate audio timeline updates
  setInterval(updateAudioTimeline, 100);
}

function toggleAudioPlayback() {
  currentState.isPlaying = !currentState.isPlaying;
  updatePlayPauseButton();
  
  if (currentState.isPlaying) {
    startAudioPlayback();
  }
}

function startAudioPlayback() {
  currentState.isPlaying = true;
  updatePlayPauseButton();
  
  // Simulate audio duration based on script length
  const script = currentState.currentViewpoint?.audioScript || '';
  currentState.totalTime = Math.max(60, script.length * 0.15); // Rough estimation
  
  updateAudioInfo();
}

function updatePlayPauseButton() {
  const btn = document.getElementById('playPauseBtn');
  btn.textContent = currentState.isPlaying ? '⏸️' : '▶️';
  btn.className = `audio-btn ${currentState.isPlaying ? 'audio-btn--pause' : 'audio-btn--play'}`;
}

function updateAudioTimeline() {
  if (!currentState.isPlaying) return;
  
  currentState.currentTime += 0.1 * currentState.playbackSpeed;
  
  if (currentState.currentTime >= currentState.totalTime) {
    currentState.currentTime = currentState.totalTime;
    currentState.isPlaying = false;
    updatePlayPauseButton();
  }
  
  updateAudioProgress();
}

function updateAudioProgress() {
  const progress = (currentState.currentTime / currentState.totalTime) * 100;
  document.getElementById('audioProgress').style.width = progress + '%';
  document.getElementById('audioScrubber').value = progress;
  
  document.getElementById('currentTime').textContent = formatTime(currentState.currentTime);
  document.getElementById('totalTime').textContent = formatTime(currentState.totalTime);
}

function scrubAudio(e) {
  const progress = parseFloat(e.target.value);
  currentState.currentTime = (progress / 100) * currentState.totalTime;
  updateAudioProgress();
}

function changeLanguage(e) {
  currentState.language = e.target.value;
  console.log('Language changed to:', currentState.language);
  
  // In a real implementation, this would load different audio files
  // For now, just restart current audio
  if (currentState.isPlaying) {
    currentState.currentTime = 0;
    updateAudioProgress();
  }
}

function changePlaybackSpeed(e) {
  currentState.playbackSpeed = parseFloat(e.target.value);
  console.log('Playback speed changed to:', currentState.playbackSpeed);
}

function changeVolume(e) {
  currentState.volume = parseFloat(e.target.value) / 100;
  console.log('Volume changed to:', currentState.volume);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateAudioInfo() {
  if (!currentState.currentViewpoint) return;
  
  document.getElementById('currentViewpoint').textContent = currentState.currentViewpoint.name;
  document.getElementById('audioDescription').textContent = currentState.currentViewpoint.description;
}

// Mini Map Functions
function updateMiniMap() {
  document.getElementById('currentMonasteryName').textContent = currentState.currentMonastery?.name || '';
}

function createViewpointDots() {
  const container = document.querySelector('.viewpoint-dots');
  if (!container) return;
  
  container.innerHTML = currentState.currentMonastery.viewpoints.map((vp, index) => 
    `<div class="viewpoint-dot ${index === 0 ? 'active' : ''}" 
          onclick="selectViewpointFromDot(${index})" 
          title="${vp.name}"></div>`
  ).join('');
}

function selectViewpointFromDot(index) {
  document.getElementById('viewpointSelect').value = index;
  changeViewpoint({ target: { value: index } });
  
  // Update active dot
  document.querySelectorAll('.viewpoint-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// Fullscreen and VR
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function toggleVRMode() {
  console.log('VR mode toggled');
  // In a real implementation, this would enable WebXR
  alert('VR mode would be enabled here with WebXR support');
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
  switch(e.key) {
    case ' ':
      e.preventDefault();
      toggleAudioPlayback();
      break;
    case 'Escape':
      if (!document.getElementById('hotspotModal').classList.contains('hidden')) {
        closeHotspotModal();
      } else if (!document.getElementById('tutorialModal').classList.contains('hidden')) {
        closeTutorial();
      } else {
        showMonasterySelection();
      }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      currentState.panoramaRotation.y -= 5;
      updatePanoramaTransform();
      break;
    case 'ArrowRight':
      e.preventDefault();
      currentState.panoramaRotation.y += 5;
      updatePanoramaTransform();
      break;
    case 'ArrowUp':
      e.preventDefault();
      currentState.panoramaRotation.x = Math.min(45, currentState.panoramaRotation.x + 5);
      updatePanoramaTransform();
      break;
    case 'ArrowDown':
      e.preventDefault();
      currentState.panoramaRotation.x = Math.max(-45, currentState.panoramaRotation.x - 5);
      updatePanoramaTransform();
      break;
    case '+':
    case '=':
      e.preventDefault();
      zoomPanorama(0.1);
      break;
    case '-':
      e.preventDefault();
      zoomPanorama(-0.1);
      break;
    case 'r':
      e.preventDefault();
      resetPanoramaView();
      break;
  }
}

// Utility Functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for global access
window.selectMonastery = selectMonastery;
window.selectViewpointFromDot = selectViewpointFromDot;
window.showHotspotInfo = showHotspotInfo;