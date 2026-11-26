/* ============================================================
   主页动态背景
   - 冷色系、低饱和度 + 高明暗对比：流动光斑更柔和自然，形状与光影更清晰
   - 多个低饱和冷色光斑（深岩蓝到浅雾）拉开明暗值域（低分辨率 Canvas + 较轻模糊）
   - 随鼠标实时变化：光斑整体随指针偏移，并叠加一团跟随指针的亮光
   - 桌面端（≥1001px 且精确指针）启用动画；移动端隐藏；
     prefers-reduced-motion 时降级为单帧静态柔光，不运动
   - 性能：内部按 0.5x 渲染 + 上限约 45fps + 标签隐藏时暂停
   ============================================================ */
(function () {
    'use strict';
    var canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isDesktop = window.matchMedia('(min-width: 1001px) and (hover: hover)').matches;

    // 画布本身保持透明：底色由 CSS 渐变承担（html 上的冷色对角渐变，肉眼永远可见的"背景图"），
    // 我们只在上面画低饱和度的暖中性流动光斑与鼠标亮光（配色取自品牌色板），柔和而不刺眼。
    var palette = [
        'rgba(16, 16, 16, 0.06)',      // 黑（最淡，压暗部）
        'rgba(238, 237, 233, 0.55)',   // 白（最亮，提亮部）
        'rgba(16, 16, 16, 0.03)',      // 黑（更淡）
        'rgba(255, 255, 255, 0.42)',   // 纯白提亮
        'rgba(16, 16, 16, 0.08)',      // 黑（中间调）
        'rgba(232, 231, 226, 0.50)',   // 白 −3%
        'rgba(16, 16, 16, 0.04)'       // 黑（最淡）
    ];

    var DPR = 1, W = 0, H = 0;
    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 1.5);
        W = Math.max(2, Math.floor(window.innerWidth * 0.5));
        H = Math.max(2, Math.floor(window.innerHeight * 0.5));
        canvas.width = Math.floor(W * DPR);
        canvas.height = Math.floor(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    // 每个光斑：基础位置、漂移振幅/速度/相位、半径、受鼠标影响程度、颜色
    function makeBlobs() {
        var n = 7, arr = [];
        for (var i = 0; i < n; i++) {
            arr.push({
                bx: Math.random(), by: Math.random(),
                ax: 0.22 + Math.random() * 0.22,   // 漂移幅度更大 → 流动更明显
                ay: 0.22 + Math.random() * 0.22,
                sx: 0.14 + Math.random() * 0.26,   // 速度
                sy: 0.14 + Math.random() * 0.26,
                px: Math.random() * Math.PI * 2,
                py: Math.random() * Math.PI * 2,
                sr: 0.30 + Math.random() * 0.50,
                r: 0.50 + Math.random() * 0.45,
                mx: 0.16 + Math.random() * 0.20,   // 鼠标影响
                my: 0.16 + Math.random() * 0.20,
                color: palette[i % palette.length]
            });
        }
        return arr;
    }
    var blobs = makeBlobs();

    var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    function onMove(e) {
        var t = (e.touches && e.touches[0]) || e;
        mouse.tx = t.clientX / window.innerWidth;
        mouse.ty = t.clientY / window.innerHeight;
    }
    window.addEventListener('pointermove', onMove, { passive: true });

    function transparentEdge(color) {
        return color.replace(/[\d.]+\)$/, '0)');   // 收边透明，避免硬边
    }

    function drawBlob(b, t) {
        var cx = (b.bx + Math.sin(t * b.sx + b.px) * b.ax + (mouse.x - 0.5) * b.mx) * W;
        var cy = (b.by + Math.cos(t * b.sy + b.py) * b.ay + (mouse.y - 0.5) * b.my) * H;
        var rad = b.r * Math.min(W, H) * (0.82 + 0.18 * Math.sin(t * b.sr + b.px));
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, b.color);
        g.addColorStop(1, transparentEdge(b.color));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
    }

    function frame(tSec) {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < blobs.length; i++) drawBlob(blobs[i], tSec);
        // 跟随指针的亮光：清晰但不刺眼，对比中提亮焦点
        var lx = mouse.x * W, ly = mouse.y * H;
        var lr = Math.min(W, H) * 0.72;
        var lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        lg.addColorStop(0, 'rgba(255, 255, 255, 0.40)');
        lg.addColorStop(1, 'rgba(238, 237, 233, 0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.fill();
    }

    function paintStatic() {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < blobs.length; i++) {
            var b = blobs[i];
            var cx = (b.bx + Math.sin(b.px) * b.ax) * W;
            var cy = (b.by + Math.cos(b.py) * b.ay) * H;
            var rad = b.r * Math.min(W, H);
            var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
            g.addColorStop(0, b.color);
            g.addColorStop(1, transparentEdge(b.color));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    var raf = 0, last = 0;
    function loop(now) {
        if (document.hidden) return;                 // 标签页隐藏时暂停
        if (now - last < 22) { raf = requestAnimationFrame(loop); return; }  // 上限 ~45fps
        last = now;
        mouse.x += (mouse.tx - mouse.x) * 0.07;      // 指针平滑跟随
        mouse.y += (mouse.ty - mouse.y) * 0.07;
        frame(now / 1000);
        raf = requestAnimationFrame(loop);
    }

    function start() {
        resize();
        if (!isDesktop) { canvas.style.display = 'none'; return; }   // 移动端：隐藏，保持原底色
        if (reduceMotion) { canvas.style.display = 'block'; paintStatic(); return; }
        raf = requestAnimationFrame(loop);
    }

    var rt = 0;
    window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
            resize();
            if (!isDesktop || reduceMotion) paintStatic();
        }, 150);
    });
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden && isDesktop && !reduceMotion) { last = 0; raf = requestAnimationFrame(loop); }
    });

    start();
})();
