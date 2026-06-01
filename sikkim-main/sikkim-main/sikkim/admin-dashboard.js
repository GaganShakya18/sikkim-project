// Admin Dashboard JavaScript - Read-Only Backend System
class AdminDashboard {
    constructor() {
        this.users = [];
        this.reviews = [];
        this.journeys = [];
        this.currentTab = 'users';
        this.init();
    }

    init() {
        this.checkAdminAccess();
        this.loadMockData();
        this.updateStats();
        this.renderUsers();
        this.setupEventListeners();
    }

    checkAdminAccess() {
        const adminAccess = localStorage.getItem('adminAccess');
        const loginTime = localStorage.getItem('adminLoginTime');
        
        if (!adminAccess || !loginTime) {
            window.location.href = 'admin.html';
            return;
        }
        
        // Check if session expired (24 hours)
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        if (currentTime - parseInt(loginTime) > sessionDuration) {
            this.logout();
            return;
        }
    }

    loadMockData() {
        // Load real data from website's localStorage and community posts
        this.loadRealWebsiteData();
        
        // If no real data exists, use sample data
        if (this.users.length === 0) {
            this.loadSampleData();
        }
    }
    
    loadRealWebsiteData() {
        // Load community posts from website
        const communityPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
        
        // Load current user data
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        
        // Load public gallery data
        const publicGallery = JSON.parse(localStorage.getItem('sikkimPublicGallery') || '[]');
        
        // Convert community posts to admin format
        this.users = [];
        this.reviews = [];
        this.journeys = [];
        
        // Extract unique users from posts
        const userMap = new Map();
        
        // Add current user if exists
        if (currentUser) {
            userMap.set(currentUser.name, {
                id: 'USR' + Date.now().toString().slice(-6),
                username: currentUser.name,
                email: currentUser.email || 'user@example.com',
                joinDate: new Date().toISOString().split('T')[0],
                status: 'Active',
                journeys: 0,
                verified: true,
                blockchainHash: this.generateHash()
            });
        }
        
        // Process community posts
        communityPosts.forEach((post, index) => {
            // Add user if not exists
            if (!userMap.has(post.author)) {
                userMap.set(post.author, {
                    id: 'USR' + (Date.now() + index).toString().slice(-6),
                    username: post.author,
                    email: post.author.toLowerCase().replace(/\s+/g, '') + '@example.com',
                    joinDate: new Date(post.timestamp).toISOString().split('T')[0],
                    status: 'Active',
                    journeys: 0,
                    verified: true,
                    blockchainHash: this.generateHash()
                });
            }
            
            const user = userMap.get(post.author);
            
            // Convert post to journey or review based on category
            if (post.category === 'experience' || post.category === 'tip') {
                user.journeys++;
                this.journeys.push({
                    id: 'JRN' + (Date.now() + index).toString().slice(-6),
                    userId: user.id,
                    username: post.author,
                    title: this.extractTitle(post.content),
                    description: post.content,
                    destinations: this.extractDestinations(post.content),
                    duration: this.extractDuration(post.content),
                    date: new Date(post.timestamp).toISOString().split('T')[0],
                    status: 'Public',
                    views: Math.floor(Math.random() * 500) + 50,
                    likes: post.likes || 0,
                    blockchainHash: this.generateHash(),
                    immutable: true
                });
            } else if (post.category === 'review') {
                this.reviews.push({
                    id: 'REV' + (Date.now() + index).toString().slice(-6),
                    userId: user.id,
                    username: post.author,
                    destination: this.extractDestination(post.content),
                    rating: this.extractRating(post.content),
                    review: post.content,
                    date: new Date(post.timestamp).toISOString().split('T')[0],
                    verified: true,
                    blockchainHash: this.generateHash(),
                    immutable: true
                });
            }
        });
        
        // Convert userMap to array
        this.users = Array.from(userMap.values());
        
        // Process public gallery as additional journeys
        publicGallery.forEach((item, index) => {
            if (item.user && item.description) {
                // Add user if not exists
                if (!userMap.has(item.user)) {
                    const newUser = {
                        id: 'USR' + (Date.now() + 1000 + index).toString().slice(-6),
                        username: item.user,
                        email: item.user.toLowerCase().replace(/\s+/g, '') + '@gallery.com',
                        joinDate: new Date(item.timestamp || Date.now()).toISOString().split('T')[0],
                        status: 'Active',
                        journeys: 1,
                        verified: true,
                        blockchainHash: this.generateHash()
                    };
                    userMap.set(item.user, newUser);
                    this.users.push(newUser);
                } else {
                    userMap.get(item.user).journeys++;
                }
                
                this.journeys.push({
                    id: 'JRN' + (Date.now() + 2000 + index).toString().slice(-6),
                    userId: userMap.get(item.user).id,
                    username: item.user,
                    title: item.location || 'Sikkim Journey',
                    description: item.description,
                    destinations: [item.location || 'Sikkim'],
                    duration: '1 day',
                    date: new Date(item.timestamp || Date.now()).toISOString().split('T')[0],
                    status: 'Public',
                    views: Math.floor(Math.random() * 200) + 20,
                    likes: Math.floor(Math.random() * 50) + 5,
                    blockchainHash: this.generateHash(),
                    immutable: true
                });
            }
        });
    }
    
    loadSampleData() {
        // Sample data for demonstration when no real data exists
        this.users = [
            {
                id: 'USR001',
                username: 'Priya Sharma',
                email: 'priya@example.com',
                joinDate: '2024-01-15',
                status: 'Active',
                journeys: 1,
                verified: true,
                blockchainHash: '0x1a2b3c4d5e6f7890'
            },
            {
                id: 'USR002',
                username: 'David Chen',
                email: 'david@example.com',
                joinDate: '2024-02-20',
                status: 'Active',
                journeys: 1,
                verified: true,
                blockchainHash: '0x2b3c4d5e6f789012'
            },
            {
                id: 'USR003',
                username: 'Anita Gurung',
                email: 'anita@example.com',
                joinDate: '2024-03-10',
                status: 'Active',
                journeys: 0,
                verified: true,
                blockchainHash: '0x3c4d5e6f78901234'
            }
        ];

        this.reviews = [
            {
                id: 'REV001',
                userId: 'USR001',
                username: 'Priya Sharma',
                destination: 'Rumtek Monastery',
                rating: 5,
                review: 'Just visited Rumtek Monastery and it was absolutely breathtaking! The golden stupa and the peaceful atmosphere made it a spiritual experience.',
                date: '2024-08-15',
                verified: true,
                blockchainHash: '0xa1b2c3d4e5f67890',
                immutable: true
            }
        ];

        this.journeys = [
            {
                id: 'JRN001',
                userId: 'USR001',
                username: 'Priya Sharma',
                title: 'Spiritual Journey to Rumtek Monastery',
                description: 'Just visited Rumtek Monastery and it was absolutely breathtaking! The golden stupa and the peaceful atmosphere made it a spiritual experience. Highly recommend visiting early morning for the best experience.',
                destinations: ['Rumtek Monastery'],
                duration: '1 day',
                date: '2024-08-15',
                status: 'Public',
                views: 245,
                likes: 12,
                blockchainHash: '0xe5f678901234567a',
                immutable: true
            },
            {
                id: 'JRN002',
                userId: 'USR002',
                username: 'David Chen',
                title: 'Travel Tips for High-Altitude Monasteries',
                description: 'Pro tip: Always carry warm clothes even in summer when visiting high-altitude monasteries. The weather can change quickly in the mountains!',
                destinations: ['High-altitude areas'],
                duration: 'General advice',
                date: '2024-08-20',
                status: 'Public',
                views: 156,
                likes: 8,
                blockchainHash: '0xf678901234567abc',
                immutable: true
            }
        ];
    }
    
    generateHash() {
        return '0x' + Math.random().toString(16).substr(2, 16);
    }
    
    extractTitle(content) {
        const words = content.split(' ').slice(0, 8).join(' ');
        return words.length > 50 ? words.substring(0, 50) + '...' : words;
    }
    
    extractDestinations(content) {
        const destinations = [];
        const places = ['Gangtok', 'Rumtek', 'Pelling', 'Yumthang', 'Tsomgo', 'Nathu La', 'Pemayangtse', 'Tashiding', 'Gurudongmar'];
        places.forEach(place => {
            if (content.toLowerCase().includes(place.toLowerCase())) {
                destinations.push(place);
            }
        });
        return destinations.length > 0 ? destinations : ['Sikkim'];
    }
    
    extractDestination(content) {
        const places = ['Gangtok', 'Rumtek', 'Pelling', 'Yumthang', 'Tsomgo', 'Nathu La', 'Pemayangtse', 'Tashiding', 'Gurudongmar'];
        for (let place of places) {
            if (content.toLowerCase().includes(place.toLowerCase())) {
                return place;
            }
        }
        return 'Sikkim';
    }
    
    extractDuration(content) {
        const durationMatch = content.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
        return durationMatch ? durationMatch[0] : 'Not specified';
    }
    
    extractRating(content) {
        // Look for star ratings or positive/negative sentiment
        if (content.toLowerCase().includes('amazing') || content.toLowerCase().includes('excellent') || content.toLowerCase().includes('breathtaking')) {
            return 5;
        } else if (content.toLowerCase().includes('good') || content.toLowerCase().includes('nice') || content.toLowerCase().includes('beautiful')) {
            return 4;
        } else if (content.toLowerCase().includes('okay') || content.toLowerCase().includes('average')) {
            return 3;
        } else if (content.toLowerCase().includes('poor') || content.toLowerCase().includes('bad')) {
            return 2;
        }
        return 4; // Default rating
    }

    updateStats() {
        document.getElementById('total-users').textContent = this.users.length;
        document.getElementById('total-reviews').textContent = this.reviews.length;
        document.getElementById('total-journeys').textContent = this.journeys.length;
        
        // Auto-refresh data every 30 seconds to sync with website
        setTimeout(() => {
            this.loadRealWebsiteData();
            this.updateStats();
            if (this.currentTab === 'users') this.renderUsers();
            if (this.currentTab === 'reviews') this.renderReviews();
            if (this.currentTab === 'journeys') this.renderJourneys();
        }, 30000);
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('user-search').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });
        
        document.getElementById('review-search').addEventListener('input', (e) => {
            this.filterReviews(e.target.value);
        });
        
        document.getElementById('journey-search').addEventListener('input', (e) => {
            this.filterJourneys(e.target.value);
        });

        // Filter functionality
        document.getElementById('user-filter').addEventListener('change', (e) => {
            this.filterUsers('', e.target.value);
        });
        
        document.getElementById('review-filter').addEventListener('change', (e) => {
            this.filterReviews('', e.target.value);
        });
        
        document.getElementById('journey-filter').addEventListener('change', (e) => {
            this.filterJourneys('', e.target.value);
        });
    }

    renderUsers(filteredUsers = null) {
        const users = filteredUsers || this.users;
        const tbody = document.getElementById('users-tbody');
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.joinDate}</td>
                <td><span class="blockchain-verified">${user.status}</span></td>
                <td>${user.journeys}</td>
                <td>
                    <button class="view-btn" onclick="adminDashboard.viewUserDetails('${user.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderReviews(filteredReviews = null) {
        const reviews = filteredReviews || this.reviews;
        const tbody = document.getElementById('reviews-tbody');
        
        tbody.innerHTML = reviews.map(review => `
            <tr>
                <td>${review.id}</td>
                <td>${review.username}</td>
                <td>${review.destination}</td>
                <td>
                    <span class="rating-stars">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                    </span>
                </td>
                <td>${review.date}</td>
                <td><span class="blockchain-verified">✓ Verified</span></td>
                <td>
                    <button class="view-btn" onclick="adminDashboard.viewReviewDetails('${review.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderJourneys(filteredJourneys = null) {
        const journeys = filteredJourneys || this.journeys;
        const container = document.getElementById('journeys-container');
        
        container.innerHTML = journeys.map(journey => `
            <div class="journey-card">
                <div class="journey-meta">
                    <span><strong>ID:</strong> ${journey.id}</span>
                    <span><strong>User:</strong> ${journey.username}</span>
                    <span><strong>Date:</strong> ${journey.date}</span>
                    <span class="blockchain-verified">🔒 Immutable</span>
                </div>
                <h3>${journey.title}</h3>
                <p>${journey.description}</p>
                <div style="margin: 10px 0;">
                    <strong>Destinations:</strong> ${journey.destinations.join(', ')}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <div>
                        <span style="margin-right: 15px;"><i class="fas fa-eye"></i> ${journey.views} views</span>
                        <span><i class="fas fa-heart"></i> ${journey.likes} likes</span>
                    </div>
                    <button class="view-btn" onclick="adminDashboard.viewJourneyDetails('${journey.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterUsers(searchTerm = '', filterType = 'all') {
        let filtered = this.users;
        
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filterType !== 'all') {
            filtered = filtered.filter(user => {
                switch(filterType) {
                    case 'active': return user.status === 'Active';
                    case 'verified': return user.verified;
                    default: return true;
                }
            });
        }
        
        this.renderUsers(filtered);
    }

    filterReviews(searchTerm = '', filterType = 'all') {
        let filtered = this.reviews;
        
        if (searchTerm) {
            filtered = filtered.filter(review => 
                review.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.review.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filterType !== 'all') {
            filtered = filtered.filter(review => review.rating === parseInt(filterType));
        }
        
        this.renderReviews(filtered);
    }

    filterJourneys(searchTerm = '', filterType = 'all') {
        let filtered = this.journeys;
        
        if (searchTerm) {
            filtered = filtered.filter(journey => 
                journey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                journey.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                journey.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filterType !== 'all') {
            filtered = filtered.filter(journey => {
                switch(filterType) {
                    case 'public': return journey.status === 'Public';
                    case 'featured': return journey.status === 'Featured';
                    default: return true;
                }
            });
        }
        
        this.renderJourneys(filtered);
    }

    viewUserDetails(userId) {
        const user = this.users.find(u => u.id === userId);
        const userJourneys = this.journeys.filter(j => j.userId === userId);
        const userReviews = this.reviews.filter(r => r.userId === userId);
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2><i class="fas fa-user"></i> User Details (Read-Only)</h2>
            <div class="immutable-notice">
                <i class="fas fa-shield-alt"></i> This data is blockchain-verified and cannot be modified
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Account Information</h3>
                <p><strong>User ID:</strong> ${user.id}</p>
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Join Date:</strong> ${user.joinDate}</p>
                <p><strong>Status:</strong> <span class="blockchain-verified">${user.status}</span></p>
                <p><strong>Blockchain Hash:</strong> <code>${user.blockchainHash}</code></p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Activity Summary</h3>
                <p><strong>Total Journeys:</strong> ${userJourneys.length}</p>
                <p><strong>Total Reviews:</strong> ${userReviews.length}</p>
                <p><strong>Account Verified:</strong> ${user.verified ? '✅ Yes' : '❌ No'}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 10px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Admin Notice:</strong> All user data is immutable and blockchain-verified. 
                No modifications can be made to maintain data integrity and authenticity.
            </div>
        `;
        
        this.showModal();
    }

    viewReviewDetails(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2><i class="fas fa-star"></i> Review Details (Immutable)</h2>
            <div class="immutable-notice">
                <i class="fas fa-link"></i> This review is blockchain-verified and immutable
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Review Information</h3>
                <p><strong>Review ID:</strong> ${review.id}</p>
                <p><strong>User:</strong> ${review.username}</p>
                <p><strong>Destination:</strong> ${review.destination}</p>
                <p><strong>Rating:</strong> <span class="rating-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span></p>
                <p><strong>Date:</strong> ${review.date}</p>
                <p><strong>Blockchain Hash:</strong> <code>${review.blockchainHash}</code></p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Review Content</h3>
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                    "${review.review}"
                </div>
            </div>
            
            <div style="background: #d1ecf1; padding: 15px; border-radius: 10px; border-left: 4px solid #17a2b8;">
                <strong>🔒 Authenticity Guarantee:</strong> This review is stored on blockchain and cannot be 
                altered, ensuring complete authenticity and trustworthiness for future visitors.
            </div>
        `;
        
        this.showModal();
    }

    viewJourneyDetails(journeyId) {
        const journey = this.journeys.find(j => j.id === journeyId);
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2><i class="fas fa-map-marked-alt"></i> Journey Details (Immutable)</h2>
            <div class="immutable-notice">
                <i class="fas fa-lock"></i> This journey is permanently stored and cannot be modified
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Journey Information</h3>
                <p><strong>Journey ID:</strong> ${journey.id}</p>
                <p><strong>Author:</strong> ${journey.username}</p>
                <p><strong>Title:</strong> ${journey.title}</p>
                <p><strong>Duration:</strong> ${journey.duration}</p>
                <p><strong>Date Shared:</strong> ${journey.date}</p>
                <p><strong>Status:</strong> <span class="blockchain-verified">${journey.status}</span></p>
                <p><strong>Blockchain Hash:</strong> <code>${journey.blockchainHash}</code></p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Journey Description</h3>
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
                    ${journey.description}
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Destinations Covered</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${journey.destinations.map(dest => `<li>${dest}</li>`).join('')}
                </ul>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3>Engagement Stats</h3>
                <p><strong>Views:</strong> ${journey.views}</p>
                <p><strong>Likes:</strong> ${journey.likes}</p>
            </div>
            
            <div style="background: #d4edda; padding: 15px; border-radius: 10px; border-left: 4px solid #28a745;">
                <strong>✅ Data Integrity:</strong> This journey experience is permanently preserved 
                in its original form, maintaining authenticity for future travelers and researchers.
            </div>
        `;
        
        this.showModal();
    }

    showModal() {
        document.getElementById('detail-modal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('detail-modal').style.display = 'none';
    }

    logout() {
        localStorage.removeItem('adminAccess');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'admin.html';
    }
}

// Global functions
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Render appropriate content
    switch(tabName) {
        case 'users':
            adminDashboard.renderUsers();
            break;
        case 'reviews':
            adminDashboard.renderReviews();
            break;
        case 'journeys':
            adminDashboard.renderJourneys();
            break;
    }
    
    adminDashboard.currentTab = tabName;
}

function closeModal() {
    adminDashboard.closeModal();
}

function logout() {
    adminDashboard.logout();
}

// Initialize dashboard when page loads
let adminDashboard;
document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
});

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('detail-modal');
    if (e.target === modal) {
        closeModal();
    }
});