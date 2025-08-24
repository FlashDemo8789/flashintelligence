// Device orientation and gyroscope effects
class DeviceOrientation {
    constructor() {
        this.permission = false;
        this.alpha = 0;
        this.beta = 0;
        this.gamma = 0;
        this.init();
    }
    
    async init() {
        // Check if DeviceOrientationEvent is supported
        if (typeof DeviceOrientationEvent !== 'undefined') {
            // Check if we need permission (iOS 13+)
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const response = await DeviceOrientationEvent.requestPermission();
                    if (response === 'granted') {
                        this.permission = true;
                    }
                } catch (error) {
                    console.log('Permission request failed:', error);
                    this.createPermissionButton();
                }
            } else {
                // No permission needed
                this.permission = true;
            }
            
            if (this.permission) {
                this.startListening();
            }
        }
        
        // Fallback to mouse parallax
        this.initMouseParallax();
    }
    
    createPermissionButton() {
        const button = document.createElement('button');
        button.textContent = 'Enable Motion Effects';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            background: linear-gradient(135deg, #FF006E, #8338EC);
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            cursor: pointer;
            z-index: 1000;
            animation: pulse 2s infinite;
        `;
        
        button.addEventListener('click', async () => {
            try {
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    this.permission = true;
                    this.startListening();
                    button.remove();
                }
            } catch (error) {
                console.error('Permission denied:', error);
            }
        });
        
        document.body.appendChild(button);
    }
    
    startListening() {
        window.addEventListener('deviceorientation', (e) => {
            this.alpha = e.alpha || 0;
            this.beta = e.beta || 0;
            this.gamma = e.gamma || 0;
            
            this.updateElements();
        });
        
        // Also listen for device motion for additional effects
        window.addEventListener('devicemotion', (e) => {
            if (e.acceleration) {
                this.handleMotion(e.acceleration);
            }
        });
    }
    
    updateElements() {
        // Normalize values
        const tiltX = this.gamma / 90; // -1 to 1
        const tiltY = this.beta / 180; // -1 to 1
        
        // Update 3D logo
        const logo = document.querySelector('.logo-3d-container');
        if (logo) {
            gsap.to(logo, {
                rotationY: tiltX * 30,
                rotationX: -tiltY * 30,
                duration: 0.5,
                ease: "power2.out"
            });
        }
        
        // Update holographic layers
        const holoLayers = document.querySelectorAll('.holo-layer');
        holoLayers.forEach((layer, index) => {
            const depth = (index + 1) * 10;
            gsap.to(layer, {
                x: tiltX * depth,
                y: tiltY * depth,
                duration: 0.5,
                ease: "power2.out"
            });
        });
        
        // Update feature cards
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach((card, index) => {
            const offset = index - 1; // -1, 0, 1
            gsap.to(card, {
                x: tiltX * 20 * offset,
                y: tiltY * 10,
                rotationY: tiltX * 5,
                rotationX: -tiltY * 5,
                duration: 0.5,
                ease: "power2.out"
            });
        });
        
        // Update particles
        const particles = document.querySelectorAll('.field-particle');
        particles.forEach((particle, index) => {
            const speed = 0.5 + (index % 3) * 0.25;
            gsap.to(particle, {
                x: tiltX * 50 * speed,
                y: tiltY * 50 * speed,
                duration: 1,
                ease: "power2.out"
            });
        });
        
        // Update background perspective
        const viewport = document.querySelector('.viewport');
        if (viewport) {
            gsap.to(viewport, {
                perspectiveOriginX: `${50 + tiltX * 10}%`,
                perspectiveOriginY: `${50 + tiltY * 10}%`,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }
    
    handleMotion(acceleration) {
        const threshold = 1.5;
        
        if (Math.abs(acceleration.x) > threshold || 
            Math.abs(acceleration.y) > threshold || 
            Math.abs(acceleration.z) > threshold) {
            
            // Trigger shake effect
            this.triggerShake();
        }
    }
    
    triggerShake() {
        const elements = document.querySelectorAll('.letter, .feature-card');
        
        elements.forEach((el, index) => {
            gsap.to(el, {
                x: gsap.utils.random(-10, 10),
                y: gsap.utils.random(-10, 10),
                rotation: gsap.utils.random(-5, 5),
                duration: 0.1,
                ease: "power2.out",
                yoyo: true,
                repeat: 3,
                delay: index * 0.02,
                onComplete: () => {
                    gsap.set(el, { x: 0, y: 0, rotation: 0 });
                }
            });
        });
        
        // Trigger haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([20, 10, 20]);
        }
    }
    
    initMouseParallax() {
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        
        const updateMouseParallax = () => {
            targetX += (mouseX - targetX) * 0.05;
            targetY += (mouseY - targetY) * 0.05;
            
            // Only apply if device orientation isn't active
            if (!this.permission) {
                // Update holographic grid
                const grid = document.querySelector('.holographic-grid');
                if (grid) {
                    gsap.set(grid, {
                        rotationX: 60 + targetY * 10,
                        rotationY: targetX * 10
                    });
                }
                
                // Update ambient lights
                const lights = document.querySelectorAll('.light-source');
                lights.forEach((light, index) => {
                    const speed = 0.5 + index * 0.2;
                    gsap.set(light, {
                        x: targetX * 100 * speed,
                        y: targetY * 100 * speed
                    });
                });
            }
            
            requestAnimationFrame(updateMouseParallax);
        };
        
        updateMouseParallax();
    }
}

// Initialize device orientation effects
document.addEventListener('DOMContentLoaded', () => {
    new DeviceOrientation();
    
    // Add pulse animation for permission button
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(255, 0, 110, 0.7);
            }
            70% {
                box-shadow: 0 0 0 20px rgba(255, 0, 110, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(255, 0, 110, 0);
            }
        }
    `;
    document.head.appendChild(style);
});