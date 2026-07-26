// 游戏常量
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 32;
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 4;

// 游戏状态
let gameState = {
    currentLevel: 0,
    isPlaying: false,
    isShopOpen: false,
    showDialog: false,
    dialogText: '',
    dialogTimer: 0
};

// 玩家对象
let player = {
    x: 100,
    y: 300,
    width: 28,
    height: 40,
    vx: 0,
    vy: 0,
    health: 100,
    maxHealth: 100,
    gold: 0,
    attack: 10,
    defense: 5,
    isJumping: false,
    isAttacking: false,
    attackTimer: 0,
    facingRight: true,
    animFrame: 0,
    animTimer: 0,
    invincible: false,
    invincibleTimer: 0
};

// 输入状态
let keys = {};

// 游戏对象
let platforms = [];
let enemies = [];
let coins = [];
let npcs = [];
let spikes = [];
let door = null;
let princess = null;

// NPC自言自语内容
const npcDialogs = [
    ["听说公主被关在城堡的最深处...", "那里有很多可怕的怪物。", "勇士啊，祝你好运！"],
    ["我在这片森林迷路很久了。", "看到那些发光的金币了吗？", "收集它们可以变强哦！"],
    ["前面的路很危险，", "有很多尖刺陷阱。", "小心脚下！"],
    ["黑暗骑士守护着通往公主的路。", "他非常强大，", "你需要变得更强才能击败他！"],
    ["谢谢你救了我！", "你真是一位勇敢的王子！", "我们的国家会永远记住你的功绩！"]
];

// 关卡配置
const levels = [
    { // 关卡1：森林入口
        name: "森林入口",
        bgColor: "#2d5016",
        platformColor: "#3d6b1f",
        enemyType: "slime",
        enemyCount: 3,
        coinCount: 8,
        hasShop: true,
        hasSpikes: false
    },
    { // 关卡2：幽暗洞穴
        name: "幽暗洞穴",
        bgColor: "#1a1a2e",
        platformColor: "#4a4a6a",
        enemyType: "bat",
        enemyCount: 4,
        coinCount: 10,
        hasShop: true,
        hasSpikes: true
    },
    { // 关卡3：荆棘之路
        name: "荆棘之路",
        bgColor: "#4a1a2e",
        platformColor: "#6a2a4a",
        enemyType: "wolf",
        enemyCount: 5,
        coinCount: 12,
        hasShop: true,
        hasSpikes: true
    },
    { // 关卡4：黑暗城堡
        name: "黑暗城堡",
        bgColor: "#2a1a1a",
        platformColor: "#5a3a3a",
        enemyType: "knight",
        enemyCount: 6,
        coinCount: 15,
        hasShop: true,
        hasSpikes: true
    },
    { // 关卡5：公主牢笼
        name: "公主牢笼",
        bgColor: "#1a2a4a",
        platformColor: "#3a5a8a",
        enemyType: "boss",
        enemyCount: 1,
        coinCount: 20,
        hasShop: false,
        hasSpikes: true
    }
];

// Canvas和Context
let canvas, ctx;

// 初始化游戏
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // 禁用图像平滑处理以获得像素风格
    ctx.imageSmoothingEnabled = false;
    
    // 事件监听
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // 开始游戏循环
    gameLoop();
}

// 处理按键按下
function handleKeyDown(e) {
    keys[e.code] = true;
    
    // 打开商店
    if ((e.code === 'KeyE' || e.code === 'KeyK') && !gameState.isShopOpen) {
        checkShopInteraction();
    }
    
    // 关闭对话框
    if (e.code === 'Space' && gameState.showDialog) {
        gameState.showDialog = false;
        document.getElementById('dialog-box').style.display = 'none';
    }
}

// 处理按键释放
function handleKeyUp(e) {
    keys[e.code] = false;
}

// 检查商店互动
function checkShopInteraction() {
    const levelConfig = levels[gameState.currentLevel];
    if (levelConfig.hasShop) {
        for (let npc of npcs) {
            if (npc.type === 'shopkeeper' && checkCollision(player, npc)) {
                openShop();
                return;
            }
        }
    }
}

// 开始游戏
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
    
    gameState.currentLevel = 0;
    player.health = 100;
    player.maxHealth = 100;
    player.gold = 0;
    player.attack = 10;
    player.defense = 5;
    
    loadLevel(gameState.currentLevel);
    gameState.isPlaying = true;
    
    updateUI();
}

// 重新开始游戏
function restartGame() {
    startGame();
}

// 加载关卡
function loadLevel(levelIndex) {
    const config = levels[levelIndex];
    
    // 重置玩家位置
    player.x = 50;
    player.y = 400;
    player.vx = 0;
    player.vy = 0;
    
    // 创建平台
    platforms = createPlatforms(levelIndex);
    
    // 创建敌人
    enemies = createEnemies(config.enemyType, config.enemyCount, levelIndex);
    
    // 创建金币
    coins = createCoins(config.coinCount, levelIndex);
    
    // 创建NPC
    npcs = createNPCs(config.hasShop, levelIndex);
    
    // 创建尖刺
    spikes = config.hasSpikes ? createSpikes(levelIndex) : [];
    
    // 创建门/公主
    if (levelIndex === levels.length - 1) {
        princess = { x: 700, y: 350, width: 30, height: 50, rescued: false };
        door = null;
    } else {
        door = { x: 750, y: 350, width: 40, height: 60 };
        princess = null;
    }
    
    // 更新UI
    document.getElementById('level-display').textContent = levelIndex + 1;
}

// 创建平台
function createPlatforms(levelIndex) {
    const plats = [
        // 地面
        { x: 0, y: 550, width: 800, height: 50 },
        // 平台
        { x: 150, y: 450, width: 120, height: 20 },
        { x: 350, y: 380, width: 120, height: 20 },
        { x: 550, y: 300, width: 120, height: 20 },
        { x: 200, y: 250, width: 100, height: 20 },
        { x: 450, y: 180, width: 100, height: 20 },
        { x: 650, y: 420, width: 100, height: 20 }
    ];
    
    // 根据关卡调整平台布局
    if (levelIndex === 1) { // 洞穴 - 更多垂直平台
        plats.push(
            { x: 100, y: 350, width: 80, height: 20 },
            { x: 300, y: 280, width: 80, height: 20 },
            { x: 500, y: 220, width: 80, height: 20 }
        );
    } else if (levelIndex === 2) { // 荆棘 - 更窄的平台
        plats.forEach(p => p.width = Math.max(60, p.width - 40));
    } else if (levelIndex === 3) { // 城堡 - 阶梯状平台
        plats.push(
            { x: 80, y: 480, width: 60, height: 20 },
            { x: 180, y: 420, width: 60, height: 20 },
            { x: 280, y: 360, width: 60, height: 20 }
        );
    } else if (levelIndex === 4) { // 最终关卡 - Boss战场地
        return [
            { x: 0, y: 550, width: 800, height: 50 },
            { x: 100, y: 400, width: 150, height: 20 },
            { x: 550, y: 400, width: 150, height: 20 },
            { x: 325, y: 250, width: 150, height: 20 }
        ];
    }
    
    return plats;
}

// 创建敌人
function createEnemies(type, count, levelIndex) {
    const enemyList = [];
    const positions = [
        { x: 300, y: 520 },
        { x: 500, y: 520 },
        { x: 400, y: 350 },
        { x: 600, y: 270 },
        { x: 250, y: 220 },
        { x: 500, y: 150 },
        { x: 700, y: 390 }
    ];
    
    for (let i = 0; i < count && i < positions.length; i++) {
        const pos = positions[i];
        let enemy = {
            x: pos.x,
            y: pos.y,
            width: 30,
            height: 30,
            type: type,
            health: 30,
            maxHealth: 30,
            attack: 8,
            vx: 1,
            patrolStart: pos.x - 50,
            patrolEnd: pos.x + 50,
            animFrame: 0,
            animTimer: 0,
            isDead: false
        };
        
        // 根据敌人类型调整属性
        switch(type) {
            case 'slime':
                enemy.height = 20;
                enemy.health = 20;
                enemy.maxHealth = 20;
                break;
            case 'bat':
                enemy.y -= 50;
                enemy.health = 25;
                enemy.maxHealth = 25;
                enemy.vx = 2;
                break;
            case 'wolf':
                enemy.width = 35;
                enemy.height = 25;
                enemy.health = 35;
                enemy.maxHealth = 35;
                enemy.attack = 12;
                enemy.vx = 2.5;
                break;
            case 'knight':
                enemy.width = 32;
                enemy.height = 40;
                enemy.health = 50;
                enemy.maxHealth = 50;
                enemy.attack = 15;
                enemy.vx = 1.5;
                break;
            case 'boss':
                enemy.width = 60;
                enemy.height = 70;
                enemy.health = 150;
                enemy.maxHealth = 150;
                enemy.attack = 25;
                enemy.vx = 1;
                enemy.patrolStart = 350;
                enemy.patrolEnd = 450;
                break;
        }
        
        enemyList.push(enemy);
    }
    
    return enemyList;
}

// 创建金币
function createCoins(count, levelIndex) {
    const coinList = [];
    const positions = [
        { x: 200, y: 420 },
        { x: 250, y: 420 },
        { x: 400, y: 350 },
        { x: 450, y: 350 },
        { x: 600, y: 270 },
        { x: 650, y: 270 },
        { x: 250, y: 220 },
        { x: 500, y: 150 },
        { x: 350, y: 520 },
        { x: 450, y: 520 },
        { x: 550, y: 520 },
        { x: 150, y: 320 },
        { x: 700, y: 390 },
        { x: 300, y: 250 },
        { x: 550, y: 190 }
    ];
    
    for (let i = 0; i < count && i < positions.length; i++) {
        coinList.push({
            x: positions[i].x,
            y: positions[i].y,
            width: 16,
            height: 16,
            collected: false,
            animFrame: 0
        });
    }
    
    return coinList;
}

// 创建NPC
function createNPCs(hasShop, levelIndex) {
    const npcList = [];
    
    if (hasShop) {
        npcList.push({
            x: 100,
            y: 510,
            width: 30,
            height: 40,
            type: 'shopkeeper',
            dialogIndex: 0,
            dialogTimer: 0,
            animFrame: 0,
            animTimer: 0
        });
    }
    
    // 添加其他NPC
    if (levelIndex > 0 && levelIndex < levels.length - 1) {
        npcList.push({
            x: 700,
            y: 510,
            width: 30,
            height: 40,
            type: 'villager',
            dialogIndex: levelIndex,
            dialogTimer: 0,
            animFrame: 0,
            animTimer: 0
        });
    }
    
    return npcList;
}

// 创建尖刺
function createSpikes(levelIndex) {
    const spikeList = [];
    
    // 地面上的尖刺
    spikeList.push(
        { x: 400, y: 535, width: 60, height: 15 },
        { x: 600, y: 535, width: 40, height: 15 }
    );
    
    if (levelIndex >= 2) {
        spikeList.push(
            { x: 250, y: 535, width: 50, height: 15 }
        );
    }
    
    return spikeList;
}

// 游戏主循环
function gameLoop() {
    if (gameState.isPlaying && !gameState.isShopOpen) {
        update();
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function update() {
    // 玩家移动
    handlePlayerMovement();
    
    // 应用重力
    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;
    
    // 碰撞检测
    checkPlatformCollisions();
    checkEnemyCollisions();
    checkCoinCollisions();
    checkSpikeCollisions();
    checkDoorCollision();
    checkPrincessCollision();
    checkNPCCollision();
    
    // 边界检测
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
    if (player.y > CANVAS_HEIGHT) {
        playerHit(10); // 掉出地图受伤
        player.y = 400;
        player.vy = 0;
    }
    
    // 攻击计时器
    if (player.isAttacking) {
        player.attackTimer--;
        if (player.attackTimer <= 0) {
            player.isAttacking = false;
        }
    }
    
    // 无敌时间
    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
    
    // 更新敌人
    updateEnemies();
    
    // 更新NPC动画和对话
    updateNPCs();
    
    // 更新动画帧
    player.animTimer++;
    if (player.animTimer >= 10) {
        player.animTimer = 0;
        player.animFrame = (player.animFrame + 1) % 4;
    }
    
    // 更新UI
    updateUI();
}

// 处理玩家移动
function handlePlayerMovement() {
    player.vx = 0;
    
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.vx = -PLAYER_SPEED;
        player.facingRight = false;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.vx = PLAYER_SPEED;
        player.facingRight = true;
    }
    
    // 跳跃
    if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && !player.isJumping) {
        player.vy = JUMP_FORCE;
        player.isJumping = true;
    }
    
    // 攻击
    if ((keys['Space'] || keys['KeyJ']) && !player.isAttacking) {
        player.isAttacking = true;
        player.attackTimer = 15;
        checkAttackHit();
    }
}

// 检查攻击命中
function checkAttackHit() {
    const attackRange = {
        x: player.facingRight ? player.x + player.width : player.x - 40,
        y: player.y,
        width: 40,
        height: player.height
    };
    
    for (let enemy of enemies) {
        if (!enemy.isDead && checkRectCollision(attackRange, enemy)) {
            const damage = player.attack;
            enemy.health -= damage;
            
            // 击退效果
            enemy.vx = player.facingRight ? 5 : -5;
            
            if (enemy.health <= 0) {
                enemy.isDead = true;
                // 死亡掉落金币
                coins.push({
                    x: enemy.x,
                    y: enemy.y,
                    width: 16,
                    height: 16,
                    collected: false,
                    animFrame: 0
                });
            }
        }
    }
}

// 平台碰撞检测
function checkPlatformCollisions() {
    player.isJumping = true;
    
    for (let plat of platforms) {
        if (checkCollision(player, plat)) {
            // 从上方落在平台上
            if (player.vy > 0 && player.y + player.height - player.vy <= plat.y) {
                player.y = plat.y - player.height;
                player.vy = 0;
                player.isJumping = false;
            }
            // 从下方撞到平台
            else if (player.vy < 0 && player.y - player.vy >= plat.y + plat.height) {
                player.y = plat.y + plat.height;
                player.vy = 0;
            }
            // 从侧面撞到平台
            else {
                if (player.vx > 0) {
                    player.x = plat.x - player.width;
                } else if (player.vx < 0) {
                    player.x = plat.x + plat.width;
                }
                player.vx = 0;
            }
        }
    }
}

// 敌人碰撞检测
function checkEnemyCollisions() {
    for (let enemy of enemies) {
        if (!enemy.isDead && checkCollision(player, enemy)) {
            if (!player.invincible) {
                const damage = Math.max(1, enemy.attack - player.defense);
                playerHit(damage);
            }
        }
    }
}

// 玩家受伤
function playerHit(damage) {
    player.health -= damage;
    player.invincible = true;
    player.invincibleTimer = 60;
    
    if (player.health <= 0) {
        gameOver();
    }
}

// 金币碰撞检测
function checkCoinCollisions() {
    for (let coin of coins) {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            player.gold += 10;
        }
    }
}

// 尖刺碰撞检测
function checkSpikeCollisions() {
    for (let spike of spikes) {
        if (checkCollision(player, spike)) {
            if (!player.invincible) {
                playerHit(15);
            }
        }
    }
}

// 门碰撞检测
function checkDoorCollision() {
    if (door && checkCollision(player, door)) {
        // 检查是否所有敌人都被击败
        const allEnemiesDefeated = enemies.every(e => e.isDead);
        
        if (allEnemiesDefeated) {
            nextLevel();
        } else {
            showDialog("先击败所有敌人才能继续前进！");
        }
    }
}

// 公主碰撞检测
function checkPrincessCollision() {
    if (princess && !princess.rescued && checkCollision(player, princess)) {
        // 检查Boss是否被击败
        const bossDefeated = enemies.every(e => e.isDead);
        
        if (bossDefeated) {
            victory();
        }
    }
}

// NPC碰撞检测
function checkNPCCollision() {
    for (let npc of npcs) {
        if (checkCollision(player, npc)) {
            if (npc.type === 'shopkeeper' && !gameState.isShopOpen) {
                // 显示提示
                if (!gameState.showDialog) {
                    showDialog("按 E 打开商店");
                }
            } else if (npc.type === 'villager') {
                if (!gameState.showDialog) {
                    const dialogs = npcDialogs[npc.dialogIndex] || npcDialogs[0];
                    showDialog(dialogs[Math.floor(Math.random() * dialogs.length)]);
                }
            }
        }
    }
}

// 更新敌人
function updateEnemies() {
    for (let enemy of enemies) {
        if (enemy.isDead) continue;
        
        enemy.animTimer++;
        if (enemy.animTimer >= 15) {
            enemy.animTimer = 0;
            enemy.animFrame = (enemy.animFrame + 1) % 2;
        }
        
        // 巡逻移动
        if (enemy.type !== 'boss') {
            enemy.x += enemy.vx;
            
            if (enemy.x <= enemy.patrolStart || enemy.x >= enemy.patrolEnd) {
                enemy.vx *= -1;
            }
        } else {
            // Boss AI - 跟随玩家
            if (player.x > enemy.x + 10) {
                enemy.x += enemy.vx * 0.5;
            } else if (player.x < enemy.x - 10) {
                enemy.x -= enemy.vx * 0.5;
            }
        }
        
        // 限制在屏幕内
        if (enemy.x < 0) enemy.x = 0;
        if (enemy.x + enemy.width > CANVAS_WIDTH) enemy.x = CANVAS_WIDTH - enemy.width;
    }
}

// 更新NPC
function updateNPCs() {
    for (let npc of npcs) {
        npc.animTimer++;
        if (npc.animTimer >= 20) {
            npc.animTimer = 0;
            npc.animFrame = (npc.animFrame + 1) % 2;
        }
        
        // NPC自言自语
        npc.dialogTimer++;
        if (npc.dialogTimer >= 300) { // 每5秒说一次
            npc.dialogTimer = 0;
            if (!gameState.showDialog && !checkCollision(player, npc)) {
                const dialogs = npcDialogs[npc.dialogIndex] || npcDialogs[0];
                const randomDialog = dialogs[Math.floor(Math.random() * dialogs.length)];
                showDialog(randomDialog, 120); // 显示2秒
            }
        }
    }
}

// 显示对话框
function showDialog(text, duration = 180) {
    gameState.showDialog = true;
    gameState.dialogText = text;
    gameState.dialogTimer = duration;
    
    const dialogBox = document.getElementById('dialog-box');
    const dialogText = document.getElementById('dialog-text');
    dialogText.textContent = text;
    dialogBox.style.display = 'block';
}

// 下一关
function nextLevel() {
    gameState.currentLevel++;
    
    if (gameState.currentLevel >= levels.length) {
        victory();
    } else {
        loadLevel(gameState.currentLevel);
        showDialog("进入新区域！小心前方的危险...");
    }
}

// 游戏结束
function gameOver() {
    gameState.isPlaying = false;
    document.getElementById('game-over-screen').classList.remove('hidden');
}

// 胜利
function victory() {
    gameState.isPlaying = false;
    document.getElementById('victory-screen').classList.remove('hidden');
}

// 渲染游戏
function render() {
    const config = levels[gameState.currentLevel];
    
    // 清空画布
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制背景装饰
    drawBackground();
    
    // 绘制平台
    for (let plat of platforms) {
        drawPlatform(plat, config.platformColor);
    }
    
    // 绘制尖刺
    for (let spike of spikes) {
        drawSpikes(spike);
    }
    
    // 绘制门
    if (door) {
        drawDoor(door);
    }
    
    // 绘制公主
    if (princess) {
        drawPrincess(princess);
    }
    
    // 绘制金币
    for (let coin of coins) {
        if (!coin.collected) {
            drawCoin(coin);
        }
    }
    
    // 绘制NPC
    for (let npc of npcs) {
        drawNPC(npc);
    }
    
    // 绘制敌人
    for (let enemy of enemies) {
        if (!enemy.isDead) {
            drawEnemy(enemy);
        }
    }
    
    // 绘制玩家
    drawPlayer();
    
    // 更新对话框定时器
    if (gameState.showDialog) {
        gameState.dialogTimer--;
        if (gameState.dialogTimer <= 0) {
            gameState.showDialog = false;
            document.getElementById('dialog-box').style.display = 'none';
        }
    }
}

// 绘制背景装饰
function drawBackground() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    
    // 绘制一些背景星星或光点
    for (let i = 0; i < 20; i++) {
        const x = (i * 47) % CANVAS_WIDTH;
        const y = (i * 31) % (CANVAS_HEIGHT / 2);
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制平台
function drawPlatform(plat, color) {
    ctx.fillStyle = color;
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    
    // 绘制草皮顶部
    ctx.fillStyle = '#4a8f2a';
    ctx.fillRect(plat.x, plat.y, plat.width, 4);
    
    // 绘制纹理
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < plat.width; i += 16) {
        ctx.fillRect(plat.x + i, plat.y + 8, 8, 4);
    }
}

// 绘制尖刺
function drawSpikes(spike) {
    ctx.fillStyle = '#888';
    const spikeCount = Math.floor(spike.width / 8);
    
    for (let i = 0; i < spikeCount; i++) {
        ctx.beginPath();
        ctx.moveTo(spike.x + i * 8, spike.y + spike.height);
        ctx.lineTo(spike.x + i * 8 + 4, spike.y);
        ctx.lineTo(spike.x + i * 8 + 8, spike.y + spike.height);
        ctx.closePath();
        ctx.fill();
    }
}

// 绘制门
function drawDoor(doorObj) {
    // 门框
    ctx.fillStyle = '#5a3a2a';
    ctx.fillRect(doorObj.x, doorObj.y, doorObj.width, doorObj.height);
    
    // 门板
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(doorObj.x + 5, doorObj.y + 5, doorObj.width - 10, doorObj.height - 5);
    
    // 门把手
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(doorObj.x + doorObj.width - 12, doorObj.y + doorObj.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 通关标识
    const allEnemiesDefeated = enemies.every(e => e.isDead);
    if (allEnemiesDefeated) {
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText('★', doorObj.x + doorObj.width / 2 - 6, doorObj.y - 5);
    }
}

// 绘制公主
function drawPrincess(princessObj) {
    // 裙子
    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.moveTo(princessObj.x + princessObj.width / 2, princessObj.y);
    ctx.lineTo(princessObj.x + princessObj.width, princessObj.y + princessObj.height);
    ctx.lineTo(princessObj.x, princessObj.y + princessObj.height);
    ctx.closePath();
    ctx.fill();
    
    // 身体
    ctx.fillStyle = '#ffb6c1';
    ctx.fillRect(princessObj.x + 8, princessObj.y, 14, 20);
    
    // 头
    ctx.fillStyle = '#ffe4c4';
    ctx.beginPath();
    ctx.arc(princessObj.x + princessObj.width / 2, princessObj.y + 8, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 头发
    ctx.fillStyle = '#daa520';
    ctx.beginPath();
    ctx.arc(princessObj.x + princessObj.width / 2, princessObj.y + 6, 11, Math.PI, 2 * Math.PI);
    ctx.fill();
    
    // 皇冠
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(princessObj.x + 10, princessObj.y - 2, 10, 4);
    ctx.fillRect(princessObj.x + 12, princessObj.y - 5, 2, 3);
    ctx.fillRect(princessObj.x + 16, princessObj.y - 5, 2, 3);
    
    // 被困效果
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(princessObj.x - 5, princessObj.y - 5, princessObj.width + 10, princessObj.height + 10);
    ctx.setLineDash([]);
}

// 绘制金币
function drawCoin(coin) {
    coin.animFrame = (coin.animFrame + 0.1) % 4;
    const scaleX = Math.abs(Math.sin(coin.animFrame));
    
    ctx.save();
    ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
    ctx.scale(scaleX, 1);
    
    // 金币主体
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 高光
    ctx.fillStyle = '#ffec8b';
    ctx.beginPath();
    ctx.arc(-2, -2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 符号
    ctx.fillStyle = '#b8860b';
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
    
    ctx.restore();
}

// 绘制NPC
function drawNPC(npc) {
    npc.animFrame = Math.floor(npc.animFrame);
    
    // 身体
    ctx.fillStyle = npc.type === 'shopkeeper' ? '#8b4513' : '#4682b4';
    ctx.fillRect(npc.x + 5, npc.y + 15, 20, 25);
    
    // 头
    ctx.fillStyle = '#ffe4c4';
    ctx.beginPath();
    ctx.arc(npc.x + 15, npc.y + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // 头发
    ctx.fillStyle = npc.type === 'shopkeeper' ? '#654321' : '#8b7355';
    ctx.beginPath();
    ctx.arc(npc.x + 15, npc.y + 8, 13, Math.PI, 2 * Math.PI);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#000';
    const blink = npc.animFrame % 4 === 0 ? 1 : 2;
    ctx.fillRect(npc.x + 11, npc.y + 8, 2, blink);
    ctx.fillRect(npc.x + 17, npc.y + 8, 2, blink);
    
    // 微笑
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(npc.x + 15, npc.y + 12, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    // 商店招牌
    if (npc.type === 'shopkeeper') {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(npc.x - 10, npc.y - 15, 50, 12);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('商店', npc.x + 15, npc.y - 6);
    }
    
    // 对话气泡
    if (npc.dialogTimer > 250) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(npc.x + 15, npc.y - 25, 20, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 小尾巴
        ctx.beginPath();
        ctx.moveTo(npc.x + 15, npc.y - 13);
        ctx.lineTo(npc.x + 12, npc.y - 8);
        ctx.lineTo(npc.x + 18, npc.y - 13);
        ctx.fill();
    }
}

// 绘制敌人
function drawEnemy(enemy) {
    const frame = enemy.animFrame;
    
    switch(enemy.type) {
        case 'slime':
            drawSlime(enemy, frame);
            break;
        case 'bat':
            drawBat(enemy, frame);
            break;
        case 'wolf':
            drawWolf(enemy, frame);
            break;
        case 'knight':
            drawKnight(enemy, frame);
            break;
        case 'boss':
            drawBoss(enemy, frame);
            break;
    }
    
    // 血条
    if (enemy.health < enemy.maxHealth) {
        const healthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#ff9800' : '#f44336';
        ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
    }
}

// 绘制史莱姆
function drawSlime(enemy, frame) {
    const squash = frame === 0 ? 1 : 0.9;
    const stretch = frame === 0 ? 0.9 : 1;
    
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height,
        enemy.width / 2 * stretch,
        enemy.height / 2 * squash,
        0, Math.PI, 0
    );
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(enemy.x + 10, enemy.y + 15, 4, 0, Math.PI * 2);
    ctx.arc(enemy.x + 20, enemy.y + 15, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(enemy.x + 10, enemy.y + 15, 2, 0, Math.PI * 2);
    ctx.arc(enemy.x + 20, enemy.y + 15, 2, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制蝙蝠
function drawBat(enemy, frame) {
    ctx.fillStyle = '#4a1a4a';
    
    // 翅膀
    ctx.beginPath();
    if (frame === 0) {
        ctx.moveTo(enemy.x, enemy.y + 10);
        ctx.lineTo(enemy.x - 15, enemy.y - 5);
        ctx.lineTo(enemy.x + 5, enemy.y + 10);
    } else {
        ctx.moveTo(enemy.x, enemy.y + 10);
        ctx.lineTo(enemy.x - 15, enemy.y + 20);
        ctx.lineTo(enemy.x + 5, enemy.y + 10);
    }
    ctx.fill();
    
    ctx.beginPath();
    if (frame === 0) {
        ctx.moveTo(enemy.x + enemy.width, enemy.y + 10);
        ctx.lineTo(enemy.x + enemy.width + 15, enemy.y - 5);
        ctx.lineTo(enemy.x + enemy.width - 5, enemy.y + 10);
    } else {
        ctx.moveTo(enemy.x + enemy.width, enemy.y + 10);
        ctx.lineTo(enemy.x + enemy.width + 15, enemy.y + 20);
        ctx.lineTo(enemy.x + enemy.width - 5, enemy.y + 10);
    }
    ctx.fill();
    
    // 身体
    ctx.fillStyle = '#2a0a2a';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(enemy.x + 12, enemy.y + 13, 2, 0, Math.PI * 2);
    ctx.arc(enemy.x + 18, enemy.y + 13, 2, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制狼
function drawWolf(enemy, frame) {
    ctx.fillStyle = '#5a5a7a';
    
    // 身体
    ctx.fillRect(enemy.x, enemy.y + 10, enemy.width, 15);
    
    // 头
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width - 8, enemy.y + 12, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 耳朵
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width - 12, enemy.y + 5);
    ctx.lineTo(enemy.x + enemy.width - 8, enemy.y - 2);
    ctx.lineTo(enemy.x + enemy.width - 4, enemy.y + 5);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width - 5, enemy.y + 10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 腿
    ctx.fillStyle = '#4a4a6a';
    const legOffset = frame === 0 ? 0 : 3;
    ctx.fillRect(enemy.x + 5, enemy.y + 25, 6, 8 + legOffset);
    ctx.fillRect(enemy.x + enemy.width - 11, enemy.y + 25, 6, 8 - legOffset);
}

// 绘制骑士
function drawKnight(enemy, frame) {
    // 盔甲
    ctx.fillStyle = '#6a6a8a';
    ctx.fillRect(enemy.x + 4, enemy.y + 15, 24, 25);
    
    // 头盔
    ctx.fillStyle = '#5a5a7a';
    ctx.fillRect(enemy.x + 6, enemy.y, 20, 18);
    
    // 面罩缝隙
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(enemy.x + 10, enemy.y + 8, 12, 4);
    
    // 武器
    ctx.fillStyle = '#8a8aaa';
    if (frame === 0) {
        ctx.fillRect(enemy.x - 10, enemy.y + 20, 15, 4);
    } else {
        ctx.fillRect(enemy.x + enemy.width, enemy.y + 20, 15, 4);
    }
    
    // 眼睛（红色发光）
    ctx.fillStyle = '#f00';
    ctx.fillRect(enemy.x + 12, enemy.y + 9, 3, 2);
    ctx.fillRect(enemy.x + 17, enemy.y + 9, 3, 2);
}

// 绘制Boss
function drawBoss(enemy, frame) {
    // 披风
    ctx.fillStyle = '#4a0a0a';
    ctx.beginPath();
    ctx.moveTo(enemy.x + 10, enemy.y + 20);
    ctx.lineTo(enemy.x - 10, enemy.y + 60 + (frame === 0 ? -5 : 5));
    ctx.lineTo(enemy.x + 30, enemy.y + 60 + (frame === 0 ? -5 : 5));
    ctx.lineTo(enemy.x + 50, enemy.y + 20);
    ctx.fill();
    
    // 盔甲
    ctx.fillStyle = '#3a3a5a';
    ctx.fillRect(enemy.x + 10, enemy.y + 20, 40, 40);
    
    // 头盔
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(enemy.x + 15, enemy.y, 30, 25);
    
    // 角
    ctx.fillStyle = '#8a8aaa';
    ctx.beginPath();
    ctx.moveTo(enemy.x + 18, enemy.y + 5);
    ctx.lineTo(enemy.x + 12, enemy.y - 10);
    ctx.lineTo(enemy.x + 22, enemy.y + 5);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(enemy.x + 42, enemy.y + 5);
    ctx.lineTo(enemy.x + 48, enemy.y - 10);
    ctx.lineTo(enemy.x + 38, enemy.y + 5);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(enemy.x + 22, enemy.y + 12, 4, 0, Math.PI * 2);
    ctx.arc(enemy.x + 38, enemy.y + 12, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 王冠
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(enemy.x + 20, enemy.y - 8, 20, 6);
    ctx.fillRect(enemy.x + 22, enemy.y - 12, 4, 4);
    ctx.fillRect(enemy.x + 34, enemy.y - 12, 4, 4);
}

// 绘制玩家（王子）
function drawPlayer() {
    if (player.invincible && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
        return; // 闪烁效果
    }
    
    const frame = player.animFrame;
    
    // 披风
    ctx.fillStyle = '#dc143c';
    ctx.beginPath();
    if (player.facingRight) {
        ctx.moveTo(player.x + 8, player.y + 15);
        ctx.lineTo(player.x - 5 - (frame % 2) * 3, player.y + 35);
        ctx.lineTo(player.x + 8, player.y + 35);
    } else {
        ctx.moveTo(player.x + player.width - 8, player.y + 15);
        ctx.lineTo(player.x + player.width + 5 + (frame % 2) * 3, player.y + 35);
        ctx.lineTo(player.x + player.width - 8, player.y + 35);
    }
    ctx.fill();
    
    // 身体（盔甲）
    ctx.fillStyle = '#4a6fa5';
    ctx.fillRect(player.x + 6, player.y + 15, 16, 20);
    
    // 头
    ctx.fillStyle = '#ffe4c4';
    ctx.beginPath();
    ctx.arc(player.x + 14, player.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 头发
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(player.x + 14, player.y + 8, 11, Math.PI, 2 * Math.PI);
    ctx.fill();
    
    // 王冠
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(player.x + 9, player.y - 2, 10, 4);
    ctx.fillRect(player.x + 11, player.y - 5, 2, 3);
    ctx.fillRect(player.x + 15, player.y - 5, 2, 3);
    
    // 眼睛
    ctx.fillStyle = '#000';
    if (player.facingRight) {
        ctx.fillRect(player.x + 16, player.y + 8, 3, 3);
    } else {
        ctx.fillRect(player.x + 9, player.y + 8, 3, 3);
    }
    
    // 腿
    ctx.fillStyle = '#2a4a6a';
    const legOffset = (frame % 2) * 3;
    if (Math.abs(player.vx) > 0 && !player.isJumping) {
        ctx.fillRect(player.x + 8, player.y + 35, 6, 8 - legOffset);
        ctx.fillRect(player.x + 14, player.y + 35, 6, 8 + legOffset);
    } else {
        ctx.fillRect(player.x + 8, player.y + 35, 6, 8);
        ctx.fillRect(player.x + 14, player.y + 35, 6, 8);
    }
    
    // 攻击效果
    if (player.isAttacking) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        if (player.facingRight) {
            ctx.arc(player.x + player.width + 15, player.y + 20, 15, -Math.PI / 4, Math.PI / 4);
        } else {
            ctx.arc(player.x - 15, player.y + 20, 15, Math.PI * 0.75, Math.PI * 1.25);
        }
        ctx.fill();
    }
}

// 更新UI
function updateUI() {
    document.getElementById('health-display').textContent = Math.max(0, player.health);
    document.getElementById('gold-display').textContent = player.gold;
    document.getElementById('attack-display').textContent = player.attack;
    document.getElementById('defense-display').textContent = player.defense;
    
    // 更新商店按钮状态
    updateShopButtons();
}

// 打开商店
function openShop() {
    gameState.isShopOpen = true;
    document.getElementById('shop-overlay').style.display = 'flex';
    updateShopButtons();
}

// 关闭商店
function closeShop() {
    gameState.isShopOpen = false;
    document.getElementById('shop-overlay').style.display = 'none';
}

// 更新商店按钮状态
function updateShopButtons() {
    document.getElementById('btn-health').disabled = player.gold < 20;
    document.getElementById('btn-attack').disabled = player.gold < 50;
    document.getElementById('btn-defense').disabled = player.gold < 40;
    document.getElementById('btn-all').disabled = player.gold < 100;
}

// 购买物品
function buyItem(item) {
    switch(item) {
        case 'health':
            if (player.gold >= 20) {
                player.gold -= 20;
                player.health = Math.min(player.maxHealth, player.health + 20);
            }
            break;
        case 'attack':
            if (player.gold >= 50) {
                player.gold -= 50;
                player.attack += 5;
            }
            break;
        case 'defense':
            if (player.gold >= 40) {
                player.gold -= 40;
                player.defense += 3;
            }
            break;
        case 'all':
            if (player.gold >= 100) {
                player.gold -= 100;
                player.maxHealth += 10;
                player.health = Math.min(player.maxHealth, player.health + 10);
                player.attack += 3;
                player.defense += 2;
            }
            break;
    }
    updateUI();
}

// 矩形碰撞检测
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 通用矩形碰撞检测
function checkRectCollision(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
}

// 页面加载完成后初始化
window.onload = init;
