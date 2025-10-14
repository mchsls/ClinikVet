// Animations and effects
class Animations {
    constructor() {
        this.initializeAnimations();
    }

    initializeAnimations() {
        this.createParticles();
        this.initializeScrollAnimations();
        this.initializePreloader();
        this.initializeSmoothScrolling();
    }

    // Particle background effect
    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 4 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 3;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${posX}%;
                top: ${posY}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                opacity: ${Math.random() * 0.3 + 0.1};
            `;
            
            container.appendChild(particle);
        }
    }

    // Scroll animations
    initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Stagger animation for children
                    if (entry.target.classList.contains('services-grid')) {
                        const cards = entry.target.querySelectorAll('.service-card');
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('animate-scale');
                            }, index * 100);
                        });
                    }
                }
            });
        }, observerOptions);

        // Observe all elements with animation classes
        document.querySelectorAll('.animate-fade-up, .animate-scale, .services-grid, .about-content, .doctors-grid')
            .forEach(el => observer.observe(el));
    }

    // Preloader - FIXED VERSION
    initializePreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        // Hide preloader when page is loaded
        const hidePreloader = () => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 500);
        };

        // Use both DOMContentLoaded and load events for better reliability
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Wait a bit more for all resources
                setTimeout(hidePreloader, 1000);
            });
        } else {
            // DOM is already ready
            setTimeout(hidePreloader, 1000);
        }

        // Fallback - hide preloader after max 3 seconds
        setTimeout(hidePreloader, 3000);
    }

    // Smooth scrolling for navigation
    initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Floating animation for elements
    addFloatingAnimation(element, amplitude = 20, duration = 3) {
        element.style.animation = `float ${duration}s ease-in-out infinite`;
    }

    // Typewriter effect
    typewriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Counter animation
    animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.animations = new Animations();
});