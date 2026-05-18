// 游戏状态管理
class GameState {
    constructor() {
        this.reset();
    }
    
    reset() {
        // 基础游戏状态
        this.isPlaying = false;
        this.isPaused = false;
        this.gameTime = 0;
        
        // 玩家状态
        this.coins = CONFIG.game.initialCoins;
        this.level = CONFIG.game.initialLevel;
        this.totalEarnings = 0;
        
        // 顾客状态
        this.customers = []; // 当前顾客队列
        this.maxCustomers = CONFIG.game.maxCustomers;
        
        // 当前选中的顾客和订单
        this.selectedCustomerIndex = null;
        this.currentOrder = null;
        
        // 制作状态
        this.isCrafting = false;
        this.currentCraftingItem = null;
        this.craftingProgress = 0;
        this.craftingTimer = null;
        
        // 汉堡堆叠状态
        this.burgerStack = [];
        
        // 已完成的物品
        this.completedItems = {
            burger: null,
            drinks: [],
            fries: false,
        };
        
        // 设备等级
        this.equipmentLevels = {
            drinkMachine: 1,
            fryer: 1,
            grill: 1,
        };
        
        // 已解锁的食材
        this.unlockedIngredients = [];
        
        // 初始化默认解锁的食材
        for (let key in CONFIG.ingredients) {
            if (CONFIG.ingredients[key].unlocked) {
                this.unlockedIngredients.push(key);
            }
        }
        
        // 统计数据
        this.stats = {
            totalCustomers: 0,
            happyCustomers: 0,
            unhappyCustomers: 0,
            ordersCompleted: 0,
            ordersFailed: 0,
            totalCoinsEarned: 0,
            totalCoinsLost: 0,
        };
        
        // 事件系统
        this.listeners = {};
    }
    
    // 事件监听
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    // 触发事件
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    // 金币操作
    addCoins(amount) {
        this.coins += amount;
        this.totalEarnings += amount;
        this.stats.totalCoinsEarned += amount;
        this.emit('coinsChanged', { coins: this.coins, change: amount });
        this.checkLevelUp();
    }
    
    removeCoins(amount) {
        this.coins = Math.max(0, this.coins - amount);
        this.stats.totalCoinsLost += amount;
        this.emit('coinsChanged', { coins: this.coins, change: -amount });
    }
    
    // 检查升级
    checkLevelUp() {
        const levels = CONFIG.levels;
        let newLevel = this.level;
        
        for (let lvl in levels) {
            if (this.totalEarnings >= levels[lvl].requiredCoins) {
                newLevel = parseInt(lvl);
            }
        }
        
        if (newLevel > this.level) {
            this.level = newLevel;
            this.emit('levelUp', { level: this.level });
            return true;
        }
        return false;
    }
    
    // 获取等级进度
    getLevelProgress() {
        const currentLevel = this.level;
        const levels = CONFIG.levels;
        const maxLevel = Object.keys(levels).length;
        
        if (currentLevel >= maxLevel) {
            return {
                currentLevel: maxLevel,
                nextLevel: null,
                currentCoins: this.totalEarnings,
                requiredCoins: null,
                progress: 100,
                isMaxLevel: true,
            };
        }
        
        const nextLevel = currentLevel + 1;
        const currentLevelConfig = levels[currentLevel];
        const nextLevelConfig = levels[nextLevel];
        
        const currentRequired = currentLevelConfig?.requiredCoins || 0;
        const nextRequired = nextLevelConfig.requiredCoins;
        const progressAmount = this.totalEarnings - currentRequired;
        const neededAmount = nextRequired - currentRequired;
        const progress = Math.min(100, (progressAmount / neededAmount) * 100);
        
        return {
            currentLevel: currentLevel,
            nextLevel: nextLevel,
            currentCoins: this.totalEarnings,
            requiredCoins: nextRequired,
            progress: Math.max(0, progress),
            isMaxLevel: false,
        };
    }
    
    // 顾客操作
    addCustomer(customer) {
        if (this.customers.length >= this.maxCustomers) {
            return false;
        }
        
        this.customers.push(customer);
        this.stats.totalCustomers++;
        this.emit('customerAdded', { customer, index: this.customers.length - 1 });
        return true;
    }
    
    removeCustomer(index) {
        if (index < 0 || index >= this.customers.length) {
            return null;
        }
        
        const customer = this.customers.splice(index, 1)[0];
        
        // 如果移除的是当前选中的顾客
        if (this.selectedCustomerIndex === index) {
            this.selectedCustomerIndex = null;
            this.currentOrder = null;
            this.emit('orderDeselected');
        } else if (this.selectedCustomerIndex > index) {
            this.selectedCustomerIndex--;
        }
        
        this.emit('customerRemoved', { customer, index });
        return customer;
    }
    
    selectCustomer(index) {
        if (index < 0 || index >= this.customers.length) {
            return false;
        }
        
        this.selectedCustomerIndex = index;
        this.currentOrder = this.customers[index].order;
        this.emit('customerSelected', { index, order: this.currentOrder });
        return true;
    }
    
    // 订单操作
    startNewOrder() {
        this.burgerStack = [];
        this.completedItems = {
            burger: null,
            drinks: [],
            fries: false,
        };
        this.emit('orderReset');
    }
    
    // 汉堡堆叠操作
    addIngredientToBurger(ingredientId) {
        if (this.isCrafting) {
            return false;
        }
        
        if (this.completedItems.burger) {
            return false;
        }
        
        const ingredient = CONFIG.ingredients[ingredientId];
        if (!ingredient) {
            return false;
        }
        
        this.burgerStack.push(ingredientId);
        this.emit('ingredientAdded', { ingredientId, stack: [...this.burgerStack] });
        return true;
    }
    
    removeLastIngredient() {
        if (this.burgerStack.length === 0 || this.isCrafting) {
            return null;
        }
        
        const ingredient = this.burgerStack.pop();
        this.emit('ingredientRemoved', { ingredientId: ingredient, stack: [...this.burgerStack] });
        return ingredient;
    }
    
    // 完成汉堡
    completeBurger() {
        this.completedItems.burger = [...this.burgerStack];
        this.emit('burgerCompleted', { burger: this.completedItems.burger });
    }
    
    // 添加饮料
    addDrink(drinkId) {
        this.completedItems.drinks.push(drinkId);
        this.emit('drinkAdded', { drinkId, drinks: [...this.completedItems.drinks] });
    }
    
    // 完成薯条
    completeFries() {
        this.completedItems.fries = true;
        this.emit('friesCompleted');
    }
    
    // 检查订单完成
    checkOrderComplete() {
        if (!this.currentOrder) {
            return false;
        }
        
        // 检查汉堡
        if (this.currentOrder.items.burger) {
            if (!this.completedItems.burger) {
                return false;
            }
        }
        
        // 检查饮料
        if (this.currentOrder.items.drinks) {
            if (this.completedItems.drinks.length !== this.currentOrder.items.drinks.length) {
                return false;
            }
        }
        
        // 检查薯条
        if (this.currentOrder.items.fries) {
            if (!this.completedItems.fries) {
                return false;
            }
        }
        
        return true;
    }
    
    // 验证订单
    validateOrder() {
        if (!this.currentOrder) {
            return { valid: false, message: '没有当前订单' };
        }
        
        const order = this.currentOrder.items;
        const completed = this.completedItems;
        const errors = [];
        
        // 验证汉堡
        if (order.burger) {
            if (!completed.burger) {
                errors.push('缺少汉堡');
            } else {
                const expectedIngredients = order.burger.ingredients;
                const actualIngredients = completed.burger;
                
                // 检查数量
                if (expectedIngredients.length !== actualIngredients.length) {
                    errors.push(`汉堡配料数量不正确：期望${expectedIngredients.length}个，实际${actualIngredients.length}个`);
                }
                
                // 检查每个配料
                for (let i = 0; i < Math.min(expectedIngredients.length, actualIngredients.length); i++) {
                    if (expectedIngredients[i] !== actualIngredients[i]) {
                        errors.push(`汉堡配料顺序错误：位置${i + 1}期望${CONFIG.ingredients[expectedIngredients[i]]?.name || '未知'}，实际${CONFIG.ingredients[actualIngredients[i]]?.name || '未知'}`);
                    }
                }
            }
        }
        
        // 验证饮料
        if (order.drinks) {
            if (completed.drinks.length !== order.drinks.length) {
                errors.push(`饮料数量不正确：期望${order.drinks.length}杯，实际${completed.drinks.length}杯`);
            } else {
                // 检查每种饮料
                const expectedDrinks = [...order.drinks].sort();
                const actualDrinks = [...completed.drinks].sort();
                
                for (let i = 0; i < expectedDrinks.length; i++) {
                    if (expectedDrinks[i] !== actualDrinks[i]) {
                        errors.push('饮料种类不正确');
                        break;
                    }
                }
            }
        }
        
        // 验证薯条
        if (order.fries) {
            if (!completed.fries) {
                errors.push('缺少薯条');
            }
        }
        
        if (errors.length > 0) {
            return {
                valid: false,
                message: errors.join('；'),
            };
        }
        
        return {
            valid: true,
            message: '订单正确！',
        };
    }
    
    // 交付订单
    deliverOrder() {
        const validation = this.validateOrder();
        
        if (validation.valid) {
            // 计算奖励
            let reward = this.currentOrder.totalPrice;
            
            // 检查是否快速交付
            const customer = this.customers[this.selectedCustomerIndex];
            const waitTime = Date.now() - customer.arrivalTime;
            const maxWaitTime = customer.maxWaitTime;
            
            if (waitTime < maxWaitTime * 0.3) {
                reward += CONFIG.rewards.fastDelivery;
                this.emit('fastDelivery', { bonus: CONFIG.rewards.fastDelivery });
            }
            
            // 完美订单奖励
            reward += CONFIG.rewards.perfectOrder;
            
            this.addCoins(reward);
            this.stats.ordersCompleted++;
            this.stats.happyCustomers++;
            
            // 移除顾客
            this.removeCustomer(this.selectedCustomerIndex);
            
            this.emit('orderDelivered', {
                success: true,
                reward,
                message: validation.message,
            });
            
            // 订单完成后清空操作台
            this.startNewOrder();
            
            return { success: true, reward };
        } else {
            // 订单错误 - 顾客不满意离开
            const penalty = CONFIG.penalties.wrongOrder;
            this.removeCoins(penalty);
            this.stats.ordersFailed++;
            this.stats.unhappyCustomers++;
            
            // 移除不满意的顾客
            const customerIndex = this.selectedCustomerIndex;
            this.removeCustomer(customerIndex);
            
            // 清空操作台
            this.startNewOrder();
            
            this.emit('orderDelivered', {
                success: false,
                penalty: penalty,
                message: validation.message,
            });
            
            return { success: false, penalty: penalty, message: validation.message };
        }
    }
    
    // 解锁食材
    unlockIngredient(ingredientId) {
        if (this.unlockedIngredients.includes(ingredientId)) {
            return false;
        }
        
        const ingredient = CONFIG.ingredients[ingredientId];
        if (!ingredient) {
            return false;
        }
        
        if (this.coins < ingredient.price) {
            return false;
        }
        
        this.removeCoins(ingredient.price);
        this.unlockedIngredients.push(ingredientId);
        this.emit('ingredientUnlocked', { ingredientId });
        return true;
    }
    
    // 升级设备
    upgradeEquipment(equipmentId) {
        const equipment = CONFIG.equipment[equipmentId];
        if (!equipment) {
            return false;
        }
        
        const currentLevel = this.equipmentLevels[equipmentId];
        const nextLevel = currentLevel + 1;
        
        if (nextLevel > equipment.levels.length) {
            return false;
        }
        
        const upgradeData = equipment.levels[nextLevel - 1];
        if (!upgradeData || this.coins < upgradeData.price) {
            return false;
        }
        
        this.removeCoins(upgradeData.price);
        this.equipmentLevels[equipmentId] = nextLevel;
        this.emit('equipmentUpgraded', { equipmentId, newLevel: nextLevel });
        return true;
    }
    
    // 获取设备速度倍率
    getEquipmentSpeed(equipmentId) {
        const level = this.equipmentLevels[equipmentId] || 1;
        const equipment = CONFIG.equipment[equipmentId];
        if (!equipment) return 1;
        
        const levelData = equipment.levels[level - 1];
        return levelData ? levelData.speedMultiplier : 1;
    }
    
    // 获取保存数据
    getSaveData() {
        return {
            coins: this.coins,
            level: this.level,
            totalEarnings: this.totalEarnings,
            equipmentLevels: this.equipmentLevels,
            unlockedIngredients: this.unlockedIngredients,
            stats: this.stats,
        };
    }
    
    // 加载保存数据
    loadSaveData(data) {
        if (!data) return false;
        
        this.coins = data.coins ?? CONFIG.game.initialCoins;
        this.level = data.level ?? CONFIG.game.initialLevel;
        this.totalEarnings = data.totalEarnings ?? 0;
        this.equipmentLevels = data.equipmentLevels ?? {
            drinkMachine: 1,
            fryer: 1,
            grill: 1,
        };
        this.unlockedIngredients = data.unlockedIngredients ?? this.getDefaultUnlockedIngredients();
        this.stats = data.stats ?? {
            totalCustomers: 0,
            happyCustomers: 0,
            unhappyCustomers: 0,
            ordersCompleted: 0,
            ordersFailed: 0,
            totalCoinsEarned: 0,
            totalCoinsLost: 0,
        };
        
        return true;
    }
    
    getDefaultUnlockedIngredients() {
        const unlocked = [];
        for (let key in CONFIG.ingredients) {
            if (CONFIG.ingredients[key].unlocked) {
                unlocked.push(key);
            }
        }
        return unlocked;
    }
}

// 全局游戏状态实例
const gameState = new GameState();
