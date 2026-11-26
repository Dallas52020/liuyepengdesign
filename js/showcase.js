/* ============================================================
   首页 · 单屏卡片墙
   ------------------------------------------------------------
   1) 页面锁死在 100dvh：body / .page 均 overflow:hidden，无页面级滚动条
   2) 卡片墙用 JS 依据视口宽高算出固定行列数（--cols / --rows 写入 CSS 变量），
      grid 轨道为 minmax(0,1fr) —— 槽位尺寸恒定，换卡不跳动、不重排
   3) 行列数必须先过「内容装得下」这一关：离屏量出该卡宽下池子里最高的卡需要多少
      像素高（needFor），ch / need < FIT_MIN 的组合直接淘汰；
      落地后再用 --fit 把文字块等比缩放到刚好装下 —— 卡片内部**不出现任何滚动条**
   4) 每隔数秒整批轮换卡片：槽位 DOM 节点保持不变，只替换内层内容，
      配合 opacity 过渡做平滑切换
   5) 卡片内的项目链接是真实 <a>，Tab / Enter / Ctrl+点击 全部保留
   ============================================================ */
(function () {
    var works = window.HOME_WORKS || window.SITE_WORKS || [];
    var catMeta = window.SITE_CAT || {};
    var wall = document.getElementById('wall');
    if (!wall) return;

    var MAX_TILT = 7;        // 最大倾斜角度（deg）
    var ROTATE_MS = 15000;   // 整批轮换间隔（进度条走满即切换，两者共用这一个值）
    var SWAP_MS = 230;       // 淡出时长（淡入由 CSS transition 接管）

    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var enableTilt = canHover && !reduceMotion;

    /* ---------- 移动端层叠式卡组（仅 ≤1000px 且高度够的竖屏启用） ----------
       桌面端完全不走这条分支：网格布局、一屏多卡、不滚动的行为保持不变。 */
    var DECK_MQ = window.matchMedia('(max-width: 1000px)');
    var DECK_MIN_H = 460;       // 横屏手机这类矮视口仍走原来的网格布局
    var DECK_SLOTS = 7;         // 窗口内卡片数：相对位置 -3 … +3
    var DECK_OVERLAP = 26;      // 相邻卡片互相遮挡的宽度 → 两侧各露出下一张的一角
    var DECK_ROTATE_MS = 7000;  // 移动端自动切换间隔
    var DECK_ANIM_MS = 460;     // 惯性结束后的吸附时长
    var cycleMs = ROTATE_MS;    // 当前模式的轮换周期（网格 / 卡组不同）

    var deck = {
        on: false, built: false, off: 0,
        slots: [], dots: [], countEl: null, stage: null,
        w: 0, h: 0, step: 1, c: 3, act: -1
    };
    var drag = null;
    var anim = { raf: null, from: 0, to: 0, t0: 0, dur: 0 };
    var suppressUntil = 0;     // 滑动结束后的一段时间内吃掉 click，避免误开详情（自动过期，不会残留）

    /* ---------- 工具 ---------- */
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function mod(n, m) { return ((n % m) + m) % m; }

    function statusBadge(status) {
        if (!status) return '';
        var label = status;
        var map = { '已建成': 'built', '建设中': 'building', '已暂停': 'paused' };
        return '<span class="status-badge status-' + (map[label] || 'unknown') + '">' + esc(label) + '</span>';
    }

    /* ---------- 排序：最近项目按内部日期降序在前，其余保持原序 ---------- */
    var ordered = works.slice().sort(function (a, b) {
        if (a.recent && b.recent) return (b.period || 0) - (a.period || 0);
        if (a.recent) return -1;
        if (b.recent) return 1;
        return 0;
    });

    /* ---------- 卡片池：13 个项目卡 + 首页原有板块卡（文案原样取自页面） ---------- */
    var pool = ordered.map(function (w) { return { type: 'work', w: w }; });
    Array.prototype.forEach.call(document.querySelectorAll('.wall-src'), function (el) {
        pool.push({
            type: 'info',
            kicker: el.getAttribute('data-kicker') || '',
            kickerEn: el.getAttribute('data-kicker-en') || '',
            html: el.innerHTML
        });
    });
    if (!pool.length) return;

    /* ---------- 卡片内容渲染 ---------- */
    /* 整张卡片就是一个 <a>：标题、封面、描述、标签都在链接内部，
       点任意区域都等价于原来的「查看详情」，路由与打开方式完全一致
       （左键 → 快速预览弹窗；Ctrl/⌘/⇧/中键 → 原生新标签页打开详情页）。 */
    function workHTML(w) {
        var c = catMeta[w.cat] || {};
        var tags = (w.tags || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
        var label = w.title + (c.label ? ' · ' + c.label : '') + ' — 查看项目详情';
        return '' +
            '<a class="wall-hit" href="project/' + esc(w.slug) + '.html" data-slug="' + esc(w.slug) + '"' +
            ' aria-haspopup="dialog" aria-label="' + esc(label) + '">' +
            '<span class="work-card__thumb">' +
            '<img data-ph data-label="' + esc(w.title) + ' 缩略图" src="images/projects/' + esc(w.slug) + '.jpg" alt="" loading="lazy" decoding="async">' +
            '</span>' +
            '<span class="wall-scroll"><span class="work-card__body">' +
            '<span class="work-card__cat">' + esc(c.label || '') + '</span>' +
            '<span class="work-card__title">' + esc(w.title) + '</span>' +
            '<span class="work-card__tags">' + tags + '</span>' +
            '</span></span>' +
            '</a>';
    }

    function infoHTML(it) {
        return '<div class="wall-hit"><div class="wall-scroll"><div class="wall-info">' +
            '<span class="wall-kicker">' + esc(it.kicker) + ' <em>' + esc(it.kickerEn) + '</em></span>' +
            it.html +
            '</div></div></div>';
    }

    function htmlFor(item) { return item.type === 'work' ? workHTML(item.w) : infoHTML(item); }

    /* ---------- 内容高度探针 ----------
       根因：卡片高度原先只按「宽度顺眼 + 尽量多放」挑，完全没把内容需要多高当约束，
       于是 16:9 缩略图吃掉一大半后，剩下的文字区装不下文字 → 卡片内部出现滚动条。
       这里离屏量出「某个卡宽下，池子里最高的那张卡需要多少像素高」，供布局做硬约束。 */
    var probeHost = null;
    var needCache = {};

    function ensureProbe() {
        if (probeHost) return probeHost;
        probeHost = document.createElement('div');
        probeHost.className = 'wall-probe';
        probeHost.setAttribute('aria-hidden', 'true');
        document.body.appendChild(probeHost);
        return probeHost;
    }

    /* 注意：缩略图是 16:9 固定高度、不参与缩放，只有文字会缩。
       所以不能拿「卡片总高 / 内容总高」当缩放比 —— 那会严重高估可用空间
       （例如卡高 244、图就占 186 时，文字区只剩 39px，而不是 244/352 ≈ 0.69）。
       这里分别记下每条内容的「文字自然高」和「固定开销（缩略图 + 描边 + 内边距）」，
       后面按 (ch - 固定开销) / 文字自然高 逐条算缩放比，取最吃紧的一条。 */
    function needFor(cw, nothumb) {
        var key = (nothumb ? 'n' : 't') + Math.round(cw);
        if (needCache[key]) return needCache[key];
        var host = ensureProbe();
        host.classList.toggle('nothumb', !!nothumb);
        host.style.width = Math.round(cw) + 'px';
        host.innerHTML = '';
        var items = [], maxTotal = 0;
        pool.forEach(function (item) {
            var el = document.createElement('div');
            el.className = 'work-card wall-card';
            el.innerHTML = '<span class="wall-card__paint"></span>';
            el.firstChild.innerHTML = htmlFor(item);
            host.appendChild(el);
            var hit = el.firstChild.firstChild;
            var total = hit ? hit.getBoundingClientRect().height : 0;
            var sc = hit ? hit.querySelector('.wall-scroll') : null;
            var text = sc && sc.firstElementChild
                ? sc.firstElementChild.getBoundingClientRect().height : total;
            if (total > maxTotal) maxTotal = total;
            items.push({ text: text, over: total - text });
            host.removeChild(el);
        });
        host.innerHTML = '';
        var rec = { max: Math.ceil(maxTotal) + 2, items: items };   // +2 = 卡片上下描边
        needCache[key] = rec;
        return rec;
    }

    /** 这个行列组合下，池子里最吃紧的那张卡能缩放到多少（>1 表示富余） */
    function fitFor(need, ch) {
        var fit = 1;
        need.items.forEach(function (it) {
            if (it.text <= 0) return;
            var f = (ch - it.over - 2) / it.text;
            if (f < fit) fit = f;
        });
        return fit;
    }

    /* ---------- 依据视口宽高挑选行列数 ---------- */
    function gapPx() {
        var g = parseFloat(window.getComputedStyle(wall).rowGap);
        return isNaN(g) ? 14 : g;
    }

    var FIT_MIN = 0.68;    // 文字最多等比缩到 75%，再小就宁可少放几张卡
    var FIT_FLOOR = 0.62;  // 缩放下限；触底还装不下就砍掉缩略图把高度全给文字

    function pickLayout(w, h, maxCells, nothumb) {
        var gap = gapPx();
        // 最小卡片尺寸随可用空间自适应：空间越小，允许的下限越低
        var minW = Math.max(148, Math.min(240, w / 4.4));
        var minH = Math.max(120, Math.min(195, h / 4.6));
        var best = null;
        for (var cols = 1; cols <= 6; cols++) {
            var cw = (w - gap * (cols - 1)) / cols;
            if (cw < minW) continue;
            var need = needFor(cw, nothumb);                  // 这个卡宽下内容需要的高度
            for (var rows = 1; rows <= 5; rows++) {
                if (cols * rows > maxCells) continue;     // 同一批内不出现重复卡片
                var ch = (h - gap * (rows - 1)) / rows;
                if (ch < minH) continue;

                var fit = fitFor(need, ch);                   // >1 = 有富余，<1 = 需要缩小
                if (fit < FIT_MIN) continue;                  // 装不下 → 淘汰这个行列组合

                var r = ch / cw, pen = 0;
                pen += Math.abs(cw / 300 - 1) * 0.7;                        // 卡片宽度贴近 300px 最舒服
                if (r < 0.68) pen += 0.8 * (0.68 - r) / 0.68 * 0.6;         // 太扁
                else if (r > 1.35) pen += 0.8 * (r - 1.35) / 1.35 * 0.6;    // 太瘦高
                if (ch < 230) pen += (230 - ch) / 230 * 1.6;                // 过矮会挤压内容，权重加大
                else if (ch > 345) pen += 0.5 * (ch - 345) / 345;
                if (fit < 1) pen += (1 - fit) * 1.2;                        // 需要缩放就扣分
                if (ch > need.max) pen += 0.45 * (ch / need.max - 1);       // 高度浪费：有富余不如多放一张
                pen -= cols * rows * 0.02;                                  // 同等条件下倾向多放几张

                if (!best || pen < best.pen) best = { cols: cols, rows: rows, pen: pen, fit: Math.min(1, fit) };
            }
        }
        return best;                                          // 没有任何组合装得下 → null
    }

    /* ---------- 让文字块刚好装下：--fit 等比缩放（不再需要任何滚动条） ---------- */
    function solveFit(sc, content, avail) {
        var fit = 1, h, next, k;
        for (k = 0; k < 4; k++) {
            sc.style.setProperty('--fit', fit.toFixed(4));
            h = content.getBoundingClientRect().height;     // 缩放后的视觉高度
            if (h <= avail + 0.5) break;
            next = fit * (avail / h);                       // 换行宽度会变宽，迭代收敛
            if (next >= fit - 0.002) break;
            fit = Math.max(FIT_FLOOR, next);
            if (fit <= FIT_FLOOR) break;
        }
        sc.style.setProperty('--fit', fit.toFixed(4));
        return fit;
    }

    function fitSlot(slot) {
        var sc = slot.querySelector('.wall-scroll');
        if (!sc) return 1;
        var content = sc.firstElementChild;
        if (!content) return 1;
        sc.style.setProperty('--fit', '1');
        var avail = sc.clientHeight;
        if (avail <= 0) return 0;          // 缩略图把高度吃光了 → 必须降级
        return solveFit(sc, content, avail);
    }

    /* 只升级、不降级：无图模式由 applyLayout 决定开或关，
       这里只在「实测仍然装不下」时补一刀（布局算过了但个别卡更吃紧）。 */
    function fitCards() {
        if (!slots.length) return;
        var i, minFit = 1;
        for (i = 0; i < slots.length; i++) minFit = Math.min(minFit, fitSlot(slots[i]));
        if (minFit <= FIT_FLOOR + 0.001 && !wall.classList.contains('wall--nothumb')) {
            wall.classList.add('wall--nothumb');
            for (i = 0; i < slots.length; i++) fitSlot(slots[i]);
        }
    }

    /* ============================================================
       移动端层叠式卡组
       ------------------------------------------------------------
       · 只渲染窗口内的 7 张卡（相对位置 -3 … +3），内容是按 round(off) 取的模，
         off 每跨过 .5 时各槽位整体挪一格 —— 由于「内容 + 位置」是成对整体平移的，
         视觉上完全连续，不会看到内容突然跳变。
       · 位移/缩放/透明度全部由 JS 每帧写入（CSS 不加 transform 过渡），
         所以吸附、跟手、惯性都在同一套逻辑里，不会出现 CSS 过渡与内容换位的错位。
       ============================================================ */
    function isDeckMode() {
        return DECK_MQ.matches && window.innerHeight >= DECK_MIN_H;
    }

    function deckBuild() {
        var n = Math.min(DECK_SLOTS, pool.length);
        var c = (n - 1) >> 1;
        deck.n = n;
        deck.c = c;
        var html = '<div class="deck-stage" data-stage>';
        for (var i = 0; i < n; i++) {
            html += '<div class="work-card wall-card deck-card" data-deck="' + i + '">' +
                '<span class="work-card__glow" aria-hidden="true"></span>' +
                '<span class="wall-card__paint" data-paint></span>' +
                '</div>';
        }
        html += '</div>';
        if (pool.length <= 18) {
            html += '<div class="deck-dots" aria-hidden="true">';
            for (var d = 0; d < pool.length; d++) html += '<i class="deck-dot"></i>';
            html += '</div>';
        } else {
            html += '<div class="deck-count" aria-hidden="true"><b>01</b> / ' + pool.length + '</div>';
        }
        wall.innerHTML = html;
        deck.stage = wall.querySelector('[data-stage]');
        deck.slots = Array.prototype.slice.call(wall.querySelectorAll('.deck-card'));
        deck.dots = Array.prototype.slice.call(wall.querySelectorAll('.deck-dot'));
        deck.countEl = wall.querySelector('.deck-count');
        deck.built = true;
    }

    /* 依据可用空间算卡片尺寸：宽度留出两侧露边，高度 = 16:9 图 + 文字区 */
    function deckMeasure() {
        if (!deck.stage) return;
        var r = deck.stage.getBoundingClientRect();
        if (r.width < 40) return;
        var stageH = Math.max(160, r.height);
        var maxW = Math.min(r.width - 88, 380);            // 两侧各留 44px 露出下一张
        if (maxW > r.width - 24) maxW = r.width - 24;
        if (maxW < 160) maxW = Math.max(140, r.width - 24);
        var w = maxW;
        // 高度不够时先把卡片收窄，让「16:9 缩略图 + 文字」仍然装得下；
        // 实在收不动了才整墙砍图把高度全留给文字（沿用网格模式同一条原则）
        var useThumb = stageH >= Math.round(w * 0.5625) + 132;
        if (!useThumb) {
            var fitW = Math.floor((stageH - 132) / 0.5625);
            if (fitW >= Math.min(190, maxW)) { w = fitW; useThumb = true; }
        }
        wall.classList.toggle('wall--nothumb', !useThumb);
        var h = useThumb ? Math.min(stageH, Math.round(w * 0.5625 + 152)) : Math.min(stageH, 240);
        if (h < 170) h = 170;
        deck.w = Math.round(w);
        deck.h = Math.round(h);
        deck.step = Math.max(60, deck.w - DECK_OVERLAP);
        wall.style.setProperty('--deck-w', deck.w + 'px');
        wall.style.setProperty('--deck-h', deck.h + 'px');
    }

    function deckPlace(slot, rel) {
        var a = Math.abs(rel);
        var x = rel * deck.step;
        var sc = 1 - Math.min(a, 3) * 0.05;                    // 越远越小
        var op = a <= 1 ? 1 - 0.10 * a : Math.max(0, 0.90 - 0.62 * (a - 1));
        if (op < 0.04) op = 0;
        slot.style.transform = 'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px, 0, 0) scale(' + sc.toFixed(4) + ')';
        slot.style.opacity = op.toFixed(3);
        slot.style.zIndex = String(100 - Math.round(a * 10));
        slot.style.visibility = a > 3.2 ? 'hidden' : 'visible';
        var center = a < 0.5;
        if (slot._center !== center) {
            slot._center = center;
            slot.setAttribute('data-center', center ? '1' : '0');
            var hit = slot.querySelector('.wall-hit');
            if (hit) {
                if (center) hit.removeAttribute('tabindex');
                else hit.setAttribute('tabindex', '-1');
            }
        }
    }

    function deckPaint() {
        if (!deck.slots.length) return;
        var base = Math.round(deck.off);
        var frac = deck.off - base;
        for (var j = 0; j < deck.slots.length; j++) {
            var slot = deck.slots[j];
            var r = j - deck.c;
            var idx = mod(base + r, pool.length);
            if (slot._idx !== idx) {
                slot._idx = idx;
                slot.querySelector('[data-paint]').innerHTML = htmlFor(pool[idx]);
                if (pool[idx].type === 'work') slot.setAttribute('data-slug', pool[idx].w.slug);
                else slot.removeAttribute('data-slug');
                if (window.bindPlaceholders) window.bindPlaceholders(slot);
                slot._center = null;
            }
            deckPlace(slot, r - frac);
        }
        var act = mod(base, pool.length);
        if (deck.act !== act) {
            deck.act = act;
            for (var d = 0; d < deck.dots.length; d++) {
                if (d === act) deck.dots[d].classList.add('on');
                else deck.dots[d].classList.remove('on');
            }
            if (deck.countEl) {
                deck.countEl.innerHTML = '<b>' + ('0' + (act + 1)).slice(-2) + '</b> / ' + pool.length;
            }
        }
    }

    function deckStopAnim() {
        if (anim.raf !== null) { window.cancelAnimationFrame(anim.raf); anim.raf = null; }
    }

    function animStep(now) {
        anim.raf = null;
        if (!anim.t0) anim.t0 = now;
        var p = anim.dur > 0 ? Math.min(1, (now - anim.t0) / anim.dur) : 1;
        var e = 1 - Math.pow(1 - p, 3);                        // easeOutCubic：像惯性一样减速停住
        deck.off = anim.from + (anim.to - anim.from) * e;
        if (p >= 1) { deck.off = anim.to; deckPaint(); return; }
        deckPaint();
        anim.raf = window.requestAnimationFrame(animStep);
    }

    /* 吸附到目标卡：整数位即「居中那一张」 */
    function deckTo(target) {
        if (!deck.on) return;
        target = Math.round(target);
        deckStopAnim();
        if (reduceMotion || target === deck.off) { deck.off = target; deckPaint(); return; }
        anim.from = deck.off;
        anim.to = target;
        anim.t0 = 0;
        anim.dur = DECK_ANIM_MS;
        anim.raf = window.requestAnimationFrame(animStep);
    }

    function deckAdvance(step) { deckTo(Math.round(deck.off) + step); }

    /* ---------- 槽位构建 ---------- */
    var slots = [];
    var state = { cols: 0, rows: 0, offset: 0 };

    function build(cols, rows) {
        var n = cols * rows, html = '', i;
        wall.style.setProperty('--cols', cols);
        wall.style.setProperty('--rows', rows);
        for (i = 0; i < n; i++) {
            html += '<div class="work-card wall-card" data-slot="' + i + '">' +
                '<span class="work-card__glow" aria-hidden="true"></span>' +
                '<span class="wall-card__paint" data-paint></span>' +
                '</div>';
        }
        wall.innerHTML = html;
        slots = Array.prototype.slice.call(wall.querySelectorAll('.wall-card'));
        paintAll();
    }

    function paintAll() {
        slots.forEach(function (slot, i) {
            var item = pool[(state.offset + i) % pool.length];
            slot.querySelector('[data-paint]').innerHTML = htmlFor(item);
            slot.setAttribute('data-type', item.type);
            slot._rect = null;
            if (item.type === 'work') slot.setAttribute('data-slug', item.w.slug);
            else slot.removeAttribute('data-slug');
            resetCard(slot);
        });
        if (window.bindPlaceholders) window.bindPlaceholders(wall);
        fitCards();               // 内容换了 → 重新算一遍缩放，保证永远装得下
    }

    function applyLayout() {
        var rect = wall.getBoundingClientRect();
        if (rect.width < 40 || rect.height < 40) return;

        /* 模式切换：网格 ⇄ 卡组。切换时整墙重建，两套 DOM 互不干扰。 */
        var wantDeck = isDeckMode();
        if (wantDeck !== deck.on) {
            deckStopAnim();
            drag = null;
            flags.drag = false;
            deck.on = wantDeck;
            deck.built = false;
            deck.slots = [];
            deck.dots = [];
            deck.countEl = null;
            deck.stage = null;
            deck.act = -1;
            slots = [];
            state.cols = 0;
            state.rows = 0;
            wall.className = wantDeck ? 'wall wall--deck' : 'wall';
            wall.style.removeProperty('--cols');
            wall.style.removeProperty('--rows');
            wall.style.removeProperty('--deck-w');
            wall.style.removeProperty('--deck-h');
            wall.innerHTML = '';
            cycleMs = wantDeck ? DECK_ROTATE_MS : ROTATE_MS;
            clock.elapsed = 0;
            if (wantDeck) deckBuild();
        }

        if (deck.on) {
            deckMeasure();
            deck.off = Math.round(deck.off);
            deckPaint();
            sync();
            return;
        }

        // 先按「保留 16:9 缩略图」排；极端矮视口怎么排都装不下时，
        // 整墙切换为无图模式再排一次 —— 宁可这一屏不显示图，也不让文字缩到看不清。
        var L = pickLayout(rect.width, rect.height, pool.length, false);
        var nothumb = false;
        if (!L) {
            nothumb = true;
            L = pickLayout(rect.width, rect.height, pool.length, true) ||
                { cols: 1, rows: 1, pen: 999, fit: 1 };
        }
        wall.classList.toggle('wall--nothumb', nothumb);

        if (L.cols === state.cols && L.rows === state.rows) { fitCards(); return; }  // 尺寸变了也要重算
        state.cols = L.cols;
        state.rows = L.rows;
        build(L.cols, L.rows);
        sync();
    }

    /* ---------- 整批轮换（槽位尺寸恒定，只换内层） ---------- */
    var swapping = false;      // 淡出中
    var swapTimer = null;      // 待落地的换批定时器
    var swapCancelled = false; // 淡出期间被暂停 → 放弃这批

    function rotate() {
        if (deck.on) {                       // 卡组：一次只推进一张，仍走同一套计时/暂停逻辑
            deckAdvance(1);
            clock.elapsed = 0;
            paintProgress();
            return;
        }
        if (!slots.length || swapping) return;
        var advance = function () {
            state.offset = (state.offset + slots.length) % pool.length;
        };
        if (reduceMotion) {
            advance(); paintAll();
            clock.elapsed = 0; paintProgress();
            return;
        }
        swapping = true;
        slots.forEach(function (s) { s.classList.add('swapping'); });
        swapTimer = window.setTimeout(function () {
            swapTimer = null;
            slots.forEach(function (s) { s.classList.remove('swapping'); });
            swapping = false;
            // 淡出途中被暂停：放弃这批，内容保持原样。
            // 否则用户会遇到「按了暂停，卡片还是换了一批」。
            if (swapCancelled) { swapCancelled = false; return; }
            advance();
            paintAll();
            clock.elapsed = 0;     // 新一批开始计时
            paintProgress();
        }, SWAP_MS);
    }

    /* ---------- 轮换开关 + 按钮进度填充 ----------
       原来用 setInterval 计时，拿不到「这一屏播到哪了」，所以换成 rAF 时钟：
       只在运行时累加 elapsed，暂停就冻在当前值，继续时接着走，切换那一批归零。
       进度只写 CSS 变量 --p，填充层用 transform: scaleX() 呈现，不触发重排。 */
    var clock = { running: false, elapsed: 0, last: 0, raf: null };
    var flags = { user: false, hover: false, focus: false, hidden: false, modal: false, drag: false };
    var toggleBtn = document.getElementById('wallToggle');
    var toggleTxt = toggleBtn && toggleBtn.querySelector('.screen-pause-txt');
    var fillEl = toggleBtn && toggleBtn.querySelector('.screen-pause-fill');

    function paintProgress() {
        var p = Math.min(1, clock.elapsed / cycleMs);
        if (fillEl) fillEl.style.setProperty('--p', p.toFixed(4));
        else if (toggleBtn) toggleBtn.style.setProperty('--p', p.toFixed(4));
    }

    function tick(now) {
        clock.raf = null;
        if (!clock.running) return;

        if (!clock.last) clock.last = now;                  // 恢复运行时丢弃停滞的时间差
        clock.elapsed += now - clock.last;
        clock.last = now;

        // 到点即换批；淡出那 230ms 里进度钉在 100%，
        // 等新一批真正画完由 rotate() 把 elapsed 归零、重新填充
        if (clock.elapsed >= cycleMs) {
            clock.elapsed = cycleMs;
            rotate();
        }
        paintProgress();
        scheduleTick();
    }

    function scheduleTick() {
        if (clock.raf === null) clock.raf = window.requestAnimationFrame(tick);
    }

    function stopClock() {
        clock.running = false;
        clock.last = 0;
        if (clock.raf !== null) { window.cancelAnimationFrame(clock.raf); clock.raf = null; }
    }

    function sync() {
        var paused = flags.user || flags.hover || flags.focus || flags.hidden || flags.modal || flags.drag;
        var hasCards = deck.on ? deck.slots.length > 0 : slots.length > 0;
        var shouldRun = !paused && hasCards;

        if (shouldRun && !clock.running) {
            clock.running = true;
            clock.last = 0;
            scheduleTick();
        } else if (!shouldRun && clock.running) {
            if (swapping && swapTimer) swapCancelled = true;  // 换批还没落地就暂停 → 放弃这批
            stopClock();
        }

        if (toggleBtn) {
            toggleBtn.setAttribute('aria-pressed', flags.user ? 'true' : 'false');
            toggleBtn.setAttribute('aria-label', flags.user ? '继续轮播' : '暂停轮播');
            toggleBtn.setAttribute('title', flags.user ? '继续轮播' : '暂停轮播');
        }
        if (toggleTxt) toggleTxt.textContent = flags.user ? '继续轮播' : '暂停轮播';
        paintProgress();
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () { flags.user = !flags.user; sync(); });
    }
    wall.addEventListener('pointerenter', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        flags.hover = true; sync();
    });
    wall.addEventListener('pointerleave', function () { flags.hover = false; sync(); });
    wall.addEventListener('focusin', function () { flags.focus = true; sync(); });
    wall.addEventListener('focusout', function (e) {
        if (wall.contains(e.relatedTarget)) return;
        flags.focus = false; sync();
    });
    document.addEventListener('visibilitychange', function () {
        flags.hidden = document.hidden; sync();
    });

    /* ---------- 指针跟随 3D 倾斜（rAF 节流，事件委托） ---------- */
    var rafId = null;
    var pending = null;
    var curCard = null;

    function flush() {
        rafId = null;
        if (!pending) return;
        var card = pending.card;
        var rect = card._rect || card.getBoundingClientRect();
        var px = (pending.x - rect.left) / rect.width;   // 0 → 1
        var py = (pending.y - rect.top) / rect.height;
        if (px < -0.2 || px > 1.2 || py < -0.2 || py > 1.2) return;
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        card.style.setProperty('--ry', ((px - 0.5) * 2 * MAX_TILT).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - py) * 2 * MAX_TILT).toFixed(2) + 'deg');
        card.style.setProperty('--lift', '1');
    }

    function resetCard(card) {
        if (!card) return;
        if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
        pending = null;
        card._rect = null;
        card.classList.remove('tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
        card.style.setProperty('--lift', '0');
    }

    function cardOf(node) {
        return node && node.closest ? node.closest('.wall-card') : null;
    }

    /* 悬停反馈用 JS 类驱动：夸克等浏览器对 CSS :hover 支持不稳（pointer 事件照常触发，
       但 :hover 伪类不触发），导致只有 JS 驱动的抬升生效、其余样式缺失。
       这里用 is-hover 类统一承载全部视觉反馈，保证跨浏览器一致；CSS :hover 仅作兜底。 */
    wall.addEventListener('pointerover', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        var card = cardOf(e.target);
        if (card) card.classList.add('is-hover');
    });
    wall.addEventListener('pointerout', function (e) {
        var card = cardOf(e.target);
        if (card && cardOf(e.relatedTarget) !== card) card.classList.remove('is-hover');
    });
    wall.addEventListener('pointerleave', function () {
        var lst = wall.querySelectorAll('.work-card.is-hover');
        Array.prototype.forEach.call(lst, function (c) { c.classList.remove('is-hover'); });
    });

    if (enableTilt) {
        wall.addEventListener('pointerover', function (e) {
            if (e.pointerType !== 'mouse') return;
            var card = cardOf(e.target);
            if (!card || card === curCard) return;
            if (curCard) resetCard(curCard);
            curCard = card;
            card._rect = card.getBoundingClientRect();
            card.classList.add('tilting');
        });
        wall.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse') return;
            var card = cardOf(e.target);
            if (!card) return;
            if (card !== curCard) {
                if (curCard) resetCard(curCard);
                curCard = card;
                card.classList.add('tilting');
            }
            if (!card._rect) card._rect = card.getBoundingClientRect();
            pending = { card: card, x: e.clientX, y: e.clientY };
            if (rafId === null) rafId = window.requestAnimationFrame(flush);
        });
        wall.addEventListener('pointerout', function (e) {
            var card = cardOf(e.target);
            if (!card) return;
            if (cardOf(e.relatedTarget) === card) return;   // 仍在卡内移动
            resetCard(card);
            if (card === curCard) curCard = null;
        });
        wall.addEventListener('pointerleave', function () {
            if (curCard) { resetCard(curCard); curCard = null; }
        });
    }

    /* ---------- 详情弹窗 ---------- */
    var modal = document.getElementById('projectModal');
    var panel = modal && modal.querySelector('.modal__panel');
    var backdrop = modal && modal.querySelector('.modal__backdrop');
    var lastFocused = null;
    var FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function byslug(slug) {
        for (var i = 0; i < works.length; i++) if (works[i].slug === slug) return works[i];
        return null;
    }

    function openModal(slug, trigger) {
        var w = byslug(slug);
        if (!w || !modal) { if (trigger) window.location.href = trigger.getAttribute('href'); return; }
        var c = catMeta[w.cat] || {};

        panel.innerHTML = '' +
            '<button type="button" class="modal__close" aria-label="关闭项目详情">✕</button>' +
            '<span class="modal__cat">' + esc(c.label || '') + '</span>' +
            '<h2 class="modal__title" id="modalTitle">' + esc(w.title) + '</h2>' +
            '<p class="modal__meta"><span>' + esc(w.loc || '—') + '</span>' + statusBadge(w.status) + '</p>' +
            '<figure class="modal__figure">' +
            '<img data-ph data-label="' + esc(w.title) + ' 主图" src="images/projects/' + esc(w.slug) + '.jpg" alt="">' +
            '</figure>' +
            '<p class="modal__tagline">' + esc(w.tagline || '') + '</p>' +
            '<p class="modal__desc">' + esc(w.desc || '项目详细介绍与案例资料正在整理中。') + '</p>' +
            (w.features && w.features.length
                ? '<h3 class="modal__h">核心功能</h3><ul class="modal__features">' +
                  w.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>'
                : '') +
            (w.tags && w.tags.length
                ? '<h3 class="modal__h">标签</h3><ul class="work-card__tags modal__tags">' +
                  w.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'
                : '') +
            '<div class="modal__links">' +
            '<a class="btn" href="project/' + esc(w.slug) + '.html">查看完整项目 →</a>' +
            '<a class="btn btn--ghost" href="category/' + esc(c.slug) + '.html">查看同类项目</a>' +
            '</div>';

        if (window.bindPlaceholders) window.bindPlaceholders(panel);

        lastFocused = document.activeElement;
        flags.modal = true;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        modal.setAttribute('aria-labelledby', 'modalTitle');
        window.requestAnimationFrame(function () {
            modal.classList.add('open');
            var btn = panel.querySelector('.modal__close');
            if (btn) btn.focus();
        });
        sync();
    }

    function closeModal() {
        if (!modal || modal.hidden) return;
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
        var done = function () { modal.hidden = true; };
        if (reduceMotion) done();
        else window.setTimeout(done, 320);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
        flags.modal = false;
        sync();
    }

    /* 打开：卡片任意区域（保留 Ctrl / ⌘ 新标签页行为）—— 事件委托，槽位可反复换内容 */
    var INNER_CTRL = 'a[href], button, input, select, textarea, label, [data-card-stop]';

    function cardHit(node) {
        return node && node.closest ? node.closest('.wall-hit[data-slug]') : null;
    }

    /* 卡片内若还有收藏 / 分享之类的自带控件，返回它自己（信息卡里的普通链接不算）。
       只在「控件在项目卡内部、且不是卡片链接本身」时才成立。 */
    function innerControl(e) {
        if (!e.target || !e.target.closest) return null;
        var hit = cardHit(e.target);
        if (!hit) return null;
        var ctrl = e.target.closest(INNER_CTRL);
        return ctrl && ctrl !== hit ? ctrl : null;
    }

    /* 捕获阶段：取消外层链接的默认激活。
       只 return 是不够的——浏览器对祖先 <a> 的激活是事件的默认行为，
       不 preventDefault 的话，就算卡内控件自己 stopPropagation，整卡还是会跳。 */
    wall.addEventListener('click', function (e) {
        if (innerControl(e)) e.preventDefault();
    }, true);

    wall.addEventListener('click', function (e) {
        if (innerControl(e)) { e.stopPropagation(); return; }   // 交给控件自己处理
        var hit = cardHit(e.target);
        if (!hit) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        resetCard(cardOf(hit));
        openModal(hit.getAttribute('data-slug'), hit);
    });
    // 空格键：锚点默认不响应空格，补上（Enter 由 <a href> 原生触发上面的 click）
    wall.addEventListener('keydown', function (e) {
        if (e.key !== ' ' && e.key !== 'Spacebar') return;
        if (innerControl(e)) return;
        var hit = cardHit(e.target);
        if (!hit) return;
        e.preventDefault();
        openModal(hit.getAttribute('data-slug'), hit);
    });

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target.classList && e.target.classList.contains('modal__backdrop')) closeModal();
            if (e.target.closest && e.target.closest('.modal__close')) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (modal.hidden) return;
            if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
            if (e.key !== 'Tab') return;
            // 焦点陷阱
            var items = Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE))
                .filter(function (el) { return el.offsetParent !== null; });
            if (!items.length) return;
            var first = items[0], last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });
    }

    /* ============================================================
       卡组手势：手指左右滑动 + 惯性吸附 + 点两侧露出的卡片直接切过去
       ------------------------------------------------------------
       · 用 Pointer Events（iOS Safari 13+ / 主流安卓内核均支持），
         配合 CSS 的 touch-action: pan-y 只接管横向手势，纵向仍交还浏览器。
       · 松手时按最近若干毫秒的速度做惯性投影，再多走几张也照常吸附到居中卡。
       · 一次真正的滑动结束后会吃掉紧随其后的 click，避免误开详情弹窗。
       ============================================================ */
    function nowStamp(e) {
        return (e && typeof e.timeStamp === 'number' && e.timeStamp > 0) ? e.timeStamp : Date.now();
    }

    function deckReleaseCapture(id) {
        if (!deck.stage) return;
        try { deck.stage.releasePointerCapture(id); } catch (err) { /* 已释放 */ }
    }

    function onDeckDown(e) {
        if (!deck.on || !deck.stage) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        deckStopAnim();
        drag = {
            id: e.pointerId, x0: e.clientX, y0: e.clientY,
            off0: deck.off, lastX: e.clientX, lastT: nowStamp(e),
            vx: 0, axis: 0, moved: false
        };
        try { deck.stage.setPointerCapture(e.pointerId); } catch (err) { /* 不支持就退回冒泡 */ }
    }

    function onDeckMove(e) {
        if (!deck.on || !drag || e.pointerId !== drag.id) return;
        var dx = e.clientX - drag.x0;
        var dy = e.clientY - drag.y0;
        if (!drag.axis) {                                   // 先判方向：竖向手势直接放手，不抢
            if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
            if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
            drag.axis = 1;
            flags.drag = true; sync();
        }
        var t = nowStamp(e);
        var dt = t - drag.lastT;
        if (dt > 4) {                                       // 速度：px / ms
            drag.vx = (e.clientX - drag.lastX) / dt;
            drag.lastX = e.clientX;
            drag.lastT = t;
        }
        drag.moved = true;
        deck.off = drag.off0 - dx / deck.step;              // 跟手：位移 1:1
        deckPaint();
        if (e.cancelable) e.preventDefault();
    }

    function onDeckUp(e) {
        if (!deck.on || !drag || e.pointerId !== drag.id) return;
        var d = drag;
        drag = null;
        deckReleaseCapture(d.id);
        if (flags.drag) { flags.drag = false; sync(); }
        if (e.cancelable && d.moved) e.preventDefault();
        if (!d.axis) { deckTap(e.clientX); return; }        // 没有位移 → 视作点按
        if (d.moved) suppressUntil = Date.now() + 600;
        var projected = deck.off - (d.vx * 120) / deck.step; // 惯性投影
        var target = Math.round(projected);
        var lim = Math.round(d.off0);
        if (target > lim + 3) target = lim + 3;
        if (target < lim - 3) target = lim - 3;
        deckTo(target);
    }

    function onDeckCancel(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag;
        drag = null;
        deckReleaseCapture(d.id);
        if (flags.drag) { flags.drag = false; sync(); }
        deckTo(Math.round(d.off0));
    }

    /* 点一下两侧露出的卡片 → 直接切到那张；落在中间卡上则交给原有逻辑开详情 */
    function deckTap(clientX) {
        if (!deck.stage || clientX == null) return;
        var r = deck.stage.getBoundingClientRect();
        var dxc = clientX - (r.left + r.width / 2);
        if (Math.abs(dxc) <= deck.w / 2) return;
        deckTo(Math.round(deck.off) + (dxc > 0 ? 1 : -1));
    }

    wall.addEventListener('pointerdown', onDeckDown);
    wall.addEventListener('pointermove', onDeckMove);
    wall.addEventListener('pointerup', onDeckUp);
    wall.addEventListener('pointercancel', onDeckCancel);
    /* 捕获阶段吃掉「滑动刚结束」那一下 click，避免误触发详情弹窗；
       用过期时间而不是布尔标记：即使浏览器没补发 click，也不会把之后的正常点击一并吃掉。 */
    wall.addEventListener('click', function (e) {
        if (!deck.on || Date.now() > suppressUntil) return;
        suppressUntil = 0;
        e.preventDefault();
        e.stopPropagation();
    }, true);
    /* 键盘：左右方向键切换（Enter 打开详情仍由 <a> 原生触发） */
    wall.addEventListener('keydown', function (e) {
        if (!deck.on) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); deckAdvance(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); deckAdvance(-1); }
    });

    /* ---------- 尺寸变化：重算行列数（槽位数量变化时才重建） ---------- */
    var resizeTimer = null;
    window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        needCache = {};                       // 卡宽变了，缓存作废
        resizeTimer = window.setTimeout(applyLayout, 140);
    });
    window.addEventListener('orientationchange', function () {
        needCache = {};
        window.setTimeout(applyLayout, 220);
    });
    if (typeof ResizeObserver === 'function') {
        var ro = new ResizeObserver(function () { applyLayout(); });
        ro.observe(wall.parentNode || wall);
    }

    /* ---------- 启动 ---------- */
    function boot() { applyLayout(); sync(); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    window.addEventListener('load', function () { window.setTimeout(applyLayout, 60); });
})();
