// 订单系统
class OrderSystem {
    constructor() {
        // 订单验证规则
        this.validationRules = {
            burger: this.validateBurger.bind(this),
            drinks: this.validateDrinks.bind(this),
            fries: this.validateFries.bind(this),
        };
    }
    
    // 验证整个订单
    validateOrder(order, completedItems) {
        const errors = [];
        const warnings = [];
        
        // 验证汉堡
        if (order.items.burger) {
            const burgerResult = this.validateBurger(order.items.burger, completedItems.burger);
            if (!burgerResult.valid) {
                errors.push(...burgerResult.errors);
            }
            if (burgerResult.warnings) {
                warnings.push(...burgerResult.warnings);
            }
        } else if (completedItems.burger) {
            warnings.push('订单中没有汉堡，但你制作了汉堡');
        }
        
        // 验证饮料
        if (order.items.drinks) {
            const drinksResult = this.validateDrinks(order.items.drinks, completedItems.drinks);
            if (!drinksResult.valid) {
                errors.push(...drinksResult.errors);
            }
        } else if (completedItems.drinks && completedItems.drinks.length > 0) {
            warnings.push('订单中没有饮料，但你制作了饮料');
        }
        
        // 验证薯条
        if (order.items.fries) {
            const friesResult = this.validateFries(order.items.fries, completedItems.fries);
            if (!friesResult.valid) {
                errors.push(...friesResult.errors);
            }
        } else if (completedItems.fries) {
            warnings.push('订单中没有薯条，但你制作了薯条');
        }
        
        // 检查是否所有项目都完成
        const completenessResult = this.checkCompleteness(order, completedItems);
        if (!completenessResult.valid) {
            errors.push(...completenessResult.errors);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
        };
    }
    
    // 验证汉堡
    validateBurger(expected, actual) {
        const errors = [];
        
        if (!actual) {
            errors.push('缺少汉堡');
            return { valid: false, errors };
        }
        
        const expectedIngredients = expected.ingredients;
        const actualIngredients = actual;
        
        // 检查数量
        if (expectedIngredients.length !== actualIngredients.length) {
            errors.push(
                `汉堡配料数量不正确：期望 ${expectedIngredients.length} 个，实际 ${actualIngredients.length} 个`
            );
        }
        
        // 检查每个配料的顺序
        const minLength = Math.min(expectedIngredients.length, actualIngredients.length);
        for (let i = 0; i < minLength; i++) {
            if (expectedIngredients[i] !== actualIngredients[i]) {
                const expectedName = CONFIG.ingredients[expectedIngredients[i]]?.name || '未知';
                const actualName = CONFIG.ingredients[actualIngredients[i]]?.name || '未知';
                errors.push(
                    `汉堡配料顺序错误：位置 ${i + 1} 期望 "${expectedName}"，实际 "${actualName}"`
                );
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
        };
    }
    
    // 验证饮料
    validateDrinks(expected, actual) {
        const errors = [];
        
        if (!actual || actual.length === 0) {
            errors.push('缺少饮料');
            return { valid: false, errors };
        }
        
        // 检查数量
        if (expected.length !== actual.length) {
            errors.push(
                `饮料数量不正确：期望 ${expected.length} 杯，实际 ${actual.length} 杯`
            );
        }
        
        // 检查种类（不考虑顺序）
        const expectedCounts = {};
        const actualCounts = {};
        
        expected.forEach(drink => {
            expectedCounts[drink] = (expectedCounts[drink] || 0) + 1;
        });
        
        actual.forEach(drink => {
            actualCounts[drink] = (actualCounts[drink] || 0) + 1;
        });
        
        for (let drink in expectedCounts) {
            if (actualCounts[drink] !== expectedCounts[drink]) {
                const drinkName = CONFIG.drinks[drink]?.name || drink;
                errors.push(
                    `${drinkName} 数量不正确：期望 ${expectedCounts[drink]} 杯，实际 ${actualCounts[drink] || 0} 杯`
                );
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
        };
    }
    
    // 验证薯条
    validateFries(expected, actual) {
        const errors = [];
        
        if (!actual) {
            errors.push('缺少薯条');
            return { valid: false, errors };
        }
        
        return {
            valid: true,
            errors: [],
        };
    }
    
    // 检查订单完整性
    checkCompleteness(order, completedItems) {
        const errors = [];
        
        // 检查汉堡
        if (order.items.burger && !completedItems.burger) {
            errors.push('汉堡还未完成');
        }
        
        // 检查饮料
        if (order.items.drinks) {
            if (!completedItems.drinks || completedItems.drinks.length === 0) {
                errors.push('饮料还未完成');
            } else if (completedItems.drinks.length < order.items.drinks.length) {
                errors.push(`还有 ${order.items.drinks.length - completedItems.drinks.length} 杯饮料未制作`);
            }
        }
        
        // 检查薯条
        if (order.items.fries && !completedItems.fries) {
            errors.push('薯条还未炸好');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
        };
    }
    
    // 获取订单描述
    getOrderDescription(order) {
        const parts = [];
        
        if (order.items.burger) {
            const burger = order.items.burger;
            let desc = `🍔 ${burger.name}`;
            
            if (burger.exclude && burger.exclude.length > 0) {
                const excludedNames = burger.exclude.map(id => {
                    return CONFIG.ingredients[id]?.name || id;
                });
                desc += ` (不要: ${excludedNames.join('、')})`;
            }
            
            parts.push(desc);
        }
        
        if (order.items.drinks) {
            const drinkNames = order.items.drinks.map(id => {
                return CONFIG.drinks[id]?.emoji + ' ' + CONFIG.drinks[id]?.name;
            });
            parts.push(...drinkNames);
        }
        
        if (order.items.fries) {
            parts.push('🍟 薯条');
        }
        
        return parts.join(' + ');
    }
    
    // 获取订单总价
    getOrderTotal(order) {
        return order.totalPrice;
    }
    
    // 检查订单是否可以制作（所有食材都已解锁）
    canMakeOrder(order) {
        if (order.items.burger) {
            const burger = order.items.burger;
            for (let ingredient of burger.ingredients) {
                if (!gameState.unlockedIngredients.includes(ingredient)) {
                    return {
                        canMake: false,
                        reason: `缺少食材：${CONFIG.ingredients[ingredient]?.name || ingredient}`,
                    };
                }
            }
        }
        
        return { canMake: true };
    }
    
    // 生成订单预览
    getOrderPreview(order) {
        return {
            description: this.getOrderDescription(order),
            totalPrice: this.getOrderTotal(order),
            items: {
                burger: order.items.burger ? {
                    name: order.items.burger.name,
                    ingredients: order.items.burger.ingredients.map(id => ({
                        id: id,
                        name: CONFIG.ingredients[id]?.name || id,
                        emoji: CONFIG.ingredients[id]?.emoji || '❓',
                    })),
                    exclude: order.items.burger.exclude?.map(id => ({
                        id: id,
                        name: CONFIG.ingredients[id]?.name || id,
                    })) || [],
                } : null,
                drinks: order.items.drinks?.map(id => ({
                    id: id,
                    name: CONFIG.drinks[id]?.name || id,
                    emoji: CONFIG.drinks[id]?.emoji || '🥤',
                })) || [],
                fries: order.items.fries || false,
            },
        };
    }
}

// 全局订单系统实例
const orderSystem = new OrderSystem();
