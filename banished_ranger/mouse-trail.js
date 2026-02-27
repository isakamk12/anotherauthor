const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Pop colors
const colors = [
    '#007BFF', // Hero Blue
    '#00C853', // Emerald Green
    '#FF6D00', // Pop Orange 
    '#FF4081', // Pop Pink
    '#FFD700'  // Gold/Yellow
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
        this.size = Math.random() * 8 + 3; // Chunkier particles for RPG feel
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 1;
        this.life = Math.random() * 0.5 + 0.5;
        // Explode outwards 
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;

        // Shape type: 0 = circle, 1 = square, 2 = triangle
        this.type = Math.floor(Math.random() * 3);

        // Spin angle calculation
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.02 / this.life;
        this.angle += this.spin;
        this.size *= 0.95; // Shrink as it dies
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        if (this.type === 0) {
            // Circle
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        } else if (this.type === 1) {
            // Square
            ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            // Triangle
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.closePath();
        }

        ctx.fill();
        ctx.restore();
    }
}

// Mouse interaction - bursting particles on move
let mouse = { x: null, y: null }
let lastX = null, lastY = null;

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;

    // Only spawn if moved enough distance
    if (lastX !== null) {
        let dist = Math.sqrt(Math.pow(mouse.x - lastX, 2) + Math.pow(mouse.y - lastY, 2));
        if (dist > 10) {
            for (let i = 0; i < 3; i++) {
                particles.push(new Particle(mouse.x, mouse.y));
            }
            lastX = mouse.x;
            lastY = mouse.y;
        }
    } else {
        lastX = mouse.x;
        lastY = mouse.y;
    }
});

// Touch support 
window.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    for (let i = 0; i < 4; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Remove dead particles
        if (particles[i].alpha <= 0 || particles[i].size < 0.5) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();
