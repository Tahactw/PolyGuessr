// Utility functions for the game

/**
 * Calculate distance between two points on our fictional map
 * @param {Object} point1 - First point with x, y coordinates
 * @param {Object} point2 - Second point with x, y coordinates
 * @returns {number} Distance in map units
 */
function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate score based on distance
 * @param {number} distance - Distance between guess and actual location
 * @returns {number} Score points earned
 */
function calculateScore(distance) {
    const { perfect, great, good, okay } = GAME_CONFIG.distanceThresholds;
    const basePoints = GAME_CONFIG.basePoints;
    
    if (distance <= perfect) {
        return basePoints;
    } else if (distance <= great) {
        return Math.round(basePoints * 0.8);
    } else if (distance <= good) {
        return Math.round(basePoints * 0.6);
    } else if (distance <= okay) {
        return Math.round(basePoints * 0.4);
    } else {
        return Math.round(basePoints * 0.1);
    }
}

/**
 * Get score description based on distance
 * @param {number} distance - Distance between guess and actual location
 * @returns {string} Description of the performance
 */
function getScoreDescription(distance) {
    const { perfect, great, good, okay } = GAME_CONFIG.distanceThresholds;
    
    if (distance <= perfect) {
        return "Perfect!";
    } else if (distance <= great) {
        return "Great guess!";
    } else if (distance <= good) {
        return "Good job!";
    } else if (distance <= okay) {
        return "Not bad!";
    } else {
        return "Better luck next time!";
    }
}

/**
 * Shuffle an array randomly
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get random elements from an array
 * @param {Array} array - Source array
 * @param {number} count - Number of elements to get
 * @returns {Array} Array of random elements
 */
function getRandomElements(array, count) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, count);
}

/**
 * Format distance for display
 * @param {number} distance - Distance in map units
 * @returns {string} Formatted distance string
 */
function formatDistance(distance) {
    return `${Math.round(distance)} km`;
}

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate a simple low-poly geometric scene as fallback
 * @param {THREE.Scene} scene - Three.js scene
 * @param {string} type - Type of scene to generate
 */
function generateFallbackScene(scene, type = 'forest') {
    // Clear existing objects
    while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    
    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    // Generate different scenes based on type
    switch(type) {
        case 'forest':
            generateForestScene(scene);
            break;
        case 'mountain':
            generateMountainScene(scene);
            break;
        case 'desert':
            generateDesertScene(scene);
            break;
        default:
            generateForestScene(scene);
    }
}

/**
 * Generate a simple forest scene with geometric trees
 */
function generateForestScene(scene) {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4a5d23 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    // Trees
    for (let i = 0; i < 15; i++) {
        const tree = createLowPolyTree();
        tree.position.x = (Math.random() - 0.5) * 18;
        tree.position.z = (Math.random() - 0.5) * 18;
        tree.position.y = 0;
        scene.add(tree);
    }
}

/**
 * Create a simple low-poly tree
 */
function createLowPolyTree() {
    const treeGroup = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    treeGroup.add(trunk);
    
    // Leaves
    const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3;
    treeGroup.add(leaves);
    
    return treeGroup;
}

/**
 * Generate a simple mountain scene
 */
function generateMountainScene(scene) {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    // Mountains
    for (let i = 0; i < 5; i++) {
        const mountainGeometry = new THREE.ConeGeometry(
            Math.random() * 3 + 2, 
            Math.random() * 5 + 3, 
            8
        );
        const mountainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x696969 
        });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.x = (Math.random() - 0.5) * 25;
        mountain.position.z = (Math.random() - 0.5) * 25;
        mountain.position.y = mountain.geometry.parameters.height / 2;
        scene.add(mountain);
    }
}

/**
 * Generate a simple desert scene
 */
function generateDesertScene(scene) {
    // Sand ground
    const groundGeometry = new THREE.PlaneGeometry(25, 25);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xF4A460 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    // Sand dunes
    for (let i = 0; i < 8; i++) {
        const duneGeometry = new THREE.SphereGeometry(
            Math.random() * 2 + 1, 
            8, 
            4
        );
        const duneMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xDEB887 
        });
        const dune = new THREE.Mesh(duneGeometry, duneMaterial);
        dune.position.x = (Math.random() - 0.5) * 20;
        dune.position.z = (Math.random() - 0.5) * 20;
        dune.position.y = -0.5;
        dune.scale.y = 0.3;
        scene.add(dune);
    }
    
    // Cactus
    const cactusGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const cactusMaterial = new THREE.MeshLambertMaterial({ color: 0x006400 });
    const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
    cactus.position.set(3, 1, 2);
    scene.add(cactus);
}