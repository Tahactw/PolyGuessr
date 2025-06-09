/**
 * UIManager handles all user interface interactions and updates
 */
class UIManager {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.selectedLocation = null;
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Loading screen
        this.loadingScreen = document.getElementById('loading-screen');
        
        // Score elements
        this.currentScoreElement = document.getElementById('current-score');
        this.currentRoundElement = document.getElementById('current-round');
        
        // Game panels
        this.guessPanel = document.getElementById('guess-panel');
        this.resultPanel = document.getElementById('result-panel');
        this.finalScorePanel = document.getElementById('final-score-panel');
        
        // Location options container
        this.locationOptionsContainer = this.guessPanel.querySelector('.location-options');
        
        // Buttons
        this.submitGuessBtn = document.getElementById('submit-guess');
        this.nextRoundBtn = document.getElementById('next-round');
        this.restartBtn = document.getElementById('restart-btn');
        this.playAgainBtn = document.getElementById('play-again');
        this.shareScoreBtn = document.getElementById('share-score');
        
        // Result elements
        this.resultTitle = document.getElementById('result-title');
        this.resultMessage = document.getElementById('result-message');
        this.distanceResult = document.getElementById('distance-result');
        this.pointsEarned = document.getElementById('points-earned');
        
        // Final score elements
        this.finalScore = document.getElementById('final-score');
        this.averageDistance = document.getElementById('average-distance');
    }
    
    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Submit guess button
        this.submitGuessBtn.addEventListener('click', () => {
            if (this.selectedLocation) {
                this.gameLogic.submitGuess(this.selectedLocation);
            }
        });
        
        // Next round button
        this.nextRoundBtn.addEventListener('click', () => {
            this.gameLogic.nextRound();
        });
        
        // Restart button
        this.restartBtn.addEventListener('click', () => {
            this.gameLogic.restartGame();
        });
        
        // Play again button
        this.playAgainBtn.addEventListener('click', () => {
            this.gameLogic.restartGame();
        });
        
        // Share score button
        this.shareScoreBtn.addEventListener('click', () => {
            this.shareScore();
        });
    }
    
    /**
     * Hide the loading screen
     */
    hideLoadingScreen() {
        this.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
        }, 500);
    }
    
    /**
     * Show the loading screen
     */
    showLoadingScreen() {
        this.loadingScreen.style.display = 'flex';
        this.loadingScreen.style.opacity = '1';
    }
    
    /**
     * Update the score display
     * @param {number} score - Current score
     * @param {number} round - Current round
     */
    updateScore(score, round) {
        this.currentScoreElement.textContent = score;
        this.currentRoundElement.textContent = round;
    }
    
    /**
     * Display location options for guessing
     * @param {Array} locations - Array of location objects to choose from
     */
    displayLocationOptions(locations) {
        // Clear existing options
        this.locationOptionsContainer.innerHTML = '';
        this.selectedLocation = null;
        this.submitGuessBtn.disabled = true;
        
        // Create option buttons
        locations.forEach(location => {
            const optionElement = document.createElement('div');
            optionElement.className = 'location-option';
            optionElement.textContent = location.name;
            optionElement.dataset.locationId = location.id;
            
            // Add click handler
            optionElement.addEventListener('click', () => {
                this.selectLocation(location, optionElement);
            });
            
            this.locationOptionsContainer.appendChild(optionElement);
        });
        
        // Show guess panel
        this.showGuessPanel();
    }
    
    /**
     * Handle location selection
     * @param {Object} location - Selected location object
     * @param {HTMLElement} element - The clicked element
     */
    selectLocation(location, element) {
        // Remove previous selection
        const previousSelection = this.locationOptionsContainer.querySelector('.selected');
        if (previousSelection) {
            previousSelection.classList.remove('selected');
        }
        
        // Add selection to clicked element
        element.classList.add('selected');
        this.selectedLocation = location;
        
        // Enable submit button
        this.submitGuessBtn.disabled = false;
    }
    
    /**
     * Show the guess panel
     */
    showGuessPanel() {
        this.guessPanel.classList.remove('hidden');
        this.resultPanel.classList.add('hidden');
        this.finalScorePanel.classList.add('hidden');
    }
    
    /**
     * Hide the guess panel
     */
    hideGuessPanel() {
        this.guessPanel.classList.add('hidden');
    }
    
    /**
     * Display round result
     * @param {Object} result - Result object with distance, points, etc.
     */
    displayResult(result) {
        // Update result content
        this.resultTitle.textContent = getScoreDescription(result.distance);
        this.resultMessage.textContent = `You guessed "${result.guessedLocation.name}" but it was actually "${result.correctLocation.name}"`;
        this.distanceResult.textContent = formatDistance(result.distance);
        this.pointsEarned.textContent = result.points;
        
        // Hide guess panel and show result panel
        this.hideGuessPanel();
        this.resultPanel.classList.remove('hidden');
    }
    
    /**
     * Display final game results
     * @param {Object} gameStats - Final game statistics
     */
    displayFinalResults(gameStats) {
        // Update final score content
        this.finalScore.textContent = gameStats.totalScore;
        this.averageDistance.textContent = formatDistance(gameStats.averageDistance);
        
        // Hide other panels and show final score panel
        this.hideGuessPanel();
        this.resultPanel.classList.add('hidden');
        this.finalScorePanel.classList.remove('hidden');
    }
    
    /**
     * Reset UI to initial state
     */
    resetUI() {
        this.selectedLocation = null;
        this.submitGuessBtn.disabled = true;
        
        // Hide all panels except guess panel
        this.showGuessPanel();
        this.resultPanel.classList.add('hidden');
        this.finalScorePanel.classList.add('hidden');
        
        // Reset score display
        this.updateScore(0, 1);
    }
    
    /**
     * Share the player's score
     */
    shareScore() {
        const score = this.finalScore.textContent;
        const shareText = `I just scored ${score} points in PolyGuessr! Can you beat my score?`;
        
        // Try to use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'PolyGuessr Score',
                text: shareText,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback to copying to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('Score copied to clipboard!');
                }).catch(() => {
                    this.fallbackShareScore(shareText);
                });
            } else {
                this.fallbackShareScore(shareText);
            }
        }
    }
    
    /**
     * Fallback share method
     * @param {string} shareText - Text to share
     */
    fallbackShareScore(shareText) {
        // Create temporary text area for copying
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            alert('Score copied to clipboard!');
        } catch (err) {
            alert(`Your score: ${shareText}`);
        }
        
        document.body.removeChild(textArea);
    }
    
    /**
     * Show loading state during scene changes
     */
    showLoadingState() {
        this.submitGuessBtn.disabled = true;
        this.submitGuessBtn.textContent = 'Loading...';
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        this.submitGuessBtn.textContent = 'Submit Guess';
        if (this.selectedLocation) {
            this.submitGuessBtn.disabled = false;
        }
    }
}