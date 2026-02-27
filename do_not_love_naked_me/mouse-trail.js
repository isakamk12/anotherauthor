const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Design specific colors
const colors = [
    'rgba(142, 209, 230, 0.4)', // Accent Blue Hawaii
    'rgba(163, 201, 223, 0.3)', // Accent Blue Star
    'rgba(0, 0, 0, 0.05)',      // Very light shadow ink
    'rgba(255, 255, 255, 0.8)'  // Soft white
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
        this.size = Math.random() * 4 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 1;
        this.life = Math.random() * 0.5 + 0.5; // lifespan
        // Particles drift upwards slowly (like snow or dust in light)
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 1) * 1.5 - 0.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.015 / this.life;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// Mouse interaction
let mouse = {
    x: null,
    y: null
}

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
    // Add particles on move to create a soft trail
    if (Math.random() > 0.5) { // Throttle particle creation slightly for elegance
        for (let i = 0; i < 2; i++) {
            particles.push(new Particle(mouse.x, mouse.y));
        }
    }
});

// Create particles periodically even without mouse movement (ambient dust/snow effect)
setInterval(() => {
    if (particles.length < 80) { // Limit ambient particles
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
}, 200);

// Touch support 
window.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    for (let i = 0; i < 3; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Remove dead particles
        if (particles[i].alpha <= 0 || particles[i].y < -20) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();
