// Monastery data
const monasteries = [
    {
        id: 1,
        name: "Rumtek Monastery",
        founded: "1966 (rebuilt)",
        location: "Gangtok, East Sikkim",
        significance: "Seat of the Karma Kagyu lineage, one of India's largest monasteries",
        architecture: "Traditional Tibetan style with golden roof, red walls, intricate wood carvings",
        details: "Houses the Black Hat and other sacred relics of the Karmapa lineage. Known for its elaborate festivals and monk debates.",
        century: "20th",
        region: "gangtok"
    },
    {
        id: 2,
        name: "Tashiding Monastery",
        founded: "1641",
        location: "West Sikkim",
        significance: "Most sacred monastery in Sikkim, hilltop location",
        architecture: "Stone and wood construction, panoramic mountain views, traditional sloping roofs",
        details: "Offers stunning views of Kanchenjunga. Famous for the Bhumchu ceremony and holy water rituals.",
        century: "17th",
        region: "west-sikkim"
    },
    {
        id: 3,
        name: "Pemayangtse Monastery",
        founded: "1705",
        location: "Pelling, West Sikkim",
        significance: "Historic monastery with intricate artwork",
        architecture: "Three-story structure, elaborate wood carvings, colorful murals, traditional Tibetan design",
        details: "Known for its seven-tiered wooden sculpture depicting Guru Rinpoche's celestial abode.",
        century: "18th",
        region: "west-sikkim"
    },
    {
        id: 4,
        name: "Enchey Monastery",
        founded: "1909",
        location: "Gangtok, East Sikkim",
        significance: "Founded by the great saint Padmasambhava",
        architecture: "Hilltop monastery with traditional Sikkimese architectural elements",
        details: "Popular pilgrimage site with annual Cham dance festivals. Overlooks Gangtok city.",
        century: "20th",
        region: "gangtok"
    },
    {
        id: 5,
        name: "Dubdi Monastery",
        founded: "1647",
        location: "Yuksom, West Sikkim",
        significance: "Oldest monastery in Sikkim",
        architecture: "Simple traditional structure, stone and wood construction, forest setting",
        details: "Built by Lhatsun Namkha Jigme. Historic site where the first Chogyal was crowned.",
        century: "17th",
        region: "west-sikkim"
    }
];

// Repository data (manuscripts and murals)
const repositoryItems = [
    {
        id: 1,
        name: "Namthar of Lhatsun Chenpo",
        type: "Manuscript",
        category: "Namthars (Spiritual Biography)",
        monastery: "Dubdi Monastery",
        estimatedDate: "17th century",
        language: "Classical Tibetan",
        script: "Tibetan U-chen",
        significance: "Chronicles the life of Sikkim's patron saint and monastery founder",
        description: "Detailed spiritual biography documenting Lhatsun Namkha Jigme's journey to Sikkim and establishment of Buddhism. Contains foundational myths and religious practices.",
        preservationStatus: "Good",
        digitalStatus: "Partially Digitized",
        pages: 156,
        material: "Handmade paper",
        century: "17th"
    },
    {
        id: 2,
        name: "Royal Chronicles of Namgyal Dynasty",
        type: "Manuscript",
        category: "Genealogical Records",
        monastery: "Palace Archive",
        estimatedDate: "1642-1700",
        language: "Classical Tibetan",
        script: "Tibetan dbu-can",
        significance: "Official genealogy and political history of Sikkim's royal family",
        description: "Comprehensive record of the Namgyal dynasty establishment, political alliances, and administrative systems. Includes details about monastery patronage.",
        preservationStatus: "Fair",
        digitalStatus: "Fully Digitized",
        pages: 234,
        material: "Birch bark and paper",
        century: "17th"
    },
    {
        id: 3,
        name: "Lepcha Creation Myths Manuscript",
        type: "Manuscript",
        category: "Lepcha Indigenous Texts",
        monastery: "Tashiding Monastery",
        estimatedDate: "18th century",
        language: "Lepcha (Rong)",
        script: "Lepcha script",
        significance: "Preservation of indigenous Lepcha cosmology and folklore",
        description: "Collection of creation stories, nature spirits, and traditional ecological knowledge. Written by Lepcha scholars in their native script.",
        preservationStatus: "Needs Attention",
        digitalStatus: "Not Yet Digitized",
        pages: 89,
        material: "Handmade paper",
        century: "18th"
    },
    {
        id: 4,
        name: "Kangyur Collection Volume 12",
        type: "Manuscript",
        category: "Buddhist Canonical Texts",
        monastery: "Rumtek Monastery",
        estimatedDate: "18th century",
        language: "Classical Tibetan",
        script: "Tibetan dbu-can",
        significance: "Part of the translated words of Buddha, core Buddhist philosophy",
        description: "Hand-copied volume of the Kangyur containing Vinaya texts and monastic regulations. Features elaborate illuminated initials.",
        preservationStatus: "Good",
        digitalStatus: "Fully Digitized",
        pages: 312,
        material: "High-quality paper with gold ink",
        century: "18th"
    },
    {
        id: 5,
        name: "Traditional Medicine Treatise",
        type: "Manuscript",
        category: "Medical Texts",
        monastery: "Pemayangtse Monastery",
        estimatedDate: "19th century",
        language: "Classical Tibetan",
        script: "Tibetan dbu-med",
        significance: "Traditional Tibetan medical knowledge adapted for Sikkim",
        description: "Comprehensive guide to herbal medicine using local Sikkimese plants. Includes diagnostic methods and treatment protocols.",
        preservationStatus: "Good",
        digitalStatus: "Partially Digitized",
        pages: 198,
        material: "Handmade paper with plant-based inks",
        century: "19th"
    },
    {
        id: 6,
        name: "Wheel of Life Mural",
        type: "Mural",
        category: "Cosmological Art",
        monastery: "Rumtek Monastery",
        estimatedDate: "1960s",
        artist: "Traditional Tibetan artisans",
        significance: "Depicts Buddhist cosmology and cycle of rebirth",
        description: "Large entrance mural showing the six realms of existence held by Yama, the lord of death. Traditional iconography with modern execution.",
        preservationStatus: "Good",
        digitalStatus: "Fully Digitized",
        dimensions: "12ft x 8ft",
        technique: "Natural pigments on lime plaster",
        century: "20th"
    },
    {
        id: 7,
        name: "Shakyamuni Buddha Thangka",
        type: "Thangka",
        category: "Religious Painting",
        monastery: "Tashiding Monastery",
        estimatedDate: "1910",
        artist: "Rinzing Lharipa",
        significance: "Masterpiece of early 20th century Sikkimese thangka art",
        description: "Exquisite painting of Buddha Shakyamuni with his two principal disciples. Features gold leaf details and natural mineral pigments.",
        preservationStatus: "Fair",
        digitalStatus: "Fully Digitized",
        dimensions: "4ft x 3ft",
        technique: "Natural pigments and gold on cotton canvas",
        century: "20th"
    },
    {
        id: 8,
        name: "Mahakala Protector Deity Mural",
        type: "Mural",
        category: "Protective Deities",
        monastery: "Enchey Monastery",
        estimatedDate: "Early 20th century",
        artist: "Sikkimese monastery artists",
        significance: "Depicts fierce protector deity of Sikkim monasteries",
        description: "Powerful mural of Mahakala in his wrathful form, surrounded by flames and symbolic implements. Traditional iconography with local artistic elements.",
        preservationStatus: "Needs Attention",
        digitalStatus: "Partially Digitized",
        dimensions: "10ft x 6ft",
        technique: "Natural pigments on earthen wall with gypsum base",
        century: "20th"
    },
    {
        id: 9,
        name: "Guru Rinpoche's Celestial Palace",
        type: "Architectural Art",
        category: "Sculptural Work",
        monastery: "Pemayangtse Monastery",
        estimatedDate: "18th century",
        artist: "Traditional Sikkimese craftsmen",
        significance: "Seven-tiered wooden sculpture of spiritual realms",
        description: "Intricate carved wooden model depicting Guru Padmasambhava's heavenly abode. Multiple levels show different spiritual realms and deities.",
        preservationStatus: "Good",
        digitalStatus: "Fully Digitized",
        dimensions: "8ft height, multi-tiered",
        technique: "Wood carving with natural pigments",
        century: "18th"
    },
    {
        id: 10,
        name: "Kanchenjunga Deity Thangka",
        type: "Thangka",
        category: "Local Protective Deities",
        monastery: "Dubdi Monastery",
        estimatedDate: "19th century",
        artist: "Unknown Sikkimese artist",
        significance: "Unique depiction of Sikkim's guardian mountain deity",
        description: "Rare thangka showing Kanchenjunga as a fiery red deity riding a snow lion, holding victory banner. Blend of Tibetan Buddhist and local Sikkimese traditions.",
        preservationStatus: "Fair",
        digitalStatus: "Not Yet Digitized",
        dimensions: "5ft x 3ft",
        technique: "Natural pigments on silk fabric",
        century: "19th"
    }
];

// Global variables
let currentTab = 'history';
let filteredMonasteries = [...monasteries];
let filteredRepositoryItems = [...repositoryItems];

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    
    // Initialize all components
    initializeNavigation();
    renderMonasteries();
    initializeSearch();
    initializeRepository();
    initializeAISummary();
    addSampleButton();
    
    console.log('Application initialized successfully');
});

// Navigation functionality
function initializeNavigation() {
    console.log('Initializing navigation...');
    
    const tabButtons = document.querySelectorAll('.nav__tab');
    console.log(`Found ${tabButtons.length} tab buttons`);
    
    tabButtons.forEach((button, index) => {
        const tabName = button.getAttribute('data-tab');
        console.log(`Setting up tab button ${index}: ${tabName}`);
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`Tab clicked: ${tabName}`);
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    
    // Remove active class from all tabs
    const allTabs = document.querySelectorAll('.nav__tab');
    allTabs.forEach(tab => {
        tab.classList.remove('nav__tab--active');
    });
    
    // Add active class to selected tab
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('nav__tab--active');
        console.log(`Activated tab: ${tabName}`);
    } else {
        console.error(`Tab button not found: ${tabName}`);
    }
    
    // Hide all sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.classList.remove('section--active');
    });
    
    // Show selected section
    const activeSection = document.getElementById(tabName);
    if (activeSection) {
        activeSection.classList.add('section--active');
        console.log(`Activated section: ${tabName}`);
    } else {
        console.error(`Section not found: ${tabName}`);
    }
    
    currentTab = tabName;
    
    // If switching to database, ensure monasteries are rendered
    if (tabName === 'database') {
        renderMonasteries();
    } else if (tabName === 'repository') {
        renderRepositoryItems();
        updateRepositoryStats();
    }
}

// Monastery database functionality
function renderMonasteries() {
    console.log('Rendering monasteries...');
    
    const grid = document.getElementById('monasteryGrid');
    if (!grid) {
        console.error('Monastery grid element not found');
        return;
    }
    
    if (filteredMonasteries.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>No monasteries found</h3>
                <p>Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }

    const cardsHTML = filteredMonasteries.map(monastery => `
        <div class="monastery-card">
            <div class="monastery-card__header">
                <h3 class="monastery-card__name">${monastery.name}</h3>
                <div class="monastery-card__founded">Founded: ${monastery.founded}</div>
            </div>
            <div class="monastery-card__body">
                <div class="monastery-card__detail">
                    <div class="monastery-card__label">Location</div>
                    <div class="monastery-card__value">${monastery.location}</div>
                </div>
                <div class="monastery-card__detail">
                    <div class="monastery-card__label">Architecture</div>
                    <div class="monastery-card__value">${monastery.architecture}</div>
                </div>
                <div class="monastery-card__significance">
                    <div class="monastery-card__label">Significance</div>
                    <div class="monastery-card__value"><strong>${monastery.significance}</strong></div>
                </div>
                <div class="monastery-card__detail">
                    <div class="monastery-card__label">Details</div>
                    <div class="monastery-card__value">${monastery.details}</div>
                </div>
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = cardsHTML;
    console.log(`Rendered ${filteredMonasteries.length} monastery cards`);
}

function initializeSearch() {
    console.log('Initializing search functionality...');
    
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        console.log('Search input listener added');
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', handleSearch);
        console.log('Filter select listener added');
    }
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filterValue = filterSelect ? filterSelect.value : '';
    
    console.log(`Searching with term: "${searchTerm}" and filter: "${filterValue}"`);

    filteredMonasteries = monasteries.filter(monastery => {
        const matchesSearch = !searchTerm || 
            monastery.name.toLowerCase().includes(searchTerm) ||
            monastery.location.toLowerCase().includes(searchTerm) ||
            monastery.significance.toLowerCase().includes(searchTerm) ||
            monastery.details.toLowerCase().includes(searchTerm);

        const matchesFilter = !filterValue ||
            monastery.century === filterValue ||
            monastery.region === filterValue;

        return matchesSearch && matchesFilter;
    });
    
    console.log(`Found ${filteredMonasteries.length} matching monasteries`);
    renderMonasteries();
}

// Repository functionality
function initializeRepository() {
    console.log('Initializing repository functionality...');
    
    const repositorySearchInput = document.getElementById('repositorySearchInput');
    const typeFilter = document.getElementById('typeFilter');
    const centuryFilter = document.getElementById('centuryFilter');
    const languageFilter = document.getElementById('languageFilter');
    
    if (repositorySearchInput) {
        repositorySearchInput.addEventListener('input', handleRepositorySearch);
        console.log('Repository search input listener added');
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', handleRepositorySearch);
        console.log('Type filter listener added');
    }
    
    if (centuryFilter) {
        centuryFilter.addEventListener('change', handleRepositorySearch);
        console.log('Century filter listener added');
    }
    
    if (languageFilter) {
        languageFilter.addEventListener('change', handleRepositorySearch);
        console.log('Language filter listener added');
    }
    
    // Initial render
    filteredRepositoryItems = [...repositoryItems];
    renderRepositoryItems();
    updateRepositoryStats();
}

function handleRepositorySearch() {
    const searchInput = document.getElementById('repositorySearchInput');
    const typeFilter = document.getElementById('typeFilter');
    const centuryFilter = document.getElementById('centuryFilter');
    const languageFilter = document.getElementById('languageFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const typeValue = typeFilter ? typeFilter.value : '';
    const centuryValue = centuryFilter ? centuryFilter.value : '';
    const languageValue = languageFilter ? languageFilter.value : '';
    
    console.log(`Repository search - Term: "${searchTerm}", Type: "${typeValue}", Century: "${centuryValue}", Language: "${languageValue}"`);

    filteredRepositoryItems = repositoryItems.filter(item => {
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.monastery.toLowerCase().includes(searchTerm) ||
            item.significance.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm);

        const matchesType = !typeValue || item.type === typeValue;
        const matchesCentury = !centuryValue || item.century === centuryValue;
        const matchesLanguage = !languageValue || item.language === languageValue;

        return matchesSearch && matchesType && matchesCentury && matchesLanguage;
    });
    
    console.log(`Found ${filteredRepositoryItems.length} matching repository items`);
    renderRepositoryItems();
    updateRepositoryStats();
}

function renderRepositoryItems() {
    console.log('Rendering repository items...');
    
    const grid = document.getElementById('repositoryGrid');
    if (!grid) {
        console.error('Repository grid element not found');
        return;
    }
    
    if (filteredRepositoryItems.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>No items found</h3>
                <p>Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }

    const cardsHTML = filteredRepositoryItems.map(item => {
        const statusDotClass = getStatusDotClass(item.preservationStatus);
        const digitalStatusClass = getDigitalStatusClass(item.digitalStatus);
        
        return `
            <div class="repository-item">
                <div class="repository-item__header">
                    <h3 class="repository-item__name">${item.name}</h3>
                    <div class="repository-item__type">${item.type}</div>
                </div>
                
                <div class="repository-item__category">
                    <span class="repository-item__category-label">Category</span>
                    <div class="repository-item__category-value">${item.category}</div>
                </div>
                
                <div class="repository-item__meta">
                    <div class="repository-item__meta-item">
                        <div class="repository-item__meta-label">Location</div>
                        <div class="repository-item__meta-value">${item.monastery}</div>
                    </div>
                    <div class="repository-item__meta-item">
                        <div class="repository-item__meta-label">Date</div>
                        <div class="repository-item__meta-value">${item.estimatedDate}</div>
                    </div>
                    <div class="repository-item__meta-item">
                        <div class="repository-item__meta-label">Language</div>
                        <div class="repository-item__meta-value">${item.language}</div>
                    </div>
                    ${item.pages ? `
                        <div class="repository-item__meta-item">
                            <div class="repository-item__meta-label">Pages</div>
                            <div class="repository-item__meta-value">${item.pages}</div>
                        </div>
                    ` : item.dimensions ? `
                        <div class="repository-item__meta-item">
                            <div class="repository-item__meta-label">Dimensions</div>
                            <div class="repository-item__meta-value">${item.dimensions}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="repository-item__significance">
                    <span class="repository-item__significance-label">Significance</span>
                    <p class="repository-item__significance-text">${item.significance}</p>
                </div>
                
                <div class="repository-item__description">
                    ${item.description}
                </div>
                
                <div class="repository-item__status">
                    <div class="status-indicator">
                        <div class="status-dot ${statusDotClass}"></div>
                        <span>Preservation: ${item.preservationStatus}</span>
                    </div>
                    <div class="digital-status ${digitalStatusClass}">
                        ${item.digitalStatus}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    grid.innerHTML = cardsHTML;
    console.log(`Rendered ${filteredRepositoryItems.length} repository item cards`);
}

function getStatusDotClass(status) {
    switch(status) {
        case 'Good': return 'status-dot--good';
        case 'Fair': return 'status-dot--fair';
        case 'Needs Attention': return 'status-dot--needs-attention';
        default: return 'status-dot--fair';
    }
}

function getDigitalStatusClass(status) {
    switch(status) {
        case 'Fully Digitized': return 'digital-status--full';
        case 'Partially Digitized': return 'digital-status--partial';
        case 'Not Yet Digitized': return 'digital-status--none';
        default: return 'digital-status--partial';
    }
}

function updateRepositoryStats() {
    console.log('Updating repository stats...');
    
    const totalItems = document.getElementById('totalItems');
    const manuscriptCount = document.getElementById('manuscriptCount');
    const muralCount = document.getElementById('muralCount');
    const digitizedCount = document.getElementById('digitizedCount');
    
    if (totalItems) totalItems.textContent = filteredRepositoryItems.length;
    
    if (manuscriptCount) {
        const manuscripts = filteredRepositoryItems.filter(item => item.type === 'Manuscript').length;
        manuscriptCount.textContent = manuscripts;
    }
    
    if (muralCount) {
        const artworks = filteredRepositoryItems.filter(item => item.type !== 'Manuscript').length;
        muralCount.textContent = artworks;
    }
    
    if (digitizedCount) {
        const fullyDigitized = filteredRepositoryItems.filter(item => item.digitalStatus === 'Fully Digitized').length;
        digitizedCount.textContent = fullyDigitized;
    }
}

// AI Summary functionality
function initializeAISummary() {
    console.log('Initializing AI Summary functionality...');
    
    const generateButton = document.getElementById('generateSummary');
    const clearButton = document.getElementById('clearText');
    
    if (generateButton) {
        generateButton.addEventListener('click', generateSummary);
        console.log('Generate summary button listener added');
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', clearText);
        console.log('Clear text button listener added');
    }
}

function generateSummary() {
    console.log('Generating summary...');
    
    const inputTextArea = document.getElementById('inputText');
    const outputDiv = document.getElementById('summaryOutput');
    
    if (!inputTextArea || !outputDiv) {
        console.error('Required elements not found');
        return;
    }
    
    const inputText = inputTextArea.value.trim();
    
    if (!inputText) {
        outputDiv.innerHTML = '<p class="summary-placeholder">Please enter some text to summarize.</p>';
        return;
    }

    // Show loading state
    outputDiv.innerHTML = '<div class="loading">Generating summary...</div>';

    // Simulate processing time with actual summary generation
    setTimeout(() => {
        const summary = createIntelligentSummary(inputText);
        outputDiv.innerHTML = `<div class="summary-content">${summary}</div>`;
        console.log('Summary generated successfully');
    }, 1500);
}

function createIntelligentSummary(text) {
    console.log('Creating intelligent summary...');
    
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
        return '<p>Unable to generate summary from the provided text.</p>';
    }

    // Key terms for monastery content
    const keyTerms = [
        'monastery', 'founded', 'built', 'established', 'buddhist', 'tibetan',
        'architecture', 'sacred', 'temple', 'religious', 'cultural', 'heritage',
        'historical', 'ancient', 'traditional', 'spiritual', 'meditation',
        'monks', 'pilgrimage', 'festival', 'ceremony', 'significant', 'important',
        'manuscript', 'mural', 'thangka', 'art', 'painting', 'sculpture'
    ];

    // Score sentences based on relevance
    const scoredSentences = sentences.map(sentence => {
        const lowerSentence = sentence.toLowerCase();
        let score = 0;
        
        // Length score (prefer medium-length sentences)
        const words = sentence.trim().split(/\s+/);
        if (words.length >= 8 && words.length <= 25) {
            score += 2;
        }
        
        // Key term score
        keyTerms.forEach(term => {
            if (lowerSentence.includes(term)) {
                score += 3;
            }
        });
        
        // Position score (first and last sentences often important)
        const index = sentences.indexOf(sentence);
        if (index === 0 || index === sentences.length - 1) {
            score += 1;
        }
        
        // Avoid very short or very long sentences
        if (words.length < 5) {
            score -= 2;
        }
        if (words.length > 30) {
            score -= 1;
        }

        return { sentence: sentence.trim(), score };
    });

    // Sort by score and select top sentences
    scoredSentences.sort((a, b) => b.score - a.score);
    
    // Select 2-4 sentences based on input length
    const numSentences = Math.min(Math.max(2, Math.floor(sentences.length / 3)), 4);
    const selectedSentences = scoredSentences.slice(0, numSentences);
    
    // Reorder selected sentences by their original position
    selectedSentences.sort((a, b) => 
        sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence)
    );

    // Create summary with key insights
    let summary = '<p><strong>Key Points:</strong></p><ul>';
    
    selectedSentences.forEach(item => {
        summary += `<li>${item.sentence}.</li>`;
    });
    
    summary += '</ul>';

    // Add statistics
    const originalWords = text.split(/\s+/).length;
    const summaryWords = selectedSentences.reduce((count, item) => 
        count + item.sentence.split(/\s+/).length, 0);
    const compressionRatio = Math.round((1 - summaryWords / originalWords) * 100);

    summary += `<p><em>Summary: ${summaryWords} words (${compressionRatio}% compression)</em></p>`;

    return summary;
}

function clearText() {
    console.log('Clearing text...');
    
    const inputTextArea = document.getElementById('inputText');
    const outputDiv = document.getElementById('summaryOutput');
    
    if (inputTextArea) {
        inputTextArea.value = '';
    }
    
    if (outputDiv) {
        outputDiv.innerHTML = '<p class="summary-placeholder">Your AI-generated summary will appear here...</p>';
    }
}

// Add sample text functionality
function addSampleText() {
    console.log('Adding sample text...');
    
    const sampleText = `Rumtek Monastery, also known as the Dharmachakra Centre, is one of the most important monasteries in Sikkim and serves as the seat of the Karma Kagyu lineage of Tibetan Buddhism. Originally built in Tibet in the 16th century, the monastery was reconstructed in Sikkim in 1966 under the guidance of the 16th Karmapa. The monastery is renowned for its traditional Tibetan architecture, featuring a distinctive golden roof, red walls, and intricate wood carvings that showcase the finest craftsmanship of Tibetan artisans. The complex houses some of the most sacred relics of the Karma Kagyu lineage, including the famous Black Hat of the Karmapa. The monastery serves not only as a place of worship but also as a center for Buddhist learning and meditation practices. Throughout the year, Rumtek hosts various religious festivals and ceremonies that attract visitors from around the world. The monastery's location offers panoramic views of the surrounding mountains and valleys, creating a serene environment conducive to spiritual practice and reflection. The monastery's collection includes ancient manuscripts such as the Kangyur texts and beautiful murals depicting the Wheel of Life, making it a treasure trove of Buddhist art and literature.`;
    
    const inputTextArea = document.getElementById('inputText');
    if (inputTextArea) {
        inputTextArea.value = sampleText;
        console.log('Sample text added successfully');
    }
}

function addSampleButton() {
    console.log('Adding sample button...');
    
    const aiControls = document.querySelector('.ai-controls');
    if (aiControls) {
        const sampleButton = document.createElement('button');
        sampleButton.textContent = 'Load Sample';
        sampleButton.className = 'btn btn--outline';
        sampleButton.type = 'button';
        sampleButton.addEventListener('click', function(e) {
            e.preventDefault();
            addSampleText();
        });
        aiControls.appendChild(sampleButton);
        console.log('Sample button added successfully');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + number to switch tabs
    if (e.altKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                switchTab('history');
                break;
            case '2':
                e.preventDefault();
                switchTab('database');
                break;
            case '3':
                e.preventDefault();
                switchTab('repository');
                break;
            case '4':
                e.preventDefault();
                switchTab('ai-summary');
                break;
        }
    }
    
    // Ctrl/Cmd + Enter to generate summary when in textarea
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target.id === 'inputText') {
        e.preventDefault();
        generateSummary();
    }
});