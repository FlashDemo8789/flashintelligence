// Magnetic attraction effects for premium interactions
class MagneticEffect {
    constructor() {
        this.elements = document.querySelectorAll('[data-magnetic]');
        this.init();
    }
    
    init() {
        this.elements.forEach(element => {
            element.addEventListener('mousemove', (e) => this.magnetize(e, element));
            element.addEventListener('mouseleave', (e) => this.demagnetize(e, element));
        });
    }
    
    magnetize(e, element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Calculate magnetic strength based on distance from center
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = Math.sqrt(rect.width * rect.width + rect.height * rect.height) / 2;
        const strength = Math.max(0, 1 - distance / maxDistance);
        
        // Apply magnetic pull
        gsap.to(element, {
            x: x * 0.3 * strength,
            y: y * 0.3 * strength,
            scale: 1 + 0.1 * strength,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Distort text if present
        const text = element.querySelector('.nav-text, .orb-text, .feature-title');
        if (text) {
            gsap.to(text, {
                skewX: x * 0.05 * strength,
                skewY: y * 0.02 * strength,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }
    
    demagnetize(e, element) {
        gsap.to(element, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "elastic.out(1, 0.3)"
        });
        
        const text = element.querySelector('.nav-text, .orb-text, .feature-title');
        if (text) {
            gsap.to(text, {
                skewX: 0,
                skewY: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            });
        }
    }
}

// Liquid metal morph effect
class LiquidMetal {
    constructor() {
        this.initMorphing();
    }
    
    initMorphing() {
        // Create SVG filters for liquid effect
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = 0;
        svg.style.height = 0;
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.id = 'liquid-metal';
        
        const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur.setAttribute('in', 'SourceGraphic');
        blur.setAttribute('stdDeviation', '10');
        blur.setAttribute('result', 'blur');
        
        const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        colorMatrix.setAttribute('in', 'blur');
        colorMatrix.setAttribute('mode', 'matrix');
        colorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7');
        
        filter.appendChild(blur);
        filter.appendChild(colorMatrix);
        defs.appendChild(filter);
        svg.appendChild(defs);
        document.body.appendChild(svg);
        
        // Apply to elements
        this.applyLiquidEffect();
    }
    
    applyLiquidEffect() {
        const liquidElements = document.querySelectorAll('.orb-core, .logo-prism');
        
        liquidElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.filter = 'url(#liquid-metal)';
                gsap.to(element, {
                    scale: 1.1,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.3)"
                });
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.filter = '';
                gsap.to(element, {
                    scale: 1,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }
}

// Haptic feedback simulation
class HapticFeedback {
    constructor() {
        this.init();
    }
    
    init() {
        // Check if Vibration API is supported
        this.canVibrate = 'vibrate' in navigator;
        
        // Add haptic feedback to buttons and interactive elements
        const interactiveElements = document.querySelectorAll('button, .orb-core, .feature-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('click', () => this.triggerHaptic('click'));
            element.addEventListener('mouseenter', () => this.triggerHaptic('hover'));
        });
    }
    
    triggerHaptic(type) {
        if (!this.canVibrate) return;
        
        switch(type) {
            case 'click':
                navigator.vibrate([10, 10, 10]);
                break;
            case 'hover':
                navigator.vibrate(5);
                break;
            case 'success':
                navigator.vibrate([20, 10, 20]);
                break;
            case 'error':
                navigator.vibrate([50, 20, 50]);
                break;
        }
    }
}

// Advanced scroll effects
class ScrollEffects {
    constructor() {
        this.init();
    }
    
    init() {
        // Smooth scroll with easing
        this.smoothScroll();
        
        // Parallax scrolling for elements
        this.initParallax();
        
        // Reveal animations on scroll
        this.initRevealAnimations();
    }
    
    smoothScroll() {
        let scrollY = window.scrollY;
        let targetY = scrollY;
        
        const updateScroll = () => {
            scrollY += (targetY - scrollY) * 0.1;
            
            if (Math.abs(targetY - scrollY) > 0.1) {
                requestAnimationFrame(updateScroll);
            }
        };
        
        window.addEventListener('scroll', () => {
            targetY = window.scrollY;
            updateScroll();
        });
    }
    
    initParallax() {
        const parallaxElements = document.querySelectorAll('.holographic-grid, .ambient-lights, .particle-field');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                
                gsap.to(element, {
                    y: yPos,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });
        });
    }
    
    initRevealAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    gsap.from(entry.target, {
                        y: 50,
                        opacity: 0,
                        duration: 1,
                        ease: "power3.out"
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.feature-card, .description-hologram').forEach(el => {
            observer.observe(el);
        });
    }
}

// Initialize all effects
document.addEventListener('DOMContentLoaded', () => {
    new MagneticEffect();
    new LiquidMetal();
    new HapticFeedback();
    new ScrollEffects();
    
    // Add CSS for liquid metal filter
    const style = document.createElement('style');
    style.textContent = `
        .revealed {
            animation: revealGlow 1s ease-out;
        }
        
        @keyframes revealGlow {
            0% {
                box-shadow: 0 0 0 rgba(78, 205, 196, 0);
            }
            50% {
                box-shadow: 0 0 50px rgba(78, 205, 196, 0.5);
            }
            100% {
                box-shadow: 0 0 0 rgba(78, 205, 196, 0);
            }
        }
        
        [data-magnetic] {
            will-change: transform;
        }
    `;
    document.head.appendChild(style);
});