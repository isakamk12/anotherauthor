const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// SF vs Fantasy Colors
const sfColors = [
    'rgba(0, 240, 255, 0.6)',   // Cyan
    'rgba(0, 68, 255, 0.5)'     // Neon Blue
];
const fantasyColors = [
    'rgba(157, 0, 255, 0.6)',   // Purple
    'rgba(255, 0, 85, 0.5)'     // Red
];

// Glitch colors
const glitchColors = [
    'rgba(255, 0, 0, 0.8)',
    'rgba(0, 255, 0, 0.8)',
    'rgba(0, 0, 255, 0.8)',
    'rgba(255, 255, 255, 0.9)'
];

// Meta world colors (Ink/Dust)
const metaColors = [
    'rgba(34, 34, 34, 0.3)',
    'rgba(80, 80, 80, 0.2)'
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
        this.size = Math.random() * 3 + 1;
        
        // Determine color based on world state and X position
        const isMeta = document.body.classList.contains('meta-active');
        
        if (isMeta) {
            // Meta World: Ink stains / dust
            this.color = metaColors[Math.floor(Math.random() * metaColors.length)];
            this.type = 'ink';
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = Math.random() * 1 + 0.5; // Drip down
            this.life = Math.random() * 0.3 + 0.1;
        } else {
            // SF vs Fantasy World
            // If near transition zone, glitch!
            const triggerPoint = document.getElementById('glitch-trigger').getBoundingClientRect().top;
            if (triggerPoint > 0 && triggerPoint < window.innerHeight) {
                this.color = glitchColors[Math.floor(Math.random() * glitchColors.length)];
                this.type = 'glitch';
                this.vx = (Math.random() - 0.5) * 20; // erratic horizontal
                this.vy = (Math.random() - 0.5) * 2;
                this.size = Math.random() * 5 + 2; // blocky
                this.life = Math.random() * 1.5 + 1.0; // short lived
            } else {
                // Determine left or right side
                if (this.x < width / 2) {
                    this.color = sfColors[Math.floor(Math.random() * sfColors.length)];
                    this.type = 'sf';
                } else {
                    this.color = fantasyColors[Math.floor(Math.random() * fantasyColors.length)];
                    this.type = 'fantasy';
                }
                this.vx = (Math.random() - 0.5) * 3;
                this.vy = (Math.random() - 0.5) * 3;
                this.life = Math.random() * 0.5 + 0.2;
            }
        }
        
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.type === 'glitch') {
            // Randomly jump around to simulate glitch
            if (Math.random() > 0.8) {
                this.x += (Math.random() - 0.5) * 30;
                this.y += (Math.random() - 0.5) * 10;
            }
        }
        
        this.alpha -= 0.02 / this.life;
        this.size *= 0.95;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        
        if (this.type === 'sf') {
            // Digital squares
            ctx.fillRect(this.x, this.y, this.size, this.size);
        } else if (this.type === 'fantasy') {
            // Magic sparks (circles)
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'glitch') {
            // Long horizontal rects
            ctx.fillRect(this.x, this.y, this.size * 4, this.size / 2);
        } else {
            // Ink dots
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

let mouse = { x: null, y: null }

window.addEventListener('mousemove', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
    
    for (let i = 0; i < 3; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

// Ambient particles (more intense near the glitch zone)
setInterval(() => {
    const triggerPoint = document.getElementById('glitch-trigger').getBoundingClientRect().top;
    let spawnRate = 0.9; // Normal
    if (triggerPoint > 0 && triggerPoint < window.innerHeight) {
        spawnRate = 0.2; // Spawn lots of glitches
    }
    
    if (Math.random() > spawnRate && particles.length < 150) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
    }
}, 50);

// Touch support 
window.addEventListener('touchmove', function(event) {
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
        if (particles[i].alpha <= 0 || particles[i].size < 0.1) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}

animate();
