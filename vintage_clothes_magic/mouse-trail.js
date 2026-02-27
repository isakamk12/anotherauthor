document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';

    let width, height;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Mouse track
    const mouse = { x: -100, y: -100 };
    const particles = [];

    // Magic dust color (Gold/Vintage)
    const particleColor = '194, 163, 88';

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        addParticle(mouse.x, mouse.y);
    });

    window.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
        addParticle(mouse.x, mouse.y);
    });

    window.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
        addParticle(mouse.x, mouse.y);
    });

    function addParticle(x, y) {
        if (Math.random() > 0.6) return; // sparser particles for vintage vibe
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 2 + 1,
            life: 1,
            speedX: (Math.random() - 0.5) * 1.0,
            speedY: (Math.random() - 0.5) * 1.0 - 0.8 // float upwards slightly
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= 0.02;
            p.size *= 0.98;

            if (p.life <= 0) {
                particles.splice(i, 1);
                i--;
                continue;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor}, ${p.life})`;
            ctx.fill();

            ctx.shadowBlur = 12;
            ctx.shadowColor = `rgba(${particleColor}, ${p.life})`;
        }

        requestAnimationFrame(animate);
    }
    animate();
});
