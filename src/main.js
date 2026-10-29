import { mountOpening } from './opening';
import './style.css';
import './refinements.css';
import { mountMenuPhotos } from './menu-photos';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const forcedReduce = new URLSearchParams(location.search).get('motion') === 'reduce';
if (forcedReduce) document.documentElement.dataset.motion = 'reduce';
const motionLink = document.querySelector('.motion-preference');
if (forcedReduce) { motionLink.href = '/#home'; motionLink.textContent = '通常の表示に戻す ↗'; }
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.header');
const dock = document.querySelector('.mobile-dock');
const toggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
let menuOpen = false;

function setMenu(open, returnFocus = false) {
  menuOpen = open;
  document.body.classList.toggle('menu-open', open);
  mobileNav.classList.toggle('is-open', open);
  mobileNav.inert = !open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  main.inert = open;
  footer.inert = open;
  dock.inert = open;
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => setMenu(!menuOpen));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.querySelector('.brand').addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (!menuOpen) return;
  if (event.key === 'Escape') { setMenu(false, true); return; }
  if (event.key === 'Tab') {
    const focusable = [toggle, ...mobileNav.querySelectorAll('a')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

let scrollQueued = false;
function updateNavigation() {
  header.classList.toggle('is-scrolled', window.scrollY > 100);
  dock.classList.toggle('is-visible', window.scrollY > window.innerHeight * .75 && footer.getBoundingClientRect().top > window.innerHeight * .6);
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateNavigation); }
}, { passive: true });
updateNavigation();

// Native document scrolling: the scenes are CSS-sticky and never capture wheel or touch events.
const motion = gsap.matchMedia();
motion.add({ mobile: '(max-width: 760px)', desktop: '(min-width: 761px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
  const { mobile, reduce } = context.conditions;
  if (reduce || forcedReduce) return;
  const hero = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: .65, invalidateOnRefresh: true } });
  hero.to('.hero-copy, .hero-small, .hero-topline, .hero-bottom', { opacity: 0, y: -45, duration: .28 }, 0)
    .to('.hero-window', { left: '0%', top: '0%', width: '100%', height: '100%', borderRadius: '0%', borderWidth: 0, duration: .85 }, .05)
    .to('.hero-image', { scale: 1.005, filter: 'brightness(.68)', duration: .8 }, .1)
    .to('.hero-garden', { opacity: 1, duration: .45 }, .4)
    .to('.window-mullions, .window-caption', { opacity: 0, duration: .3 }, .1)
    .to('.sun-stamp', { rotation: 100, x: mobile ? 120 : 180, opacity: 0, duration: .5 }, .03)
    .to('.hero-arrival', { opacity: 1, y: -12, duration: .25 }, .68);

  const foodTimeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.food-journey', start: 'top top', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true,
    onUpdate(self) { document.querySelector('.food-count').innerHTML = `${self.progress > .64 ? '02' : '01'} <i>/ 02</i>`; }
  }});
  foodTimeline.to('.food-grid-title, .food-stage-label', { opacity: 0, y: -50, duration: .14 }, .02)
    .to('.food-side-left', { xPercent: -100, yPercent: 35, rotation: -14, opacity: 0, duration: .35 }, .02)
    .to('.food-side-right', { xPercent: 100, yPercent: -20, rotation: 14, opacity: 0, duration: .35 }, .02)
    .to('.food-main', { left: '0%', top: '0%', width: '100%', height: '100%', borderRadius: 0, duration: .4 }, .02)
    .to('.food-stage-bottom', { color: '#f4f1e8', duration: .15 }, .22)
    .to('.food-shade', { opacity: 1, duration: .2 }, .25)
    .fromTo('.caption-first', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: .15 }, .3)
    .to('.caption-first', { opacity: 0, y: -25, duration: .12 }, .55)
    .to('.food-second', { clipPath: 'inset(0% 0 0 0)', duration: .22 }, .56)
    .fromTo('.caption-second', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: .15 }, .65)
    .to('.food-progress i', { scaleX: 1, duration: 1 }, 0);

  gsap.utils.toArray('.reveal').forEach(element => {
    gsap.from(element, { y: mobile ? 24 : 45, opacity: 0, duration: 1.1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
  });
});

function wireTabs(tablist, onSelect) {
  const tabs = [...tablist.querySelectorAll('[role=tab]')];
  function select(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    onSelect(tabs[index], index);
    if (focus) tabs[index].focus();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(next, true); }
    });
  });
}
wireTabs(document.querySelector('.menu-tabs'), tab => {
  document.querySelectorAll('.menu-panel').forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
});

mountMenuPhotos(() => ScrollTrigger.refresh());

const seats = [
  { image: 'window', alt: '庭を正面に眺められる青い窓枠のカウンター席', label: 'THE WINDOW COUNTER', title: 'なにもしない、も。<br>いい時間。', description: '目の前には、季節を映す庭。ひとりでゆっくりごはんを食べたり、コーヒーを片手に外を眺めたり。大きな窓のカウンターは、この店らしさをいちばん近くに感じる席です。', note: 'おひとりでも、おふたりでも。' },
  { image: 'lounge', alt: '庭に面した窓とソファがある、母屋のくつろげるお部屋', label: 'THE MAIN HOUSE', title: '懐かしくて、<br>ほどけていく。', description: '歯科医院から続く母屋には、田舎の家に帰ってきたような和室があります。家族や友人との食事、お集まりに。個室や犬同伴での利用は、ご希望を添えてお電話でご相談ください。', note: '写真は母屋のお部屋。和室・個室のご希望は事前にご相談を。' },
  { image: 'engawa', alt: '木の床とガラス戸の向こうに日本庭園が広がる懐かしい縁側', label: 'THE GARDEN VERANDA', title: '庭の季節を、<br>いちばん近くに。', description: '木のぬくもりが残る縁側の向こうには、緑豊かな庭。古い建物の表情を残しているのも、この場所の魅力です。食事の合間に、ふと目を上げる。その時間まで、ごちそうになります。', note: '母屋のお席や利用できる場所は、店舗へご確認ください。' }
];
let imageTimer;
wireTabs(document.querySelector('.seat-tabs'), (tab, index) => {
  const seat = seats[index];
  const image = document.querySelector('#seat-image');
  const number = String(index + 1).padStart(2, '0');
  document.querySelector('#seat-panel').setAttribute('aria-labelledby', tab.id);
  document.querySelector('.seat-no').textContent = number;
  document.querySelector('#seat-title').innerHTML = seat.title;
  document.querySelector('#seat-description').textContent = seat.description;
  document.querySelector('#seat-note').textContent = seat.note;
  document.querySelector('.seat-photo-label').textContent = `${number} — ${seat.label}`;
  clearTimeout(imageTimer);
  image.style.opacity = '.3';
  imageTimer = setTimeout(() => { image.src = `/images/${seat.image}.webp`; image.alt = seat.alt; image.style.opacity = '1'; }, (reducedMotion.matches || forcedReduce) ? 0 : 160);
});

const copyButton = document.querySelector('.copy-address');
copyButton.addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText('広島県東広島市豊栄町乃美2956');
    status.textContent = '住所をコピーしました。';
    copyButton.innerHTML = 'COPIED <span>✓</span>';
  } catch {
    status.textContent = '住所を長押し・選択してコピーしてください。';
  }
});

// FAQ changes affect the position of the footer and any navigation visibility threshold.
document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', () => { ScrollTrigger.refresh(); updateNavigation(); }));
window.addEventListener('load', () => { ScrollTrigger.refresh(); updateNavigation(); });
document.fonts.ready.then(() => {
  ScrollTrigger.refresh();
  // A direct #section visit should land on that section after fonts and scene geometry settle.
  if (location.hash) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant', block: 'start' }));
  }
});

// An isolated welcome layer; the existing Hero and section animations stay unchanged.
mountOpening();
