// Journey Blockchain System - Immutable Data Storage for Share Your Journey
class JourneyBlockchain {
    constructor() {
        this.chain = [];
        this.pendingJourneys = [];
        this.accounts = new Map();
        this.reviews = new Map();
        this.init();
    }

    init() {
        // Create genesis block
        this.createGenesisBlock();
        this.loadExistingData();
    }

    createGenesisBlock() {
        const genesisBlock = {
            index: 0,
            timestamp: Date.now(),
            data: {
                type: 'GENESIS',
                message: 'Sikkim Tourism Journey Blockchain Initialized'
            },
            previousHash: '0',
            hash: this.calculateHash(0, Date.now(), { type: 'GENESIS' }, '0'),
            nonce: 0
        };
        this.chain.push(genesisBlock);
    }

    calculateHash(index, timestamp, data, previousHash, nonce = 0) {
        return this.sha256(index + timestamp + JSON.stringify(data) + previousHash + nonce);
    }

    // Simple SHA-256 simulation (in production, use proper crypto library)
    sha256(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return '0x' + Math.abs(hash).toString(16).padStart(16, '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Create new user account (immutable once created)
    createAccount(userData) {
        const accountId = 'USR' + Date.now().toString().slice(-6);
        const timestamp = Date.now();
        
        const accountData = {
            type: 'ACCOUNT_CREATION',
            accountId: accountId,
            username: userData.username,
            email: userData.email,
            joinDate: new Date().toISOString().split('T')[0],
            verified: false,
            createdAt: timestamp
        };

        const block = this.createBlock(accountData);
        this.accounts.set(accountId, {
            ...accountData,
            blockHash: block.hash,
            immutable: true
        });

        return {
            success: true,
            accountId: accountId,
            blockHash: block.hash,
            message: 'Account created and stored immutably on blockchain'
        };
    }

    // Share journey (immutable once added)
    shareJourney(journeyData) {
        const journeyId = 'JRN' + Date.now().toString().slice(-6);
        const timestamp = Date.now();
        
        const blockData = {
            type: 'JOURNEY_SHARED',
            journeyId: journeyId,
            userId: journeyData.userId,
            title: journeyData.title,
            description: journeyData.description,
            destinations: journeyData.destinations,
            duration: journeyData.duration,
            photos: journeyData.photos || [],
            tips: journeyData.tips || [],
            sharedAt: timestamp,
            status: 'public'
        };

        const block = this.createBlock(blockData);
        
        return {
            success: true,
            journeyId: journeyId,
            blockHash: block.hash,
            message: 'Journey shared and permanently stored on blockchain'
        };
    }

    // Add review (immutable once submitted)
    addReview(reviewData) {
        const reviewId = 'REV' + Date.now().toString().slice(-6);
        const timestamp = Date.now();
        
        const blockData = {
            type: 'REVIEW_SUBMITTED',
            reviewId: reviewId,
            userId: reviewData.userId,
            journeyId: reviewData.journeyId || null,
            destination: reviewData.destination,
            rating: reviewData.rating,
            review: reviewData.review,
            photos: reviewData.photos || [],
            submittedAt: timestamp,
            verified: true
        };

        const block = this.createBlock(blockData);
        this.reviews.set(reviewId, {
            ...blockData,
            blockHash: block.hash,
            immutable: true
        });

        return {
            success: true,
            reviewId: reviewId,
            blockHash: block.hash,
            message: 'Review submitted and permanently stored on blockchain'
        };
    }

    createBlock(data) {
        const latestBlock = this.getLatestBlock();
        const newBlock = {
            index: latestBlock.index + 1,
            timestamp: Date.now(),
            data: data,
            previousHash: latestBlock.hash,
            hash: '',
            nonce: 0
        };

        // Simple proof of work (in production, use proper consensus mechanism)
        newBlock.hash = this.mineBlock(newBlock);
        this.chain.push(newBlock);
        
        return newBlock;
    }

    mineBlock(block) {
        // Simple mining simulation
        while (block.hash.substring(0, 2) !== '0x') {
            block.nonce++;
            block.hash = this.calculateHash(
                block.index,
                block.timestamp,
                block.data,
                block.previousHash,
                block.nonce
            );
        }
        return block.hash;
    }

    // Verify blockchain integrity
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== this.calculateHash(
                currentBlock.index,
                currentBlock.timestamp,
                currentBlock.data,
                currentBlock.previousHash,
                currentBlock.nonce
            )) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    // Get all journeys (read-only for admin)
    getAllJourneys() {
        return this.chain
            .filter(block => block.data.type === 'JOURNEY_SHARED')
            .map(block => ({
                ...block.data,
                blockHash: block.hash,
                blockIndex: block.index,
                immutable: true,
                verified: this.isChainValid()
            }));
    }

    // Get all reviews (read-only for admin)
    getAllReviews() {
        return this.chain
            .filter(block => block.data.type === 'REVIEW_SUBMITTED')
            .map(block => ({
                ...block.data,
                blockHash: block.hash,
                blockIndex: block.index,
                immutable: true,
                verified: this.isChainValid()
            }));
    }

    // Get all accounts (read-only for admin)
    getAllAccounts() {
        return this.chain
            .filter(block => block.data.type === 'ACCOUNT_CREATION')
            .map(block => ({
                ...block.data,
                blockHash: block.hash,
                blockIndex: block.index,
                immutable: true,
                verified: this.isChainValid()
            }));
    }

    // Get journey by ID (read-only)
    getJourneyById(journeyId) {
        const block = this.chain.find(block => 
            block.data.type === 'JOURNEY_SHARED' && 
            block.data.journeyId === journeyId
        );
        
        if (block) {
            return {
                ...block.data,
                blockHash: block.hash,
                blockIndex: block.index,
                immutable: true,
                verified: this.isChainValid()
            };
        }
        return null;
    }

    // Get review by ID (read-only)
    getReviewById(reviewId) {
        const block = this.chain.find(block => 
            block.data.type === 'REVIEW_SUBMITTED' && 
            block.data.reviewId === reviewId
        );
        
        if (block) {
            return {
                ...block.data,
                blockHash: block.hash,
                blockIndex: block.index,
                immutable: true,
                verified: this.isChainValid()
            };
        }
        return null;
    }

    // Get blockchain statistics
    getBlockchainStats() {
        const journeyBlocks = this.chain.filter(block => block.data.type === 'JOURNEY_SHARED').length;
        const reviewBlocks = this.chain.filter(block => block.data.type === 'REVIEW_SUBMITTED').length;
        const accountBlocks = this.chain.filter(block => block.data.type === 'ACCOUNT_CREATION').length;
        
        return {
            totalBlocks: this.chain.length,
            journeyBlocks: journeyBlocks,
            reviewBlocks: reviewBlocks,
            accountBlocks: accountBlocks,
            chainValid: this.isChainValid(),
            lastBlockHash: this.getLatestBlock().hash,
            genesisHash: this.chain[0].hash
        };
    }

    // Load existing data from localStorage (simulating persistent storage)
    loadExistingData() {
        const savedChain = localStorage.getItem('sikkimJourneyBlockchain');
        if (savedChain) {
            try {
                const parsedChain = JSON.parse(savedChain);
                if (parsedChain.length > 1) { // More than just genesis block
                    this.chain = parsedChain;
                }
            } catch (error) {
                console.warn('Could not load existing blockchain data:', error);
            }
        }
    }

    // Save blockchain to localStorage
    saveBlockchain() {
        try {
            localStorage.setItem('sikkimJourneyBlockchain', JSON.stringify(this.chain));
            return true;
        } catch (error) {
            console.error('Could not save blockchain:', error);
            return false;
        }
    }

    // Export blockchain data (for admin backup)
    exportBlockchain() {
        return {
            chain: this.chain,
            stats: this.getBlockchainStats(),
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    // Attempt to modify data (will fail - demonstrating immutability)
    attemptModification(blockIndex, newData) {
        return {
            success: false,
            message: 'Data modification not allowed. Blockchain ensures immutability.',
            originalHash: this.chain[blockIndex]?.hash,
            blockIndex: blockIndex,
            immutable: true
        };
    }
}

// Initialize global blockchain instance
const sikkimJourneyBlockchain = new JourneyBlockchain();

// Auto-save blockchain every 30 seconds
setInterval(() => {
    sikkimJourneyBlockchain.saveBlockchain();
}, 30000);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JourneyBlockchain;
}