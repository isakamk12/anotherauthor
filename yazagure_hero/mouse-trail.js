const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: 0, y: 0 };
let isFirstMove = true;

const COLORS = {
    magic: ['#d4af37', '#fff7d6', '#f1c40f'], // Gold
    smoke: ['#8a8a8a', '#555555', '#2c3e50']  // Smoke
};

function init() {
    resize();
    render();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Create particles based on section
    const currentSection = getCurrentSection();
    spawnParticles(mouse.x, mouse.y, currentSection);
});

function getCurrentSection() {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) return 'magic';
    if (scrollY < window.innerHeight * 2.5) return 'mixed';
    return 'smoke';
}

function spawnParticles(x, y, type) {
    let count = type === 'mixed' ? 4 : 2;
    for (let i = 0; i < count; i++) {
        let pType = type;
        if (type === 'mixed') pType = Math.random() > 0.5 ? 'magic' : 'smoke';
        particles.push(new Particle(x, y, pType));
    }
}

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = Math.random() * (type === 'magic' ? 3 : 15) + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2 - (type === 'smoke' ? 1 : 0);
        this.color = COLORS[type][Math.floor(Math.random() * COLORS[type].length)];
        this.alpha = 1;
        this.decay = Math.random() * 0.01 + 0.005;
        this.angle = Math.random() * Math.PI * 2;
        this.angleV = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        this.angle += this.angleV;
        
        if (this.type === 'smoke') {
            this.size += 0.2;
            this.speedX += Math.sin(this.angle) * 0.1;
        } else {
            this.size *= 0.98;
        }
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        if (this.type === 'magic') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Smoky clouds
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function render() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    
    requestAnimationFrame(render);
}

init();
