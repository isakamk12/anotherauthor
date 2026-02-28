const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

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

        // Determine type based on scroll position / current section
        const scrollY = window.scrollY;
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = scrollY / (totalHeight || 1);

        // Start cyber, transition to nature
        if (scrollPercent < 0.3) {
            // Cyber / Space
            this.type = 'cyber';
            this.colors = ['#00E5FF', '#FF2A2A', '#FFFFFF'];
            this.size = Math.random() * 3 + 1;
            this.vx = (Math.random() - 0.5) * 5; // Fast horizontal
            this.vy = (Math.random() - 0.5) * 1;
            this.life = Math.random() * 0.5 + 0.2;
            this.shape = 'rect';
        } else if (scrollPercent < 0.7) {
            // Transition / Earth Atmosphere
            this.type = 'atmos';
            this.colors = ['#4A90E2', '#FFFFFF', '#A8E6CF'];
            this.size = Math.random() * 4 + 2;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.life = Math.random() * 0.8 + 0.4;
            this.shape = 'circle';
        } else {
            // Nature / Earth Surface
            this.type = 'nature';
            this.colors = ['#50C878', '#FFD700', '#A8E6CF']; // Green, Gold, Light Green
            this.size = Math.random() * 6 + 3;
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = Math.random() * -2 - 1; // Floating upwards
            this.life = Math.random() * 1.5 + 0.5;
            this.shape = 'leaf';
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.1;
        }

        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.type === 'nature') {
            this.x += Math.sin(this.life * 10) * 0.5; // Fluttering
            this.angle += this.spin;
        }

        this.alpha -= 0.01 / this.life;
        if (this.shape === 'rect') {
            this.size *= 0.95;
        } else {
            this.size *= 0.98;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;

        if (this.shape === 'rect') {
            ctx.fillRect(this.x, this.y, this.size * 3, this.size);
        } else if (this.shape === 'leaf') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            // Draw a simple leaf shape
            ctx.moveTo(0, -this.size);
            ctx.quadraticCurveTo(this.size, 0, 0, this.size);
            ctx.quadraticCurveTo(-this.size, 0, 0, -this.size);
            ctx.fill();
        } else {
            // Circle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

let mouse = { x: null, y: null }

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;

    if (Math.random() > 0.5) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

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

        if (particles[i].alpha <= 0 || particles[i].size < 0.1) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();
