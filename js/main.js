/* ============================================================
   首页运行时数据源
   ------------------------------------------------------------
   works[] 是 js/data.js 的浏览器端副本（首页无构建步骤），
   两边必须逐项一致：title / loc / status / cat / recent / period
   / tagline / tags / features 全部同步。
   slug 直接取自数据，首页用它拼 project/<slug>.html 链接。
   ============================================================ */

const works = [
    {
        slug: "shougang-urban-renewal", title: "首钢中关村科幻创业产业中心改造", loc: null, status: null,
        cat: "城市更新与建筑", recent: true, period: 20230303, start: 202303, end: null,
        tagline: "用轻介入的钢构步道，串起高炉与料仓的工业记忆。",
        tags: ["城市更新", "工业遗存", "钢结构", "公共动线"],
        features: ["保留高炉、料仓与管廊的原始结构秩序，最小干预", "1.2 公里可漫游钢构步道，串联分散的工业片段", "分时段植入公共活动场地，让遗址回到城市日常"],
        desc: "以首钢工业遗存为基底的城市更新研究。保留高炉、料仓与管廊的原始结构秩序，用轻介入的钢构步道把分散的工业片段串成一条可漫游的公共动线，让重工业遗址重新成为城市日常的一部分。"
    },
    {
        slug: "graduation-project", title: "向沙漠学习", loc: null, status: null,
        cat: "城市更新与建筑", recent: true, period: 20240501, start: 202405, end: null,
        tagline: "城市边缘地带的公共性重建，用模块回应高差与水位。",
        tags: ["毕业设计", "模块化", "公共空间", "场地研究"],
        features: ["以模块化单元回应场地高差与季节性水位变化", "单元可拆分重组，适配不同时段的使用密度", "探讨建筑在不确定条件下如何保持开放与可变"],
        desc: "毕业设计选题聚焦城市边缘地带的公共性重建。以模块化单元回应场地高差与季节性水位变化，探讨建筑在不确定条件下如何保持开放与可变。"
    },
    {
        slug: "arcteryx-retail", title: "始祖鸟商业展示设计", loc: null, status: null,
        cat: "商业展示与美陈", recent: true, period: 20220926, start: 202209, end: null,
        tagline: "以岩层与等高线为母题，48 小时完成整店陈列迭代。",
        tags: ["零售空间", "展陈道具", "铝型材系统", "快速迭代"],
        features: ["岩层与等高线作为形式母题，贯穿展台与墙面", "全节点干式连接的可拆装铝型材道具系统", "48 小时内完成整店陈列迭代，支持快闪复用"],
        desc: "为高端户外品牌设计的城市旗舰展示空间。以岩层与等高线为形式母题，用可拆装的铝型材系统搭建展台，全部节点干式连接，可在 48 小时内完成整店陈列迭代。"
    },
    {
        slug: "mixed-scene-study", title: "复合功能场景研究-场景城市视域下滨河公共空间柔性边界的构建机制研究", loc: "廊坊燕郊", status: null,
        cat: "商业展示与美陈", recent: true, period: 20251028, start: 202510, end: null,
        tagline: "零售、展览、休憩压进同一场域，测试人流的自然分区。",
        tags: ["场景研究", "美陈", "人流组织", "模块库"],
        features: ["把零售、展览、休憩三种行为压缩进同一场域", "用高度可控的道具系统测试人流的自然分区", "沉淀一套可复用的场景模块库与布场手册"],
        desc: "一次关于商业美陈与公共空间边界的研究型实践。把零售、展览、休憩三种行为压进同一个场域，用高度可控的道具系统测试人流的自然分区，形成一套可复用的场景模块库。"
    },
    {
        slug: "robot-brand-identity", title: "银河通用机器人会议室设计", loc: "北京", status: "已建成",
        cat: "品牌与视觉", recent: true, period: 20260727, start: 202607, end: null,
        tagline: "从运动轨迹提炼图形，建立可随产品生长的标识规则。",
        tags: ["品牌识别", "视觉系统", "平面物料", "界面规范"],
        features: ["从机器人运动轨迹中提炼基础图形与动态标识", "建立可随产品迭代生长的标识使用规则", "覆盖线上物料、展会平面与产品界面三个层级"],
        desc: "面向消费级机器人品牌的平面与视觉系统设计。从运动轨迹中提炼基础图形，建立一套可随产品迭代生长的标识规则，覆盖线上物料、展会平面与产品界面三个层级。"
    },
    {
        slug: "ai-workshop", title: "傀儡暗码-闽南提线木偶沉浸剧场", loc: null, status: null,
        cat: "研究与工作坊", recent: true, period: 20250507, start: 202505, end: null,
        tagline: "用生成式工具跑通调研、草图、表达的完整推演。",
        tags: ["工作坊", "生成式设计", "方法论", "公开手册"],
        features: ["围绕调研、草图与表达三个环节设计工作流", "参与者用生成式工具完成一轮完整概念推演", "过程整理成公开的方法手册，可复用于团队"],
        desc: "以生成式工具为方法的设计工作坊。围绕空间设计流程中的调研、草图与表达三个环节，组织参与者用 AI 工具完成一轮完整的概念推演，并把过程整理成公开的方法手册。"
    },
    {
        slug: "future-ruins", title: "未来遗迹之旅", loc: "敦煌鸣沙山", status: null,
        cat: "其他作品", recent: false, period: 20241223, start: 202412, end: null,
        tagline: "以遗迹为线索的虚构旅行叙事，讨论建造与荒废。",
        tags: ["叙事", "概念设计", "装置"],
        features: ["以遗迹为线索构建虚构旅行路线", "讨论长时间尺度下的建造与荒废", "以装置与图文混合的方式呈现"],
        desc: "以遗迹为线索的虚构旅行叙事，探讨时间尺度下的建造与荒废。"
    },
    {
        slug: "emei-mountain", title: "峨眉山溪谷听泉·巨海智慧书院建筑设计", loc: "四川·峨眉山", status: "已建成",
        cat: "其他作品", recent: false, period: 20251010, start: 202510, end: null,
        tagline: "山地旅游节点的轻介入改造，关注路径与气候边界。",
        tags: ["景观改造", "路径体验", "气候边界"],
        features: ["山地节点的轻介入改造策略", "以路径体验组织观景节奏", "回应雨雾与温差的气候边界"],
        desc: "山地旅游节点的轻介入改造研究，关注路径体验与气候边界。"
    },
    {
        slug: "qilong-mountain", title: "骑龙山度假小镇美食山建筑设计", loc: "重庆·彭水", status: "建设中",
        cat: "其他作品", recent: false, period: 20250715, start: 202507, end: null,
        tagline: "夯土与预制构件混合的乡村公共空间实验。",
        tags: ["在地材料", "夯土", "预制构件"],
        features: ["夯土与预制构件混合建造体系", "就地取材，降低运输与施工成本", "公共空间兼顾村民日常与季节活动"],
        desc: "乡村公共空间的在地材料实验，以夯土与预制构件混合建造。"
    },
    {
        slug: "metro-station", title: "深圳15号线地铁站空间设计", loc: "广东·深圳", status: null,
        cat: "其他作品", recent: false, period: 20240620, start: 202406, end: null,
        tagline: "换乘路径可读性优化的导视与人流研究。",
        tags: ["导视系统", "交通建筑", "人流组织"],
        features: ["换乘路径可读性的系统梳理", "导视分级与信息密度控制", "高峰时段人流模拟与验证"],
        desc: "轨道交通站点的导视与人流组织优化，强调换乘路径的可读性。"
    },
    {
        slug: "miyake", title: "三宅一生品牌叙事展示", loc: null, status: null,
        cat: "其他作品", recent: false, period: 20230901, start: 202309, end: null,
        tagline: "织物与光相互作用的小型商业空间材质研究。",
        tags: ["材质研究", "商业空间", "照明"],
        features: ["以织物作为主要空间界面材料", "研究自然光与人工光的层次过渡", "小尺度空间的材质样板墙测试"],
        desc: "小型商业空间的材质研究，以织物与光的相互作用为主要命题。"
    },
    {
        slug: "taian-park", title: "泰园熙地——泰安潍百集团商业园区建筑设计", loc: "山东·泰安", status: "已建成",
        cat: "其他作品", recent: false, period: 20241124, start: 202411, end: null,
        tagline: "产业园区公共区域的景观与标识整合。",
        tags: ["景观", "标识系统", "园区"],
        features: ["公共区域景观与慢行系统整合", "统一标识系统与夜间照明", "分期实施路径与造价控制"],
        desc: "产业园区公共区域的景观与标识整合设计。"
    },
    {
        slug: "mojiang-temple", title: "儒风滇南——云南墨江文庙展示设计", loc: "云南·墨江", status: "已建成",
        cat: "其他作品", recent: false, period: 20230519, start: 202305, end: null,
        tagline: "文庙建筑群修缮与环境梳理，兼顾礼制与当代使用。",
        tags: ["文保修缮", "礼制空间", "环境整理"],
        features: ["建筑群本体修缮与结构加固", "恢复并重新解读礼制空间序列", "环境梳理兼顾当代使用与日常维护"],
        desc: "文庙建筑群的修缮与环境梳理，兼顾礼制秩序与当代使用需求。"
    },
    {
        slug: "kaifeng-iqiyi-park", title: "河南开封爱奇艺乐园设计", loc: "河南·开封", status: "已建成",
        cat: "城市更新与建筑", recent: false, period: 20260401, start: 202604, end: null,
        tagline: "以内容 IP 为线索的室内乐园动线与场景设计。",
        tags: ["室内乐园", "IP 场景", "动线设计", "主题空间"],
        features: ["以爱奇艺内容 IP 为母题构建沉浸式场景", "分龄动线组织，兼顾家庭与年轻客群", "模块化场景可随内容档期快速更换"],
        desc: "面向内容平台的室内乐园设计。以爱奇艺 IP 为母题构建沉浸式场景，通过分龄动线组织兼顾不同客群，并以模块化场景支持内容档期的快速更新。"
    },
    {
        slug: "cafa-visual", title: "中央美术学院视觉设计", loc: "北京", status: null,
        cat: "品牌与视觉", recent: false, period: 20260314, start: 202603, end: null,
        tagline: "围绕展览主视觉的系统化平面与导视延展。",
        tags: ["主视觉", "展览平面", "导视系统", "版式"],
        features: ["建立可延展的展览主视觉系统", "覆盖海报、画册与现场导视的平面规范", "在统一调性下保留各单元的识别差异"],
        desc: "围绕院校展览的视觉系统设计。建立可延展的主视觉，覆盖海报、画册与现场导视，在统一调性下保留各单元的识别差异。"
    },
    {
        slug: "erbao-village-committee", title: "二堡茶话-二堡村委会改造", loc: "天津", status: "已建成",
        cat: "商业展示与美陈", recent: false, period: 20260121, start: 202601, end: null,
        tagline: "用茶话场景激活村委会的公共与商业边界。",
        tags: ["乡村公共", "商业空间", "艺术策划", "在地运营"],
        features: ["以「茶话」为线索重组村委会公共空间", "公共活动与轻商业共置于同一界面", "引入在地运营，延长空间的使用时段"],
        desc: "乡村村委会的改造与运营策划。以「茶话」场景重组公共空间，让公共活动与轻商业共享同一界面，并通过在地运营延长使用时段。"
    },
    {
        slug: "shijiazhuang-beiguo-lights", title: "石家庄北国商城跨年灯饰设计方案", loc: "河北·石家庄", status: "已建成",
        cat: "商业展示与美陈", recent: false, period: 20251130, start: 202511, end: null,
        tagline: "以节庆灯饰重塑商场中庭的跨年氛围。",
        tags: ["节庆美陈", "灯光", "商业空间", "中庭"],
        features: ["以跨年节点组织中庭灯饰装置", "灯光与既有结构结合，控制改造成本", "动线引导客流自然汇聚至核心展区"],
        desc: "商场跨年节点的灯饰与美陈设计。以节庆灯光重塑中庭氛围，与既有结构结合控制成本，并引导客流汇聚至核心展区。"
    },
    {
        slug: "figure03-robot-visual", title: "Figure03机器人品牌视觉", loc: null, status: null,
        cat: "品牌与视觉", recent: false, period: 20251106, start: 202511, end: null,
        tagline: "为人形机器人品牌建立可生长的图形与色彩规则。",
        tags: ["品牌识别", "机器人", "图形系统", "色彩规范"],
        features: ["从人形机器人形态提炼基础图形", "建立可随产品线生长的色彩与版式规则", "覆盖线上与展会两层物料"],
        desc: "面向人形机器人品牌的视觉系统设计。从机器人形态提炼基础图形，建立可随产品线生长的色彩与版式规则，覆盖线上与展会物料。"
    },
    {
        slug: "fanshe-apartment", title: "梵舍公寓改造项目", loc: "北京", status: "已建成",
        cat: "城市更新与建筑", recent: false, period: 20251001, start: 202510, end: null,
        tagline: "小户型公寓的集约化空间与材质改造。",
        tags: ["公寓改造", "小户型", "集约空间", "材质"],
        features: ["以可变家具实现小户型的空间复用", "统一材质语言压缩视觉噪音", "改造兼顾出租效率与居住品质"],
        desc: "存量公寓的室内改造。以可变家具实现小户型空间复用，用统一材质语言压缩视觉噪音，兼顾出租效率与居住品质。"
    },
    {
        slug: "zhuzhou-beidou-expo", title: "株洲北斗会展设计", loc: "湖南·株洲", status: "已建成",
        cat: "商业展示与美陈", recent: false, period: 20250615, start: 202506, end: null,
        tagline: "以导航科技为叙事线索的会展空间设计。",
        tags: ["会展", "科技叙事", "展区规划", "互动"],
        features: ["以北斗导航为叙事主线组织展区", "用光线与路径暗示「定位」的概念", "设置可交互的体验节点增强记忆点"],
        desc: "围绕导航科技的会展空间设计。以北斗为叙事主线组织展区，用光线与路径暗示「定位」概念，并设置可交互体验节点增强记忆。"
    },
    {
        slug: "qianshou-guanyin-immersive", title: "千手观音沉浸式展演空间设计", loc: null, status: null,
        cat: "商业展示与美陈", recent: false, period: 20250601, start: 202506, end: null,
        tagline: "以多层环绕叙事构建的沉浸式展演空间。",
        tags: ["沉浸展演", "叙事空间", "多媒体", "宗教艺术"],
        features: ["以「千手」意象组织环绕式观演关系", "多媒体与实体装置混合增强沉浸感", "观众动线即叙事展开的线索"],
        desc: "宗教艺术题材的沉浸式展演空间。以「千手」意象组织环绕式观演关系，用多媒体与实体装置混合增强沉浸感，观众动线即叙事线索。"
    },
    {
        slug: "langyuan-youyou-shop", title: "朗园呦呦商店改造", loc: "北京", status: null,
        cat: "商业展示与美陈", recent: false, period: 20250428, start: 202504, end: null,
        tagline: "园区旧铺的轻改造与零售场景更新。",
        tags: ["旧改", "零售", "园区商业", "轻改造"],
        features: ["保留原有结构，仅做界面与标识更新", "以「呦呦」为记忆点重塑店面性格", "轻量改造控制工期与造价"],
        desc: "园区存量商铺的轻改造。保留原有结构，仅更新界面与标识，以「呦呦」为记忆点重塑店面性格，控制工期与造价。"
    },
    {
        slug: "modular-homestay", title: "模块化民宿项目", loc: null, status: null,
        cat: "研究与工作坊", recent: false, period: 20240927, start: 202409, end: null,
        tagline: "以标准化模块探索民宿的快速搭建与复制。",
        tags: ["模块化", "民宿", "可复制", "建造研究"],
        features: ["用标准化模块单元组织空间", "研究工厂预制与现场拼装的平衡", "形成可复制到不同场地的民宿原型"],
        desc: "民宿建造的模块化研究。用标准化模块单元组织空间，研究工厂预制与现场拼装的平衡，形成可复制到不同场地的民宿原型。"
    },
    {
        slug: "ziyue-mansion-interior", title: "紫悦首府室内设计", loc: null, status: "已建成",
        cat: "城市更新与建筑", recent: false, period: 20240701, start: 202407, end: null,
        tagline: "住宅精装的标准化与定制化平衡。",
        tags: ["住宅精装", "标准化", "定制化", "软硬装"],
        features: ["建立可批量交付的精装标准", "在标准中预留可定制的接口", "软硬装一体化控制落地效果"],
        desc: "住宅项目的精装室内设计。建立可批量交付的精装标准，在标准中预留定制化接口，软硬装一体化控制落地效果。"
    },
    {
        slug: "shouyuan-micro-museum", title: "根深叶茂·首院风华——北京首开首院企业文化微展馆", loc: "北京", status: "已建成",
        cat: "商业展示与美陈", recent: false, period: 20240524, start: 202405, end: null,
        tagline: "以企业史为线索的微型文化展陈设计。",
        tags: ["企业文化", "微展馆", "展陈叙事", "历史"],
        features: ["以企业发展为叙事主线组织展线", "用微尺度空间承载密集的史料信息", "实物、图文与多媒体分层呈现"],
        desc: "企业文化的微型展馆设计。以企业发展史为叙事主线组织展线，在微尺度空间内分层呈现史料，实物、图文与多媒体结合。"
    },
    {
        slug: "weilai-zhixing-robot-expo", title: "未来之形机器人策展设计", loc: null, status: null,
        cat: "商业展示与美陈", recent: false, period: 20240905, start: 202409, end: null,
        tagline: "以机器人本体为叙事媒介的展览策划与空间设计。",
        tags: ["机器人", "策展", "空间叙事", "展陈设计"],
        features: ["以机器人形态与运动作为展览叙事主线", "策展动线与展陈道具一体化设计", "兼顾科普表达与品牌调性的现场呈现"],
        desc: "围绕机器人主题的策展与空间设计。以机器人本体形态与运动作为叙事主线，将策展动线与展陈道具一体化考虑，在现场兼顾科普表达与品牌调性。"
    },
];


/* 首页展示区（js/showcase.js）读取这份数据 */
window.HOME_WORKS = works;

const catMeta = window.SITE_CAT || {};

/* ---------- 作品分类（首页卡片墙的「作品分类」卡 + 页脚分类条） ---------- */
/* 分类卡渲染进隐藏的内容源，由 js/showcase.js 取用生成墙面卡片 */
const catList = document.querySelector('[data-cat-list]');
if (catList) {
    Object.keys(catMeta).forEach((key) => {
        const c = catMeta[key];
        const n = works.filter((w) => w.cat === key).length;
        const li = document.createElement('li');
        li.className = 'cat-card';
        li.innerHTML =
            '<a href="category/' + c.slug + '.html">' +
            '<span class="cat-card-no">' + c.no + '</span>' +
            '<span class="cat-card-title">' + c.title + '</span>' +
            '<span class="cat-card-en">' + c.en + '</span>' +
            '<span class="cat-card-desc">' + c.desc + '</span>' +
            '<span class="cat-card-count">' + n + ' 个项目</span>' +
            '</a>';
        catList.appendChild(li);
    });
}

/* 页脚分类条：分类名常驻可见，不参与轮换 */
const footCats = document.getElementById('footCats');
if (footCats) {
    Object.keys(catMeta).forEach((key) => {
        const c = catMeta[key];
        const n = works.filter((w) => w.cat === key).length;
        const a = document.createElement('a');
        a.href = 'category/' + c.slug + '.html';
        a.innerHTML =
            '<span class="foot-cat-no">' + c.no + '</span>' +
            '<span class="foot-cat-name">' + c.label + '</span>' +
            '<span class="foot-cat-count">' + n + '</span>';
        footCats.appendChild(a);
    });
}

/* ---------- 图片占位：加载失败时显示占位块（放入真实图片后自动生效） ---------- */
function bindPlaceholders(scope) {
    (scope || document).querySelectorAll('img[data-ph]').forEach((img) => {
        if (img.dataset.phBound === '1') return;
        img.dataset.phBound = '1';
        img.addEventListener('error', function () {
            const ph = document.createElement('div');
            ph.className = 'ph';
            ph.textContent = img.getAttribute('data-label') || '图片位置';
            if (img.parentNode) img.parentNode.replaceChild(ph, img);
        });
        if (img.complete && img.naturalWidth === 0) {
            img.dispatchEvent(new Event('error'));
        }
    });
}
window.bindPlaceholders = bindPlaceholders;
document.addEventListener('DOMContentLoaded', function () { bindPlaceholders(); });

/* ---------- 年份 ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
