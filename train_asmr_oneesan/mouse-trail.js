const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Warm sunset/amber colors
const colors = [
    'rgba(216, 139, 74, 0.4)',  // Amber
    'rgba(232, 175, 181, 0.3)', // Soft Pink
    'rgba(255, 230, 200, 0.5)', // Pale Yellow/Orange
    'rgba(255, 255, 255, 0.6)'  // Soft White
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
        // Larger, softer particles for ASMR healing feel
        this.size = Math.random() * 6 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 0; // Starts invisible and fades in
        this.maxAlpha = Math.random() * 0.8 + 0.2;
        this.life = Math.random() * 0.8 + 0.5; // Longer, slower life
        this.fadeInRate = 0.02;
        this.fadingIn = true;

        // Very slow drift, like dust motes in evening sunlight
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5 - 0.2; // Slight upward bias
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.fadingIn) {
            this.alpha += this.fadeInRate;
            if (this.alpha >= this.maxAlpha) {
                this.fadingIn = false;
            }
        } else {
            this.alpha -= 0.01 / this.life;
        }

        this.size *= 0.99; // Shrink very slowly
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);

        // Create a soft glowing gradient for each particle
        let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// Mouse interaction - very gentle spawn
let mouse = { x: null, y: null }

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;

    // Spawn fewer particles for a cleaner, quieter aesthetic
    if (Math.random() > 0.8) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

// Ambient dust motes floating around the screen
setInterval(() => {
    if (particles.length < 60) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
}, 300);

// Touch support 
window.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    if (Math.random() > 0.5) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Remove dead particles
        if (particles[i].alpha <= 0 && !particles[i].fadingIn) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();
