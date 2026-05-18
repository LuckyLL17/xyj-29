// 公共Hooks - 提取项目中重复的代码逻辑

/**
 * 事件发射器Hook - 提供事件监听和触发功能
 * 应用场景: 替代gameState.js中的重复事件管理代码
 */
function useEventEmitter() {
    const listeners = {};

    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    function on(event, callback) {
        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(callback);
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    function emit(event, data) {
        if (listeners[event]) {
            listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 要移除的回调函数
     */
    function off(event, callback) {
        if (listeners[event]) {
            const index = listeners[event].indexOf(callback);
            if (index > -1) {
                listeners[event].splice(index, 1);
            }
        }
    }

    /**
     * 一次性事件监听
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    function once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            off(event, wrapper);
        };
        on(event, wrapper);
    }

    return { on, emit, off, once };
}

/**
 * 进度管理Hook - 统一管理制作/加载进度
 * 应用场景: 替代uiManager.js中makeDrink/makeFries/addIngredient的重复进度逻辑
 */
function useProgress() {
    let currentProgress = 0;
    let isActive = false;
    let timer = null;
    let startTime = 0;
    let totalDuration = 0;
    let onUpdate = null;
    let onComplete = null;

    /**
     * 开始进度
     * @param {Object} options - 配置选项
     * @param {number} options.duration - 总时长(毫秒)
     * @param {Function} options.onUpdate - 进度更新回调 (progress: number) => void
     * @param {Function} options.onComplete - 完成回调
     * @param {number} options.interval - 更新间隔(毫秒)，默认50ms
     */
    function start(options) {
        stop();
        currentProgress = 0;
        isActive = true;
        startTime = Date.now();
        totalDuration = options.duration || 1000;
        onUpdate = options.onUpdate;
        onComplete = options.onComplete;
        const interval = options.interval || 50;

        timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            currentProgress = Math.min((elapsed / totalDuration) * 100, 100);

            if (onUpdate) {
                onUpdate(currentProgress);
            }

            if (currentProgress >= 100) {
                stop();
                if (onComplete) {
                    onComplete();
                }
            }
        }, interval);
    }

    /**
     * 停止进度
     */
    function stop() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        isActive = false;
    }

    /**
     * 获取当前进度
     * @returns {number} 0-100的进度值
     */
    function getProgress() {
        return currentProgress;
    }

    /**
     * 检查是否正在进行中
     * @returns {boolean}
     */
    function isInProgress() {
        return isActive;
    }

    return { start, stop, getProgress, isInProgress };
}

/**
 * 动画循环Hook - 统一管理requestAnimationFrame动画
 * 应用场景: 替代effectsSystem.js和scene3D.js中的重复动画循环
 */
function useAnimation() {
    let animationId = null;
    let isRunning = false;
    let startTime = 0;
    let duration = 0;
    let onFrame = null;
    let onComplete = null;

    /**
     * 开始动画
     * @param {Object} options - 配置选项
     * @param {number} options.duration - 动画时长(毫秒)，为0则无限循环
     * @param {Function} options.onFrame - 帧回调 (progress: number, elapsed: number) => boolean?
     * @param {Function} options.onComplete - 完成回调
     */
    function start(options) {
        stop();
        isRunning = true;
        startTime = Date.now();
        duration = options.duration || 0;
        onFrame = options.onFrame;
        onComplete = options.onComplete;

        function animate() {
            if (!isRunning) return;

            const elapsed = Date.now() - startTime;
            const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 0;

            let shouldContinue = true;
            if (onFrame) {
                shouldContinue = onFrame(progress, elapsed);
            }

            if (shouldContinue !== false && (duration === 0 || progress < 1)) {
                animationId = requestAnimationFrame(animate);
            } else {
                stop();
                if (onComplete) {
                    onComplete();
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    /**
     * 停止动画
     */
    function stop() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        isRunning = false;
    }

    /**
     * 检查动画是否在运行
     * @returns {boolean}
     */
    function isAnimating() {
        return isRunning;
    }

    return { start, stop, isAnimating };
}

/**
 * DOM操作Hook - 统一处理DOM元素的创建、样式设置和清理
 * 应用场景: 替代effectsSystem.js和shopSystem.js中的重复DOM操作
 */
function useDOM() {
    /**
     * 创建DOM元素
     * @param {string} tag - 标签名
     * @param {Object} options - 配置选项
     * @param {Object} options.style - 样式对象
     * @param {string} options.className - 类名
     * @param {string} options.innerHTML - 内部HTML
     * @param {HTMLElement} options.parent - 父元素
     * @param {Object} options.dataset - 数据属性
     * @returns {HTMLElement} 创建的元素
     */
    function createElement(tag, options = {}) {
        const element = document.createElement(tag);

        if (options.className) {
            element.className = options.className;
        }

        if (options.style) {
            Object.assign(element.style, options.style);
        }

        if (options.innerHTML !== undefined) {
            element.innerHTML = options.innerHTML;
        }

        if (options.dataset) {
            Object.assign(element.dataset, options.dataset);
        }

        if (options.parent) {
            options.parent.appendChild(element);
        }

        return element;
    }

    /**
     * 安全移除元素
     * @param {HTMLElement} element - 要移除的元素
     */
    function removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * 带淡出动画的元素移除
     * @param {HTMLElement} element - 要移除的元素
     * @param {number} delay - 延迟时间(毫秒)
     * @param {number} duration - 动画时长(毫秒)
     */
    function removeElementWithFade(element, delay = 0, duration = 300) {
        if (!element) return;

        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease`;
            setTimeout(() => removeElement(element), duration);
        }, delay);
    }

    /**
     * 获取元素(带null检查)
     * @param {string} selector - 选择器
     * @param {HTMLElement} parent - 父元素
     * @returns {HTMLElement|null}
     */
    function getElement(selector, parent = document) {
        return parent.querySelector(selector);
    }

    /**
     * 获取多个元素
     * @param {string} selector - 选择器
     * @param {HTMLElement} parent - 父元素
     * @returns {NodeList}
     */
    function getElements(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    return { createElement, removeElement, removeElementWithFade, getElement, getElements };
}

/**
 * 配置工具Hook - 统一处理配置读取和验证
 * 应用场景: 替代各处重复的CONFIG.xxx?.yyy访问
 */
function useConfig() {
    /**
     * 安全获取配置值
     * @param {string} path - 配置路径，如 'ingredients.lettuce.name'
     * @param {*} defaultValue - 默认值
     * @returns {*} 配置值或默认值
     */
    function get(path, defaultValue = null) {
        try {
            return path.split('.').reduce((obj, key) => {
                return obj && obj[key] !== undefined ? obj[key] : defaultValue;
            }, CONFIG);
        } catch (e) {
            return defaultValue;
        }
    }

    /**
     * 获取食材配置
     * @param {string} ingredientId - 食材ID
     * @returns {Object|null}
     */
    function getIngredient(ingredientId) {
        return CONFIG.ingredients[ingredientId] || null;
    }

    /**
     * 获取食材名称(带默认值)
     * @param {string} ingredientId - 食材ID
     * @returns {string}
     */
    function getIngredientName(ingredientId) {
        return CONFIG.ingredients[ingredientId]?.name || ingredientId || '未知';
    }

    /**
     * 获取饮料配置
     * @param {string} drinkId - 饮料ID
     * @returns {Object|null}
     */
    function getDrink(drinkId) {
        return CONFIG.drinks[drinkId] || null;
    }

    /**
     * 获取饮料名称
     * @param {string} drinkId - 饮料ID
     * @returns {string}
     */
    function getDrinkName(drinkId) {
        return CONFIG.drinks[drinkId]?.name || drinkId || '未知饮料';
    }

    /**
     * 获取设备配置
     * @param {string} equipmentId - 设备ID
     * @returns {Object|null}
     */
    function getEquipment(equipmentId) {
        return CONFIG.equipment[equipmentId] || null;
    }

    /**
     * 获取汉堡类型配置
     * @param {string} burgerType - 汉堡类型
     * @returns {Object|null}
     */
    function getBurgerType(burgerType) {
        return CONFIG.burgerTypes[burgerType] || null;
    }

    /**
     * 获取设备速度倍率
     * @param {string} equipmentId - 设备ID
     * @param {number} level - 设备等级
     * @returns {number}
     */
    function getEquipmentSpeedMultiplier(equipmentId, level) {
        const equipment = CONFIG.equipment[equipmentId];
        if (!equipment) return 1;
        const levelData = equipment.levels[level - 1];
        return levelData ? levelData.speedMultiplier : 1;
    }

    return {
        get,
        getIngredient,
        getIngredientName,
        getDrink,
        getDrinkName,
        getEquipment,
        getBurgerType,
        getEquipmentSpeedMultiplier
    };
}

/**
 * 通知Hook - 统一管理通知显示
 * 应用场景: 替代各处重复的uiManager.showNotification调用封装
 */
function useNotification() {
    /**
     * 显示成功通知
     * @param {string} message - 消息内容
     */
    function success(message) {
        uiManager.showNotification(message, 'success');
    }

    /**
     * 显示错误通知
     * @param {string} message - 消息内容
     */
    function error(message) {
        uiManager.showNotification(message, 'error');
    }

    /**
     * 显示警告通知
     * @param {string} message - 消息内容
     */
    function warning(message) {
        uiManager.showNotification(message, 'warning');
    }

    /**
     * 显示信息通知
     * @param {string} message - 消息内容
     */
    function info(message) {
        uiManager.showNotification(message, 'info');
    }

    return { success, error, warning, info };
}

/**
 * 制作流程Hook - 统一管理物品制作流程
 * 应用场景: 替代uiManager.js中makeDrink/makeFries/addIngredient的重复流程
 */
function useCrafting() {
    const configHook = useConfig();

    /**
     * 执行制作流程
     * @param {Object} options - 配置选项
     * @param {string} options.type - 制作类型 (ingredient/drink/fries)
     * @param {string} options.itemId - 物品ID
     * @param {string} options.equipmentId - 设备ID
     * @param {Function} options.onStart - 开始回调
     * @param {Function} options.onProgress - 进度回调
     * @param {Function} options.onComplete - 完成回调
     * @param {Function} options.checkCanCraft - 前置检查回调
     * @returns {boolean} 是否成功开始
     */
    function startCrafting(options) {
        if (gameState.isCrafting) {
            uiManager.showNotification('⚠️ 请等待当前制作完成', 'warning');
            return false;
        }

        if (options.checkCanCraft && !options.checkCanCraft()) {
            return false;
        }

        const speed = gameState.getEquipmentSpeed(options.equipmentId);
        let baseTime = 1000;

        switch (options.type) {
            case 'ingredient':
                baseTime = configHook.getIngredient(options.itemId)?.makeTime || 1000;
                break;
            case 'drink':
                baseTime = configHook.getDrink(options.itemId)?.makeTime || 2000;
                break;
            case 'fries':
                baseTime = CONFIG.fries.makeTime || 5000;
                break;
        }

        const makeTime = baseTime * speed;

        gameState.isCrafting = true;
        gameState.currentCraftingItem = { type: options.type, id: options.itemId };

        if (options.onStart) {
            options.onStart(makeTime);
        }

        let progress = 0;
        const interval = 50;
        const totalSteps = makeTime / interval;

        const timer = setInterval(() => {
            progress += 100 / totalSteps;
            const currentProgress = Math.min(progress, 100);

            if (options.onProgress) {
                options.onProgress(currentProgress);
            }

            if (currentProgress >= 100) {
                clearInterval(timer);
                gameState.isCrafting = false;
                gameState.currentCraftingItem = null;

                if (options.onComplete) {
                    options.onComplete();
                }
            }
        }, interval);

        return true;
    }

    return { startCrafting };
}

/**
 * 颜色工具Hook - 颜色处理工具
 * 应用场景: 替代effectsSystem.js中的darkenColor等颜色处理
 */
function useColor() {
    /**
     * 加深颜色
     * @param {string} color - 十六进制颜色 (#RRGGBB)
     * @param {number} amount - 加深量 (0-255)
     * @returns {string} 新的十六进制颜色
     */
    function darken(color, amount) {
        let hex = color.replace('#', '');
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);

        r = Math.max(0, r - amount);
        g = Math.max(0, g - amount);
        b = Math.max(0, b - amount);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * 变亮颜色
     * @param {string} color - 十六进制颜色 (#RRGGBB)
     * @param {number} amount - 变亮量 (0-255)
     * @returns {string} 新的十六进制颜色
     */
    function lighten(color, amount) {
        let hex = color.replace('#', '');
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);

        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * RGB转十六进制
     * @param {number} r - 红色 (0-255)
     * @param {number} g - 绿色 (0-255)
     * @param {number} b - 蓝色 (0-255)
     * @returns {string} 十六进制颜色
     */
    function rgbToHex(r, g, b) {
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    return { darken, lighten, rgbToHex };
}

/**
 * 数组工具Hook - 数组操作工具
 */
function useArray() {
    /**
     * 随机获取数组中的一个元素
     * @param {Array} arr - 数组
     * @returns {*} 随机元素
     */
    function random(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * 打乱数组
     * @param {Array} arr - 数组
     * @returns {Array} 打乱后的新数组
     */
    function shuffle(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * 统计数组元素出现次数
     * @param {Array} arr - 数组
     * @returns {Object} 计数字典
     */
    function count(arr) {
        return arr.reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {});
    }

    return { random, shuffle, count };
}

// 全局Hooks实例
window.Hooks = {
    useEventEmitter,
    useProgress,
    useAnimation,
    useDOM,
    useConfig,
    useNotification,
    useCrafting,
    useColor,
    useArray
};
