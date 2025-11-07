// Game State
let gameState = {
    player: {
        level: 1,
        exp: 0,
        expToNext: 100,
        health: 100,
        maxHealth: 100,
        energy: 100,
        maxEnergy: 100,
        money: 1000,
        faction: null,
        currentFruit: null,
        inventory: [],
        masteries: {}, // fruitId: { level: 1, exp: 0, expToNext: 100 }
        equippedMoves: [null, null, null, null], // 4 move slots (Z, X, C, V)
        position: { x: 0, y: 0, z: 0 },
        rotation: 0,
        velocity: { x: 0, z: 0 },
        currentIsland: 'starter',
        isAttacking: false,
        attackCooldown: 0,
        currentQuest: null,
        stats: {
            melee: 1,
            defense: 1,
            sword: 1,
            gun: 1,
            fruitMastery: 1
        }
    },
    camera: {
        distance: 20,
        height: 10,
        angle: 0
    },
    keys: {},
    enemies: [],
    projectiles: [],
    damageNumbers: [],
    islands: {
        starter: { name: 'Starter Island', level: 1, unlocked: true },
        jungle: { name: 'Jungle Island', level: 15, unlocked: true },
        desert: { name: 'Desert Island', level: 30, unlocked: true },
        sky: { name: 'Sky Island', level: 700, unlocked: false },
        ice: { name: 'Ice Island', level: 850, unlocked: false },
        tiki: { name: 'Tiki Island', level: 1500, unlocked: false },
        mansion: { name: 'Mansion Island', level: 1750, unlocked: false }
    }
};

// Enemy types based on island
const enemyTypes = {
    starter: [
        { name: 'Bandit', level: 1, health: 50, damage: 5, exp: 15, money: 25, color: 0x8B4513 },
        { name: 'Thug', level: 3, health: 75, damage: 8, exp: 25, money: 40, color: 0x654321 }
    ],
    jungle: [
        { name: 'Gorilla Warrior', level: 15, health: 200, damage: 20, exp: 100, money: 150, color: 0x2F4F2F },
        { name: 'Jungle Bandit', level: 18, health: 250, damage: 25, exp: 120, money: 180, color: 0x556B2F }
    ],
    desert: [
        { name: 'Desert Bandit', level: 30, health: 400, damage: 40, exp: 200, money: 300, color: 0xD2691E },
        { name: 'Sand Warrior', level: 35, health: 500, damage: 50, exp: 250, money: 400, color: 0xF4A460 }
    ]
};

// Quest system
const quests = {
    starter: [
        { name: 'Defeat 5 Bandits', target: 'Bandit', count: 5, reward: { exp: 100, money: 200 } },
        { name: 'Defeat 10 Thugs', target: 'Thug', count: 10, reward: { exp: 300, money: 500 } }
    ],
    jungle: [
        { name: 'Defeat 8 Gorilla Warriors', target: 'Gorilla Warrior', count: 8, reward: { exp: 1000, money: 1500 } }
    ],
    desert: [
        { name: 'Defeat 10 Desert Bandits', target: 'Desert Bandit', count: 10, reward: { exp: 2500, money: 3000 } }
    ]
};

// Fruit Database with detailed moves
const fruits = [
    {
        id: 'flame',
        name: 'Flame Fruit',
        icon: '🔥',
        price: 2500,
        type: 'Logia',
        description: 'Control fire and become immune to physical attacks',
        moves: [
            { name: 'Fire Fist', key: 'Z', damage: 25, cooldown: 30, energyCost: 15, masteryRequired: 1, description: 'Launch a flaming fist' },
            { name: 'Fire Pillar', key: 'X', damage: 40, cooldown: 60, energyCost: 25, masteryRequired: 10, description: 'Create pillars of fire' },
            { name: 'Burning Path', key: 'C', damage: 60, cooldown: 90, energyCost: 35, masteryRequired: 50, description: 'Leave a trail of flames' },
            { name: 'Flame Emperor', key: 'V', damage: 100, cooldown: 120, energyCost: 50, masteryRequired: 100, description: 'Ultimate fire attack' }
        ]
    },
    {
        id: 'ice',
        name: 'Ice Fruit',
        icon: '❄️',
        price: 3500,
        type: 'Logia',
        description: 'Freeze enemies and create ice structures',
        moves: [
            { name: 'Ice Spear', key: 'Z', damage: 30, cooldown: 30, energyCost: 15, masteryRequired: 1, description: 'Shoot ice spears' },
            { name: 'Frozen Time', key: 'X', damage: 45, cooldown: 60, energyCost: 25, masteryRequired: 10, description: 'Freeze time briefly' },
            { name: 'Ice Age', key: 'C', damage: 70, cooldown: 90, energyCost: 35, masteryRequired: 50, description: 'Freeze everything around' },
            { name: 'Absolute Zero', key: 'V', damage: 110, cooldown: 120, energyCost: 50, masteryRequired: 100, description: 'Ultimate ice attack' }
        ]
    },
    {
        id: 'light',
        name: 'Light Fruit',
        icon: '💡',
        price: 15000,
        type: 'Logia',
        description: 'Move at light speed and shoot laser beams',
        moves: [
            { name: 'Light Kick', key: 'Z', damage: 35, cooldown: 25, energyCost: 20, masteryRequired: 1, description: 'Kick at light speed' },
            { name: 'Laser Beam', key: 'X', damage: 50, cooldown: 50, energyCost: 30, masteryRequired: 10, description: 'Fire laser beams' },
            { name: 'Light Speed', key: 'C', damage: 80, cooldown: 80, energyCost: 40, masteryRequired: 50, description: 'Teleport and attack' },
            { name: 'Sacred Light', key: 'V', damage: 120, cooldown: 120, energyCost: 60, masteryRequired: 100, description: 'Ultimate light attack' }
        ]
    },
    {
        id: 'rubber',
        name: 'Rubber Fruit',
        icon: '🎈',
        price: 1200,
        type: 'Paramecia',
        description: 'Stretch your body like rubber, immune to electricity',
        moves: [
            { name: 'Gum Pistol', key: 'Z', damage: 20, cooldown: 20, energyCost: 10, masteryRequired: 1, description: 'Stretch punch' },
            { name: 'Gum Rocket', key: 'X', damage: 35, cooldown: 50, energyCost: 20, masteryRequired: 10, description: 'Launch yourself' },
            { name: 'Gear Second', key: 'C', damage: 55, cooldown: 80, energyCost: 30, masteryRequired: 50, description: 'Speed boost mode' },
            { name: 'Gear Third', key: 'V', damage: 90, cooldown: 110, energyCost: 45, masteryRequired: 100, description: 'Giant fist attack' }
        ]
    },
    {
        id: 'barrier',
        name: 'Barrier Fruit',
        icon: '🛡️',
        price: 8000,
        type: 'Paramecia',
        description: 'Create indestructible barriers for defense',
        moves: [
            { name: 'Barrier Wall', key: 'Z', damage: 15, cooldown: 40, energyCost: 15, masteryRequired: 1, description: 'Create a barrier wall' },
            { name: 'Barrier Crash', key: 'X', damage: 40, cooldown: 60, energyCost: 25, masteryRequired: 10, description: 'Crash with barrier' },
            { name: 'Full Barrier', key: 'C', damage: 60, cooldown: 90, energyCost: 35, masteryRequired: 50, description: 'Full body barrier' },
            { name: 'Barrier Ball', key: 'V', damage: 95, cooldown: 120, energyCost: 50, masteryRequired: 100, description: 'Giant barrier sphere' }
        ]
    },
    {
        id: 'gravity',
        name: 'Gravity Fruit',
        icon: '🌌',
        price: 25000,
        type: 'Paramecia',
        description: 'Control gravitational forces',
        moves: [
            { name: 'Gravity Push', key: 'Z', damage: 30, cooldown: 35, energyCost: 20, masteryRequired: 1, description: 'Push with gravity' },
            { name: 'Gravity Pull', key: 'X', damage: 45, cooldown: 65, energyCost: 30, masteryRequired: 10, description: 'Pull enemies in' },
            { name: 'Meteor Rain', key: 'C', damage: 75, cooldown: 95, energyCost: 40, masteryRequired: 50, description: 'Rain meteors down' },
            { name: 'Black Hole', key: 'V', damage: 115, cooldown: 130, energyCost: 55, masteryRequired: 100, description: 'Create black hole' }
        ]
    },
    {
        id: 'phoenix',
        name: 'Phoenix Fruit',
        icon: '🔥🦅',
        price: 18000,
        type: 'Mythical Zoan',
        description: 'Transform into a phoenix with healing flames',
        moves: [
            { name: 'Phoenix Form', key: 'Z', damage: 25, cooldown: 30, energyCost: 20, masteryRequired: 1, description: 'Transform partially' },
            { name: 'Healing Fire', key: 'X', damage: 0, cooldown: 70, energyCost: 30, masteryRequired: 10, description: 'Heal yourself' },
            { name: 'Phoenix Dive', key: 'C', damage: 70, cooldown: 90, energyCost: 40, masteryRequired: 50, description: 'Dive attack' },
            { name: 'Rebirth', key: 'V', damage: 105, cooldown: 140, energyCost: 60, masteryRequired: 100, description: 'Full phoenix form' }
        ]
    },
    {
        id: 'dragon',
        name: 'Dragon Fruit',
        icon: '🐉',
        price: 35000,
        type: 'Mythical Zoan',
        description: 'Transform into a mighty dragon',
        moves: [
            { name: 'Dragon Form', key: 'Z', damage: 35, cooldown: 30, energyCost: 25, masteryRequired: 1, description: 'Partial transformation' },
            { name: 'Fire Breath', key: 'X', damage: 55, cooldown: 60, energyCost: 35, masteryRequired: 10, description: 'Breathe fire' },
            { name: 'Wind Scythe', key: 'C', damage: 85, cooldown: 90, energyCost: 45, masteryRequired: 50, description: 'Wind blade attack' },
            { name: 'Dragon Roar', key: 'V', damage: 125, cooldown: 130, energyCost: 65, masteryRequired: 100, description: 'Ultimate roar' }
        ]
    }
];

// Three.js variables
let scene, camera, renderer, player, playerMesh;
let animationId;
let enemySpawnTimer = 0;

// Initialize game
function initGame() {
    console.log('Initializing Three.js...');
    
    // Initialize Three.js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);

    // Setup renderer
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        throw new Error('Canvas element not found!');
    }
    
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    console.log('Renderer created:', renderer.domElement.width, 'x', renderer.domElement.height);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    console.log('Creating world...');
    
    // Create ocean
    createOcean();

    // Create island
    createIsland();

    // Don't create player yet - wait for faction selection
    // createPlayer();

    // Don't spawn enemies yet - wait for faction selection
    // spawnEnemies();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Initialize shop
    populateShop();

    // Start game loop
    gameLoop();
    
    console.log('Game loop started');
}

// Spawn enemies
function spawnEnemies() {
    const island = gameState.player.currentIsland;
    const enemyList = enemyTypes[island] || enemyTypes.starter;

    // Spawn 5-8 enemies
    const count = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
        const enemyType = enemyList[Math.floor(Math.random() * enemyList.length)];
        spawnEnemy(enemyType);
    }
}

function spawnEnemy(type) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 15;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const enemy = {
        type: type.name,
        level: type.level,
        health: type.health,
        maxHealth: type.health,
        damage: type.damage,
        exp: type.exp,
        money: type.money,
        position: { x, y: 3, z },
        rotation: 0,
        mesh: null,
        isDead: false,
        attackCooldown: 0,
        moveTimer: 0,
        targetPosition: { x, z }
    };

    // Create enemy mesh
    const enemyGroup = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: type.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    enemyGroup.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    enemyGroup.add(head);

    // Health bar background
    const healthBarBg = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    healthBarBg.position.y = 3.5;
    enemyGroup.add(healthBarBg);

    // Health bar fill
    const healthBarFill = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.15),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    healthBarFill.position.y = 3.5;
    healthBarFill.position.z = 0.01;
    enemyGroup.add(healthBarFill);

    enemy.healthBar = healthBarFill;

    enemyGroup.position.set(x, 3, z);
    scene.add(enemyGroup);
    enemy.mesh = enemyGroup;

    gameState.enemies.push(enemy);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Faction selection
function selectFaction(faction) {
    console.log('Faction selected:', faction);
    gameState.player.faction = faction;
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');

    // Recreate player with faction color
    if (playerMesh) {
        scene.remove(playerMesh);
    }
    createPlayer();
    
    // Spawn enemies
    spawnEnemies();

    updateHUD();
    console.log('Game started! Canvas size:', renderer.domElement.width, 'x', renderer.domElement.height);
}

// Create 3D Ocean
function createOcean() {
    const oceanGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);
    const oceanMaterial = new THREE.MeshStandardMaterial({
        color: 0x006994,
        roughness: 0.3,
        metalness: 0.1
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.5;
    ocean.receiveShadow = true;
    scene.add(ocean);

    // Animate ocean waves
    const vertices = oceanGeometry.attributes.position;
    ocean.userData.update = () => {
        const time = Date.now() * 0.001;
        for (let i = 0; i < vertices.count; i++) {
            const x = vertices.getX(i);
            const z = vertices.getZ(i);
            const wave = Math.sin(x * 0.1 + time) * 0.3 + Math.cos(z * 0.1 + time * 0.7) * 0.3;
            vertices.setY(i, wave);
        }
        vertices.needsUpdate = true;
    };

    return ocean;
}

// Create 3D Island
function createIsland() {
    const islandGroup = new THREE.Group();

    // Island base (sand/dirt)
    const baseGeometry = new THREE.CylinderGeometry(30, 35, 5, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xC2B280 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0;
    base.castShadow = true;
    base.receiveShadow = true;
    islandGroup.add(base);

    // Grass layer
    const grassGeometry = new THREE.CylinderGeometry(29, 30, 1, 32);
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.y = 2.5;
    grass.castShadow = true;
    grass.receiveShadow = true;
    islandGroup.add(grass);

    // Add trees
    for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 10 + Math.random() * 15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const tree = createTree();
        tree.position.set(x, 3, z);
        islandGroup.add(tree);
    }

    // Add rocks
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const rock = createRock();
        rock.position.set(x, 3, z);
        islandGroup.add(rock);
    }

    scene.add(islandGroup);
    return islandGroup;
}

function createTree() {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    tree.add(trunk);

    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3;
    leaves.castShadow = true;
    tree.add(leaves);

    return tree;
}

function createRock() {
    const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
}

// Create 3D Player
function createPlayer() {
    player = new THREE.Group();

    const color = gameState.player.faction === 'pirate' ? 0xFF4444 : 0x4444FF;

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    player.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    player.add(head);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.65, 1, 0);
    leftArm.castShadow = true;
    player.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.65, 1, 0);
    rightArm.castShadow = true;
    player.add(rightArm);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.4, 1, 0.4);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, 0.2, 0);
    leftLeg.castShadow = true;
    player.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, 0.2, 0);
    rightLeg.castShadow = true;
    player.add(rightLeg);

    player.position.set(0, 3, 0);
    scene.add(player);
    playerMesh = player;
}

// Game loop
function gameLoop() {
    update();
    render();
    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    // Always update ocean animation
    scene.children.forEach(child => {
        if (child.userData.update) {
            child.userData.update();
        }
    });
    
    // Always update camera
    updateCamera();
    
    // Only update game logic if faction is selected
    if (!gameState.player.faction) return;

    // Update player movement
    updatePlayerMovement();

    // Update enemies
    updateEnemies();

    // Update projectiles
    updateProjectiles();

    // Update damage numbers
    updateDamageNumbers();

    // Spawn more enemies if needed
    enemySpawnTimer++;
    if (enemySpawnTimer > 600 && gameState.enemies.length < 10) { // Every 10 seconds
        const island = gameState.player.currentIsland;
        const enemyList = enemyTypes[island] || enemyTypes.starter;
        const enemyType = enemyList[Math.floor(Math.random() * enemyList.length)];
        spawnEnemy(enemyType);
        enemySpawnTimer = 0;
    }

    // Update attack cooldown
    if (gameState.player.attackCooldown > 0) {
        gameState.player.attackCooldown--;
    }

    updateIslandUnlocks();
}

function updatePlayerMovement() {
    const speed = 0.15;

    let moveX = 0;
    let moveZ = 0;

    // WASD movement relative to camera
    if (gameState.keys['w'] || gameState.keys['W'] || gameState.keys['ArrowUp']) {
        moveZ = -1;
    }
    if (gameState.keys['s'] || gameState.keys['S'] || gameState.keys['ArrowDown']) {
        moveZ = 1;
    }
    if (gameState.keys['a'] || gameState.keys['A'] || gameState.keys['ArrowLeft']) {
        moveX = -1;
    }
    if (gameState.keys['d'] || gameState.keys['D'] || gameState.keys['ArrowRight']) {
        moveX = 1;
    }

    // Apply movement relative to camera angle
    if (moveX !== 0 || moveZ !== 0) {
        // Normalize movement vector
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX /= length;
        moveZ /= length;

        // Apply camera rotation to movement
        const cameraAngle = gameState.camera.angle;
        const rotatedX = moveX * Math.cos(cameraAngle) - moveZ * Math.sin(cameraAngle);
        const rotatedZ = moveX * Math.sin(cameraAngle) + moveZ * Math.cos(cameraAngle);

        gameState.player.position.x += rotatedX * speed;
        gameState.player.position.z += rotatedZ * speed;

        // Rotate player to face movement direction
        gameState.player.rotation = Math.atan2(rotatedX, rotatedZ);

        // Keep player on island (simple boundary)
        const distFromCenter = Math.sqrt(
            gameState.player.position.x ** 2 +
            gameState.player.position.z ** 2
        );
        if (distFromCenter > 25) {
            const normalizeAngle = Math.atan2(gameState.player.position.x, gameState.player.position.z);
            gameState.player.position.x = Math.sin(normalizeAngle) * 25;
            gameState.player.position.z = Math.cos(normalizeAngle) * 25;
        }
    }

    // Update player mesh position
    if (playerMesh) {
        playerMesh.position.x = gameState.player.position.x;
        playerMesh.position.z = gameState.player.position.z;
        playerMesh.rotation.y = gameState.player.rotation;
    }

    // Regenerate energy
    if (gameState.player.energy < gameState.player.maxEnergy) {
        gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + 0.1);
    }
}

function updateCamera() {
    if (!playerMesh) {
        // If no player yet, just look at center of island
        camera.position.set(0, 15, 25);
        camera.lookAt(0, 3, 0);
        return;
    }
    
    // Camera follows player with offset
    const offset = {
        x: Math.sin(gameState.camera.angle) * gameState.camera.distance,
        y: gameState.camera.height,
        z: Math.cos(gameState.camera.angle) * gameState.camera.distance
    };

    camera.position.x = gameState.player.position.x + offset.x;
    camera.position.y = gameState.player.position.y + offset.y;
    camera.position.z = gameState.player.position.z + offset.z;

    // Look at player
    camera.lookAt(
        gameState.player.position.x,
        gameState.player.position.y + 2,
        gameState.player.position.z
    );
}

function render() {
    renderer.render(scene, camera);
}

// Enemy AI and updates
function updateEnemies() {
    gameState.enemies.forEach((enemy, index) => {
        if (enemy.isDead) {
            // Remove dead enemy after delay
            if (enemy.deathTimer) {
                enemy.deathTimer--;
                if (enemy.deathTimer <= 0) {
                    scene.remove(enemy.mesh);
                    gameState.enemies.splice(index, 1);
                }
            }
            return;
        }

        // Calculate distance to player
        const dx = gameState.player.position.x - enemy.position.x;
        const dz = gameState.player.position.z - enemy.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Move towards player if close enough
        if (distance < 20) {
            const speed = 0.05;
            const angle = Math.atan2(dx, dz);

            if (distance > 2) {
                enemy.position.x += Math.sin(angle) * speed;
                enemy.position.z += Math.cos(angle) * speed;
                enemy.rotation = angle;
            }

            // Attack player if in range
            if (distance < 2.5 && enemy.attackCooldown <= 0) {
                attackPlayer(enemy);
                enemy.attackCooldown = 60; // 1 second cooldown
            }
        } else {
            // Random wandering
            enemy.moveTimer--;
            if (enemy.moveTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 5;
                enemy.targetPosition.x = enemy.position.x + Math.cos(angle) * radius;
                enemy.targetPosition.z = enemy.position.z + Math.sin(angle) * radius;
                enemy.moveTimer = 120;
            }

            const tdx = enemy.targetPosition.x - enemy.position.x;
            const tdz = enemy.targetPosition.z - enemy.position.z;
            const tdist = Math.sqrt(tdx * tdx + tdz * tdz);

            if (tdist > 0.5) {
                const speed = 0.03;
                const angle = Math.atan2(tdx, tdz);
                enemy.position.x += Math.sin(angle) * speed;
                enemy.position.z += Math.cos(angle) * speed;
                enemy.rotation = angle;
            }
        }

        // Update enemy mesh
        if (enemy.mesh) {
            enemy.mesh.position.x = enemy.position.x;
            enemy.mesh.position.z = enemy.position.z;
            enemy.mesh.rotation.y = enemy.rotation;

            // Update health bar
            const healthPercent = enemy.health / enemy.maxHealth;
            enemy.healthBar.scale.x = healthPercent;
            enemy.healthBar.position.x = -(1.5 * (1 - healthPercent)) / 2;

            // Health bar color
            if (healthPercent > 0.5) {
                enemy.healthBar.material.color.setHex(0x00ff00);
            } else if (healthPercent > 0.25) {
                enemy.healthBar.material.color.setHex(0xffff00);
            } else {
                enemy.healthBar.material.color.setHex(0xff0000);
            }

            // Make health bar face camera
            enemy.healthBar.parent.children.forEach(child => {
                if (child.geometry && child.geometry.type === 'PlaneGeometry') {
                    child.lookAt(camera.position);
                }
            });
        }

        // Update attack cooldown
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        }
    });
}

function attackPlayer(enemy) {
    gameState.player.health -= enemy.damage;
    if (gameState.player.health < 0) gameState.player.health = 0;

    showDamageNumber(gameState.player.position, enemy.damage, 0xff0000);
    updateHUD();

    if (gameState.player.health <= 0) {
        playerDeath();
    }
}

function playerDeath() {
    alert('You died! Respawning...');
    gameState.player.health = gameState.player.maxHealth;
    gameState.player.position = { x: 0, y: 0, z: 0 };
    updateHUD();
}

// Combat system
function playerAttack(moveSlot = 0) {
    if (gameState.player.attackCooldown > 0) return;

    const fruit = fruits.find(f => f.id === gameState.player.currentFruit);

    if (fruit && fruit.moves[moveSlot]) {
        const move = fruit.moves[moveSlot];
        const mastery = gameState.player.masteries[fruit.id] || { level: 1, exp: 0, expToNext: 100 };

        // Check mastery requirement
        if (mastery.level < move.masteryRequired) {
            showFloatingText(`Need Mastery ${move.masteryRequired}!`, 0xff0000);
            return;
        }

        // Check energy cost
        if (gameState.player.energy < move.energyCost) {
            showFloatingText('Not enough energy!', 0xff0000);
            return;
        }

        // Use move
        gameState.player.energy -= move.energyCost;
        gameState.player.attackCooldown = move.cooldown;
        useFruitMove(fruit, move);

        // Gain mastery exp
        gainMasteryExp(fruit.id, 5);
    } else {
        // Melee attack
        if (gameState.player.attackCooldown > 0) return;
        gameState.player.attackCooldown = 30;
        meleeAttack();
    }

    updateHUD();
}

function useFruitMove(fruit, move) {
    gameState.player.isAttacking = true;

    // Special case for healing move
    if (move.name === 'Healing Fire') {
        const healAmount = 50 + gameState.player.level * 2;
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + healAmount);
        showFloatingText(`+${healAmount} HP`, 0x00ff00);
        updateHUD();
    } else {
        // Create projectile
        createProjectile(fruit, move);
    }

    setTimeout(() => {
        gameState.player.isAttacking = false;
    }, 200);
}

function gainMasteryExp(fruitId, amount) {
    if (!gameState.player.masteries[fruitId]) {
        gameState.player.masteries[fruitId] = { level: 1, exp: 0, expToNext: 100 };
    }

    const mastery = gameState.player.masteries[fruitId];
    mastery.exp += amount;

    while (mastery.exp >= mastery.expToNext && mastery.level < 150) {
        mastery.exp -= mastery.expToNext;
        mastery.level++;
        mastery.expToNext = Math.floor(mastery.expToNext * 1.15);

        const fruit = fruits.find(f => f.id === fruitId);
        showFloatingText(`${fruit.name} Mastery ${mastery.level}!`, 0xffd700);
    }
}

function showFloatingText(text, color) {
    const floatingText = {
        text: text,
        position: { x: gameState.player.position.x, y: gameState.player.position.y + 3, z: gameState.player.position.z },
        color: color,
        lifetime: 60,
        velocity: { y: 0.05 }
    };
    gameState.damageNumbers.push(floatingText);
}

function meleeAttack() {
    const attackRange = 3;
    const damage = 10 + gameState.player.level * 2;

    gameState.enemies.forEach(enemy => {
        if (enemy.isDead) return;

        const dx = enemy.position.x - gameState.player.position.x;
        const dz = enemy.position.z - gameState.player.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < attackRange) {
            damageEnemy(enemy, damage);
        }
    });
}

function createProjectile(fruit, move) {
    const mastery = gameState.player.masteries[fruit.id] || { level: 1 };
    const masteryBonus = 1 + (mastery.level * 0.01); // 1% damage per mastery level

    const projectile = {
        position: {
            x: gameState.player.position.x,
            y: gameState.player.position.y + 2,
            z: gameState.player.position.z
        },
        velocity: {
            x: Math.sin(gameState.player.rotation) * 0.5,
            z: Math.cos(gameState.player.rotation) * 0.5
        },
        damage: Math.floor(move.damage * masteryBonus),
        lifetime: 120,
        mesh: null,
        fruit: fruit.id,
        moveName: move.name
    };

    // Create projectile mesh based on fruit
    let geometry, material, scale = 1;

    switch (fruit.id) {
        case 'flame':
            geometry = new THREE.SphereGeometry(0.3, 8, 8);
            material = new THREE.MeshBasicMaterial({ color: 0xff4500, emissive: 0xff4500 });
            if (move.key === 'V') scale = 2; // Ultimate move bigger
            break;
        case 'ice':
            geometry = new THREE.ConeGeometry(0.3, 0.8, 6);
            material = new THREE.MeshBasicMaterial({ color: 0x00ffff, emissive: 0x00ffff });
            if (move.key === 'V') scale = 2;
            break;
        case 'light':
            geometry = new THREE.SphereGeometry(0.2, 8, 8);
            material = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 });
            projectile.velocity.x *= 2;
            projectile.velocity.z *= 2;
            if (move.key === 'V') scale = 1.5;
            break;
        case 'rubber':
            geometry = new THREE.SphereGeometry(0.4, 8, 8);
            material = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
            if (move.key === 'V') scale = 2.5;
            break;
        case 'dragon':
            geometry = new THREE.SphereGeometry(0.4, 8, 8);
            material = new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0xff0000 });
            if (move.key === 'V') scale = 3;
            break;
        case 'gravity':
            geometry = new THREE.SphereGeometry(0.35, 8, 8);
            material = new THREE.MeshBasicMaterial({ color: 0x9400d3, emissive: 0x9400d3 });
            if (move.key === 'V') scale = 2.5;
            break;
        case 'phoenix':
            geometry = new THREE.SphereGeometry(0.35, 8, 8);
            material = new THREE.MeshBasicMaterial({ color: 0xffa500, emissive: 0xffa500 });
            if (move.key === 'V') scale = 2;
            break;
        case 'barrier':
            geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 });
            if (move.key === 'V') scale = 2;
            break;
        default:
            geometry = new THREE.SphereGeometry(0.3, 8, 8);
            material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(projectile.position.x, projectile.position.y, projectile.position.z);
    scene.add(mesh);
    projectile.mesh = mesh;

    gameState.projectiles.push(projectile);
}

function updateProjectiles() {
    gameState.projectiles.forEach((projectile, index) => {
        projectile.lifetime--;

        if (projectile.lifetime <= 0) {
            scene.remove(projectile.mesh);
            gameState.projectiles.splice(index, 1);
            return;
        }

        // Move projectile
        projectile.position.x += projectile.velocity.x;
        projectile.position.z += projectile.velocity.z;
        projectile.mesh.position.set(projectile.position.x, projectile.position.y, projectile.position.z);

        // Check collision with enemies
        gameState.enemies.forEach(enemy => {
            if (enemy.isDead) return;

            const dx = enemy.position.x - projectile.position.x;
            const dz = enemy.position.z - projectile.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < 1.5) {
                damageEnemy(enemy, projectile.damage);
                scene.remove(projectile.mesh);
                gameState.projectiles.splice(index, 1);
            }
        });
    });
}

function damageEnemy(enemy, damage) {
    enemy.health -= damage;
    showDamageNumber(enemy.position, damage, 0xffff00);

    if (enemy.health <= 0) {
        killEnemy(enemy);
    }
}

function killEnemy(enemy) {
    enemy.isDead = true;
    enemy.deathTimer = 60;

    // Reward player
    gainExp(enemy.exp);
    gameState.player.money += enemy.money;
    updateHUD();

    // Make enemy fall
    if (enemy.mesh) {
        enemy.mesh.rotation.x = Math.PI / 2;
    }

    // Check quest progress
    if (gameState.player.currentQuest) {
        const quest = gameState.player.currentQuest;
        if (quest.target === enemy.type) {
            quest.progress++;
            if (quest.progress >= quest.count) {
                completeQuest();
            }
        }
    }
}

function showDamageNumber(position, damage, color) {
    const damageNum = {
        position: { x: position.x, y: position.y + 2, z: position.z },
        damage: Math.floor(damage),
        color: color,
        lifetime: 60,
        velocity: { y: 0.05 }
    };
    gameState.damageNumbers.push(damageNum);
}

function updateDamageNumbers() {
    gameState.damageNumbers.forEach((num, index) => {
        num.lifetime--;
        num.position.y += num.velocity.y;

        if (num.lifetime <= 0) {
            gameState.damageNumbers.splice(index, 1);
        }
    });
}

function completeQuest() {
    const quest = gameState.player.currentQuest;
    alert(`Quest Complete! Reward: ${quest.reward.exp} EXP, ${quest.reward.money} Money`);
    gainExp(quest.reward.exp);
    gameState.player.money += quest.reward.money;
    gameState.player.currentQuest = null;
    updateHUD();
}

// HUD Updates
function updateHUD() {
    document.getElementById('playerLevel').textContent = `Level ${gameState.player.level}`;
    document.getElementById('expText').textContent = `${gameState.player.exp}/${gameState.player.expToNext} EXP`;
    document.getElementById('playerHealth').textContent = `HP: ${Math.floor(gameState.player.health)}/${gameState.player.maxHealth}`;
    document.getElementById('playerEnergy').textContent = `Energy: ${Math.floor(gameState.player.energy)}/${gameState.player.maxEnergy}`;
    document.getElementById('playerMoney').textContent = `💰 ${gameState.player.money}`;

    // Update EXP bar
    const expPercent = (gameState.player.exp / gameState.player.expToNext) * 100;
    document.getElementById('expFill').style.width = `${expPercent}%`;

    // Update current fruit and mastery
    if (gameState.player.currentFruit) {
        const fruit = fruits.find(f => f.id === gameState.player.currentFruit);
        const mastery = gameState.player.masteries[gameState.player.currentFruit] || { level: 1, exp: 0, expToNext: 100 };
        document.getElementById('currentFruit').textContent = `${fruit.name} (Mastery: ${mastery.level})`;

        // Update move display
        updateMoveDisplay(fruit, mastery);
    } else {
        document.getElementById('currentFruit').textContent = 'None';
        document.getElementById('moveDisplay').innerHTML = '<div style="color: #888;">No fruit equipped</div>';
    }

    // Update quest display
    const questInfo = document.getElementById('questInfo');
    if (gameState.player.currentQuest) {
        const quest = gameState.player.currentQuest;
        questInfo.textContent = `${quest.name}: ${quest.progress}/${quest.count}`;
        questInfo.style.display = 'block';
    } else {
        questInfo.textContent = 'No active quest';
        questInfo.style.display = 'block';
    }

    // Update enemy count
    const aliveEnemies = gameState.enemies.filter(e => !e.isDead).length;
    document.getElementById('enemyCount').textContent = `Enemies: ${aliveEnemies}`;
}

function updateMoveDisplay(fruit, mastery) {
    const moveDisplay = document.getElementById('moveDisplay');
    if (!moveDisplay) return;

    moveDisplay.innerHTML = '';
    fruit.moves.forEach((move, index) => {
        const isUnlocked = mastery.level >= move.masteryRequired;
        const cooldownPercent = gameState.player.attackCooldown > 0 ? (gameState.player.attackCooldown / move.cooldown) * 100 : 0;

        const moveElement = document.createElement('div');
        moveElement.className = `move-slot ${isUnlocked ? '' : 'locked'}`;
        moveElement.innerHTML = `
            <div class="move-key">${move.key}</div>
            <div class="move-info">
                <div class="move-name">${move.name}</div>
                <div class="move-stats">
                    ${isUnlocked ? `DMG: ${move.damage} | Energy: ${move.energyCost}` : `Unlock at Mastery ${move.masteryRequired}`}
                </div>
            </div>
            ${cooldownPercent > 0 ? `<div class="move-cooldown" style="width: ${cooldownPercent}%"></div>` : ''}
        `;
        moveDisplay.appendChild(moveElement);
    });
}

// Shop System
function populateShop() {
    const shopGrid = document.getElementById('shopGrid');
    shopGrid.innerHTML = '';

    fruits.forEach(fruit => {
        const fruitElement = document.createElement('div');
        fruitElement.className = 'fruit-item';
        const moveNames = fruit.moves.map(m => m.name).join(', ');
        
        fruitElement.innerHTML = `
            <div class="fruit-icon">${fruit.icon}</div>
            <div class="fruit-name">${fruit.name}</div>
            <div class="fruit-price">💰 ${fruit.price}</div>
            <div class="fruit-description">${fruit.description}</div>
            <div style="margin-bottom: 1rem;">
                <strong>Type:</strong> ${fruit.type}<br>
                <strong>Moves:</strong> ${moveNames}
            </div>
            <button class="buy-btn" onclick="buyFruit('${fruit.id}')" 
                    ${gameState.player.money < fruit.price ? 'disabled' : ''}>
                ${gameState.player.money >= fruit.price ? 'Buy Permanent' : 'Not Enough Money'}
            </button>
        `;
        shopGrid.appendChild(fruitElement);
    });
}

function buyFruit(fruitId) {
    const fruit = fruits.find(f => f.id === fruitId);
    if (!fruit || gameState.player.money < fruit.price) return;

    gameState.player.money -= fruit.price;
    gameState.player.currentFruit = fruitId;
    gameState.player.inventory.push(fruitId);

    updateHUD();
    populateShop();
    populateInventory();

    alert(`You bought the ${fruit.name}! It's now equipped.`);
}

// Inventory System
function populateInventory() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    inventoryGrid.innerHTML = '';

    const uniqueFruits = [...new Set(gameState.player.inventory)];

    uniqueFruits.forEach(fruitId => {
        const fruit = fruits.find(f => f.id === fruitId);
        if (!fruit) return;

        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <div class="item-icon">${fruit.icon}</div>
            <div>${fruit.name}</div>
            <button onclick="equipFruit('${fruitId}')" 
                    ${gameState.player.currentFruit === fruitId ? 'disabled' : ''}>
                ${gameState.player.currentFruit === fruitId ? 'Equipped' : 'Equip'}
            </button>
        `;
        inventoryGrid.appendChild(itemElement);
    });

    if (uniqueFruits.length === 0) {
        inventoryGrid.innerHTML = '<div style="text-align: center; color: #888;">No fruits owned</div>';
    }
}

function equipFruit(fruitId) {
    gameState.player.currentFruit = fruitId;
    updateHUD();
    populateInventory();
}

// Modal Controls
function openShop() {
    document.getElementById('fruitShop').classList.add('active');
    populateShop();
}

function closeShop() {
    document.getElementById('fruitShop').classList.remove('active');
}

function openInventory() {
    document.getElementById('inventory').classList.add('active');
    populateInventory();
}

function closeInventory() {
    document.getElementById('inventory').classList.remove('active');
}

function toggleMap() {
    const mapModal = document.getElementById('mapModal');
    mapModal.classList.toggle('active');
    updateMapDisplay();
}

// Map System
function updateMapDisplay() {
    const islands = document.querySelectorAll('.island');
    islands.forEach(island => {
        const islandName = island.textContent.toLowerCase().replace(' island', '').replace(' (lvl ', '').split('+')[0];
        const islandKey = islandName.replace(' ', '');
        const islandData = gameState.islands[islandKey];

        if (islandData && gameState.player.level >= islandData.level) {
            island.classList.remove('locked');
            island.onclick = () => travelToIsland(islandKey);
        }
    });
}

function travelToIsland(islandKey) {
    const island = gameState.islands[islandKey];
    if (!island || gameState.player.level < island.level) {
        alert(`You need to be level ${island.level} to access this island!`);
        return;
    }

    gameState.player.currentIsland = islandKey;
    toggleMap();
    alert(`Traveled to ${island.name}!`);
}

function updateIslandUnlocks() {
    Object.keys(gameState.islands).forEach(key => {
        const island = gameState.islands[key];
        if (gameState.player.level >= island.level) {
            island.unlocked = true;
        }
    });
}

// Zoom Controls
function zoomIn() {
    gameState.camera.distance = Math.max(gameState.camera.distance - 3, 5);
}

function zoomOut() {
    gameState.camera.distance = Math.min(gameState.camera.distance + 3, 50);
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;

    // Attack with Space (melee)
    if (e.key === ' ') {
        e.preventDefault();
        playerAttack(0);
    }

    // Fruit moves Z, X, C, V
    if (e.key === 'z' || e.key === 'Z') {
        playerAttack(0); // First move
    }
    if (e.key === 'x' || e.key === 'X') {
        playerAttack(1); // Second move
    }
    if (e.key === 'c' || e.key === 'C') {
        playerAttack(2); // Third move
    }
    if (e.key === 'v' || e.key === 'V') {
        playerAttack(3); // Fourth move
    }

    // Shortcuts
    if (e.key === 'm' || e.key === 'M') {
        toggleMap();
    }
    if (e.key === 'i' || e.key === 'I') {
        openInventory();
    }
    if (e.key === 'b' || e.key === 'B') {
        openShop();
    }
    if (e.key === 't' || e.key === 'T') {
        openStats();
    }
    if (e.key === 'q' || e.key === 'Q') {
        gameState.camera.angle += 0.1;
    }
    if (e.key === 'e' || e.key === 'E') {
        gameState.camera.angle -= 0.1;
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

// Mouse controls for camera rotation and attack
let isDragging = false;
let previousMouseX = 0;

document.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click - attack
        playerAttack();
    }
    if (e.button === 2) { // Right click - camera
        isDragging = true;
        previousMouseX = e.clientX;
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - previousMouseX;
        gameState.camera.angle -= deltaX * 0.01;
        previousMouseX = e.clientX;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Prevent context menu on right click
});

// Level up system
function gainExp(amount) {
    gameState.player.exp += amount;

    while (gameState.player.exp >= gameState.player.expToNext) {
        gameState.player.exp -= gameState.player.expToNext;
        gameState.player.level++;
        gameState.player.expToNext = Math.floor(gameState.player.expToNext * 1.2);
        gameState.player.maxHealth += 20;
        gameState.player.health = gameState.player.maxHealth;
        gameState.player.money += gameState.player.level * 100;

        alert(`Level Up! You are now level ${gameState.player.level}!`);
        updateHUD();
    }
}

// Quest system functions
function openQuestMenu() {
    document.getElementById('questMenu').classList.add('active');
    populateQuests();
}

function closeQuestMenu() {
    document.getElementById('questMenu').classList.remove('active');
}

function populateQuests() {
    const questList = document.getElementById('questList');
    questList.innerHTML = '';

    const island = gameState.player.currentIsland;
    const availableQuests = quests[island] || [];

    if (availableQuests.length === 0) {
        questList.innerHTML = '<div style="text-align: center; color: #888;">No quests available on this island</div>';
        return;
    }

    availableQuests.forEach(quest => {
        const questElement = document.createElement('div');
        questElement.className = 'quest-item';
        questElement.innerHTML = `
            <h3>${quest.name}</h3>
            <p>Target: ${quest.target} x${quest.count}</p>
            <p>Reward: ${quest.reward.exp} EXP, ${quest.reward.money} Money</p>
            <button onclick="acceptQuest('${island}', '${quest.name}')" 
                    ${gameState.player.currentQuest ? 'disabled' : ''}>
                ${gameState.player.currentQuest ? 'Quest Active' : 'Accept Quest'}
            </button>
        `;
        questList.appendChild(questElement);
    });
}

function acceptQuest(island, questName) {
    const quest = quests[island].find(q => q.name === questName);
    if (!quest) return;

    gameState.player.currentQuest = {
        ...quest,
        progress: 0
    };

    closeQuestMenu();
    updateHUD();
    alert(`Quest accepted: ${quest.name}`);
}

// Stats menu
function openStats() {
    document.getElementById('statsMenu').classList.add('active');
    populateStats();
}

function closeStats() {
    document.getElementById('statsMenu').classList.remove('active');
}

function populateStats() {
    const statsContent = document.getElementById('statsContent');
    const fruit = gameState.player.currentFruit ? fruits.find(f => f.id === gameState.player.currentFruit) : null;
    const mastery = fruit ? (gameState.player.masteries[fruit.id] || { level: 1, exp: 0, expToNext: 100 }) : null;

    statsContent.innerHTML = `
        <div class="stat-section">
            <h3>Player Stats</h3>
            <div class="stat-item">
                <span>Level:</span>
                <span>${gameState.player.level}</span>
            </div>
            <div class="stat-item">
                <span>Health:</span>
                <span>${gameState.player.maxHealth}</span>
            </div>
            <div class="stat-item">
                <span>Energy:</span>
                <span>${gameState.player.maxEnergy}</span>
            </div>
            <div class="stat-item">
                <span>Money:</span>
                <span>💰 ${gameState.player.money}</span>
            </div>
        </div>
        
        ${fruit ? `
        <div class="stat-section">
            <h3>${fruit.icon} ${fruit.name}</h3>
            <div class="stat-item">
                <span>Mastery Level:</span>
                <span>${mastery.level} / 150</span>
            </div>
            <div class="stat-item">
                <span>Mastery EXP:</span>
                <span>${mastery.exp} / ${mastery.expToNext}</span>
            </div>
            <div class="mastery-bar">
                <div class="mastery-fill" style="width: ${(mastery.exp / mastery.expToNext) * 100}%"></div>
            </div>
            
            <h4 style="margin-top: 1rem;">Moves:</h4>
            ${fruit.moves.map(move => `
                <div class="move-detail ${mastery.level >= move.masteryRequired ? '' : 'locked'}">
                    <div class="move-header">
                        <span class="move-key-badge">${move.key}</span>
                        <span class="move-name">${move.name}</span>
                    </div>
                    <div class="move-description">${move.description}</div>
                    <div class="move-stats-detail">
                        <span>Damage: ${move.damage}</span>
                        <span>Energy: ${move.energyCost}</span>
                        <span>Cooldown: ${(move.cooldown / 60).toFixed(1)}s</span>
                        <span>Required: Mastery ${move.masteryRequired}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : '<div style="text-align: center; color: #888; padding: 2rem;">No fruit equipped</div>'}
        
        <div class="stat-section">
            <h3>Combat Stats</h3>
            <div class="stat-item">
                <span>Melee:</span>
                <span>${gameState.player.stats.melee}</span>
            </div>
            <div class="stat-item">
                <span>Defense:</span>
                <span>${gameState.player.stats.defense}</span>
            </div>
            <div class="stat-item">
                <span>Sword:</span>
                <span>${gameState.player.stats.sword}</span>
            </div>
            <div class="stat-item">
                <span>Gun:</span>
                <span>${gameState.player.stats.gun}</span>
            </div>
        </div>
    `;
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing game...');
    try {
        if (typeof THREE === 'undefined') {
            throw new Error('THREE.js not loaded!');
        }
        initGame();
        console.log('Game initialized successfully!');
    } catch(e) {
        console.error('Failed to initialize game:', e);
        alert('Failed to load game: ' + e.message);
    }
});