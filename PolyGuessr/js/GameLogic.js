/**
 * GameLogic manages the core game mechanics, scoring, and round progression
 */
class GameLogic {
    constructor(sceneManager, uiManager) {
        this.sceneManager = sceneManager;
        this.uiManager = uiManager;
        
        // Game state
        this.currentRound = 1;
        this.totalScore = 0;
        this.roundResults = [];
        this.availableLocations = [...GAME_LOCATIONS];
        this.currentLocation = null;
        this.gameEnded = false;
        
        // Bind methods to preserve context
        this.submitGuess = this.submitGuess.bind(this);
        this.nextRound = this.nextRound.bind(this);
        this.restartGame = this.restartGame.bind(this);
    }
    
    /**
     * Initialize the game
     */
    async init() {
        console.log('Initializing game...');
        await this.startNewRound();
        this.uiManager.hideLoadingScreen();
        console.log('Game initialized successfully');
    }
    
    /**
     * Start a new round
     */
    async startNewRound() {
        if (this.currentRound > GAME_CONFIG.totalRounds) {
            this.endGame();
            return;
        }
        
        console.log(`Starting round ${this.currentRound}`);
        
        // Show loading state
        this.uiManager.showLoadingState();
        
        // Select random location for this round
        this.currentLocation = this.selectRandomLocation();
        
        // Load the 3D scene for this location
        await this.sceneManager.loadLocation(this.currentLocation);
        
        // Generate location options for guessing (including correct answer)
        const locationOptions = this.generateLocationOptions(this.currentLocation);
        
        // Update UI
        this.uiManager.updateScore(this.totalScore, this.currentRound);
        this.uiManager.displayLocationOptions(locationOptions);
        this.uiManager.hideLoadingState();
        
        console.log(`Round ${this.currentRound} started with location: ${this.currentLocation.name}`);
    }
    
    /**
     * Select a random location for the current round
     * @returns {Object} Selected location object
     */
    selectRandomLocation() {
        // If this is the first round or we have locations left, pick randomly
        if (this.availableLocations.length === 0) {
            // Reset available locations if we've used them all
            this.availableLocations = [...GAME_LOCATIONS];
        }
        
        const randomIndex = Math.floor(Math.random() * this.availableLocations.length);
        const selectedLocation = this.availableLocations[randomIndex];
        
        // Remove from available locations to avoid repetition
        this.availableLocations.splice(randomIndex, 1);
        
        return selectedLocation;
    }
    
    /**
     * Generate location options for the player to choose from
     * @param {Object} correctLocation - The correct location for this round
     * @returns {Array} Array of location options including the correct one
     */
    generateLocationOptions(correctLocation) {
        // Get 3 random incorrect locations
        const incorrectLocations = GAME_LOCATIONS
            .filter(location => location.id !== correctLocation.id);
        const randomIncorrect = getRandomElements(incorrectLocations, 3);
        
        // Combine with correct location and shuffle
        const allOptions = [...randomIncorrect, correctLocation];
        return shuffleArray(allOptions);
    }
    
    /**
     * Handle player's guess submission
     * @param {Object} guessedLocation - The location the player guessed
     */
    async submitGuess(guessedLocation) {
        console.log(`Player guessed: ${guessedLocation.name}, Correct answer: ${this.currentLocation.name}`);
        
        // Calculate distance between guess and correct location
        const distance = calculateDistance(
            guessedLocation.coordinates, 
            this.currentLocation.coordinates
        );
        
        // Calculate points earned
        const points = calculateScore(distance);
        
        // Update total score
        this.totalScore += points;
        
        // Store round result
        const roundResult = {
            round: this.currentRound,
            guessedLocation,
            correctLocation: this.currentLocation,
            distance,
            points
        };
        this.roundResults.push(roundResult);
        
        // Display result to player
        this.uiManager.displayResult(roundResult);
        
        console.log(`Round ${this.currentRound} completed. Distance: ${distance.toFixed(1)}, Points: ${points}`);
    }
    
    /**
     * Proceed to the next round
     */
    async nextRound() {
        this.currentRound++;
        
        if (this.currentRound <= GAME_CONFIG.totalRounds) {
            await this.startNewRound();
        } else {
            this.endGame();
        }
    }
    
    /**
     * End the game and show final results
     */
    endGame() {
        console.log('Game ended');
        this.gameEnded = true;
        
        // Calculate final statistics
        const gameStats = this.calculateFinalStats();
        
        // Display final results
        this.uiManager.displayFinalResults(gameStats);
        
        console.log('Final game stats:', gameStats);
    }
    
    /**
     * Calculate final game statistics
     * @returns {Object} Final game statistics
     */
    calculateFinalStats() {
        const totalDistance = this.roundResults.reduce(
            (sum, result) => sum + result.distance, 0
        );
        
        const averageDistance = totalDistance / this.roundResults.length;
        
        return {
            totalScore: this.totalScore,
            averageDistance,
            roundResults: this.roundResults,
            perfectGuesses: this.roundResults.filter(
                result => result.distance <= GAME_CONFIG.distanceThresholds.perfect
            ).length
        };
    }
    
    /**
     * Restart the game
     */
    async restartGame() {
        console.log('Restarting game...');
        
        // Reset game state
        this.currentRound = 1;
        this.totalScore = 0;
        this.roundResults = [];
        this.availableLocations = [...GAME_LOCATIONS];
        this.currentLocation = null;
        this.gameEnded = false;
        
        // Reset UI
        this.uiManager.resetUI();
        
        // Start new game
        await this.startNewRound();
        
        console.log('Game restarted');
    }
    
    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getGameState() {
        return {
            currentRound: this.currentRound,
            totalScore: this.totalScore,
            gameEnded: this.gameEnded,
            currentLocation: this.currentLocation,
            roundResults: this.roundResults
        };
    }
}