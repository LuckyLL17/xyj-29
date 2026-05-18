// 3D场景管理器
class Scene3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.animationId = null;
        
        // 场景元素
        this.burgerMeshes = [];
        this.customerModels = [];
        this.lights = [];
        
        this.init();
    }
    
    init() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // 天空蓝色
        
        // 创建相机
        const container = document.getElementById('three-container');
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 8, 15);
        this.camera.lookAt(0, 0, 0);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        
        // 创建轨道控制器（容错处理）
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 10;
            this.controls.maxDistance = 30;
            this.controls.maxPolarAngle = Math.PI / 2.2;
        } else {
            console.warn('OrbitControls not loaded, 3D scene may not be interactive');
            this.controls = {
                update: function() {}
            };
        }
        
        // 添加灯光
        this.addLights();
        
        // 创建场景元素
        this.createGround();
        this.createKitchen();
        this.createCounter();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 开始渲染
        this.animate();
    }
    
    addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // 主方向光（模拟阳光）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // 补光
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 10, -5);
        this.scene.add(fillLight);
        this.lights.push(fillLight);
        
        // 厨房灯
        const kitchenLight = new THREE.PointLight(0xffffff, 0.5, 10);
        kitchenLight.position.set(0, 5, 0);
        this.scene.add(kitchenLight);
        this.lights.push(kitchenLight);
    }
    
    createGround() {
        // 地板
        const floorGeometry = new THREE.PlaneGeometry(40, 40);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.2,
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // 瓷砖纹理模拟
        const tileGeometry = new THREE.PlaneGeometry(1, 1);
        const tileMaterial = new THREE.MeshStandardMaterial({
            color: 0xDEB887,
            roughness: 0.6,
            metalness: 0.1,
        });
        
        for (let x = -5; x < 5; x++) {
            for (let z = -5; z < 5; z++) {
                const tile = new THREE.Mesh(tileGeometry, tileMaterial);
                tile.rotation.x = -Math.PI / 2;
                tile.position.set(x + 0.5, 0.01, z + 0.5);
                tile.receiveShadow = true;
                this.scene.add(tile);
            }
        }
    }
    
    createKitchen() {
        // 后墙
        const wallGeometry = new THREE.BoxGeometry(20, 8, 0.5);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xF5DEB3,
            roughness: 0.7,
        });
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.set(0, 4, -10);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // 左墙
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-10, 4, 0);
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        // 右墙
        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(10, 4, 0);
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
    }
    
    createCounter() {
        // 工作台
        const counterGeometry = new THREE.BoxGeometry(6, 1, 2);
        const counterMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.5,
            metalness: 0.3,
        });
        const counter = new THREE.Mesh(counterGeometry, counterMaterial);
        counter.position.set(0, 0.5, 0);
        counter.castShadow = true;
        counter.receiveShadow = true;
        this.scene.add(counter);
        
        // 台面
        const topGeometry = new THREE.BoxGeometry(6.2, 0.1, 2.2);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x2F4F4F,
            roughness: 0.3,
            metalness: 0.5,
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(0, 1.05, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        this.scene.add(top);
        
        // 饮料机
        this.createDrinkMachine();
        
        // 炸锅
        this.createFryer();
        
        // 食材架
        this.createIngredientShelf();
    }
    
    createDrinkMachine() {
        const bodyGeometry = new THREE.BoxGeometry(1.5, 2, 0.8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xC0C0C0,
            roughness: 0.3,
            metalness: 0.8,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(4, 2, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        this.scene.add(body);
        
        // 可乐按钮
        const buttonGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
        const colaMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B0000,
            roughness: 0.4,
            metalness: 0.6,
        });
        const colaButton = new THREE.Mesh(buttonGeometry, colaMaterial);
        colaButton.rotation.x = Math.PI / 2;
        colaButton.position.set(3.8, 2.5, 0.2);
        this.scene.add(colaButton);
        
        // 橙汁按钮
        const orangeMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFA500,
            roughness: 0.4,
            metalness: 0.6,
        });
        const orangeButton = new THREE.Mesh(buttonGeometry, orangeMaterial);
        orangeButton.rotation.x = Math.PI / 2;
        orangeButton.position.set(3.8, 2.5, -0.2);
        this.scene.add(orangeButton);
        
        // 出水口
        const nozzleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
        const nozzleMaterial = new THREE.MeshStandardMaterial({
            color: 0x696969,
            roughness: 0.2,
            metalness: 0.9,
        });
        const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
        nozzle.position.set(4, 1.5, 0);
        this.scene.add(nozzle);
    }
    
    createFryer() {
        const bodyGeometry = new THREE.BoxGeometry(1.2, 0.8, 1.2);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.5,
            metalness: 0.7,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(-4, 1.4, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        this.scene.add(body);
        
        // 油槽
        const oilGeometry = new THREE.BoxGeometry(1, 0.4, 1);
        const oilMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.8,
        });
        const oil = new THREE.Mesh(oilGeometry, oilMaterial);
        oil.position.set(-4, 1.6, 0);
        this.scene.add(oil);
        
        // 温度指示灯
        const lightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 0.5,
        });
        const indicator = new THREE.Mesh(lightGeometry, lightMaterial);
        indicator.position.set(-3.3, 1.8, 0);
        this.scene.add(indicator);
    }
    
    createIngredientShelf() {
        const shelfGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
        const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.6,
            metalness: 0.2,
        });
        
        // 食材架位置
        const positions = [
            { x: -6, y: 1.5, z: 0 },
            { x: -6, y: 2.5, z: 0 },
        ];
        
        positions.forEach(pos => {
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.set(pos.x, pos.y, pos.z);
            shelf.castShadow = true;
            shelf.receiveShadow = true;
            this.scene.add(shelf);
        });
    }
    
    // 创建汉堡模型
    createBurgerModel(ingredients, position = { x: 0, y: 1.2, z: 0 }) {
        // 移除旧的汉堡模型
        this.burgerMeshes.forEach(mesh => this.scene.remove(mesh));
        this.burgerMeshes = [];
        
        let currentY = position.y;
        
        ingredients.forEach((ingredientId, index) => {
            let mesh = null;
            const ingredient = CONFIG.ingredients[ingredientId];
            
            switch (ingredientId) {
                case 'bunTop':
                    mesh = this.createBunTop();
                    break;
                case 'bunBottom':
                    mesh = this.createBunBottom();
                    break;
                case 'patty':
                    mesh = this.createPatty();
                    break;
                case 'cheese':
                    mesh = this.createCheese();
                    break;
                case 'lettuce':
                    mesh = this.createLettuce();
                    break;
                case 'tomato':
                    mesh = this.createTomato();
                    break;
                case 'onion':
                    mesh = this.createOnion();
                    break;
                case 'sauce':
                    mesh = this.createSauce();
                    break;
                case 'mustard':
                    mesh = this.createMustard();
                    break;
            }
            
            if (mesh) {
                mesh.position.set(position.x, currentY, position.z);
                mesh.animationDelay = index * 0.1;
                this.scene.add(mesh);
                this.burgerMeshes.push(mesh);
                
                // 添加掉落动画
                this.animateIngredientDrop(mesh, currentY + 2, currentY, mesh.animationDelay);
                
                // 根据食材调整高度
                let height = 0.15;
                if (ingredientId === 'bunTop' || ingredientId === 'bunBottom') height = 0.3;
                if (ingredientId === 'patty') height = 0.25;
                
                currentY += height;
            }
        });
    }
    
    createBunTop() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({
            color: 0xD2691E,
            roughness: 0.6,
            metalness: 0.1,
        });
        const bun = new THREE.Mesh(geometry, material);
        bun.scale.y = 0.6;
        bun.castShadow = true;
        bun.receiveShadow = true;
        return bun;
    }
    
    createBunBottom() {
        const geometry = new THREE.CylinderGeometry(0.5, 0.55, 0.3, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xD2691E,
            roughness: 0.6,
            metalness: 0.1,
        });
        const bun = new THREE.Mesh(geometry, material);
        bun.castShadow = true;
        bun.receiveShadow = true;
        return bun;
    }
    
    createPatty() {
        const geometry = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.1,
        });
        const patty = new THREE.Mesh(geometry, material);
        patty.castShadow = true;
        patty.receiveShadow = true;
        return patty;
    }
    
    createCheese() {
        const geometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            roughness: 0.3,
            metalness: 0.1,
        });
        const cheese = new THREE.Mesh(geometry, material);
        cheese.castShadow = true;
        cheese.receiveShadow = true;
        return cheese;
    }
    
    createLettuce() {
        const geometry = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x32CD32,
            roughness: 0.7,
            metalness: 0.1,
        });
        const lettuce = new THREE.Mesh(geometry, material);
        lettuce.castShadow = true;
        lettuce.receiveShadow = true;
        return lettuce;
    }
    
    createTomato() {
        const geometry = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFF6347,
            roughness: 0.4,
            metalness: 0.1,
        });
        const tomato = new THREE.Mesh(geometry, material);
        tomato.castShadow = true;
        tomato.receiveShadow = true;
        return tomato;
    }
    
    createOnion() {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xDDA0DD,
            roughness: 0.5,
            metalness: 0.1,
            transparent: true,
            opacity: 0.8,
        });
        const onion = new THREE.Mesh(geometry, material);
        onion.castShadow = true;
        onion.receiveShadow = true;
        return onion;
    }
    
    createSauce() {
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8B0000,
            roughness: 0.2,
            metalness: 0.1,
        });
        const sauce = new THREE.Mesh(geometry, material);
        sauce.castShadow = true;
        sauce.receiveShadow = true;
        return sauce;
    }
    
    createMustard() {
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            roughness: 0.2,
            metalness: 0.1,
        });
        const mustard = new THREE.Mesh(geometry, material);
        mustard.castShadow = true;
        mustard.receiveShadow = true;
        return mustard;
    }
    
    animateIngredientDrop(mesh, fromY, toY, delay = 0) {
        const startTime = Date.now() + delay * 1000;
        const duration = 300; // 300ms
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < 0) {
                requestAnimationFrame(animate);
                return;
            }
            
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // 缓动函数
            
            mesh.position.y = fromY + (toY - fromY) * easeProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    // 创建顾客模型
    createCustomerModel(index) {
        // 简单的顾客模型（使用基础几何体）
        const group = new THREE.Group();
        
        // 身体
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.getRandomColor(),
            roughness: 0.7,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        body.castShadow = true;
        group.add(body);
        
        // 头
        const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFDBAC,
            roughness: 0.6,
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.1;
        head.castShadow = true;
        group.add(head);
        
        // 位置设置（顾客站在柜台前）
        const xPos = -2 + index * 2;
        group.position.set(xPos, 0, 3);
        group.scale.set(0.8, 0.8, 0.8);
        
        this.scene.add(group);
        this.customerModels[index] = group;
        
        return group;
    }
    
    removeCustomerModel(index) {
        if (this.customerModels[index]) {
            this.scene.remove(this.customerModels[index]);
            this.customerModels[index] = null;
        }
    }
    
    getRandomColor() {
        const colors = [0x4169E1, 0x228B22, 0xFF6347, 0x9370DB, 0x20B2AA];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 倒饮料动画
    playPourAnimation(drinkType) {
        // 创建液体粒子
        const particleCount = 50;
        const particles = [];
        
        const startPos = { x: 4, y: 1.5, z: 0 };
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.02, 8, 8);
            let color = 0x8B0000; // 可乐颜色
            
            if (drinkType === 'orange') {
                color = 0xFFA500; // 橙汁颜色
            }
            
            const material = new THREE.MeshStandardMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(startPos);
            particle.velocity = {
                x: (Math.random() - 0.5) * 0.02,
                y: -0.1 - Math.random() * 0.05,
                z: (Math.random() - 0.5) * 0.02,
            };
            particle.life = 1.0;
            
            this.scene.add(particle);
            particles.push(particle);
        }
        
        // 动画循环
        const animateParticles = () => {
            let allDead = true;
            
            particles.forEach(particle => {
                if (particle.life > 0) {
                    allDead = false;
                    
                    particle.position.x += particle.velocity.x;
                    particle.position.y += particle.velocity.y;
                    particle.position.z += particle.velocity.z;
                    
                    particle.velocity.y -= 0.002; // 重力
                    particle.life -= 0.02;
                    particle.material.opacity = particle.life * 0.8;
                    
                    if (particle.position.y < 0.5) {
                        particle.life = 0;
                    }
                }
            });
            
            if (!allDead) {
                requestAnimationFrame(animateParticles);
            } else {
                particles.forEach(p => this.scene.remove(p));
            }
        };
        
        animateParticles();
    }
    
    // 炸薯条动画
    playFryAnimation() {
        // 创建薯条模型
        const fries = [];
        
        for (let i = 0; i < 10; i++) {
            const geometry = new THREE.BoxGeometry(0.05, 0.3, 0.05);
            const material = new THREE.MeshStandardMaterial({
                color: 0xD2B48C,
                roughness: 0.7,
            });
            
            const fry = new THREE.Mesh(geometry, material);
            fry.position.set(
                -4 + (Math.random() - 0.5) * 0.5,
                1.6,
                (Math.random() - 0.5) * 0.5
            );
            fry.rotation.z = (Math.random() - 0.5) * 0.5;
            fry.castShadow = true;
            
            this.scene.add(fry);
            fries.push(fry);
        }
        
        // 动画：薯条上下浮动模拟油炸
        let time = 0;
        const animate = () => {
            time += 0.1;
            
            fries.forEach((fry, index) => {
                fry.position.y = 1.6 + Math.sin(time + index) * 0.05;
                fry.rotation.x += 0.01;
            });
            
            // 2秒后停止
            if (time < 20) {
                requestAnimationFrame(animate);
            } else {
                fries.forEach(fry => {
                    fry.material.color.setHex(0xFFD700); // 变成金黄色
                });
            }
        };
        
        animate();
    }
    
    onWindowResize() {
        const container = document.getElementById('three-container');
        const aspect = container.clientWidth / container.clientHeight;
        
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        // 简单的场景动画：顾客轻微移动
        this.customerModels.forEach((model, index) => {
            if (model) {
                model.position.y = Math.sin(Date.now() * 0.002 + index) * 0.05;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            const container = document.getElementById('three-container');
            if (container && this.renderer.domElement) {
                container.removeChild(this.renderer.domElement);
            }
        }
    }
}

// 全局3D场景实例
const scene3D = new Scene3D();
