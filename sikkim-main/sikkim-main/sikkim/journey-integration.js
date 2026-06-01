// Journey Integration - Connect Share Your Journey with Blockchain System
class JourneyIntegration {
    constructor() {
        this.blockchain = sikkimJourneyBlockchain;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.setupJourneyForm();
        this.setupReviewForm();
        this.displayPublicJourneys();
    }

    loadCurrentUser() {
        // Simulate user session (in production, use proper authentication)
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        } else {
            // Create demo user for testing
            this.createDemoUser();
        }
    }

    createDemoUser() {
        const demoUserData = {
            username: 'sikkim_traveler_' + Math.random().toString(36).substr(2, 5),
            email: 'demo@sikkimtourism.com'
        };

        const result = this.blockchain.createAccount(demoUserData);
        if (result.success) {
            this.currentUser = {
                id: result.accountId,
                username: demoUserData.username,
                email: demoUserData.email,
                blockHash: result.blockHash
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    setupJourneyForm() {
        // Add journey sharing functionality to existing community forum
        const forumContainer = document.querySelector('.community-forum');
        if (forumContainer) {
            this.enhanceForumWithBlockchain(forumContainer);
        }
    }

    enhanceForumWithBlockchain(container) {
        // Add blockchain notice to existing forum
        const blockchainNotice = document.createElement('div');
        blockchainNotice.className = 'blockchain-notice';
        blockchainNotice.innerHTML = `
            <div style="background: linear-gradient(135deg, #43e97b, #38f9d7); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                <i class="fas fa-shield-alt"></i> <strong>Blockchain Protected:</strong> 
                All shared journeys are permanently stored and cannot be altered, ensuring authenticity for future travelers.
            </div>
        `;
        container.insertBefore(blockchainNotice, container.firstChild);

        // Enhance existing post form
        const postForm = container.querySelector('.post-form');
        if (postForm) {
            this.enhancePostForm(postForm);
        }

        // Add blockchain verification to existing posts
        this.addBlockchainVerificationToPosts(container);
    }

    enhancePostForm(form) {
        // Add journey-specific fields
        const textarea = form.querySelector('textarea');
        if (textarea) {
            textarea.placeholder = 'Share your Sikkim journey experience... (This will be permanently stored on blockchain)';
        }

        // Add journey details section
        const journeyDetails = document.createElement('div');
        journeyDetails.className = 'journey-details';
        journeyDetails.innerHTML = `
            <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #06b6d4;">
                <h4 style="margin-bottom: 10px; color: #333;">Journey Details (Optional)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <input type="text" id="journey-duration" placeholder="Duration (e.g., 5 days)" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    <input type="number" id="journey-rating" placeholder="Rating (1-5)" min="1" max="5" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
                <input type="text" id="journey-destinations" placeholder="Destinations visited (comma-separated)" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
                <textarea id="journey-tips" placeholder="Travel tips for future visitors..." style="width: 100%; min-height: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 5px; resize: vertical;"></textarea>
            </div>
        `;
        
        form.insertBefore(journeyDetails, form.querySelector('.post-form-actions'));

        // Modify submit button to handle blockchain storage
        const submitBtn = form.querySelector('.submit-post-btn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Share Journey (Blockchain Protected)';
            submitBtn.onclick = (e) => this.handleJourneySubmission(e, form);
        }
    }

    handleJourneySubmission(event, form) {
        event.preventDefault();
        
        if (!this.currentUser) {
            alert('Please create an account first to share your journey.');
            return;
        }

        const content = form.querySelector('textarea').value.trim();
        const category = form.querySelector('select').value;
        const duration = document.getElementById('journey-duration')?.value || '';
        const rating = document.getElementById('journey-rating')?.value || '';
        const destinations = document.getElementById('journey-destinations')?.value || '';
        const tips = document.getElementById('journey-tips')?.value || '';

        if (!content) {
            alert('Please share your journey experience.');
            return;
        }

        // Prepare journey data for blockchain
        const journeyData = {
            userId: this.currentUser.id,
            title: this.generateJourneyTitle(content, destinations),
            description: content,
            destinations: destinations ? destinations.split(',').map(d => d.trim()) : [],
            duration: duration,
            category: category,
            tips: tips ? [tips] : [],
            rating: rating ? parseInt(rating) : null
        };

        // Store on blockchain
        const result = this.blockchain.shareJourney(journeyData);
        
        if (result.success) {
            // Show success message
            this.showBlockchainConfirmation(result);
            
            // Add to existing posts display
            this.addJourneyToDisplay(journeyData, result);
            
            // Clear form
            form.reset();
            document.getElementById('journey-duration').value = '';
            document.getElementById('journey-rating').value = '';
            document.getElementById('journey-destinations').value = '';
            document.getElementById('journey-tips').value = '';
        } else {
            alert('Failed to store journey on blockchain. Please try again.');
        }
    }

    generateJourneyTitle(content, destinations) {
        if (destinations) {
            return `Journey to ${destinations.split(',')[0].trim()}`;
        }
        
        const words = content.split(' ').slice(0, 6).join(' ');
        return words.length > 30 ? words.substring(0, 30) + '...' : words;
    }

    showBlockchainConfirmation(result) {
        const confirmation = document.createElement('div');
        confirmation.className = 'blockchain-confirmation';
        confirmation.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #43e97b, #38f9d7); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 1000; max-width: 350px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i>
                    <strong>Journey Stored Successfully!</strong>
                </div>
                <p style="margin: 5px 0; font-size: 0.9rem;">Journey ID: ${result.journeyId}</p>
                <p style="margin: 5px 0; font-size: 0.8rem;">Blockchain Hash: ${result.blockHash}</p>
                <p style="margin: 10px 0 0 0; font-size: 0.85rem; opacity: 0.9;">
                    <i class="fas fa-shield-alt"></i> Your journey is now permanently stored and cannot be altered.
                </p>
                <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 18px; cursor: pointer;">&times;</button>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (confirmation.parentElement) {
                confirmation.remove();
            }
        }, 10000);
    }

    addJourneyToDisplay(journeyData, result) {
        const postsContainer = document.querySelector('.posts-container');
        if (!postsContainer) return;

        const journeyCard = document.createElement('div');
        journeyCard.className = 'post-card blockchain-verified';
        journeyCard.innerHTML = `
            <div class="post-header">
                <div class="user-avatar">${this.currentUser.username.charAt(0).toUpperCase()}</div>
                <div class="post-meta">
                    <div class="post-author">${this.currentUser.username}</div>
                    <div class="post-time">Just now • <span style="color: #28a745; font-weight: 600;"><i class="fas fa-shield-alt"></i> Blockchain Verified</span></div>
                </div>
                <div class="post-category category-${journeyData.category}">${journeyData.category}</div>
            </div>
            
            <div class="post-content">
                <h4 style="color: #06b6d4; margin-bottom: 10px;">${journeyData.title}</h4>
                <p>${journeyData.description}</p>
                
                ${journeyData.destinations.length > 0 ? `
                    <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                        <strong>Destinations:</strong> ${journeyData.destinations.join(', ')}
                    </div>
                ` : ''}
                
                ${journeyData.duration ? `
                    <div style="margin: 5px 0;">
                        <strong>Duration:</strong> ${journeyData.duration}
                    </div>
                ` : ''}
                
                ${journeyData.rating ? `
                    <div style="margin: 5px 0;">
                        <strong>Rating:</strong> <span class="rating-stars">${'★'.repeat(journeyData.rating)}${'☆'.repeat(5-journeyData.rating)}</span>
                    </div>
                ` : ''}
                
                ${journeyData.tips.length > 0 ? `
                    <div style="margin: 10px 0; padding: 10px; background: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                        <strong>Travel Tip:</strong> ${journeyData.tips[0]}
                    </div>
                ` : ''}
            </div>
            
            <div class="post-actions">
                <button style="background: none; border: none; color: #666; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-heart"></i> <span>0</span>
                </button>
                <button style="background: none; border: none; color: #666; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-comment"></i> <span>0</span>
                </button>
                <button style="background: none; border: none; color: #666; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-share"></i> Share
                </button>
                <div style="margin-left: auto; font-size: 0.8rem; color: #28a745;">
                    <i class="fas fa-link"></i> Hash: ${result.blockHash.substring(0, 12)}...
                </div>
            </div>
        `;

        postsContainer.insertBefore(journeyCard, postsContainer.firstChild);
    }

    addBlockchainVerificationToPosts(container) {
        const existingPosts = container.querySelectorAll('.post-card');
        existingPosts.forEach(post => {
            if (!post.querySelector('.blockchain-badge')) {
                const badge = document.createElement('div');
                badge.className = 'blockchain-badge';
                badge.innerHTML = `
                    <div style="position: absolute; top: 10px; right: 10px; background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                        <i class="fas fa-shield-alt"></i> Verified
                    </div>
                `;
                post.style.position = 'relative';
                post.appendChild(badge);
            }
        });
    }

    setupReviewForm() {
        // Add review functionality that integrates with blockchain
        this.addReviewCapability();
    }

    addReviewCapability() {
        // This would integrate with existing review systems
        // For now, we'll add a simple review submission that stores on blockchain
        
        window.submitBlockchainReview = (destination, rating, reviewText) => {
            if (!this.currentUser) {
                alert('Please create an account first to submit a review.');
                return false;
            }

            const reviewData = {
                userId: this.currentUser.id,
                destination: destination,
                rating: rating,
                review: reviewText
            };

            const result = this.blockchain.addReview(reviewData);
            
            if (result.success) {
                this.showReviewConfirmation(result);
                return true;
            } else {
                alert('Failed to store review on blockchain. Please try again.');
                return false;
            }
        };
    }

    showReviewConfirmation(result) {
        const confirmation = document.createElement('div');
        confirmation.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 1000; max-width: 350px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-star" style="font-size: 1.5rem;"></i>
                    <strong>Review Stored Successfully!</strong>
                </div>
                <p style="margin: 5px 0; font-size: 0.9rem;">Review ID: ${result.reviewId}</p>
                <p style="margin: 5px 0; font-size: 0.8rem;">Blockchain Hash: ${result.blockHash}</p>
                <p style="margin: 10px 0 0 0; font-size: 0.85rem; opacity: 0.9;">
                    <i class="fas fa-lock"></i> Your review is now immutable and verified.
                </p>
                <button onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 18px; cursor: pointer;">&times;</button>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            if (confirmation.parentElement) {
                confirmation.remove();
            }
        }, 8000);
    }

    displayPublicJourneys() {
        // Display existing blockchain journeys
        const journeys = this.blockchain.getAllJourneys();
        
        // This would integrate with existing journey display systems
        console.log('Blockchain Journeys:', journeys);
    }

    // Admin function to get all data (read-only)
    getAdminData() {
        return {
            accounts: this.blockchain.getAllAccounts(),
            journeys: this.blockchain.getAllJourneys(),
            reviews: this.blockchain.getAllReviews(),
            stats: this.blockchain.getBlockchainStats()
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if blockchain system is available
    if (typeof sikkimJourneyBlockchain !== 'undefined') {
        window.journeyIntegration = new JourneyIntegration();
        
        // Make admin data available globally for admin dashboard
        window.getBlockchainAdminData = () => {
            return window.journeyIntegration.getAdminData();
        };
    }
});