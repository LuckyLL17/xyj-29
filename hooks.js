/**
 * 公共 Hook 函数集
 * 提取自项目中多处重复的逻辑，统一管理以减少代码冗余
 */

const Hooks = {

    /**
     * useCraftingTimer - 制作进度计时器
     * uiManager.js 中 makeDrink / makeFries / addIngredient 三处
     * 都有相同的 "setInterval 递增 progress → 到 100% 清除并回调" 逻辑
     *
     * @param {number} makeTime  制作总耗时（毫秒）
     * @param {Function} onProgress  每帧回调，参数 (progress: 0~100)
     * @param {Function} onComplete  进度到 100% 时回调
     * @returns {{ cancel: Function }}  可调用 cancel() 提前终止
     */
    useCraftingTimer(makeTime, onProgress, onComplete) {
        let progress = 0;
        const interval = 50;
        const totalSteps = makeTime / interval;

        const timer = setInterval(() => {
            progress += 100 / totalSteps;
            onProgress(Math.min(progress, 100));

            if (progress >= 100) {
                clearInterval(timer);
                onComplete();
            }
        }, interval);

        return {
            cancel() {
                clearInterval(timer);
            }
        };
    },

    /**
     * useFadeOutRemove - 元素淡出后从 DOM 移除
     * effectsSystem.js 中 createPourEffect / createFryEffect / createSuccessEffect /
     * createErrorEffect / createDropEffect 多处都使用
     * "设置 opacity:0 + transition → setTimeout 后 removeChild" 模式
     *
     * @param {HTMLElement} element   需要淡出移除的元素
     * @param {number} displayTime    元素显示多久后开始淡出（毫秒）
     * @param {number} fadeDuration   淡出动画持续时间（毫秒）
     */
    useFadeOutRemove(element, displayTime = 2000, fadeDuration = 500) {
        setTimeout(() => {
            if (element.parentNode) {
                element.style.opacity = '0';
                element.style.transition = `opacity ${fadeDuration}ms`;
                setTimeout(() => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }, fadeDuration);
            }
        }, displayTime);
    },

    /**
     * useSafeScene3D - 安全调用 scene3D 方法
     * game.js / craftingSystem.js 中多处使用
     * "typeof scene3D !== 'undefined' && scene3D.xxx" 的容错判断
     *
     * @param {string} method   scene3D 上的方法名
     * @param {...any} args     传递给该方法的参数
     */
    useSafeScene3D(method, ...args) {
        if (typeof scene3D !== 'undefined' && typeof scene3D[method] === 'function') {
            scene3D[method](...args);
        }
    },

    /**
     * useCraftingGuard - 制作中守卫检查
     * uiManager.js 中 undoIngredient / completeBurger / makeDrink / makeFries /
     * addIngredient 五处都使用 "if (gameState.isCrafting) → showNotification" 模式
     *
     * @returns {boolean}  如果正在制作中返回 true，调用方应 return
     */
    useCraftingGuard() {
        if (gameState.isCrafting) {
            uiManager.showNotification('⚠️ 请等待当前制作完成', 'warning');
            return true;
        }
        return false;
    },

    /**
     * useDefaultUnlockedIngredients - 获取默认解锁食材列表
     * gameState.js 的 reset() 与 getDefaultUnlockedIngredients() 中
     * 有完全相同的 "遍历 CONFIG.ingredients 并收集 unlocked" 逻辑
     *
     * @returns {string[]}  默认解锁食材 id 数组
     */
    useDefaultUnlockedIngredients() {
        const unlocked = [];
        for (let key in CONFIG.ingredients) {
            if (CONFIG.ingredients[key].unlocked) {
                unlocked.push(key);
            }
        }
        return unlocked;
    },

    /**
     * useShopItemHTML - 生成商店物品 HTML
     * shopSystem.js 的 createShopItem 与 uiManager.js 的 updateIngredientsShop /
     * updateEquipmentShop 中有重复的商店物品渲染逻辑
     *
     * @param {Object} data  物品数据
     * @param {string} data.type        'ingredient' 或 'equipment'
     * @param {string} data.id          物品 id
     * @param {string} data.name        物品名称
     * @param {string} data.emoji       物品 emoji
     * @param {number} data.price       价格
     * @param {boolean} data.isUnlocked 是否已解锁（食材）/ 是否满级（设备）
     * @param {boolean} data.canAfford  是否买得起
     * @param {string} [data.description] 描述文字
     * @param {number} [data.currentLevel] 当前等级（设备）
     * @param {number} [data.maxLevel]     最大等级（设备）
     * @param {number} [data.speedMultiplier] 速度倍率（设备）
     * @param {boolean} [data.isMaxLevel]     是否满级（设备）
     * @returns {string}  HTML 字符串
     */
    useShopItemHTML(data) {
        if (data.type === 'ingredient') {
            const statusText = data.isUnlocked ? '✅ 已解锁' : `💰 ${data.price} 金币`;
            const btnText = data.isUnlocked ? '已拥有' : (data.canAfford ? '解锁' : '金币不足');
            return `
                <h4>${data.emoji} ${data.name}</h4>
                <p>${data.description || ''}</p>
                <p style="font-size: 0.9rem; color: ${data.isUnlocked ? '#4CAF50' : '#666'};">
                    ${statusText}
                </p>
                <button
                    ${data.isUnlocked || !data.canAfford ? 'disabled' : ''}
                    data-type="ingredient"
                    data-id="${data.id}"
                    class="buy-btn"
                >
                    ${btnText}
                </button>
            `;
        }

        if (data.type === 'equipment') {
            const levelInfo = `当前等级: ${data.currentLevel} / ${data.maxLevel}`;
            const speedInfo = `速度倍率: ${data.speedMultiplier}x`;
            const upgradeInfo = data.isMaxLevel
                ? '<p style="color: #4CAF50; font-weight: bold;">✨ 已满级</p>'
                : `<p style="font-size: 0.9rem; color: #666;">升级价格: 💰 ${data.price} 金币</p>`;
            const btnText = data.isMaxLevel ? '已满级' : (data.canAfford ? '升级' : '金币不足');
            return `
                <h4>${data.emoji} ${data.name}</h4>
                <p>${levelInfo}</p>
                <p>${speedInfo}</p>
                ${upgradeInfo}
                <button
                    ${data.isMaxLevel || !data.canAfford ? 'disabled' : ''}
                    data-type="equipment"
                    data-id="${data.id}"
                    class="buy-btn"
                >
                    ${btnText}
                </button>
            `;
        }

        return '';
    }
};
