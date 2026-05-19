// 制作系统
class CraftingSystem {
    constructor() {
        this.isCrafting = false;
        this.currentItem = null;
        this.craftingTimer = null;
        this.progress = 0;
        
        // 制作类型
        this.craftingTypes = {
            ingredient: this.craftIngredient.bind(this),
            drink: this.craftDrink.bind(this),
            fries: this.craftFries.bind(this),
        };
    }
    
    // 开始制作
    startCrafting(type, itemId) {
        if (this.isCrafting) {
            return {
                success: false,
                message: '正在制作中，请等待完成',
            };
        }
        
        // 检查是否有当前订单
        if (!gameState.currentOrder) {
            return {
                success: false,
                message: '请先选择一个订单',
            };
        }
        
        this.isCrafting = true;
        this.currentItem = { type, id: itemId };
        this.progress = 0;
        
        // 获取制作时间（考虑设备升级）
        const makeTime = this.getMakeTime(type, itemId);
        
        // 触发开始事件
        gameState.emit('craftingStart', {
            type: type,
            itemId: itemId,
            makeTime: makeTime,
        });
        
        // 开始计时
        const startTime = Date.now();
        const totalTime = makeTime;
        
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            this.progress = Math.min((elapsed / totalTime) * 100, 100);
            
            gameState.emit('craftingProgress', {
                type: type,
                itemId: itemId,
                progress: this.progress,
            });
            
            if (this.progress < 100) {
                this.craftingTimer = requestAnimationFrame(updateProgress);
            } else {
                this.finishCrafting();
            }
        };
        
        this.craftingTimer = requestAnimationFrame(updateProgress);
        
        return {
            success: true,
            message: '开始制作',
            makeTime: makeTime,
        };
    }
    
    // 获取制作时间
    getMakeTime(type, itemId) {
        let baseTime = 0;
        let equipmentId = null;
        
        switch (type) {
            case 'ingredient':
                baseTime = CONFIG.ingredients[itemId]?.makeTime || 1000;
                equipmentId = 'grill';
                break;
            case 'drink':
                baseTime = CONFIG.drinks[itemId]?.makeTime || 2000;
                equipmentId = 'drinkMachine';
                break;
            case 'fries':
                baseTime = CONFIG.fries.makeTime || 5000;
                equipmentId = 'fryer';
                break;
        }
        
        // 应用设备升级倍率
        const speedMultiplier = gameState.getEquipmentSpeed(equipmentId);
        return baseTime * speedMultiplier;
    }
    
    // 完成制作
    finishCrafting() {
        if (!this.currentItem) return;
        
        const { type, id: itemId } = this.currentItem;
        
        // 根据类型处理
        switch (type) {
            case 'ingredient':
                gameState.addIngredientToBurger(itemId);
                // 更新3D场景中的汉堡模型
                scene3D.createBurgerModel(gameState.burgerStack);
                break;
                
            case 'drink':
                gameState.addDrink(itemId);
                // 播放3D倒饮料动画
                scene3D.playPourAnimation(itemId);
                break;
                
            case 'fries':
                gameState.completeFries();
                // 播放3D炸薯条动画
                scene3D.playFryAnimation();
                break;
        }
        
        // 触发完成事件
        gameState.emit('craftingComplete', {
            type: type,
            itemId: itemId,
        });
        
        // 重置状态
        this.isCrafting = false;
        this.currentItem = null;
        this.progress = 0;
        
        if (this.craftingTimer) {
            cancelAnimationFrame(this.craftingTimer);
            this.craftingTimer = null;
        }
    }
    
    // 取消制作
    cancelCrafting() {
        if (!this.isCrafting) return;
        
        if (this.craftingTimer) {
            cancelAnimationFrame(this.craftingTimer);
            this.craftingTimer = null;
        }
        
        this.isCrafting = false;
        this.currentItem = null;
        this.progress = 0;
        
        gameState.emit('craftingCancelled', {});
    }
    
    // 制作食材
    craftIngredient(ingredientId) {
        return this.startCrafting('ingredient', ingredientId);
    }
    
    // 制作饮料
    craftDrink(drinkId) {
        return this.startCrafting('drink', drinkId);
    }
    
    // 制作薯条
    craftFries() {
        return this.startCrafting('fries', 'fries');
    }
    
    // 检查是否可以制作
    canCraft(type, itemId) {
        // 检查是否正在制作
        if (this.isCrafting) {
            return { canCraft: false, reason: '正在制作中' };
        }
        
        // 检查是否有当前订单
        if (!gameState.currentOrder) {
            return { canCraft: false, reason: '请先选择一个订单' };
        }
        
        // 检查食材是否已解锁
        if (type === 'ingredient') {
            if (!gameState.unlockedIngredients.includes(itemId)) {
                return { 
                    canCraft: false, 
                    reason: `食材 ${CONFIG.ingredients[itemId]?.name || itemId} 未解锁` 
                };
            }
        }
        
        // 检查是否已经制作了对应物品
        const order = gameState.currentOrder;
        
        switch (type) {
            case 'fries':
                if (order.items.fries && gameState.completedItems.fries) {
                    return { canCraft: false, reason: '薯条已经炸好了' };
                }
                if (!order.items.fries) {
                    return { canCraft: true, reason: '订单中没有薯条，但可以制作' };
                }
                break;
                
            case 'drink':
                if (order.items.drinks) {
                    const needed = commonHooks.useCountInArray(order.items.drinks, itemId);
                    const made = commonHooks.useCountInArray(gameState.completedItems.drinks, itemId);
                    if (made >= needed) {
                        return { canCraft: false, reason: `${CONFIG.drinks[itemId].name} 已经足够了` };
                    }
                }
                break;
                
            case 'ingredient':
                // 汉堡食材总是可以添加，最后验证
                break;
        }
        
        return { canCraft: true };
    }
    
    // 重置汉堡制作
    resetBurger() {
        gameState.burgerStack = [];
        gameState.completedItems.burger = null;
        
        // 更新UI
        uiManager.updateBurgerStack([]);
        
        // 更新3D场景
        scene3D.burgerMeshes.forEach(mesh => scene3D.scene.remove(mesh));
        scene3D.burgerMeshes = [];
        
        gameState.emit('burgerReset', {});
    }
    
    // 完成汉堡制作
    completeBurger() {
        if (gameState.burgerStack.length === 0) {
            return {
                success: false,
                message: '汉堡还没有添加任何配料',
            };
        }
        
        // 检查是否有顶层面包和底层面包
        const hasTop = gameState.burgerStack.includes('bunTop');
        const hasBottom = gameState.burgerStack.includes('bunBottom');
        
        if (!hasTop || !hasBottom) {
            return {
                success: false,
                message: '汉堡需要包含顶层面包和底层面包',
            };
        }
        
        gameState.completeBurger();
        
        return {
            success: true,
            message: '汉堡制作完成！',
            burger: gameState.completedItems.burger,
        };
    }
    
    // 获取当前制作进度
    getProgress() {
        return {
            isCrafting: this.isCrafting,
            currentItem: this.currentItem,
            progress: this.progress,
        };
    }
}

// 全局制作系统实例
const craftingSystem = new CraftingSystem();
