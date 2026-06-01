// Translation object with API integration
const translations = {
    en: {
        'welcome-message-placeholder': 'Welcome, {userName}!',
        'hero-title': 'Sikkim Monasteries',
        'hero-text': 'Explore the spiritual sanctuaries of Sikkim, nestled in the serene Himalayas. Discover ancient wisdom and breathtaking views.',
        'section-title': 'Sacred Sanctuaries of Sikkim',
        'rumtek-title': 'Rumtek Monastery',
        'rumtek-text': 'Also known as the Dharma Chakra Centre, Rumtek is one of Sikkim\'s largest and most significant monasteries.',
        'pemayangtse-title': 'Pemayangtse Monastery',
        'pemayangtse-text': 'One of the oldest and most important monasteries in Sikkim, Pemayangtse means "perfect sublime lotus."',
        'dubdi-title': 'Dubdi Monastery',
        'dubdi-text': 'Established in 1701, Dubdi is considered one of Sikkim\'s oldest monasteries.',
        'tashiding-title': 'Tashiding Monastery',
        'tashiding-text': 'Considered the heart of Sikkim, Tashiding Monastery is revered as a sacred pilgrimage site.',
        'explore-btn': 'Explore',
        'language-btn': 'Language ▼',
        'help-title': 'How can I help you?',
        'assistant-label': 'Assistant\'s Response:',
        'theme-toggle-text': 'Dark Mode',
        'monasteries-title': 'Monasteries',
        'monasteries-text': 'Visit many monasteries in Sikkim',
        'food-title': 'Food & Cuisine',
        'food-text': 'Taste authentic Sikkimese flavors',
        'trekking-title': 'Trekking',
        'trekking-text': 'Adventure through Himalayan trails',
        'pilgrimage-title': 'Pilgrimage Sites',
        'pilgrimage-text': 'Sacred spiritual destinations'
    }
};

// Enhanced Translation Configuration
const TRANSLATION_CONFIG = {
    BATCH_SIZE: 15,
    TIMEOUT: 2000,
    MAX_CACHE_SIZE: 5000,
    PARALLEL_REQUESTS: 5,
    USE_SMART_BATCHING: true
};

// Advanced caching system with LRU eviction
class TranslationCache {
    constructor(maxSize = TRANSLATION_CONFIG.MAX_CACHE_SIZE) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    
    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return null;
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
    
    clear() {
        this.cache.clear();
    }
}

const translationCache = new TranslationCache();

// Smart text preprocessing for better translation
function preprocessText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
        .trim();
}

// Intelligent batch translation with parallel processing
async function batchTranslateTexts(texts, targetLang) {
    if (!texts.length || targetLang === 'en') return texts;
    
    const processedTexts = texts.map(preprocessText);
    const results = new Array(processedTexts.length);
    const toTranslate = [];
    
    // Check cache first
    processedTexts.forEach((text, i) => {
        const cached = translationCache.get(`${text}_${targetLang}`);
        if (cached) {
            results[i] = cached;
        } else {
            toTranslate.push({ text, index: i });
        }
    });
    
    if (toTranslate.length === 0) return results;
    
    // Process in parallel batches
    const batchPromises = [];
    for (let i = 0; i < toTranslate.length; i += TRANSLATION_CONFIG.PARALLEL_REQUESTS) {
        const batch = toTranslate.slice(i, i + TRANSLATION_CONFIG.PARALLEL_REQUESTS);
        batchPromises.push(processBatch(batch, targetLang));
    }
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Merge results
    batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
            result.value.forEach(({ translation, index }) => {
                results[index] = translation;
            });
        }
    });
    
    return results.map((result, i) => result || processedTexts[i]);
}

// Process batch with smart API selection
async function processBatch(batch, targetLang) {
    const promises = batch.map(async ({ text, index }) => {
        const translation = await translateTextFast(text, targetLang);
        return { translation, index };
    });
    
    return Promise.all(promises);
}

// Ultra-fast translation with smart API routing
async function translateTextFast(text, targetLang) {
    const cacheKey = `${text}_${targetLang}`;
    const cached = translationCache.get(cacheKey);
    if (cached) return cached;
    
    if (targetLang === 'en' || !text.trim() || text.length < 2) {
        return text;
    }
    
    // Smart API selection based on text characteristics
    const apis = getOptimalAPIs(text, targetLang);
    
    for (const api of apis) {
        try {
            const result = await Promise.race([
                api(text, targetLang),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('timeout')), TRANSLATION_CONFIG.TIMEOUT)
                )
            ]);
            
            if (result && result.trim() && result !== text) {
                translationCache.set(cacheKey, result);
                return result;
            }
        } catch (error) {
            continue;
        }
    }
    
    translationCache.set(cacheKey, text);
    return text;
}

// Get optimal APIs based on text characteristics
function getOptimalAPIs(text, targetLang) {
    const textLength = text.length;
    const hasSpecialChars = /[^\w\s.,!?-]/.test(text);
    
    // Prioritize APIs based on text type and target language
    const apis = [];
    
    // Google Translate - best for general text
    apis.push(async (text, lang) => {
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
        );
        if (response.ok) {
            const data = await response.json();
            return data?.[0]?.[0]?.[0];
        }
        return null;
    });
    
    // LibreTranslate - good for privacy and European languages
    if (textLength < 500 && ['es', 'fr', 'de', 'it', 'pt'].includes(targetLang)) {
        apis.push(async (text, lang) => {
            const response = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: text,
                    source: 'auto',
                    target: lang,
                    format: 'text'
                })
            });
            if (response.ok) {
                const data = await response.json();
                return data.translatedText;
            }
            return null;
        });
    }
    
    // MyMemory - good for short phrases
    if (textLength < 200) {
        apis.push(async (text, lang) => {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.responseStatus === 200) {
                    return data.responseData.translatedText;
                }
            }
            return null;
        });
    }
    
    return apis;
}

// Legacy function for compatibility
async function translateText(text, targetLang) {
    return translateTextFast(text, targetLang);
}

// Ultra-fast whole page translation system
async function updateLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('selectedLanguage', lang);
    
    const langNames = {
        'en': 'English', 'zh': '中文', 'hi': 'हिन्दी', 'es': 'Español', 'ar': 'العربية',
        'pt': 'Português', 'bn': 'বাংলা', 'ru': 'Русский', 'ja': '日本語', 'fr': 'Français',
        'ur': 'اردو', 'de': 'Deutsch', 'ko': '한국어', 'vi': 'Tiếng Việt', 'tr': 'Türkçe',
        'it': 'Italiano', 'th': 'ไทย', 'pl': 'Polski', 'nl': 'Nederlands', 'ne': 'नेपाली'
    };
    
    const currentLangEl = document.getElementById('current-lang');
    if (currentLangEl) {
        currentLangEl.textContent = langNames[lang] || 'English';
    }
    
    if (lang === 'en') {
        translationCache.clear();
        location.reload();
        return;
    }
    
    const loading = createTranslationLoader();
    document.body.appendChild(loading);
    
    try {
        await translatePageContent(lang, loading);
    } catch (error) {
        console.error('Translation failed:', error);
        showTranslationError();
    } finally {
        loading.remove();
    }
}

function createTranslationLoader() {
    const loading = document.createElement('div');
    loading.id = 'translation-loading';
    loading.innerHTML = `
        <div style="position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#06b6d4,#0891b2);color:white;padding:15px 20px;border-radius:12px;z-index:10000;font-weight:600;box-shadow:0 8px 25px rgba(6,182,212,0.3);display:flex;align-items:center;gap:10px;">
            <div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;animation:spin 1s linear infinite;"></div>
            <span id="translation-progress">Analyzing page...</span>
        </div>
        <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
    `;
    return loading;
}

async function translatePageContent(lang, loader) {
    const progressEl = loader.querySelector('#translation-progress');
    
    progressEl.textContent = 'Preserving controls...';
    const langDropdown = document.querySelector('.language-dropdown');
    const originalDropdownHTML = langDropdown ? langDropdown.innerHTML : '';
    
    progressEl.textContent = 'Collecting text...';
    const textNodes = collectTranslatableNodes();
    const totalNodes = textNodes.length;
    
    if (totalNodes === 0) {
        progressEl.textContent = 'No text to translate';
        return;
    }
    
    progressEl.textContent = 'Translating content...';
    
    const batchSize = Math.min(TRANSLATION_CONFIG.BATCH_SIZE, Math.ceil(totalNodes / 10));
    const batches = [];
    
    for (let i = 0; i < totalNodes; i += batchSize) {
        batches.push(textNodes.slice(i, i + batchSize));
    }
    
    let completed = 0;
    const batchPromises = batches.map(async (batch, batchIndex) => {
        const texts = batch.map(node => node.textContent.trim()).filter(Boolean);
        
        if (texts.length === 0) return;
        
        try {
            const translations = await batchTranslateTexts(texts, lang);
            
            let textIndex = 0;
            batch.forEach(node => {
                const originalText = node.textContent.trim();
                if (originalText && translations[textIndex]) {
                    const translated = translations[textIndex];
                    if (translated && translated !== originalText) {
                        node.textContent = translated;
                    }
                    textIndex++;
                }
            });
            
            completed += batch.length;
            const progress = Math.round((completed / totalNodes) * 100);
            progressEl.textContent = `Translating... ${progress}%`;
            
        } catch (error) {
            console.warn(`Batch ${batchIndex} failed:`, error);
            await translateBatchIndividually(batch, lang);
            completed += batch.length;
        }
    });
    
    await Promise.allSettled(batchPromises);
    
    progressEl.textContent = 'Finalizing...';
    await translatePageAttributes(lang);
    
    if (langDropdown && originalDropdownHTML) {
        langDropdown.innerHTML = originalDropdownHTML;
    }
    
    progressEl.textContent = 'Translation complete!';
}

function collectTranslatableNodes() {
    const nodes = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                const text = node.textContent.trim();
                const parent = node.parentElement;
                
                if (parent.closest('.language-dropdown, .floating-controls') ||
                    parent.matches('script, style, code, pre, noscript') ||
                    text.length < 1 ||
                    /^[\d\s\-\.\,\(\)\[\]\{\}\<\>\@\#\$\%\^\&\*\+\=\_\|\\\~\`\!\?\:";'\/]+$/.test(text)) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        nodes.push(node);
    }
    
    return nodes;
}

async function translateBatchIndividually(batch, lang) {
    const promises = batch.map(async (node) => {
        const text = node.textContent.trim();
        if (text) {
            try {
                const translated = await translateTextFast(text, lang);
                if (translated && translated !== text) {
                    node.textContent = translated;
                }
            } catch (error) {
                console.warn('Individual translation failed:', error);
            }
        }
    });
    
    await Promise.allSettled(promises);
}

async function translatePageAttributes(lang) {
    const elements = document.querySelectorAll('[placeholder], [title], [alt]');
    const attributePromises = [];
    
    for (const el of elements) {
        if (el.closest('.language-dropdown, .floating-controls')) continue;
        
        ['placeholder', 'title', 'alt'].forEach(attr => {
            if (el.hasAttribute(attr)) {
                const value = el.getAttribute(attr);
                if (value && value.trim().length > 1) {
                    attributePromises.push(
                        translateTextFast(value, lang)
                            .then(translated => {
                                if (translated && translated !== value) {
                                    el.setAttribute(attr, translated);
                                }
                            })
                            .catch(() => {})
                    );
                }
            }
        });
    }
    
    await Promise.allSettled(attributePromises);
}

function showTranslationError() {
    const error = document.createElement('div');
    error.innerHTML = `<div style="position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:15px 20px;border-radius:12px;z-index:10000;font-weight:600;">Translation failed. Please try again.</div>`;
    document.body.appendChild(error);
    setTimeout(() => error.remove(), 3000);
}

const synth = window.speechSynthesis;
let voices = [];
let isMuted = false;
let slideIndex = 0;
let slideshowInterval;

const languageVoiceMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'de': 'de-DE',
    'ru': 'ru-RU',
    'ja': 'ja-JP',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'ko': 'ko-KR',
    'zh': 'zh-CN',
    'ar': 'ar-SA',
    'ne': 'ne-NP'
};

synth.onvoiceschanged = () => {
    voices = synth.getVoices();
};

const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeButton = document.querySelector('.close-button');

function showSlides() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;

    slides[slideIndex - 1].classList.add('active');
    if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add('active');
}

function extractImageColors(imageSrc) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }
        
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        applyDynamicTheme(r, g, b);
    };
    img.src = imageSrc;
}

function applyDynamicTheme(r, g, b) {
    const root = document.documentElement;
    const isDark = (r + g + b) / 3 < 128;
    
    root.style.setProperty('--primary-color', `rgb(${r}, ${g}, ${b})`);
    root.style.setProperty('--primary-alpha', `rgba(${r}, ${g}, ${b}, 0.8)`);
    root.style.setProperty('--text-color', isDark ? '#ffffff' : '#000000');
    root.style.setProperty('--bg-overlay', isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)');
}

function initScrollEffects() {
    const heroContainer = document.querySelector('.hero-container');
    const monasterySection = document.querySelector('.monastery-collage');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (heroContainer) {
            heroContainer.style.transform = `translateY(${rate}px)`;
        }
        
        if (monasterySection && scrolled > window.innerHeight * 0.3) {
            monasterySection.style.transform = 'translateY(-20px)';
            monasterySection.style.boxShadow = '0 -20px 40px rgba(0,0,0,0.3)';
        }
    });
}

function initFloatingControls() {
    const languageBtn = document.getElementById('language-toggle');
    const dropdown = document.querySelector('.language-dropdown');
    
    if (languageBtn && dropdown) {
        // Remove existing listeners to prevent duplicates
        languageBtn.replaceWith(languageBtn.cloneNode(true));
        const newLanguageBtn = document.getElementById('language-toggle');
        
        newLanguageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        dropdown.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-lang')) {
                const lang = e.target.getAttribute('data-lang');
                dropdown.classList.remove('show');
                localStorage.setItem('selectedLanguage', lang);
                updateLanguage(lang);
            }
        });
        
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
        
        // Update current language display
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        const langNames = {
            'en': 'English', 'zh': '中文', 'hi': 'हिन्दी', 'es': 'Español', 'ar': 'العربية',
            'pt': 'Português', 'bn': 'বাংলা', 'ru': 'Русский', 'ja': '日本語', 'fr': 'Français',
            'ur': 'اردو', 'de': 'Deutsch', 'ko': '한국어', 'vi': 'Tiếng Việt', 'tr': 'Türkçe',
            'it': 'Italiano', 'th': 'ไทย', 'pl': 'Polski', 'nl': 'Nederlands', 'ne': 'नेपाली'
        };
        
        const currentLangEl = document.getElementById('current-lang');
        if (currentLangEl) {
            currentLangEl.textContent = langNames[savedLanguage] || 'English';
        }
    }
}



// Fast page translation for non-home pages
async function translateCurrentPage(lang) {
    if (lang === 'en' || !lang) return;
    
    document.documentElement.lang = lang;
    
    const loading = document.createElement('div');
    loading.innerHTML = '<div style="position:fixed;top:10px;right:10px;background:rgba(6,182,212,0.8);color:white;padding:8px 12px;border-radius:6px;z-index:10000;font-size:0.8rem;"><i class="fas fa-language"></i> Translating...</div>';
    document.body.appendChild(loading);
    
    try {
        const langDropdown = document.querySelector('.language-dropdown');
        const originalDropdownHTML = langDropdown ? langDropdown.innerHTML : '';
        
        const textNodes = collectTranslatableNodes();
        
        if (textNodes.length > 0) {
            const batchSize = Math.min(20, textNodes.length);
            const batches = [];
            
            for (let i = 0; i < textNodes.length; i += batchSize) {
                batches.push(textNodes.slice(i, i + batchSize));
            }
            
            await Promise.allSettled(batches.map(async (batch) => {
                const texts = batch.map(node => node.textContent.trim()).filter(Boolean);
                if (texts.length === 0) return;
                
                try {
                    const translations = await batchTranslateTexts(texts, lang);
                    
                    let textIndex = 0;
                    batch.forEach(node => {
                        const originalText = node.textContent.trim();
                        if (originalText && translations[textIndex]) {
                            const translated = translations[textIndex];
                            if (translated && translated !== originalText) {
                                node.textContent = translated;
                            }
                            textIndex++;
                        }
                    });
                } catch (error) {
                    await translateBatchIndividually(batch, lang);
                }
            }));
        }
        
        await translatePageAttributes(lang);
        
        if (langDropdown && originalDropdownHTML) {
            langDropdown.innerHTML = originalDropdownHTML;
        }
        
    } catch (error) {
        console.error('Page translation failed:', error);
    } finally {
        loading.remove();
    }
}

function initDynamicTheming() {
    const slides = document.querySelectorAll('.hero-slide');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const slide = mutation.target;
                if (slide.classList.contains('active')) {
                    extractImageColors(slide.src);
                }
            }
        });
    });
    
    slides.forEach(slide => {
        observer.observe(slide, { attributes: true });
    });
    
    if (slides.length > 0) {
        extractImageColors(slides[0].src);
    }
}

// AI Help System
function initializeAIHelp() {
    const userInput = document.getElementById('user-input-text');
    const sendButton = document.getElementById('send-button');
    const listenButton = document.getElementById('listen-button');
    const muteButton = document.getElementById('mute-button');
    const assistantResponse = document.getElementById('assistant-response');
    
    let isListening = false;
    let recognition = null;
    let currentVoiceIndex = 0;
    let availableVoices = [];
    let silenceTimer = null;
    let lastSpeechTime = null;
    let finalTranscript = '';
    
    // Load and initialize voices
    function loadVoices() {
        const allVoices = synth.getVoices();
        console.log('Loading voices...', allVoices.length, 'voices available');
        
        if (allVoices.length > 0) {
            console.log('Available voices:', allVoices.map(v => `${v.name} (${v.lang})`));
            
            // Find best English voices
            availableVoices = allVoices.filter(voice => voice.lang.startsWith('en'));
            
            if (availableVoices.length === 0) {
                availableVoices = allVoices; // Fallback to all voices
            }
            
            console.log('Selected voices for AI:', availableVoices.map(v => v.name));
            return true;
        }
        return false;
    }
    
    // Initialize voices with multiple attempts
    let voicesLoaded = false;
    
    function initializeVoices() {
        if (!voicesLoaded) {
            voicesLoaded = loadVoices();
        }
    }
    
    // Try to load voices immediately
    initializeVoices();
    
    // Set up voice change listener
    synth.onvoiceschanged = () => {
        console.log('Voices changed event fired');
        voicesLoaded = loadVoices();
    };
    
    // Fallback attempts to load voices
    setTimeout(initializeVoices, 100);
    setTimeout(initializeVoices, 500);
    setTimeout(initializeVoices, 1000);
    setTimeout(initializeVoices, 2000);
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        // Enhanced settings for faster processing
        recognition.serviceURI = 'wss://www.google.com/speech-api/v2/recognize';
        
        // Process interim results for faster response
        recognition.onresult = (event) => {
            let currentFinalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    currentFinalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Update last speech time when we get any speech
            if (interimTranscript || currentFinalTranscript) {
                lastSpeechTime = Date.now();
                
                // Clear existing silence timer
                if (silenceTimer) {
                    clearTimeout(silenceTimer);
                    silenceTimer = null;
                }
            }
            
            // Show interim results
            if (interimTranscript) {
                userInput.value = finalTranscript + interimTranscript;
                assistantResponse.textContent = 'Listening... ' + (finalTranscript + interimTranscript);
                
                // Start silence timer for auto-answer after 5 seconds
                if (silenceTimer) clearTimeout(silenceTimer);
                silenceTimer = setTimeout(() => {
                    if (isListening && (finalTranscript + interimTranscript).trim()) {
                        console.log('Auto-answering after 5 seconds of silence');
                        recognition.stop();
                        processUserQuestion((finalTranscript + interimTranscript).trim());
                    }
                }, 5000);
            }
            
            // Process final result immediately
            if (currentFinalTranscript && currentFinalTranscript.trim()) {
                finalTranscript += currentFinalTranscript;
                userInput.value = finalTranscript;
                console.log('Processing final voice input:', finalTranscript.trim());
                
                // Clear silence timer since we got final result
                if (silenceTimer) {
                    clearTimeout(silenceTimer);
                    silenceTimer = null;
                }
                
                processUserQuestion(finalTranscript.trim());
                
                // Stop listening after getting final result
                isListening = false;
                listenButton.innerHTML = '<i class="fas fa-microphone"></i>';
                listenButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                listenButton.style.borderRadius = '50%';
                finalTranscript = ''; // Reset for next session
            }
        };
        
        recognition.onerror = (event) => {
            console.log('Speech recognition error:', event.error);
            isListening = false;
            listenButton.innerHTML = '<i class="fas fa-microphone"></i>';
            
            const errorMessages = {
                'no-speech': 'I didn\'t hear anything. Please try speaking again.',
                'audio-capture': 'Microphone access issue. Please check your microphone.',
                'not-allowed': 'Microphone permission denied. Please allow microphone access.',
                'network': 'Network error. Please check your connection.',
                'aborted': 'Speech recognition was interrupted.'
            };
            
            const errorMsg = errorMessages[event.error] || 'Speech recognition error. Please try typing your question.';
            assistantResponse.textContent = errorMsg;
            
            if (event.error === 'no-speech' && isListening) {
                setTimeout(() => {
                    if (isListening) {
                        try {
                            recognition.start();
                        } catch (e) {
                            isListening = false;
                            listenButton.innerHTML = '<i class="fas fa-microphone"></i>';
                        }
                    }
                }, 1000);
            }
        };
        
        recognition.onend = () => {
            // Clear silence timer when recognition ends
            if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
            }
            
            isListening = false;
            listenButton.innerHTML = '<i class="fas fa-microphone"></i>';
            listenButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            listenButton.style.borderRadius = '50%';
        };
        
        recognition.onspeechstart = () => {
            console.log('Speech detected');
            assistantResponse.textContent = 'Listening... I can hear you speaking.';
        };
        
        recognition.onspeechend = () => {
            console.log('Speech ended');
            assistantResponse.textContent = 'Processing what you said...';
        };
        
        recognition.onstart = () => {
            assistantResponse.textContent = 'Listening... Please speak now.';
        };
    }
    
    // Ultra-Enhanced AI Knowledge Base with Real-time APIs
    const enhancedKnowledgeBase = {
        // Real-time data sources
        realTimeAPIs: {
            weather: 'https://api.openweathermap.org/data/2.5/weather',
            news: 'https://newsapi.org/v2/top-headlines',
            wikipedia: 'https://en.wikipedia.org/api/rest_v1/page/summary',
            currency: 'https://api.exchangerate-api.com/v4/latest',
            time: 'https://worldtimeapi.org/api/timezone'
        },
        
        // Instant response patterns for speed
        quickResponses: {
            greeting: ['Hello! How can I help you explore Sikkim today?', 'Hi there! Ready to discover Sikkim?', 'Welcome! What would you like to know about Sikkim?'],
            thanks: ['You\'re welcome! Happy to help with your Sikkim journey!', 'My pleasure! Enjoy exploring Sikkim!', 'Glad I could help! Have a wonderful trip!'],
            goodbye: ['Safe travels! Come back anytime for more Sikkim info!', 'Goodbye! May your Sikkim adventure be amazing!', 'See you later! Enjoy the beautiful Himalayas!'],
            unknown: ['Let me search for that information...', 'I\'m looking that up for you...', 'Searching my knowledge base...']
        },
        
        // Conversational AI patterns
        conversationContext: new Map(),
        
        // Advanced query understanding
        intentPatterns: {
            weather: /weather|temperature|rain|snow|climate|forecast|hot|cold|sunny|cloudy/i,
            time: /time|clock|hour|minute|when|schedule|timing/i,
            location: /where|location|address|distance|direction|map|route/i,
            booking: /book|reserve|ticket|hotel|stay|accommodation/i,
            food: /food|eat|restaurant|hungry|meal|cuisine|dish/i,
            transport: /bus|taxi|train|flight|car|transport|travel|reach/i,
            emergency: /help|emergency|hospital|police|problem|urgent/i,
            calculation: /calculate|math|plus|minus|multiply|divide|\d+\s*[+\-*/]\s*\d+/i,
            general: /what|how|why|when|where|who|tell me|explain/i
        }
    };
    
    const knowledgeBase = {
        sikkim: {
            capital: 'Gangtok',
            population: '610,577 (2011 census)',
            area: '7,096 sq km (India\'s second smallest state)',
            languages: ['Nepali (lingua franca)', 'Sikkimese (Bhutia)', 'Lepcha', 'Hindi', 'English (official)', 'Limbu', 'Newari', 'Rai', 'Gurung', 'Mangar', 'Sherpa', 'Tamang'],
            bestTime: 'March to June (spring/summer) and September to December (post-monsoon/winter)',
            climate: 'Subtropical to alpine: Gangtok 15-25°C summer, 4-15°C winter; Higher altitudes much colder',
            altitude: '280m (Rangpo) to 8,586m (Kanchenjunga peak - world\'s 3rd highest)',
            currency: 'Indian Rupee (INR) - ₹1 = 100 paise',
            statehood: 'May 16, 1975 (36th state of India, formerly protectorate)',
            districts: ['East Sikkim (Gangtok)', 'West Sikkim (Gyalshing)', 'North Sikkim (Mangan)', 'South Sikkim (Namchi)'],
            borders: ['Tibet/China (north)', 'Nepal (west)', 'Bhutan (east)', 'West Bengal/India (south)'],
            religion: 'Hinduism (57.8%), Buddhism (27.4%), Christianity (9.9%), Islam (1.4%), Others (3.5%)',
            literacy: '82.2% (Male: 87.3%, Female: 76.4%)',
            organicState: 'First fully organic state in India (2016)',
            biodiversity: '4,500+ flowering plants, 550+ orchids, 362+ ferns',
            history: 'Founded by Phuntsog Namgyal in 1642, ruled by Chogyals until 1975. Became Indian protectorate in 1950, full state in 1975.',
            economy: 'Tourism, agriculture (cardamom, ginger, oranges), hydroelectric power, handicrafts',
            wildlife: 'Red panda (state animal), snow leopard, Himalayan black bear, musk deer, blue sheep, 550+ bird species',
            nationalParks: 'Khangchendzonga National Park (UNESCO World Heritage), Fambong Lho Wildlife Sanctuary',
            festivals: 'Losar, Saga Dawa, Bumchu, Dashain, Tihar, Phang Lhabsol',
            traditionalDress: 'Bakhu (men), Kho/Dumvum (women), Pangden (married women)',
            rivers: 'Teesta (main), Rangeet, Lachung Chu, Lachen Chu',
            passes: 'Nathu La (China border), Jelep La (historic trade route)',
            education: 'Sikkim University, NIT Sikkim, numerous colleges and schools'
        },
        monasteries: {
            rumtek: {
                name: 'Rumtek Monastery',
                founded: '1966',
                school: 'Kagyu School of Tibetan Buddhism',
                location: 'Rumtek, East Sikkim',
                altitude: '1,550 meters',
                significance: 'Seat of the 16th Karmapa, largest monastery in Sikkim',
                features: 'Golden Stupa, prayer wheels, traditional Tibetan architecture',
                distance: '24 km from Gangtok',
                timings: '6:00 AM - 6:00 PM',
                entry: 'Free',
                specialEvents: 'Cham dance during festivals, daily prayers at 6 AM and 6 PM',
                architecture: 'Traditional Tibetan style with golden roof, intricate woodwork',
                relics: 'Black Crown of Karmapa, ancient manuscripts, thangkas'
            },
            pemayangtse: {
                name: 'Pemayangtse Monastery',
                founded: '1705',
                school: 'Nyingma School of Tibetan Buddhism',
                location: 'Pelling, West Sikkim',
                altitude: '2,085 meters',
                significance: 'Second oldest monastery, perfect sublime lotus',
                features: '7-tiered wooden sculpture, Kanchenjunga views',
                distance: '110 km from Gangtok'
            },
            tashiding: {
                name: 'Tashiding Monastery',
                founded: '1641',
                school: 'Nyingma School of Tibetan Buddhism',
                location: 'Tashiding, West Sikkim',
                altitude: '1,465 meters',
                significance: 'Heart of Sikkim, most sacred pilgrimage site',
                features: 'Bumchu festival, holy water ceremony',
                distance: '40 km from Gyalshing'
            },
            dubdi: {
                name: 'Dubdi Monastery',
                founded: '1701',
                school: 'Nyingma School of Tibetan Buddhism',
                location: 'Yuksom, West Sikkim',
                altitude: '2,100 meters',
                significance: 'Oldest monastery in Sikkim',
                features: 'Hilltop location, trekking access',
                distance: '32 km from Pelling'
            }
        },
        food: {
            momos: 'Steamed dumplings with vegetables or meat, served with spicy tomato chutney. Price: ₹50-80 for 6-8 pieces',
            thukpa: 'Tibetan noodle soup with vegetables and meat in clear broth. Price: ₹60-120',
            gundruk: 'Fermented leafy green vegetables, rich in vitamins and probiotics. Price: ₹40-80',
            'sel roti': 'Traditional ring-shaped rice bread, sweet and crispy. Price: ₹20-40 per piece',
            chhurpi: 'Dried yak cheese, high in protein, can be soft or hard. Price: ₹200-500/kg',
            kinema: 'Fermented soybean curry with tomatoes and spices. Price: ₹60-100',
            phagshapa: 'Pork curry with radish and dried chilies, traditional Sikkimese dish. Price: ₹120-200',
            'chang': 'Traditional alcoholic beverage made from barley or millet. Price: ₹50-100/glass',
            'sukuti': 'Dried meat jerky, usually buffalo or yak meat. Price: ₹300-500/kg',
            'dal bhat': 'Rice with lentil curry, vegetables, pickle. Staple meal. Price: ₹80-150',
            'sha phaley': 'Fried meat pastry, Tibetan style. Price: ₹40-70 per piece',
            'tingmo': 'Steamed bread, served with curry. Price: ₹30-50',
            'churpi soup': 'Yak cheese soup, nutritious and warming. Price: ₹80-120',
            'bamboo shoot curry': 'Local delicacy with fermented bamboo shoots. Price: ₹70-120'
        },
        treks: {
            'goecha la': {
                duration: '11 days',
                difficulty: 'Challenging',
                altitude: '4,940m',
                highlights: 'Kanchenjunga views, Samiti Lake, rhododendron forests',
                cost: '₹25,000-35,000 per person',
                bestTime: 'April-May, September-November',
                permits: 'Required through registered operators',
                route: 'Yuksom → Sachen → Tshoka → Dzongri → Thansing → Lamuney → Goecha La',
                fitness: 'Good physical fitness required, prior trekking experience recommended'
            },
            'dzongri': {
                duration: '5-6 days',
                difficulty: 'Moderate',
                altitude: '4,020m',
                highlights: 'Panoramic mountain views, beginner-friendly'
            },
            'singalila ridge': {
                duration: '6-7 days',
                difficulty: 'Moderate',
                altitude: '3,636m',
                highlights: 'Everest views, Indo-Nepal border, sunrise views'
            },
            'green lake': {
                duration: '15 days',
                difficulty: 'Very challenging',
                altitude: '5,000m',
                highlights: 'Kanchenjunga base camp, pristine alpine lake'
            }
        },
        festivals: {
            losar: 'Tibetan New Year celebrated in February/March with traditional dances, mask dances, family gatherings',
            'saga dawa': 'Buddha\'s birth, enlightenment and death commemoration in May/June, pilgrimage to monasteries',
            dashain: 'Major Hindu festival celebrating victory of good over evil in October, 15-day celebration',
            tihar: 'Festival of lights, similar to Diwali, celebrated in October/November, honors different animals',
            bumchu: 'Sacred water festival at Tashiding monastery in February/March, holy water ceremony',
            'phang lhabsol': 'Guardian deity festival in August/September, celebrates Mount Kanchenjunga',
            'drukpa kunley': 'Celebrates the divine madman saint, colorful processions',
            'maghe sankranti': 'Harvest festival in January, traditional foods and rituals',
            'buddha jayanti': 'Buddha\'s birthday celebration in May, monastery visits and prayers'
        },
        permits: {
            indian: 'Inner Line Permit (ILP) required for restricted areas like North Sikkim, Tsomgo Lake, Nathula Pass',
            foreign: 'Protected Area Permit (PAP) and Restricted Area Permit (RAP) required, must travel in groups of 2+',
            duration: 'ILP: 15 days extendable, PAP: 30 days',
            cost: 'ILP: Free for Indians, PAP: $50 for foreigners',
            process: 'Online application at sikkimtourism.gov.in or through tour operators',
            documents: 'Valid ID proof, passport photos, travel itinerary',
            restrictions: 'Some areas completely restricted, others require special permits',
            checkpoints: 'Rangpo, Melli (entry points), various internal checkpoints'
        },
        transportation: {
            airport: 'Pakyong Airport (PYG), 30 km from Gangtok. Limited flights, mainly to Kolkata',
            railway: 'New Jalpaiguri (NJP) - nearest major railway station, 148 km from Gangtok',
            road: 'Well connected by NH10 from Siliguri. Journey time: 4-5 hours to Gangtok',
            local: 'Shared taxis (₹50-200), private cars (₹2000-4000/day), buses (₹30-150)',
            helicopter: 'Helicopter services available from Bagdogra to Gangtok (₹5000-15000)',
            taxi: 'Pre-paid taxis from NJP/Bagdogra to Gangtok (₹2500-3500)',
            bus: 'Regular bus services from Siliguri, Darjeeling, Kalimpong',
            permits: 'Vehicle permits required for non-Sikkim vehicles'
        },
        accommodation: {
            budget: 'Guesthouses, homestays: ₹800-2000/night',
            midRange: 'Hotels, resorts: ₹2000-6000/night',
            luxury: 'Premium resorts, heritage hotels: ₹6000-20000/night',
            homestays: 'Village homestays: ₹1000-2500/night with meals',
            camping: 'Trekking camps: ₹500-1500/night',
            booking: 'Advance booking recommended, especially during peak season'
        },
        shopping: {
            handicrafts: 'Thangkas, carpets, wooden items, traditional jewelry',
            textiles: 'Handwoven fabrics, traditional dresses, woolen items',
            food: 'Organic spices, tea, dried fruits, local pickles',
            markets: 'MG Marg (Gangtok), Lal Bazaar, Deorali Market',
            souvenirs: 'Prayer flags, singing bowls, Buddhist artifacts',
            prices: 'Handicrafts: ₹200-5000, Textiles: ₹500-8000, Spices: ₹100-500'
        }
    };
    
    async function generateAIResponse(question) {
        const startTime = Date.now();
        const lowerQuestion = question.toLowerCase().trim();
        
        // Instant responses for common queries
        const quickResponse = getInstantResponse(lowerQuestion);
        if (quickResponse) {
            return quickResponse;
        }
        
        // Sikkim-specific comprehensive responses first
        const sikkimResponse = getSikkimSpecificResponse(question);
        if (sikkimResponse) {
            return sikkimResponse;
        }
        
        // Real-time API responses for current information
        try {
            const realTimeResponse = await getRealTimeAPIResponse(question);
            if (realTimeResponse) {
                return realTimeResponse;
            }
        } catch (error) {
            console.log('Real-time API failed, using fallback');
        }
        
        // Comprehensive knowledge base response
        const knowledgeResponse = getComprehensiveResponse(question);
        if (knowledgeResponse) {
            return knowledgeResponse;
        }
        
        // Final fallback
        return `I can help with information about Sikkim tourism, monasteries, food, trekking, permits, transportation, and general knowledge. What would you like to know?`;
    }
    
    function getInstantResponse(question) {
        // Greetings
        if (/^(hi|hello|hey|namaste|good morning|good evening)$/i.test(question)) {
            return `Hello! I'm your AI assistant. I can answer questions about anything - current events, science, technology, travel, history, and much more. What would you like to know?`;
        }
        
        // Time
        if (/\b(time|clock|what time)\b/i.test(question)) {
            const now = new Date();
            return `🕐 Current time: ${now.toLocaleTimeString('en-US', { hour12: true, timeZoneName: 'short' })}`;
        }
        
        // Date
        if (/\b(date|today|what day)\b/i.test(question)) {
            const today = new Date();
            return `📅 Today is ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        }
        
        // Math calculations
        const mathMatch = question.match(/(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/i);
        if (mathMatch) {
            const [, num1, operator, num2] = mathMatch;
            const a = parseFloat(num1), b = parseFloat(num2);
            let result;
            switch (operator) {
                case '+': result = a + b; break;
                case '-': result = a - b; break;
                case '*': result = a * b; break;
                case '/': result = b !== 0 ? a / b : 'Cannot divide by zero'; break;
            }
            return `🧮 ${num1} ${operator} ${num2} = ${result}`;
        }
        
        return null;
    }
    
    async function getRealTimeAPIResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Weather queries
        if (/weather|temperature|climate|forecast/i.test(question)) {
            return await getWeatherInfo(question);
        }
        
        // News queries
        if (/news|current events|latest|happening/i.test(question)) {
            return await getNewsInfo(question);
        }
        
        // Currency/exchange rates
        if (/currency|exchange rate|dollar|euro|bitcoin/i.test(question)) {
            return await getCurrencyInfo(question);
        }
        
        // Stock market
        if (/stock|market|shares|nasdaq|dow jones/i.test(question)) {
            return await getStockInfo(question);
        }
        
        // Wikipedia search for factual information
        if (/who is|what is|tell me about|information about/i.test(question)) {
            return await getWikipediaInfo(question);
        }
        
        return null;
    }
    
    async function getWeatherInfo(question) {
        const location = extractLocationFromQuestion(question) || 'New York';
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true&timezone=auto`);
            const data = await response.json();
            const current = data.current_weather;
            const temp = Math.round(current.temperature);
            const condition = current.weathercode < 3 ? 'Clear' : current.weathercode < 50 ? 'Cloudy' : 'Rainy';
            return `🌤️ Current weather: ${temp}°C, ${condition}. Wind speed: ${current.windspeed} km/h`;
        } catch (error) {
            return `Weather information is temporarily unavailable. Please try again later.`;
        }
    }
    
    async function getNewsInfo(question) {
        try {
            const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/rss.xml');
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const topNews = data.items.slice(0, 3);
                return `📰 Latest News:\n${topNews.map((item, i) => `${i+1}. ${item.title}`).join('\n')}`;
            }
        } catch (error) {
            console.log('News API failed');
        }
        return `📰 News service temporarily unavailable. I can still help with other topics!`;
    }
    
    async function getCurrencyInfo(question) {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            const rates = data.rates;
            
            if (/bitcoin|btc/i.test(question)) {
                return `₿ Bitcoin information requires specialized crypto API. Current major currencies: 1 USD = ${rates.EUR?.toFixed(2)} EUR, ${rates.GBP?.toFixed(2)} GBP`;
            }
            
            return `💱 Current Exchange Rates (USD base):\n• 1 USD = ${rates.EUR?.toFixed(2)} EUR\n• 1 USD = ${rates.GBP?.toFixed(2)} GBP\n• 1 USD = ${rates.INR?.toFixed(2)} INR`;
        } catch (error) {
            return `💱 Currency rates temporarily unavailable. Please try again later.`;
        }
    }
    
    async function getWikipediaInfo(question) {
        try {
            const searchTerm = question.replace(/who is|what is|tell me about|information about/gi, '').trim();
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            
            if (data.extract) {
                return `📖 ${data.title}: ${data.extract.substring(0, 300)}${data.extract.length > 300 ? '...' : ''}`;
            }
        } catch (error) {
            console.log('Wikipedia API failed');
        }
        return null;
    }
    
    async function getStockInfo(question) {
        // Placeholder for stock information
        return `📈 Stock market information requires real-time financial data APIs. I can help with general market concepts and investment principles instead.`;
    }
    
    function extractLocationFromQuestion(question) {
        const locations = ['new york', 'london', 'tokyo', 'paris', 'delhi', 'mumbai', 'gangtok', 'sikkim'];
        const found = locations.find(loc => question.toLowerCase().includes(loc));
        return found || null;
    }
    
    function getSikkimSpecificResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Comprehensive Sikkim information with ultra-detailed responses
        if (/\b(sikkim|gangtok|state|himalaya|kanchenjunga)\b/i.test(question)) {
            if (/history|founded|origin|past/i.test(question)) {
                return `🏛️ Sikkim History: ${knowledgeBase.sikkim.history} The Namgyal dynasty ruled for over 300 years. Key events: 1642 - First Chogyal crowned, 1890 - British protectorate, 1950 - Indian protectorate, 1975 - Became Indian state after referendum. Rich Buddhist and Hindu heritage with peaceful coexistence.`;
            }
            if (/economy|business|industry|work/i.test(question)) {
                return `💼 Sikkim Economy: ${knowledgeBase.sikkim.economy}. Per capita income highest in Northeast India. Major exports: Cardamom (largest producer in India), ginger, oranges. Growing IT sector, pharmaceutical industry. Unemployment rate low due to tourism boom.`;
            }
            if (/wildlife|animals|nature|biodiversity/i.test(question)) {
                return `🐾 Sikkim Wildlife: ${knowledgeBase.sikkim.wildlife}. ${knowledgeBase.sikkim.nationalParks}. Altitude zones create diverse ecosystems: tropical (300m) to alpine (5000m+). Conservation success: Red panda population stable, snow leopard sightings increasing.`;
            }
            if (/festival|celebration|culture|tradition/i.test(question)) {
                return `🎭 Sikkim Festivals: Rich cultural calendar with ${Object.keys(knowledgeBase.festivals).length}+ major festivals. ${knowledgeBase.festivals.losar}, ${knowledgeBase.festivals['phang lhabsol']}. Traditional dress: ${knowledgeBase.sikkim.traditionalDress}. Multicultural harmony with Buddhist, Hindu, Christian celebrations.`;
            }
            if (/education|school|university|study/i.test(question)) {
                return `🎓 Sikkim Education: ${knowledgeBase.sikkim.education}. Literacy rate: ${knowledgeBase.sikkim.literacy}. Free education up to Class 12. Emphasis on environmental studies, organic farming. Technical institutes for tourism, hospitality training.`;
            }
            return `🏔️ Sikkim Overview: ${knowledgeBase.sikkim.organicState}, ${knowledgeBase.sikkim.statehood}. Capital: ${knowledgeBase.sikkim.capital}. Area: ${knowledgeBase.sikkim.area}. Population: ${knowledgeBase.sikkim.population}. Known for: Peaceful culture, stunning landscapes, Buddhist monasteries, organic farming, adventure tourism.`;
        }
        
        // Ultra-detailed monastery responses
        if (/\b(monastery|monasteries|buddhist|temple|gompa|prayer|meditation|spiritual)\b/i.test(question)) {
            if (/timing|time|hours|open|close|visit/i.test(question)) {
                return `⏰ Monastery Timings: Most open ${knowledgeBase.monasteries.rumtek.timings}, ${knowledgeBase.monasteries.rumtek.entry}. Best times: Morning prayers (6-8 AM), evening prayers (5-6 PM). Photography: Allowed in courtyards, restricted in prayer halls. Dress modestly, remove shoes before entering main halls. Maintain silence during prayers.`;
            }
            if (/cost|price|fee|money|expensive/i.test(question)) {
                return `💰 Monastery Costs: Entry ${knowledgeBase.monasteries.rumtek.entry} for most monasteries. Camera fee: ₹10-20 at some places. Donations welcome but not mandatory. Guide services: ₹200-500. Transport: Shared taxi ₹50-200, private taxi ₹2000-4000/day. Budget ₹500-1000/day for monastery visits.`;
            }
            if (/rumtek/i.test(question)) {
                const info = knowledgeBase.monasteries.rumtek;
                return `🏛️ ${info.name}: ${info.school}, founded ${info.founded}. ${info.significance}. Location: ${info.distance} from Gangtok at ${info.altitude}. Features: ${info.features}, ${info.relics}. ${info.specialEvents}. Architecture: ${info.architecture}. Must-see for Buddhist culture enthusiasts.`;
            }
            return `🏛️ Sikkim Monasteries: 200+ monasteries across 4 Buddhist schools. Major ones: Rumtek (Kagyu, largest), Pemayangtse (Nyingma, 1705), Tashiding (most sacred), Dubdi (oldest, 1701). Each offers unique architecture, history, spiritual significance. Free entry, photography rules vary.`;
        }
        
        // Comprehensive food information
        if (/\b(food|cuisine|eat|dish|restaurant|hungry|meal|cooking)\b/i.test(question)) {
            if (/price|cost|budget|expensive|cheap/i.test(question)) {
                return `🍽️ Sikkim Food Prices: Street food ₹20-100, Local restaurants ₹150-400, Hotels ₹500-1500. Popular items: ${knowledgeBase.food.momos}, ${knowledgeBase.food.thukpa}, ${knowledgeBase.food.gundruk}. Organic premium: 20-30% higher prices. Best value: Local eateries, homestays.`;
            }
            if (/vegetarian|vegan|diet|healthy/i.test(question)) {
                return `🥬 Vegetarian Food: Excellent options available! ${knowledgeBase.food['dal bhat']}, vegetable momos, thukpa, ${knowledgeBase.food.gundruk}. All organic produce since 2016. Buddhist influence means many vegetarian dishes. Homestays offer authentic vegetarian meals.`;
            }
            if (/restaurant|where.*eat|best.*place/i.test(question)) {
                return `🏪 Best Food Places: Gangtok - MG Marg (tourist-friendly), Lal Market (local authentic), Deorali Market. Pelling - Hotel restaurants, local dhabas. Homestays offer authentic home-cooked meals. Avoid street food during monsoon. Try: ${knowledgeBase.shopping.markets}.`;
            }
            return `🍜 Sikkim Cuisine: Tibetan-Nepali-Bhutia fusion using organic ingredients. Staples: Rice, dal, vegetables. Must-try: ${Object.keys(knowledgeBase.food).slice(0, 5).join(', ')}. All food organic (state policy). Unique fermented foods aid digestion at high altitude.`;
        }
        
        // Detailed trekking information
        if (/\b(trek|trekking|hiking|mountain|adventure|climb|goecha|dzongri)\b/i.test(question)) {
            if (/cost|price|budget|expensive/i.test(question)) {
                return `💰 Trekking Costs: ${knowledgeBase.treks['goecha la'].cost}, Dzongri ₹15,000-22,000, Singalila ₹18,000-25,000. Includes: Guide, permits, accommodation, meals. Extra: Personal gear (₹5000-15000), tips (₹2000-5000), emergency evacuation insurance (₹500-1000).`;
            }
            if (/permit|permission|document|registration/i.test(question)) {
                return `📋 Trek Permits: Required for all major treks. Cost: ₹100-200. Process: Through registered tour operators only. Documents: ID proof, medical certificate (high altitude), passport photos. Advance booking: 15-30 days recommended. Solo trekking not allowed.`;
            }
            if (/difficulty|fitness|preparation|training/i.test(question)) {
                return `💪 Trek Difficulty: Easy (Dzongri - basic fitness), Moderate (${knowledgeBase.treks['goecha la'].difficulty} - ${knowledgeBase.treks['goecha la'].fitness}), Extreme (Green Lake - excellent fitness). Preparation: Cardio training 2-3 months, practice with backpack, altitude acclimatization essential.`;
            }
            return `🥾 Sikkim Trekking: World-class Himalayan routes. Popular: ${knowledgeBase.treks['goecha la'].highlights}, ${knowledgeBase.treks['goecha la'].bestTime}. All require permits, certified guides mandatory. Book through registered operators. Difficulty levels from beginner to expert.`;
        }
        
        // Transportation details
        if (/\b(transport|travel|reach|airport|train|bus|taxi|helicopter)\b/i.test(question)) {
            if (/cost|price|fare|expensive/i.test(question)) {
                return `🚗 Transport Costs: ${knowledgeBase.transportation.taxi}, ${knowledgeBase.transportation.helicopter}, ${knowledgeBase.transportation.local}. Bus: Siliguri-Gangtok ₹150-250. Flight: Delhi-Bagdogra ₹4000-12000. Budget ₹3000-5000 for transport to Sikkim.`;
            }
            if (/airport|flight|fly/i.test(question)) {
                return `✈️ Air Travel: ${knowledgeBase.transportation.airport}. Alternative: Bagdogra Airport (West Bengal) - 124 km from Gangtok, better connectivity. Airlines: IndiGo, SpiceJet, Air India. Advance booking recommended. ${knowledgeBase.transportation.helicopter} for premium travel.`;
            }
            return `🚌 Transportation: ${knowledgeBase.transportation.road}. ${knowledgeBase.transportation.railway}. ${knowledgeBase.transportation.permits}. Journey time: Siliguri 4-5 hours, NJP 4 hours, Bagdogra 3.5 hours to Gangtok.`;
        }
        
        return null;
    }
    
    function getComprehensiveResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Science questions
        if (/how does|why does|what causes|explain/i.test(question)) {
            if (/gravity/i.test(question)) return `🌍 Gravity is the force that attracts objects toward each other. Earth's gravity pulls objects toward its center at 9.8 m/s². It's what keeps us on the ground and planets in orbit.`;
            if (/photosynthesis/i.test(question)) return `🌱 Photosynthesis is how plants make food using sunlight, water, and CO2. The equation: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. It produces oxygen we breathe!`;
            if (/internet/i.test(question)) return `🌐 The internet is a global network of interconnected computers using TCP/IP protocols. Data travels through fiber optic cables, routers, and servers worldwide.`;
        }
        
        // Technology questions
        if (/artificial intelligence|AI|machine learning/i.test(question)) {
            return `🤖 AI is computer systems that can perform tasks typically requiring human intelligence. Machine learning uses algorithms to learn from data. Applications include image recognition, language processing, and autonomous vehicles.`;
        }
        
        // History questions
        if (/world war|napoleon|ancient|civilization/i.test(question)) {
            if (/world war 2|ww2/i.test(question)) return `⚔️ World War II (1939-1945) was the largest conflict in history. Key events: Pearl Harbor (1941), D-Day (1944), Holocaust, atomic bombs on Japan. Allied victory reshaped the world order.`;
            if (/ancient egypt/i.test(question)) return `🏺 Ancient Egypt (3100-30 BCE) was known for pyramids, pharaohs, hieroglyphics, and mummification. The Nile River was central to their civilization. Famous rulers include Cleopatra and Tutankhamun.`;
        }
        
        // Health questions
        if (/health|exercise|nutrition|diet/i.test(question)) {
            return `🏥 For health advice, consult medical professionals. Generally: balanced diet, regular exercise, adequate sleep, and stress management are important for wellbeing.`;
        }
        
        // Space questions
        if (/space|universe|planet|star|galaxy/i.test(question)) {
            if (/black hole/i.test(question)) return `🕳️ Black holes are regions where gravity is so strong that nothing, not even light, can escape. They form when massive stars collapse. The event horizon is the point of no return.`;
            if (/solar system/i.test(question)) return `☀️ Our solar system has 8 planets orbiting the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. It's located in the Milky Way galaxy.`;
        }
        
        // General knowledge fallback
        return `I can help with questions about science, technology, history, current events, and many other topics. Could you be more specific about what you'd like to know?`;
    }
    
    // Conversational AI with context
    function getConversationalResponse(question, intent, context) {
        const lastQuery = enhancedKnowledgeBase.conversationContext.get('lastQuery');
        const lastIntent = enhancedKnowledgeBase.conversationContext.get('lastIntent');
        
        // Follow-up questions
        if (/more|tell me more|details|elaborate/i.test(question) && lastQuery) {
            return getDetailedResponse(lastQuery, lastIntent);
        }
        
        // Context-aware responses
        if (context === 'monastery' && /how to reach|distance|location/i.test(question)) {
            return '🚗 Most monasteries accessible by taxi from Gangtok. Shared taxis ₹50-200, private ₹2000-4000/day. Book through hotels or local operators.';
        }
        
        return null;
    }
    
    function getDetailedResponse(query, intent) {
        if (/monastery/i.test(query)) {
            return '🏛️ Sikkim has 200+ monasteries across 4 Buddhist schools. Major ones: Rumtek (Kagyu), Pemayangtse (Nyingma), Tashiding (most sacred), Dubdi (oldest). Each offers unique architecture, history, and spiritual significance. Best visited early morning for prayers and peaceful atmosphere.';
        }
        
        if (/food/i.test(query)) {
            return '🍽️ Sikkim cuisine blends Tibetan, Nepali, and Bhutia flavors. Staples: rice, dal, vegetables (all organic!). Must-try: Momos, thukpa, gundruk, chhurpi, sel roti. Drinks: butter tea, chang. Street food ₹20-100, restaurants ₹150-400.';
        }
        
        return 'I can provide more specific information if you ask about particular aspects!';
    }
    
    // Advanced intent analysis
    function analyzeAdvancedIntent(question) {
        for (const [intent, pattern] of Object.entries(enhancedKnowledgeBase.intentPatterns)) {
            if (pattern.test(question)) return intent;
        }
        return 'general';
    }
    
    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    function getFallbackResponse(question, intent, context) {
        
        // Smart fallback responses
        const fallbackResponses = {
            monastery: 'I can tell you about Rumtek, Pemayangtse, Tashiding, or Dubdi monasteries. Which interests you?',
            food: 'I can recommend momos, thukpa, gundruk, or other Sikkim specialties. What would you like to know?',
            trek: 'Popular treks: Goecha La, Dzongri, Singalila Ridge. Which one interests you?',
            transport: 'Transport options: Taxi, bus, shared vehicles. Where do you want to go?',
            general: 'I can help with Sikkim monasteries, food, trekking, weather, or travel planning. What interests you most?'
        };
        
        return fallbackResponses[context] || fallbackResponses.general;
        
        // Ultra-detailed Sikkim queries with precise information
        if (/\b(sikkim|capital|gangtok|state|india)\b/i.test(question)) {
            if (/capital/i.test(question)) {
                return `${knowledgeBase.sikkim.capital} is Sikkim's capital, located at 1,650m altitude. Population: ~100,000. Key areas: MG Marg (pedestrian zone), Lal Bazaar, Ridge Park. Best viewpoints: Ganesh Tok, Hanuman Tok, Tashi Viewpoint for Kanchenjunga views.`;
            }
            if (/population|people|demographic/i.test(question)) {
                return `Sikkim population: ${knowledgeBase.sikkim.population}, making it India's least populous state. Literacy: ${knowledgeBase.sikkim.literacy}. Ethnic groups: Nepali (70%), Lepcha (indigenous 13%), Bhutia (16%), Others (1%). Very peaceful, low crime rate.`;
            }
            if (/language|speak|communication/i.test(question)) {
                return `Languages in Sikkim: ${knowledgeBase.sikkim.languages.slice(0, 6).join(', ')}, plus ${knowledgeBase.sikkim.languages.slice(6).join(', ')}. Most locals speak Nepali and Hindi. English widely understood in tourist areas.`;
            }
            if (/weather|climate|temperature|season/i.test(question)) {
                const currentMonth = new Date().getMonth();
                const currentSeason = currentMonth >= 2 && currentMonth <= 5 ? 'Spring (perfect weather!)' : 
                                   currentMonth >= 6 && currentMonth <= 8 ? 'Monsoon (heavy rains)' : 
                                   currentMonth >= 9 && currentMonth <= 11 ? 'Post-monsoon (clear skies)' : 'Winter (cold but clear)';
                return `Sikkim climate: ${knowledgeBase.sikkim.climate}. Currently ${currentSeason}. Best months: ${knowledgeBase.sikkim.bestTime}. Monsoon (July-Sept): Heavy rainfall, landslides possible. Pack layers - temperature varies greatly with altitude.`;
            }
            if (/area|size|geography/i.test(question)) {
                return `Sikkim area: ${knowledgeBase.sikkim.area}. Districts: ${knowledgeBase.sikkim.districts.join(', ')}. Altitude range: ${knowledgeBase.sikkim.altitude}. Terrain: 28% cultivated, 36% forest, 36% snow/barren land.`;
            }
            if (/border|location|neighbor/i.test(question)) {
                return `Sikkim borders: ${knowledgeBase.sikkim.borders.join(', ')}. Strategic location: Nathu La pass connects to Tibet. Only 88km wide, 114km long. Gateway to Northeast India and important for India-China trade.`;
            }
            if (/religion|faith|spiritual/i.test(question)) {
                return `Sikkim religions: ${knowledgeBase.sikkim.religion}. Famous for religious harmony - Hindu temples and Buddhist monasteries coexist peacefully. Major festivals: Dashain, Tihar, Losar, Buddha Jayanti.`;
            }
            if (/organic|agriculture|farming/i.test(question)) {
                return `Sikkim is ${knowledgeBase.sikkim.organicState}! 100% organic farming since 2016. Grows: cardamom (largest producer), ginger, turmeric, oranges, tea. Banned chemical fertilizers and pesticides completely.`;
            }
            if (/biodiversity|nature|wildlife|plants/i.test(question)) {
                return `Sikkim biodiversity: ${knowledgeBase.sikkim.biodiversity}. 5 climatic zones from tropical to alpine. Wildlife: Red panda (state animal), snow leopard, Himalayan black bear, 550+ bird species. 35% area under protected forests.`;
            }
            return `Sikkim: India's ${knowledgeBase.sikkim.statehood}. Unique features: ${knowledgeBase.sikkim.organicState}, cleanest state, highest per capita income in Northeast. Famous for: monasteries, trekking, Kanchenjunga views, peaceful culture.`;
        }
        
        // Ultra-detailed monastery information with practical details
        if (/\b(monastery|monasteries|rumtek|pemayangtse|tashiding|dubdi|buddhist|temple|gompa)\b/i.test(question)) {
            if (/rumtek/i.test(question)) {
                const info = knowledgeBase.monasteries.rumtek;
                return `${info.name}: ${info.school}, founded ${info.founded}. Location: ${info.distance} from Gangtok at ${info.altitude}. Timings: 6 AM-6 PM, free entry. Highlights: Golden Stupa, prayer wheels, monastery museum, traditional architecture. Best time: Early morning prayers (6-8 AM). Photography allowed in courtyard only.`;
            }
            if (/pemayangtse/i.test(question)) {
                const info = knowledgeBase.monasteries.pemayangtse;
                return `${info.name} ("Perfect Sublime Lotus"): ${info.school}, founded ${info.founded}. Location: ${info.distance} from Gangtok at ${info.altitude}. Famous for: ${info.features}, stunning Kanchenjunga views. Entry: Free, 6 AM-6 PM. Must-see: 7-tiered wooden sculpture of Guru Rinpoche's celestial palace.`;
            }
            if (/tashiding/i.test(question)) {
                const info = knowledgeBase.monasteries.tashiding;
                return `${info.name}: "Heart of Sikkim", ${info.school}, founded ${info.founded}. Location: ${info.altitude} on hilltop between Rathong-Rangeet rivers. Sacred belief: Mere sight cleanses sins. Famous for: ${info.features} (Feb/Mar), holy water ceremony. Trek: 30-min uphill walk from road.`;
            }
            if (/dubdi/i.test(question)) {
                const info = knowledgeBase.monasteries.dubdi;
                return `${info.name}: Sikkim's oldest monastery, ${info.school}, founded ${info.founded}. Location: ${info.distance} from Pelling at ${info.altitude}. Access: 45-min trek through forest from Yuksom. Historical significance: Built by Lhatsun Chempo, one of three lamas who crowned first Chogyal.`;
            }
            if (/timing|time|hours|open|close/i.test(question)) {
                return `Monastery timings: Generally 6 AM-6 PM daily. Best times: Morning prayers (6-8 AM), evening prayers (5-6 PM). Photography: Usually allowed in courtyards, restricted in prayer halls. Dress code: Modest clothing, remove shoes before entering main halls.`;
            }
            if (/entry|fee|cost|ticket/i.test(question)) {
                return `Monastery entry: Most are FREE! Some may charge ₹10-20 for camera/video. Donations welcome but not mandatory. Respect: Don't disturb prayers, maintain silence, follow photography rules. Guides available at major monasteries (₹200-500).`;
            }
            return `Sikkim has 200+ monasteries across 4 Buddhist schools: Nyingma (oldest), Kagyu, Sakya, Gelug. Major ones: Rumtek (largest, Kagyu), Pemayangtse (Nyingma, 1705), Tashiding (most sacred, Nyingma), Dubdi (oldest, 1701). Each offers unique architecture, history, and spiritual significance.`;
        }
        
        // Comprehensive food information with prices and locations
        if (/\b(food|cuisine|eat|dish|momos|thukpa|gundruk|chhurpi|restaurant|hungry|meal)\b/i.test(question)) {
            if (/momos/i.test(question)) {
                return `Momos (steamed dumplings): ₹50-80 for 6-8 pieces. Types: Veg, chicken, pork, cheese. Best places: MG Marg (Gangtok), Lal Market, local street vendors. Served with: Spicy tomato-sesame chutney. Must-try: Jhol momos (soup momos), fried momos.`;
            }
            if (/thukpa/i.test(question)) {
                return `Thukpa (Tibetan noodle soup): ₹60-120. Types: Veg, chicken, egg, mixed. Perfect for: Cold weather, altitude sickness recovery. Where: Every restaurant has it. Variations: Thenthuk (hand-pulled noodles), Gyathuk (pasta-like noodles).`;
            }
            if (/gundruk/i.test(question)) {
                return `Gundruk (fermented leafy greens): ₹40-80. Made from: Mustard, radish, cauliflower leaves. Benefits: Rich in vitamins, probiotics, aids digestion. Taste: Tangy, sour. Served: With rice, dal. Best: Homemade versions in local homes/guesthouses.`;
            }
            if (/chhurpi/i.test(question)) {
                return `Chhurpi (yak cheese): ₹200-500/kg. Types: Soft (fresh), hard (dried for months). Uses: Snack, curry ingredient, soup. Where to buy: Local markets, Lachung, Yumthang. Taste: Mild when soft, very hard and chewy when dried.`;
            }
            if (/price|cost|expensive|cheap|budget/i.test(question)) {
                return `Sikkim food prices: Street food ₹20-100, Local restaurants ₹150-400, Hotels ₹500-1500. Budget meals: Dal-bhat ₹80-120, Momos ₹50-80, Tea ₹10-20. Expensive: Yak meat ₹800-1200/kg, Organic vegetables premium priced.`;
            }
            if (/restaurant|where.*eat|best.*place/i.test(question)) {
                return `Best food places: Gangtok - MG Marg (tourist-friendly), Lal Market (local), Deorali Market (authentic). Pelling - Hotel restaurants. Local tip: Try homestays for authentic home-cooked meals. Avoid: Street food during monsoon.`;
            }
            const foodKeys = Object.keys(knowledgeBase.food);
            const matchedFood = foodKeys.find(food => lowerQuestion.includes(food));
            if (matchedFood) {
                return `${matchedFood.charAt(0).toUpperCase() + matchedFood.slice(1)}: ${knowledgeBase.food[matchedFood]}. Price range: ₹40-150 depending on location and preparation.`;
            }
            return `Sikkim cuisine: Tibetan-Nepali-Bhutia fusion. Staples: Rice, dal, vegetables. Must-try: Momos, thukpa, gundruk, sel roti, chhurpi, kinema, phagshapa. Drinks: Butter tea, chang (millet beer), local organic tea. All food is organic (state policy since 2016)!`;
        }
        
        // Comprehensive trekking information with costs and requirements
        if (/\b(trek|trekking|hiking|mountain|goecha|dzongri|adventure|climb)\b/i.test(question)) {
            if (/goecha.*la/i.test(question)) {
                const info = knowledgeBase.treks['goecha la'];
                return `Goecha La Trek: ${info.duration}, ${info.difficulty}, max altitude ${info.altitude}. Cost: ₹25,000-35,000 all-inclusive. Permits: Required (₹100). Best months: April-May, Sept-Nov. Highlights: ${info.highlights}. Fitness: Good required, prior trekking experience recommended.`;
            }
            if (/dzongri/i.test(question)) {
                const info = knowledgeBase.treks.dzongri;
                return `Dzongri Trek: ${info.duration}, ${info.difficulty}, max altitude ${info.altitude}. Cost: ₹15,000-22,000. Perfect for: ${info.highlights}. Requirements: Basic fitness, no prior experience needed. Best: Clear weather Oct-Dec, Mar-May.`;
            }
            if (/singalila/i.test(question)) {
                const info = knowledgeBase.treks['singalila ridge'];
                return `Singalila Ridge Trek: ${info.duration}, ${info.difficulty}, max altitude ${info.altitude}. Cost: ₹18,000-25,000. Unique: ${info.highlights}. Route: Manebhanjan to Sandakphu. Best: Oct-Dec for clear Everest views.`;
            }
            if (/green.*lake/i.test(question)) {
                const info = knowledgeBase.treks['green lake'];
                return `Green Lake Trek: ${info.duration}, ${info.difficulty}, max altitude ${info.altitude}. Cost: ₹45,000-60,000. Extreme: ${info.highlights}. Requirements: Excellent fitness, high-altitude experience, medical certificate mandatory.`;
            }
            if (/cost|price|budget|expensive/i.test(question)) {
                return `Trek costs: Dzongri ₹15,000-22,000, Goecha La ₹25,000-35,000, Singalila ₹18,000-25,000, Green Lake ₹45,000-60,000. Includes: Guide, permits, accommodation, meals. Extra: Personal gear, tips, emergency evacuation insurance.`;
            }
            if (/permit|permission|document/i.test(question)) {
                return `Trek permits: Required for all major treks. Cost: ₹100-200. Process: Through registered tour operators only. Documents needed: ID proof, medical certificate (for high altitude), passport photos. Advance booking: 15-30 days recommended.`;
            }
            if (/difficulty|fitness|preparation/i.test(question)) {
                return `Trek difficulty: Easy (Dzongri - basic fitness), Moderate (Goecha La - good fitness + experience), Challenging (Green Lake - excellent fitness + high-altitude experience). Preparation: Cardio training 2-3 months, practice hiking with backpack.`;
            }
            return `Sikkim trekking: World-class Himalayan routes. Popular: Goecha La (Kanchenjunga views), Dzongri (beginner-friendly), Singalila (Everest views), Green Lake (extreme). Season: Mar-May, Sept-Dec. All require permits, guides mandatory. Book through registered operators only.`;
        }
        
        // Detailed festival queries
        if (/\b(festival|celebration|losar|dashain|tihar|saga)\b/i.test(question)) {
            const festivalKeys = Object.keys(knowledgeBase.festivals);
            const matchedFestival = festivalKeys.find(festival => lowerQuestion.includes(festival));
            if (matchedFestival) {
                return `${matchedFestival.charAt(0).toUpperCase() + matchedFestival.slice(1)}: ${knowledgeBase.festivals[matchedFestival]}.`;
            }
            return 'Sikkim celebrates diverse festivals reflecting its multicultural heritage. Major ones include Losar (Tibetan New Year), Saga Dawa (Buddha festival), Dashain (Hindu festival), Tihar (festival of lights), and Bumchu (sacred water ceremony).';
        }
        
        // Permit and travel logistics
        if (/\b(permit|ilp|pap|entry|document|visa)\b/i.test(question)) {
            if (/indian|citizen/i.test(question)) {
                return `Indian citizens need an ${knowledgeBase.permits.indian} for certain restricted areas in North and East Sikkim. It's ${knowledgeBase.permits.cost} and valid for ${knowledgeBase.permits.duration}.`;
            }
            if (/foreign|international/i.test(question)) {
                return `Foreign nationals need ${knowledgeBase.permits.foreign}. These are ${knowledgeBase.permits.cost} and valid for ${knowledgeBase.permits.duration}. Apply through registered tour operators.`;
            }
            return 'Permits are required for certain areas in Sikkim. Indians need ILP for restricted areas, foreigners need PAP/RAP. Apply online or through tour operators.';
        }
        
        // Transportation queries
        if (/\b(transport|travel|reach|airport|train|bus|taxi)\b/i.test(question)) {
            if (/airport|fly/i.test(question)) {
                return `${knowledgeBase.transportation.airport} is Sikkim's only airport. Alternatively, fly to Bagdogra Airport in West Bengal, then drive 4 hours to Gangtok.`;
            }
            if (/train|railway/i.test(question)) {
                return `${knowledgeBase.transportation.railway} is the nearest major railway station, 148 km from Gangtok. From there, take a taxi or bus.`;
            }
            if (/road|drive/i.test(question)) {
                return `Sikkim is ${knowledgeBase.transportation.road}. The journey from Siliguri to Gangtok takes about 4 hours through scenic mountain roads.`;
            }
            return `Transportation options: ${knowledgeBase.transportation.airport}, ${knowledgeBase.transportation.railway} for trains, and ${knowledgeBase.transportation.road}. ${knowledgeBase.transportation.local} for local transport.`;
        }
        
        // Greetings
        if (/\b(hello|hi|hey|greetings|namaste)\b/i.test(question)) {
            return 'Hello! I\'m your comprehensive Sikkim tourism assistant. I can provide detailed information about monasteries, food, trekking, festivals, permits, transportation, weather, and travel planning. What would you like to explore?';
        }
        
        // Thanks
        if (/\b(thank|thanks|appreciate|grateful)\b/i.test(question)) {
            return 'You\'re very welcome! I\'m delighted to help you discover the wonders of Sikkim. Feel free to ask me anything else about this incredible Himalayan destination!';
        }
        
        // Goodbye
        if (/\b(bye|goodbye|see you|farewell)\b/i.test(question)) {
            return 'Goodbye! May your journey to Sikkim be filled with beautiful memories. Come back anytime you need detailed travel assistance!';
        }
        
        // Help
        if (/\b(help|assist|support|guide)\b/i.test(question)) {
            return 'I provide comprehensive Sikkim tourism information including: monasteries (history, locations, significance), food (traditional dishes, descriptions), trekking (routes, difficulty, duration), festivals (dates, significance), permits (requirements, process), transportation (options, distances), weather (best times, climate), and detailed travel planning. What specific information do you need?';
        }
        
        // Enhanced fallback with smart suggestions
        const keywords = extractKeywords(question);
        const suggestions = getSmartSuggestions(keywords, context);
        return `I understand you're asking about "${question}". ${getQuickAnswer(question, context)} Would you like to know about: ${suggestions.slice(0, 2).join(' or ')}? I can provide detailed information on any Sikkim topic!`;
    }
    
    function getSeasonInfo(month) {
        if (month >= 2 && month <= 5) return "Spring season in Sikkim - perfect weather for travel!";
        if (month >= 6 && month <= 8) return "Monsoon season - great for indoor activities and cultural experiences.";
        if (month >= 9 && month <= 11) return "Post-monsoon - ideal time for trekking and clear mountain views!";
        return "Winter season - excellent for monastery visits and cultural tours.";
    }
    
    function extractKeywords(text) {
        const keywords = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
        return keywords.filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'why'].includes(word));
    }
    
    function getSmartSuggestions(keywords, context) {
        const suggestions = {
            monastery: ['monastery timings', 'entry fees', 'photography rules', 'nearby accommodations'],
            food: ['restaurant recommendations', 'local specialties', 'vegetarian options', 'food prices'],
            trek: ['difficulty levels', 'best seasons', 'required permits', 'guide services'],
            transport: ['bus schedules', 'taxi fares', 'airport transfers', 'road conditions'],
            general: ['weather forecast', 'travel permits', 'accommodation booking', 'local festivals']
        };
        return suggestions[context] || suggestions.general;
    }
    
    function calculateResponseConfidence(question, keywords) {
        const knownTerms = ['monastery', 'food', 'trek', 'weather', 'permit', 'cost', 'time', 'location', 'sikkim', 'gangtok'];
        const matches = keywords.filter(word => knownTerms.some(term => word.includes(term) || term.includes(word)));
        return matches.length / Math.max(keywords.length, 1);
    }
    
    // Fast local response generator
    async function generateLocalResponse(question, intent, context) {
        const lowerQuestion = question.toLowerCase();
        
        // Quick pattern matching for instant responses
        if (/\b(time|clock)\b/i.test(question)) {
            return `Current time: ${new Date().toLocaleTimeString('en-US', { hour12: true })}. Perfect time to explore Sikkim!`;
        }
        
        if (/\b(weather|temperature)\b/i.test(question)) {
            const location = extractLocation(question);
            return `${location.charAt(0).toUpperCase() + location.slice(1)} weather: Check current conditions. Best months: March-June, September-December.`;
        }
        
        // Fast monastery info
        if (/rumtek/i.test(question)) {
            return 'Rumtek Monastery: 24km from Gangtok, open 6 AM-6 PM. Largest monastery in Sikkim, seat of Karmapa.';
        }
        
        if (/pemayangtse/i.test(question)) {
            return 'Pemayangtse Monastery: 110km from Gangtok, founded 1705. "Perfect Sublime Lotus" - stunning Kanchenjunga views.';
        }
        
        // Fast food info
        if (/momos/i.test(question)) {
            return 'Momos: ₹50-80, available everywhere. Best at MG Marg, Lal Market. Steamed dumplings with spicy chutney.';
        }
        
        if (/thukpa/i.test(question)) {
            return 'Thukpa: ₹60-120, Tibetan noodle soup. Perfect for cold weather. Available at most restaurants.';
        }
        
        // Fast trek info
        if (/goecha.*la/i.test(question)) {
            return 'Goecha La Trek: 11 days, challenging, 4940m altitude. ₹25000 approx. Best: April-May, Sept-Nov.';
        }
        
        if (/dzongri/i.test(question)) {
            return 'Dzongri Trek: 5-6 days, moderate difficulty, 4020m. ₹15000 approx. Great for beginners.';
        }
        
        return null;
    }
    
    function getQuickAnswer(question, context) {
        const quickAnswers = {
            monastery: 'Most monasteries open 6 AM-6 PM, free entry.',
            food: 'Street food ₹20-100, restaurants ₹150-400.',
            trek: 'Permits required, guides recommended.',
            transport: 'Taxis ₹2000-4000/day, buses ₹30-150.',
            general: 'Best time: March-June, Sept-Dec.'
        };
        return quickAnswers[context] || quickAnswers.general;
    }
    
    async function generateContextualResponse(question, keywords, context) {
        // Generate intelligent response based on context and keywords
        if (context === 'monastery' && keywords.some(k => ['timing', 'time', 'open', 'close'].includes(k))) {
            return 'Most monasteries in Sikkim are open from 6 AM to 6 PM. Morning prayers (6-8 AM) and evening prayers (5-6 PM) offer the most authentic experience. Photography is usually allowed in courtyards but restricted inside prayer halls.';
        }
        
        if (context === 'food' && keywords.some(k => ['price', 'cost', 'expensive', 'cheap'].includes(k))) {
            return 'Sikkim food prices: Street food ₹20-100, Local restaurants ₹150-400, Hotels ₹500-1500. Must-try budget options: Momos (₹50-80), Thukpa (₹60-120), Gundruk (₹40-80). Authentic places often offer better value than tourist spots.';
        }
        
        if (context === 'trek' && keywords.some(k => ['difficult', 'easy', 'level', 'fitness'].includes(k))) {
            return 'Sikkim trek difficulty levels: Easy (Dzongri - 5 days), Moderate (Goecha La - 11 days), Challenging (Green Lake - 15 days). Basic fitness required for all treks. Altitude acclimatization essential above 3000m.';
        }
        
        return 'I can provide detailed information about that. Could you be more specific about what aspect interests you most?';
    }
    
    // Advanced query analysis functions
    function analyzeQueryIntent(query) {
        const intents = {
            weather: /weather|temperature|climate|rain|snow|forecast/i,
            location: /where|location|address|distance|how far|directions/i,
            time: /when|time|schedule|hours|open|close|timing/i,
            cost: /cost|price|fee|expensive|cheap|budget|money/i,
            booking: /book|reserve|ticket|availability|contact/i,
            comparison: /best|better|compare|versus|vs|difference/i,
            recommendation: /recommend|suggest|should|advice|opinion/i,
            factual: /what|who|which|how many|history|founded/i
        };
        
        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(query)) return intent;
        }
        return 'general';
    }
    
    function extractQueryContext(query) {
        const contexts = {
            monastery: /monastery|temple|gompa|buddhist|prayer|meditation/i,
            food: /food|eat|restaurant|cuisine|dish|meal|hungry/i,
            trek: /trek|hike|mountain|adventure|climb|trail/i,
            transport: /transport|travel|bus|taxi|flight|train|reach/i,
            accommodation: /hotel|stay|lodge|guesthouse|accommodation/i,
            permit: /permit|permission|document|visa|entry/i,
            festival: /festival|celebration|event|culture|tradition/i
        };
        
        for (const [context, pattern] of Object.entries(contexts)) {
            if (pattern.test(query)) return context;
        }
        return 'general';
    }
    
    // Ultra-fast real-time search with multiple APIs
    async function searchRealTimeInfo(query, intent, context) {
        const searchAPIs = [
            // Fast Wikipedia API
            async () => {
                const searchTerm = buildSmartSearchTerm(query, context);
                const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.extract && data.extract.length > 30) {
                        return `${data.extract.substring(0, 150)}... (Wikipedia)`;
                    }
                }
                return null;
            },
            
            // Real-time weather API
            async () => {
                if (/weather|temperature|rain|climate/i.test(query)) {
                    const location = extractLocation(query);
                    const coords = getLocationCoords(location);
                    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`);
                    if (response.ok) {
                        const data = await response.json();
                        const temp = Math.round(data.current_weather.temperature);
                        return `Current weather in ${location}: ${temp}°C. ${temp > 20 ? 'Perfect for sightseeing!' : 'Cool weather, dress warmly.'} (Live data)`;
                    }
                }
                return null;
            },
            
            // Fast travel info API
            async () => {
                if (intent === 'cost') {
                    if (context === 'food') return `Sikkim food: Street ₹20-100, Restaurants ₹150-400. Momos ₹50, Thukpa ₹80.`;
                    if (context === 'trek') return `Trek costs: Guide ₹2000/day, Permits ₹100. Goecha La: ₹25000 total.`;
                    if (context === 'transport') return `Taxi ₹2000-4000/day, Bus ₹30-150, Helicopter ₹5000-15000.`;
                }
                if (intent === 'time' && context === 'monastery') {
                    return `Monasteries: 6 AM - 6 PM. Best time: Morning prayers 6-8 AM.`;
                }
                return null;
            },
            
            // DuckDuckGo Instant Answer API
            async () => {
                const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query + ' Sikkim')}&format=json&no_html=1&skip_disambig=1`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.AbstractText && data.AbstractText.length > 30) {
                        return `${data.AbstractText.substring(0, 120)}... (DuckDuckGo)`;
                    }
                }
                return null;
            }
        ];
        
        // Ultra-fast parallel execution with 1.5s timeout
        const results = await Promise.allSettled(
            searchAPIs.map(api => 
                Promise.race([
                    api(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
                ])
            )
        );
        
        // Return first successful result
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                return result.value;
            }
        }
        
        return null;
    }
    
    function buildSmartSearchTerm(query, context) {
        const baseQuery = query.replace(/\b(what|where|when|how|is|are|the)\b/gi, '').trim();
        const contextMap = {
            monastery: 'monastery Sikkim Buddhism Tibet',
            food: 'cuisine food Sikkim Nepal Tibet',
            trek: 'trekking hiking Sikkim Himalaya',
            transport: 'transport travel Sikkim India',
            general: 'Sikkim India tourism'
        };
        return `${baseQuery} ${contextMap[context] || contextMap.general}`;
    }
    
    function formatWikipediaResponse(extract, context) {
        const summary = extract.substring(0, 200) + (extract.length > 200 ? '...' : '');
        const contextNote = {
            monastery: 'For visiting hours and permits, check with local authorities.',
            food: 'Try local restaurants in Gangtok and Pelling for authentic taste.',
            trek: 'Always hire certified guides and check weather conditions.',
            general: 'Plan your visit during March-June or September-December.'
        };
        return `${summary} ${contextNote[context] || contextNote.general} (Source: Wikipedia)`;
    }
    
    function extractLocation(query) {
        const locations = ['gangtok', 'pelling', 'lachung', 'namchi', 'yuksom', 'ravangla', 'mangan'];
        const found = locations.find(loc => query.toLowerCase().includes(loc));
        return found || 'gangtok';
    }
    
    function getLocationCoords(location) {
        const coords = {
            gangtok: { lat: 27.3389, lon: 88.6065 },
            pelling: { lat: 27.2152, lon: 88.2026 },
            lachung: { lat: 27.6816, lon: 88.7416 },
            namchi: { lat: 27.1663, lon: 88.3639 },
            yuksom: { lat: 27.3629, lon: 88.2225 }
        };
        return coords[location] || coords.gangtok;
    }
    
    function formatWeatherResponse(data, location, context) {
        const current = data.current_weather;
        const today = data.daily;
        const temp = Math.round(current.temperature);
        const maxTemp = Math.round(today.temperature_2m_max[0]);
        const minTemp = Math.round(today.temperature_2m_min[0]);
        const rain = today.precipitation_sum[0];
        
        const activity = {
            monastery: 'monastery visits',
            food: 'trying local cuisine',
            trek: 'trekking adventures',
            general: 'sightseeing'
        }[context] || 'exploring';
        
        const condition = rain > 5 ? 'rainy' : temp > 20 ? 'pleasant' : temp > 10 ? 'cool' : 'cold';
        const recommendation = condition === 'pleasant' ? `Perfect for ${activity}!` : 
                              condition === 'rainy' ? 'Good for indoor activities and cultural sites.' :
                              condition === 'cool' ? `Great for ${activity} with warm clothes.` :
                              'Bundle up for outdoor activities.';
        
        return `Weather in ${location.charAt(0).toUpperCase() + location.slice(1)}: ${temp}°C (${minTemp}-${maxTemp}°C today), ${rain}mm rain expected. ${recommendation} (Live data)`;
    }
    
    function getSeasonalWeatherInfo(location, context) {
        const month = new Date().getMonth();
        const season = month >= 2 && month <= 5 ? 'Spring' :
                      month >= 6 && month <= 8 ? 'Monsoon' :
                      month >= 9 && month <= 11 ? 'Post-monsoon' : 'Winter';
        
        const temps = {
            Spring: '15-25°C, clear skies',
            Monsoon: '18-22°C, heavy rainfall',
            'Post-monsoon': '10-20°C, clear mountain views',
            Winter: '5-15°C, dry and sunny'
        };
        
        return `${season} weather in ${location}: ${temps[season]}. ${getSeasonAdvice(season, context)}`;
    }
    
    function getSeasonAdvice(season, context) {
        const advice = {
            Spring: 'Perfect time for all activities!',
            Monsoon: 'Great for monastery visits and cultural experiences.',
            'Post-monsoon': 'Ideal for trekking and photography.',
            Winter: 'Excellent for monastery tours and local cuisine.'
        };
        return advice[season];
    }
    
    async function getLocationInfo(query, context) {
        // Extract location from query and provide detailed info
        const location = extractLocation(query);
        const locationData = {
            gangtok: 'Capital city, 1650m altitude, main hub for permits and transport',
            pelling: 'West Sikkim, 2150m altitude, gateway to Kanchenjunga views',
            lachung: 'North Sikkim, 2750m altitude, base for Yumthang Valley',
            namchi: 'South Sikkim, 1675m altitude, known for Char Dham and Samdruptse'
        };
        
        return `${location.charAt(0).toUpperCase() + location.slice(1)}: ${locationData[location] || 'Beautiful destination in Sikkim'}. ${getLocationTips(location, context)}`;
    }
    
    function getLocationTips(location, context) {
        if (context === 'monastery') return `Visit early morning for peaceful experience and better photography.`;
        if (context === 'food') return `Try local eateries near the main market for authentic flavors.`;
        if (context === 'trek') return `Acclimatize properly and hire local guides for safety.`;
        return `Best visited during clear weather for stunning mountain views.`;
    }
    
    function getTransportCosts(query) {
        return 'Sikkim transport costs: Shared taxi ₹50-200, Private taxi ₹2000-4000/day, Bus ₹30-150. Helicopter services available for premium travel (₹5000-15000). Book through registered operators for safety.';
    }
    
    async function processUserQuestion(question) {
        if (!question || !question.trim()) {
            console.log('Empty question received');
            return;
        }
        
        const cleanQuestion = question.trim();
        console.log('Processing question:', cleanQuestion);
        
        // Show immediate processing indicator
        assistantResponse.textContent = '🤔 Thinking...';
        
        try {
            const startTime = Date.now();
            
            // Generate AI response
            const response = await generateAIResponse(cleanQuestion);
            const processingTime = Date.now() - startTime;
            
            console.log('Generated response:', response);
            console.log('Processing time:', processingTime + 'ms');
            
            // Display response
            if (response && response.trim()) {
                assistantResponse.textContent = response;
                
                // Auto-speak response like Alexa (immediate)
                speakResponseFast(response);
                
                // Store interaction
                storeInteraction(cleanQuestion, response, processingTime);
                
                // Show performance indicator
                if (processingTime < 500) {
                    showSpeedIndicator('🚀 Quick response!');
                }
            } else {
                throw new Error('Empty response generated');
            }
            
        } catch (error) {
            console.error('AI processing error:', error);
            const errorMsg = 'I can help you with information about Sikkim monasteries, food, trekking, and travel planning. What would you like to know?';
            assistantResponse.textContent = errorMsg;
            
            // Auto-speak error message
            speakResponseFast(errorMsg);
        }
    }
    
    function showSpeedIndicator(message) {
        const indicator = document.createElement('div');
        indicator.textContent = message;
        indicator.style.cssText = `
            position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
            background: #10b981; color: white; padding: 5px 15px;
            border-radius: 15px; font-size: 12px; z-index: 10001;
            animation: fadeInOut 2s ease;
        `;
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
    }
    
    function getProcessingMessage(question) {
        if (/weather|temperature/i.test(question)) return 'Checking current weather conditions...';
        if (/monastery|temple/i.test(question)) return 'Accessing monastery information...';
        if (/food|restaurant/i.test(question)) return 'Finding culinary recommendations...';
        if (/trek|hiking/i.test(question)) return 'Gathering trekking details...';
        if (/cost|price|budget/i.test(question)) return 'Calculating travel costs...';
        if (/time|schedule/i.test(question)) return 'Checking schedules and timings...';
        return 'Analyzing your question...';
    }
    
    function storeInteraction(question, response, processingTime) {
        const interactions = JSON.parse(localStorage.getItem('ai-interactions') || '[]');
        interactions.push({ 
            question: question.toLowerCase(), 
            response, 
            timestamp: Date.now(),
            processingTime,
            context: extractQueryContext(question),
            intent: analyzeAdvancedIntent(question),
            satisfaction: processingTime < 500 ? 'fast' : 'normal'
        });
        
        // Keep last 100 for better learning
        if (interactions.length > 100) interactions.shift();
        localStorage.setItem('ai-interactions', JSON.stringify(interactions));
        
        // Update AI performance metrics
        updatePerformanceMetrics(processingTime);
    }
    
    function updatePerformanceMetrics(processingTime) {
        const metrics = JSON.parse(localStorage.getItem('ai-metrics') || '{}');
        metrics.totalQueries = (metrics.totalQueries || 0) + 1;
        metrics.avgResponseTime = ((metrics.avgResponseTime || 0) * (metrics.totalQueries - 1) + processingTime) / metrics.totalQueries;
        metrics.fastResponses = (metrics.fastResponses || 0) + (processingTime < 500 ? 1 : 0);
        localStorage.setItem('ai-metrics', JSON.stringify(metrics));
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            const question = userInput.value.trim();
            if (question) {
                processUserQuestion(question);
                userInput.value = '';
            }
        });
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const question = userInput.value.trim();
                if (question) {
                    processUserQuestion(question);
                    userInput.value = '';
                }
            }
        });
    }
    
    if (listenButton && recognition) {
        listenButton.addEventListener('click', () => {
            if (isListening) {
                // Clear silence timer when manually stopping
                if (silenceTimer) {
                    clearTimeout(silenceTimer);
                    silenceTimer = null;
                }
                
                recognition.stop();
                isListening = false;
                listenButton.innerHTML = '<i class="fas fa-microphone"></i>';
                listenButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                listenButton.style.borderRadius = '50%';
                assistantResponse.textContent = 'Stopped listening.';
                finalTranscript = ''; // Reset transcript
            } else {
                try {
                    userInput.value = '';
                    finalTranscript = ''; // Reset transcript for new session
                    lastSpeechTime = null;
                    assistantResponse.textContent = 'Listening... Speak now!';
                    
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.maxAlternatives = 1;
                    
                    recognition.start();
                    isListening = true;
                    listenButton.innerHTML = '<i class="fas fa-stop"></i>';
                    listenButton.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                    listenButton.style.borderRadius = '15%';
                    
                } catch (error) {
                    console.log('Recognition start error:', error);
                    isListening = false;
                    const errorMsg = 'Voice recognition unavailable. Please type your question.';
                    assistantResponse.textContent = errorMsg;
                    speakResponse(errorMsg);
                }
            }
        });
    } else if (listenButton) {
        listenButton.addEventListener('click', () => {
            const errorMsg = 'Voice recognition not supported. Type your questions for fast AI responses.';
            assistantResponse.textContent = errorMsg;
            speakResponse(errorMsg);
        });
    }
    
    function speakResponseFast(text) {
        if (isMuted || !text || !text.trim()) {
            return;
        }
        
        // Cancel any ongoing speech
        if (synth.speaking) {
            synth.cancel();
        }
        
        // Wait for cancellation to complete
        setTimeout(() => {
            try {
                const utterance = new SpeechSynthesisUtterance(text.trim());
                
                // Alexa-like speech parameters
                utterance.rate = 0.9;  // Slightly slower for clarity
                utterance.pitch = 1.1; // Slightly higher pitch
                utterance.volume = 1.0; // Full volume
                utterance.lang = 'en-US';
                
                // Get available voices
                const voices = synth.getVoices();
                
                // Find best female voice (Alexa-like)
                let selectedVoice = voices.find(v => 
                    (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha')) && 
                    v.lang.startsWith('en')
                ) || voices.find(v => v.lang === 'en-US') || voices[0];
                
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
                
                // Auto-speak like Alexa with visual feedback
                utterance.onstart = () => {
                    console.log('🔊 AI speaking...');
                    showSpeakingIndicator(true);
                };
                
                utterance.onend = () => {
                    console.log('🔇 AI finished speaking');
                    showSpeakingIndicator(false);
                };
                
                utterance.onerror = (event) => {
                    console.error('Speech error:', event.error);
                };
                
                // Speak immediately
                synth.speak(utterance);
                
            } catch (error) {
                console.error('Speech failed:', error);
            }
        }, 50);
    }
    
    // Function to stop all speech - Enhanced
    function stopSpeech() {
        if (synth && synth.speaking) {
            synth.cancel();
            showSpeakingIndicator(false);
            console.log('🔇 Speech stopped');
        }
        // Also remove any speaking indicators
        const speakingIndicator = document.getElementById('speaking-indicator');
        if (speakingIndicator) {
            speakingIndicator.remove();
        }
    }
    
    // Make stopSpeech globally available
    window.stopSpeech = stopSpeech;
    
    // Visual indicator when AI is speaking
    function showSpeakingIndicator(speaking) {
        const existingIndicator = document.getElementById('speaking-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (speaking) {
            const indicator = document.createElement('div');
            indicator.id = 'speaking-indicator';
            indicator.innerHTML = '🔊 AI Speaking...';
            indicator.style.cssText = `
                position: fixed; bottom: 20px; right: 20px;
                background: linear-gradient(135deg, #06b6d4, #0891b2);
                color: white; padding: 10px 15px; border-radius: 25px;
                z-index: 10001; font-size: 12px; font-weight: 600;
                animation: pulse 1s infinite; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
            `;
            document.body.appendChild(indicator);
        }
    }
    
    // Legacy function for compatibility
    function speakResponse(text) {
        speakResponseFast(text);
    }
    
    if (muteButton) {
        muteButton.addEventListener('click', () => {
            isMuted = !isMuted;
            muteButton.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
            muteButton.style.background = isMuted ? 
                'linear-gradient(135deg, #ef4444, #dc2626)' : 
                'linear-gradient(135deg, #06b6d4, #0891b2)';
            
            if (isMuted) {
                stopSpeech(); // Stop any ongoing speech
                showMuteStatus(true);
            } else {
                showMuteStatus(false);
            }
        });
    }
    
    function showMuteStatus(muted) {
        const statusMsg = muted ? '🔇 Audio muted' : '🔊 Audio enabled';
        const indicator = document.createElement('div');
        indicator.textContent = statusMsg;
        indicator.style.cssText = `
            position: fixed; top: 10px; right: 10px; 
            background: ${muted ? '#ef4444' : '#10b981'}; color: white;
            padding: 8px 15px; border-radius: 20px; z-index: 10001;
            font-size: 12px; animation: fadeInOut 2s ease;
        `;
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
    }
}

function navigateWithAnimation(url) {
    window.location.href = url;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize travel document form
    const travelDocForm = document.getElementById('travel-doc-form');
    if (travelDocForm) {
        travelDocForm.addEventListener('submit', function(e) {
            e.preventDefault();
            document.querySelector('.doc-generate-btn').textContent = 'Generating...';
            setTimeout(() => {
                generateTravelDocPDF();
                document.querySelector('.doc-generate-btn').innerHTML = '<i class="fas fa-download"></i> Generate Travel Document';
            }, 500);
        });
    }
    
    // Load public gallery first
    loadPublicGallery();
    
    // Check for existing user session
    const stored = localStorage.getItem('sikkimUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        loadUserFiles();
        updateUserInterface();
    } else {
        // Show public gallery even for non-logged users
        displayUserGallery();
    }
    
    // Initialize file upload
    initFileUpload();
    
    // Language handling moved to end of DOMContentLoaded

    // Enhanced help button functionality
    if (helpButton && helpModal) {
        helpButton.addEventListener('click', () => {
            helpModal.style.display = 'flex';
            // Add smooth fade-in animation
            setTimeout(() => {
                helpModal.style.opacity = '1';
            }, 10);
            
            // Initialize AI help and speak welcome message
            initializeAIHelp();
            
            // Speak welcome message after modal opens
            setTimeout(() => {
                const welcomeMsg = 'Hello! I\'m your Sikkim tourism assistant. How can I help you today?';
                document.getElementById('assistant-response').textContent = welcomeMsg;
                speakResponse(welcomeMsg);
            }, 500);
        });

        // Close button functionality - Fixed to properly stop speech and listening
        const closeButton = document.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Close button clicked - stopping all audio bot activities');
                
                // Stop all audio bot activities immediately
                if (synth && synth.speaking) {
                    synth.cancel();
                    console.log('Speech synthesis stopped');
                }
                
                // Stop listening if active
                if (typeof isListening !== 'undefined' && isListening && typeof recognition !== 'undefined' && recognition) {
                    if (typeof silenceTimer !== 'undefined' && silenceTimer) {
                        clearTimeout(silenceTimer);
                        silenceTimer = null;
                    }
                    recognition.stop();
                    isListening = false;
                    if (typeof finalTranscript !== 'undefined') {
                        finalTranscript = '';
                    }
                    const listenButton = document.getElementById('listen-button');
                    if (listenButton) {
                        listenButton.innerHTML = '<i class="fas fa-microphone"></i>';
                        listenButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                        listenButton.style.borderRadius = '50%';
                    }
                    console.log('Voice recognition stopped');
                }
                
                // Remove speaking indicator
                const speakingIndicator = document.getElementById('speaking-indicator');
                if (speakingIndicator) {
                    speakingIndicator.remove();
                }
                
                // Close modal with animation
                helpModal.style.opacity = '0';
                setTimeout(() => {
                    helpModal.style.display = 'none';
                    console.log('Help modal closed');
                }, 300);
            });
        }

        // Click outside to close - Fixed to stop all activities
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                console.log('Clicked outside modal - stopping all audio bot activities');
                
                // Stop all audio bot activities
                if (synth && synth.speaking) {
                    synth.cancel();
                }
                
                // Stop listening if active
                if (typeof isListening !== 'undefined' && isListening && typeof recognition !== 'undefined' && recognition) {
                    if (typeof silenceTimer !== 'undefined' && silenceTimer) {
                        clearTimeout(silenceTimer);
                        silenceTimer = null;
                    }
                    recognition.stop();
                    isListening = false;
                    if (typeof finalTranscript !== 'undefined') {
                        finalTranscript = '';
                    }
                    const listenButton = document.getElementById('listen-button');
                    if (listenButton) {
                        listenButton.innerHTML = '<i class="fas fa-microphone"></i>';
                        listenButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                        listenButton.style.borderRadius = '50%';
                    }
                }
                
                // Remove speaking indicator
                const speakingIndicator = document.getElementById('speaking-indicator');
                if (speakingIndicator) {
                    speakingIndicator.remove();
                }
                
                helpModal.style.opacity = '0';
                setTimeout(() => {
                    helpModal.style.display = 'none';
                }, 300);
            }
        });
        
        // ESC key to close - Fixed to stop all activities
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && helpModal.style.display === 'flex') {
                console.log('ESC key pressed - stopping all audio bot activities');
                
                // Stop all audio bot activities
                if (synth && synth.speaking) {
                    synth.cancel();
                }
                
                // Stop listening if active
                if (typeof isListening !== 'undefined' && isListening && typeof recognition !== 'undefined' && recognition) {
                    if (typeof silenceTimer !== 'undefined' && silenceTimer) {
                        clearTimeout(silenceTimer);
                        silenceTimer = null;
                    }
                    recognition.stop();
                    isListening = false;
                    if (typeof finalTranscript !== 'undefined') {
                        finalTranscript = '';
                    }
                    const listenButton = document.getElementById('listen-button');
                    if (listenButton) {
                        listenButton.innerHTML = '<i class="fas fa-microphone"></i>';
                        listenButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                        listenButton.style.borderRadius = '50%';
                    }
                }
                
                // Remove speaking indicator
                const speakingIndicator = document.getElementById('speaking-indicator');
                if (speakingIndicator) {
                    speakingIndicator.remove();
                }
                
                helpModal.style.opacity = '0';
                setTimeout(() => {
                    helpModal.style.display = 'none';
                }, 300);
            }
        });
        
        // Initialize AI help system on page load
        initializeAIHelp();
    }

    const heroSlideshow = document.querySelector('.hero-slideshow');
    if (heroSlideshow) {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.dot');
        
        if (slides.length > 1) {
            slideIndex = 0;
            slides[0].classList.add('active');
            if (dots[0]) dots[0].classList.add('active');
            
            slideshowInterval = setInterval(showSlides, 2000);
            
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    clearInterval(slideshowInterval);
                    slideIndex = index + 1;
                    slides.forEach(slide => slide.classList.remove('active'));
                    dots.forEach(d => d.classList.remove('active'));
                    slides[index].classList.add('active');
                    dots[index].classList.add('active');
                    slideshowInterval = setInterval(showSlides, 2000);
                });
            });
        }
    }

    initScrollEffects();
    initDynamicTheming();
    initializeExploreButtons();
    // Don't auto-initialize camera translate - only when modal opens
    initializeTripPlanner();
    
    // Initialize language controls on ALL pages
    initFloatingControls();
    
    // Auto-translate based on saved language preference
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && savedLanguage !== 'en') {
        console.log(`Auto-translating page to ${savedLanguage}`);
        setTimeout(() => updateLanguage(savedLanguage), 500);
    }
    

});

// Global function to open monastery modal
window.openMonasteryModal = function(monasteryName) {
    const modal = document.getElementById('monastery-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const mainImage = document.getElementById('main-image');
    
    if (!modal) {
        console.error('Monastery modal not found');
        return;
    }
    
    const monasteryData = {
        'Rumtek Monastery': {
            image: 'Rumtek Monastery.jpeg',
            description: 'The monastery stands majestically at 1,550 meters above sea level, serving as the seat of the 16th Karmapa. Founded in 1966, Rumtek represents the perfect synthesis of Tibetan Buddhist architecture and spiritual significance. The monastery houses precious relics, including the Black Crown of the Karmapa, golden stupas, and ancient manuscripts.',
            founded: '1966',
            location: 'Rumtek, East Sikkim',
            altitude: '1,550 meters'
        },
        'Pemayangtse Monastery': {
            image: 'Pemayangtse Monastery West-Sikkim-INDIA.jpeg',
            description: 'Perched at 2,085 meters, Pemayangtse Monastery translates to "Perfect Sublime Lotus," symbolizing purity and enlightenment. Founded in 1705 by Lama Lhatsun Chempo, this three-story monastery represents the celestial abode of Guru Rinpoche.',
            founded: '1705',
            location: 'Pelling, West Sikkim',
            altitude: '2,085 meters'
        },
        'Dubdi Monastery': {
            image: 'Dubdi Monastery Yuksom Sikkim History & Architecture.jpeg',
            description: 'Standing as Sikkim\'s oldest monastery, Dubdi was established in 1701 by Lhatsun Chempo, one of the three revered lamas who crowned the first Chogyal of Sikkim. Located at 2,100 meters above Yuksom, the monastery\'s name means "the retreat" in Tibetan.',
            founded: '1701',
            location: 'Yuksom, West Sikkim',
            altitude: '2,100 meters'
        },
        'Tashiding Monastery': {
            image: 'Tashiding Monastery _ Best Places to Visit in Sikkim _ Sikkim Tourism.jpeg',
            description: 'Revered as the "Heart of Sikkim," Tashiding Monastery holds the distinction of being the most sacred pilgrimage site in the state. Founded in 1641 by Ngadak Sempa Chempo, the monastery sits majestically at 1,465 meters on a conical hill.',
            founded: '1641',
            location: 'Tashiding, West Sikkim',
            altitude: '1,465 meters'
        }
    };
    
    const data = monasteryData[monasteryName];
    if (!data) {
        console.error('No data found for:', monasteryName);
        return;
    }
    
    // Update modal content
    if (modalTitle) modalTitle.textContent = monasteryName;
    if (modalDescription) modalDescription.textContent = data.description;
    if (mainImage) mainImage.src = data.image;
    
    const foundedYear = document.getElementById('founded-year');
    const altitude = document.getElementById('altitude');
    const location = document.getElementById('location');
    
    if (foundedYear) foundedYear.textContent = data.founded;
    if (altitude) altitude.textContent = data.altitude;
    if (location) location.textContent = data.location;
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
};

function initializeExploreButtons() {
    const monasteryCards = document.querySelectorAll('.monastery-card-small');
    const modal = document.getElementById('monastery-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const mainImage = document.getElementById('main-image');
    const closeBtn = document.querySelector('.elegant-close-btn');

    const monasteryData = {
        'Rumtek Monastery': {
            image: 'Rumtek Monastery.jpeg',
            description: 'The monastery stands majestically at 1,550 meters above sea level, serving as the seat of the 16th Karmapa. Founded in 1966, Rumtek represents the perfect synthesis of Tibetan Buddhist architecture and spiritual significance. The monastery houses precious relics, including the Black Crown of the Karmapa, golden stupas, and ancient manuscripts. Its history traces back to the original Rumtek built in 1740, but the current structure was constructed under the guidance of the 16th Karmapa Rangjung Rigpe Dorje. The monastery serves as the main seat of the Karma Kagyu lineage outside Tibet, making it one of the most important Buddhist centers in the world.',
            founded: '1966',
            location: 'Rumtek, East Sikkim',
            altitude: '1,550 meters'
        },
        'Pemayangtse Monastery': {
            image: 'Pemayangtse Monastery West-Sikkim-INDIA.jpeg',
            description: 'Perched at 2,085 meters, Pemayangtse Monastery translates to "Perfect Sublime Lotus," symbolizing purity and enlightenment. Founded in 1705 by Lama Lhatsun Chempo, this three-story monastery represents the celestial abode of Guru Rinpoche. The monastery houses ancient Buddhist scriptures, thangkas, and sculptures, including the famous seven-tiered wooden sculpture depicting Guru Rinpoche\'s heavenly palace. Built exclusively for "ta-tshang" (pure monks), only the purest monks of the Nyingma order can reside here. The monastery offers panoramic views of the Kanchenjunga range and serves as the head monastery of the Nyingma order in Sikkim.',
            founded: '1705',
            location: 'Pelling, West Sikkim',
            altitude: '2,085 meters'
        },
        'Dubdi Monastery': {
            image: 'Dubdi Monastery Yuksom Sikkim History & Architecture.jpeg',
            description: 'Standing as Sikkim\'s oldest monastery, Dubdi was established in 1701 by Lhatsun Chempo, one of the three revered lamas who crowned the first Chogyal of Sikkim. Located at 2,100 meters above Yuksom, the monastery\'s name means "the retreat" in Tibetan. This sacred site witnessed the historic coronation of Phuntsog Namgyal as the first king of Sikkim in 1642. The monastery houses ancient murals, manuscripts, and religious artifacts that chronicle Sikkim\'s Buddhist heritage. Accessible through a scenic 45-minute trek through dense forests, Dubdi offers visitors a spiritual journey through time, connecting them to the very foundations of Sikkim\'s Buddhist kingdom.',
            founded: '1701',
            location: 'Yuksom, West Sikkim',
            altitude: '2,100 meters'
        },
        'Tashiding Monastery': {
            image: 'Tashiding Monastery _ Best Places to Visit in Sikkim _ Sikkim Tourism.jpeg',
            description: 'Revered as the "Heart of Sikkim," Tashiding Monastery holds the distinction of being the most sacred pilgrimage site in the state. Founded in 1641 by Ngadak Sempa Chempo, the monastery sits majestically at 1,465 meters on a conical hill between the Rathong and Rangeet rivers. Legend states that merely seeing this monastery cleanses one of all sins. The monastery is famous for the annual Bumchu festival, where sacred water is distributed to devotees. The name "Tashiding" means "the devoted central glory," reflecting its spiritual significance. The monastery houses precious relics and offers breathtaking views of the surrounding valleys, making it a perfect blend of natural beauty and spiritual sanctity.',
            founded: '1641',
            location: 'Tashiding, West Sikkim',
            altitude: '1,465 meters'
        }
    };

    monasteryCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const title = card.querySelector('h3').textContent.trim();
            const data = monasteryData[title];
            
            if (!data) {
                console.log('No data found for:', title);
                return;
            }
            
            // Use the redesigned modal
            modalTitle.textContent = title;
            modalDescription.textContent = data.description;
            mainImage.src = data.image;
            document.getElementById('founded-year').textContent = data.founded;
            document.getElementById('altitude').textContent = data.altitude;
            document.getElementById('location').textContent = data.location;
            
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
            document.body.style.overflow = 'hidden';
        });
    });
    
    window.showFullscreenMonastery = function(imageSrc, description, title) {
        console.log('showFullscreenMonastery called with:', { imageSrc, description, title });
        
        // Create fullscreen page like Paris design
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        // Create main container
        const container = document.createElement('div');
        container.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
        `;
        
        // Create card container
        const card = document.createElement('div');
        card.style.cssText = `
            width: 90%;
            max-width: 1200px;
            height: 80%;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            display: flex;
            position: relative;
        `;
        
        // Create image section
        const imageSection = document.createElement('div');
        imageSection.style.cssText = `
            width: 60%;
            height: 100%;
            position: relative;
            overflow: hidden;
        `;
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transform: scale(1.1);
            transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        // Create text section
        const textSection = document.createElement('div');
        textSection.style.cssText = `
            width: 40%;
            padding: 60px 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8));
        `;
        
        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            margin-bottom: 40px;
        `;
        
        const welcomeText = document.createElement('p');
        welcomeText.textContent = 'WELCOME TO';
        welcomeText.style.cssText = `
            font-size: 0.9rem;
            color: #667eea;
            font-weight: 600;
            letter-spacing: 2px;
            margin: 0 0 10px 0;
        `;
        
        const titleEl = document.createElement('h1');
        titleEl.textContent = title.toUpperCase();
        titleEl.style.cssText = `
            font-size: 3.5rem;
            font-weight: 300;
            color: #2d3748;
            margin: 0 0 30px 0;
            line-height: 1;
        `;
        
        // Create description
        const descEl = document.createElement('p');
        descEl.style.cssText = `
            font-size: 1rem;
            line-height: 1.8;
            color: #4a5568;
            margin-bottom: 40px;
        `;
        
        // Create read more button
        const readMoreBtn = document.createElement('button');
        readMoreBtn.textContent = 'Read more';
        readMoreBtn.style.cssText = `
            background: none;
            border: none;
            color: #667eea;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: underline;
            padding: 0;
            align-self: flex-start;
        `;
        
        // Create navigation dots
        const navigation = document.createElement('div');
        navigation.style.cssText = `
            position: absolute;
            bottom: 40px;
            left: 40px;
            display: flex;
            gap: 10px;
        `;
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `
                width: ${i === 0 ? '30px' : '10px'};
                height: 10px;
                background: ${i === 0 ? '#667eea' : 'rgba(102, 126, 234, 0.3)'};
                border-radius: 5px;
                transition: all 0.3s ease;
            `;
            navigation.appendChild(dot);
        }
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            color: #667eea;
            font-size: 2rem;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 10001;
        `;
        
        closeBtn.onclick = () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 500);
        };
        
        // Assemble elements
        header.appendChild(welcomeText);
        header.appendChild(titleEl);
        textSection.appendChild(header);
        textSection.appendChild(descEl);
        textSection.appendChild(readMoreBtn);
        
        imageSection.appendChild(img);
        card.appendChild(imageSection);
        card.appendChild(textSection);
        card.appendChild(navigation);
        
        container.appendChild(card);
        overlay.appendChild(container);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        
        // Start animations
        setTimeout(() => overlay.style.opacity = '1', 100);
        
        setTimeout(() => {
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 300);
        
        setTimeout(() => {
            const words = description.split(' ');
            descEl.innerHTML = words.map(word => `<span style="opacity: 0; transform: translateY(20px); display: inline-block; margin-right: 4px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">${word}</span>`).join('');
            
            const wordElements = descEl.querySelectorAll('span');
            wordElements.forEach((word, index) => {
                setTimeout(() => {
                    word.style.opacity = '1';
                    word.style.transform = 'translateY(0)';
                }, index * 50);
            });
        }, 800);
    };

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const targetPanel = document.getElementById(targetTab + '-panel');
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 400);
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 400);
            }
        });
    }
}

function initializeCameraTranslate() {
    const cameraBtn = document.getElementById('camera-translate-btn');
    const cameraModal = document.getElementById('camera-modal');
    const cameraCloseBtn = document.querySelector('.camera-close-btn');
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const switchBtn = document.getElementById('switch-camera-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const detectedText = document.getElementById('detected-text-content');
    const translatedText = document.getElementById('translated-text-content');
    const translationSpeaker = document.getElementById('translation-speaker');
    
    // Check if elements exist
    if (!cameraModal) {
        console.log('Camera modal not found');
        return;
    }

    let stream = null;
    let currentCamera = 'environment';

    const sikkimDictionary = {
        'hello': { hi: 'नमस्ते', ne: 'नमस्कार', es: 'Hola', fr: 'Bonjour', de: 'Hallo' },
        'नमस्कार': { en: 'Hello', hi: 'नमस्ते', es: 'Hola', fr: 'Bonjour', de: 'Hallo' },
        'धन्यवाद': { en: 'Thank you', hi: 'धन्यवाद', es: 'Gracias', fr: 'Merci', de: 'Danke' },
        'गुम्बा': { en: 'Monastery', hi: 'मठ', es: 'Monasterio', fr: 'Monastère', de: 'Kloster' },
        'मन्दिर': { en: 'Temple', hi: 'मंदिर', es: 'Templo', fr: 'Temple', de: 'Tempel' },
        'monastery': { hi: 'मठ', ne: 'गुम्बा', es: 'Monasterio', fr: 'Monastère', de: 'Kloster' },
        'temple': { hi: 'मंदिर', ne: 'मन्दिर', es: 'Templo', fr: 'Temple', de: 'Tempel' },
        'mountain': { hi: 'पहाड़', ne: 'पहाड', es: 'Montaña', fr: 'Montagne', de: 'Berg' },
        'water': { hi: 'पानी', ne: 'पानी', es: 'Agua', fr: 'Eau', de: 'Wasser' },
        'food': { hi: 'खाना', ne: 'खाना', es: 'Comida', fr: 'Nourriture', de: 'Essen' }
    };

    async function startCamera() {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not supported by browser');
            }
            
            console.log('Requesting camera access...');
            stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: currentCamera,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            if (video) {
                video.srcObject = stream;
                console.log('Camera started successfully');
                if (detectedText) {
                    detectedText.textContent = 'Camera ready! Point at text and capture.';
                }
            }
        } catch (error) {
            console.error('Camera error:', error);
            const errorMsg = error.name === 'NotAllowedError' ? 
                'Camera permission denied. Please allow camera access.' :
                error.name === 'NotFoundError' ?
                'No camera found on device.' :
                'Camera not available: ' + error.message;
            
            if (detectedText) {
                detectedText.textContent = errorMsg;
            }
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    async function translateCameraText(text, targetLang) {
        // Check local dictionary first
        const lowerText = text.toLowerCase();
        if (sikkimDictionary[lowerText] && sikkimDictionary[lowerText][targetLang]) {
            return sikkimDictionary[lowerText][targetLang];
        }
        
        // Check main translation dictionary
        if (translationDict[lowerText] && translationDict[lowerText][targetLang]) {
            return translationDict[lowerText][targetLang];
        }

        // Try LibreTranslate first
        try {
            const response = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: text,
                    source: 'auto',
                    target: targetLang,
                    format: 'text'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.translatedText) {
                    return data.translatedText;
                }
            }
        } catch (error) {
            console.log('LibreTranslate failed');
        }

        // Try Google Translate
        try {
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data[0] && data[0][0] && data[0][0][0]) {
                    return data[0][0][0];
                }
            }
        } catch (error) {
            console.log('Google Translate failed');
        }

        // Try MyMemory as backup
        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`);
            const data = await response.json();
            if (data.responseStatus === 200 && data.responseData.translatedText) {
                return data.responseData.translatedText;
            }
        } catch (error) {
            console.log('MyMemory failed');
        }

        return `${text} (translation service unavailable)`;
    }

    function setupTTS() {
        if (translationSpeaker) {
            translationSpeaker.onclick = () => {
                const textToSpeak = translatedText.textContent;
                const targetLang = document.getElementById('target-language').value;
                
                if (synth.speaking) {
                    synth.cancel();
                    translationSpeaker.classList.remove('fa-stop-circle');
                    translationSpeaker.classList.add('fa-volume-up');
                    return;
                }
                
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = languageVoiceMap[targetLang] || targetLang;
                
                const voices = synth.getVoices();
                const voice = voices.find(v => v.lang.startsWith(targetLang)) || voices.find(v => v.lang.startsWith('en'));
                if (voice) utterance.voice = voice;
                
                utterance.onend = () => {
                    translationSpeaker.classList.remove('fa-stop-circle');
                    translationSpeaker.classList.add('fa-volume-up');
                };
                
                synth.speak(utterance);
                translationSpeaker.classList.remove('fa-volume-up');
                translationSpeaker.classList.add('fa-stop-circle');
            };
        }
    }

    async function processImage(imageSource) {
        detectedText.textContent = 'AI scanning text...';
        translatedText.textContent = 'Processing...';
        
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Optimize canvas size for better OCR
            const maxSize = 1200;
            let { width, height } = imageSource;
            
            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width *= ratio;
                height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw with better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(imageSource, 0, 0, width, height);
            
            const ocrResult = await performOCR(canvas);
            
            if (ocrResult && ocrResult.length > 2) {
                detectedText.textContent = ocrResult;
                translatedText.textContent = 'AI translating...';
                
                const targetLang = document.getElementById('target-language').value;
                const translation = await aiTranslate(ocrResult, targetLang);
                
                translatedText.textContent = translation;
                setupTTS();
            } else {
                detectedText.textContent = 'No clear text detected';
                translatedText.textContent = 'Try better lighting, focus, or angle';
            }
        } catch (error) {
            console.error('OCR Error:', error);
            detectedText.textContent = 'Processing failed';
            translatedText.textContent = 'Please try again with clearer image';
        }
    }
    
    async function performOCR(canvas) {
        try {
            const imageData = canvas.toDataURL('image/jpeg', 0.9);
            
            // Use OCR.space API with proper key
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                headers: {
                    'apikey': 'K87899142388957'
                },
                body: (() => {
                    const formData = new FormData();
                    formData.append('base64Image', imageData);
                    formData.append('language', 'eng');
                    formData.append('isOverlayRequired', 'false');
                    formData.append('detectOrientation', 'true');
                    formData.append('scale', 'true');
                    formData.append('OCREngine', '2');
                    return formData;
                })()
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.ParsedResults && result.ParsedResults[0] && result.ParsedResults[0].ParsedText) {
                    return cleanOCRText(result.ParsedResults[0].ParsedText);
                }
            }
            
            // Fallback to Tesseract if available
            if (typeof Tesseract !== 'undefined') {
                const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
                    logger: m => console.log(m)
                });
                return cleanOCRText(text);
            }
        } catch (error) {
            console.log('OCR failed:', error);
        }
        
        return 'No text detected. Try better lighting or clearer text.';
    }
    
    function preprocessImage(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale and enhance contrast
        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            
            // Enhance contrast
            const enhanced = gray < 128 ? Math.max(0, gray - 30) : Math.min(255, gray + 30);
            
            data[i] = enhanced;     // Red
            data[i + 1] = enhanced; // Green
            data[i + 2] = enhanced; // Blue
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
    
    function cleanOCRText(text) {
        if (!text) return '';
        
        return text
            .replace(/[^\w\s.,!?:;\-()\[\]{}"'\/\n\r]/g, '') // Remove special chars
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
            .trim();
    }
    
    async function aiTranslate(text, targetLang) {
        if (!text || text.trim().length === 0) {
            return 'No text to translate';
        }
        
        // Clean and prepare text for complete translation
        const cleanText = text.trim().replace(/\s+/g, ' ');
        
        try {
            // Google Translate API - handles complete text
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data[0]) {
                    // Combine all translation segments for complete text
                    let completeTranslation = '';
                    for (let i = 0; i < data[0].length; i++) {
                        if (data[0][i] && data[0][i][0]) {
                            completeTranslation += data[0][i][0];
                        }
                    }
                    if (completeTranslation.trim()) {
                        return completeTranslation.trim();
                    }
                }
            }
        } catch (error) {
            console.log('Google Translate failed:', error);
        }
        
        try {
            // MyMemory API - fallback for complete text
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=auto|${targetLang}`);
            if (response.ok) {
                const data = await response.json();
                if (data.responseStatus === 200 && data.responseData.translatedText) {
                    return data.responseData.translatedText;
                }
            }
        } catch (error) {
            console.log('MyMemory failed:', error);
        }
        
        try {
            // LibreTranslate API - another fallback
            const response = await fetch('https://libretranslate.de/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: cleanText,
                    source: 'auto',
                    target: targetLang,
                    format: 'text'
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.translatedText) {
                    return data.translatedText;
                }
            }
        } catch (error) {
            console.log('LibreTranslate failed:', error);
        }
        
        return `Complete translation unavailable. Original text: ${cleanText}`;
    }

    // Auto-start camera when modal is opened
    if (video && detectedText && translatedText) {
        detectedText.textContent = 'Starting camera...';
        translatedText.textContent = 'Translation will appear here...';
        startCamera().catch(error => {
            console.error('Camera error:', error);
            if (detectedText) {
                detectedText.textContent = 'Camera not available. Use upload instead.';
            }
        });
    }

    async function initializeCamera() {
        try {
            const video = document.getElementById('camera-video');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            video.srcObject = stream;
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Camera access is required for this feature.');
        }
    }

    if (cameraCloseBtn) {
        cameraCloseBtn.addEventListener('click', () => {
            stopCamera();
            cameraModal.classList.remove('show');
            setTimeout(() => {
                cameraModal.style.display = 'none';
            }, 400);
        });
    }

    if (switchBtn) {
        switchBtn.addEventListener('click', async () => {
            currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
            await startCamera();
        });
    }

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                detectedText.textContent = 'Loading image...';
                const img = new Image();
                img.onload = () => {
                    console.log('Image loaded, processing...');
                    processImage(img);
                };
                img.onerror = () => {
                    detectedText.textContent = 'Failed to load image';
                };
                img.src = URL.createObjectURL(file);
            }
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', async () => {
            try {
                if (!video.videoWidth || !video.videoHeight) {
                    detectedText.textContent = 'Camera not ready. Please wait...';
                    return;
                }
                
                captureBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    captureBtn.style.transform = 'scale(1)';
                }, 150);
                
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0);
                
                await processImage(canvas);
                
            } catch (error) {
                console.error('Capture error:', error);
                detectedText.textContent = 'Capture failed. Try again.';
            }
        });
    }
}

function initializeTripPlanner() {
    const generateBtn = document.querySelector('.generate-plan-btn');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const duration = document.querySelector('.planner-card:nth-child(1) select').value;
            const groupSize = document.querySelector('.planner-card:nth-child(2) select').value;
            const interests = document.querySelector('.planner-card:nth-child(3) select').value;
            const budget = document.querySelector('.planner-card:nth-child(4) select').value;
            
            generateItinerary(duration, groupSize, interests, budget);
        });
    }
}

function generateItinerary(duration, groupSize, interests, budget) {
    const itineraries = {
        '3-5 Days': {
            'Spiritual': {
                'Solo': {
                    'Budget': 'Day 1: Gangtok arrival, visit MG Marg\nDay 2: Rumtek Monastery, local guesthouse\nDay 3: Enchey Monastery, Ganesh Tok\nDay 4: Pemayangtse Monastery\nDay 5: Departure',
                    'Mid-range': 'Day 1: Gangtok hotel, evening at MG Marg\nDay 2: Rumtek & Do Drul Chorten\nDay 3: Pemayangtse & Rabdentse Ruins\nDay 4: Tashiding Monastery\nDay 5: Shopping & departure',
                    'Luxury': 'Day 1: Premium resort, spa & meditation\nDay 2: Private monastery tour with guide\nDay 3: Helicopter to Pemayangtse\nDay 4: Luxury retreat at Tashiding\nDay 5: Private departure transfer'
                }
            },
            'Adventure': {
                'Solo': {
                    'Budget': 'Day 1: Gangtok, gear check\nDay 2: Tsomgo Lake trek\nDay 3: Nathula Pass adventure\nDay 4: Local hiking trails\nDay 5: Departure'
                }
            }
        }
    };
    
    let itinerary = itineraries[duration]?.[interests]?.[groupSize]?.[budget];
    
    if (!itinerary) {
        itinerary = `Custom ${duration} ${interests.toLowerCase()} itinerary for ${groupSize.toLowerCase()} (${budget.toLowerCase()} budget):\n\nDay 1: Arrival in Gangtok, check-in\nDay 2: Monastery visits based on spiritual interests\nDay 3: Cultural exploration and local experiences\nDay 4: Adventure activities in the region\nDay 5: Shopping and departure\n\nNote: This is a basic template. Contact local tour operators for detailed customization.`;
    }
    
    showItineraryModal(itinerary, duration, groupSize, interests, budget);
}
function showItineraryModal(itinerary, duration, groupSize, interests, budget) {
    const modal = document.createElement('div');
    modal.className = 'itinerary-modal';
    modal.innerHTML = `
        <div class="itinerary-modal-content">
            <span class="itinerary-close">&times;</span>
            <h2><i class="fas fa-route"></i> Your Sikkim Itinerary</h2>
            <div class="itinerary-details">
                <div class="detail-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Duration: ${duration}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-users"></i>
                    <span>Group: ${groupSize}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-heart"></i>
                    <span>Focus: ${interests}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-wallet"></i>
                    <span>Budget: ${budget}</span>
                </div>
            </div>
            <div class="itinerary-content">
                <h3>Recommended Itinerary:</h3>
                <pre>${itinerary}</pre>
            </div>
            <div class="itinerary-actions">
                <button class="download-btn"><i class="fas fa-download"></i> Download</button>
                <button class="share-btn"><i class="fas fa-share"></i> Share</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const style = document.createElement('style');
    style.textContent = `
        .itinerary-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            animation: fadeIn 0.3s ease forwards;
        }
        
        .itinerary-modal-content {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
            backdrop-filter: blur(20px);
            border: 1px solid rgba(251, 191, 36, 0.3);
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            transform: scale(0.8);
            animation: scaleIn 0.3s ease 0.1s forwards;
        }
        
        .itinerary-close {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 28px;
            color: #fbbf24;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .itinerary-close:hover {
            transform: rotate(90deg);
            color: #f59e0b;
        }
        
        .itinerary-modal h2 {
            color: #fbbf24;
            text-align: center;
            margin-bottom: 25px;
            font-size: 1.8rem;
        }
        
        .itinerary-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.95rem;
        }
        
        .detail-item i {
            color: #fbbf24;
            width: 20px;
        }
        
        .itinerary-content {
            margin: 25px 0;
        }
        
        .itinerary-content h3 {
            color: #fbbf24;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        
        .itinerary-content pre {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 10px;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
            white-space: pre-wrap;
            font-family: inherit;
            border-left: 4px solid #fbbf24;
        }
        
        .itinerary-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 25px;
        }
        
        .download-btn, .share-btn {
            padding: 12px 25px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .download-btn {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: #1e293b;
        }
        
        .share-btn {
            background: transparent;
            border: 2px solid #fbbf24;
            color: #fbbf24;
        }
        
        .download-btn:hover, .share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(251, 191, 36, 0.3);
        }
        
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            to { transform: scale(1); }
        }
        
        @media (max-width: 768px) {
            .itinerary-details {
                grid-template-columns: 1fr;
            }
            .itinerary-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    modal.querySelector('.itinerary-close').onclick = () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }, 300);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }, 300);
        }
    };
    
    modal.querySelector('.download-btn').onclick = () => {
        const content = `SIKKIM TRAVEL ITINERARY\n\nDuration: ${duration}\nGroup Size: ${groupSize}\nInterests: ${interests}\nBudget: ${budget}\n\n${itinerary}\n\nGenerated by Sikkim Tourism Portal`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sikkim-itinerary.txt';
        a.click();
        URL.revokeObjectURL(url);
    };
    
    modal.querySelector('.share-btn').onclick = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My Sikkim Itinerary',
                text: `Check out my ${duration} ${interests.toLowerCase()} trip to Sikkim!\n\n${itinerary}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(`My Sikkim Itinerary:\n\n${itinerary}`);
            alert('Itinerary copied to clipboard!');
        }
    };
}
// User Authentication System
let currentUser = null;
let userFiles = [];

// Photo/Video Upload Feature
let uploadedFiles = [];
let publicGallery = [];

function handleUploadClick() {
    if (!currentUser) {
        showSignInModal();
    } else {
        document.getElementById('upload-modal').style.display = 'flex';
    }
}

function showSignInModal() {
    document.getElementById('signin-modal').style.display = 'flex';
}

function closeSignInModal() {
    document.getElementById('signin-modal').style.display = 'none';
}

function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
}

function switchSignInTab(tab) {
    document.querySelectorAll('.signin-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const btn = document.querySelector('.signin-btn');
    if (tab === 'signin') {
        btn.textContent = 'Sign In';
        document.getElementById('username').parentElement.style.display = 'none';
    } else {
        btn.textContent = 'Sign Up';
        document.getElementById('username').parentElement.style.display = 'block';
    }
}

function handleSignIn() {
    const username = document.getElementById('username').value || 'User';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Please fill in all required fields');
        return;
    }
    
    currentUser = {
        username: username,
        email: email,
        id: Date.now().toString()
    };
    
    localStorage.setItem('sikkimUser', JSON.stringify(currentUser));
    loadUserFiles();
    updateUserInterface();
    closeSignInModal();
    document.getElementById('upload-modal').style.display = 'flex';
}

function signOut() {
    currentUser = null;
    localStorage.removeItem('sikkimUser');
    document.getElementById('user-header').style.display = 'none';
    document.getElementById('user-gallery').style.display = 'none';
    closeUploadModal();
}

function updateUserInterface() {
    if (currentUser) {
        document.getElementById('user-display-name').textContent = `Welcome, ${currentUser.username}!`;
        document.getElementById('user-email-display').textContent = currentUser.email;
        document.getElementById('user-header').style.display = 'flex';
        document.getElementById('user-gallery').style.display = 'block';
        displayUserGallery();
    }
}

function loadUserFiles() {
    const stored = localStorage.getItem(`userFiles_${currentUser.id}`);
    userFiles = stored ? JSON.parse(stored) : [];
    loadPublicGallery();
}

function loadPublicGallery() {
    const stored = localStorage.getItem('sikkimPublicGallery');
    publicGallery = stored ? JSON.parse(stored) : [];
}

function saveUserFiles() {
    if (currentUser) {
        localStorage.setItem(`userFiles_${currentUser.id}`, JSON.stringify(userFiles));
    }
}

function savePublicGallery() {
    localStorage.setItem('sikkimPublicGallery', JSON.stringify(publicGallery));
}

function displayUserGallery() {
    const gallery = document.getElementById('gallery-grid');
    if (!gallery) return;
    
    gallery.innerHTML = '';
    
    // Show only approved photos from public gallery
    const approvedPhotos = publicGallery.filter(file => file.status === 'approved' || !file.status); // backward compatibility
    
    if (approvedPhotos && approvedPhotos.length > 0) {
        approvedPhotos.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            const isOwnPhoto = currentUser && file.userId === currentUser.id;
            item.innerHTML = `
                <img src="${file.url}" alt="${file.name}" onload="this.style.opacity=1">
                <div class="item-info">
                    <div class="photo-user">
                        <i class="fas fa-user-circle"></i>
                        <span>${file.userName}${isOwnPhoto ? ' (You)' : ''}</span>
                    </div>
                    <div class="photo-date">${new Date(file.date).toLocaleDateString()}</div>
                    <div class="photo-name">${file.name}</div>
                </div>
            `;
            gallery.appendChild(item);
        });
    } else {
        gallery.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">No approved photos yet. Upload photos to share your journey!</p>';
    }
    
    // Show user's pending photos if logged in
    if (currentUser) {
        const pendingGallery = JSON.parse(localStorage.getItem('sikkimPendingGallery') || '[]');
        const userPendingPhotos = pendingGallery.filter(file => file.userId === currentUser.id);
        
        if (userPendingPhotos.length > 0) {
            const pendingSection = document.createElement('div');
            pendingSection.innerHTML = `
                <h3 style="color:#f59e0b;margin:20px 0 10px 0;text-align:center;">Your Pending Photos (Awaiting Approval)</h3>
                <div id="pending-gallery-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;margin-bottom:20px;"></div>
            `;
            gallery.appendChild(pendingSection);
            
            const pendingGrid = document.getElementById('pending-gallery-grid');
            userPendingPhotos.forEach(file => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.style.opacity = '0.7';
                item.innerHTML = `
                    <img src="${file.url}" alt="${file.name}" onload="this.style.opacity=1">
                    <div class="item-info">
                        <div class="photo-user">
                            <i class="fas fa-clock" style="color:#f59e0b;"></i>
                            <span style="color:#f59e0b;">Pending Approval</span>
                        </div>
                        <div class="photo-date">${new Date(file.date).toLocaleDateString()}</div>
                        <div class="photo-name">${file.name}</div>
                    </div>
                `;
                pendingGrid.appendChild(item);
            });
        }
    }
}

function switchTab(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const uploadArea = document.getElementById('upload-area');
    const uploadedFiles = document.getElementById('uploaded-files');
    const cameraContent = document.getElementById('camera-content');
    const fileInput = document.getElementById('file-upload');
    
    // Hide all tab contents
    uploadArea.style.display = 'none';
    uploadedFiles.style.display = 'none';
    if (cameraContent) cameraContent.style.display = 'none';
    
    if (type === 'camera') {
        if (cameraContent) {
            cameraContent.style.display = 'block';
        }
    } else {
        uploadArea.style.display = 'block';
        uploadedFiles.style.display = 'block';
        
        if (type === 'photos') {
            fileInput.accept = 'image/*';
        } else {
            fileInput.accept = 'video/*';
        }
    }
}

// Camera translation functions
window.openCameraTranslate = function() {
    const cameraModal = document.getElementById('camera-modal');
    if (cameraModal) {
        cameraModal.style.display = 'flex';
        setTimeout(() => cameraModal.classList.add('show'), 10);
        // Initialize camera when modal opens
        initializeCameraTranslate();
    } else {
        alert('Camera feature not available');
    }
};

window.uploadImageTranslate = function() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.click();
    } else {
        alert('Upload feature not available');
    }
};

window.closeCameraModal = function() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-video');
    
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
    
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 400);
    }
};

window.captureImage = function() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(blob => {
        processImageForTranslation(blob);
    }, 'image/jpeg', 0.8);
};

window.speakTranslation = function() {
    const text = document.getElementById('translated-text-content').textContent;
    if (text && text !== 'Translation will appear here...' && text !== 'Translation failed') {
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = document.getElementById('target-language').value;
        utterance.lang = targetLang === 'hi' ? 'hi-IN' : targetLang === 'ne' ? 'ne-NP' : 'en-US';
        speechSynthesis.speak(utterance);
    }
};

async function processImageForTranslation(imageBlob) {
    const detectedText = document.getElementById('detected-text-content');
    const translatedText = document.getElementById('translated-text-content');
    
    detectedText.textContent = 'Processing image...';
    translatedText.textContent = 'Waiting for text detection...';
    
    try {
        const { data: { text } } = await Tesseract.recognize(imageBlob, 'eng');
        detectedText.textContent = text || 'No text detected';
        
        if (text) {
            const targetLang = document.getElementById('target-language').value;
            const translation = await translateTextForCamera(text, targetLang);
            translatedText.textContent = translation;
        } else {
            translatedText.textContent = 'No text to translate';
        }
    } catch (error) {
        console.error('OCR Error:', error);
        detectedText.textContent = 'Error processing image';
        translatedText.textContent = 'Translation failed';
    }
}

async function translateTextForCamera(text, targetLang) {
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        return data.responseData.translatedText || 'Translation not available';
    } catch (error) {
        console.error('Translation Error:', error);
        return 'Translation service unavailable';
    }
}

// Camera tab functions
let tabCameraStream = null;

window.startTabCamera = async function() {
    try {
        tabCameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('tab-camera-video');
        video.srcObject = tabCameraStream;
        document.getElementById('camera-tab-preview').style.display = 'block';
    } catch (error) {
        alert('Camera access denied or not available');
    }
};

window.stopTabCamera = function() {
    if (tabCameraStream) {
        tabCameraStream.getTracks().forEach(track => track.stop());
        tabCameraStream = null;
    }
    document.getElementById('camera-tab-preview').style.display = 'none';
    document.getElementById('camera-tab-results').style.display = 'none';
};

window.captureTabImage = async function() {
    const video = document.getElementById('tab-camera-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    await processTabImage(canvas);
};

window.uploadTabImage = function() {
    document.getElementById('camera-tab-file').click();
};

window.speakTabTranslation = function() {
    const text = document.getElementById('tab-translated-text').textContent;
    if (text && text !== 'Translating...') {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const cameraTabFile = document.getElementById('camera-tab-file');
    if (cameraTabFile) {
        cameraTabFile.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                const img = new Image();
                img.onload = async function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    await processTabImage(canvas);
                };
                img.src = URL.createObjectURL(file);
            }
        });
    }
});

async function processTabImage(canvas) {
    document.getElementById('camera-tab-results').style.display = 'block';
    document.getElementById('tab-detected-text').textContent = 'Processing image...';
    document.getElementById('tab-translated-text').textContent = 'Translating...';
    
    try {
        const detectedText = 'Sample text detected from image';
        document.getElementById('tab-detected-text').textContent = detectedText;
        
        const translation = await translateText(detectedText, 'hi');
        document.getElementById('tab-translated-text').textContent = translation;
        
    } catch (error) {
        document.getElementById('tab-detected-text').textContent = 'Processing failed';
        document.getElementById('tab-translated-text').textContent = 'Translation failed';
    }
}

// Initialize file upload when DOM is ready
function initFileUpload() {
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                    uploadedFiles.push(file);
                    displayFile(file);
                }
            });
        });
    }
}

function showUploadMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        animation: slideIn 0.3s ease;
    `;
    messageDiv.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = '@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }';
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        style.textContent += '@keyframes slideOut { from { transform: translateX(0); } to { transform: translateX(100%); } }';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 300);
    }, 4000);
}

function displayFile(file) {
    const container = document.getElementById('uploaded-files');
    const preview = document.createElement('div');
    preview.className = 'file-preview';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = {
            name: file.name,
            url: e.target.result,
            date: Date.now(),
            type: file.type,
            userId: currentUser.id,
            userName: currentUser.username,
            userEmail: currentUser.email,
            status: 'pending' // Add pending status for admin verification
        };
        
        if (currentUser) {
            userFiles.push(fileData);
            saveUserFiles();
            // Store in pending gallery instead of public gallery
            const pendingGallery = JSON.parse(localStorage.getItem('sikkimPendingGallery') || '[]');
            pendingGallery.unshift(fileData);
            localStorage.setItem('sikkimPendingGallery', JSON.stringify(pendingGallery));
            displayUserGallery();
            
            // Show success message
            showUploadMessage('Photo uploaded successfully! It will appear on the website after admin approval.');
        }
        
        if (file.type.startsWith('image/')) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="upload-user-info">
                    <i class="fas fa-user-circle"></i>
                    <span>${currentUser.username}</span>
                </div>
                <button class="file-remove" onclick="removeFile(this)">&times;</button>
            `;
        } else {
            preview.innerHTML = `
                <video src="${e.target.result}" controls></video>
                <div class="upload-user-info">
                    <i class="fas fa-user-circle"></i>
                    <span>${currentUser.username}</span>
                </div>
                <button class="file-remove" onclick="removeFile(this)">&times;</button>
            `;
        }
    };
    reader.readAsDataURL(file);
    
    container.appendChild(preview);
}

function removeFile(button) {
    button.parentElement.remove();
}

// Drag and drop functionality
const uploadArea = document.getElementById('upload-area');

uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#10b981';
    uploadArea.style.background = 'rgba(16, 185, 129, 0.1)';
});

uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    uploadArea.style.borderColor = 'rgba(16, 185, 129, 0.5)';
    uploadArea.style.background = 'rgba(16, 185, 129, 0.05)';
});

uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            uploadedFiles.push(file);
            displayFile(file);
        }
    });
    uploadArea.style.borderColor = 'rgba(16, 185, 129, 0.5)';
    uploadArea.style.background = 'rgba(16, 185, 129, 0.05)';
});

// Travel Document Generator Functions
function openTravelDocModal() {
    document.getElementById('travel-doc-modal').style.display = 'flex';
}

function closeTravelDocModal() {
    document.getElementById('travel-doc-modal').style.display = 'none';
}

function addDestination() {
    const container = document.getElementById('destinations-container');
    const count = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'destination-item';
    div.innerHTML = `
        <input type="text" class="destination-input" placeholder="Destination ${count}" required>
        <input type="number" class="days-input" placeholder="Days" min="1" max="30" required>
        <button type="button" class="remove-destination" onclick="removeDestination(this)">&times;</button>
    `;
    container.appendChild(div);
}

function removeDestination(button) {
    const container = document.getElementById('destinations-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
}

async function generateRouteMap(destinations) {
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 450;
    
    // Google Maps style background - light beige/cream
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(0, 0, 600, 450);
    
    // Add subtle grid pattern like Google Maps
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 600; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 450);
        ctx.stroke();
    }
    for (let i = 0; i < 450; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(600, i);
        ctx.stroke();
    }
    
    // Draw terrain features like Google Maps
    // Green areas (forests)
    ctx.fillStyle = '#C8E6C9';
    ctx.fillRect(50, 100, 150, 80);
    ctx.fillRect(400, 200, 120, 100);
    ctx.fillRect(200, 320, 180, 70);
    
    // Water bodies (light blue)
    ctx.fillStyle = '#B3E5FC';
    ctx.beginPath();
    ctx.arc(150, 300, 40, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(450, 150, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    // Mountain areas (light brown)
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(300, 50, 200, 120);
    ctx.fillRect(100, 200, 100, 80);
    
    // Define accurate Sikkim coordinates
    const locationCoords = {
        'gangtok': { x: 300, y: 200 },
        'pelling': { x: 200, y: 250 },
        'yuksom': { x: 150, y: 280 },
        'lachung': { x: 350, y: 120 },
        'namchi': { x: 280, y: 320 },
        'ravangla': { x: 240, y: 270 },
        'mangan': { x: 320, y: 150 },
        'gyalshing': { x: 180, y: 230 },
        'jorethang': { x: 260, y: 340 },
        'singtam': { x: 330, y: 220 },
        'kalimpong': { x: 220, y: 350 },
        'darjeeling': { x: 180, y: 380 }
    };
    
    const routePoints = destinations.map(dest => {
        const key = dest.toLowerCase().replace(/\s+/g, '');
        return locationCoords[key] || { 
            x: 250 + Math.random() * 100, 
            y: 200 + Math.random() * 100 
        };
    });
    
    // Draw roads like Google Maps
    if (routePoints.length > 1) {
        // Main route - thick blue line with white border (Google Maps style)
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'white';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(routePoints[0].x, routePoints[0].y);
        for (let i = 1; i < routePoints.length; i++) {
            ctx.lineTo(routePoints[i].x, routePoints[i].y);
        }
        ctx.stroke();
        
        // Blue route line
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#1976D2';
        ctx.beginPath();
        ctx.moveTo(routePoints[0].x, routePoints[0].y);
        for (let i = 1; i < routePoints.length; i++) {
            ctx.lineTo(routePoints[i].x, routePoints[i].y);
        }
        ctx.stroke();
        
        // Direction arrows (Google Maps style)
        ctx.fillStyle = '#1976D2';
        for (let i = 0; i < routePoints.length - 1; i++) {
            const start = routePoints[i];
            const end = routePoints[i + 1];
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            ctx.save();
            ctx.translate(midX, midY);
            ctx.rotate(angle);
            
            // Google Maps arrow shape
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(-4, -6);
            ctx.lineTo(-4, -2);
            ctx.lineTo(-8, -2);
            ctx.lineTo(-8, 2);
            ctx.lineTo(-4, 2);
            ctx.lineTo(-4, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Draw Google Maps style markers
    destinations.forEach((dest, i) => {
        const point = routePoints[i];
        
        // Google Maps pin shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(point.x + 2, point.y + 2, 8, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Google Maps pin colors
        let pinColor = '#EA4335'; // Google red
        if (i === 0) pinColor = '#34A853'; // Google green for start
        if (i > 0 && i < destinations.length - 1) pinColor = '#FBBC04'; // Google yellow for waypoints
        
        // Pin body (teardrop shape)
        ctx.fillStyle = pinColor;
        ctx.beginPath();
        ctx.arc(point.x, point.y - 15, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Pin point
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x - 8, point.y - 15);
        ctx.lineTo(point.x + 8, point.y - 15);
        ctx.closePath();
        ctx.fill();
        
        // White circle inside pin
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(point.x, point.y - 15, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Letter or number in pin
        ctx.fillStyle = pinColor;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCharCode(65 + i), point.x, point.y - 10); // A, B, C...
        
        // Location label (Google Maps style)
        const labelWidth = ctx.measureText(dest).width + 16;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(point.x - labelWidth/2, point.y + 8, labelWidth, 20);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(point.x - labelWidth/2, point.y + 8, labelWidth, 20);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dest, point.x, point.y + 22);
    });
    
    // Google Maps style info panel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(15, 15, 220, 80);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(15, 15, 220, 80);
    
    // Google logo style text
    ctx.fillStyle = '#1976D2';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Sikkim Route Map', 25, 35);
    
    // Route info
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.fillText(`${destinations.length} destinations`, 25, 50);
    
    const totalDistance = (routePoints.length - 1) * 45; // Approximate
    ctx.fillText(`~${totalDistance} km total distance`, 25, 65);
    ctx.fillText(`Estimated time: ${Math.ceil(totalDistance/30)} hours`, 25, 80);
    
    // Add compass (Google Maps style)
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(550, 50, 20, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = '#EA4335';
    ctx.beginPath();
    ctx.moveTo(550, 35);
    ctx.lineTo(545, 45);
    ctx.lineTo(550, 40);
    ctx.lineTo(555, 45);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#666';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N', 550, 28);
    
    return canvas.toDataURL('image/png');
}

async function generateTravelDocPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const destinationInputs = document.querySelectorAll('.destination-input');
    const daysInputs = document.querySelectorAll('.days-input');
    const destinations = Array.from(destinationInputs).map((input, i) => ({
        name: input.value.trim(),
        days: parseInt(daysInputs[i]?.value) || 1
    })).filter(dest => dest.name);
    const destinationNames = destinations.map(d => d.name);
    
    const data = {
        name: document.getElementById('travelerName').value,
        email: document.getElementById('travelerEmail').value,
        phone: document.getElementById('travelerPhone').value,
        id: document.getElementById('travelerId').value,
        address: document.getElementById('travelerAddress').value,
        startDate: document.getElementById('tripStart').value,
        endDate: document.getElementById('tripEnd').value,
        travelers: document.getElementById('tripTravelers').value,
        transport: document.getElementById('tripTransport').value,
        destinations: destinationNames,
        destinationsWithDays: destinations,
        notes: document.getElementById('tripNotes').value,
        includeMap: document.getElementById('includeMap').checked
    };
    
    // Header
    doc.setFillColor(239, 68, 68);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SIKKIM TRAVEL DOCUMENT', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Official Travel Itinerary & Route Guide', 105, 23, { align: 'center' });
    
    let yPos = 40;
    
    // Personal Information
    doc.setFillColor(248, 249, 250);
    doc.rect(10, yPos, 190, 35, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(10, yPos, 190, 35);
    
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PERSONAL INFORMATION', 15, yPos + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${data.name}`, 15, yPos + 16);
    doc.text(`Email: ${data.email}`, 105, yPos + 16);
    doc.text(`Phone: ${data.phone}`, 15, yPos + 22);
    doc.text(`ID: ${data.id}`, 105, yPos + 22);
    doc.text(`Address: ${data.address}`, 15, yPos + 28);
    
    yPos += 45;
    
    // Trip Details
    doc.setFillColor(240, 253, 244);
    doc.rect(10, yPos, 190, 30, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(10, yPos, 190, 30);
    
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TRIP DETAILS', 15, yPos + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dates: ${data.startDate} to ${data.endDate}`, 15, yPos + 16);
    doc.text(`Travelers: ${data.travelers}`, 105, yPos + 16);
    doc.text(`Transport: ${data.transport}`, 15, yPos + 22);
    
    const tripDays = Math.ceil((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24));
    doc.text(`Duration: ${tripDays} days`, 105, yPos + 22);
    
    yPos += 40;
    
    // Destinations
    const destHeight = 15 + (data.destinations.length * 6);
    doc.setFillColor(254, 249, 195);
    doc.rect(10, yPos, 190, destHeight, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(10, yPos, 190, destHeight);
    
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DESTINATIONS & ROUTE', 15, yPos + 8);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data.destinationsWithDays.forEach((dest, i) => {
        const marker = String.fromCharCode(65 + i);
        doc.text(`${marker}. ${dest.name} (${dest.days} day${dest.days > 1 ? 's' : ''})`, 15, yPos + 16 + (i * 6));
    });
    
    yPos += destHeight + 10;
    
    // Route Map
    if (data.includeMap && data.destinations.length > 1) {
        try {
            const mapImage = await generateRouteMap(data.destinations);
            
            doc.setFillColor(235, 248, 255);
            doc.rect(10, yPos, 190, 100, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(10, yPos, 190, 100);
            
            doc.setTextColor(6, 182, 212);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('ROUTE MAP', 15, yPos + 8);
            
            // Add map with proper sizing
            doc.addImage(mapImage, 'PNG', 15, yPos + 12, 180, 80);
            yPos += 110;
        } catch (error) {
            console.log('Map generation failed:', error);
        }
    }
    
    // Notes
    if (data.notes && yPos < 250) {
        const notesHeight = 25;
        doc.setFillColor(248, 250, 252);
        doc.rect(10, yPos, 190, notesHeight, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(10, yPos, 190, notesHeight);
        
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTES', 15, yPos + 8);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(data.notes, 170);
        doc.text(splitNotes, 15, yPos + 16);
        yPos += notesHeight + 5;
    }
    
    // Footer
    doc.setFillColor(31, 41, 55);
    doc.rect(0, 275, 210, 22, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by Sikkim Tourism Portal', 15, 283);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 289);
    
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Have a wonderful journey!', 140, 286);
    
    doc.save(`Sikkim_Travel_Document_${data.name.replace(/\s+/g, '_')}.pdf`);
    closeTravelDocModal();
    alert('Travel document generated successfully!');
}

function triggerFileUpload() {
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
        fileInput.click();
    }
}

if (uploadArea) {
    uploadArea.addEventListener('click', function() {
        triggerFileUpload();
    });
}

// Add CSS for word animation
const wordAnimationCSS = `
.word-animate {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-image-container {
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = wordAnimationCSS;
document.head.appendChild(styleSheet);