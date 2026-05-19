/**
 * 通用 Hooks 模块
 * 提取项目中重复的业务逻辑，提供可复用的工具函数
 *
 * 设计思路：
 * - UI 管理器（uiManager.js）中存在三处几乎完全相同的进度条实现（饮料制作、薯条炸制、食材准备）
 * - 商店系统（shopSystem.js）中存在两处相同的循环渲染逻辑（食材/设备的列表渲染）
 * - 游戏状态（gameState.js）中有大量针对数组的检查、修改操作
 * - 这些重复代码违反了 DRY（Don't Repeat Yourself）原则，增加了维护成本
 *
 * 重构方式：
 * - 将重复逻辑封装为独立的工具函数（hooks）
 * - 保持原有接口签名兼容，确保调用方无需修改即可接入
 */

const CommonHooks = {

    /**
     * 创建一个带有进度回调的进度条控制器
     *
     * 原始重复场景：uiManager.js 中的 makeDrink、makeFries、addIngredient
     * 三个方法中各自实现了相同的 setInterval 进度更新逻辑
     *
     * @param {HTMLElement} progressBar - 进度条填充元素
     * @param {HTMLElement} progressText - 进度文本元素（用于显示状态文字）
     * @param {HTMLElement} [progressContainer] - 进度条容器（用于显示/隐藏）
     * @param {number} totalTime - 总时长（毫秒）
     * @param {(progress: number) => void} [onProgress] - 进度更新回调（0-100）
     * @param {() => void} [onComplete] - 完成回调
     * @param {number} [interval=50] - 更新间隔（毫秒）
     * @returns {{ stop: () => void }} 控制器对象，用于手动停止
     */
    useProgressBar(progressBar, progressText, progressContainer, totalTime, onProgress, onComplete, interval = 50) {
        let progress = 0;
        const totalSteps = totalTime / interval;

        if (progressContainer) {
            progressContainer.style.display = 'block';
        }

        const timer = setInterval(() => {
            progress += 100 / totalSteps;
            const clampedProgress = Math.min(progress, 100);

            if (progressBar) {
                progressBar.style.width = `${clampedProgress}%`;
            }

            if (onProgress) {
                onProgress(clampedProgress);
            }

            if (progress >= 100) {
                clearInterval(timer);

                if (progressBar) {
                    progressBar.style.width = '0%';
                }

                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }

                if (onComplete) {
                    onComplete();
                }
            }
        }, interval);

        return {
            stop: () => {
                clearInterval(timer);
                if (progressBar) {
                    progressBar.style.width = '0%';
                }
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
            }
        };
    },

    /**
     * 检查制作系统是否处于繁忙状态
     *
     * 原始重复场景：uiManager.js 中 makeDrink、makeFries、addIngredient、
     * undoIngredient、completeBurger、deliverOrder 等方法开头都有相同的
     * isCrafting 状态检查
     *
     * @returns {boolean} true 表示正在制作中
     */
    useIsCrafting() {
        return gameState.isCrafting;
    },

    /**
     * 显示制作中状态的通知
     *
     * 原始重复场景：多处出现的「请等待当前制作完成」通知
     *
     * @param {string} [message='⚠️ 请等待当前制作完成'] - 提示信息
     */
    useNotifyCrafting(message = '⚠️ 请等待当前制作完成') {
        uiManager.showNotification(message, 'warning');
    },

    /**
     * 获取制作时间（考虑设备升级）
     *
     * 原始重复场景：uiManager.js 中三处制作方法都需要获取设备速度倍率
     *
     * @param {number} baseTime - 基础制作时间
     * @param {string} equipmentId - 设备 ID（drinkMachine/fryer/grill）
     * @returns {number} 调整后的制作时间
     */
    useMakeTime(baseTime, equipmentId) {
        const speed = gameState.getEquipmentSpeed(equipmentId);
        return baseTime * speed;
    },

    /**
     * 循环渲染列表到容器元素
     *
     * 原始重复场景：shopSystem.js 中 updateIngredientsTab 和 updateEquipmentTab
     * 都使用了几乎相同的模式：清空容器 → 遍历 CONFIG → 创建 DOM → 追加
     *
     * @param {HTMLElement} container - 目标容器元素
     * @param {Array<any>} items - 要渲染的数据项数组
     * @param {(item: any) => HTMLElement} renderer - 渲染函数，返回 DOM 元素
     */
    useRenderList(container, items, renderer) {
        if (!container) return;

        container.innerHTML = '';

        items.forEach(item => {
            const element = renderer(item);
            if (element) {
                container.appendChild(element);
            }
        });
    },

    /**
     * 切换多个元素的 active 状态（用于 Tab 切换）
     *
     * 原始重复场景：uiManager.js 的 switchTab 方法中重复操作多个 Tab 按钮
     *
     * @param {NodeList|Array<HTMLElement>} tabs - Tab 按钮列表
     * @param {string} activeValue - 需要激活的值（匹配 dataset.tab）
     * @param {HTMLElement} [contentA] - 内容面板 A
     * @param {HTMLElement} [contentB] - 内容面板 B
     * @param {string} [valueA] - 内容面板 A 对应的值
     */
    useSwitchTab(tabs, activeValue, contentA, contentB, valueA) {
        tabs.forEach(tab => {
            if (tab.dataset.tab === activeValue) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        if (contentA && contentB) {
            if (activeValue === valueA) {
                contentA.style.display = 'grid';
                contentB.style.display = 'none';
            } else {
                contentA.style.display = 'none';
                contentB.style.display = 'grid';
            }
        }
    },

    /**
     * 切换同一组元素的 active 状态
     *
     * 原始重复场景：uiManager.js 的 highlightSelectedCustomer 和
     * clearHighlights 方法使用相同的模式
     *
     * @param {NodeList|Array<HTMLElement>} elements - 元素列表
     * @param {number} activeIndex - 需要激活的索引
     * @param {string} [activeClass='active'] - 激活类名
     */
    useHighlightIndex(elements, activeIndex, activeClass = 'active') {
        elements.forEach((el, i) => {
            if (i === activeIndex) {
                el.classList.add(activeClass);
            } else {
                el.classList.remove(activeClass);
            }
        });
    },

    /**
     * 清除一组元素的 active 状态
     *
     * 原始重复场景：uiManager.js 的 clearHighlights 方法
     *
     * @param {NodeList|Array<HTMLElement>} elements - 元素列表
     * @param {string} [activeClass='active'] - 激活类名
     */
    useClearHighlights(elements, activeClass = 'active') {
        elements.forEach(el => {
            el.classList.remove(activeClass);
        });
    },

    /**
     * 创建一个通用的列表渲染器
     *
     * 原始重复场景：shopSystem.js 中多次出现的「遍历配置 → 创建 DOM → 追加」模式
     *
     * @param {Function} createItem - 创建单个 DOM 元素的函数
     * @returns {(container: HTMLElement, items: Array<any>) => void} 渲染函数
     */
    createListRenderer(createItem) {
        return (container, items) => {
            if (!container) return;

            container.innerHTML = '';

            items.forEach(item => {
                const element = createItem(item);
                if (element) {
                    container.appendChild(element);
                }
            });
        };
    },

    /**
     * 计算数组中特定元素的数量
     *
     * 原始重复场景：gameState.js 和 craftingSystem.js 中多次出现的
     * filter(d => d === type).length 模式
     *
     * @param {Array} array - 目标数组
     * @param {any} value - 需要统计的值
     * @returns {number} 出现次数
     */
    useCountInArray(array, value) {
        return array.filter(item => item === value).length;
    },

    /**
     * 安全地触发事件（兼容 gameState 的事件系统）
     *
     * 原始重复场景：gameState.js 中多次出现的 emit 调用模式
     *
     * @param {string} event - 事件名称
     * @param {any} [data] - 事件数据
     */
    useEmit(event, data) {
        if (typeof gameState !== 'undefined' && gameState.emit) {
            gameState.emit(event, data);
        }
    },
};

// 全局通用 hooks 实例
const commonHooks = CommonHooks;
