const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');
const wrapper = document.querySelector('.parallax-wrapper');

let width, height;
let particles = [];

// Colors for the pit (Pale Blue pulsing light & Cider Blue lollipop sparks)
const colors = [
    'rgba(77, 157, 224, 0.6)',  // Pulse Blue
    'rgba(135, 206, 235, 0.8)', // Cider Blue
    'rgba(255, 255, 255, 0.4)'  // Ghostly White
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
    constructor(x, y, isAmbient = false) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // Float upwards like dust or embers in a pit
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = Math.random() * -2 - 0.5;

        this.life = Math.random() * 0.8 + 0.2;
        this.alpha = isAmbient ? 0 : 1; // Ambient particles fade in
        this.isAmbient = isAmbient;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.isAmbient && this.alpha < 1 && this.life > 0.5) {
            this.alpha += 0.05; // Fade in initially
        } else {
            this.alpha -= 0.01 / this.life; // Fade out
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

        // Drawing a soft glowing circle
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add a slight glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();

        ctx.restore();
    }
}

let mouse = { x: null, y: null };

// Listen to mouse movement on the wrapper (since it controls scrolling context)
wrapper.addEventListener('mousemove', function (event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    // Only spawn particles if we are scrolled down deep enough (into the pit)
    const scrollPercent = wrapper.scrollTop / (wrapper.scrollHeight - wrapper.clientHeight);

    if (scrollPercent > 0.4 && Math.random() > 0.5) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

// Touch support 
wrapper.addEventListener('touchmove', function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;

    const scrollPercent = wrapper.scrollTop / (wrapper.scrollHeight - wrapper.clientHeight);
    if (scrollPercent > 0.4 && Math.random() > 0.4) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

// Ambient particles rising from the bottom
setInterval(() => {
    // Only spawn ambient dust if user is looking at the bottom half
    const scrollPercent = wrapper.scrollTop / (wrapper.scrollHeight - wrapper.clientHeight);
    if (scrollPercent > 0.6 && particles.length < 100) {
        particles.push(new Particle(Math.random() * width, height + 10, true));
    }
}, 100);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].alpha <= 0 && (!particles[i].isAmbient || particles[i].life < 0.5)) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();
