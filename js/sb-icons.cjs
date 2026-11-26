/* ============================================================
   侧栏图标（构建期使用，不进浏览器）
   18×18 网格 · 1.2 描边 · currentColor · 无填充
   几何对齐到 .5 像素，保证 18px 下描边清晰
   ============================================================ */
const SW = 'fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"';
const ico = (body) => `<svg viewBox="0 0 18 18" ${SW} aria-hidden="true" focusable="false">${body}</svg>`;

module.exports = {
  home: ico('<path d="M2.6 8.2 9 2.8l6.4 5.4"/><path d="M4.4 7.6v7.8h9.2V7.6"/><path d="M7.4 15.4v-4.2h3.2v4.2"/>'),
  '城市更新与建筑': ico('<rect x="2.5" y="9" width="3.6" height="6.4"/><rect x="6.6" y="4.4" width="4.6" height="11"/><rect x="11.7" y="11" width="3.8" height="4.4"/>'),
  '商业展示与美陈': ico('<circle cx="9" cy="6.4" r="2.5"/><path d="M4.4 12.2h9.2"/><path d="M5.6 12.2v3.2h6.8v-3.2"/>'),
  '品牌与视觉': ico('<rect x="3.1" y="3.1" width="4.7" height="4.7"/><rect x="10.2" y="3.1" width="4.7" height="4.7"/><rect x="3.1" y="10.2" width="4.7" height="4.7"/><rect x="10.2" y="10.2" width="4.7" height="4.7"/>'),
  '研究与工作坊': ico('<circle cx="9" cy="9" r="5.2"/><path d="M9 2.1v2.1M9 13.8v2.1M2.1 9h2.1M13.8 9h2.1"/>'),
  '其他作品': ico('<path d="M2.8 5.6h12.4v3H2.8z"/><path d="M4.2 8.6v6.2h9.6V8.6"/><path d="M7.4 11.6h3.2"/>'),
  about: ico('<circle cx="9" cy="6.4" r="2.7"/><path d="M3.8 15.4c0-3.2 2.4-5 5.2-5s5.2 1.8 5.2 5"/>'),
  contact: ico('<rect x="2.6" y="4.8" width="12.8" height="8.4"/><path d="M2.6 5.7 9 10.4l6.4-4.7"/>'),
  top: ico('<path d="M9 14.6V3.9"/><path d="M4.7 8.2 9 3.9l4.3 4.3"/>'),
  chev: ico('<path d="M11 4.4 6.8 9l4.2 4.6"/>')
};
