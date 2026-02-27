const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Soft, transparent colors matching the pure literature / frosted glass vibe
const colors = [
    'rgba(168, 201, 219, 0.15)', // Pale Blue
    'rgba(216, 216, 216, 0.1)',  // Light Grey
    'rgba(255, 255, 255, 0.2)'   // White
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
        // Large, very soft circles to mimic blurred glass or breath on a window
        this.size = Math.random() * 40 + 20;
        this.color = colors[Math.floor(Math.random() * colors.length)];

        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5 - 0.2; // drift up slowly

        this.alpha = 1;
        this.life = Math.random() * 0.5 + 0.3; // fairly slow fade
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        this.alpha -= 0.01 / this.life;
        this.size *= 0.99; // shrink extremely slowly
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);

        // Radial gradient for soft edges
        let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

let mouse = { x: null, y: null }

// Very sparse generation so it doesn't distract from reading
window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;

    // Only spawn occasionally
    if (Math.random() > 0.85) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

// Touch support 
window.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    if (Math.random() > 0.8) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

// Occasional ambient dust
setInterval(() => {
    if (particles.length < 15 && Math.random() > 0.5) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
}, 500);

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
