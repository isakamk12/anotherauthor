const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Colors
const demonColors = [
    'rgba(154, 43, 194, 0.8)', // Purple
    'rgba(26, 11, 46, 0.9)'    // Dark Purple
];
const heroColors = [
    'rgba(255, 123, 0, 0.8)',  // Orange
    'rgba(255, 215, 0, 0.8)'   // Gold
];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;

        // Determine side based on layout (Left/Top vs Right/Bottom)
        // For simplicity, just use screen X/Y to guess the split
        // The split goes from top-right to bottom-left roughly, but let's just use diagonal check
        const isDemonSide = (this.y / height) < (1 - (this.x / width)) ? true : false;

        // On mobile it's top/bottom split
        const isMobile = width <= 900;
        const inDemonZone = isMobile ? (this.y < height / 2) : isDemonSide;

        if (inDemonZone) {
            this.color = demonColors[Math.floor(Math.random() * demonColors.length)];
            this.type = 'poison'; // Bubbling up
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = -(Math.random() * 1.5 + 0.5);
            this.shape = 'circle';
        } else {
            this.color = heroColors[Math.floor(Math.random() * heroColors.length)];
            this.type = 'sparkle'; // Popping out
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4;
            this.shape = 'star';
        }

        this.alpha = 1;
        this.life = Math.random() * 0.8 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.type === 'sparkle') {
            // Add gravity to sparkles
            this.vy += 0.1;
        } else {
            // Wiggle poison bubbles
            this.x += Math.sin(this.life * 10) * 0.5;
        }

        this.angle += this.spin;
        this.alpha -= 0.02 / this.life;
        this.size *= 0.95;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw a simple 4 point star/sparkle
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.quadraticCurveTo(this.size / 2, -this.size / 2, this.size, 0);
            ctx.quadraticCurveTo(this.size / 2, this.size / 2, 0, this.size);
            ctx.quadraticCurveTo(-this.size / 2, this.size / 2, -this.size, 0);
            ctx.quadraticCurveTo(-this.size / 2, -this.size / 2, 0, -this.size);
            ctx.fill();
        }

        ctx.restore();
    }
}

let mouse = { x: null, y: null }

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;

    for (let i = 0; i < 2; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

// Ambient particles
setInterval(() => {
    if (particles.length < 50) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
}, 200);

// Touch support 
window.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    for (let i = 0; i < 2; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();
