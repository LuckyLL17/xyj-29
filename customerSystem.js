// 顾客系统
class CustomerSystem {
    constructor() {
        // 使用公共Hooks
        this.arrayHook = Hooks.useArray();
        this.configHook = Hooks.useConfig();
        this.notifyHook = Hooks.useNotification();
        this.customerIdCounter = 0;
    }
    
    // 生成新顾客
    generateCustomer() {
        // 随机选择顾客类型
        const customerTypes = CONFIG.customers.types;
        const type = this.arrayHook.random(customerTypes);
        
        // 随机选择图标
        const icons = CONFIG.customers.icons;
        const icon = this.arrayHook.random(icons);
        
        // 生成订单
        const order = this.generateOrder();
        
        // 计算等待时间
        const baseWaitTime = CONFIG.game.baseWaitTime;
        const levelBonus = CONFIG.levels[gameState.level]?.customerWaitBonus || 0;
        const maxWaitTime = (baseWaitTime + levelBonus) * type.patienceMultiplier;
        
        const customer = {
            id: this.customerIdCounter++,
            type: type,
            icon: icon,
            order: order,
            arrivalTime: Date.now(),
            maxWaitTime: maxWaitTime,
            tipMultiplier: type.tipMultiplier,
        };
        
        return customer;
    }
    
    // 生成订单
    generateOrder() {
        // 根据等级决定订单复杂度
        const level = gameState.level;
        let complexity = 'simple';
        
        if (level >= 3) complexity = 'medium';
        if (level >= 5) complexity = 'complex';
        
        const complexityConfig = CONFIG.orders.complexities[complexity];
        const itemCount = Math.floor(
            Math.random() * (complexityConfig.maxItems - complexityConfig.minItems + 1)
        ) + complexityConfig.minItems;
        
        const items = {};
        let totalPrice = 0;
        
        // 决定包含哪些类型的物品
        const availableTypes = ['burger', 'drink', 'fries'];
        const selectedTypes = [];
        
        // 至少包含一个汉堡
        selectedTypes.push('burger');
        
        // 随机选择其他类型
        for (let i = 1; i < itemCount; i++) {
            const type = this.arrayHook.random(availableTypes);
            selectedTypes.push(type);
        }
        
        // 生成每种物品
        selectedTypes.forEach(type => {
            switch (type) {
                case 'burger':
                    if (!items.burger) {
                        const burger = this.generateBurgerOrder();
                        items.burger = burger;
                        totalPrice += burger.price;
                    }
                    break;
                    
                case 'drink':
                    if (!items.drinks) {
                        items.drinks = [];
                    }
                    const drink = this.generateDrinkOrder();
                    items.drinks.push(drink.id);
                    totalPrice += drink.price;
                    break;
                    
                case 'fries':
                    if (!items.fries) {
                        items.fries = true;
                        totalPrice += CONFIG.fries.price;
                    }
                    break;
            }
        });
        
        return {
            items: items,
            totalPrice: Math.floor(totalPrice * complexityConfig.priceMultiplier),
            complexity: complexity,
        };
    }
    
    // 生成汉堡订单
    generateBurgerOrder() {
        // 获取所有可用的汉堡类型
        const burgerTypes = Object.keys(CONFIG.burgerTypes);
        const availableTypes = [];
        
        // 检查汉堡类型的食材是否都已解锁
        burgerTypes.forEach(type => {
            const burgerConfig = CONFIG.burgerTypes[type];
            const allUnlocked = burgerConfig.ingredients.every(ing => 
                gameState.unlockedIngredients.includes(ing)
            );
            if (allUnlocked) {
                availableTypes.push(type);
            }
        });
        
        // 如果没有可用的，默认使用基础汉堡
        if (availableTypes.length === 0) {
            availableTypes.push('basic');
        }
        
        // 随机选择汉堡类型
        const selectedType = this.arrayHook.random(availableTypes);
        const burgerConfig = CONFIG.burgerTypes[selectedType];
        
        // 随机决定是否排除某些配料（不要生菜、不要酱等）
        const exclude = [];
        const excludableIngredients = ['lettuce', 'tomato', 'onion', 'sauce', 'mustard'];
        
        // 30%概率排除某些配料
        if (Math.random() < 0.3) {
            const excludeCount = Math.floor(Math.random() * 2) + 1; // 排除1-2种
            const availableToExclude = excludableIngredients.filter(ing => 
                burgerConfig.ingredients.includes(ing)
            );
            
            for (let i = 0; i < excludeCount && availableToExclude.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableToExclude.length);
                exclude.push(availableToExclude.splice(randomIndex, 1)[0]);
            }
        }
        
        // 生成最终的配料列表（排除指定配料）
        const finalIngredients = burgerConfig.ingredients.filter(ing => !exclude.includes(ing));
        
        return {
            type: selectedType,
            name: burgerConfig.name,
            ingredients: finalIngredients,
            exclude: exclude,
            price: burgerConfig.price,
        };
    }
    
    // 生成饮料订单
    generateDrinkOrder() {
        const drinkTypes = Object.keys(CONFIG.drinks);
        const selectedType = this.arrayHook.random(drinkTypes);
        const drinkConfig = this.configHook.getDrink(selectedType);
        
        return {
            id: selectedType,
            name: drinkConfig.name,
            price: drinkConfig.price,
        };
    }
    
    // 检查顾客是否超时
    checkCustomerTimeout(customer) {
        const elapsed = Date.now() - customer.arrivalTime;
        return elapsed >= customer.maxWaitTime;
    }
    
    // 获取顾客剩余等待时间百分比
    getCustomerWaitPercentage(customer) {
        const elapsed = Date.now() - customer.arrivalTime;
        const remaining = Math.max(0, customer.maxWaitTime - elapsed);
        return (remaining / customer.maxWaitTime) * 100;
    }
    
    // 顾客离开（超时）
    customerLeave(customer, index) {
        // 扣除金币
        gameState.removeCoins(CONFIG.penalties.customerLeave);
        gameState.stats.unhappyCustomers++;
        
        // 移除3D模型
        scene3D.removeCustomerModel(index);
        
        // 显示通知
        this.notifyHook.error(
            `😢 顾客等待太久离开了！扣除 ${CONFIG.penalties.customerLeave} 金币`
        );
    }
}

// 全局顾客系统实例
const customerSystem = new CustomerSystem();
