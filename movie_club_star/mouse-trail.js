const canvas = document.getElementById('mouse-trail-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: 0, y: 0 };
let isMoving = false;
let moveTimer;

// Colors
const flashColor = 'rgba(255, 255, 255, 0.8)';
const sparkColor = 'rgba(255, 215, 0, 0.6)'; // Subtle gold/orange for sunset reflection

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor(x, y, type = 'flash') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        if (type === 'flash') {
            // Camera flash sparks (sharp, fast)
            this.size = Math.random() * 2 + 1;
            this.color = flashColor;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2; // Fast burst
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            this.life = Math.random() * 0.3 + 0.1; // Very short life
            this.decay = 0.05;
        } else {
            // Ambient dust/lens flare bits
            this.size = Math.random() * 4 + 2;
            this.color = sparkColor;
            
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = (Math.random() - 0.5) * 1;
            
            this.life = Math.random() * 1 + 0.5; // Longer life
            this.decay = 0.01;
        }
        
        this.alpha = 1;
        this.shape = Math.random() > 0.5 ? 'circle' : 'cross';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.type === 'flash') {
            this.vx *= 0.9; // Fast friction
            this.vy *= 0.9;
        }
        
        this.alpha -= this.decay / this.life;
        this.size *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        
        if (this.shape === 'cross' && this.type === 'flash') {
            // Draw a subtle lens flare cross
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.size * 2, this.y - 0.5, this.size * 4, 1);
            ctx.fillRect(this.x - 0.5, this.y - this.size * 2, 1, this.size * 4);
        } else {
            // Draw circle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Mouse movement creates small bursts
window.addEventListener('mousemove', function(event){
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    isMoving = true;
    
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => { isMoving = false; }, 100);
    
    // Normal movement trail
    if (Math.random() > 0.6) { 
        particles.push(new Particle(mouse.x, mouse.y, 'dust'));
    }
});

// Click creates a camera flash burst
window.addEventListener('mousedown', function(event) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(event.clientX, event.clientY, 'flash'));
    }
});

// Touch support 
window.addEventListener('touchmove', function(event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    if (Math.random() > 0.5) {
        particles.push(new Particle(mouse.x, mouse.y, 'dust'));
    }
});
window.addEventListener('touchstart', function(event) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(event.touches[0].clientX, event.touches[0].clientY, 'flash'));
    }
});

// Ambient particles mimicking distant camera flashes
setInterval(() => {
    if(particles.length < 40 && Math.random() > 0.7) { 
        // Random distant flash burst
        const px = Math.random() * width;
        const py = Math.random() * height;
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(px, py, 'flash'));
        }
    }
}, 500);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    // Draw subtle viewfinder crosshair on mouse when moving
    if (isMoving) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Inner brackets
        const s = 10;
        ctx.moveTo(mouse.x - s, mouse.y - s/2); ctx.lineTo(mouse.x - s, mouse.y - s); ctx.lineTo(mouse.x - s/2, mouse.y - s);
        ctx.moveTo(mouse.x + s, mouse.y - s/2); ctx.lineTo(mouse.x + s, mouse.y - s); ctx.lineTo(mouse.x + s/2, mouse.y - s);
        ctx.moveTo(mouse.x - s, mouse.y + s/2); ctx.lineTo(mouse.x - s, mouse.y + s); ctx.lineTo(mouse.x - s/2, mouse.y + s);
        ctx.moveTo(mouse.x + s, mouse.y + s/2); ctx.lineTo(mouse.x + s, mouse.y + s); ctx.lineTo(mouse.x + s/2, mouse.y + s);
        ctx.stroke();
        ctx.restore();
    }

    // Update and draw particles
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
