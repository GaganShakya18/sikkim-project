// Data Synchronization Service - Ensures consistency between website and admin backend
class DataSyncService {
    constructor() {
        this.syncInterval = 5000; // 5 seconds
        this.lastSyncTime = 0;
        this.isAdmin = window.location.pathname.includes('admin-dashboard');
        this.init();
    }

    init() {
        this.setupStorageListeners();
        this.startPeriodicSync();
        this.syncOnVisibilityChange();
    }

    setupStorageListeners() {
        // Listen for localStorage changes
        window.addEventListener('storage', (e) => {
            if (this.shouldSync(e.key)) {
                this.handleDataChange(e.key, e.newValue);
            }
        });

        // Listen for custom events
        window.addEventListener('dataUpdated', (e) => {
            this.handleCustomDataUpdate(e.detail);
        });
    }

    shouldSync(key) {
        const syncKeys = [
            'communityPosts',
            'currentUser',
            'sikkimPublicGallery',
            'sikkimJourneyBlockchain',
            'userAccounts',
            'journeyReviews'
        ];
        return syncKeys.includes(key);
    }

    handleDataChange(key, newValue) {
        console.log(`Data sync: ${key} updated`);
        
        // Trigger sync event for admin dashboard
        if (this.isAdmin) {
            this.refreshAdminData();
        } else {
            this.refreshWebsiteData();
        }
        
        // Broadcast to other tabs/windows
        this.broadcastUpdate(key, newValue);
    }

    handleCustomDataUpdate(detail) {
        console.log('Custom data update:', detail);
        
        if (detail.type === 'journey_shared') {
            this.syncJourneyData(detail.data);
        } else if (detail.type === 'review_submitted') {
            this.syncReviewData(detail.data);
        } else if (detail.type === 'user_registered') {
            this.syncUserData(detail.data);
        }
    }

    syncJourneyData(journeyData) {
        // Ensure journey data is consistent across website and admin
        const existingJourneys = JSON.parse(localStorage.getItem('communityPosts') || '[]');
        
        // Convert journey to community post format if needed
        if (journeyData && !existingJourneys.find(post => post.id === journeyData.id)) {
            const communityPost = {
                id: journeyData.id || Date.now(),
                author: journeyData.username || journeyData.author || 'Anonymous',
                content: journeyData.description || journeyData.content,
                category: journeyData.category || 'experience',
                timestamp: journeyData.timestamp || new Date().toISOString(),
                likes: journeyData.likes || 0,
                comments: journeyData.comments || [],
                liked: false,
                blockchainHash: journeyData.blockchainHash,
                immutable: true
            };
            
            existingJourneys.unshift(communityPost);
            localStorage.setItem('communityPosts', JSON.stringify(existingJourneys));
            
            // Trigger update event
            this.triggerDataUpdate('journey_added', communityPost);
        }
    }

    syncReviewData(reviewData) {
        // Sync review data between systems
        const existingReviews = JSON.parse(localStorage.getItem('journeyReviews') || '[]');
        
        if (reviewData && !existingReviews.find(review => review.id === reviewData.id)) {
            existingReviews.push({
                id: reviewData.id || Date.now(),
                userId: reviewData.userId,
                username: reviewData.username,
                destination: reviewData.destination,
                rating: reviewData.rating,
                review: reviewData.review,
                date: reviewData.date || new Date().toISOString().split('T')[0],
                verified: true,
                blockchainHash: reviewData.blockchainHash,
                immutable: true
            });
            
            localStorage.setItem('journeyReviews', JSON.stringify(existingReviews));
            this.triggerDataUpdate('review_added', reviewData);
        }
    }

    syncUserData(userData) {
        // Sync user account data
        const existingUsers = JSON.parse(localStorage.getItem('userAccounts') || '[]');
        
        if (userData && !existingUsers.find(user => user.id === userData.id)) {
            existingUsers.push({
                id: userData.id || Date.now(),
                username: userData.username,
                email: userData.email,
                joinDate: userData.joinDate || new Date().toISOString().split('T')[0],
                status: 'Active',
                verified: true,
                blockchainHash: userData.blockchainHash
            });
            
            localStorage.setItem('userAccounts', JSON.stringify(existingUsers));
            this.triggerDataUpdate('user_added', userData);
        }
    }

    refreshAdminData() {
        // Refresh admin dashboard data
        if (window.adminDashboard) {
            window.adminDashboard.loadRealWebsiteData();
            window.adminDashboard.updateStats();
            
            // Refresh current tab
            const currentTab = window.adminDashboard.currentTab;
            if (currentTab === 'users') {
                window.adminDashboard.renderUsers();
            } else if (currentTab === 'reviews') {
                window.adminDashboard.renderReviews();
            } else if (currentTab === 'journeys') {
                window.adminDashboard.renderJourneys();
            }
        }
    }

    refreshWebsiteData() {
        // Refresh website community forum and gallery
        if (typeof renderPosts === 'function') {
            renderPosts();
        }
        
        if (typeof loadPublicGallery === 'function') {
            loadPublicGallery();
        }
        
        // Refresh blockchain data if available
        if (window.sikkimJourneyBlockchain) {
            window.sikkimJourneyBlockchain.saveBlockchain();
        }
    }

    broadcastUpdate(key, value) {
        // Broadcast to other tabs/windows
        const updateEvent = new CustomEvent('crossTabUpdate', {
            detail: { key, value, timestamp: Date.now() }
        });
        window.dispatchEvent(updateEvent);
        
        // Also use BroadcastChannel if available
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('sikkim-data-sync');
            channel.postMessage({ key, value, timestamp: Date.now() });
        }
    }

    triggerDataUpdate(type, data) {
        const updateEvent = new CustomEvent('dataUpdated', {
            detail: { type, data, timestamp: Date.now() }
        });
        window.dispatchEvent(updateEvent);
    }

    startPeriodicSync() {
        setInterval(() => {
            this.performPeriodicSync();
        }, this.syncInterval);
    }

    performPeriodicSync() {
        const currentTime = Date.now();
        
        // Only sync if enough time has passed
        if (currentTime - this.lastSyncTime < this.syncInterval) {
            return;
        }
        
        this.lastSyncTime = currentTime;
        
        // Check for data inconsistencies and fix them
        this.validateDataConsistency();
        
        // Save blockchain state
        if (window.sikkimJourneyBlockchain) {
            window.sikkimJourneyBlockchain.saveBlockchain();
        }
    }

    validateDataConsistency() {
        try {
            // Validate community posts structure
            const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
            const validPosts = posts.filter(post => 
                post.id && post.author && post.content && post.timestamp
            );
            
            if (validPosts.length !== posts.length) {
                localStorage.setItem('communityPosts', JSON.stringify(validPosts));
                console.log('Fixed community posts data consistency');
            }
            
            // Validate user accounts
            const users = JSON.parse(localStorage.getItem('userAccounts') || '[]');
            const validUsers = users.filter(user => 
                user.id && user.username && user.email
            );
            
            if (validUsers.length !== users.length) {
                localStorage.setItem('userAccounts', JSON.stringify(validUsers));
                console.log('Fixed user accounts data consistency');
            }
            
            // Validate gallery data
            const gallery = JSON.parse(localStorage.getItem('sikkimPublicGallery') || '[]');
            const validGallery = gallery.filter(item => 
                item.id && (item.imageUrl || item.videoUrl)
            );
            
            if (validGallery.length !== gallery.length) {
                localStorage.setItem('sikkimPublicGallery', JSON.stringify(validGallery));
                console.log('Fixed gallery data consistency');
            }
            
        } catch (error) {
            console.error('Data validation error:', error);
        }
    }

    syncOnVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Page became visible, sync data
                this.performPeriodicSync();
                
                if (this.isAdmin) {
                    this.refreshAdminData();
                } else {
                    this.refreshWebsiteData();
                }
            }
        });
    }

    // Manual sync methods for external use
    forceSyncFromWebsite() {
        if (this.isAdmin) {
            this.refreshAdminData();
            return true;
        }
        return false;
    }

    forceSyncToWebsite() {
        if (!this.isAdmin) {
            this.refreshWebsiteData();
            return true;
        }
        return false;
    }

    // Get sync statistics
    getSyncStats() {
        return {
            lastSyncTime: this.lastSyncTime,
            syncInterval: this.syncInterval,
            isAdmin: this.isAdmin,
            dataKeys: [
                'communityPosts',
                'currentUser', 
                'sikkimPublicGallery',
                'userAccounts',
                'journeyReviews'
            ].map(key => ({
                key,
                size: localStorage.getItem(key)?.length || 0,
                lastModified: this.getLastModified(key)
            }))
        };
    }

    getLastModified(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(data) && data.length > 0) {
                const timestamps = data
                    .map(item => item.timestamp || item.date)
                    .filter(Boolean)
                    .map(ts => new Date(ts).getTime());
                
                return timestamps.length > 0 ? Math.max(...timestamps) : null;
            }
        } catch (error) {
            console.error(`Error getting last modified for ${key}:`, error);
        }
        return null;
    }

    // Export data for backup
    exportAllData() {
        const data = {
            communityPosts: JSON.parse(localStorage.getItem('communityPosts') || '[]'),
            userAccounts: JSON.parse(localStorage.getItem('userAccounts') || '[]'),
            journeyReviews: JSON.parse(localStorage.getItem('journeyReviews') || '[]'),
            publicGallery: JSON.parse(localStorage.getItem('sikkimPublicGallery') || '[]'),
            blockchain: JSON.parse(localStorage.getItem('sikkimJourneyBlockchain') || '[]'),
            exportTime: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return data;
    }

    // Import data from backup
    importAllData(data) {
        try {
            if (data.communityPosts) {
                localStorage.setItem('communityPosts', JSON.stringify(data.communityPosts));
            }
            if (data.userAccounts) {
                localStorage.setItem('userAccounts', JSON.stringify(data.userAccounts));
            }
            if (data.journeyReviews) {
                localStorage.setItem('journeyReviews', JSON.stringify(data.journeyReviews));
            }
            if (data.publicGallery) {
                localStorage.setItem('sikkimPublicGallery', JSON.stringify(data.publicGallery));
            }
            if (data.blockchain) {
                localStorage.setItem('sikkimJourneyBlockchain', JSON.stringify(data.blockchain));
            }
            
            // Trigger refresh
            this.performPeriodicSync();
            
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
}

// Initialize data sync service
let dataSyncService;
document.addEventListener('DOMContentLoaded', function() {
    dataSyncService = new DataSyncService();
    
    // Make it globally available
    window.dataSyncService = dataSyncService;
    
    console.log('Data synchronization service initialized');
});

// Handle cross-tab communication
window.addEventListener('crossTabUpdate', function(e) {
    console.log('Cross-tab update received:', e.detail);
});

// BroadcastChannel support for modern browsers
if (window.BroadcastChannel) {
    const syncChannel = new BroadcastChannel('sikkim-data-sync');
    syncChannel.addEventListener('message', function(e) {
        console.log('Broadcast channel message:', e.data);
        
        if (dataSyncService && e.data.key) {
            dataSyncService.handleDataChange(e.data.key, e.data.value);
        }
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSyncService;
}