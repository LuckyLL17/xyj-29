// 特效系统
class EffectsSystem {
    constructor() {
        this.activeEffects = [];
        this.effectContainer = document.getElementById('three-container');
        
        // 创建2D特效层
        this.createEffectLayer();
    }
    
    createEffectLayer() {
        // 2D特效层
        this.effectLayer = document.createElement('div');
        this.effectLayer.id = 'effects-layer';
        this.effectLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
        `;
        this.effectContainer.appendChild(this.effectLayer);
    }
    
    // 播放特效
    playEffect(type, options = {}) {
        let effect = null;
        
        switch (type) {
            case 'pour':
                effect = this.createPourEffect(options);
                break;
            case 'fry':
                effect = this.createFryEffect(options);
                break;
            case 'drop':
                effect = this.createDropEffect(options);
                break;
            case 'sparkle':
                effect = this.createSparkleEffect(options);
                break;
            case 'coin':
                effect = this.createCoinEffect(options);
                break;
            case 'shake':
                effect = this.createShakeEffect(options);
                break;
            case 'success':
                effect = this.createSuccessEffect(options);
                break;
            case 'error':
                effect = this.createErrorEffect(options);
                break;
            default:
                console.warn(`未知的特效类型: ${type}`);
                return null;
        }
        
        if (effect) {
            this.activeEffects.push(effect);
        }
        
        return effect;
    }
    
    // 倒饮料特效（2D版）
    createPourEffect(options = {}) {
        const drinkType = options.drinkType || 'cola';
        const duration = options.duration || 2000;
        
        // 创建容器
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            bottom: 150px;
            right: 100px;
            width: 60px;
            height: 120px;
            pointer-events: none;
            z-index: 100;
        `;
        
        // 创建液体流
        const stream = document.createElement('div');
        let liquidColor = '#8B0000'; // 可乐色
        if (drinkType === 'orange') {
            liquidColor = '#FFA500'; // 橙色
        }
        
        stream.style.cssText = `
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 0;
            background: linear-gradient(180deg, ${liquidColor}, ${this.darkenColor(liquidColor, 30)});
            border-radius: 4px;
            box-shadow: 0 0 10px ${liquidColor};
            opacity: 0.9;
        `;
        container.appendChild(stream);
        
        // 创建杯子
        const cup = document.createElement('div');
        cup.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 80px;
            background: linear-gradient(180deg, rgba(255,255,255,0.3), rgba(200,200,200,0.2));
            border: 2px solid rgba(200,200,200,0.5);
            border-radius: 0 0 15px 15px;
            overflow: hidden;
        `;
        container.appendChild(cup);
        
        // 杯中的液体
        const cupLiquid = document.createElement('div');
        cupLiquid.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0;
            background: ${liquidColor};
            opacity: 0.8;
            border-radius: 0 0 13px 13px;
            transition: height ${duration}ms ease-out;
        `;
        cup.appendChild(cupLiquid);
        
        // 添加气泡效果
        const bubbles = document.createElement('div');
        bubbles.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;
        cup.appendChild(bubbles);
        
        this.effectLayer.appendChild(container);
        
        // 动画
        let startTime = Date.now();
        let animationId = null;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 液体流动画
            stream.style.height = `${progress * 40}px`;
            
            // 杯中液体上升
            cupLiquid.style.height = `${progress * 70}%`;
            
            // 生成气泡
            if (Math.random() < 0.3) {
                this.createBubble(bubbles, liquidColor);
            }
            
            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                // 动画完成后移除
                setTimeout(() => {
                    if (container.parentNode) {
                        container.style.opacity = '0';
                        container.style.transition = 'opacity 0.5s';
                        setTimeout(() => {
                            if (container.parentNode) {
                                container.parentNode.removeChild(container);
                            }
                        }, 500);
                    }
                }, 300);
            }
        };
        
        animate();
        
        return {
            type: 'pour',
            element: container,
            animationId: animationId,
            stop: () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }
        };
    }
    
    // 创建气泡
    createBubble(container, color) {
        const bubble = document.createElement('div');
        const size = Math.random() * 6 + 2;
        
        bubble.style.cssText = `
            position: absolute;
            bottom: 5px;
            left: ${Math.random() * 80 + 10}%;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255,255,255,0.6);
            border-radius: 50%;
            animation: bubbleRise ${Math.random() * 0.5 + 0.5}s ease-out;
        `;
        
        container.appendChild(bubble);
        
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        }, 1000);
    }
    
    // 炸薯条特效
    createFryEffect(options = {}) {
        const duration = options.duration || 3000;
        
        // 创建容器
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            bottom: 150px;
            right: 300px;
            width: 100px;
            height: 80px;
            pointer-events: none;
            z-index: 100;
        `;
        
        // 创建油锅
        const fryer = document.createElement('div');
        fryer.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 50px;
            background: linear-gradient(180deg, #444, #222);
            border-radius: 5px;
            overflow: hidden;
        `;
        container.appendChild(fryer);
        
        // 油
        const oil = document.createElement('div');
        oil.style.cssText = `
            position: absolute;
            bottom: 5px;
            left: 5px;
            right: 5px;
            height: 35px;
            background: linear-gradient(180deg, #8B4513, #654321);
            border-radius: 3px;
            opacity: 0.9;
        `;
        fryer.appendChild(oil);
        
        // 薯条
        const friesContainer = document.createElement('div');
        friesContainer.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 40px;
        `;
        container.appendChild(friesContainer);
        
        // 添加薯条
        const fries = [];
        for (let i = 0; i < 8; i++) {
            const fry = document.createElement('div');
            fry.style.cssText = `
                position: absolute;
                width: 6px;
                height: 30px;
                background: #D2B48C;
                border-radius: 2px;
                left: ${i * 8 + 5}px;
                bottom: 0;
                transform-origin: bottom center;
                transition: background ${duration}ms ease-out;
            `;
            friesContainer.appendChild(fry);
            fries.push(fry);
        }
        
        // 油泡效果
        const bubbles = document.createElement('div');
        bubbles.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 5px;
            right: 5px;
            height: 30px;
            pointer-events: none;
        `;
        oil.appendChild(bubbles);
        
        this.effectLayer.appendChild(container);
        
        // 动画
        let startTime = Date.now();
        let animationId = null;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 薯条颜色变深（炸制）
            const r = Math.floor(210 + progress * 45);
            const g = Math.floor(180 - progress * 80);
            const b = Math.floor(140 - progress * 80);
            fries.forEach(fry => {
                fry.style.background = `rgb(${r}, ${g}, ${b})`;
                
                // 轻微晃动
                fry.style.transform = `rotate(${Math.sin(elapsed * 0.01 + Math.random()) * 2}deg)`;
            });
            
            // 生成油泡
            if (Math.random() < 0.5) {
                const bubble = document.createElement('div');
                const size = Math.random() * 4 + 2;
                bubble.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background: rgba(255, 200, 100, 0.6);
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    bottom: 0;
                    animation: bubbleRise ${Math.random() * 0.3 + 0.2}s ease-out;
                `;
                bubbles.appendChild(bubble);
                
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.parentNode.removeChild(bubble);
                    }
                }, 500);
            }
            
            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                // 动画完成，薯条变成金黄色
                fries.forEach(fry => {
                    fry.style.background = '#FFD700';
                });
                
                // 播放完成特效
                this.playEffect('sparkle', {
                    x: '50%',
                    y: '50%',
                    parent: container,
                });
                
                setTimeout(() => {
                    if (container.parentNode) {
                        container.style.opacity = '0';
                        container.style.transition = 'opacity 0.5s';
                        setTimeout(() => {
                            if (container.parentNode) {
                                container.parentNode.removeChild(container);
                            }
                        }, 500);
                    }
                }, 500);
            }
        };
        
        animate();
        
        return {
            type: 'fry',
            element: container,
            animationId: animationId,
            stop: () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }
        };
    }
    
    // 掉落特效
    createDropEffect(options = {}) {
        const x = options.x || '50%';
        const y = options.y || '30%';
        const text = options.text || '';
        const emoji = options.emoji || '';
        
        const element = document.createElement('div');
        element.style.cssText = `
            position: absolute;
            left: ${x};
            top: ${y};
            transform: translateX(-50%) translateY(-50%);
            font-size: 3rem;
            font-weight: bold;
            color: #fff;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            pointer-events: none;
            z-index: 200;
            animation: dropIn 0.5s ease-out;
        `;
        
        element.innerHTML = `${emoji} ${text}`;
        
        this.effectLayer.appendChild(element);
        
        // 动画完成后移除
        setTimeout(() => {
            if (element.parentNode) {
                element.style.opacity = '0';
                element.style.transition = 'opacity 0.3s';
                setTimeout(() => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }, 300);
            }
        }, 2000);
        
        return {
            type: 'drop',
            element: element,
        };
    }
    
    // 闪烁特效
    createSparkleEffect(options = {}) {
        const x = options.x || '50%';
        const y = options.y || '50%';
        const parent = options.parent || this.effectLayer;
        const count = options.count || 8;
        
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            left: ${x};
            top: ${y};
            transform: translateX(-50%) translateY(-50%);
            width: 100px;
            height: 100px;
            pointer-events: none;
            z-index: 200;
        `;
        
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            const angle = (i / count) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            
            sparkle.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: 8px;
                height: 8px;
                background: #FFD700;
                border-radius: 50%;
                box-shadow: 0 0 10px #FFD700;
                transform: translate(-50%, -50%);
                animation: sparkleOut 0.6s ease-out forwards;
                --tx: ${Math.cos(angle) * distance}px;
                --ty: ${Math.sin(angle) * distance}px;
                animation-delay: ${i * 0.05}s;
            `;
            container.appendChild(sparkle);
        }
        
        parent.appendChild(container);
        
        // 动画完成后移除
        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 1000);
        
        return {
            type: 'sparkle',
            element: container,
        };
    }
    
    // 金币特效
    createCoinEffect(options = {}) {
        const amount = options.amount || 0;
        const x = options.x || '50%';
        const y = options.y || '30%';
        
        const element = document.createElement('div');
        element.style.cssText = `
            position: absolute;
            left: ${x};
            top: ${y};
            transform: translateX(-50%) translateY(-50%);
            font-size: 2rem;
            font-weight: bold;
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            pointer-events: none;
            z-index: 200;
        `;
        
        element.innerHTML = `💰 +${amount}`;
        this.effectLayer.appendChild(element);
        
        // 动画：向上飘然后消失
        let startTime = Date.now();
        const duration = 1500;
        const startY = parseFloat(y);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 向上移动
            const currentY = startY - progress * 50;
            element.style.top = `${currentY}%`;
            
            // 渐隐
            element.style.opacity = 1 - progress;
            
            // 放大
            const scale = 1 + progress * 0.3;
            element.style.transform = `translateX(-50%) translateY(-50%) scale(${scale})`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }
        };
        
        animate();
        
        // 同时播放闪烁特效
        this.playEffect('sparkle', { x, y, count: 12 });
        
        return {
            type: 'coin',
            element: element,
        };
    }
    
    // 震动特效
    createShakeEffect(options = {}) {
        const element = options.element || this.effectLayer;
        const intensity = options.intensity || 5;
        const duration = options.duration || 500;
        
        const originalTransform = element.style.transform || '';
        let startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 逐渐减弱震动
            const currentIntensity = intensity * (1 - progress);
            
            const x = (Math.random() - 0.5) * currentIntensity * 2;
            const y = (Math.random() - 0.5) * currentIntensity * 2;
            
            element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.transform = originalTransform;
            }
        };
        
        animate();
        
        return {
            type: 'shake',
            element: element,
        };
    }
    
    // 成功特效
    createSuccessEffect(options = {}) {
        const message = options.message || '成功！';
        
        // 播放成功音效
        this.playSound('success');
        
        // 显示成功消息
        const element = document.createElement('div');
        element.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.5);
            font-size: 3rem;
            font-weight: bold;
            color: #4CAF50;
            text-shadow: 2px 2px 10px rgba(76, 175, 80, 0.5);
            pointer-events: none;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.9);
            padding: 30px 50px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: successPop 0.5s ease-out forwards;
        `;
        
        element.innerHTML = `✅ ${message}`;
        document.body.appendChild(element);
        
        // 播放闪烁特效
        this.playEffect('sparkle', {
            x: '50%',
            y: '50%',
            parent: document.body,
            count: 20,
        });
        
        // 2秒后移除
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 500);
        }, 2000);
        
        return {
            type: 'success',
            element: element,
        };
    }
    
    // 错误特效
    createErrorEffect(options = {}) {
        const message = options.message || '错误！';
        
        // 播放错误音效
        this.playSound('error');
        
        // 震动
        this.playEffect('shake', {
            element: document.getElementById('game-container'),
            intensity: 8,
            duration: 300,
        });
        
        // 显示错误消息
        const element = document.createElement('div');
        element.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.5);
            font-size: 2.5rem;
            font-weight: bold;
            color: #f44336;
            text-shadow: 2px 2px 10px rgba(244, 67, 54, 0.5);
            pointer-events: none;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.9);
            padding: 25px 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: errorPop 0.5s ease-out forwards;
        `;
        
        element.innerHTML = `❌ ${message}`;
        document.body.appendChild(element);
        
        // 2秒后移除
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 500);
        }, 2000);
        
        return {
            type: 'error',
            element: element,
        };
    }
    
    // 播放音效（简单的Web Audio）
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch (type) {
                case 'success':
                    oscillator.frequency.value = 523.25; // C5
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
                    
                case 'error':
                    oscillator.frequency.value = 200;
                    oscillator.type = 'sawtooth';
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                    
                case 'coin':
                    oscillator.frequency.value = 880; // A5
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.15);
                    break;
            }
        } catch (e) {
            // 忽略音频错误
        }
    }
    
    // 颜色变暗
    darkenColor(color, amount) {
        let hex = color.replace('#', '');
        let r = parseInt(hex.substr(0, 2), 16);
        let g = parseInt(hex.substr(2, 2), 16);
        let b = parseInt(hex.substr(4, 2), 16);
        
        r = Math.max(0, r - amount);
        g = Math.max(0, g - amount);
        b = Math.max(0, b - amount);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes bubbleRise {
        0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
        }
        100% {
            transform: translateY(-30px) scale(0.5);
            opacity: 0;
        }
    }
    
    @keyframes dropIn {
        0% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
        50% {
            transform: translateX(-50%) translateY(10px);
        }
        100% {
            transform: translateX(-50%) translateY(-50%);
            opacity: 1;
        }
    }
    
    @keyframes sparkleOut {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
            opacity: 0;
        }
    }
    
    @keyframes successPop {
        0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes errorPop {
        0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// 全局特效系统实例
const effectsSystem = new EffectsSystem();
