const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// System Data Colors (Blue, Yellow) to contrast with the fantasy background
const colors = [
    'rgba(10, 88, 202, 0.6)',  // System Blue
    'rgba(255, 193, 7, 0.6)',  // Warning Yellow
    'rgba(220, 53, 69, 0.4)'   // Error Red
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
        this.size = Math.random() * 4 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // Falling data fragments
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = Math.random() * 3 + 1; // Falling down like digital rain

        this.alpha = 1;
        this.life = Math.random() * 0.5 + 0.3;

        // Random binary or hex string for the particle shape
        this.isText = Math.random() > 0.5;
        this.text = Math.random() > 0.5 ? '0' : '1';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        this.alpha -= 0.02 / this.life;
        // Keep size roughly same for text readability
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;

        if (this.isText) {
            ctx.font = `${Math.floor(this.size * 3)}px monospace`;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            // Error blocks
            ctx.fillRect(this.x, this.y, this.size * 2, this.size * 2);
        }

        ctx.restore();
    }
}

let mouse = { x: null, y: null }

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;

    // Spawn digital rain from mouse
    if (Math.random() > 0.6) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

// Ambient data rain
setInterval(() => {
    if (particles.length < 80) {
        particles.push(new Particle(Math.random() * width, -10)); // Start from top
    }
}, 100);

// Touch support 
window.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    if (Math.random() > 0.4) {
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
