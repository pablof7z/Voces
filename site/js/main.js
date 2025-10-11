// Animate numbers on scroll
function animateValue(element, start, end, duration) {
    const startTimestamp = Date.now();
    const step = (_timestamp) => {
        const progress = Math.min((Date.now() - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (element.getAttribute('data-suffix')) {
            element.textContent += element.getAttribute('data-suffix');
        }
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animate stats numbers
            if (entry.target.classList.contains('stat-number')) {
                const finalValue = parseInt(entry.target.getAttribute('data-value'));
                animateValue(entry.target, 0, finalValue, 2000);
                observer.unobserve(entry.target);
            }
        }
    });
}, observerOptions);

// Observe all stat numbers
document.addEventListener('DOMContentLoaded', () => {
    // Observe stats
    document.querySelectorAll('.stat-number').forEach(stat => {
        stat.setAttribute('data-suffix', stat.textContent.replace(/[0-9]/g, ''));
        observer.observe(stat);
    });

    // Smooth scroll for anchor links
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

    // Add animation classes to elements on scroll
    const animatedElements = document.querySelectorAll('.feature-card, .step, .testimonial-card, .path-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });

    // Ticker animation for live feed
    const feedItems = document.querySelector('.feed-items');
    if (feedItems) {
        // Clone items for seamless loop
        const clone = feedItems.cloneNode(true);
        feedItems.parentElement.appendChild(clone);
    }

    // Add hover effect to feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Create floating particles effect in hero
    createParticles();

    // Add typing effect to hero title (optional)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && window.innerWidth > 768) {
        addGlitchEffect(heroTitle);
    }
});

// Create floating particles
function createParticles() {
    const heroSection = document.querySelector('.hero-bg');
    if (!heroSection) return;

    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(139, 92, 246, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s infinite ease-in-out;
            animation-delay: ${Math.random() * 5}s;
        `;
        heroSection.appendChild(particle);
    }

    // Add floating animation to CSS
    if (!document.querySelector('#particle-animation')) {
        const style = document.createElement('style');
        style.id = 'particle-animation';
        style.textContent = `
            @keyframes float {
                0%, 100% {
                    transform: translateY(0) translateX(0);
                }
                25% {
                    transform: translateY(-20px) translateX(10px);
                }
                50% {
                    transform: translateY(10px) translateX(-10px);
                }
                75% {
                    transform: translateY(-10px) translateX(20px);
                }
            }
            .visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
                transition: all 0.6s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
}

// Add glitch effect to text
function addGlitchEffect(element) {
    element.addEventListener('mouseenter', () => {
        element.style.animation = 'glitch 0.3s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    });

    // Add glitch animation to CSS if not exists
    if (!document.querySelector('#glitch-animation')) {
        const style = document.createElement('style');
        style.id = 'glitch-animation';
        style.textContent = `
            @keyframes glitch {
                0% {
                    text-shadow:
                        0.05em 0 0 rgba(255, 0, 0, .75),
                        -0.025em -0.05em 0 rgba(0, 255, 0, .75),
                        0.025em 0.05em 0 rgba(0, 0, 255, .75);
                }
                14% {
                    text-shadow:
                        0.05em 0 0 rgba(255, 0, 0, .75),
                        -0.025em -0.05em 0 rgba(0, 255, 0, .75),
                        0.025em 0.05em 0 rgba(0, 0, 255, .75);
                }
                15% {
                    text-shadow:
                        -0.05em -0.025em 0 rgba(255, 0, 0, .75),
                        0.025em 0.025em 0 rgba(0, 255, 0, .75),
                        -0.05em -0.05em 0 rgba(0, 0, 255, .75);
                }
                49% {
                    text-shadow:
                        -0.05em -0.025em 0 rgba(255, 0, 0, .75),
                        0.025em 0.025em 0 rgba(0, 255, 0, .75),
                        -0.05em -0.05em 0 rgba(0, 0, 255, .75);
                }
                50% {
                    text-shadow:
                        0.025em 0.05em 0 rgba(255, 0, 0, .75),
                        0.05em 0 0 rgba(0, 255, 0, .75),
                        0 -0.05em 0 rgba(0, 0, 255, .75);
                }
                99% {
                    text-shadow:
                        0.025em 0.05em 0 rgba(255, 0, 0, .75),
                        0.05em 0 0 rgba(0, 255, 0, .75),
                        0 -0.05em 0 rgba(0, 0, 255, .75);
                }
                100% {
                    text-shadow:
                        -0.025em 0 0 rgba(255, 0, 0, .75),
                        -0.025em -0.025em 0 rgba(0, 255, 0, .75),
                        -0.025em -0.05em 0 rgba(0, 0, 255, .75);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add network visualization (optional advanced feature)
function createNetworkVisualization() {
    const canvas = document.createElement('canvas');
    canvas.id = 'network-canvas';
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0.3;
    `;

    const meshNetwork = document.querySelector('.mesh-network');
    if (meshNetwork) {
        meshNetwork.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Simple network animation
        const nodes = [];
        for (let i = 0; i < 10; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw nodes
            nodes.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off walls
                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

                // Draw connections
                nodes.forEach((otherNode, j) => {
                    if (i !== j) {
                        const distance = Math.sqrt(
                            Math.pow(node.x - otherNode.x, 2) +
                            Math.pow(node.y - otherNode.y, 2)
                        );

                        if (distance < 200) {
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(otherNode.x, otherNode.y);
                            ctx.strokeStyle = `rgba(139, 92, 246, ${1 - distance / 200})`;
                            ctx.stroke();
                        }
                    }
                });

                // Draw node
                ctx.beginPath();
                ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#8B5CF6';
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        animate();

        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
}

// Initialize network visualization on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNetworkVisualization);
} else {
    createNetworkVisualization();
}