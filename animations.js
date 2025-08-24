// Smooth scroll and parallax effects
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Since this is a single page coming soon, just add a smooth bounce effect
            document.querySelector('.hero-content').style.transform = 'scale(0.98)';
            setTimeout(() => {
                document.querySelector('.hero-content').style.transform = 'scale(1)';
            }, 200);
        });
    });

    // Email form handling with haptic feedback
    const emailForm = document.querySelector('.email-form');
    const emailInput = document.querySelector('.email-input');
    const ctaButton = document.querySelector('.cta-button');

    ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!emailInput.value) {
            // Shake effect for empty input
            emailForm.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
            emailForm.style.animation = '';
            }, 500);
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailForm.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                emailForm.style.animation = '';
            }, 500);
            return;
        }

        // Success animation
        ctaButton.innerHTML = '<span class="button-text">✓ You\'re in!</span>';
        ctaButton.style.background = 'linear-gradient(135deg, #4ECDC4, #45B7D1)';
        
        // Create success ripple
        const ripple = document.createElement('div');
        ripple.className = 'success-ripple';
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(78, 205, 196, 0.3);
            animation: rippleOut 1s ease-out;
        `;
        ctaButton.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 1000);

        // Reset after delay
        setTimeout(() => {
            emailInput.value = '';
            ctaButton.innerHTML = '<span class="button-text">Get Early Access</span><span class="button-icon">→</span>';
            ctaButton.style.background = '';
        }, 3000);
    });

    // Parallax effect for floating elements
    let scrollY = 0;
    let ticking = false;

    function updateParallax() {
        const floatElements = document.querySelectorAll('.float-element');
        
        floatElements.forEach((element, index) => {
            const speed = parseFloat(element.dataset.speed) || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        requestTick();
    });

    // Interactive logo animation on hover
    const logoContainer = document.querySelector('.main-logo-container');
    const logoCore = document.querySelector('.logo-core');

    logoContainer.addEventListener('mouseenter', () => {
        logoCore.style.transform = 'scale(1.1)';
        document.querySelector('.energy-ring').style.animationDuration = '5s';
    });

    logoContainer.addEventListener('mouseleave', () => {
        logoCore.style.transform = 'scale(1)';
        document.querySelector('.energy-ring').style.animationDuration = '10s';
    });

    // Magnetic button effect
    ctaButton.addEventListener('mousemove', (e) => {
        const rect = ctaButton.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        ctaButton.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
    });

    ctaButton.addEventListener('mouseleave', () => {
        ctaButton.style.transform = '';
    });

    // Add CSS for shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes rippleOut {
            to {
                width: 300px;
                height: 300px;
                opacity: 0;
            }
        }
        
        .hero-content {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .logo-core {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
    document.head.appendChild(style);

    // Feature pills interactive effect
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('mouseenter', (e) => {
            const icon = pill.querySelector('.pill-icon');
            icon.style.transform = 'scale(1.2) rotate(10deg)';
            icon.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        });

        pill.addEventListener('mouseleave', (e) => {
            const icon = pill.querySelector('.pill-icon');
            icon.style.transform = '';
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature pills for entrance animation
    document.querySelectorAll('.pill').forEach((pill, index) => {
        pill.style.opacity = '0';
        pill.style.transform = 'translateY(20px)';
        pill.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(pill);
    });
});