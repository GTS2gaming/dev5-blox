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
        position: { x: 0, y: 0 },
        currentIsland: 'starter'
    },
    camera: {
        zoom: 1,
        x: 0,
        y: 0
    },
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

// Canvas and rendering
let canvas, ctx;
let animationId;

// Initialize game
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize shop
    populateShop();
    
    // Start game loop
    gameLoop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Faction selection
function selectFaction(faction) {
    gameState.player.faction = faction;
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    updateHUD();
}

// Game loop
function gameLoop() {
    update();
    render();
    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    // Update game logic here
    updateIslandUnlocks();
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ocean
    drawOcean();
    
    // Draw current island
    drawIsland();
    
    // Draw player
    drawPlayer();
}

function drawOcean() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#4682B4');
    gradient.addColorStop(1, '#191970');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
    
    // Draw waves
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const y = canvas.height * 0.7 + i * 20;
        for (let x = 0; x < canvas.width; x += 20) {
            const waveY = y + Math.sin((x + time * 100) * 0.01) * 5;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
    }
}

function drawIsland() {
    const island = gameState.islands[gameState.player.currentIsland];
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.6;
    
    // Draw island base
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 200 * gameState.camera.zoom, 50 * gameState.camera.zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw island surface
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 20, 180 * gameState.camera.zoom, 40 * gameState.camera.zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw trees
    for (let i = 0; i < 5; i++) {
        const treeX = centerX + (i - 2) * 60 * gameState.camera.zoom;
        const treeY = centerY - 30;
        drawTree(treeX, treeY);
    }
    
    // Draw island name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${24 * gameState.camera.zoom}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(island.name, centerX, centerY - 100);
}

function drawTree(x, y) {
    const zoom = gameState.camera.zoom;
    
    // Tree trunk
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 5 * zoom, y, 10 * zoom, 40 * zoom);
    
    // Tree leaves
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x, y - 10 * zoom, 20 * zoom, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer() {
    const playerX = canvas.width / 2 + gameState.player.position.x * gameState.camera.zoom;
    const playerY = canvas.height * 0.6 - 30 + gameState.player.position.y * gameState.camera.zoom;
    
    // Player body
    ctx.fillStyle = gameState.player.faction === 'pirate' ? '#FF4444' : '#4444FF';
    ctx.fillRect(playerX - 10, playerY - 20, 20, 30);
    
    // Player head
    ctx.fillStyle = '#FFDBAC';
    ctx.beginPath();
    ctx.arc(playerX, playerY - 25, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Player name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${gameState.player.level} ${gameState.player.faction}`, playerX, playerY - 40);
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
    gameState.camera.zoom = Math.min(gameState.camera.zoom * 1.2, 3);
}

function zoomOut() {
    gameState.camera.zoom = Math.max(gameState.camera.zoom * 0.8, 0.5);
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    const speed = 5;
    switch(e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            gameState.player.position.y -= speed;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            gameState.player.position.y += speed;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            gameState.player.position.x -= speed;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            gameState.player.position.x += speed;
            break;
        case 'm':
        case 'M':
            toggleMap();
            break;
        case 'i':
        case 'I':
            openInventory();
            break;
        case 'b':
        case 'B':
            openShop();
            break;
    }
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