const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Colors
const tokiColors = [
    'rgba(139, 0, 0, 0.8)',  // Blood Red
    'rgba(178, 34, 34, 0.6)' // Firebrick
];
const asahiColors = [
    'rgba(245, 245, 240, 0.5)', // Kinari White
    'rgba(74, 107, 138, 0.4)'   // Asahi Blue
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

        // Split logic based on screen position (roughly left/right with some diagonal overlap)
        // For simplicity hitting the center just randomly assigns one
        let slope = (height / width); // diagonal slope
        let isRightTop = y < (height - (x * slope)); // Approx Top-Right (Asahi side)

        // Adjust for responsive changes where split is horizontal
        if (width <= 1024) {
            isRightTop = y > height / 2; // Asahi is bottom half now
        }

        if (isRightTop) {
            // Asahi side (Mist)
            this.color = asahiColors[Math.floor(Math.random() * asahiColors.length)];
            this.type = 'mist';
            this.size = Math.random() * 20 + 10; // Large blurry circles
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.life = Math.random() * 0.8 + 0.4; // Slow fade
        } else {
            // Tokimune side (Sazanka Petals / Blood)
            this.color = tokiColors[Math.floor(Math.random() * tokiColors.length)];
            this.type = 'petal';
            this.size = Math.random() * 5 + 3;
            // Aggressive splatter
            const speed = Math.random() * 5 + 2;
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed + 2; // Gravity pulling blood/petals down
            this.life = Math.random() * 0.5 + 0.2; // Fast fade
            this.spin = (Math.random() - 0.5) * 0.5;
            this.angle = angle;
        }

        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.type === 'petal') {
            this.vy += 0.2; // Gravity
            this.angle += this.spin;
            this.vx *= 0.95; // Friction
        } else {
            // Mist just drifts
            this.size *= 1.01; // expands slightly
        }

        this.alpha -= 0.02 / this.life;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);

        if (this.type === 'mist') {
            // Radial gradient for mist
            let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Sharp petals / blood droplets
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.quadraticCurveTo(this.size, 0, 0, this.size);
            ctx.quadraticCurveTo(-this.size, 0, 0, -this.size);
            ctx.fill();
        }

        ctx.restore();
    }
}

let mouse = { x: null, y: null };
let lastPushed = 0;

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;

    // Throttle to avoid too many mist particles overlapping heavily
    let now = Date.now();
    if (now - lastPushed > 20) {
        lastPushed = now;
        particles.push(new Particle(mouse.x, mouse.y));
        if (Math.random() > 0.5) {
            particles.push(new Particle(mouse.x, mouse.y));
        }
    }
});

// Ambient particles
setInterval(() => {
    if (particles.length < 50) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
}, 300);

// Touch support 
window.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    particles.push(new Particle(mouse.x, mouse.y));
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
