/**
 * Procedural Penrose Tiling Background
 * Inspired by geometric Canadian mosaics.
 * 
 * This script generates a dynamic Penrose tiling pattern on a canvas element.
 * It respects the 'prefers-reduced-motion' media query to provide an accessible experience.
 */

document.addEventListener('DOMContentLoaded', () => {
    const geomHost = document.querySelector('[data-bg="penrose"]');
    if (!geomHost) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'geom-proc';
    geomHost.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width, height, triangles;
    const colors = ['var(--brand-primary-500)', 'var(--brand-secondary-400)', 'var(--brand-tertiary-500)', 'var(--brand-accent-500)'];

    // Penrose tiling constants
    const PHI = (1 + Math.sqrt(5)) / 2;

    function resize() {
        width = geomHost.offsetWidth;
        height = geomHost.offsetHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        if (!prefersReducedMotion) {
            generateTriangles();
            draw();
        }
    }

    function generateTriangles() {
        triangles = [];
        const initialTriangles = createInitialStar();
        let generation = [].concat(initialTriangles);

        for (let i = 0; i < 4; i++) {
            let nextGeneration = [];
            generation.forEach(tri => {
                nextGeneration = nextGeneration.concat(subdivide(tri));
            });
            generation = nextGeneration;
        }
        triangles = generation;
    }

    function createInitialStar() {
        const initial = [];
        for (let i = 0; i < 10; i++) {
            const angle = i * Math.PI / 5;
            const nextAngle = (i + 1) * Math.PI / 5;
            const p1 = { x: width / 2, y: height / 2 };
            const p2 = { x: width / 2 + width * Math.cos(angle), y: height / 2 + width * Math.sin(angle) };
            const p3 = { x: width / 2 + width * Math.cos(nextAngle), y: height / 2 + width * Math.sin(nextAngle) };
            initial.push({ p1, p2, p3, type: 'thin' });
        }
        return initial;
    }

    function subdivide(tri) {
        if (tri.type === 'thin') {
            const P = { x: tri.p1.x + (tri.p2.x - tri.p1.x) / PHI, y: tri.p1.y + (tri.p2.y - tri.p1.y) / PHI };
            return [
                { p1: P, p2: tri.p3, p3: tri.p1, type: 'thin' },
                { p1: tri.p2, p2: tri.p3, p3: P, type: 'thick' }
            ];
        } else { // thick
            const Q = { x: tri.p2.x + (tri.p1.x - tri.p2.x) / PHI, y: tri.p2.y + (tri.p1.y - tri.p2.y) / PHI };
            const R = { x: tri.p2.x + (tri.p3.x - tri.p2.x) / PHI, y: tri.p2.y + (tri.p3.y - tri.p2.y) / PHI };
            return [
                { p1: R, p2: tri.p1, p3: tri.p2, type: 'thick' },
                { p1: Q, p2: tri.p1, p3: R, type: 'thin' },
                { p1: R, p2: tri.p3, p3: Q, type: 'thick' }
            ];
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const style = getComputedStyle(document.documentElement);
        const resolvedColors = colors.map(c => style.getPropertyValue(c.match(/--[\w-]+/)[0]));

        triangles.forEach((tri, i) => {
            ctx.beginPath();
            ctx.moveTo(tri.p1.x, tri.p1.y);
            ctx.lineTo(tri.p2.x, tri.p2.y);
            ctx.lineTo(tri.p3.x, tri.p3.y);
            ctx.closePath();
            ctx.fillStyle = resolvedColors[i % resolvedColors.length];
            ctx.fill();
        });
    }

    if (prefersReducedMotion) {
        const fallback = document.createElement('div');
        fallback.className = 'geom-statement';
        fallback.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M0 0 L50 25 L100 0 L75 50 L100 100 L50 75 L0 100 L25 50 Z" fill="${encodeURIComponent(getComputedStyle(document.documentElement).getPropertyValue('--brand-primary-100'))}"/></svg>')`;
        fallback.style.backgroundSize = '20px';
        geomHost.prepend(fallback);
    } else {
        window.addEventListener('resize', resize);
        resize();
    }
});
