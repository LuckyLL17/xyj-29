// 存储系统（使用localStorage）
class SaveSystem {
    constructor() {
        this.storageKey = CONFIG.storage.key;
        this.version = CONFIG.storage.version;
        
        // 自动保存间隔（毫秒）
        this.autoSaveInterval = 30000; // 30秒
        this.autoSaveTimer = null;
    }
    
    // 保存游戏
    save() {
        try {
            const saveData = {
                version: this.version,
                timestamp: Date.now(),
                gameState: gameState.getSaveData(),
            };
            
            const jsonString = JSON.stringify(saveData);
            localStorage.setItem(this.storageKey, jsonString);
            
            console.log('游戏已保存');
            return true;
        } catch (error) {
            console.error('保存失败:', error);
            return false;
        }
    }
    
    // 加载游戏
    load() {
        try {
            const jsonString = localStorage.getItem(this.storageKey);
            
            if (!jsonString) {
                console.log('没有找到存档');
                return false;
            }
            
            const saveData = JSON.parse(jsonString);
            
            // 检查版本
            if (saveData.version !== this.version) {
                console.warn(`存档版本不匹配: 期望 ${this.version}，实际 ${saveData.version}`);
                // 可以在这里添加版本迁移逻辑
            }
            
            // 加载游戏状态
            const success = gameState.loadSaveData(saveData.gameState);
            
            if (success) {
                console.log('游戏已加载');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('加载失败:', error);
            return false;
        }
    }
    
    // 检查是否有存档
    hasSave() {
        try {
            return localStorage.getItem(this.storageKey) !== null;
        } catch (error) {
            return false;
        }
    }
    
    // 删除存档
    deleteSave() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('存档已删除');
            return true;
        } catch (error) {
            console.error('删除存档失败:', error);
            return false;
        }
    }
    
    // 获取存档信息
    getSaveInfo() {
        try {
            const jsonString = localStorage.getItem(this.storageKey);
            
            if (!jsonString) {
                return null;
            }
            
            const saveData = JSON.parse(jsonString);
            
            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                date: new Date(saveData.timestamp).toLocaleString(),
                coins: saveData.gameState?.coins || 0,
                level: saveData.gameState?.level || 1,
                totalEarnings: saveData.gameState?.totalEarnings || 0,
            };
        } catch (error) {
            console.error('获取存档信息失败:', error);
            return null;
        }
    }
    
    // 开始自动保存
    startAutoSave() {
        if (this.autoSaveTimer) {
            this.stopAutoSave();
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (gameState.isPlaying) {
                this.save();
            }
        }, this.autoSaveInterval);
        
        console.log(`自动保存已启动，间隔 ${this.autoSaveInterval / 1000} 秒`);
    }
    
    // 停止自动保存
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('自动保存已停止');
        }
    }
    
    // 导出存档
    exportSave() {
        try {
            const saveData = {
                version: this.version,
                timestamp: Date.now(),
                gameState: gameState.getSaveData(),
            };
            
            const jsonString = JSON.stringify(saveData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `burgerWorkshop_save_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('存档已导出');
            return true;
        } catch (error) {
            console.error('导出存档失败:', error);
            return false;
        }
    }
    
    // 导入存档
    importSave(jsonString) {
        try {
            const saveData = JSON.parse(jsonString);
            
            // 验证数据格式
            if (!saveData.version || !saveData.gameState) {
                throw new Error('无效的存档格式');
            }
            
            // 加载游戏状态
            const success = gameState.loadSaveData(saveData.gameState);
            
            if (success) {
                // 保存到localStorage
                this.save();
                console.log('存档已导入');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('导入存档失败:', error);
            return false;
        }
    }
    
    // 检查存储容量
    getStorageInfo() {
        try {
            const used = new Blob([localStorage.getItem(this.storageKey) || '']).size;
            
            // 估算总容量（不同浏览器不同，这里用常见的5MB作为参考）
            const estimatedTotal = 5 * 1024 * 1024; // 5MB
            
            return {
                used: used,
                usedKB: (used / 1024).toFixed(2),
                estimatedTotal: estimatedTotal,
                estimatedTotalKB: (estimatedTotal / 1024).toFixed(2),
                percentage: ((used / estimatedTotal) * 100).toFixed(2),
            };
        } catch (error) {
            console.error('获取存储信息失败:', error);
            return null;
        }
    }
    
    // 快速保存（用于关键节点）
    quickSave() {
        return this.save();
    }
    
    // 快速加载
    quickLoad() {
        return this.load();
    }
}

// 全局存储系统实例
const saveSystem = new SaveSystem();
