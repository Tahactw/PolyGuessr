// Game locations data
// Each location represents a different 3D scene with its metadata
const GAME_LOCATIONS = [
    {
        id: 'forest_clearing',
        name: 'Enchanted Forest',
        modelPath: 'assets/models/forest.gltf',
        description: 'A mystical forest clearing with ancient trees',
        coordinates: { x: 100, y: 200 }, // Fictional map coordinates
        region: 'Northern Wilderness',
        difficulty: 'easy'
    },
    {
        id: 'mountain_peak',
        name: 'Crystal Mountain',
        modelPath: 'assets/models/mountain.gltf',
        description: 'A towering peak covered in snow and crystals',
        coordinates: { x: 300, y: 100 },
        region: 'Eastern Highlands',
        difficulty: 'medium'
    },
    {
        id: 'desert_oasis',
        name: 'Golden Oasis',
        modelPath: 'assets/models/desert.gltf',
        description: 'A peaceful oasis in the vast desert',
        coordinates: { x: 500, y: 400 },
        region: 'Southern Sands',
        difficulty: 'hard'
    },
    {
        id: 'floating_island',
        name: 'Sky Sanctuary',
        modelPath: 'assets/models/floating_island.gltf',
        description: 'A magical floating island in the clouds',
        coordinates: { x: 200, y: 50 },
        region: 'Celestial Realm',
        difficulty: 'medium'
    },
    {
        id: 'underwater_city',
        name: 'Coral Kingdom',
        modelPath: 'assets/models/underwater.gltf',
        description: 'An ancient underwater civilization',
        coordinates: { x: 400, y: 350 },
        region: 'Deep Ocean',
        difficulty: 'hard'
    },
    {
        id: 'volcano_crater',
        name: 'Fire Peak',
        modelPath: 'assets/models/volcano.gltf',
        description: 'The glowing crater of an active volcano',
        coordinates: { x: 150, y: 300 },
        region: 'Molten Lands',
        difficulty: 'easy'
    }
];

// Game configuration
const GAME_CONFIG = {
    totalRounds: 5,
    maxScore: 1000,
    basePoints: 1000,
    // Distance thresholds for scoring (in fictional map units)
    distanceThresholds: {
        perfect: 25,  // Perfect score
        great: 75,    // Great score
        good: 150,    // Good score
        okay: 300     // Okay score
    }
};