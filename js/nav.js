/* ============================================================
   全站导航：左侧边栏（原顶栏 + 页脚整合）
   ------------------------------------------------------------
   · 桌面：悬停 / 聚焦分类 → 右侧飞出面板列出该分类项目
   · 窄屏：侧边栏收为抽屉，分类用 ＋ 就地展开
   · BASE 由 <body data-base="../"> 决定，首页为空
   ============================================================ */
(function () {
    var BASE = document.body.getAttribute('data-base') || '';
    var works = window.SITE_WORKS || [];
    var catMeta = window.SITE_CAT || {};

    var sidebar = document.getElementById('sidebar');
    var fly = document.getElementById('sbFlyout');
    var flyInner = document.getElementById('flyInner');
    var menuBtn = document.getElementById('sbMenuBtn');
    var backdrop = document.getElementById('sbBackdrop');
    var isNarrow = function () { return window.matchMedia('(max-width: 1000px)').matches; };

    function statusBadge(status) {
        if (!status) return '';
        var label = status;
        var map = { '已建成': 'built', '建设中': 'building', '已暂停': 'paused' };
        return '<span class="status-badge status-' + (map[label] || 'unknown') + '">' + label + '</span>';
    }
    function itemsOf(catKey) {
        return works.filter(function (w) { return w.cat === catKey; });
    }

    /* ---------- 分类子项（窄屏抽屉内展开） ---------- */
    Array.prototype.forEach.call(document.querySelectorAll('.sb-cat'), function (li) {
        var key = li.getAttribute('data-cat');
        var cat = catMeta[key];
        var ul = li.querySelector('.sb-sub');
        if (!cat || !ul) return;

        ul.innerHTML = itemsOf(key).map(function (w) {
            return '<li><a href="' + BASE + 'project/' + w.slug + '.html">' +
                '<span>' + w.title + '</span>' + statusBadge(w.status) + '</a></li>';
        }).join('') + '<li><a class="sb-sub-all" href="' + BASE + 'category/' + cat.slug + '.html">' +
            '<span>查看全部 ' + cat.label + '</span><span aria-hidden="true">→</span></a></li>';

        var btn = li.querySelector('.sb-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                var open = li.classList.toggle('open');
                btn.setAttribute('aria-expanded', String(open));
            });
        }
    });

    /* ---------- 桌面：分类飞出面板 ---------- */
    var closeTimer = null;

    function renderFly(catKey) {
        var c = catMeta[catKey];
        if (!flyInner || !c) return;
        var list = itemsOf(catKey);
        flyInner.innerHTML =
            '<div class="sb-flyout-head">' +
            '<span class="sb-flyout-no">' + c.no + '</span>' +
            '<span class="sb-flyout-title">' + c.title + '</span>' +
            '<a class="sb-flyout-all" href="' + BASE + 'category/' + c.slug + '.html">全部 →</a>' +
            '</div>' + (list.length ? list.map(function (w) {
                return '<a class="sb-flyout-item" href="' + BASE + 'project/' + w.slug + '.html">' +
                    '<span class="t">' + w.title + '</span>' +
                    '<span class="b">' + statusBadge(w.status) + '</span>' +
                    '<span class="m">' + (w.loc || '') + '</span></a>';
            }).join('') : '<p class="sb-flyout-empty">暂无项目</p>');
    }

    function openFly(catKey, anchor) {
        if (!fly || isNarrow()) return;
        clearTimeout(closeTimer);
        renderFly(catKey);
        var r = anchor.getBoundingClientRect();
        var left = sidebar ? sidebar.getBoundingClientRect().right + 14 : r.right + 14;
        fly.style.left = left + 'px';
        fly.style.top = '0px';                       // 先放置，再按高度修正
        var h = fly.offsetHeight || 240;
        var top = Math.max(14, Math.min(r.top - 10, window.innerHeight - h - 14));
        fly.style.top = top + 'px';
        fly.classList.add('open');
        Array.prototype.forEach.call(document.querySelectorAll('.sb-cat'), function (li) {
            li.classList.toggle('fly-active', li.getAttribute('data-cat') === catKey);
        });
    }
    function closeFly() {
        if (!fly) return;
        fly.classList.remove('open');
        Array.prototype.forEach.call(document.querySelectorAll('.sb-cat'), function (li) {
            li.classList.remove('fly-active');
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('.sb-cat'), function (li) {
        var key = li.getAttribute('data-cat');
        var item = li.querySelector('.sb-item');
        if (!item) return;
        item.addEventListener('mouseenter', function () { clearTimeout(closeTimer); openFly(key, item); });
        item.addEventListener('focusin', function () { openFly(key, item); });
        item.addEventListener('mouseleave', function () { closeTimer = setTimeout(closeFly, 180); });
    });
    if (fly) {
        fly.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
        fly.addEventListener('mouseleave', function () { closeTimer = setTimeout(closeFly, 180); });
    }
    if (sidebar) sidebar.addEventListener('mouseleave', function () { closeTimer = setTimeout(closeFly, 180); });
    window.addEventListener('scroll', function () { if (fly && fly.classList.contains('open')) closeFly(); }, { passive: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeFly(); });

    /* ---------- 窄屏抽屉 ---------- */
    function setDrawer(open) {
        if (!sidebar) return;
        sidebar.classList.toggle('open', open);
        if (menuBtn) {
            menuBtn.classList.toggle('open', open);
            menuBtn.setAttribute('aria-expanded', String(open));
            menuBtn.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
        }
        if (backdrop) backdrop.classList.toggle('open', open);
        document.body.classList.toggle('sb-open', open);
    }
    if (menuBtn) menuBtn.addEventListener('click', function () {
        setDrawer(!(sidebar && sidebar.classList.contains('open')));
    });
    if (backdrop) backdrop.addEventListener('click', function () { setDrawer(false); });
    if (sidebar) {
        sidebar.addEventListener('click', function (e) {
            if (isNarrow() && e.target.closest('a')) setDrawer(false);
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) setDrawer(false);
    });
    window.addEventListener('resize', function () {
        if (!isNarrow()) { setDrawer(false); closeFly(); }
    });

    /* ---------- 当前页面高亮 ----------
       高亮键优先取 body 的 data-cat，其次取 data-nav（首页 / 关于 / 档案等
       非分类页用它标识）；侧栏各项也同时匹配 data-cat 与 data-nav，
       因此「关于」页（body data-nav="about"）能正确点亮对应的导航项。 */
    var activeKey = document.body.getAttribute('data-cat') ||
        document.body.getAttribute('data-nav') || '';
    if (!activeKey) {
        var m = location.pathname.match(/category\/([A-Za-z0-9-]+)\.html/);
        if (m) {
            Object.keys(catMeta).forEach(function (k) { if (catMeta[k].slug === m[1]) activeKey = k; });
        }
    }
    Array.prototype.forEach.call(document.querySelectorAll('.sb-item'), function (item) {
        var parent = item.closest ? item.closest('.sb-cat') : null;
        var key = item.getAttribute('data-cat') || item.getAttribute('data-nav') ||
            (parent ? parent.getAttribute('data-cat') : '');
        var isHome = document.body.classList.contains('homepage');
        if (key && key === activeKey) item.classList.add('is-active');
        else if (!activeKey && isHome && item.getAttribute('data-nav') === 'home') item.classList.add('is-active');
    });


    /* ---------- 桌面端：展开 / 收起两档 ----------
       收起后只留图标（78px），状态记在 localStorage，刷新与跳页都保持。 */
    var COL_KEY = 'lpf.sb.collapsed';
    var colBtn = document.getElementById('sbCollapse');
    var tip = null;
    var tipTimer = null;

    function collapsedNow() { return document.documentElement.classList.contains('sb-collapsed'); }

    function setCollapsed(on, persist) {
        document.documentElement.classList.toggle('sb-collapsed', !!on);
        if (colBtn) {
            var label = on ? '展开导航栏' : '收起导航栏';
            colBtn.setAttribute('aria-expanded', String(!on));
            colBtn.setAttribute('aria-label', label);
            colBtn.setAttribute('title', label);
        }
        if (on) { closeFly(); hideTip(); }
        if (persist) { try { localStorage.setItem(COL_KEY, on ? '1' : '0'); } catch (e) {} }
    }

    function tipEl() {
        if (!tip) {
            tip = document.createElement('div');
            tip.id = 'sbTip';
            tip.setAttribute('role', 'presentation');
            document.body.appendChild(tip);
        }
        return tip;
    }
    function hideTip() {
        clearTimeout(tipTimer);
        if (tip) tip.classList.remove('on');
    }
    function showTip(item) {
        var label = item.querySelector('.sb-link-lb');
        var text = label ? label.textContent : (item.getAttribute('aria-label') || '');
        text = text.replace(/\s+/g, ' ').trim();
        if (!text) return;
        var t = tipEl();
        t.textContent = text;
        t.classList.add('on');
        var r = item.getBoundingClientRect();
        t.style.left = (r.right + 14) + 'px';
        t.style.top = Math.max(8, r.top + r.height / 2 - t.offsetHeight / 2) + 'px';
    }

    /* 恢复上次状态（首次访问默认展开），窄屏一律展开 */
    var savedCol = null;
    try { savedCol = localStorage.getItem(COL_KEY); } catch (e) {}
    if (!document.documentElement.classList.contains('sb-collapsed')) setCollapsed(savedCol === '1' && !isNarrow(), false);

    if (colBtn) {
        colBtn.addEventListener('click', function () {
            setCollapsed(!collapsedNow(), true);
            hideTip();
        });
        colBtn.addEventListener('mouseenter', function () {
            if (!collapsedNow() || isNarrow()) return;
            clearTimeout(tipTimer);
            showTip(colBtn);
        });
        colBtn.addEventListener('mouseleave', function () {
            tipTimer = setTimeout(hideTip, 60);
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('.sb-item'), function (item) {
        item.addEventListener('mouseenter', function () {
            if (!collapsedNow() || isNarrow()) return;
            clearTimeout(tipTimer);
            showTip(item);
        });
        item.addEventListener('mouseleave', function () {
            if (!collapsedNow()) return;
            tipTimer = setTimeout(hideTip, 60);
        });
    });
    window.addEventListener('scroll', hideTip, { passive: true });
    document.addEventListener('click', hideTip);

    /* ---------- 回到顶部 / 年份 ---------- */
    var backTop = document.getElementById('backTop');
    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (isNarrow()) setDrawer(false);
        });
    }
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
