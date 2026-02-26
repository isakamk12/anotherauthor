(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'mouse-trail-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let points = [];
    const maxPoints = 25; // slightly longer tail

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        points.push({
            x: e.clientX,
            y: e.clientY,
            age: 0
        });
    });

    window.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        points.push({
            x: touch.clientX,
            y: touch.clientY,
            age: 0
        });
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        points.push({
            x: touch.clientX,
            y: touch.clientY,
            age: 0
        });
    }, { passive: true });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                const p = points[i];

                const size = (i / points.length) * 6;
                ctx.lineWidth = size;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Holy Gold / Feather-like Trail
                ctx.shadowBlur = 20;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                const opacity = (i / points.length) * (1 - points[i].age / maxPoints);
                ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`;

                ctx.lineTo(p.x, p.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
            }
        }

        for (let i = points.length - 1; i >= 0; i--) {
            points[i].age++;
            if (points[i].age > maxPoints) {
                points.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
