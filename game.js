// 主游戏逻辑
class Game {
    constructor() {
        this.gameLoopId = null;
        this.lastTime = 0;
        this.customerSpawnTimer = 0;
        this.customerSpawnInterval = CONFIG.game.customerSpawnInterval;
        
        this.init();
    }
    
    init() {
        // 尝试加载存档
        if (saveSystem.hasSave()) {
            saveSystem.load();
        }
        
        // 初始化UI
        uiManager.updateUI();
        
        // 监听游戏事件
        this.initEventListeners();
    }
    
    initEventListeners() {
        // 监听金币变化
        gameState.on('coinsChanged', (data) => {
            // 保存游戏（关键操作后保存）
            saveSystem.quickSave();
        });
        
        // 监听等级提升
        gameState.on('levelUp', (data) => {
            effectsSystem.playEffect('success', {
                message: `升级到 ${data.level} 级！`,
            });
            
            // 调整顾客生成间隔
            this.adjustCustomerSpawnInterval();
        });
        
        // 监听订单交付
        gameState.on('orderDelivered', (data) => {
            if (data.success) {
                // 播放金币特效
                effectsSystem.playEffect('coin', {
                    amount: data.reward,
                    x: '50%',
                    y: '40%',
                });
            } else {
                // 播放错误特效
                effectsSystem.playEffect('error', {
                    message: '订单错误！',
                });
            }
        });
        
        // 监听顾客离开
        gameState.on('customerRemoved', (data) => {
            Hooks.useSafeScene3D('removeCustomerModel', data.index);
        });
    }
    
    // 开始游戏循环
    startGameLoop() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        
        gameState.isPlaying = true;
        gameState.isPaused = false;
        this.lastTime = performance.now();
        this.customerSpawnTimer = 0;
        
        // 开始自动保存
        saveSystem.startAutoSave();
        
        // 立即生成第一个顾客
        this.spawnCustomer();
        
        this.gameLoop();
    }
    
    // 游戏主循环
    gameLoop() {
        if (!gameState.isPlaying) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!gameState.isPaused) {
            // 更新游戏逻辑
            this.update(deltaTime);
        }
        
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // 更新游戏逻辑
    update(deltaTime) {
        // 更新顾客生成计时器
        this.customerSpawnTimer += deltaTime;
        
        if (this.customerSpawnTimer >= this.customerSpawnInterval) {
            this.customerSpawnTimer = 0;
            this.spawnCustomer();
        }
        
        // 检查顾客超时
        this.checkCustomerTimeouts();
        
        // 更新UI
        uiManager.updateCustomerTimers();
    }
    
    // 生成顾客
    spawnCustomer() {
        // 检查是否还有空位
        if (gameState.customers.length >= gameState.maxCustomers) {
            console.log('顾客队列已满，等待空位...');
            return;
        }
        
        // 生成新顾客
        const customer = customerSystem.generateCustomer();
        
        // 检查订单是否可以制作
        const canMake = orderSystem.canMakeOrder(customer.order);
        
        if (!canMake.canMake) {
            console.log(`订单无法制作: ${canMake.reason}，重新生成...`);
            // 尝试重新生成，最多3次
            for (let i = 0; i < 3; i++) {
                const newCustomer = customerSystem.generateCustomer();
                const newCanMake = orderSystem.canMakeOrder(newCustomer.order);
                if (newCanMake.canMake) {
                    Object.assign(customer, newCustomer);
                    break;
                }
            }
        }
        
        // 添加顾客
        const added = gameState.addCustomer(customer);
        
        if (added) {
            const index = gameState.customers.length - 1;
            
            Hooks.useSafeScene3D('createCustomerModel', index);
            
            // 显示通知
            uiManager.showNotification(
                `👋 新顾客到来！订单: ${orderSystem.getOrderDescription(customer.order)}`,
                'info'
            );
            
            console.log(`顾客 ${customer.id} 已加入队列，位置: ${index}`);
        }
    }
    
    // 检查顾客超时
    checkCustomerTimeouts() {
        // 从后往前遍历，避免索引问题
        for (let i = gameState.customers.length - 1; i >= 0; i--) {
            const customer = gameState.customers[i];
            
            if (customerSystem.checkCustomerTimeout(customer)) {
                console.log(`顾客 ${customer.id} 等待超时，准备离开...`);
                
                // 顾客离开
                customerSystem.customerLeave(customer, i);
                
                // 从队列中移除
                gameState.removeCustomer(i);
                
                // 播放错误特效
                effectsSystem.playEffect('error', {
                    message: '顾客等待太久离开了！',
                });
            }
        }
    }
    
    // 调整顾客生成间隔（根据等级）
    adjustCustomerSpawnInterval() {
        const level = gameState.level;
        const baseInterval = CONFIG.game.customerSpawnInterval;
        
        // 等级越高，顾客来得越快
        this.customerSpawnInterval = Math.max(8000, baseInterval - (level - 1) * 2000);
        
        console.log(`顾客生成间隔调整为: ${this.customerSpawnInterval / 1000} 秒`);
    }
    
    // 暂停游戏
    pause() {
        if (!gameState.isPlaying) return;
        
        gameState.isPaused = true;
        uiManager.pauseGame();
        
        // 保存游戏
        saveSystem.quickSave();
    }
    
    // 继续游戏
    resume() {
        gameState.isPaused = false;
        uiManager.resumeGame();
    }
    
    // 退出游戏
    quit() {
        gameState.isPlaying = false;
        gameState.isPaused = false;
        
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        
        // 停止自动保存
        saveSystem.stopAutoSave();
        
        // 保存游戏
        saveSystem.save();
        
        // 清空顾客队列
        while (gameState.customers.length > 0) {
            const index = gameState.customers.length - 1;
            Hooks.useSafeScene3D('removeCustomerModel', index);
            gameState.removeCustomer(index);
        }
        
        console.log('游戏已退出');
    }
    
    // 重新开始游戏
    restart() {
        // 退出当前游戏
        this.quit();
        
        // 重置游戏状态
        gameState.reset();
        
        // 重新初始化
        this.init();
    }
    
    // 获取游戏统计
    getStats() {
        return {
            ...gameState.stats,
            currentCoins: gameState.coins,
            currentLevel: gameState.level,
            totalEarnings: gameState.totalEarnings,
            customersInQueue: gameState.customers.length,
            isPlaying: gameState.isPlaying,
            isPaused: gameState.isPaused,
        };
    }
}

// 全局游戏实例
const game = new Game();

// 页面可见性变化时处理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时保存游戏
        if (gameState.isPlaying) {
            saveSystem.quickSave();
        }
    }
});

// 页面卸载时保存
window.addEventListener('beforeunload', () => {
    if (gameState.isPlaying) {
        saveSystem.quickSave();
    }
});
