/**
 * Main game initialization and entry point
 */

// Global game instances
let sceneManager;
let uiManager;
let gameLogic;

/**
 * Initialize the game when the page loads
 */
async function initGame() {
    try {
        console.log('Starting PolyGuessr initialization...');
        
        // Initialize Scene Manager
        sceneManager = new SceneManager('scene-container');
        
        // Initialize UI Manager (needs to be created before GameLogic)
        uiManager = new UIManager(); // Will be passed gameLogic reference later
        
        // Initialize Game Logic
        gameLogic = new GameLogic(sceneManager, uiManager);
        
        // Set the game logic reference in UI manager
        uiManager.gameLogic = gameLogic;
        
        // Initialize the game
        await gameLogic.init();
        
        console.log('PolyGuessr initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage('Failed to load the game. Please refresh the page to try again.');
    }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingContent = loadingScreen.querySelector('.loading-content');
    
    loadingContent.innerHTML = `
        <h1>PolyGuessr</h1>
        <p style="color: #ff6b6b; margin: 20px 0;">${message}</p>
        <button onclick="location.reload()" class="btn btn-primary">
            Reload Game
        </button>
    `;
}

/**
 * Handle page visibility changes (pause/resume game)
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // Page is hidden - could pause game logic here if needed
        console.log('Game paused (page hidden)');
    } else {
        // Page is visible again
        console.log('Game resumed (page visible)');
    }
}

/**
 * Handle beforeunload event to clean up resources
 */
function handleBeforeUnload() {
    if (sceneManager) {
        sceneManager.dispose();
    }
}

/**
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // ESC key to restart game
        if (event.key === 'Escape' && gameLogic && !gameLogic.gameEnded) {
            gameLogic.restartGame();
        }
        
        // Space bar to submit guess (if one is selected)
        if (event.key === ' ' && uiManager && uiManager.selectedLocation) {
            event.preventDefault();
            gameLogic.submitGuess(uiManager.selectedLocation);
        }
        
        // Number keys to select location options (1-4)
        if (event.key >= '1' && event.key <= '4') {
            const optionIndex = parseInt(event.key) - 1;
            const locationOptions = document.querySelectorAll('.location-option');
            if (locationOptions[optionIndex]) {
                locationOptions[optionIndex].click();
            }
        }
    });
    
    // Prevent context menu on right click (for better mobile experience)
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
}

/**
 * Check if the browser supports required features
 * @returns {boolean} Whether the browser is compatible
 */
function checkBrowserCompatibility() {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const webglContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!webglContext) {
        showErrorMessage('Your browser does not support WebGL, which is required for this game.');
        return false;
    }
    
    // Check for required JavaScript features
    if (!window.Promise || !window.fetch) {
        showErrorMessage('Your browser is too old to run this game. Please update your browser.');
        return false;
    }
    
    return true;
}

/**
 * Main entry point
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking compatibility...');
    
    // Check browser compatibility
    if (!checkBrowserCompatibility()) {
        return;
    }
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Initialize the game
    initGame();
});

// Export for debugging purposes (if needed)
if (typeof window !== 'undefined') {
    window.PolyGuessr = {
        sceneManager,
        uiManager,
        gameLogic,
        GAME_LOCATIONS,
        GAME_CONFIG
    };
}