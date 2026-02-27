const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Butterfly Colors (Neon Blue / White)
const colors = [
    'rgba(0, 240, 255, 0.8)', // Cyan Glow
    'rgba(150, 255, 255, 0.6)', // Pale Blue
    'rgba(255, 255, 255, 0.9)'  // Bright White
];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

class ButterflyParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // Fluttering movement
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.8) * 3; // Tendency to fly upwards

        this.alpha = 1;
        this.life = Math.random() * 0.8 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.2; // Wing flap speed

        // Is it a butterfly or just a light speck?
        this.isButterfly = Math.random() > 0.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Add random flutter to velocity
        this.vx += (Math.random() - 0.5) * 0.5;
        this.vy += (Math.random() - 0.5) * 0.5;

        this.angle += this.spin;
        this.alpha -= 0.01 / this.life;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Add a soft glow behind the particle
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';

        if (this.isButterfly) {
            // Draw a simple butterfly shape (two overlapping ellipses representing wings flapping)
            const flap = Math.abs(Math.sin(this.angle * 5)); // Simulate wing flap with sine wave

            ctx.beginPath();
            // Left wing
            ctx.ellipse(-this.size / 2, 0, this.size * flap, this.size, 0, 0, Math.PI * 2);
            // Right wing
            ctx.ellipse(this.size / 2, 0, this.size * flap, this.size, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Just a glowing speck of light
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Mouse interaction
let mouse = { x: null, y: null }

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;

    // Spawn butterflies
    if (Math.random() > 0.6) {
        particles.push(new ButterflyParticle(mouse.x, mouse.y));
    }
});

// Ambient particles flying upwards
setInterval(() => {
    if (particles.length < 50) {
        particles.push(new ButterflyParticle(Math.random() * width, height + 10));
    }
}, 200);

// Touch support 
window.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    if (Math.random() > 0.3) {
        particles.push(new ButterflyParticle(mouse.x, mouse.y));
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Remove dead particles
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();
