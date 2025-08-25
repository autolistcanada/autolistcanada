/**
 * Procedural Boids Flocking Background
 * Simulates natural flocking behavior with a geometric twist.
 * 
 * This script creates a flocking simulation of boids on a canvas element.
 * It respects the 'prefers-reduced-motion' media query for accessibility.
 */
document.addEventListener('DOMContentLoaded', () => {
    const geomHost = document.querySelector('[data-bg="boids"]');
    if (!geomHost) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'geom-proc';
    geomHost.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width, height, boids;
    const colors = ['var(--brand-primary-300)', 'var(--brand-secondary-300)', 'var(--brand-tertiary-300)'];
    let resolvedColors = [];

    const boidOptions = {
        count: 50,
        maxSpeed: 2.5,
        maxForce: 0.1,
        perceptionRadius: 60,
        separationRadius: 30,
    };

    class Boid {
        constructor() {
            this.position = { x: Math.random() * width, y: Math.random() * height };
            this.velocity = { x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 };
            this.acceleration = { x: 0, y: 0 };
            this.color = resolvedColors[Math.floor(Math.random() * resolvedColors.length)];
        }

        applyForce(force) {
            this.acceleration.x += force.x;
            this.acceleration.y += force.y;
        }

        update() {
            this.velocity.x += this.acceleration.x;
            this.velocity.y += this.acceleration.y;
            const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            if (speed > boidOptions.maxSpeed) {
                this.velocity.x = (this.velocity.x / speed) * boidOptions.maxSpeed;
                this.velocity.y = (this.velocity.y / speed) * boidOptions.maxSpeed;
            }
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.acceleration = { x: 0, y: 0 };
            this.edges();
        }

        edges() {
            if (this.position.x > width) this.position.x = 0;
            else if (this.position.x < 0) this.position.x = width;
            if (this.position.y > height) this.position.y = 0;
            else if (this.position.y < 0) this.position.y = height;
        }

        flock(boids) {
            const alignment = this.align(boids);
            const cohesion = this.cohesion(boids);
            const separation = this.separation(boids);

            this.applyForce(alignment);
            this.applyForce(cohesion);
            this.applyForce(separation);
        }

        align(boids) {
            let steering = { x: 0, y: 0 };
            let total = 0;
            for (let other of boids) {
                const d = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (other !== this && d < boidOptions.perceptionRadius) {
                    steering.x += other.velocity.x;
                    steering.y += other.velocity.y;
                    total++;
                }
            }
            if (total > 0) {
                steering.x /= total;
                steering.y /= total;
                const speed = Math.sqrt(steering.x ** 2 + steering.y ** 2);
                steering.x = (steering.x / speed) * boidOptions.maxSpeed;
                steering.y = (steering.y / speed) * boidOptions.maxSpeed;
                steering.x -= this.velocity.x;
                steering.y -= this.velocity.y;
                const forceMag = Math.sqrt(steering.x ** 2 + steering.y ** 2);
                if (forceMag > boidOptions.maxForce) {
                    steering.x = (steering.x / forceMag) * boidOptions.maxForce;
                    steering.y = (steering.y / forceMag) * boidOptions.maxForce;
                }
            }
            return steering;
        }

        cohesion(boids) {
            let steering = { x: 0, y: 0 };
            let total = 0;
            for (let other of boids) {
                const d = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (other !== this && d < boidOptions.perceptionRadius) {
                    steering.x += other.position.x;
                    steering.y += other.position.y;
                    total++;
                }
            }
            if (total > 0) {
                steering.x /= total;
                steering.y /= total;
                steering.x -= this.position.x;
                steering.y -= this.position.y;
                const speed = Math.sqrt(steering.x ** 2 + steering.y ** 2);
                steering.x = (steering.x / speed) * boidOptions.maxSpeed;
                steering.y = (steering.y / speed) * boidOptions.maxSpeed;
                steering.x -= this.velocity.x;
                steering.y -= this.velocity.y;
                const forceMag = Math.sqrt(steering.x ** 2 + steering.y ** 2);
                if (forceMag > boidOptions.maxForce) {
                    steering.x = (steering.x / forceMag) * boidOptions.maxForce;
                    steering.y = (steering.y / forceMag) * boidOptions.maxForce;
                }
            }
            return steering;
        }

        separation(boids) {
            let steering = { x: 0, y: 0 };
            let total = 0;
            for (let other of boids) {
                const d = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (other !== this && d < boidOptions.separationRadius) {
                    let diffX = this.position.x - other.position.x;
                    let diffY = this.position.y - other.position.y;
                    diffX /= d * d; // Weight by distance
                    diffY /= d * d;
                    steering.x += diffX;
                    steering.y += diffY;
                    total++;
                }
            }
            if (total > 0) {
                steering.x /= total;
                steering.y /= total;
                const speed = Math.sqrt(steering.x ** 2 + steering.y ** 2);
                steering.x = (steering.x / speed) * boidOptions.maxSpeed;
                steering.y = (steering.y / speed) * boidOptions.maxSpeed;
                steering.x -= this.velocity.x;
                steering.y -= this.velocity.y;
                const forceMag = Math.sqrt(steering.x ** 2 + steering.y ** 2);
                if (forceMag > boidOptions.maxForce) {
                    steering.x = (steering.x / forceMag) * boidOptions.maxForce;
                    steering.y = (steering.y / forceMag) * boidOptions.maxForce;
                }
            }
            return steering;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
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
        
        boids = [];
        for (let i = 0; i < boidOptions.count; i++) {
            boids.push(new Boid());
        }
    }

    function animate() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Fading trails
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let boid of boids) {
            boid.flock(boids);
            boid.update();
            boid.draw();
        }
        requestAnimationFrame(animate);
    }

    if (prefersReducedMotion) {
        const fallback = document.createElement('div');
        fallback.className = 'geom-statement';
        const style = getComputedStyle(document.documentElement);
        const color = encodeURIComponent(style.getPropertyValue('--brand-secondary-200'));
        fallback.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="2" fill="${color}"/></svg>')`;
        fallback.style.backgroundSize = '15px';
        geomHost.prepend(fallback);
    } else {
        setup();
        animate();
        window.addEventListener('resize', setup);
    }
});
