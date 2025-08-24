// Premium GSAP animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    
    // Custom cursor
    const cursor = { x: 0, y: 0 };
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);
    
    // Cursor styles
    const cursorStyles = `
        .cursor-dot {
            position: fixed;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.8), transparent);
            pointer-events: none;
            z-index: 10000;
            mix-blend-mode: difference;
            transform: translate(-50%, -50%);
            transition: transform 0.1s ease-out;
        }
        
        .cursor-dot.hover {
            transform: translate(-50%, -50%) scale(2);
            background: radial-gradient(circle, rgba(78,205,196,0.8), transparent);
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = cursorStyles;
    document.head.appendChild(styleSheet);
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
        
        gsap.to(cursorDot, {
            x: cursor.x,
            y: cursor.y,
            duration: 0.1,
            ease: "power2.out"
        });
    });
    
    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .feature-card, .orb-core, [data-magnetic]');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorDot.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorDot.classList.remove('hover'));
    });
    
    // Liquid metal text animation
    const letters = document.querySelectorAll('.letter');
    letters.forEach((letter, index) => {
        gsap.set(letter, {
            transformOrigin: "50% 100%"
        });
        
        gsap.from(letter, {
            y: 100,
            opacity: 0,
            scale: 0.5,
            rotation: gsap.utils.random(-30, 30),
            duration: 1.5,
            delay: index * 0.1,
            ease: "elastic.out(1, 0.5)"
        });
        
        letter.addEventListener('mouseenter', () => {
            gsap.to(letter, {
                scale: 1.2,
                rotation: gsap.utils.random(-10, 10),
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        letter.addEventListener('mouseleave', () => {
            gsap.to(letter, {
                scale: 1,
                rotation: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
    
    // Subheadline animation
    gsap.from('.subheadline-glass .word', {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        delay: 0.8,
        ease: "power3.out"
    });
    
    // Holographic layers parallax
    const holoLayers = document.querySelectorAll('.holo-layer');
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        holoLayers.forEach((layer, index) => {
            const depth = (index + 1) * 20;
            gsap.to(layer, {
                x: x * depth,
                y: y * depth,
                duration: 1,
                ease: "power2.out"
            });
        });
    });
    
    // Orb animation
    const orbCore = document.querySelector('.orb-core');
    const orbOuter = document.querySelector('.orb-outer');
    
    // Continuous rotation
    gsap.to('.orb-middle', {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
    });
    
    gsap.to('.orb-inner', {
        rotation: -360,
        duration: 30,
        repeat: -1,
        ease: "none"
    });
    
    // Orb hover effect
    orbCore.addEventListener('mouseenter', () => {
        gsap.to(orbCore, {
            scale: 1.2,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.5);
            transform: translate(-50%, -50%);
            pointer-events: none;
        `;
        orbOuter.appendChild(ripple);
        
        gsap.to(ripple, {
            scale: 3,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => ripple.remove()
        });
    });
    
    orbCore.addEventListener('mouseleave', () => {
        gsap.to(orbCore, {
            scale: 1,
            duration: 0.6,
            ease: "elastic.out(1, 0.3)"
        });
    });
    
    // Feature cards 3D tilt
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                duration: 0.3,
                ease: "power2.out",
                transformPerspective: 1000
            });
            
            // Move shine effect
            const shine = card.querySelector('.card-shine');
            if (shine) {
                gsap.to(shine, {
                    x: `${(x / rect.width) * 100}%`,
                    duration: 0.3
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
    
    // Email field focus animation
    const emailField = document.querySelector('.email-field-premium');
    const fieldGlow = document.querySelector('.field-glow');
    
    emailField.addEventListener('focus', () => {
        gsap.to(fieldGlow, {
            scale: 1.2,
            duration: 0.3
        });
    });
    
    emailField.addEventListener('blur', () => {
        gsap.to(fieldGlow, {
            scale: 1,
            duration: 0.3
        });
    });
    
    // Particle field animation
    createParticleField();
    
    // Scroll-triggered animations
    gsap.from('.feature-card', {
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: {
            trigger: '.feature-showcase',
            start: 'top 80%'
        }
    });
    
    // Ambient light animation
    const lights = document.querySelectorAll('.light-source');
    lights.forEach((light, index) => {
        gsap.to(light, {
            x: gsap.utils.random(-200, 200),
            y: gsap.utils.random(-200, 200),
            duration: gsap.utils.random(20, 30),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 2
        });
    });
});

// Create interactive particle field
function createParticleField() {
    const container = document.getElementById('particle-field');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'field-particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255,255,255,0.5);
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        container.appendChild(particle);
        
        // Animate particle
        gsap.to(particle, {
            x: gsap.utils.random(-100, 100),
            y: gsap.utils.random(-100, 100),
            duration: gsap.utils.random(10, 20),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 5
        });
        
        // Glow on hover proximity
        document.addEventListener('mousemove', (e) => {
            const rect = particle.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(e.clientX - rect.left, 2) + 
                Math.pow(e.clientY - rect.top, 2)
            );
            
            if (distance < 100) {
                particle.style.boxShadow = `0 0 ${10 - distance/10}px rgba(78,205,196,0.8)`;
                particle.style.transform = `scale(${2 - distance/100})`;
            } else {
                particle.style.boxShadow = '';
                particle.style.transform = '';
            }
        });
    }
}

// Sound feedback system
class SoundSystem {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.1;
        this.masterGain.connect(this.context.destination);
    }
    
    playHover() {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(800, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.1);
    }
    
    playClick() {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(400, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.2);
    }
}

// Initialize sound system
const soundSystem = new SoundSystem();

// Add sound to interactions
document.querySelectorAll('a, button, .feature-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        soundSystem.playHover();
    });
    
    el.addEventListener('click', () => {
        soundSystem.playClick();
    });
});