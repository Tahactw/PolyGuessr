/**
 * SceneManager handles all Three.js scene setup, 3D model loading, and rendering
 */
class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.isLoading = false;
        
        this.init();
    }
    
    /**
     * Initialize the Three.js scene, camera, renderer, and controls
     */
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(5, 5, 5);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // Create orbit controls for camera movement
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going below ground
        this.controls.minDistance = 2;
        this.controls.maxDistance = 20;
        
        // Add basic lighting
        this.setupLighting();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Start render loop
        this.animate();
        
        console.log('SceneManager initialized');
    }
    
    /**
     * Set up basic lighting for the scene
     */
    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point light for additional warmth
        const pointLight = new THREE.PointLight(0xffffff, 0.3, 100);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
    }
    
    /**
     * Load a 3D model for the current location
     * @param {Object} location - Location object with model path
     * @returns {Promise} Promise that resolves when model is loaded
     */
    async loadLocation(location) {
        this.isLoading = true;
        
        try {
            // Clear previous model
            this.clearScene();
            
            // Try to load the GLTF model
            if (location.modelPath && location.modelPath.includes('.gltf')) {
                await this.loadGLTFModel(location.modelPath);
            } else {
                // Fallback to procedural generation
                console.log(`Generating fallback scene for ${location.id}`);
                this.generateFallbackScene(location.id);
            }
            
            // Reset camera position
            this.resetCameraPosition();
            
        } catch (error) {
            console.warn(`Failed to load model for ${location.name}:`, error);
            // Generate fallback scene
            this.generateFallbackScene(location.id);
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * Load a GLTF 3D model
     * @param {string} modelPath - Path to the GLTF model
     * @returns {Promise} Promise that resolves when model is loaded
     */
    loadGLTFModel(modelPath) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            
            loader.load(
                modelPath,
                (gltf) => {
                    this.currentModel = gltf.scene;
                    
                    // Configure model
                    this.currentModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            // Ensure materials are properly set up
                            if (child.material) {
                                child.material.needsUpdate = true;
                            }
                        }
                    });
                    
                    // Scale and position the model appropriately
                    this.fitModelToScene(this.currentModel);
                    
                    this.scene.add(this.currentModel);
                    console.log('GLTF model loaded successfully');
                    resolve();
                },
                (progress) => {
                    // Optional: handle loading progress
                    console.log('Loading progress:', progress);
                },
                (error) => {
                    console.error('Error loading GLTF model:', error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Fit the loaded model to the scene by scaling and centering it
     * @param {THREE.Object3D} model - The loaded 3D model
     */
    fitModelToScene(model) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        // Scale model to fit in scene (max dimension should be around 10 units)
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 10;
        const scale = targetSize / maxDimension;
        model.scale.multiplyScalar(scale);
        
        // Center the model
        model.position.sub(center.multiplyScalar(scale));
        model.position.y = 0; // Place on ground
    }
    
    /**
     * Generate a fallback procedural scene when model loading fails
     * @param {string} locationId - ID of the location to generate scene for
     */
    generateFallbackScene(locationId) {
        // Determine scene type based on location ID
        let sceneType = 'forest';
        if (locationId.includes('mountain')) sceneType = 'mountain';
        else if (locationId.includes('desert')) sceneType = 'desert';
        else if (locationId.includes('volcano')) sceneType = 'mountain';
        
        // Use utility function to generate scene
        generateFallbackScene(this.scene, sceneType);
        
        console.log(`Generated fallback ${sceneType} scene for ${locationId}`);
    }
    
    /**
     * Clear all objects from the scene except lights
     */
    clearScene() {
        const objectsToRemove = [];
        
        this.scene.traverse((child) => {
            if (child !== this.scene && !child.isLight) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach((object) => {
            this.scene.remove(object);
            
            // Dispose of geometries and materials to free memory
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.currentModel = null;
    }
    
    /**
     * Reset camera to default position
     */
    resetCameraPosition() {
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Get loading state
     * @returns {boolean} Whether a model is currently loading
     */
    getLoadingState() {
        return this.isLoading;
    }
    
    /**
     * Dispose of Three.js resources
     */
    dispose() {
        if (this.controls) this.controls.dispose();
        if (this.renderer) this.renderer.dispose();
        this.clearScene();
    }
}