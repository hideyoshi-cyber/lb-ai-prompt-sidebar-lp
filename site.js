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
  const parts = [
    ['【役割】', true], ['経験豊富なシニアITプロダクトマネージャー ', false],
    ['【目的】', true], ['15秒の商品紹介映像の台本 ', false],
    ['【背景】', true], ['やわらかい自然光で、落ち着いた雰囲気', false],
  ];
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
  if (reduce) {
    text.replaceChildren(...parts.map(([s, t]) => Object.assign(document.createElement('span'), { className: t ? 'tok' : '', textContent: s })));
    composer.classList.add('on');
  } else {
    run();
  }
}
