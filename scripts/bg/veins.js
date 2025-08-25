/**
 * Procedural Organic Veins Background
 * Simulates a growing, branching root or vein network.
 * 
 * This script uses a particle system to draw branching lines on a canvas.
 * It respects the 'prefers-reduced-motion' media query for accessibility.
 */
document.addEventListener('DOMContentLoaded', () => {
    const geomHost = document.querySelector('[data-bg="veins"]');
    if (!geomHost) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'geom-proc';
    geomHost.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width, height, walkers;
    const colors = ['var(--brand-success-400)', 'var(--brand-success-500)'];
    let resolvedColors = [];

    const walkerOptions = {
        count: 30,
        maxWalkers: 150,
        splitChance: 0.015,
        killChance: 0.005,
        speed: 0.75,
    };

    class Walker {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.px = x;
            this.py = y;
            this.vx = (Math.random() - 0.5) * walkerOptions.speed;
            this.vy = (Math.random() - 0.5) * walkerOptions.speed;
            this.color = resolvedColors[Math.floor(Math.random() * resolvedColors.length)];
            this.lineWidth = 1 + Math.random() * 1.5;
        }

        update() {
            this.px = this.x;
            this.py = this.y;

            this.x += this.vx;
            this.y += this.vy;

            // Add some noise to the velocity
            this.vx += (Math.random() - 0.5) * 0.4;
            this.vy += (Math.random() - 0.5) * 0.4;

            // Clamp velocity
            const speed = Math.hypot(this.vx, this.vy);
            if (speed > walkerOptions.speed) {
                this.vx = (this.vx / speed) * walkerOptions.speed;
                this.vy = (this.vy / speed) * walkerOptions.speed;
            }

            // Bounce off edges
            if (this.x > width) { this.x = width; this.vx *= -1; }
            if (this.x < 0) { this.x = 0; this.vx *= -1; }
            if (this.y > height) { this.y = height; this.vy *= -1; }
            if (this.y < 0) { this.y = 0; this.vy *= -1; }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.px, this.py);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    function setup() {
        width = geomHost.offsetWidth;
        height = geomHost.offsetHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const style = getComputedStyle(document.documentElement);
        resolvedColors = colors.map(c => style.getPropertyValue(c.match(/--[\w-]+/)[0]));
        
        walkers = [];
        for (let i = 0; i < walkerOptions.count; i++) {
            walkers.push(new Walker(Math.random() * width, Math.random() * height));
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    }

    function animate() {
        // Semi-transparent overlay to create fading effect
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';

        for (let i = walkers.length - 1; i >= 0; i--) {
            const walker = walkers[i];
            walker.update();
            walker.draw();

            if (walkers.length < walkerOptions.maxWalkers && Math.random() < walkerOptions.splitChance) {
                walkers.push(new Walker(walker.x, walker.y));
            }

            if (walkers.length > walkerOptions.count && Math.random() < walkerOptions.killChance) {
                walkers.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    if (prefersReducedMotion) {
        const fallback = document.createElement('div');
        fallback.className = 'geom-statement';
        const style = getComputedStyle(document.documentElement);
        const color1 = encodeURIComponent(style.getPropertyValue('--brand-success-200'));
        const color2 = encodeURIComponent(style.getPropertyValue('--brand-success-300'));
        fallback.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M0 50 Q 25 25, 50 50 T 100 50" stroke="${color1}" stroke-width="1" fill="none"/><path d="M0 60 Q 25 85, 50 60 T 100 60" stroke="${color2}" stroke-width="1" fill="none"/></svg>')`;
        fallback.style.backgroundSize = '40px';
        geomHost.prepend(fallback);
    } else {
        setup();
        animate();
        window.addEventListener('resize', setup);
    }
});
