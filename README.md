# 🍔 汉堡工坊 - 3D模拟经营游戏

一个基于 HTML5、CSS3 和 Three.js 构建的 3D 汉堡店模拟经营游戏。玩家需要接待顾客、制作汉堡、饮料和薯条，通过完成订单赚取金币，解锁新食材和升级设备。

## 📁 项目结构

```
xyj-29-1/
├── index.html          # 主页面结构
├── style.css           # 样式文件
├── config.js           # 游戏配置（食材、设备、等级等）
├── gameState.js        # 游戏状态管理
├── game.js             # 主游戏逻辑与循环
├── uiManager.js        # UI 管理器
├── scene3D.js          # Three.js 3D 场景管理
├── customerSystem.js   # 顾客系统
├── orderSystem.js      # 订单系统
├── craftingSystem.js   # 制作系统
├── effectsSystem.js    # 特效系统
├── shopSystem.js       # 商店系统
└── saveSystem.js       # 存档系统
```

## 🎮 核心玩法

1. **接待顾客** - 顾客会排队等待，点击顾客查看订单
2. **制作食物** - 按照订单要求堆叠汉堡配料、制作饮料、炸薯条
3. **交付订单** - 完成制作后交付订单赚取金币
4. **升级店铺** - 使用金币解锁新食材、升级设备提升效率

## 🚀 可扩展功能模块（5个以上）

### 1. 员工雇佣系统 (StaffSystem)
**功能描述**：玩家可以雇佣不同技能的员工来协助经营。

**交互功能**：
- 雇佣界面展示可雇佣的员工列表（厨师、服务员、清洁工）
- 每个员工有技能等级、薪资要求、工作效率属性
- 员工可以自动处理特定任务（如自动制作饮料、自动清理桌面）
- 员工有心情值系统，需要定期支付薪资维持工作积极性
- 员工可以培训升级，提升工作效率

**数据结构设计**：
```javascript
staff: {
  id: 'chef_001',
  name: '王大厨',
  type: 'chef', // chef, waiter, cleaner
  level: 1,
  skills: { cookingSpeed: 1.2, accuracy: 0.95 },
  salary: 50, // 每日薪资
  mood: 100, // 心情值 0-100
  hired: false
}
```

---

### 2. 店铺装修系统 (DecorationSystem)
**功能描述**：玩家可以购买装饰品美化店铺，提升顾客满意度和等待耐心。

**交互功能**：
- 装修商店提供多种装饰类别（墙面、地板、家具、灯光）
- 拖拽式摆放装饰品到3D场景中
- 不同装饰组合触发主题效果（如"温馨家庭风"提升家庭顾客耐心）
- 装饰品有耐久度，需要维护
- 特定装饰解锁隐藏顾客类型

**数据结构设计**：
```javascript
decorations: {
  wallpaper: {
    id: 'wallpaper_wood',
    name: '木质墙纸',
    price: 200,
    effect: { patienceBonus: 5 },
    theme: 'natural'
  },
  furniture: {
    id: 'table_vip',
    name: 'VIP餐桌',
    price: 500,
    effect: { tipMultiplier: 1.3 },
    unlockCustomer: 'vip'
  }
}
```

---

### 3. 成就与徽章系统 (AchievementSystem)
**功能描述**：记录玩家游戏里程碑，提供长期目标。

**交互功能**：
- 成就面板展示所有可解锁成就
- 成就分为多个类别（经营类、制作类、收集类、挑战类）
- 完成成就获得徽章展示在个人资料中
- 部分成就解锁特殊奖励（新食材、新设备皮肤）
- 每日/每周挑战任务系统

**成就示例**：
- "初出茅庐" - 完成第一份订单
- "汉堡大师" - 连续完成50份完美订单
- "速食之王" - 单日完成100份订单
- "收藏夹" - 解锁所有食材

---

### 4. 顾客关系与会员系统 (CustomerRelationSystem)
**功能描述**：建立顾客档案，培养回头客。

**交互功能**：
- 顾客档案面板记录每位顾客的历史订单、偏好、满意度
- 常客系统：同一顾客多次光顾后成为会员
- 会员等级提升带来额外小费和优先服务
- 顾客会给出反馈评价，影响店铺声誉
- 特殊节日顾客会携带礼物或提出特殊订单

**数据结构设计**：
```javascript
customerProfile: {
  customerId: 'cust_123',
  visitCount: 10,
  isMember: true,
  memberLevel: 2,
  favoriteItems: ['cheese_burger', 'cola'],
  satisfaction: 85, // 0-100
  lastVisit: timestamp,
  totalSpent: 500
}
```

---

### 5. 多人联机对战模式 (MultiplayerSystem)
**功能描述**：支持玩家之间的实时对战和合作。

**交互功能**：
- 创建/加入房间，支持2-4人对战
- 对战模式：限时比拼营业额、订单完成数、顾客满意度
- 合作模式：共同经营一家店铺，分工协作
- 实时排行榜显示对手进度
- 对战结束后生成战报和回放

**房间数据结构**：
```javascript
gameRoom: {
  roomId: 'room_abc123',
  hostId: 'player_1',
  players: [
    { id: 'player_1', name: '玩家A', ready: true },
    { id: 'player_2', name: '玩家B', ready: true }
  ],
  mode: 'competition', // competition, cooperation
  timeLimit: 300, // 秒
  status: 'waiting' // waiting, playing, finished
}
```

---

### 6. 季节活动与限时任务系统 (EventSystem)
**功能描述**：定期推出主题活动，增加游戏新鲜感。

**交互功能**：
- 活动日历展示当前和即将到来的活动
- 限时活动提供特殊食材、特殊顾客、特殊订单
- 活动任务链：完成一系列任务解锁终极奖励
- 节日主题装饰自动应用到店铺
- 活动商店使用活动专属货币兑换限定物品

**活动示例**：
- "夏日狂欢节" - 推出冰淇淋汉堡、冷饮特调
- "万圣节惊魂" - 南瓜主题食材、幽灵顾客
- "新年大酬宾" - 双倍金币活动、红包订单

---

## 🔁 可迭代功能模块（5个以上）

### 1. 食材品质与新鲜度系统
**当前状态**：食材无品质差异，制作结果固定。

**迭代方向**：
- 引入食材品质等级（普通、优质、顶级）
- 食材有保质期，过期影响顾客满意度
- 高品质食材提升订单收益，但需要更高成本采购
- 建立库存管理系统，需要平衡库存和成本

**迭代价值**：增加经营策略深度，玩家需要做出采购决策。

---

### 2. 动态难度与AI调节系统
**当前状态**：顾客生成间隔固定根据等级调整。

**迭代方向**：
- 根据玩家表现动态调整难度
- 连续成功时增加订单复杂度、缩短等待时间
- 连续失败时降低难度，给予缓冲期
- 引入"忙碌时段"机制，午餐晚餐时段顾客激增
- 天气系统影响客流量（雨天顾客减少但小费增加）

**迭代价值**：保持游戏挑战性，避免过于简单或困难。

---

### 3. 汉堡配方研发系统
**当前状态**：汉堡类型固定，按预设配方制作。

**迭代方向**：
- 允许玩家自由组合食材创造新配方
- 新配方需要经过多次测试才能加入菜单
- 顾客对新配方的接受度有随机性
- 热门配方可以命名并加入常规菜单
- 配方有专利保护期，期间独家收益

**迭代价值**：增加创造性和探索乐趣，玩家可以打造独特店铺。

---

### 4. 顾客情绪与事件系统
**当前状态**：顾客只有等待时间一个状态指标。

**迭代方向**：
- 顾客有情绪状态（开心、普通、不耐烦、愤怒）
- 情绪受等待时间、店铺环境、服务质量影响
- 随机事件：顾客投诉、顾客赞美、顾客拍照分享
- 特殊顾客事件：美食评论家暗访、网红探店
- 顾客之间会互动，排队时的对话影响情绪

**迭代价值**：增加游戏真实感和沉浸感。

---

### 5. 设备维护与故障系统
**当前状态**：设备升级后永久有效，无损耗。

**迭代方向**：
- 设备有耐久度，使用会损耗
- 设备需要定期维护，维护期间无法使用
- 设备可能突发故障，需要紧急维修
- 老旧设备效率下降，故障率上升
- 可以购买设备保险降低维修成本

**迭代价值**：增加经营的真实性和挑战性，避免一劳永逸。

---

### 6. 数据统计与分析系统
**当前状态**：仅有基础统计数据。

**迭代方向**：
- 详细的经营报表（日/周/月）
- 热销商品排行榜
- 顾客流量分析图表
- 收入支出明细
- 数据导出功能
- 基于数据的经营建议

**迭代价值**：帮助玩家优化经营策略，满足数据控玩家需求。

---

## 💡 代码理解与工程化建议

### 建议一：模块化架构重构

**当前问题**：
- 所有系统通过全局变量互相访问，耦合度高
- 模块之间依赖关系不清晰
- 缺乏统一的模块加载机制

**重构方案**：

```javascript
// 采用 ES6 模块 + 依赖注入模式
// core/ModuleManager.js
export class ModuleManager {
  constructor() {
    this.modules = new Map();
    this.dependencies = new Map();
  }

  register(name, moduleClass, dependencies = []) {
    this.modules.set(name, { class: moduleClass, deps: dependencies });
  }

  init() {
    // 拓扑排序解决依赖顺序
    const sorted = this.topologicalSort();
    sorted.forEach(name => {
      const config = this.modules.get(name);
      const deps = config.deps.map(dep => this.dependencies.get(dep));
      const instance = new config.class(...deps);
      this.dependencies.set(name, instance);
    });
  }
}

// 使用示例
// modules/index.js
import { ModuleManager } from './core/ModuleManager.js';
import { GameState } from './GameState.js';
import { EventBus } from './core/EventBus.js';

const manager = new ModuleManager();
manager.register('eventBus', EventBus);
manager.register('gameState', GameState, ['eventBus']);
manager.register('customerSystem', CustomerSystem, ['gameState', 'eventBus']);
// ...
manager.init();
```

**预期收益**：
1. 降低模块间耦合度，便于单元测试
2. 清晰的依赖关系图，便于维护
3. 支持按需加载，优化首屏性能
4. 便于实现模块热更新

---

### 建议二：事件系统优化与类型安全

**当前问题**：
- 事件使用字符串硬编码，容易出错
- 事件参数无类型约束
- 缺乏事件文档和自动提示

**重构方案**：

```javascript
// core/EventTypes.js
export const GameEvents = {
  // 经济相关
  COINS_CHANGED: 'coins:changed',
  LEVEL_UP: 'level:up',
  
  // 顾客相关
  CUSTOMER_ARRIVED: 'customer:arrived',
  CUSTOMER_LEFT: 'customer:left',
  ORDER_RECEIVED: 'order:received',
  ORDER_COMPLETED: 'order:completed',
  
  // 制作相关
  CRAFTING_STARTED: 'crafting:started',
  CRAFTING_PROGRESS: 'crafting:progress',
  CRAFTING_FINISHED: 'crafting:finished',
};

// 事件参数类型定义（配合 JSDoc 或 TypeScript）
/**
 * @typedef {Object} CoinsChangedEvent
 * @property {number} currentCoins - 当前金币数
 * @property {number} changeAmount - 变化量
 * @property {string} reason - 变化原因
 */

// 类型安全的事件总线
export class TypedEventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * @template T
   * @param {string} event - 事件名称
   * @param {(data: T) => void} callback - 回调函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * @template T
   * @param {string} event - 事件名称
   * @param {T} data - 事件数据
   */
  emit(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(cb => {
        try {
          cb(data);
        } catch (error) {
          console.error(`事件处理错误 [${event}]:`, error);
        }
      });
    }
  }

  // 一次性事件监听
  once(event, callback) {
    const wrappedCallback = (data) => {
      this.off(event, wrappedCallback);
      callback(data);
    };
    this.on(event, wrappedCallback);
  }

  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}
```

**预期收益**：
1. IDE 自动补全和类型检查
2. 减少因事件名拼写错误导致的bug
3. 事件文档化，便于团队协作
4. 更好的错误追踪和调试体验

---

### 建议三：状态管理引入 Redux 模式

**当前问题**：
- 游戏状态分散在各个模块
- 状态变更历史无法追踪
- 难以实现撤销/重做功能
- 状态持久化逻辑分散

**重构方案**：

```javascript
// store/index.js
import { createStore } from './core/ReduxLite.js';

// 初始状态
const initialState = {
  player: {
    coins: 100,
    level: 1,
    totalEarnings: 0
  },
  customers: {
    queue: [],
    maxCapacity: 3
  },
  crafting: {
    isActive: false,
    progress: 0,
    currentItem: null
  },
  // ...
};

// Action Types
const Actions = {
  ADD_COINS: 'ADD_COINS',
  REMOVE_COINS: 'REMOVE_COINS',
  ADD_CUSTOMER: 'ADD_CUSTOMER',
  REMOVE_CUSTOMER: 'REMOVE_CUSTOMER',
  START_CRAFTING: 'START_CRAFTING',
  UPDATE_CRAFTING_PROGRESS: 'UPDATE_CRAFTING_PROGRESS',
  // ...
};

// Reducer
function gameReducer(state = initialState, action) {
  switch (action.type) {
    case Actions.ADD_COINS:
      return {
        ...state,
        player: {
          ...state.player,
          coins: state.player.coins + action.payload.amount,
          totalEarnings: state.player.totalEarnings + action.payload.amount
        }
      };
    
    case Actions.ADD_CUSTOMER:
      if (state.customers.queue.length >= state.customers.maxCapacity) {
        return state; // 队列已满
      }
      return {
        ...state,
        customers: {
          ...state.customers,
          queue: [...state.customers.queue, action.payload.customer]
        }
      };
    
    // ... 其他 reducer 逻辑
    
    default:
      return state;
  }
}

// 中间件：自动保存
const autoSaveMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // 关键操作后自动保存
  if (['ADD_COINS', 'LEVEL_UP', 'UNLOCK_INGREDIENT'].includes(action.type)) {
    saveSystem.save(store.getState());
  }
  
  return result;
};

// 中间件：日志记录
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('[Action]', action.type, action.payload);
  const result = next(action);
  console.log('[State]', store.getState());
  return result;
};

// 创建 Store
export const store = createStore(
  gameReducer,
  initialState,
  [autoSaveMiddleware, loggerMiddleware]
);

// Action Creators
export const GameActions = {
  addCoins: (amount, reason) => ({
    type: Actions.ADD_COINS,
    payload: { amount, reason, timestamp: Date.now() }
  }),
  
  addCustomer: (customer) => ({
    type: Actions.ADD_CUSTOMER,
    payload: { customer }
  }),
  
  // ...
};
```

**预期收益**：
1. 单一数据源，状态可预测
2. 时间旅行调试，便于定位问题
3. 轻松实现存档/读档
4. 支持撤销/重做功能
5. 状态变更历史可用于分析玩家行为

---

### 建议四：测试体系建设

**当前问题**：
- 无单元测试
- 无集成测试
- 手动测试效率低

**测试方案**：

```javascript
// 目录结构
__tests__/
├── unit/
│   ├── orderSystem.test.js
│   ├── customerSystem.test.js
│   ├── gameState.test.js
│   └── craftingSystem.test.js
├── integration/
│   ├── gameFlow.test.js
│   └── saveLoad.test.js
├── e2e/
│   └── gameplay.test.js
└── mocks/
    ├── three.js.mock.js
    └── localStorage.mock.js

// tests/unit/orderSystem.test.js
import { OrderSystem } from '../../orderSystem.js';
import { GameState } from '../../gameState.js';

describe('OrderSystem', () => {
  let orderSystem;
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
    orderSystem = new OrderSystem();
  });

  describe('validateBurger', () => {
    it('应该验证正确的汉堡', () => {
      const expected = {
        ingredients: ['bunBottom', 'patty', 'cheese', 'bunTop']
      };
      const actual = ['bunBottom', 'patty', 'cheese', 'bunTop'];
      
      const result = orderSystem.validateBurger(expected, actual);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测配料顺序错误', () => {
      const expected = {
        ingredients: ['bunBottom', 'patty', 'cheese', 'bunTop']
      };
      const actual = ['bunBottom', 'cheese', 'patty', 'bunTop']; // 顺序错误
      
      const result = orderSystem.validateBurger(expected, actual);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('顺序错误')
      );
    });

    it('应该检测缺少配料', () => {
      const expected = {
        ingredients: ['bunBottom', 'patty', 'cheese', 'bunTop']
      };
      const actual = ['bunBottom', 'patty', 'bunTop']; // 缺少 cheese
      
      const result = orderSystem.validateBurger(expected, actual);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('canMakeOrder', () => {
    it('当所有食材已解锁时应返回 true', () => {
      gameState.unlockedIngredients = ['bunBottom', 'patty', 'cheese', 'bunTop'];
      
      const order = {
        items: {
          burger: {
            ingredients: ['bunBottom', 'patty', 'cheese', 'bunTop']
          }
        }
      };
      
      const result = orderSystem.canMakeOrder(order);
      
      expect(result.canMake).toBe(true);
    });

    it('当存在未解锁食材时应返回 false', () => {
      gameState.unlockedIngredients = ['bunBottom', 'patty', 'bunTop'];
      
      const order = {
        items: {
          burger: {
            ingredients: ['bunBottom', 'patty', 'cheese', 'bunTop'] // cheese 未解锁
          }
        }
      };
      
      const result = orderSystem.canMakeOrder(order);
      
      expect(result.canMake).toBe(false);
      expect(result.reason).toContain('cheese');
    });
  });
});

// tests/integration/gameFlow.test.js
import { Game } from '../../game.js';
import { GameState } from '../../gameState.js';

describe('游戏流程集成测试', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  it('完整的订单流程', async () => {
    // 1. 开始游戏
    game.startGameLoop();
    expect(gameState.isPlaying).toBe(true);

    // 2. 生成顾客
    game.spawnCustomer();
    expect(gameState.customers.length).toBe(1);

    // 3. 选择顾客
    gameState.selectCustomer(0);
    expect(gameState.selectedCustomerIndex).toBe(0);

    // 4. 制作汉堡
    const order = gameState.currentOrder;
    for (const ingredient of order.items.burger.ingredients) {
      gameState.addIngredientToBurger(ingredient);
    }
    gameState.completeBurger();
    expect(gameState.completedItems.burger).toBeTruthy();

    // 5. 交付订单
    const initialCoins = gameState.coins;
    const result = gameState.deliverOrder();
    
    expect(result.success).toBe(true);
    expect(gameState.coins).toBeGreaterThan(initialCoins);
    expect(gameState.customers.length).toBe(0);
  });
});
```

**测试工具链**：
- **Jest** - 单元测试和集成测试框架
- **Playwright** - E2E 测试，模拟真实用户操作
- **Coverage** - 代码覆盖率报告

**预期收益**：
1. 自动化测试减少回归bug
2. 重构时有信心保障
3. 测试即文档，便于理解代码
4. 持续集成/持续部署(CI/CD)的基础

---

## 🛠️ 技术栈

- **Three.js** - 3D 图形渲染
- **原生 JavaScript (ES6+)** - 游戏逻辑
- **HTML5/CSS3** - 用户界面
- **LocalStorage** - 本地数据存储

## 📄 许可

MIT License
