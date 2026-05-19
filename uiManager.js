// UI管理器
class UIManager {
    constructor() {
        // 使用公共Hooks
        this.configHook = Hooks.useConfig();
        this.notifyHook = Hooks.useNotification();
        this.craftingHook = Hooks.useCrafting();
        this.domHook = Hooks.useDOM();
        this.initElements();
        this.initEventListeners();
        this.initGameStateListeners();
    }
    
    initElements() {
        // 顶部状态栏
        this.coinsElement = document.getElementById('coins');
        this.levelElement = document.getElementById('level');
        this.levelProgressBar = document.getElementById('level-progress');
        this.levelProgressText = document.getElementById('level-progress-text');
        this.shopBtn = document.getElementById('shop-btn');
        
        // 顾客队列
        this.customerSlots = [
            document.getElementById('customer-1'),
            document.getElementById('customer-2'),
            document.getElementById('customer-3'),
        ];
        
        // 当前订单
        this.currentOrderPanel = document.getElementById('current-order');
        this.orderDetails = document.getElementById('order-details');
        this.deliverBtn = document.getElementById('deliver-order');
        
        // 制作区
        this.burgerStack = document.getElementById('burger-stack');
        this.craftingProgress = document.getElementById('crafting-progress');
        this.craftingProgressBar = this.craftingProgress.querySelector('.progress-fill');
        this.craftingProgressText = this.craftingProgress.querySelector('.progress-text');
        this.craftingButtons = document.getElementById('crafting-buttons');
        this.undoBtn = document.getElementById('undo-ingredient');
        this.completeBurgerBtn = document.getElementById('complete-burger');
        
        // 食材面板
        this.ingredientsList = document.getElementById('ingredients-list');
        
        // 饮料机
        this.drinkButtons = document.querySelectorAll('.drink-btn');
        this.pouringAnimation = document.getElementById('pouring-animation');
        
        // 炸锅
        this.fryBtn = document.getElementById('fry-fries');
        this.fryingProgress = document.getElementById('frying-progress');
        this.fryingProgressBar = this.fryingProgress.querySelector('.progress-fill');
        this.fryingProgressText = this.fryingProgress.querySelector('.progress-text');
        
        // 商店弹窗
        this.shopModal = document.getElementById('shop-modal');
        this.closeShopBtn = this.shopModal.querySelector('.close-btn');
        this.tabBtns = this.shopModal.querySelectorAll('.tab-btn');
        this.ingredientsTab = document.getElementById('ingredients-tab');
        this.equipmentTab = document.getElementById('equipment-tab');
        
        // 开始界面
        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-btn');
        this.tutorialBtn = document.getElementById('tutorial-btn');
        
        // 教程界面
        this.tutorialScreen = document.getElementById('tutorial-screen');
        this.prevTutorialBtn = document.getElementById('prev-tutorial');
        this.nextTutorialBtn = document.getElementById('next-tutorial');
        this.skipTutorialBtn = document.getElementById('skip-tutorial');
        this.tutorialSteps = document.querySelectorAll('.tutorial-step');
        this.currentTutorialStep = 0;
        
        // 暂停界面
        this.pauseScreen = document.getElementById('pause-screen');
        this.resumeBtn = document.getElementById('resume-btn');
        this.quitBtn = document.getElementById('quit-btn');
        
        // 通知容器
        this.notifications = document.getElementById('notifications');
    }
    
    initEventListeners() {
        // 商店按钮
        this.shopBtn.addEventListener('click', () => this.openShop());
        this.closeShopBtn.addEventListener('click', () => this.closeShop());
        
        // 顾客槽点击
        this.customerSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => this.selectCustomer(index));
        });
        
        // 交付按钮
        this.deliverBtn.addEventListener('click', () => this.deliverOrder());
        
        // 制作按钮
        this.undoBtn.addEventListener('click', () => this.undoIngredient());
        this.completeBurgerBtn.addEventListener('click', () => this.completeBurger());
        
        // 饮料按钮
        this.drinkButtons.forEach(btn => {
            btn.addEventListener('click', () => this.makeDrink(btn.dataset.drink));
        });
        
        // 炸薯条按钮
        this.fryBtn.addEventListener('click', () => this.makeFries());
        
        // 标签切换
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // 开始界面
        this.startBtn.addEventListener('click', () => this.startGame());
        this.tutorialBtn.addEventListener('click', () => this.showTutorial());
        
        // 教程界面
        this.prevTutorialBtn.addEventListener('click', () => this.prevTutorialStep());
        this.nextTutorialBtn.addEventListener('click', () => this.nextTutorialStep());
        this.skipTutorialBtn.addEventListener('click', () => this.skipTutorial());
        
        // 暂停界面
        this.resumeBtn.addEventListener('click', () => this.resumeGame());
        this.quitBtn.addEventListener('click', () => this.quitGame());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (gameState.isPlaying && !gameState.isPaused) {
                    this.pauseGame();
                } else if (gameState.isPaused) {
                    this.resumeGame();
                }
            }
        });
    }
    
    initGameStateListeners() {
        // 金币变化
        gameState.on('coinsChanged', (data) => {
            this.updateCoins(data.coins);
        });
        
        // 等级提升
        gameState.on('levelUp', (data) => {
            this.updateLevel(data.level);
            this.notifyHook.success(`🎉 恭喜升级到 ${data.level} 级！`);
        });
        
        // 顾客添加
        gameState.on('customerAdded', (data) => {
            this.updateCustomerSlot(data.index, data.customer);
        });
        
        // 顾客移除
        gameState.on('customerRemoved', (data) => {
            this.clearCustomerSlot(data.index);
            this.updateAllCustomerSlots();
        });
        
        // 顾客选中
        gameState.on('customerSelected', (data) => {
            this.highlightSelectedCustomer(data.index);
            this.showOrderDetails(data.order);
            gameState.startNewOrder();
        });
        
        // 订单取消选中
        gameState.on('orderDeselected', () => {
            this.hideOrderDetails();
            this.clearHighlights();
        });
        
        // 食材添加
        gameState.on('ingredientAdded', (data) => {
            this.updateBurgerStack(data.stack);
            this.updateCraftingButtons();
        });
        
        // 食材移除
        gameState.on('ingredientRemoved', (data) => {
            this.updateBurgerStack(data.stack);
            this.updateCraftingButtons();
        });
        
        // 订单重置
        gameState.on('orderReset', () => {
            this.clearBurgerStack();
        });
        
        // 汉堡完成
        gameState.on('burgerCompleted', (data) => {
            this.hideCraftingButtons();
        });
        
        // 订单交付
        gameState.on('orderDelivered', (data) => {
            if (data.success) {
                this.notifyHook.success(`✅ 订单完成！获得 ${data.reward} 金币`);
            } else {
                this.notifyHook.error(`❌ 订单错误：${data.message}。扣除 ${data.penalty} 金币`);
            }
        });
        
        // 快速交付奖励
        gameState.on('fastDelivery', (data) => {
            this.notifyHook.success(`⚡ 快速交付奖励 +${data.bonus} 金币！`);
        });
        
        // 食材解锁
        gameState.on('ingredientUnlocked', (data) => {
            this.notifyHook.success(`🔓 解锁新食材：${this.configHook.getIngredientName(data.ingredientId)}`);
            this.updateIngredientsPanel();
        });
        
        // 设备升级
        gameState.on('equipmentUpgraded', (data) => {
            const equipment = this.configHook.getEquipment(data.equipmentId);
            this.notifyHook.success(`🔧 ${equipment.name} 升级到 ${data.newLevel} 级！`);
        });
    }
    
    // 更新UI显示
    updateUI() {
        this.updateCoins(gameState.coins);
        this.updateLevel(gameState.level);
        this.updateIngredientsPanel();
        this.updateShop();
    }
    
    updateCoins(coins) {
        this.coinsElement.textContent = coins;
        this.coinsElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.coinsElement.style.transform = 'scale(1)';
        }, 200);
        
        this.updateLevelProgress();
    }
    
    updateLevel(level) {
        this.levelElement.textContent = level;
        this.updateLevelProgress();
    }
    
    updateLevelProgress() {
        const progress = gameState.getLevelProgress();
        
        if (progress.isMaxLevel) {
            this.levelProgressBar.style.width = '100%';
            this.levelProgressText.textContent = '已满级';
        } else {
            const progressAmount = progress.currentCoins - (CONFIG.levels[progress.currentLevel]?.requiredCoins || 0);
            const neededAmount = progress.requiredCoins - (CONFIG.levels[progress.currentLevel]?.requiredCoins || 0);
            
            this.levelProgressBar.style.width = `${progress.progress}%`;
            this.levelProgressText.textContent = `${progressAmount}/${neededAmount}`;
        }
    }
    
    // 顾客相关
    updateCustomerSlot(index, customer) {
        if (index >= this.customerSlots.length) return;
        
        const slot = this.customerSlots[index];
        const icon = slot.querySelector('.customer-icon');
        const orderDisplay = slot.querySelector('.order-display');
        
        icon.textContent = customer.icon;
        orderDisplay.textContent = this.getOrderSummary(customer.order);
        
        slot.style.display = 'block';
    }
    
    clearCustomerSlot(index) {
        if (index >= this.customerSlots.length) return;
        this.customerSlots[index].style.display = 'none';
    }
    
    updateAllCustomerSlots() {
        // 重新排列顾客
        for (let i = 0; i < this.customerSlots.length; i++) {
            if (i < gameState.customers.length) {
                this.updateCustomerSlot(i, gameState.customers[i]);
            } else {
                this.clearCustomerSlot(i);
            }
        }
    }
    
    getOrderSummary(order) {
        if (!order) return '';
        
        const items = [];
        if (order.items.burger) {
            items.push('🍔');
        }
        if (order.items.drinks) {
            order.items.drinks.forEach(drink => {
                items.push(CONFIG.drinks[drink].emoji);
            });
        }
        if (order.items.fries) {
            items.push('🍟');
        }
        
        return items.join(' ');
    }
    
    highlightSelectedCustomer(index) {
        this.customerSlots.forEach((slot, i) => {
            if (i === index) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }
    
    clearHighlights() {
        this.customerSlots.forEach(slot => {
            slot.classList.remove('active');
        });
    }
    
    selectCustomer(index) {
        if (index >= gameState.customers.length) return;
        gameState.selectCustomer(index);
    }
    
    // 订单详情
    showOrderDetails(order) {
        if (!order) return;
        
        let html = '<div style="margin-bottom: 10px;"><strong>订单内容：</strong></div>';
        
        if (order.items.burger) {
            const burgerType = order.items.burger.type;
            const burgerConfig = CONFIG.burgerTypes[burgerType];
            
            html += `<div style="margin-bottom: 8px;">
                <span>🍔 ${burgerConfig.name}</span>
                <div style="font-size: 0.85rem; color: #666; margin-left: 10px;">
                    配料：${order.items.burger.ingredients.map(id => CONFIG.ingredients[id].name).join(' → ')}
                </div>
            </div>`;
            
            // 显示特殊要求
            if (order.items.burger.exclude && order.items.burger.exclude.length > 0) {
                html += `<div style="color: #e74c3c; font-size: 0.85rem; margin-bottom: 8px;">
                    ⚠️ 不要：${order.items.burger.exclude.map(id => CONFIG.ingredients[id].name).join('、')}
                </div>`;
            }
        }
        
        if (order.items.drinks) {
            order.items.drinks.forEach(drinkId => {
                const drink = CONFIG.drinks[drinkId];
                html += `<div style="margin-bottom: 8px;">${drink.emoji} ${drink.name}</div>`;
            });
        }
        
        if (order.items.fries) {
            html += `<div style="margin-bottom: 8px;">🍟 薯条</div>`;
        }
        
        html += `<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
            <strong>总价：${order.totalPrice} 金币</strong>
        </div>`;
        
        this.orderDetails.innerHTML = html;
        this.currentOrderPanel.style.display = 'block';
    }
    
    hideOrderDetails() {
        this.currentOrderPanel.style.display = 'none';
    }
    
    // 汉堡堆叠
    updateBurgerStack(stack) {
        this.burgerStack.innerHTML = '';
        
        stack.forEach((ingredientId, index) => {
            const ingredient = CONFIG.ingredients[ingredientId];
            this.domHook.createElement('div', {
                className: `burger-ingredient ${ingredientId}`,
                textContent: ingredient.emoji,
                style: {
                    animationDelay: `${index * 0.1}s`
                },
                parent: this.burgerStack
            });
        });
    }
    
    clearBurgerStack() {
        this.burgerStack.innerHTML = '';
        this.hideCraftingButtons();
    }
    
    // 显示制作按钮
    showCraftingButtons() {
        if (this.craftingButtons) {
            this.craftingButtons.style.display = 'flex';
        }
    }
    
    // 隐藏制作按钮
    hideCraftingButtons() {
        if (this.craftingButtons) {
            this.craftingButtons.style.display = 'none';
        }
    }
    
    // 更新制作按钮显示状态
    updateCraftingButtons() {
        if (gameState.burgerStack.length > 0 && !gameState.completedItems.burger) {
            this.showCraftingButtons();
        } else {
            this.hideCraftingButtons();
        }
    }
    
    // 撤销最后一个食材
    undoIngredient() {
        if (gameState.isCrafting) {
            this.notifyHook.warning('⚠️ 请等待当前制作完成');
            return;
        }
        
        const ingredient = gameState.removeLastIngredient();
        if (ingredient) {
            const ingredientName = this.configHook.getIngredientName(ingredient);
            this.notifyHook.info(`↩️ 已撤销: ${ingredientName}`);
        } else {
            this.notifyHook.warning('⚠️ 没有可撤销的食材');
        }
        
        this.updateCraftingButtons();
    }
    
    // 完成汉堡
    completeBurger() {
        if (gameState.isCrafting) {
            this.notifyHook.warning('⚠️ 请等待当前制作完成');
            return;
        }
        
        if (gameState.burgerStack.length === 0) {
            this.notifyHook.warning('⚠️ 汉堡为空，无法完成');
            return;
        }
        
        if (gameState.completedItems.burger) {
            this.notifyHook.warning('⚠️ 汉堡已完成，无需重复操作');
            return;
        }
        
        gameState.completeBurger();
        this.hideCraftingButtons();
        this.notifyHook.success('✅ 汉堡已完成！');
        
        // 播放汉堡完成特效
        effectsSystem.playEffect('success', {
            message: '汉堡完成！',
            x: '50%',
            y: '50%',
        });
    }
    
    // 交付订单
    deliverOrder() {
        if (!gameState.currentOrder) {
            this.notifyHook.warning('⚠️ 请先选择一个订单');
            return;
        }
        
        if (!gameState.checkOrderComplete()) {
            this.notifyHook.warning('⚠️ 订单还未完成，请继续制作');
            return;
        }
        
        gameState.deliverOrder();
    }
    
    // 制作饮料
    makeDrink(drinkId) {
        this.craftingHook.startCrafting({
            type: 'drink',
            itemId: drinkId,
            equipmentId: 'drinkMachine',
            onStart: () => {
                this.showPouringAnimation(drinkId);
                this.craftingProgress.style.display = 'block';
                this.craftingProgressText.textContent = `正在制作${this.configHook.getDrinkName(drinkId)}...`;
            },
            onProgress: (progress) => {
                this.craftingProgressBar.style.width = `${progress}%`;
            },
            onComplete: () => this.finishDrink(drinkId)
        });
    }
    
    showPouringAnimation(drinkId) {
        const liquid = this.pouringAnimation.querySelector('.pouring-liquid');
        
        // 根据饮料类型设置颜色
        if (drinkId === 'cola') {
            liquid.style.background = 'linear-gradient(180deg, rgba(139, 69, 19, 0.9), rgba(70, 40, 10, 0.9))';
        } else if (drinkId === 'orange') {
            liquid.style.background = 'linear-gradient(180deg, rgba(255, 165, 0, 0.9), rgba(255, 140, 0, 0.9))';
        }
        
        this.pouringAnimation.style.display = 'block';
        
        // 重置动画
        liquid.style.animation = 'none';
        setTimeout(() => {
            liquid.style.animation = 'pourLiquid 2s linear';
        }, 10);
    }
    
    finishDrink(drinkId) {
        gameState.isCrafting = false;
        gameState.currentCraftingItem = null;
        gameState.addDrink(drinkId);
        
        this.craftingProgress.style.display = 'none';
        this.craftingProgressBar.style.width = '0%';
        this.pouringAnimation.style.display = 'none';
        
        this.notifyHook.success(`✅ ${this.configHook.getDrinkName(drinkId)} 制作完成！`);
    }
    
    // 炸薯条
    makeFries() {
        this.craftingHook.startCrafting({
            type: 'fries',
            itemId: 'fries',
            equipmentId: 'fryer',
            checkCanCraft: () => {
                if (gameState.completedItems.fries) {
                    this.notifyHook.warning('⚠️ 薯条已经炸好了');
                    return false;
                }
                return true;
            },
            onStart: () => {
                this.fryingProgress.style.display = 'block';
                this.fryingProgressText.textContent = '正在炸薯条...';
                this.fryBtn.disabled = true;
            },
            onProgress: (progress) => {
                this.fryingProgressBar.style.width = `${progress}%`;
            },
            onComplete: () => this.finishFries()
        });
    }
    
    finishFries() {
        gameState.isCrafting = false;
        gameState.currentCraftingItem = null;
        gameState.completeFries();
        
        this.fryingProgress.style.display = 'none';
        this.fryingProgressBar.style.width = '0%';
        this.fryBtn.disabled = false;
        
        this.notifyHook.success('✅ 薯条炸好了！');
    }
    
    // 食材面板
    updateIngredientsPanel() {
        this.ingredientsList.innerHTML = '';
        
        gameState.unlockedIngredients.forEach(ingredientId => {
            const ingredient = CONFIG.ingredients[ingredientId];
            const btn = this.domHook.createElement('button', {
                className: 'ingredient-btn',
                textContent: ingredient.emoji,
                title: ingredient.name,
                parent: this.ingredientsList
            });
            btn.addEventListener('click', () => this.addIngredient(ingredientId));
        });
    }
    
    addIngredient(ingredientId) {
        this.craftingHook.startCrafting({
            type: 'ingredient',
            itemId: ingredientId,
            equipmentId: 'grill',
            checkCanCraft: () => {
                if (!gameState.currentOrder) {
                    this.notifyHook.warning('⚠️ 请先选择一个订单');
                    return false;
                }
                if (gameState.completedItems.burger) {
                    this.notifyHook.warning('⚠️ 汉堡已完成，无需再添加配料');
                    return false;
                }
                return true;
            },
            onStart: () => {
                this.craftingProgress.style.display = 'block';
                this.craftingProgressText.textContent = `正在准备${this.configHook.getIngredientName(ingredientId)}...`;
            },
            onProgress: (progress) => {
                this.craftingProgressBar.style.width = `${progress}%`;
            },
            onComplete: () => this.finishIngredient(ingredientId)
        });
    }
    
    finishIngredient(ingredientId) {
        gameState.isCrafting = false;
        gameState.currentCraftingItem = null;
        gameState.addIngredientToBurger(ingredientId);
        
        this.craftingProgress.style.display = 'none';
        this.craftingProgressBar.style.width = '0%';
    }
    
    // 商店相关
    openShop() {
        this.updateShop();
        this.shopModal.style.display = 'flex';
    }
    
    closeShop() {
        this.shopModal.style.display = 'none';
    }
    
    switchTab(tabId) {
        this.tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        if (tabId === 'ingredients') {
            this.ingredientsTab.style.display = 'grid';
            this.equipmentTab.style.display = 'none';
        } else {
            this.ingredientsTab.style.display = 'none';
            this.equipmentTab.style.display = 'grid';
        }
    }
    
    updateShop() {
        this.updateIngredientsShop();
        this.updateEquipmentShop();
    }
    
    updateIngredientsShop() {
        this.ingredientsTab.innerHTML = '';
        
        for (let id in CONFIG.ingredients) {
            const ingredient = CONFIG.ingredients[id];
            if (ingredient.price === 0) continue; // 跳过免费食材
            
            const isUnlocked = gameState.unlockedIngredients.includes(id);
            const canAfford = gameState.coins >= ingredient.price;
            
            const div = this.domHook.createElement('div', {
                className: `shop-item ${isUnlocked ? 'owned' : ''}`,
                innerHTML: `
                    <h4>${ingredient.emoji} ${ingredient.name}</h4>
                    <p>${isUnlocked ? '已解锁' : `${ingredient.price} 金币`}</p>
                    <button ${isUnlocked || !canAfford ? 'disabled' : ''} data-ingredient="${id}">
                        ${isUnlocked ? '已拥有' : '解锁'}
                    </button>
                `,
                parent: this.ingredientsTab
            });
            
            if (!isUnlocked && canAfford) {
                const btn = div.querySelector('button');
                btn.addEventListener('click', () => {
                    if (gameState.unlockIngredient(id)) {
                        this.updateShop();
                    }
                });
            }
        }
    }
    
    updateEquipmentShop() {
        this.equipmentTab.innerHTML = '';
        
        for (let id in CONFIG.equipment) {
            const equipment = CONFIG.equipment[id];
            const currentLevel = gameState.equipmentLevels[id];
            const nextLevel = currentLevel + 1;
            
            let nextLevelData = null;
            if (nextLevel <= equipment.levels.length) {
                nextLevelData = equipment.levels[nextLevel - 1];
            }
            
            const canUpgrade = nextLevelData !== null && gameState.coins >= nextLevelData.price;
            const speedMultiplier = equipment.levels[currentLevel - 1].speedMultiplier;
            
            const div = this.domHook.createElement('div', {
                className: 'shop-item',
                innerHTML: `
                    <h4>${equipment.name}</h4>
                    <p>当前等级: ${currentLevel}</p>
                    <p>速度倍率: ${speedMultiplier}x</p>
                    ${nextLevelData ? `
                        <p>升级价格: ${nextLevelData.price} 金币</p>
                        <button ${!canUpgrade ? 'disabled' : ''} data-equipment="${id}">
                            升级到 ${nextLevel} 级
                        </button>
                    ` : '<p style="color: #4CAF50;">已满级</p>'}
                `,
                parent: this.equipmentTab
            });
            
            if (canUpgrade) {
                const btn = div.querySelector('button');
                btn.addEventListener('click', () => {
                    if (gameState.upgradeEquipment(id)) {
                        this.updateShop();
                    }
                });
            }
        }
    }
    
    // 游戏流程
    startGame() {
        this.startScreen.style.display = 'none';
        gameState.isPlaying = true;
        game.startGameLoop();
        this.updateUI();
    }
    
    showTutorial() {
        this.startScreen.style.display = 'none';
        this.tutorialScreen.style.display = 'flex';
        this.currentTutorialStep = 0;
        this.updateTutorialDisplay();
    }
    
    updateTutorialDisplay() {
        this.tutorialSteps.forEach((step, index) => {
            if (index === this.currentTutorialStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        this.prevTutorialBtn.disabled = this.currentTutorialStep === 0;
        this.nextTutorialBtn.textContent = this.currentTutorialStep === this.tutorialSteps.length - 1 ? '完成' : '下一步';
    }
    
    prevTutorialStep() {
        if (this.currentTutorialStep > 0) {
            this.currentTutorialStep--;
            this.updateTutorialDisplay();
        }
    }
    
    nextTutorialStep() {
        if (this.currentTutorialStep < this.tutorialSteps.length - 1) {
            this.currentTutorialStep++;
            this.updateTutorialDisplay();
        } else {
            this.skipTutorial();
        }
    }
    
    skipTutorial() {
        this.tutorialScreen.style.display = 'none';
        this.startGame();
    }
    
    pauseGame() {
        gameState.isPaused = true;
        this.pauseScreen.style.display = 'flex';
    }
    
    resumeGame() {
        gameState.isPaused = false;
        this.pauseScreen.style.display = 'none';
    }
    
    quitGame() {
        gameState.isPlaying = false;
        gameState.isPaused = false;
        this.pauseScreen.style.display = 'none';
        this.startScreen.style.display = 'flex';
        
        // 保存游戏
        saveSystem.save();
    }
    
    // 通知系统
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = 'ℹ️';
        switch (type) {
            case 'success': icon = '✅'; break;
            case 'error': icon = '❌'; break;
            case 'warning': icon = '⚠️'; break;
        }
        
        notification.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        this.notifications.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 更新顾客等待时间显示
    updateCustomerTimers() {
        gameState.customers.forEach((customer, index) => {
            if (index >= this.customerSlots.length) return;
            
            const slot = this.customerSlots[index];
            const timerFill = slot.querySelector('.timer-fill');
            const timerBar = slot.querySelector('.timer-bar');
            
            const elapsed = Date.now() - customer.arrivalTime;
            const remaining = Math.max(0, customer.maxWaitTime - elapsed);
            const percentage = (remaining / customer.maxWaitTime) * 100;
            
            timerFill.style.width = `${percentage}%`;
            
            // 更改颜色
            timerFill.classList.remove('warning', 'danger');
            if (percentage < 30) {
                timerFill.classList.add('danger');
            } else if (percentage < 60) {
                timerFill.classList.add('warning');
            }
        });
    }
}

// 全局UI管理器实例
const uiManager = new UIManager();
