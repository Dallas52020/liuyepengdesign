/* ============================================================
   子页（分类页 / 项目详情页）运行时
   侧边栏由 js/nav.js 统一驱动，这里只处理页面自身的内容
   ============================================================ */
(function () {
    /* ---------- 图片占位 ---------- */
    function bindPlaceholders(scope) {
        (scope || document).querySelectorAll('img[data-ph]').forEach(function (img) {
            if (img.dataset.phBound === '1') return;
            img.dataset.phBound = '1';
            img.addEventListener('error', function () {
                var ph = document.createElement('div');
                ph.className = 'ph';
                ph.textContent = img.getAttribute('data-label') || '图片位置';
                if (img.parentNode) img.parentNode.replaceChild(ph, img);
            });
            if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
        });
    }
    bindPlaceholders();

    /* ---------- 入场：内容块轻微上浮 ---------- */
    var targets = document.querySelectorAll('.sub-main > *');
    if (targets.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        targets.forEach(function (el) { el.classList.add('reveal'); });
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        targets.forEach(function (el) { io.observe(el); });
    }
})();
