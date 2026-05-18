// 游戏配置文件
const CONFIG = {
    // 基础配置
    game: {
        initialCoins: 100,
        initialLevel: 1,
        maxCustomers: 3,
        customerSpawnInterval: 15000, // 15秒
        baseWaitTime: 60000, // 60秒
    },
    
    // 等级配置
    levels: {
        1: { requiredCoins: 0, customerWaitBonus: 0 },
        2: { requiredCoins: 500, customerWaitBonus: 5000 },
        3: { requiredCoins: 1500, customerWaitBonus: 10000 },
        4: { requiredCoins: 3000, customerWaitBonus: 15000 },
        5: { requiredCoins: 5000, customerWaitBonus: 20000 },
    },
    
    // 食材配置
    ingredients: {
        bunTop: {
            id: 'bunTop',
            name: '顶层面包',
            emoji: '🍞',
            price: 0,
            unlocked: true,
            makeTime: 1000,
            stackOrder: 0,
        },
        bunBottom: {
            id: 'bunBottom',
            name: '底层面包',
            emoji: '🥖',
            price: 0,
            unlocked: true,
            makeTime: 1000,
            stackOrder: 1,
        },
        patty: {
            id: 'patty',
            name: '牛肉饼',
            emoji: '🥩',
            price: 0,
            unlocked: true,
            makeTime: 3000,
            stackOrder: 2,
        },
        cheese: {
            id: 'cheese',
            name: '芝士',
            emoji: '🧀',
            price: 50,
            unlocked: true,
            makeTime: 1000,
            stackOrder: 3,
        },
        lettuce: {
            id: 'lettuce',
            name: '生菜',
            emoji: '🥬',
            price: 100,
            unlocked: false,
            makeTime: 1000,
            stackOrder: 4,
        },
        tomato: {
            id: 'tomato',
            name: '番茄',
            emoji: '🍅',
            price: 150,
            unlocked: false,
            makeTime: 1000,
            stackOrder: 5,
        },
        onion: {
            id: 'onion',
            name: '洋葱',
            emoji: '🧅',
            price: 200,
            unlocked: false,
            makeTime: 1000,
            stackOrder: 6,
        },
        sauce: {
            id: 'sauce',
            name: '番茄酱',
            emoji: '🍯',
            price: 100,
            unlocked: false,
            makeTime: 1000,
            stackOrder: 7,
        },
        mustard: {
            id: 'mustard',
            name: '芥末酱',
            emoji: '🟡',
            price: 150,
            unlocked: false,
            makeTime: 1000,
            stackOrder: 8,
        },
    },
    
    // 饮料配置
    drinks: {
        cola: {
            id: 'cola',
            name: '可乐',
            emoji: '🥤',
            price: 10,
            makeTime: 2000,
        },
        orange: {
            id: 'orange',
            name: '橙汁',
            emoji: '🍊',
            price: 15,
            makeTime: 2000,
        },
    },
    
    // 薯条配置
    fries: {
        id: 'fries',
        name: '薯条',
        emoji: '🍟',
        price: 15,
        makeTime: 5000,
    },
    
    // 汉堡配置
    burgerTypes: {
        basic: {
            id: 'basic',
            name: '基础汉堡',
            price: 25,
            ingredients: ['bunBottom', 'patty', 'bunTop'],
        },
        cheese: {
            id: 'cheese',
            name: '芝士汉堡',
            price: 35,
            ingredients: ['bunBottom', 'patty', 'cheese', 'bunTop'],
        },
        deluxe: {
            id: 'deluxe',
            name: '豪华汉堡',
            price: 50,
            ingredients: ['bunBottom', 'patty', 'cheese', 'lettuce', 'tomato', 'bunTop'],
        },
        veggie: {
            id: 'veggie',
            name: '蔬菜汉堡',
            price: 30,
            ingredients: ['bunBottom', 'lettuce', 'tomato', 'onion', 'bunTop'],
        },
    },
    
    // 设备升级配置
    equipment: {
        drinkMachine: {
            id: 'drinkMachine',
            name: '饮料机',
            levels: [
                { level: 1, speedMultiplier: 1, price: 0 },
                { level: 2, speedMultiplier: 0.8, price: 200 },
                { level: 3, speedMultiplier: 0.6, price: 500 },
                { level: 4, speedMultiplier: 0.4, price: 1000 },
            ],
        },
        fryer: {
            id: 'fryer',
            name: '炸锅',
            levels: [
                { level: 1, speedMultiplier: 1, price: 0 },
                { level: 2, speedMultiplier: 0.8, price: 200 },
                { level: 3, speedMultiplier: 0.6, price: 500 },
                { level: 4, speedMultiplier: 0.4, price: 1000 },
            ],
        },
        grill: {
            id: 'grill',
            name: '烤炉',
            levels: [
                { level: 1, speedMultiplier: 1, price: 0 },
                { level: 2, speedMultiplier: 0.8, price: 200 },
                { level: 3, speedMultiplier: 0.6, price: 500 },
                { level: 4, speedMultiplier: 0.4, price: 1000 },
            ],
        },
    },
    
    // 顾客配置
    customers: {
        types: [
            { id: 'normal', name: '普通顾客', patienceMultiplier: 1, tipMultiplier: 1 },
            { id: 'business', name: '商务人士', patienceMultiplier: 0.7, tipMultiplier: 1.5 },
            { id: 'student', name: '学生', patienceMultiplier: 1.3, tipMultiplier: 0.8 },
            { id: 'family', name: '家庭', patienceMultiplier: 1.5, tipMultiplier: 1.2 },
        ],
        
        icons: ['👨', '👩', '🧔', '👴', '👵', '👦', '👧', '👨‍💼', '👩‍💼', '👨‍🍳'],
    },
    
    // 订单配置
    orders: {
        // 订单可能包含的物品类型
        itemTypes: ['burger', 'drink', 'fries'],
        
        // 订单复杂度
        complexities: {
            simple: { minItems: 1, maxItems: 2, priceMultiplier: 1 },
            medium: { minItems: 2, maxItems: 3, priceMultiplier: 1.2 },
            complex: { minItems: 3, maxItems: 5, priceMultiplier: 1.5 },
        },
    },
    
    // 处罚配置
    penalties: {
        wrongOrder: 50, // 做错订单扣除的金币
        customerLeave: 30, // 顾客等待太久离开扣除的金币
    },
    
    // 奖励配置
    rewards: {
        perfectOrder: 20, // 完美完成订单的额外奖励
        fastDelivery: 15, // 快速交付的额外奖励
    },
    
    // 存储配置
    storage: {
        key: 'burgerWorkshop_save',
        version: 1,
    },
};
