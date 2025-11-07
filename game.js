// Game State
let gameState = {
    player: {
        level: 1,
        exp: 0,
        expToNext: 100,
        health: 100,
        maxHealth: 100,
        money: 1000,
        faction: null,
        currentFruit: null,
        inventory: [],
        position: { x: 0, y: 0, z: 0 },
        rotation: 0,
        velocity: { x: 0, z: 0 },
        currentIsland: 'starter'
    },
    camera: {
        distance: 20,
        height: 10,
        angle: 0
    },
    keys: {},
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

// Fruit Database
const fruits = [
    {
        id: 'flame',
        name: 'Flame Fruit',
        icon: '🔥',
        price: 2500,
        type: 'Logia',
        description: 'Control fire and become immune to physical attacks',
        abilities: ['Fire Fist', 'Fire Pillar', 'Burning Path', 'Flame Emperor']
    },
    {
        id: 'ice',
        name: 'Ice Fruit',
        icon: '❄️',
        price: 3500,
        type: 'Logia',
        description: 'Freeze enemies and create ice structures',
        abilities: ['Ice Spear', 'Frozen Time', 'Ice Age', 'Absolute Zero']
    },
    {
        id: 'light',
        name: 'Light Fruit',
        icon: '💡',
        price: 15000,
        type: 'Logia',
        description: 'Move at light speed and shoot laser beams',
        abilities: ['Light Kick', 'Laser Beam', 'Light Speed', 'Sacred Light']
    },
    {
        id: 'rubber',
        name: 'Rubber Fruit',
        icon: '🎈',
        price: 1200,
        type: 'Paramecia',
        description: 'Stretch your body like rubber, immune to electricity',
        abilities: ['Gum Pistol', 'Gum Rocket', 'Gear Second', 'Gear Third']
    },
    {
        id: 'barrier',
        name: 'Barrier Fruit',
        icon: '🛡️',
        price: 8000,
        type: 'Paramecia',
        description: 'Create indestructible barriers for defense',
        abilities: ['Barrier Wall', 'Barrier Crash', 'Full Barrier', 'Barrier Ball']
    },
    {
        id: 'gravity',
        name: 'Gravity Fruit',
        icon: '🌌',
        price: 25000,
        type: 'Paramecia',
        description: 'Control gravitational forces',
        abilities: ['Gravity Push', 'Gravity Pull', 'Meteor Rain', 'Black Hole']
    },
    {
        id: 'phoenix',
        name: 'Phoenix Fruit',
        icon: '🔥🦅',
        price: 18000,
        type: 'Mythical Zoan',
        description: 'Transform into a phoenix with healing flames',
        abilities: ['Phoenix Form', 'Healing Fire', 'Phoenix Dive', 'Rebirth']
    },
    {
        id: 'dragon',
        name: 'Dragon Fruit',
        icon: '🐉',
        price: 35000,
        type: 'Mythical Zoan',
        description: 'Transform into a mighty dragon',
        abilities: ['Dragon Form', 'Fire Breath', 'Wind Scythe', 'Dragon Roar']
    }
];

// Three.js variables
let scene, camera, renderer, player, playerMesh;
let animationId;

// Initialize game
function initGame() {
    // Initialize Three.js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Setup renderer
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
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
    
    // Create ocean
    createOcean();
    
    // Create island
    createIsland();
    
    // Create player
    createPlayer();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Initialize shop
    populateShop();
    
    // Start game loop
    gameLoop();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Faction selection
function selectFaction(faction) {
    gameState.player.faction = faction;
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    // Recreate player with faction color
    if (playerMesh) {
        scene.remove(playerMesh);
    }
    createPlayer();
    
    updateHUD();
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
    if (!gameState.player.faction) return;
    
    // Update player movement
    updatePlayerMovement();
    
    // Update camera to follow player
    updateCamera();
    
    // Update ocean animation
    scene.children.forEach(child => {
        if (child.userData.update) {
            child.userData.update();
        }
    });
    
    updateIslandUnlocks();
}

function updatePlayerMovement() {
    const speed = 0.15;
    const rotationSpeed = 0.05;
    
    let moveX = 0;
    let moveZ = 0;
    
    // WASD movement
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
    
    // Apply movement
    if (moveX !== 0 || moveZ !== 0) {
        const angle = Math.atan2(moveX, moveZ);
        gameState.player.position.x += Math.sin(angle) * speed;
        gameState.player.position.z += Math.cos(angle) * speed;
        
        // Rotate player to face movement direction
        gameState.player.rotation = angle;
        
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
}

function updateCamera() {
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

// HUD Updates
function updateHUD() {
    document.getElementById('playerLevel').textContent = `Level ${gameState.player.level}`;
    document.getElementById('expText').textContent = `${gameState.player.exp}/${gameState.player.expToNext} EXP`;
    document.getElementById('playerHealth').textContent = `HP: ${gameState.player.health}/${gameState.player.maxHealth}`;
    document.getElementById('playerMoney').textContent = `💰 ${gameState.player.money}`;
    
    // Update EXP bar
    const expPercent = (gameState.player.exp / gameState.player.expToNext) * 100;
    document.getElementById('expFill').style.width = `${expPercent}%`;
    
    // Update current fruit
    const fruitDisplay = gameState.player.currentFruit 
        ? fruits.find(f => f.id === gameState.player.currentFruit)?.name || 'Unknown'
        : 'None';
    document.getElementById('currentFruit').textContent = fruitDisplay;
}

// Shop System
function populateShop() {
    const shopGrid = document.getElementById('shopGrid');
    shopGrid.innerHTML = '';
    
    fruits.forEach(fruit => {
        const fruitElement = document.createElement('div');
        fruitElement.className = 'fruit-item';
        fruitElement.innerHTML = `
            <div class="fruit-icon">${fruit.icon}</div>
            <div class="fruit-name">${fruit.name}</div>
            <div class="fruit-price">💰 ${fruit.price}</div>
            <div class="fruit-description">${fruit.description}</div>
            <div style="margin-bottom: 1rem;">
                <strong>Type:</strong> ${fruit.type}<br>
                <strong>Abilities:</strong> ${fruit.abilities.join(', ')}
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
    
    // Camera rotation with Q/E
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

// Mouse controls for camera rotation
let isDragging = false;
let previousMouseX = 0;

document.addEventListener('mousedown', (e) => {
    if (e.button === 2) { // Right click
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

// Auto-gain EXP for demo
setInterval(() => {
    if (gameState.player.faction) {
        gainExp(Math.floor(Math.random() * 10) + 5);
        updateHUD();
    }
}, 3000);

// Initialize when page loads
window.addEventListener('load', initGame);