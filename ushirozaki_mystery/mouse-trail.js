const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Mystery monochrome colors, with a rare chance of red
const colors = [
    'rgba(255, 255, 255, 0.4)', // White
    'rgba(200, 200, 200, 0.3)', // Grey
    'rgba(100, 100, 100, 0.4)', // Dark grey
];
const rareColor = 'rgba(211, 47, 47, 0.6)'; // Accent Red

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
        this.size = Math.random() * 3 + 1; // Sharp small particles

        // 5% chance of being red (blood/tag motif)
        this.color = (Math.random() > 0.95) ? rareColor : colors[Math.floor(Math.random() * colors.length)];

        this.alpha = 1;
        this.life = Math.random() * 0.4 + 0.3; // Short life for sharp movement

        // Fast, straight linear movement (like slashing a knife or flying debris)
        // rather than soft floating
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Add a slight "gravity" pull down for realism
        this.vy += 0.1;

        this.alpha -= 0.03 / this.life;
        this.size *= 0.9; // Shrink quickly
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;

        // Draw sharp shards (triangles or thin rectangles) instead of circles
        ctx.translate(this.x, this.y);

        // Calculate angle based on velocity vector
        let angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);

        ctx.beginPath();
        // Thin glowing line / shard
        ctx.fillRect(-this.size, -this.size / 4, this.size * 3, this.size / 2);

        ctx.restore();
    }
}

// Mouse interaction
let mouse = { x: null, y: null }
let isMoving = false;
let moveTimer;

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
    isMoving = true;

    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => { isMoving = false; }, 100);

    // Spawn sharp shards
    if (Math.random() > 0.4) {
        for (let i = 0; i < 2; i++) {
            particles.push(new Particle(mouse.x, mouse.y));
        }
    }
});

// Ambient particle spawn (very rare for this theme, to keep it dark)
setInterval(() => {
    if (!isMoving && particles.length < 10 && Math.random() > 0.8) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
}, 300);

// Touch support 
window.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    for (let i = 0; i < 2; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Standard clear, no trail blur mode for sharper look

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Remove dead particles
        if (particles[i].alpha <= 0 || particles[i].size < 0.2) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();
