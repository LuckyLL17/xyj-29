// 商店系统
class ShopSystem {
    constructor() {
        this.initEventListeners();
    }
    
    initEventListeners() {
        // 监听金币变化
        gameState.on('coinsChanged', () => {
            this.updateShopUI();
        });
        
        // 监听食材解锁
        gameState.on('ingredientUnlocked', () => {
            this.updateShopUI();
        });
        
        // 监听设备升级
        gameState.on('equipmentUpgraded', () => {
            this.updateShopUI();
        });
    }
    
    // 打开商店
    open() {
        uiManager.openShop();
        this.updateShopUI();
    }
    
    // 关闭商店
    close() {
        uiManager.closeShop();
    }
    
    // 更新商店UI
    updateShopUI() {
        this.updateIngredientsTab();
        this.updateEquipmentTab();
    }
    
    // 更新食材标签页
    updateIngredientsTab() {
        const container = document.getElementById('ingredients-tab');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let id in CONFIG.ingredients) {
            const ingredient = CONFIG.ingredients[id];
            
            // 跳过免费的基础食材
            if (ingredient.price === 0) continue;
            
            const isUnlocked = gameState.unlockedIngredients.includes(id);
            const canAfford = gameState.coins >= ingredient.price;
            
            const item = this.createShopItem({
                id: id,
                type: 'ingredient',
                name: ingredient.name,
                emoji: ingredient.emoji,
                price: ingredient.price,
                isUnlocked: isUnlocked,
                canAfford: canAfford,
                description: `解锁后可以在汉堡中使用${ingredient.name}`,
            });
            
            container.appendChild(item);
        }
    }
    
    // 更新设备标签页
    updateEquipmentTab() {
        const container = document.getElementById('equipment-tab');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let id in CONFIG.equipment) {
            const equipment = CONFIG.equipment[id];
            const currentLevel = gameState.equipmentLevels[id];
            const nextLevel = currentLevel + 1;
            
            let nextLevelData = null;
            let isMaxLevel = false;
            
            if (nextLevel > equipment.levels.length) {
                isMaxLevel = true;
            } else {
                nextLevelData = equipment.levels[nextLevel - 1];
            }
            
            const currentLevelData = equipment.levels[currentLevel - 1];
            const canUpgrade = !isMaxLevel && gameState.coins >= (nextLevelData?.price || 0);
            
            const item = this.createShopItem({
                id: id,
                type: 'equipment',
                name: equipment.name,
                emoji: this.getEquipmentEmoji(id),
                price: isMaxLevel ? 0 : (nextLevelData?.price || 0),
                isUnlocked: isMaxLevel,
                canAfford: canUpgrade,
                currentLevel: currentLevel,
                maxLevel: equipment.levels.length,
                speedMultiplier: currentLevelData.speedMultiplier,
                isMaxLevel: isMaxLevel,
            });
            
            container.appendChild(item);
        }
    }
    
    // 获取设备emoji
    getEquipmentEmoji(equipmentId) {
        const emojis = {
            drinkMachine: '🥤',
            fryer: '🍟',
            grill: '🔥',
        };
        return emojis[equipmentId] || '🔧';
    }
    
    // 创建商店物品
    createShopItem(data) {
        const div = document.createElement('div');
        div.className = `shop-item ${data.isUnlocked ? 'owned' : ''}`;
        
        if (data.type === 'ingredient') {
            div.innerHTML = `
                <h4>${data.emoji} ${data.name}</h4>
                <p>${data.description || ''}</p>
                <p style="font-size: 0.9rem; color: ${data.isUnlocked ? '#4CAF50' : '#666'};">
                    ${data.isUnlocked ? '✅ 已解锁' : `💰 ${data.price} 金币`}
                </p>
                <button 
                    ${data.isUnlocked || !data.canAfford ? 'disabled' : ''}
                    data-type="ingredient"
                    data-id="${data.id}"
                    class="buy-btn"
                >
                    ${data.isUnlocked ? '已拥有' : (data.canAfford ? '解锁' : '金币不足')}
                </button>
            `;
        } else if (data.type === 'equipment') {
            div.innerHTML = `
                <h4>${data.emoji} ${data.name}</h4>
                <p>当前等级: ${data.currentLevel} / ${data.maxLevel}</p>
                <p>速度倍率: ${data.speedMultiplier}x</p>
                ${!data.isMaxLevel ? `
                    <p style="font-size: 0.9rem; color: #666;">
                        升级价格: 💰 ${data.price} 金币
                    </p>
                ` : '<p style="color: #4CAF50; font-weight: bold;">✨ 已满级</p>'}
                <button 
                    ${data.isMaxLevel || !data.canAfford ? 'disabled' : ''}
                    data-type="equipment"
                    data-id="${data.id}"
                    class="buy-btn"
                >
                    ${data.isMaxLevel ? '已满级' : (data.canAfford ? '升级' : '金币不足')}
                </button>
            `;
        }
        
        // 添加点击事件
        const btn = div.querySelector('.buy-btn');
        if (btn && !btn.disabled) {
            btn.addEventListener('click', () => {
                if (data.type === 'ingredient') {
                    this.buyIngredient(data.id);
                } else if (data.type === 'equipment') {
                    this.upgradeEquipment(data.id);
                }
            });
        }
        
        return div;
    }
    
    // 购买食材
    buyIngredient(ingredientId) {
        const ingredient = CONFIG.ingredients[ingredientId];
        if (!ingredient) return;
        
        // 检查是否已解锁
        if (gameState.unlockedIngredients.includes(ingredientId)) {
            uiManager.showNotification('该食材已经解锁了！', 'warning');
            return;
        }
        
        // 检查金币
        if (gameState.coins < ingredient.price) {
            uiManager.showNotification('金币不足！', 'error');
            return;
        }
        
        // 购买
        const success = gameState.unlockIngredient(ingredientId);
        
        if (success) {
            // 播放特效
            effectsSystem.playEffect('sparkle', {
                x: '50%',
                y: '50%',
                count: 15,
            });
            
            effectsSystem.playSound('coin');
            
            uiManager.showNotification(
                `🎉 解锁新食材：${ingredient.name}！`,
                'success'
            );
            
            // 更新UI
            this.updateShopUI();
            uiManager.updateIngredientsPanel();
        }
    }
    
    // 升级设备
    upgradeEquipment(equipmentId) {
        const equipment = CONFIG.equipment[equipmentId];
        if (!equipment) return;
        
        const currentLevel = gameState.equipmentLevels[equipmentId];
        const nextLevel = currentLevel + 1;
        
        // 检查是否已满级
        if (nextLevel > equipment.levels.length) {
            uiManager.showNotification('设备已经满级了！', 'warning');
            return;
        }
        
        const nextLevelData = equipment.levels[nextLevel - 1];
        
        // 检查金币
        if (gameState.coins < nextLevelData.price) {
            uiManager.showNotification('金币不足！', 'error');
            return;
        }
        
        // 升级
        const success = gameState.upgradeEquipment(equipmentId);
        
        if (success) {
            // 播放特效
            effectsSystem.playEffect('sparkle', {
                x: '50%',
                y: '50%',
                count: 20,
            });
            
            effectsSystem.playSound('success');
            
            uiManager.showNotification(
                `🔧 ${equipment.name} 升级到 ${nextLevel} 级！速度提升！`,
                'success'
            );
            
            // 更新UI
            this.updateShopUI();
        }
    }
    
    // 获取食材列表（已解锁）
    getUnlockedIngredients() {
        return gameState.unlockedIngredients.map(id => {
            return {
                id: id,
                ...CONFIG.ingredients[id],
            };
        });
    }
    
    // 获取设备列表
    getEquipmentList() {
        const list = [];
        
        for (let id in CONFIG.equipment) {
            const equipment = CONFIG.equipment[id];
            const currentLevel = gameState.equipmentLevels[id];
            const currentLevelData = equipment.levels[currentLevel - 1];
            
            list.push({
                id: id,
                name: equipment.name,
                currentLevel: currentLevel,
                maxLevel: equipment.levels.length,
                speedMultiplier: currentLevelData.speedMultiplier,
            });
        }
        
        return list;
    }
    
    // 检查是否可以购买
    canBuy(type, itemId) {
        if (type === 'ingredient') {
            const ingredient = CONFIG.ingredients[itemId];
            if (!ingredient) return false;
            if (gameState.unlockedIngredients.includes(itemId)) return false;
            return gameState.coins >= ingredient.price;
        } else if (type === 'equipment') {
            const equipment = CONFIG.equipment[itemId];
            if (!equipment) return false;
            const currentLevel = gameState.equipmentLevels[itemId];
            const nextLevel = currentLevel + 1;
            if (nextLevel > equipment.levels.length) return false;
            const nextLevelData = equipment.levels[nextLevel - 1];
            return gameState.coins >= nextLevelData.price;
        }
        return false;
    }
    
    // 计算升级总花费
    getTotalUpgradeCost() {
        let total = 0;
        
        // 食材
        for (let id in CONFIG.ingredients) {
            const ingredient = CONFIG.ingredients[id];
            if (ingredient.price > 0 && !gameState.unlockedIngredients.includes(id)) {
                total += ingredient.price;
            }
        }
        
        // 设备
        for (let id in CONFIG.equipment) {
            const equipment = CONFIG.equipment[id];
            const currentLevel = gameState.equipmentLevels[id];
            
            for (let i = currentLevel; i < equipment.levels.length; i++) {
                total += equipment.levels[i].price;
            }
        }
        
        return total;
    }
}

// 全局商店系统实例
const shopSystem = new ShopSystem();
