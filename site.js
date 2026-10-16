'use strict';

// ヘッダー：スクロールしたら、すりガラスにする
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

// 出現のアニメーション
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = document.querySelectorAll('.rv');
if (reduce || !('IntersectionObserver' in window)) {
  items.forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(el => io.observe(el));
}

// 対応AIの流れる帯：切れ目なく見せるため、同じ並びをもう1回つなぐ
const track = document.querySelector('.marquee-track');
if (track) track.append(...[...track.children].map(li => li.cloneNode(true)));

// ヒーローの図：⚡を押すと、AIの入力欄に文章が入っていく（1回だけ）
const composer = document.getElementById('composer');
const text = document.getElementById('composerText');
if (composer && text) {
  // 文面は、ページの data-parts（JSON）から。言語ごとのページで違う
  let parts = [];
  try { parts = JSON.parse(text.dataset.parts || '[]'); } catch { parts = []; }
  const caret = Object.assign(document.createElement('span'), { className: 'caret' });
  const run = async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(1400);
    text.replaceChildren(caret);
    composer.classList.add('on');
    for (const [s, isTok] of parts) {
      const node = document.createElement('span');
      if (isTok) node.className = 'tok';
      text.insertBefore(node, caret);
      for (const ch of s) { node.textContent += ch; await wait(isTok ? 70 : 34); }
    }
  };
  if (!parts.length) {
    // 文面がなければ、何もしない
  } else if (reduce) {
    text.replaceChildren(...parts.map(([s, t]) => Object.assign(document.createElement('span'), { className: t ? 'tok' : '', textContent: s })));
    composer.classList.add('on');
  } else {
    run();
  }
}

// 言語のメニュー：外を押したら閉じる
document.addEventListener('click', e => {
  document.querySelectorAll('details.lang-menu[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
});

// コマンドの一覧：タブの切り替え（矢印キーでも動く）
document.querySelectorAll('[data-catalog]').forEach(root => {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.toggleAttribute('data-hide', !on);
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });
});

// 使い方動画：押したときに、YouTube（プライバシー強化モード）の再生画面に差し替える
document.querySelectorAll('.video-play[data-yt]').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrap = document.createElement('div');
    wrap.className = 'video-frame';
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0&modestbranding=1`;
    f.title = btn.getAttribute('aria-label') || 'YouTube';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    wrap.append(f);
    btn.replaceWith(wrap);
  });
});
